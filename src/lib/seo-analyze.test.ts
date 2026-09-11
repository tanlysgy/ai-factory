import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  buildChecks,
  detectTechHints,
  normalizeUrl,
  parseHtml,
  readCapped,
  type ParsedPage,
} from './seo-analyze.ts';

const blank = (overrides: Partial<ParsedPage> = {}): ParsedPage => ({
  title: null,
  metaDescription: null,
  canonical: null,
  lang: null,
  h1: [],
  imageCount: 0,
  imagesMissingAlt: 0,
  hasViewport: false,
  openGraphTags: 0,
  linkCount: 0,
  links: [],
  linksTruncated: false,
  ...overrides,
});

test('normalizeUrl accepts bare domains and adds https', () => {
  const result = normalizeUrl('example.com');
  assert.equal(result.ok, true);
  assert.equal(result.ok && result.url.toString(), 'https://example.com/');
});

test('normalizeUrl keeps an explicit scheme and strips the hash', () => {
  const result = normalizeUrl('http://example.com/a?b=1#frag');
  assert.equal(result.ok, true);
  assert.equal(result.ok && result.url.toString(), 'http://example.com/a?b=1');
});

test('normalizeUrl rejects empty, malformed, and non-http input', () => {
  assert.equal(normalizeUrl('').ok, false);
  assert.equal(normalizeUrl('   ').ok, false);
  assert.equal(normalizeUrl('not a url').ok, false);
  assert.equal(normalizeUrl('file:///etc/passwd').ok, false);
  assert.equal(normalizeUrl('javascript:alert(1)').ok, false);
});

test('normalizeUrl rejects local and private hosts', () => {
  for (const host of [
    'localhost',
    'http://127.0.0.1/',
    'http://10.0.0.5/',
    'http://192.168.1.1/',
    'http://172.16.0.1/',
    'http://169.254.169.254/latest/meta-data/',
    'http://metadata.google.internal/',
  ]) {
    assert.equal(normalizeUrl(host).ok, false, `expected ${host} to be rejected`);
  }
});

test('normalizeUrl rejects URLs with embedded credentials', () => {
  assert.equal(normalizeUrl('https://user:pass@example.com/').ok, false);
});

test('normalizeUrl allows public hosts that merely start with digits', () => {
  assert.equal(normalizeUrl('172.com').ok, true);
  assert.equal(normalizeUrl('1.1.1.1').ok, true);
});

test('parseHtml extracts title, description, canonical, lang and headings', () => {
  const html = `<!doctype html><html lang="en"><head>
    <title>  Hello &amp; welcome  </title>
    <meta name="description" content="A short description of the page.">
    <meta name="viewport" content="width=device-width">
    <meta property="og:title" content="Hello">
    <link rel="canonical" href="https://example.com/canonical">
    </head><body><h1>Main heading</h1><h1>Second heading</h1></body></html>`;
  const page = parseHtml(html, 'https://example.com/');

  assert.equal(page.title, 'Hello & welcome');
  assert.equal(page.metaDescription, 'A short description of the page.');
  assert.equal(page.canonical, 'https://example.com/canonical');
  assert.equal(page.lang, 'en');
  assert.deepEqual(page.h1, ['Main heading', 'Second heading']);
  assert.equal(page.hasViewport, true);
  assert.equal(page.openGraphTags, 1);
});

test('parseHtml counts images missing alt text', () => {
  const html = '<img src="a.png" alt="ok"><img src="b.png"><img src="c.png" alt="">';
  const page = parseHtml(html, 'https://example.com/');
  assert.equal(page.imageCount, 3);
  assert.equal(page.imagesMissingAlt, 2);
});

test('parseHtml resolves links and separates internal from external', () => {
  const html = `<a href="/about">About</a>
    <a href="https://other.com/x">Other</a>
    <a href="#top">Skip</a>
    <a href="mailto:a@b.com">Mail</a>`;
  const page = parseHtml(html, 'https://example.com/blog/post');

  assert.equal(page.links.length, 2);
  assert.equal(page.links[0]!.href, 'https://example.com/about');
  assert.equal(page.links[0]!.internal, true);
  assert.equal(page.links[1]!.internal, false);
  assert.equal(page.linksTruncated, false);
});

test('parseHtml honours a <base> tag when resolving links', () => {
  const html = '<base href="https://cdn.example.com/"><a href="deep/page">Deep</a>';
  const page = parseHtml(html, 'https://example.com/');
  assert.equal(page.links[0]!.href, 'https://cdn.example.com/deep/page');
});

test('parseHtml caps displayed links but reports truncation', () => {
  const html = Array.from({ length: 40 }, (_, i) => `<a href="/p${i}">p</a>`).join('');
  const page = parseHtml(html, 'https://example.com/');
  assert.equal(page.links.length, 25);
  assert.equal(page.linkCount, 40);
  assert.equal(page.linksTruncated, true);
});

test('parseHtml de-duplicates repeated links but counts every anchor', () => {
  const html = `
    <a href="/blog">Blog</a>
    <a href="/blog">Blog</a>
    <a href="/about">About</a>
    <a href="/blog">Blog again</a>`;
  const page = parseHtml(html, 'https://example.com/');
  assert.equal(page.linkCount, 4);
  assert.equal(page.links.length, 2);
  assert.deepEqual(page.links.map((l) => l.href), [
    'https://example.com/blog',
    'https://example.com/about',
  ]);
  assert.equal(page.linksTruncated, false);
});

test('detectTechHints identifies common stacks and ignores unknown markup', () => {
  // Next.js ships its state in a script tag with this id.
  assert.deepEqual(detectTechHints('<script id="__NEXT_DATA__" type="application/json">{}</script>'), ['Next.js']);
  assert.deepEqual(detectTechHints('<p>plain</p>'), []);
  const hints = detectTechHints('<script src="/wp-content/a.js"></script><div class="md:flex">x</div>');
  assert.ok(hints.includes('WordPress'));
  assert.ok(hints.includes('Tailwind CSS'));
});

test('detectTechHints ignores vendor names in prose and partner-logo markup', () => {
  // Mirrors the footer of astro.build, which links to webflow.com and labels
  // partner logos — none of that is evidence the site is built with them.
  const html = `
    <a href="https://webflow.com/feature/cloud?utm_source=Astro">Webflow</a>
    <svg aria-label="Cloudflare"><title>Cloudflare</title></svg>
    <span class="sr-only">Netlify</span>
    <p>Built with our friends at WordPress and Shopify.</p>`;
  assert.deepEqual(detectTechHints(html), []);
});

test('detectTechHints still reads real asset references', () => {
  const html = `
    <script src="/_next/static/chunks/main.js"></script>
    <link rel="stylesheet" href="https://cdn.shopify.com/s/files/theme.css">`;
  const hints = detectTechHints(html);
  assert.ok(hints.includes('Next.js'));
  assert.ok(hints.includes('Shopify'));
});

test('buildChecks fails when title, description, h1 and viewport are missing', () => {
  const checks = buildChecks(blank());
  const byId = Object.fromEntries(checks.map((c) => [c.id, c.status]));
  assert.equal(byId.title, 'fail');
  assert.equal(byId.description, 'fail');
  assert.equal(byId.h1, 'fail');
  assert.equal(byId.viewport, 'fail');
  assert.equal(byId.lang, 'warn');
  assert.equal(byId.alt, 'pass');
});

test('buildChecks passes on a well-formed page', () => {
  const checks = buildChecks(
    blank({
      title: 'A perfectly reasonable page title',
      metaDescription: 'A meta description that sits comfortably inside the recommended length range.',
      lang: 'en',
      h1: ['One heading'],
      hasViewport: true,
      imageCount: 2,
      imagesMissingAlt: 0,
    }),
  );
  assert.deepEqual([...new Set(checks.map((c) => c.status))], ['pass']);
});

test('buildChecks warns on borderline title lengths and multiple H1s', () => {
  const short = buildChecks(blank({ title: 'Short' }));
  assert.equal(short.find((c) => c.id === 'title')!.status, 'warn');

  const long = buildChecks(blank({ title: 'x'.repeat(80) }));
  assert.equal(long.find((c) => c.id === 'title')!.status, 'warn');

  const many = buildChecks(blank({ h1: ['a', 'b'] }));
  assert.equal(many.find((c) => c.id === 'h1')!.status, 'warn');
});

test('buildChecks reports partial alt-text coverage as a warning', () => {
  const checks = buildChecks(blank({ imageCount: 4, imagesMissingAlt: 1 }));
  assert.equal(checks.find((c) => c.id === 'alt')!.status, 'warn');
});

test('readCapped stops reading once the byte limit is reached', async () => {
  const chunk = new Uint8Array(1000).fill(65);
  const stream = new ReadableStream<Uint8Array>({
    pull(controller) {
      controller.enqueue(chunk);
    },
  });
  const text = await readCapped(new Response(stream), 2500);
  assert.ok(text.length <= 3000, `expected a capped read, got ${text.length}`);
  assert.ok(text.length >= 2000);
});
