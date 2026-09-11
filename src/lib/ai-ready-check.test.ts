import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  AI_CRAWLERS,
  buildActions,
  buildScore,
  checkAiReadiness,
  extractJsonLd,
  findGroupFor,
  hasBroadDisallow,
  matchRule,
  parseLlmsTxt,
  parseRobotsTxt,
  parseSitemap,
  scoreLabel,
  type ReadinessSignals,
} from './ai-ready-check.ts';

/* ------------------------------------------------------------------ *
 * test harness: a deterministic fake fetch
 * ------------------------------------------------------------------ */

type RouteValue =
  | { status?: number; body?: string; contentType?: string }
  | { fail: 'timeout' | 'unreachable' };

function fakeFetch(routes: Record<string, RouteValue>) {
  const calls: string[] = [];
  const fetchImpl = (async (input: string | URL | Request) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
    calls.push(url);
    const route = routes[url];
    if (!route) return new Response('', { status: 404, headers: { 'content-type': 'text/html' } });
    if ('fail' in route) {
      const error = new Error(
        route.fail === 'timeout' ? 'The operation was aborted due to timeout' : 'fetch failed',
      );
      error.name = route.fail === 'timeout' ? 'TimeoutError' : 'TypeError';
      throw error;
    }
    return new Response(route.body ?? '', {
      status: route.status ?? 200,
      headers: { 'content-type': route.contentType ?? 'text/html' },
    });
  }) as unknown as typeof fetch;

  return { fetchImpl, calls };
}

const BASE = 'https://example.com';

const PAGE = (head: string, body = '<h1>Hello</h1>') =>
  `<!doctype html><html lang="en"><head><title>Example Site</title>${head}</head><body>${body}</body></html>`;

const ROUTES = {
  homepage: `${BASE}/`,
  robots: `${BASE}/robots.txt`,
  sitemap: `${BASE}/sitemap.xml`,
  llms: `${BASE}/llms.txt`,
};

const GOOD_SITEMAP = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://example.com/</loc></url>
  <url><loc>https://example.com/about</loc></url>
</urlset>`;

/** A site that satisfies every rule, for the 100-point case. */
function perfectRoutes() {
  return {
    [ROUTES.homepage]: {
      body: PAGE(
        `<meta name="description" content="A description of the example site that is long enough.">
         <meta property="og:title" content="Example">
         <link rel="canonical" href="https://example.com/">
         <script type="application/ld+json">{"@type":"WebSite","name":"Example"}</script>`,
      ),
    },
    [ROUTES.robots]: { body: 'User-agent: *\nAllow: /\nSitemap: https://example.com/sitemap.xml\n', contentType: 'text/plain' },
    [ROUTES.sitemap]: { body: GOOD_SITEMAP, contentType: 'application/xml' },
    [ROUTES.llms]: { body: '# Example\n\n## Docs\n- [Guide](https://example.com/guide)\n', contentType: 'text/plain' },
  };
}

/* ------------------------------------------------------------------ *
 * 1-4: URL validation (reusing the exp-002 hardening)
 * ------------------------------------------------------------------ */

test('1. accepts a valid URL', async () => {
  const { fetchImpl } = fakeFetch(perfectRoutes());
  const result = await checkAiReadiness('example.com', { fetchImpl });
  assert.equal(result.ok, true);
  assert.equal(result.ok && result.report.url, 'https://example.com/');
});

test('2. rejects an invalid URL', async () => {
  const result = await checkAiReadiness('not a url');
  assert.equal(result.ok, false);
  assert.equal(result.ok === false && result.code, 'invalid_url');
});

test('3. rejects localhost', async () => {
  for (const host of ['localhost', 'http://localhost:3000/', 'http://foo.localhost/']) {
    const result = await checkAiReadiness(host);
    assert.equal(result.ok, false, `expected ${host} to be rejected`);
  }
});

test('4. rejects private, loopback and link-local IPs', async () => {
  for (const host of [
    '127.0.0.1',
    'http://10.1.2.3/',
    'http://172.16.5.5/',
    'http://192.168.0.1/',
    'http://169.254.169.254/latest/meta-data/',
    'http://[::1]/',
    'http://metadata.google.internal/',
  ]) {
    const result = await checkAiReadiness(host);
    assert.equal(result.ok, false, `expected ${host} to be rejected`);
  }
});

test('4b. rejects credentials in the URL and non-http schemes', async () => {
  assert.equal((await checkAiReadiness('https://user:pw@example.com/')).ok, false);
  assert.equal((await checkAiReadiness('file:///etc/passwd')).ok, false);
  assert.equal((await checkAiReadiness('javascript:alert(1)')).ok, false);
});

/* ------------------------------------------------------------------ *
 * 5-8: robots.txt
 * ------------------------------------------------------------------ */

test('5. reports a missing robots.txt', async () => {
  const { fetchImpl } = fakeFetch({ [ROUTES.homepage]: { body: PAGE('') } });
  const result = await checkAiReadiness('example.com', { fetchImpl });
  assert.equal(result.ok, true);
  assert.equal(result.ok && result.report.robots.found, false);
  assert.equal(result.ok && result.report.robots.status, 404);
});

test('6. reports a present robots.txt with its groups and sitemaps', async () => {
  const { fetchImpl } = fakeFetch({
    [ROUTES.homepage]: { body: PAGE('') },
    [ROUTES.robots]: {
      body: '# comment\nUser-agent: GPTBot\nDisallow: /private\n\nUser-agent: *\nAllow: /\nSitemap: https://example.com/sitemap.xml\n',
      contentType: 'text/plain',
    },
  });
  const result = await checkAiReadiness('example.com', { fetchImpl });
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.report.robots.found, true);
  assert.equal(result.report.robots.status, 200);
  assert.equal(result.report.robots.groupCount, 2);
  assert.deepEqual(result.report.robots.sitemaps, ['https://example.com/sitemap.xml']);
});

test('7. detects a blocked AI crawler', async () => {
  const { fetchImpl } = fakeFetch({
    [ROUTES.homepage]: { body: PAGE('') },
    [ROUTES.robots]: { body: 'User-agent: GPTBot\nDisallow: /\n', contentType: 'text/plain' },
  });
  const result = await checkAiReadiness('example.com', { fetchImpl });
  assert.equal(result.ok, true);
  if (!result.ok) return;
  const gptbot = result.report.robots.crawlers.find((c) => c.token === 'GPTBot');
  assert.equal(gptbot?.access, 'blocked');
  assert.equal(gptbot?.rule, 'Disallow: /');
  const item = result.report.score.sections
    .find((s) => s.id === 'crawler-access')!
    .items.find((i) => i.id === 'ai-crawlers-allowed')!;
  assert.equal(item.status, 'fail');
  assert.equal(item.points, 0);
  assert.match(item.detail, /GPTBot/);
});

test('8. detects an allowed AI crawler', async () => {
  const { fetchImpl } = fakeFetch({
    [ROUTES.homepage]: { body: PAGE('') },
    [ROUTES.robots]: { body: 'User-agent: GPTBot\nDisallow: /private\nAllow: /\n', contentType: 'text/plain' },
  });
  const result = await checkAiReadiness('example.com', { fetchImpl });
  assert.equal(result.ok, true);
  if (!result.ok) return;
  const gptbot = result.report.robots.crawlers.find((c) => c.token === 'GPTBot');
  assert.equal(gptbot?.access, 'allowed');
});

test('8b. reports crawlers that robots.txt does not mention as unrestricted', async () => {
  const { fetchImpl } = fakeFetch({
    [ROUTES.homepage]: { body: PAGE('') },
    [ROUTES.robots]: { body: 'User-agent: SomeOtherBot\nDisallow: /\n', contentType: 'text/plain' },
  });
  const result = await checkAiReadiness('example.com', { fetchImpl });
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.ok(result.report.robots.crawlers.every((c) => c.access === 'unrestricted'));
  assert.equal(result.report.robots.crawlers.length, AI_CRAWLERS.length);
});

test('8c. flags a site-wide wildcard Disallow', async () => {
  const { fetchImpl } = fakeFetch({
    [ROUTES.homepage]: { body: PAGE('') },
    [ROUTES.robots]: { body: 'User-agent: *\nDisallow: /\n', contentType: 'text/plain' },
  });
  const result = await checkAiReadiness('example.com', { fetchImpl });
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.report.robots.broadDisallow, true);
  const item = result.report.score.sections
    .find((s) => s.id === 'crawler-access')!
    .items.find((i) => i.id === 'no-broad-disallow')!;
  assert.equal(item.points, 0);
});

/* ------------------------------------------------------------------ *
 * 9-10: sitemap
 * ------------------------------------------------------------------ */

test('9. finds and parses a sitemap', async () => {
  const { fetchImpl } = fakeFetch({
    [ROUTES.homepage]: { body: PAGE('') },
    [ROUTES.robots]: { body: 'User-agent: *\nAllow: /\n', contentType: 'text/plain' },
    [ROUTES.sitemap]: { body: GOOD_SITEMAP, contentType: 'application/xml' },
  });
  const result = await checkAiReadiness('example.com', { fetchImpl });
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.report.sitemap.found, true);
  assert.equal(result.report.sitemap.urlCount, 2);
  assert.equal(result.report.sitemap.isIndex, false);
  assert.equal(result.report.sitemap.source, 'default');
});

test('10. reports a missing sitemap', async () => {
  const { fetchImpl } = fakeFetch({
    [ROUTES.homepage]: { body: PAGE('') },
    [ROUTES.robots]: { body: 'User-agent: *\nAllow: /\n', contentType: 'text/plain' },
  });
  const result = await checkAiReadiness('example.com', { fetchImpl });
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.report.sitemap.found, false);
  assert.equal(result.report.sitemap.urlCount, 0);
});

test('10b. uses a same-origin sitemap from robots.txt but never follows a cross-origin one', async () => {
  const sameOrigin = fakeFetch({
    [ROUTES.homepage]: { body: PAGE('') },
    [ROUTES.robots]: { body: 'User-agent: *\nAllow: /\nSitemap: https://example.com/custom.xml\n', contentType: 'text/plain' },
    'https://example.com/custom.xml': { body: GOOD_SITEMAP, contentType: 'application/xml' },
  });
  const ok = await checkAiReadiness('example.com', { fetchImpl: sameOrigin.fetchImpl });
  assert.equal(ok.ok, true);
  if (ok.ok) {
    assert.equal(ok.report.sitemap.source, 'robots');
    assert.equal(ok.report.sitemap.url, 'https://example.com/custom.xml');
  }

  const crossOrigin = fakeFetch({
    [ROUTES.homepage]: { body: PAGE('') },
    [ROUTES.robots]: { body: 'User-agent: *\nAllow: /\nSitemap: https://cdn.other.test/sitemap.xml\n', contentType: 'text/plain' },
    [ROUTES.sitemap]: { body: GOOD_SITEMAP, contentType: 'application/xml' },
  });
  const other = await checkAiReadiness('example.com', { fetchImpl: crossOrigin.fetchImpl });
  assert.equal(other.ok, true);
  assert.equal(crossOrigin.calls.some((url) => url.includes('cdn.other.test')), false);
});

test('10c. recognises a sitemap index', () => {
  const parsed = parseSitemap(
    '<?xml version="1.0"?><sitemapindex><sitemap><loc>https://example.com/a.xml</loc></sitemap></sitemapindex>',
  );
  assert.equal(parsed.isIndex, true);
  assert.equal(parsed.isXml, true);
  assert.equal(parsed.urls.length, 1);
});

/* ------------------------------------------------------------------ *
 * 11-12: llms.txt
 * ------------------------------------------------------------------ */

test('11. reports llms.txt when found and parses it', async () => {
  const { fetchImpl } = fakeFetch(perfectRoutes());
  const result = await checkAiReadiness('example.com', { fetchImpl });
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.report.llmsTxt.found, true);
  assert.equal(result.report.llmsTxt.title, 'Example');
  assert.deepEqual(result.report.llmsTxt.sections, ['Docs']);
});

test('12. reports a missing llms.txt and keeps it framed as optional', async () => {
  const routes = perfectRoutes();
  const { [ROUTES.llms]: _removed, ...rest } = routes;
  const { fetchImpl } = fakeFetch(rest);
  const result = await checkAiReadiness('example.com', { fetchImpl });
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.report.llmsTxt.found, false);
  const item = result.report.score.sections
    .flatMap((s) => s.items)
    .find((i) => i.id === 'llms-txt')!;
  assert.equal(item.points, 0);
  assert.match(item.why, /optional emerging convention, not a universal requirement/i);
});

test('12b. does not treat an empty llms.txt as found', async () => {
  const routes = perfectRoutes();
  const { fetchImpl } = fakeFetch({
    ...routes,
    [ROUTES.llms]: { body: '   \n\n', contentType: 'text/plain' },
  });
  const result = await checkAiReadiness('example.com', { fetchImpl });
  assert.equal(result.ok && result.report.llmsTxt.found, false);
});

/* ------------------------------------------------------------------ *
 * 13-15: HTML signals
 * ------------------------------------------------------------------ */

test('13. detects a page title and scores it', async () => {
  const { fetchImpl } = fakeFetch(perfectRoutes());
  const result = await checkAiReadiness('example.com', { fetchImpl });
  assert.equal(result.ok && result.report.homepage.title, 'Example Site');
  const item = result.ok
    ? result.report.score.sections.flatMap((s) => s.items).find((i) => i.id === 'title')!
    : null;
  assert.equal(item?.points, 5);

  const bare = fakeFetch({ [ROUTES.homepage]: { body: '<html><head></head><body></body></html>' } });
  const noTitle = await checkAiReadiness('example.com', { fetchImpl: bare.fetchImpl });
  assert.equal(noTitle.ok && noTitle.report.homepage.title, null);
});

test('14. detects a canonical URL', async () => {
  const { fetchImpl } = fakeFetch(perfectRoutes());
  const result = await checkAiReadiness('example.com', { fetchImpl });
  assert.equal(result.ok && result.report.homepage.canonical, 'https://example.com/');
  const item = result.ok
    ? result.report.score.sections.flatMap((s) => s.items).find((i) => i.id === 'canonical')!
    : null;
  assert.equal(item?.points, 5);
});

test('15. detects JSON-LD and its schema types', async () => {
  const { fetchImpl } = fakeFetch(perfectRoutes());
  const result = await checkAiReadiness('example.com', { fetchImpl });
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.report.homepage.jsonLd.blocks, 1);
  assert.deepEqual(result.report.homepage.jsonLd.types, ['WebSite']);

  const item = result.report.score.sections
    .flatMap((s) => s.items)
    .find((i) => i.id === 'entity-schema')!;
  assert.equal(item.points, 5);
});

test('15b. reads @graph and ignores malformed JSON-LD', () => {
  const info = extractJsonLd(
    `<script type="application/ld+json">{"@graph":[{"@type":"Organization"},{"@type":["Article","NewsArticle"]}]}</script>
     <script type="application/ld+json">{ not json </script>`,
  );
  assert.equal(info.blocks, 2);
  assert.equal(info.invalid, 1);
  assert.deepEqual(info.types, ['Article', 'NewsArticle', 'Organization']);
});

/* ------------------------------------------------------------------ *
 * 16: scoring
 * ------------------------------------------------------------------ */

test('16. maps totals to the documented score bands', () => {
  assert.equal(scoreLabel(0), 'Needs work');
  assert.equal(scoreLabel(39), 'Needs work');
  assert.equal(scoreLabel(40), 'Getting there');
  assert.equal(scoreLabel(69), 'Getting there');
  assert.equal(scoreLabel(70), 'Good');
  assert.equal(scoreLabel(84), 'Good');
  assert.equal(scoreLabel(85), 'AI ready');
  assert.equal(scoreLabel(100), 'AI ready');
});

test('16b. awards full marks for a fully compliant site', async () => {
  const { fetchImpl } = fakeFetch(perfectRoutes());
  const result = await checkAiReadiness('example.com', { fetchImpl });
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.report.score.total, 100);
  assert.equal(result.report.score.label, 'AI ready');
  assert.deepEqual(
    result.report.score.sections.map((s) => [s.id, s.earned, s.max]),
    [
      ['discoverability', 30, 30],
      ['crawler-access', 30, 30],
      ['machine-readable', 25, 25],
      ['ai-signals', 15, 15],
    ],
  );
  assert.deepEqual(result.report.actions, []);
});

test('16c. awards nothing when every signal is missing', async () => {
  const { fetchImpl } = fakeFetch({ [ROUTES.homepage]: { body: '<div>bare</div>' } });
  const result = await checkAiReadiness('example.com', { fetchImpl });
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.report.score.total, 0);
  assert.equal(result.report.score.label, 'Needs work');
});

test('16f. a missing robots.txt earns no crawler-access points', async () => {
  const { fetchImpl } = fakeFetch({ [ROUTES.homepage]: { body: PAGE('') } });
  const result = await checkAiReadiness('example.com', { fetchImpl });
  assert.equal(result.ok, true);
  if (!result.ok) return;
  const section = result.report.score.sections.find((s) => s.id === 'crawler-access')!;
  assert.equal(section.earned, 0);
  assert.deepEqual(section.items.map((i) => i.status), ['warn', 'warn']);
  assert.match(section.items[0]!.detail, /no published rules to evaluate/i);
});

test('16g. a permissive robots.txt does earn the crawler-access points', async () => {
  const { fetchImpl } = fakeFetch({
    [ROUTES.homepage]: { body: PAGE('') },
    [ROUTES.robots]: { body: 'User-agent: *\nAllow: /\n', contentType: 'text/plain' },
  });
  const result = await checkAiReadiness('example.com', { fetchImpl });
  assert.equal(result.ok, true);
  if (!result.ok) return;
  const section = result.report.score.sections.find((s) => s.id === 'crawler-access')!;
  assert.equal(section.earned, 30);
  assert.deepEqual(section.items.map((i) => i.status), ['pass', 'pass']);
});

test('16d. section maximums add up to the documented 100 points', () => {
  const empty: ReadinessSignals = {
    homepage: { title: null, metaDescription: null, canonical: null, h1Count: 0, openGraphTags: 0, validHtml: false },
    robots: { accessible: false, broadDisallow: false, blocksAiCrawler: false, blockedCrawlers: [] },
    sitemap: { found: false, urlCount: 0 },
    llmsTxt: { found: false },
    structuredData: { blocks: 0, types: [] },
  };
  const score = buildScore(empty);
  assert.equal(score.max, 100);
  assert.deepEqual(score.sections.map((s) => s.max), [30, 30, 25, 15]);
});

test('16e. ranks the highest-value problems first', () => {
  const actions = buildActions(
    buildScore({
      homepage: { title: null, metaDescription: null, canonical: null, h1Count: 0, openGraphTags: 0, validHtml: true },
      robots: { accessible: false, broadDisallow: true, blocksAiCrawler: true, blockedCrawlers: ['GPTBot'] },
      sitemap: { found: false, urlCount: 0 },
      llmsTxt: { found: false },
      structuredData: { blocks: 0, types: [] },
    }),
  );
  assert.ok(actions.length > 0);
  assert.equal(actions[0]!.maxPoints, 20);
  assert.ok(actions.every((action, index) => index === 0 || actions[index - 1]!.maxPoints >= action.maxPoints));
});

/* ------------------------------------------------------------------ *
 * robots.txt parsing edge cases
 * ------------------------------------------------------------------ */

test('robots: consecutive user-agent lines share one group', () => {
  const file = parseRobotsTxt('User-agent: A\nUser-agent: B\nDisallow: /x\n');
  assert.equal(file.groups.length, 1);
  assert.deepEqual(file.groups[0]!.agents, ['A', 'B']);
});

test('robots: the longest matching rule wins, and allow wins ties', () => {
  const file = parseRobotsTxt('User-agent: *\nDisallow: /\nAllow: /public/\n');
  assert.equal(matchRule(file, 'GPTBot', '/public/page').allowed, true);
  assert.equal(matchRule(file, 'GPTBot', '/private').allowed, false);

  const tie = parseRobotsTxt('User-agent: *\nDisallow: /same\nAllow: /same\n');
  assert.equal(matchRule(tie, 'GPTBot', '/same').allowed, true);
});

test('robots: wildcards and end anchors are honoured', () => {
  const file = parseRobotsTxt('User-agent: *\nDisallow: /*.pdf$\n');
  assert.equal(matchRule(file, 'GPTBot', '/docs/file.pdf').allowed, false);
  assert.equal(matchRule(file, 'GPTBot', '/docs/file.pdf.html').allowed, true);
});

test('robots: a more specific user-agent group beats the wildcard group', () => {
  const file = parseRobotsTxt('User-agent: *\nDisallow: /\n\nUser-agent: GPTBot\nAllow: /\n');
  assert.equal(matchRule(file, 'GPTBot', '/').allowed, true);
  assert.equal(matchRule(file, 'OtherBot', '/').allowed, false);
  assert.equal(findGroupFor(file, 'GPTBot')?.agents[0], 'GPTBot');
});

test('robots: a comment or an empty Disallow is not a block', () => {
  const file = parseRobotsTxt('User-agent: * # all bots\nDisallow: # nothing\nAllow: /\n');
  assert.equal(matchRule(file, 'GPTBot', '/').allowed, true);
  assert.equal(hasBroadDisallow(file), false);
});

test('robots: strips comments and handles CRLF', () => {
  const file = parseRobotsTxt('User-agent: *\r\nDisallow: /secret # no\r\nSitemap: https://example.com/s.xml\r\n');
  assert.equal(matchRule(file, 'GPTBot', '/secret').allowed, false);
  assert.deepEqual(file.sitemaps, ['https://example.com/s.xml']);
});

test('llms.txt parsing tolerates plain text and markdown', () => {
  assert.equal(parseLlmsTxt('').hasText, false);
  assert.equal(parseLlmsTxt('  \n \n').hasText, false);
  const parsed = parseLlmsTxt('# Title\n\n> Summary\n\n## Section A\n- item\n## Section B\n');
  assert.equal(parsed.hasText, true);
  assert.equal(parsed.title, 'Title');
  assert.deepEqual(parsed.sections, ['Section A', 'Section B']);
});

/* ------------------------------------------------------------------ *
 * safety + bounds
 * ------------------------------------------------------------------ */

test('safety: makes at most four requests and never crawls', async () => {
  const { fetchImpl, calls } = fakeFetch(perfectRoutes());
  const result = await checkAiReadiness('example.com', { fetchImpl });
  assert.equal(result.ok, true);
  assert.equal(calls.length, 4);
  assert.equal(result.ok && result.report.requests, 4);
  assert.deepEqual(calls, [ROUTES.homepage, ROUTES.robots, ROUTES.llms, ROUTES.sitemap]);
});

test('safety: a timeout on the homepage ends cleanly', async () => {
  const { fetchImpl } = fakeFetch({ [ROUTES.homepage]: { fail: 'timeout' } });
  const result = await checkAiReadiness('example.com', { fetchImpl });
  assert.equal(result.ok, false);
  assert.equal(result.ok === false && result.code, 'timeout');
  assert.match(result.ok === false ? result.error : '', /too long to respond/);
});

test('safety: an unreachable host ends cleanly', async () => {
  const { fetchImpl } = fakeFetch({ [ROUTES.homepage]: { fail: 'unreachable' } });
  const result = await checkAiReadiness('example.com', { fetchImpl });
  assert.equal(result.ok, false);
  assert.equal(result.ok === false && result.code, 'unreachable');
});

test('safety: an HTTP error page is reported rather than scored', async () => {
  const { fetchImpl } = fakeFetch({ [ROUTES.homepage]: { status: 404, body: 'nope' } });
  const result = await checkAiReadiness('example.com', { fetchImpl });
  assert.equal(result.ok, false);
  assert.equal(result.ok === false && result.code, 'http_error');
});

test('safety: a non-HTML response is rejected', async () => {
  const { fetchImpl } = fakeFetch({
    [ROUTES.homepage]: { body: '{}', contentType: 'application/json' },
  });
  const result = await checkAiReadiness('example.com', { fetchImpl });
  assert.equal(result.ok, false);
  assert.equal(result.ok === false && result.code, 'not_html');
});

test('safety: a failing sub-resource degrades gracefully instead of throwing', async () => {
  const { fetchImpl } = fakeFetch({
    [ROUTES.homepage]: { body: PAGE('') },
    [ROUTES.robots]: { fail: 'timeout' },
    [ROUTES.llms]: { fail: 'unreachable' },
    [ROUTES.sitemap]: { status: 500, body: 'error' },
  });
  const result = await checkAiReadiness('example.com', { fetchImpl });
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.report.robots.found, false);
  assert.equal(result.report.robots.error, 'timeout');
  assert.equal(result.report.llmsTxt.found, false);
  assert.equal(result.report.sitemap.found, false);
  assert.ok(result.report.score.total >= 0);
});
