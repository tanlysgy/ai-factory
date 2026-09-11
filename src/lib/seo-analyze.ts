/**
 * Minimal SEO analysis for the AI Factory SEO Checker experiment (exp-002).
 *
 * Deliberately dependency-free and regex-based: this is a validation prototype,
 * not crawler infrastructure. Every function here is pure so it can be unit
 * tested with `node --test --experimental-strip-types`.
 */

export type CheckStatus = 'pass' | 'warn' | 'fail';

export interface SeoCheck {
  id: string;
  label: string;
  status: CheckStatus;
  detail: string;
}

export interface PageLink {
  href: string;
  text: string;
  internal: boolean;
}

export interface ParsedPage {
  title: string | null;
  metaDescription: string | null;
  canonical: string | null;
  lang: string | null;
  h1: string[];
  imageCount: number;
  imagesMissingAlt: number;
  hasViewport: boolean;
  openGraphTags: number;
  /** Every anchor counted, before de-duplication or display capping. */
  linkCount: number;
  links: PageLink[];
  linksTruncated: boolean;
}

export interface SeoAnalysis extends ParsedPage {
  url: string;
  finalUrl: string;
  status: number;
  bytes: number;
  techHints: string[];
  checks: SeoCheck[];
  fetchedAt: string;
}

export type UrlResult =
  | { ok: true; url: URL }
  | { ok: false; error: string };

export type AnalyzeResult =
  | { ok: true; analysis: Omit<SeoAnalysis, 'fetchedAt'> & { fetchedAt: string } }
  | { ok: false; error: string; code: string };

/** How many links we keep for display; counts always reflect the full page. */
export const MAX_DISPLAYED_LINKS = 25;

/** Refuse to buffer more than this much HTML from a target page. */
export const MAX_HTML_BYTES = 600_000;

export const REQUEST_TIMEOUT_MS = 10_000;

export const USER_AGENT =
  'AIFactorySeoChecker/0.1 (+experiment; minimal SEO check; no crawling)';

const BLOCKED_HOSTNAMES = new Set([
  'localhost',
  'localhost.localdomain',
  'metadata.google.internal',
]);

const PRIVATE_IPV4 =
  /^(?:0|10|127|169\.254|192\.168|172\.(?:1[6-9]|2\d|3[01]))\./;

/**
 * Turn user input into a safe absolute http(s) URL.
 * Rejects non-http(s) schemes, embedded credentials, and non-public hosts.
 */
export function normalizeUrl(input: string): UrlResult {
  const raw = String(input ?? '').trim();
  if (!raw) return { ok: false, error: 'Enter a URL to analyze.' };
  if (raw.length > 2048) return { ok: false, error: 'That URL is too long.' };

  const candidate = /^[a-z][a-z0-9+.-]*:\/\//i.test(raw) ? raw : `https://${raw}`;

  let url: URL;
  try {
    url = new URL(candidate);
  } catch {
    return { ok: false, error: 'That does not look like a valid URL.' };
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return { ok: false, error: 'Only http and https URLs can be checked.' };
  }
  if (url.username || url.password) {
    return { ok: false, error: 'URLs containing credentials are not supported.' };
  }

  const host = url.hostname.toLowerCase().replace(/^\[|\]$/g, '');
  if (!host.includes('.') || host.endsWith('.')) {
    return { ok: false, error: 'Enter a full domain, for example example.com.' };
  }
  if (BLOCKED_HOSTNAMES.has(host) || host.endsWith('.localhost') || host.endsWith('.internal')) {
    return { ok: false, error: 'Local and internal addresses cannot be checked.' };
  }
  if (PRIVATE_IPV4.test(host) || host === '::1' || host.startsWith('fc') || host.startsWith('fd') || host.startsWith('fe80')) {
    return { ok: false, error: 'Local and internal addresses cannot be checked.' };
  }

  url.hash = '';
  return { ok: true, url };
}

function decodeEntities(value: string): string {
  return value
    .replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (match, entity: string) => {
      const named: Record<string, string> = {
        amp: '&',
        lt: '<',
        gt: '>',
        quot: '"',
        apos: "'",
        nbsp: ' ',
      };
      const key = entity.toLowerCase();
      if (key in named) return named[key]!;
      if (key.startsWith('#x')) {
        const code = Number.parseInt(key.slice(2), 16);
        return Number.isFinite(code) ? String.fromCodePoint(code) : match;
      }
      if (key.startsWith('#')) {
        const code = Number.parseInt(key.slice(1), 10);
        return Number.isFinite(code) ? String.fromCodePoint(code) : match;
      }
      return match;
    })
    .replace(/\s+/g, ' ')
    .trim();
}

function stripTags(html: string): string {
  return decodeEntities(html.replace(/<[^>]*>/g, ' '));
}

function attr(tag: string, name: string): string | null {
  const re = new RegExp(`${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s"'>]+))`, 'i');
  const match = tag.match(re);
  if (!match) return null;
  return decodeEntities(match[1] ?? match[2] ?? match[3] ?? '');
}

/**
 * Extract the SEO signals we display. Regex-based on purpose — a real parser
 * would be the first thing to add if this experiment graduates.
 */
export function parseHtml(html: string, baseUrl: string): ParsedPage {
  let base = baseUrl;
  const baseTag = html.match(/<base\b[^>]*>/i);
  if (baseTag) {
    const href = attr(baseTag[0], 'href');
    if (href) {
      try {
        base = new URL(href, baseUrl).toString();
      } catch {
        /* keep the original base */
      }
    }
  }

  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const title = titleMatch ? stripTags(titleMatch[1]!) : null;

  let metaDescription: string | null = null;
  let canonical: string | null = null;
  let hasViewport = false;
  let openGraphTags = 0;
  for (const tag of html.match(/<meta\b[^>]*>/gi) ?? []) {
    const name = (attr(tag, 'name') ?? '').toLowerCase();
    const property = (attr(tag, 'property') ?? '').toLowerCase();
    const content = attr(tag, 'content');
    if (name === 'description' && metaDescription === null) metaDescription = content ?? '';
    if (name === 'viewport') hasViewport = true;
    if (property.startsWith('og:')) openGraphTags += 1;
  }
  const canonicalTag = html.match(/<link\b[^>]*\brel\s*=\s*["']?canonical["']?[^>]*>/i);
  if (canonicalTag) canonical = attr(canonicalTag[0], 'href');

  const htmlTag = html.match(/<html\b[^>]*>/i);
  const lang = htmlTag ? attr(htmlTag[0], 'lang') : null;

  const h1: string[] = [];
  for (const match of html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)) {
    const text = stripTags(match[1]!);
    if (text) h1.push(text);
  }

  let imageCount = 0;
  let imagesMissingAlt = 0;
  for (const tag of html.match(/<img\b[^>]*>/gi) ?? []) {
    imageCount += 1;
    const alt = attr(tag, 'alt');
    if (alt === null || alt.trim() === '') imagesMissingAlt += 1;
  }

  const baseHost = safeHost(base);
  const links: PageLink[] = [];
  const seenHrefs = new Set<string>();
  let seen = 0;
  for (const match of html.matchAll(/<a\b[^>]*>([\s\S]*?)<\/a>/gi)) {
    const tag = match[0];
    const href = attr(tag, 'href');
    if (!href) continue;
    if (/^(?:#|mailto:|tel:|javascript:|data:)/i.test(href)) continue;
    let resolved: URL;
    try {
      resolved = new URL(href, base);
    } catch {
      continue;
    }
    if (resolved.protocol !== 'http:' && resolved.protocol !== 'https:') continue;
    seen += 1;
    const resolvedHref = resolved.toString();
    // The same destination usually appears several times (header, footer,
    // mobile nav); showing it once keeps the report readable.
    if (seenHrefs.has(resolvedHref)) continue;
    seenHrefs.add(resolvedHref);
    if (links.length < MAX_DISPLAYED_LINKS) {
      links.push({
        href: resolvedHref,
        text: stripTags(match[1]!).slice(0, 120),
        internal: resolved.hostname === baseHost,
      });
    }
  }

  return {
    title,
    metaDescription,
    canonical,
    lang,
    h1,
    imageCount,
    imagesMissingAlt,
    hasViewport,
    openGraphTags,
    linkCount: seen,
    links,
    linksTruncated: seenHrefs.size > links.length,
  };
}

function safeHost(value: string): string {
  try {
    return new URL(value).hostname;
  } catch {
    return '';
  }
}

/**
 * Signatures are matched against asset references, not prose. Matching the whole
 * document produces false positives from body copy — marketing pages routinely
 * link to other vendors (astro.build links to webflow.com) and label partner
 * logos with aria-label, which is not evidence of a technology.
 */
const TECH_SIGNATURES: Array<[string, RegExp]> = [
  ['Next.js', /\/_next\/|__NEXT_DATA__/i],
  ['Nuxt', /\/_nuxt\/|__NUXT__/i],
  ['Astro', /astro-island|data-astro-cid|\/_astro\//i],
  ['Svelte', /__svelte|svelte-[a-z0-9]{6}\.|\/\.svelte-kit\//i],
  ['Vue', /__VUE__|data-v-app|\/vue(?:@[\d.]+)?\//i],
  ['React', /react(?:-dom)?[.-][\w.]+\.js|data-reactroot/i],
  ['Angular', /ng-version|ng-app=/i],
  ['WordPress', /\/wp-(?:content|includes)\//i],
  ['Shopify', /cdn\.shopify\.com|shopifycdn/i],
  ['Webflow', /\/webflow\.(?:js|css)|webflow\.io/i],
  ['Squarespace', /static\.squarespace\.com|squarespace\.com\/universal\//i],
  ['Wix', /static\.wixstatic\.com|parastorage\.com/i],
  ['Ghost', /\/ghost\/(?:api|assets)\//i],
  ['Tailwind CSS', /(?:^|["'\s])(?:sm|md|lg|xl|2xl):[a-z-]+/],
  ['Bootstrap', /bootstrap(?:\.min)?\.(?:css|js)/i],
  ['htmx', /hx-(?:get|post|put|swap)\s*=|htmx(?:\.min)?\.js/i],
  ['Alpine.js', /alpinejs|@alpinejs\//i],
  ['jQuery', /jquery(?:[.-][\w.]+)?\.js/i],
  ['Google Analytics', /googletagmanager|google-analytics|gtag\(/i],
  ['Cloudflare', /cdnjs\.cloudflare\.com/i],
];

/**
 * The corpus of "technical" markup: asset tags, inline scripts, comments and
 * class attributes (class names are how a CSS framework reveals itself).
 */
export function techCorpus(html: string): string {
  const parts: string[] = [];
  for (const tag of html.match(/<(?:script|link|meta)\b[^>]*>/gi) ?? []) parts.push(tag);
  for (const match of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)) parts.push(match[1]!);
  for (const match of html.matchAll(/<!--([\s\S]*?)-->/g)) parts.push(match[1]!);
  for (const match of html.matchAll(/\bclass\s*=\s*(?:"([^"]*)"|'([^']*)')/gi)) {
    parts.push(match[1] ?? match[2] ?? '');
  }
  return parts.join('\n');
}

export function detectTechHints(html: string): string[] {
  const corpus = techCorpus(html);
  return TECH_SIGNATURES.filter(([, pattern]) => pattern.test(corpus)).map(([name]) => name);
}

export function buildChecks(page: ParsedPage): SeoCheck[] {
  const checks: SeoCheck[] = [];
  const titleLength = page.title?.length ?? 0;

  if (!page.title) {
    checks.push({ id: 'title', label: 'Page title', status: 'fail', detail: 'No <title> tag found.' });
  } else if (titleLength < 10) {
    checks.push({ id: 'title', label: 'Page title', status: 'warn', detail: `Only ${titleLength} characters — very short.` });
  } else if (titleLength > 65) {
    checks.push({ id: 'title', label: 'Page title', status: 'warn', detail: `${titleLength} characters — may be truncated in search results.` });
  } else {
    checks.push({ id: 'title', label: 'Page title', status: 'pass', detail: `${titleLength} characters.` });
  }

  const descriptionLength = page.metaDescription?.length ?? 0;
  if (page.metaDescription === null) {
    checks.push({ id: 'description', label: 'Meta description', status: 'fail', detail: 'No meta description found.' });
  } else if (descriptionLength < 50) {
    checks.push({ id: 'description', label: 'Meta description', status: 'warn', detail: `${descriptionLength} characters — shorter than the usual 50–160.` });
  } else if (descriptionLength > 160) {
    checks.push({ id: 'description', label: 'Meta description', status: 'warn', detail: `${descriptionLength} characters — usually truncated past 160.` });
  } else {
    checks.push({ id: 'description', label: 'Meta description', status: 'pass', detail: `${descriptionLength} characters.` });
  }

  if (page.h1.length === 1) {
    checks.push({ id: 'h1', label: 'H1 heading', status: 'pass', detail: 'Exactly one H1.' });
  } else if (page.h1.length === 0) {
    checks.push({ id: 'h1', label: 'H1 heading', status: 'fail', detail: 'No H1 heading found.' });
  } else {
    checks.push({ id: 'h1', label: 'H1 heading', status: 'warn', detail: `${page.h1.length} H1 headings — usually one is intended.` });
  }

  checks.push(
    page.lang
      ? { id: 'lang', label: 'Language attribute', status: 'pass', detail: `html lang="${page.lang}".` }
      : { id: 'lang', label: 'Language attribute', status: 'warn', detail: 'No lang attribute on <html>.' },
  );

  checks.push(
    page.hasViewport
      ? { id: 'viewport', label: 'Mobile viewport', status: 'pass', detail: 'Viewport meta tag present.' }
      : { id: 'viewport', label: 'Mobile viewport', status: 'fail', detail: 'No viewport meta tag — the page may not render correctly on mobile.' },
  );

  if (page.imageCount === 0) {
    checks.push({ id: 'alt', label: 'Image alt text', status: 'pass', detail: 'No images on the page.' });
  } else if (page.imagesMissingAlt === 0) {
    checks.push({ id: 'alt', label: 'Image alt text', status: 'pass', detail: `All ${page.imageCount} images have alt text.` });
  } else {
    checks.push({
      id: 'alt',
      label: 'Image alt text',
      status: page.imagesMissingAlt === page.imageCount ? 'fail' : 'warn',
      detail: `${page.imagesMissingAlt} of ${page.imageCount} images are missing alt text.`,
    });
  }

  return checks;
}

/** Read a response body but stop after `limit` bytes. */
export async function readCapped(response: Response, limit = MAX_HTML_BYTES): Promise<string> {
  const body = response.body;
  if (!body) return '';
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let text = '';
  let total = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!value) continue;
      total += value.byteLength;
      text += decoder.decode(value, { stream: true });
      if (total >= limit) break;
    }
  } finally {
    await reader.cancel().catch(() => undefined);
  }
  text += decoder.decode();
  return text;
}

export interface AnalyzeDeps {
  fetchImpl?: typeof fetch;
  now?: () => Date;
}

/**
 * Fetch one page and produce the analysis shown to the user.
 * Single request, no crawling, no recursion.
 */
export async function analyzeUrl(
  input: string,
  deps: AnalyzeDeps = {},
): Promise<AnalyzeResult> {
  const normalized = normalizeUrl(input);
  if (!normalized.ok) return { ok: false, error: normalized.error, code: 'invalid_url' };
  const target = normalized.url;

  const doFetch = deps.fetchImpl ?? fetch;
  const now = deps.now ?? (() => new Date());

  let response: Response;
  try {
    response = await doFetch(target.toString(), {
      redirect: 'follow',
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      headers: { 'user-agent': USER_AGENT, accept: 'text/html,application/xhtml+xml' },
    });
  } catch (error) {
    const timedOut = error instanceof Error && /abort|timeout/i.test(error.name + error.message);
    return {
      ok: false,
      error: timedOut
        ? 'That site took too long to respond (10s limit).'
        : 'Could not reach that site. Check the URL and try again.',
      code: timedOut ? 'timeout' : 'unreachable',
    };
  }

  const contentType = response.headers.get('content-type') ?? '';
  if (contentType && !/text\/html|application\/xhtml/i.test(contentType)) {
    return {
      ok: false,
      error: `That URL returned ${contentType.split(';')[0]} rather than an HTML page.`,
      code: 'not_html',
    };
  }

  const html = await readCapped(response);
  const finalUrl = response.url || target.toString();
  const parsed = parseHtml(html, finalUrl);

  return {
    ok: true,
    analysis: {
      ...parsed,
      url: target.toString(),
      finalUrl,
      status: response.status,
      bytes: new TextEncoder().encode(html).byteLength,
      techHints: detectTechHints(html),
      checks: buildChecks(parsed),
      fetchedAt: now().toISOString(),
    },
  };
}
