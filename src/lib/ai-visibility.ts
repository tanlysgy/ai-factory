import {
	MAX_ROBOTS_BYTES,
	MAX_SITEMAP_BYTES,
	MAX_TEXT_BYTES,
	parseRobotsTxt,
	parseSitemap,
	matchRule,
	extractJsonLd,
	type CheckStatus,
	type CrawlerAccess,
} from './ai-ready-check.ts';
import {
	MAX_HTML_BYTES,
	normalizeUrl,
	parseHtml,
	readCapped,
	REQUEST_TIMEOUT_MS,
} from './seo-analyze.ts';

export const AI_VISIBILITY_USER_AGENT =
	'AIFactoryAiVisibility/0.1 (+experiment; bounded public-signal audit; no crawling)';

export interface VisibilityItem {
	id: string;
	label: string;
	status: CheckStatus;
	points: number;
	maxPoints: number;
	detail: string;
	problem: string;
	why: string;
	suggestion: string;
}

export interface VisibilitySection {
	id: 'crawlability' | 'authority' | 'citation-readiness';
	label: string;
	earned: number;
	max: number;
	items: VisibilityItem[];
}

export interface AiVisibilityReport {
	url: string;
	finalUrl: string;
	brandName: string | null;
	checkedAt: string;
	requests: number;
	score: { total: number; max: 100; label: string };
	sections: VisibilitySection[];
	signals: {
		title: string | null;
		metaDescription: string | null;
		h1Count: number;
		jsonLd: { blocks: number; types: string[] };
		robotsFound: boolean;
		llmsTxtFound: boolean;
		sitemapFound: boolean;
	};
}

export interface AiVisibilityDeps {
	fetchImpl?: typeof fetch;
	now?: () => Date;
}

export type AiVisibilityResult =
	| { ok: true; report: AiVisibilityReport }
	| { ok: false; error: string; code: string };

interface FetchOutcome {
	status: number | null;
	contentType: string;
	body: string;
	finalUrl: string | null;
	error: 'timeout' | 'unreachable' | null;
}

function item(
	id: string,
	label: string,
	passed: boolean,
	maxPoints: number,
	detail: string,
	problem: string,
	why: string,
	suggestion: string,
	status?: CheckStatus,
): VisibilityItem {
	return {
		id,
		label,
		status: status ?? (passed ? 'pass' : 'fail'),
		points: passed ? maxPoints : 0,
		maxPoints,
		detail,
		problem,
		why,
		suggestion,
	};
}

function section(
	id: VisibilitySection['id'],
	label: string,
	items: VisibilityItem[],
): VisibilitySection {
	return {
		id,
		label,
		earned: items.reduce((total, entry) => total + entry.points, 0),
		max: items.reduce((total, entry) => total + entry.maxPoints, 0),
		items,
	};
}

function hasLinkTo(html: string, path: string): boolean {
	const pattern = new RegExp(`<a\\b[^>]*\\bhref\\s*=\\s*["'][^"']*${path}[^"']*["']`, 'i');
	return pattern.test(html);
}

function hasAuthorSignal(html: string, jsonTypes: string[]): boolean {
	return (
		jsonTypes.includes('Person') ||
		/\b(?:rel\s*=\s*["']author|itemprop\s*=\s*["']author|class\s*=\s*["'][^"']*author)/i.test(html)
	);
}

function hasSameAs(html: string): boolean {
	return /["']sameAs["']\s*:\s*\[[\s\S]*?https?:\/\//i.test(html);
}

function hasFaqSchema(html: string, types: string[]): boolean {
	return types.includes('FAQPage') || /["']@type["']\s*:\s*["']FAQPage["']/i.test(html);
}

function hasStructuredContent(html: string): boolean {
	const lists = (html.match(/<(?:ul|ol|table)\b/gi) ?? []).length;
	const paragraphs = (html.match(/<p\b/gi) ?? []).length;
	return lists > 0 || paragraphs >= 2;
}

function hasReferences(html: string): boolean {
	return (
		/<(?:cite|blockquote)\b/i.test(html) ||
		/\b(?:references|sources|further reading|bibliography)\b/i.test(html) ||
		(html.match(/<a\b[^>]*href\s*=\s*["']https?:\/\//gi) ?? []).length >= 2
	);
}

function hasTopicalFocus(html: string, title: string | null, h1: string[]): boolean {
	if (!title || h1.length !== 1) return false;
	const words = `${title} ${h1[0]}`.toLowerCase().match(/[a-z0-9]{4,}/g) ?? [];
	const body = html.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ').toLowerCase();
	return new Set(words).size > 0 && words.some((word) => body.includes(word));
}

function crawlerAccess(robotsText: string, token: string): CrawlerAccess {
	const file = parseRobotsTxt(robotsText);
	const result = matchRule(file, token, '/');
	if (!result.group) return 'unrestricted';
	return result.allowed ? 'allowed' : 'blocked';
}

function buildSections(
	html: string,
	robotsText: string,
	robotsFound: boolean,
	llmsFound: boolean,
	sitemapFound: boolean,
): VisibilitySection[] {
	const page = parseHtml(html, 'https://example.invalid/');
	const jsonLd = extractJsonLd(html);
	const types = jsonLd.types;
	const organization = types.includes('Organization');
	const entity = organization || types.includes('Person');
	const sameAs = hasSameAs(html);
	const about = hasLinkTo(html, 'about');
	const contact = hasLinkTo(html, 'contact');
	const author = hasAuthorSignal(html, types);
	const crawlerChecks = [
		item('robots', 'robots.txt exists', robotsFound, 7, robotsFound ? 'robots.txt was found and parsed.' : 'No readable robots.txt at the site root.', 'Without a published access file, crawler policy is unknown.', 'A clear policy file gives automated systems an explicit site-level signal.', 'Publish a small robots.txt at the site root.', robotsFound ? undefined : 'warn'),
		item('gptbot', 'GPTBot allowed', robotsFound && crawlerAccess(robotsText, 'GPTBot') !== 'blocked', 7, crawlerAccess(robotsText, 'GPTBot') === 'blocked' ? 'GPTBot is disallowed at /.': 'GPTBot is not disallowed at /.', 'A disallow rule can prevent this crawler from reading public pages.', 'GPTBot needs an allowed path to read public content.', 'Review the GPTBot rule and allow the public paths you want discovered.', robotsFound ? undefined : 'warn'),
		item('claudebot', 'ClaudeBot allowed', robotsFound && crawlerAccess(robotsText, 'ClaudeBot') !== 'blocked', 7, crawlerAccess(robotsText, 'ClaudeBot') === 'blocked' ? 'ClaudeBot is disallowed at /.': 'ClaudeBot is not disallowed at /.', 'A disallow rule can prevent this crawler from reading public pages.', 'ClaudeBot needs an allowed path to read public content.', 'Review the ClaudeBot rule and allow the public paths you want discovered.', robotsFound ? undefined : 'warn'),
		item('google-extended', 'Google-Extended allowed', robotsFound && crawlerAccess(robotsText, 'Google-Extended') !== 'blocked', 6, crawlerAccess(robotsText, 'Google-Extended') === 'blocked' ? 'Google-Extended is disallowed at /.': 'Google-Extended is not disallowed at /.', 'This control token communicates whether Google may use content for generative features.', 'The policy should match whether you want Google generative features to use the content.', 'Review the Google-Extended rule for the intended policy.', robotsFound ? undefined : 'warn'),
		item('llms-txt', 'llms.txt exists', llmsFound, 6, llmsFound ? 'A non-empty llms.txt was found.' : 'No readable llms.txt was found.', 'The optional convention can give compatible tools a concise content map.', 'A concise content map can help compatible tools understand the site structure.', 'Consider publishing a concise llms.txt with your key pages.'),
		item('sitemap', 'Sitemap exists', sitemapFound, 7, sitemapFound ? 'A readable XML sitemap was found.' : 'No readable XML sitemap was found.', 'A sitemap gives crawlers another path to discover canonical URLs.', 'Without one, discovery depends more heavily on links and other signals.', 'Publish a sitemap.xml and keep it current.'),
	];

	const authorityChecks = [
		item('organization-jsonld', 'Organization JSON-LD', organization, 6, organization ? 'Organization schema was found.' : 'No Organization schema type was found.', 'An explicit organization entity helps machines connect the site to a real business.', 'Entity markup gives the page a machine-readable owner or author.', 'Add Organization JSON-LD with the canonical name and URL.'),
		item('entity-schema', 'Person or Organization schema', entity, 4, entity ? 'Person or Organization schema was found.' : 'No Person or Organization schema was found.', 'Entity markup gives the page a machine-readable owner or author.', 'An explicit entity type helps systems attribute the page.', 'Add the appropriate Person or Organization schema.'),
		item('same-as', 'sameAs links', sameAs, 5, sameAs ? 'sameAs links to external profiles were found.' : 'No sameAs profile links were found.', 'Cross-site identity links help disambiguate the entity.', 'Verified profile links provide supporting identity context.', 'Add verified profiles in sameAs, such as LinkedIn or Wikidata.'),
		item('about-link', 'About page link', about, 5, about ? 'A link containing “about” was found.' : 'No About link was detected on the homepage.', 'An About page gives systems durable context about the organization.', 'A clear About page can explain who operates the site.', 'Link to a clear About page from the homepage.'),
		item('contact-link', 'Contact page link', contact, 5, contact ? 'A link containing “contact” was found.' : 'No Contact link was detected on the homepage.', 'A contact path is a basic trust and entity signal.', 'A contact path adds basic context about the site operator.', 'Link to a clear Contact page from the homepage.'),
		item('author-signals', 'Author signals', author, 5, author ? 'Person schema or an author marker was found.' : 'No author marker or Person schema was detected.', 'Named authors make informational content easier to attribute.', 'Attribution connects useful content to a person or organization.', 'Add visible author information or Person schema where appropriate.'),
	];

	const citationChecks = [
		item('title', 'Title', Boolean(page.title), 4, page.title ? `Title: ${page.title}` : 'No title element was found.', 'The title is a primary label for the page topic.', 'A precise page label gives systems a first topic signal.', 'Add a specific, descriptive title.'),
		item('meta-description', 'Meta description', Boolean(page.metaDescription), 4, page.metaDescription ? 'A meta description was found.' : 'No meta description was found.', 'A concise summary helps systems classify the page before reading it.', 'A short summary makes the page purpose explicit.', 'Add a clear meta description.'),
		item('h1', 'H1', page.h1.length === 1, 4, page.h1.length ? `${page.h1.length} H1 heading${page.h1.length === 1 ? '' : 's'} found.` : 'No H1 heading was found.', 'One primary heading makes the subject unambiguous.', 'A single primary heading clarifies the page subject.', 'Use one descriptive H1 for the page topic.'),
		item('headings', 'Headings structure', (html.match(/<h[1-6]\b/gi) ?? []).length >= 2, 4, `${(html.match(/<h[1-6]\b/gi) ?? []).length} heading elements found.`, 'Nested headings create a readable outline for machines and people.', 'A clear outline makes important sections easier to identify.', 'Organize the page with descriptive H2 and H3 headings.'),
		item('faq-schema', 'FAQ schema', hasFaqSchema(html, types), 4, hasFaqSchema(html, types) ? 'FAQPage schema was found.' : 'No FAQPage schema was found.', 'FAQ markup can make recurring questions and answers explicit.', 'Explicit question-and-answer markup can expose useful facts.', 'Add valid FAQPage schema only for visible, genuine FAQs.'),
		item('structured-content', 'Structured content', hasStructuredContent(html), 4, hasStructuredContent(html) ? 'Lists, tables, or multiple paragraphs were found.' : 'Little structured body content was detected.', 'Lists, tables, and paragraphs expose facts in a predictable shape.', 'Predictable content blocks are easier to parse consistently.', 'Use concise paragraphs, lists, or tables for important facts.'),
		item('references', 'References and citations', hasReferences(html), 3, hasReferences(html) ? 'Citation-like markup or multiple external references were found.' : 'No citation-like references were detected.', 'References give important claims traceable support.', 'Traceable sources give important claims supporting context.', 'Add relevant sources, references, or citation markup.'),
		item('topical-focus', 'Clear topical focus', hasTopicalFocus(html, page.title, page.h1), 3, hasTopicalFocus(html, page.title, page.h1) ? 'The title and H1 provide a repeated page topic.' : 'The page topic could not be established from title and H1.', 'A focused page is easier to classify than a page with competing subjects.', 'Consistent topic language helps systems classify the page.', 'Align the title, H1, and opening content around one clear topic.'),
	];

	return [
		section('crawlability', 'AI Crawlability', crawlerChecks),
		section('authority', 'Entity Authority', authorityChecks),
		section('citation-readiness', 'Citation Readiness', citationChecks),
	];
}

async function fetchText(target: string, limit: number, doFetch: typeof fetch, accept: string): Promise<FetchOutcome> {
	try {
		const response = await doFetch(target, {
			redirect: 'follow',
			signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
			headers: { 'user-agent': AI_VISIBILITY_USER_AGENT, accept },
		});
		return {
			status: response.status,
			contentType: response.headers.get('content-type') ?? '',
			body: await readCapped(response, limit),
			finalUrl: response.url || target,
			error: null,
		};
	} catch (error) {
		const message = error instanceof Error ? `${error.name} ${error.message}` : String(error);
		return { status: null, contentType: '', body: '', finalUrl: null, error: /abort|timeout/i.test(message) ? 'timeout' : 'unreachable' };
	}
}

export function scoreLabel(total: number): string {
	if (total >= 85) return 'Strong foundation';
	if (total >= 70) return 'Getting there';
	if (total >= 50) return 'Needs attention';
	return 'Early signal';
}

export function buildVisibilitySections(
	html: string,
	robotsText: string,
	robotsFound: boolean,
	llmsFound: boolean,
	sitemapFound: boolean,
): VisibilitySection[] {
	return buildSections(html, robotsText, robotsFound, llmsFound, sitemapFound);
}

export async function analyzeAiVisibility(input: string, brandName = '', deps: AiVisibilityDeps = {}): Promise<AiVisibilityResult> {
	const normalized = normalizeUrl(input);
	if (!normalized.ok) return { ok: false, error: normalized.error, code: 'invalid_url' };

	const target = normalized.url;
	const origin = target.origin;
	const doFetch = deps.fetchImpl ?? fetch;
	const now = deps.now ?? (() => new Date());
	let requests = 0;
	const count = <T>(promise: Promise<T>): Promise<T> => { requests += 1; return promise; };

	const [pageOutcome, robotsOutcome, llmsOutcome] = await Promise.all([
		count(fetchText(target.toString(), MAX_HTML_BYTES, doFetch, 'text/html,application/xhtml+xml')),
		count(fetchText(`${origin}/robots.txt`, MAX_ROBOTS_BYTES, doFetch, 'text/plain,*/*')),
		count(fetchText(`${origin}/llms.txt`, MAX_TEXT_BYTES, doFetch, 'text/plain,*/*')),
	]);

	if (pageOutcome.error) {
		return { ok: false, error: pageOutcome.error === 'timeout' ? 'That site took too long to respond (10s limit).' : 'Could not reach that site. Check the URL and try again.', code: pageOutcome.error };
	}
	if (pageOutcome.status !== null && pageOutcome.status >= 400) {
		return { ok: false, error: `That page returned HTTP ${pageOutcome.status}. The audit needs a reachable HTML page.`, code: 'http_error' };
	}
	if (pageOutcome.contentType && !/text\/html|application\/xhtml/i.test(pageOutcome.contentType)) {
		return { ok: false, error: `That URL returned ${pageOutcome.contentType.split(';')[0]} rather than an HTML page.`, code: 'not_html' };
	}

	const html = pageOutcome.body;
	const finalUrl = pageOutcome.finalUrl ?? target.toString();
	const page = parseHtml(html, finalUrl);
	const robotsFound = robotsOutcome.status === 200;
	const llmsFound = llmsOutcome.status === 200 && llmsOutcome.body.trim().length > 0;
	const robots = robotsFound ? parseRobotsTxt(robotsOutcome.body) : { groups: [], sitemaps: [] };
	const sitemapUrl = robots.sitemaps.find((url) => {
		try { return new URL(url, origin).origin === origin; } catch { return false; }
	}) ?? `${origin}/sitemap.xml`;
	const sitemapOutcome = await count(fetchText(sitemapUrl, MAX_SITEMAP_BYTES, doFetch, 'application/xml,text/xml,*/*'));
	const sitemapFound = sitemapOutcome.status === 200 && parseSitemap(sitemapOutcome.body).isXml;
	const sections = buildSections(html, robotsOutcome.body, robotsFound, llmsFound, sitemapFound);
	const total = sections.reduce((sum, entry) => sum + entry.earned, 0);
	const cleanBrand = brandName.trim().slice(0, 120);

	return {
		ok: true,
		report: {
			url: target.toString(),
			finalUrl,
			brandName: cleanBrand || null,
			checkedAt: now().toISOString(),
			requests,
			score: { total, max: 100, label: scoreLabel(total) },
			sections,
			signals: {
				title: page.title,
				metaDescription: page.metaDescription,
				h1Count: page.h1.length,
				jsonLd: extractJsonLd(html),
				robotsFound,
				llmsTxtFound: llmsFound,
				sitemapFound,
			},
		},
	};
}
