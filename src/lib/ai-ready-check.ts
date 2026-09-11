/**
 * AI Ready Check (experiment 003).
 *
 * Answers one question with bounded, request-time inspection:
 * "Is this page reachable, readable and describable by AI crawlers?"
 *
 * Design rules, in priority order (security > correctness > usefulness):
 *  - Reuse the hardened URL validation from exp-002 (`normalizeUrl`).
 *  - Every fetch: 10s timeout, byte cap, no recursion, no storage.
 *  - Scoring is an explicit, readable checklist below. No LLM, no heuristics.
 *  - Never claim that a crawler will or will not index/cite a site. Only report
 *    what the public rules and markup say.
 */

import {
  MAX_HTML_BYTES,
  normalizeUrl,
  parseHtml,
  readCapped,
  REQUEST_TIMEOUT_MS,
  type CheckStatus,
} from './seo-analyze.ts';

export const AI_READY_USER_AGENT =
  'AIFactoryAiReadyCheck/0.1 (+experiment; single-page readiness signals; no crawling)';

/** Byte caps per resource type. Keeps a single check cheap and bounded. */
export const MAX_ROBOTS_BYTES = 200_000;
export const MAX_SITEMAP_BYTES = 300_000;
export const MAX_TEXT_BYTES = 100_000;

/** At most this many <loc> entries are counted from a sitemap (bounded work). */
export const MAX_SITEMAP_URLS = 50;

/** At most this many URLs are shown in the UI. */
export const MAX_SAMPLE_URLS = 10;

export type CrawlerAccess = 'allowed' | 'blocked' | 'unrestricted';

export interface AiCrawler {
  /** Human-facing label. */
  name: string;
  /** The literal token matched against robots.txt user-agent lines. */
  token: string;
  /**
   * Some tokens are *usage controls*, not crawlers: they do not fetch pages
   * themselves. Reporting them as "crawlers" would be a factual error.
   */
  kind: 'crawler' | 'control';
}

/**
 * Well-known AI-related robots.txt tokens. The list is intentionally short and
 * factual; it is not a claim about what any platform does with a page.
 */
export const AI_CRAWLERS: AiCrawler[] = [
  { name: 'GPTBot', token: 'GPTBot', kind: 'crawler' },
  { name: 'ChatGPT-User', token: 'ChatGPT-User', kind: 'crawler' },
  { name: 'Google-Extended', token: 'Google-Extended', kind: 'control' },
  { name: 'ClaudeBot', token: 'ClaudeBot', kind: 'crawler' },
  { name: 'anthropic-ai', token: 'anthropic-ai', kind: 'crawler' },
  { name: 'PerplexityBot', token: 'PerplexityBot', kind: 'crawler' },
  { name: 'Bytespider', token: 'Bytespider', kind: 'crawler' },
];

/* ------------------------------------------------------------------ *
 * robots.txt
 * ------------------------------------------------------------------ */

export interface RobotsRule {
  type: 'allow' | 'disallow';
  path: string;
}

export interface RobotsGroup {
  agents: string[];
  rules: RobotsRule[];
}

export interface RobotsFile {
  groups: RobotsGroup[];
  sitemaps: string[];
}

/**
 * Parse the subset of the robots.txt format that matters here: user-agent
 * groups, allow/disallow rules, and sitemap directives. Unknown directives are
 * ignored on purpose.
 */
export function parseRobotsTxt(text: string): RobotsFile {
  const groups: RobotsGroup[] = [];
  const sitemaps: string[] = [];
  let current: RobotsGroup | null = null;

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.split('#')[0]!.trim();
    if (!line) continue;

    const separator = line.indexOf(':');
    if (separator === -1) continue;
    const field = line.slice(0, separator).trim().toLowerCase();
    const value = line.slice(separator + 1).trim();

    if (field === 'sitemap') {
      // Sitemap is a file-level directive, valid outside any group.
      if (value) sitemaps.push(value);
      continue;
    }

    if (field === 'user-agent') {
      // Consecutive user-agent lines share one group; once rules start, a new
      // user-agent begins a new group.
      if (!current || current.rules.length > 0) {
        current = { agents: [], rules: [] };
        groups.push(current);
      }
      if (value) current.agents.push(value);
      continue;
    }

    if (field === 'allow' || field === 'disallow') {
      if (!current) continue; // rules before any user-agent are ignored
      current.rules.push({ type: field, path: value });
    }
  }

  return { groups, sitemaps };
}

/**
 * Convert a robots.txt path pattern into a regular expression.
 * `*` matches any sequence; a trailing `$` anchors the end; otherwise the
 * pattern matches as a prefix (the standard behaviour).
 */
function patternToRegExp(pattern: string): RegExp {
  let source = '^';
  let anchored = false;
  for (let index = 0; index < pattern.length; index += 1) {
    const char = pattern[index]!;
    if (char === '*') {
      source += '.*';
    } else if (char === '$' && index === pattern.length - 1) {
      anchored = true;
    } else {
      source += char.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
  }
  // A pattern without `$` matches as a prefix; with `$` it must match to the end.
  source += anchored ? '$' : '.*';
  return new RegExp(source);
}

/**
 * Find the group that applies to a crawler: the most specific user-agent match
 * wins, with `*` as the least specific fallback.
 */
export function findGroupFor(file: RobotsFile, agent: string): RobotsGroup | null {
  const needle = agent.toLowerCase();
  let best: RobotsGroup | null = null;
  let bestScore = -1;

  for (const group of file.groups) {
    for (const rawAgent of group.agents) {
      const candidate = rawAgent.toLowerCase();
      const score = candidate === '*' ? 0 : needle.startsWith(candidate) ? candidate.length : -1;
      if (score > bestScore) {
        bestScore = score;
        best = group;
      }
    }
  }

  return bestScore >= 0 ? best : null;
}

/**
 * Decide whether `agent` may fetch `path`. The longest matching rule wins and
 * an allow/disallow tie is resolved in favour of allow — the behaviour described
 * by the robots.txt specification.
 */
export function matchRule(
  file: RobotsFile,
  agent: string,
  path = '/',
): { allowed: boolean; rule: RobotsRule | null; group: RobotsGroup | null } {
  const group = findGroupFor(file, agent);
  if (!group) return { allowed: true, rule: null, group: null };

  let winner: RobotsRule | null = null;
  let winnerLength = -1;

  for (const rule of group.rules) {
    if (rule.path === '') continue; // "Disallow:" with no value means allow all
    if (!patternToRegExp(rule.path).test(path)) continue;
    const length = rule.path.length;
    if (length > winnerLength || (length === winnerLength && rule.type === 'allow')) {
      winner = rule;
      winnerLength = length;
    }
  }

  if (!winner) return { allowed: true, rule: null, group };
  return { allowed: winner.type === 'allow', rule: winner, group };
}

/** True when the wildcard group blocks the whole site (`Disallow: /` under `*`). */
export function hasBroadDisallow(file: RobotsFile): boolean {
  const wildcard = file.groups.find((group) =>
    group.agents.some((agent) => agent.trim() === '*'),
  );
  if (!wildcard) return false;
  return wildcard.rules.some(
    (rule) => rule.type === 'disallow' && rule.path.trim() === '/',
  );
}

export interface CrawlerReport {
  name: string;
  token: string;
  kind: 'crawler' | 'control';
  access: CrawlerAccess;
  rule: string | null;
}

function reportCrawler(file: RobotsFile, crawler: AiCrawler): CrawlerReport {
  const { allowed, rule, group } = matchRule(file, crawler.token, '/');
  const mentioned = Boolean(group);
  const access: CrawlerAccess = !mentioned
    ? 'unrestricted'
    : allowed
      ? 'allowed'
      : 'blocked';

  return {
    name: crawler.name,
    token: crawler.token,
    kind: crawler.kind,
    access,
    rule: rule ? `${rule.type === 'allow' ? 'Allow' : 'Disallow'}: ${rule.path}` : null,
  };
}

/* ------------------------------------------------------------------ *
 * sitemap + llms.txt
 * ------------------------------------------------------------------ */

export interface ParsedSitemap {
  isXml: boolean;
  isIndex: boolean;
  urls: string[];
  truncated: boolean;
}

export function parseSitemap(body: string): ParsedSitemap {
  const trimmed = body.trimStart();
  const isXml = /^<\?xml|^<urlset|^<sitemapindex/i.test(trimmed);
  const isIndex = /<sitemapindex[\s>]/i.test(trimmed);

  const urls: string[] = [];
  let total = 0;
  for (const match of trimmed.matchAll(/<loc>\s*([\s\S]*?)\s*<\/loc>/gi)) {
    const value = match[1]!.trim();
    if (!value) continue;
    total += 1;
    if (urls.length < MAX_SITEMAP_URLS) urls.push(value);
  }

  return { isXml, isIndex, urls, truncated: total > urls.length };
}

export interface ParsedLlmsTxt {
  hasText: boolean;
  title: string | null;
  sections: string[];
  sample: string[];
}

/** llms.txt is a Markdown-ish convention: an H1 title, then H2 sections. */
export function parseLlmsTxt(body: string): ParsedLlmsTxt {
  const lines = body.split(/\r?\n/).map((line) => line.trim());
  const text = lines.filter(Boolean);
  const title = lines.find((line) => line.startsWith('# '))?.slice(2).trim() ?? null;
  const sections = lines
    .filter((line) => line.startsWith('## '))
    .map((line) => line.slice(3).trim())
    .slice(0, 8);
  const sample = lines
    .filter((line) => line.startsWith('- ') || /^\[.+\)/.test(line))
    .slice(0, 6)
    .map((line) => line.slice(0, 140));

  return { hasText: text.length > 0, title, sections, sample };
}

/* ------------------------------------------------------------------ *
 * structured data
 * ------------------------------------------------------------------ */

export interface JsonLdInfo {
  blocks: number;
  invalid: number;
  types: string[];
}

function collectTypes(node: unknown, into: Set<string>, depth = 0): void {
  if (depth > 4) return;
  if (Array.isArray(node)) {
    for (const entry of node) collectTypes(entry, into, depth + 1);
    return;
  }
  if (!node || typeof node !== 'object') return;

  const record = node as Record<string, unknown>;
  const type = record['@type'];
  if (typeof type === 'string') into.add(type);
  else if (Array.isArray(type)) {
    for (const entry of type) if (typeof entry === 'string') into.add(entry);
  }

  if ('@graph' in record) collectTypes(record['@graph'], into, depth + 1);
}

/** Extract JSON-LD blocks and the schema.org `@type` values they declare. */
export function extractJsonLd(html: string): JsonLdInfo {
  const types = new Set<string>();
  let blocks = 0;
  let invalid = 0;

  for (const match of html.matchAll(
    /<script\b[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
  )) {
    blocks += 1;
    const payload = match[1]!.trim();
    if (!payload) {
      invalid += 1;
      continue;
    }
    try {
      collectTypes(JSON.parse(payload), types);
    } catch {
      invalid += 1;
    }
  }

  return { blocks, invalid, types: [...types].sort() };
}

/* ------------------------------------------------------------------ *
 * scoring — explicit, readable, no heuristics
 * ------------------------------------------------------------------ */

export type ReadinessLabel = 'Needs work' | 'Getting there' | 'Good' | 'AI ready';

/** Score bands, highest first so the first match wins. */
export function scoreLabel(total: number): ReadinessLabel {
  if (total >= 85) return 'AI ready';
  if (total >= 70) return 'Good';
  if (total >= 40) return 'Getting there';
  return 'Needs work';
}

export interface ScoreItem {
  id: string;
  label: string;
  status: CheckStatus;
  points: number;
  maxPoints: number;
  /** What was actually observed. */
  detail: string;
  /** Neutral explanation (not a promise about any AI platform). */
  why: string;
  /** Concrete, optional next step. */
  fix?: string;
}

export interface ScoreSection {
  id: string;
  label: string;
  earned: number;
  max: number;
  items: ScoreItem[];
}

export interface ScoreReport {
  total: number;
  max: number;
  label: ReadinessLabel;
  sections: ScoreSection[];
}

export interface ReadinessSignals {
  homepage: {
    title: string | null;
    metaDescription: string | null;
    canonical: string | null;
    h1Count: number;
    openGraphTags: number;
    validHtml: boolean;
  };
  robots: {
    accessible: boolean;
    broadDisallow: boolean;
    blocksAiCrawler: boolean;
    blockedCrawlers: string[];
  };
  sitemap: {
    found: boolean;
    urlCount: number;
  };
  llmsTxt: {
    found: boolean;
  };
  structuredData: {
    blocks: number;
    types: string[];
  };
}

function item(
  id: string,
  label: string,
  passed: boolean,
  maxPoints: number,
  detail: string,
  why: string,
  fix?: string,
  status?: CheckStatus,
): ScoreItem {
  return {
    id,
    label,
    status: status ?? (passed ? 'pass' : 'fail'),
    points: passed ? maxPoints : 0,
    maxPoints,
    detail,
    why,
    fix,
  };
}

function section(id: string, label: string, items: ScoreItem[]): ScoreSection {
  return {
    id,
    label,
    earned: items.reduce((sum, entry) => sum + entry.points, 0),
    max: items.reduce((sum, entry) => sum + entry.maxPoints, 0),
    items,
  };
}

/**
 * The full scoring model. Every point is awarded by exactly one line below, so
 * the total can be audited by reading this function.
 */
export function buildScore(signals: ReadinessSignals): ScoreReport {
  const { homepage, robots, sitemap, llmsTxt, structuredData } = signals;

  const hasEntitySchema =
    structuredData.types.includes('Organization') || structuredData.types.includes('WebSite');

  // Discoverability — 30 points
  const discoverability = section('discoverability', 'Discoverability', [
    item(
      'robots-accessible',
      'robots.txt accessible',
      robots.accessible,
      10,
      robots.accessible ? 'robots.txt was served successfully.' : 'robots.txt could not be read.',
      'A readable robots.txt is the standard way to state your crawling rules.',
      'Publish a robots.txt at the site root.',
    ),
    item(
      'sitemap-found',
      'Sitemap found',
      sitemap.found,
      10,
      sitemap.found ? 'A sitemap was found and parsed.' : 'No sitemap was found.',
      'A sitemap helps crawlers discover URLs that are not well linked.',
      'Publish /sitemap.xml and reference it from robots.txt.',
    ),
    item(
      'canonical',
      'Canonical URL declared',
      Boolean(homepage.canonical),
      5,
      homepage.canonical ? `Canonical: ${homepage.canonical}` : 'No canonical link element.',
      'A canonical URL states which address is the preferred one.',
      'Add <link rel="canonical" href="…"> to the page head.',
    ),
    item(
      'valid-html',
      'Valid HTML document',
      homepage.validHtml,
      5,
      homepage.validHtml
        ? 'The response contained <html> and <head> elements.'
        : 'The response did not contain a recognisable HTML document structure.',
      'Machine reading starts from a well-formed document.',
      'Ensure the server returns a complete HTML document.',
    ),
  ]);

  // AI crawler access — 30 points
  // Note: when robots.txt is absent there are no published rules to evaluate, so
  // these two checks report a warning and award nothing. Crediting a site for
  // "not blocking" crawlers it never mentioned would inflate the score with
  // evidence that does not exist.
  const blocked = robots.blockedCrawlers;
  const crawlerAccess = section('crawler-access', 'AI Crawler Access', [
    item(
      'ai-crawlers-allowed',
      'Major AI crawlers not blocked',
      !robots.blocksAiCrawler && robots.accessible,
      20,
      !robots.accessible
        ? 'No robots.txt was available, so there are no published rules to evaluate.'
        : blocked.length === 0
          ? 'No listed AI crawler is disallowed from the site root.'
          : `Disallowed from the site root: ${blocked.join(', ')}.`,
      'robots.txt states the public access rules these crawlers are expected to follow.',
      'Review the rule before changing it — blocking may be intentional.',
      // A crawler that is actually disallowed is a failure for an AI-readiness
      // goal; only "robots.txt tells us nothing" is a warning.
      !robots.accessible ? 'warn' : blocked.length > 0 ? 'fail' : undefined,
    ),
    item(
      'no-broad-disallow',
      'No site-wide Disallow',
      !robots.broadDisallow && robots.accessible,
      10,
      !robots.accessible
        ? 'No robots.txt was available, so this could not be evaluated.'
        : robots.broadDisallow
          ? 'A wildcard group contains "Disallow: /".'
          : 'No wildcard "Disallow: /" rule was found.',
      'A wildcard Disallow discourages every crawler that follows robots.txt.',
      'Narrow the rule to the paths that should not be crawled.',
      robots.accessible ? undefined : 'warn',
    ),
  ]);

  // Machine-readable content — 25 points
  const machineReadable = section('machine-readable', 'Machine-readable Content', [
    item(
      'title',
      'Page title',
      Boolean(homepage.title),
      5,
      homepage.title ? `Title: ${homepage.title}` : 'No <title> element.',
      'The title is the primary label a machine attaches to the page.',
      'Add a descriptive <title>.',
    ),
    item(
      'meta-description',
      'Meta description',
      Boolean(homepage.metaDescription),
      5,
      homepage.metaDescription
        ? `Description present (${homepage.metaDescription.length} characters).`
        : 'No meta description.',
      'A summary gives machines a concise statement of what the page is.',
      'Add a <meta name="description"> roughly 50–160 characters long.',
    ),
    item(
      'h1',
      'H1 heading',
      homepage.h1Count > 0,
      5,
      homepage.h1Count > 0 ? `${homepage.h1Count} H1 heading(s).` : 'No H1 heading.',
      'A single clear heading states the subject of the page.',
      'Add one descriptive H1.',
    ),
    item(
      'json-ld',
      'Structured data (JSON-LD)',
      structuredData.blocks > 0,
      5,
      structuredData.blocks > 0
        ? `${structuredData.blocks} JSON-LD block(s); types: ${structuredData.types.join(', ') || 'none declared'}.`
        : 'No JSON-LD blocks detected.',
      'Structured data describes entities and relationships in a machine-readable form.',
      'Consider adding appropriate schema.org markup.',
    ),
    item(
      'open-graph',
      'Open Graph tags',
      homepage.openGraphTags > 0,
      5,
      homepage.openGraphTags > 0
        ? `${homepage.openGraphTags} og: tag(s).`
        : 'No Open Graph tags.',
      'Open Graph tags describe the page consistently across services that read them.',
      'Add og:title, og:description and og:url.',
    ),
  ]);

  // AI-oriented signals — 15 points
  const aiSignals = section('ai-signals', 'AI-oriented Signals', [
    item(
      'llms-txt',
      'llms.txt present',
      llmsTxt.found,
      5,
      llmsTxt.found ? 'llms.txt was found and contains text.' : 'No llms.txt was found.',
      'llms.txt is an optional emerging convention, not a universal requirement.',
      'Optional. Only add it if you want to describe your content to LLM tooling.',
    ),
    item(
      'sitemap-urls',
      'Sitemap contains usable URLs',
      sitemap.urlCount > 0,
      5,
      sitemap.urlCount > 0
        ? `${sitemap.urlCount} URL(s) found in the sitemap.`
        : 'The sitemap contained no readable URLs.',
      'A sitemap only helps if it actually lists URLs.',
      'List your canonical URLs in the sitemap.',
    ),
    item(
      'entity-schema',
      'Organization or WebSite schema',
      hasEntitySchema,
      5,
      hasEntitySchema
        ? `Found: ${structuredData.types.filter((t) => t === 'Organization' || t === 'WebSite').join(', ')}.`
        : 'No Organization or WebSite schema type declared.',
      'These types describe the site and its owner as entities.',
      'Add Organization or WebSite schema alongside your existing markup.',
    ),
  ]);

  const sections = [discoverability, crawlerAccess, machineReadable, aiSignals];
  const total = sections.reduce((sum, entry) => sum + entry.earned, 0);
  const max = sections.reduce((sum, entry) => sum + entry.max, 0);

  return { total, max, label: scoreLabel(total), sections };
}

export interface Action {
  title: string;
  detail: string;
  why: string;
  fix?: string;
  severity: 'fail' | 'warn';
  maxPoints: number;
}

/** Prioritised "fix these first" list: highest scoring loss first. */
export function buildActions(score: ScoreReport): Action[] {
  return score.sections
    .flatMap((entry) => entry.items)
    .filter((entry) => entry.status === 'fail' || entry.status === 'warn')
    .map((entry) => ({
      title: entry.label,
      detail: entry.detail,
      why: entry.why,
      fix: entry.fix,
      severity: entry.status === 'warn' ? 'warn' : 'fail',
      maxPoints: entry.maxPoints,
    }))
    .sort((a, b) => b.maxPoints - a.maxPoints || a.title.localeCompare(b.title))
    .slice(0, 5);
}

/* ------------------------------------------------------------------ *
 * orchestration — a bounded number of request-time fetches
 * ------------------------------------------------------------------ */

export interface AiReadyReport {
  url: string;
  finalUrl: string;
  checkedAt: string;
  homepage: {
    status: number;
    bytes: number;
    title: string | null;
    metaDescription: string | null;
    canonical: string | null;
    lang: string | null;
    h1Count: number;
    openGraphTags: number;
    validHtml: boolean;
    jsonLd: JsonLdInfo;
  };
  robots: {
    found: boolean;
    status: number | null;
    bytes: number;
    error: string | null;
    groupCount: number;
    sitemaps: string[];
    broadDisallow: boolean;
    crawlers: CrawlerReport[];
  };
  sitemap: {
    source: 'robots' | 'default';
    url: string;
    found: boolean;
    status: number | null;
    isXml: boolean;
    isIndex: boolean;
    urlCount: number;
    truncated: boolean;
    sample: string[];
    error: string | null;
  };
  llmsTxt: {
    found: boolean;
    status: number | null;
    hasText: boolean;
    title: string | null;
    sections: string[];
    sample: string[];
    error: string | null;
  };
  score: ScoreReport;
  actions: Action[];
  /** Total outbound requests made for this report (bounded, for transparency). */
  requests: number;
}

export interface AiReadyDeps {
  fetchImpl?: typeof fetch;
  now?: () => Date;
}

export type AiReadyResult =
  | { ok: true; report: AiReadyReport }
  | { ok: false; error: string; code: string };

interface FetchOutcome {
  status: number | null;
  contentType: string;
  body: string;
  finalUrl: string | null;
  bytes: number;
  error: 'timeout' | 'unreachable' | null;
}

async function fetchText(
  target: string,
  limit: number,
  doFetch: typeof fetch,
  accept: string,
): Promise<FetchOutcome> {
  try {
    const response = await doFetch(target, {
      redirect: 'follow',
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      headers: { 'user-agent': AI_READY_USER_AGENT, accept },
    });
    const body = await readCapped(response, limit);
    return {
      status: response.status,
      contentType: response.headers.get('content-type') ?? '',
      body,
      finalUrl: response.url || target,
      bytes: new TextEncoder().encode(body).byteLength,
      error: null,
    };
  } catch (error) {
    const timedOut =
      error instanceof Error && /abort|timeout/i.test(`${error.name} ${error.message}`);
    return {
      status: null,
      contentType: '',
      body: '',
      finalUrl: null,
      bytes: 0,
      error: timedOut ? 'timeout' : 'unreachable',
    };
  }
}

/** Pick the first same-origin Sitemap: entry, so robots.txt cannot redirect us elsewhere. */
function pickSameOriginSitemap(sitemaps: string[], origin: string): string | null {
  for (const entry of sitemaps) {
    try {
      const candidate = new URL(entry, origin);
      if (candidate.origin !== origin) continue;
      if (candidate.protocol !== 'http:' && candidate.protocol !== 'https:') continue;
      return candidate.toString();
    } catch {
      continue;
    }
  }
  return null;
}

/**
 * Run the readiness check. Makes at most four outbound requests
 * (page, robots.txt, llms.txt, one sitemap) — never recursive.
 */
export async function checkAiReadiness(
  input: string,
  deps: AiReadyDeps = {},
): Promise<AiReadyResult> {
  const normalized = normalizeUrl(input);
  if (!normalized.ok) return { ok: false, error: normalized.error, code: 'invalid_url' };

  const target = normalized.url;
  const origin = target.origin;
  const doFetch = deps.fetchImpl ?? fetch;
  const now = deps.now ?? (() => new Date());
  let requests = 0;

  const count = <T>(promise: Promise<T>): Promise<T> => {
    requests += 1;
    return promise;
  };

  // The page, robots.txt and llms.txt do not depend on each other.
  const [pageOutcome, robotsOutcome, llmsOutcome] = await Promise.all([
    count(fetchText(target.toString(), MAX_HTML_BYTES, doFetch, 'text/html,application/xhtml+xml')),
    count(fetchText(`${origin}/robots.txt`, MAX_ROBOTS_BYTES, doFetch, 'text/plain,*/*')),
    count(fetchText(`${origin}/llms.txt`, MAX_TEXT_BYTES, doFetch, 'text/plain,*/*')),
  ]);

  if (pageOutcome.error) {
    return {
      ok: false,
      error:
        pageOutcome.error === 'timeout'
          ? 'That site took too long to respond (10s limit).'
          : 'Could not reach that site. Check the URL and try again.',
      code: pageOutcome.error,
    };
  }

  if (pageOutcome.status !== null && pageOutcome.status >= 400) {
    return {
      ok: false,
      error: `That page returned HTTP ${pageOutcome.status}. The check needs a reachable HTML page.`,
      code: 'http_error',
    };
  }

  if (pageOutcome.contentType && !/text\/html|application\/xhtml/i.test(pageOutcome.contentType)) {
    return {
      ok: false,
      error: `That URL returned ${pageOutcome.contentType.split(';')[0]} rather than an HTML page.`,
      code: 'not_html',
    };
  }

  const html = pageOutcome.body;
  const parsed = parseHtml(html, pageOutcome.finalUrl ?? target.toString());
  const validHtml = /<html[\s>]/i.test(html) && /<head[\s>]/i.test(html);
  const jsonLd = extractJsonLd(html);

  // robots.txt
  const robotsFound = robotsOutcome.status === 200;
  const robotsFile = robotsFound ? parseRobotsTxt(robotsOutcome.body) : { groups: [], sitemaps: [] };
  const crawlers = AI_CRAWLERS.map((crawler) => reportCrawler(robotsFile, crawler));
  const blockedCrawlers = crawlers
    .filter((entry) => entry.access === 'blocked')
    .map((entry) => entry.name);
  const broadDisallow = hasBroadDisallow(robotsFile);

  // sitemap — one request only
  const fromRobots = pickSameOriginSitemap(robotsFile.sitemaps, origin);
  const sitemapUrl = fromRobots ?? `${origin}/sitemap.xml`;
  const sitemapOutcome = await count(
    fetchText(sitemapUrl, MAX_SITEMAP_BYTES, doFetch, 'application/xml,text/xml,*/*'),
  );
  const parsedSitemap = parseSitemap(sitemapOutcome.body);
  const sitemapFound = sitemapOutcome.status === 200 && parsedSitemap.isXml;

  // llms.txt
  const parsedLlms = parseLlmsTxt(llmsOutcome.body);
  const llmsFound = llmsOutcome.status === 200 && parsedLlms.hasText;

  const signals: ReadinessSignals = {
    homepage: {
      title: parsed.title,
      metaDescription: parsed.metaDescription,
      canonical: parsed.canonical,
      h1Count: parsed.h1.length,
      openGraphTags: parsed.openGraphTags,
      validHtml,
    },
    robots: {
      accessible: robotsFound,
      broadDisallow,
      blocksAiCrawler: blockedCrawlers.length > 0,
      blockedCrawlers,
    },
    sitemap: {
      found: sitemapFound,
      urlCount: parsedSitemap.urls.length,
    },
    llmsTxt: { found: llmsFound },
    structuredData: { blocks: jsonLd.blocks, types: jsonLd.types },
  };

  const score = buildScore(signals);

  return {
    ok: true,
    report: {
      url: target.toString(),
      finalUrl: pageOutcome.finalUrl ?? target.toString(),
      checkedAt: now().toISOString(),
      homepage: {
        status: pageOutcome.status ?? 0,
        bytes: pageOutcome.bytes,
        title: parsed.title,
        metaDescription: parsed.metaDescription,
        canonical: parsed.canonical,
        lang: parsed.lang,
        h1Count: parsed.h1.length,
        openGraphTags: parsed.openGraphTags,
        validHtml,
        jsonLd,
      },
      robots: {
        found: robotsFound,
        status: robotsOutcome.status,
        bytes: robotsOutcome.bytes,
        error: robotsOutcome.error,
        groupCount: robotsFile.groups.length,
        sitemaps: robotsFile.sitemaps.slice(0, MAX_SAMPLE_URLS),
        broadDisallow,
        crawlers,
      },
      sitemap: {
        source: fromRobots ? 'robots' : 'default',
        url: sitemapUrl,
        found: sitemapFound,
        status: sitemapOutcome.status,
        isXml: parsedSitemap.isXml,
        isIndex: parsedSitemap.isIndex,
        urlCount: parsedSitemap.urls.length,
        truncated: parsedSitemap.truncated,
        sample: parsedSitemap.urls.slice(0, MAX_SAMPLE_URLS),
        error: sitemapOutcome.error,
      },
      llmsTxt: {
        found: llmsFound,
        status: llmsOutcome.status,
        hasText: parsedLlms.hasText,
        title: parsedLlms.title,
        sections: parsedLlms.sections,
        sample: parsedLlms.sample,
        error: llmsOutcome.error,
      },
      score,
      actions: buildActions(score),
      requests,
    },
  };
}
