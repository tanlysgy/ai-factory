import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
	analyzeAiVisibility,
	buildVisibilitySections,
} from './ai-visibility.ts';
import { extractJsonLd, matchRule, parseRobotsTxt } from './ai-ready-check.ts';

const HOME = 'https://example.com/';
const ROBOTS = 'https://example.com/robots.txt';
const LLMS = 'https://example.com/llms.txt';
const SITEMAP = 'https://example.com/sitemap.xml';

function fakeFetch(routes: Record<string, { status?: number; body?: string; contentType?: string }>) {
	const calls: string[] = [];
	const fetchImpl = (async (input: string | URL | Request) => {
		const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
		calls.push(url);
		const route = routes[url] ?? { status: 404, body: '', contentType: 'text/plain' };
		return new Response(route.body ?? '', {
			status: route.status ?? 200,
			headers: { 'content-type': route.contentType ?? 'text/html; charset=utf-8' },
		});
	}) as typeof fetch;
	return { fetchImpl, calls };
}

const homepage = `<!doctype html><html><head>
<title>Example Knowledge Base</title>
<meta name="description" content="A clear guide to the Example knowledge base.">
<script type="application/ld+json">{
  "@context":"https://schema.org", "@type":"Organization", "name":"Example",
  "sameAs":["https://www.linkedin.com/company/example"]
}</script>
<script type="application/ld+json">{"@type":"FAQPage","mainEntity":[]}</script>
</head><body>
<h1>Example Knowledge Base</h1><h2>Overview</h2><p>Example knowledge base content for public reference.</p>
<p>Read the facts and methods used by this knowledge base.</p><ul><li>Clear fact</li></ul>
<p>References and sources are maintained for readers.</p>
<a href="/about">About</a><a href="/contact">Contact</a>
<a rel="author" href="/authors/editor">Editor</a>
<a href="https://example.org/source-one">Source one</a><a href="https://example.org/source-two">Source two</a>
</body></html>`;

function fullRoutes() {
	return {
		[HOME]: { body: homepage },
		[ROBOTS]: { body: 'User-agent: *\nAllow: /\nSitemap: https://example.com/sitemap.xml\n', contentType: 'text/plain' },
		[LLMS]: { body: '# Example\n\n## Key pages\n- /about\n', contentType: 'text/plain' },
		[SITEMAP]: { body: '<?xml version="1.0"?><urlset><url><loc>https://example.com/</loc></url></urlset>', contentType: 'application/xml' },
	};
}

test('valid URL returns a bounded report with an optional brand name', async () => {
	const { fetchImpl, calls } = fakeFetch(fullRoutes());
	const result = await analyzeAiVisibility('example.com', 'Example', {
		fetchImpl,
		now: () => new Date('2026-09-11T00:00:00.000Z'),
	});

	assert.equal(result.ok, true);
	if (!result.ok) return;
	assert.equal(result.report.brandName, 'Example');
	assert.equal(result.report.score.total, 100);
	assert.equal(result.report.requests, 4);
	assert.equal(calls.length, 4);
});

test('invalid, localhost, private and credential URLs are rejected without fetches', async () => {
	for (const input of ['not a url', 'http://localhost:4321', 'http://127.0.0.1', 'http://192.168.1.1', 'https://user:pass@example.com']) {
		const { fetchImpl, calls } = fakeFetch({});
		const result = await analyzeAiVisibility(input, '', { fetchImpl });
		assert.equal(result.ok, false, input);
		if (result.ok) continue;
		assert.equal(result.code, 'invalid_url');
		assert.equal(calls.length, 0);
	}
});

test('robots parsing reports AI crawler allow and block rules', () => {
	const robots = parseRobotsTxt('User-agent: GPTBot\nAllow: /\nUser-agent: ClaudeBot\nDisallow: /\nUser-agent: Google-Extended\nDisallow: /private\n');
	assert.equal(matchRule(robots, 'GPTBot', '/').allowed, true);
	assert.equal(matchRule(robots, 'ClaudeBot', '/').allowed, false);
	assert.equal(matchRule(robots, 'Google-Extended', '/').allowed, true);
});

test('JSON-LD detection finds Organization and FAQPage schema', () => {
	const info = extractJsonLd(homepage);
	assert.equal(info.blocks, 2);
	assert.deepEqual(info.types, ['FAQPage', 'Organization']);
});

test('failed signals produce a zero score and actionable fields', () => {
	const sections = buildVisibilitySections('<html><head></head><body></body></html>', '', false, false, false);
	assert.equal(sections.reduce((sum, current) => sum + current.earned, 0), 0);
	for (const current of sections) {
		for (const check of current.items) {
			assert.equal(check.points, 0);
			assert.ok(check.problem);
			assert.ok(check.why);
			assert.ok(check.suggestion);
		}
	}
});

test('score cannot exceed 100 and all passing signals reach 100', () => {
	const sections = buildVisibilitySections(homepage, 'User-agent: *\nAllow: /', true, true, true);
	const total = sections.reduce((sum, current) => sum + current.earned, 0);
	assert.equal(total, 100);
	assert.ok(total >= 0 && total <= 100);
});
