import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
	analyzeSiteIntelligence,
	buildActionPlan,
	buildWebsiteQuality,
} from './site-intelligence.ts';
import type { AiReadyReport } from './ai-ready-check.ts';
import type { SeoAnalysis } from './seo-analyze.ts';

const HOME = 'https://example.com/';
const ROBOTS = 'https://example.com/robots.txt';
const LLMS = 'https://example.com/llms.txt';
const SITEMAP = 'https://example.com/sitemap.xml';

function fakeFetch(routes: Record<string, { status?: number; body?: string; contentType?: string }>) {
	const calls: string[] = [];
	const fetchImpl = (async (input: string | URL | Request) => {
		const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
		calls.push(url);
		const route = routes[url] ?? { status: 404, body: '' };
		return new Response(route.body ?? '', {
			status: route.status ?? 200,
			headers: { 'content-type': route.contentType ?? 'text/html; charset=utf-8' },
		});
	}) as typeof fetch;
	return { fetchImpl, calls };
}

function routes() {
	return {
		[HOME]: {
			body: '<!doctype html><html lang="en"><head><title>Example Site</title><meta name="description" content="A useful description that is long enough to pass the check."><meta property="og:title" content="Example Site"><link rel="canonical" href="https://example.com/"><script type="application/ld+json">{"@type":"WebSite"}</script></head><body><h1>Example Site</h1><a href="/about">About</a><img src="/hero.jpg" alt="Hero"></body></html>',
		},
		[ROBOTS]: {
			body: 'User-agent: *\nAllow: /\nSitemap: https://example.com/sitemap.xml\n',
			contentType: 'text/plain',
		},
		[LLMS]: { body: '# Example Site\n\n## About\n- A useful example\n', contentType: 'text/plain' },
		[SITEMAP]: { body: '<?xml version="1.0"?><urlset><url><loc>https://example.com/</loc></url></urlset>', contentType: 'application/xml' },
	};
}

test('valid website returns a combined report and bounded request count', async () => {
	const { fetchImpl, calls } = fakeFetch(routes());
	const result = await analyzeSiteIntelligence('example.com', {
		fetchImpl,
		now: () => new Date('2026-09-11T00:00:00.000Z'),
	});

	assert.equal(result.ok, true);
	if (!result.ok) return;
	assert.equal(result.report.overallScore, 100);
	assert.equal(result.report.aiReadiness.score.total, 100);
	assert.equal(result.report.websiteQuality.score, 100);
	assert.equal(result.report.requests, 5);
	assert.equal(result.report.actions.length, 0);
	assert.equal(calls.length, 5);
});

test('invalid, localhost, and private URLs are rejected without fetches', async () => {
	for (const input of ['not a url', 'http://localhost:4321', 'http://127.0.0.1', 'http://192.168.1.1']) {
		const { fetchImpl, calls } = fakeFetch({});
		const result = await analyzeSiteIntelligence(input, { fetchImpl });
		assert.equal(result.ok, false, input);
		if (result.ok) continue;
		assert.equal(result.code, 'invalid_url');
		assert.equal(calls.length, 0);
	}
});

test('website quality creates deterministic recommendations', () => {
	const analysis = {
		title: null,
		metaDescription: null,
		canonical: null,
		h1: [],
		imageCount: 2,
		imagesMissingAlt: 2,
		linkCount: 0,
		checks: [
			{ id: 'title', label: 'Page title', status: 'fail', detail: 'No title' },
			{ id: 'description', label: 'Meta description', status: 'fail', detail: 'No description' },
			{ id: 'h1', label: 'H1 heading', status: 'fail', detail: 'No H1' },
			{ id: 'alt', label: 'Image alt text', status: 'fail', detail: 'Missing alt' },
		],
	} as unknown as SeoAnalysis;
	const report = buildWebsiteQuality(analysis);
	assert.equal(report.score, 8);
	assert.equal(report.items.find((item) => item.id === 'description')?.points, 0);
	assert.match(report.items.find((item) => item.id === 'images')?.fix ?? '', /alt text/i);
});

test('action plan includes the requested deterministic wording', () => {
	const aiReport = {
		score: {
			sections: [{ items: [
				{ label: 'Sitemap found', status: 'fail', maxPoints: 10, detail: 'No sitemap', why: 'discoverability', fix: 'Publish one.' },
				{ label: 'Major AI crawlers not blocked', status: 'fail', maxPoints: 20, detail: 'Blocked', why: 'rules', fix: 'Review it.' },
				{ label: 'Structured data (JSON-LD)', status: 'fail', maxPoints: 5, detail: 'Missing', why: 'entities', fix: 'Add schema.' },
			] }],
		},
	} as unknown as AiReadyReport;
	const quality = { score: 80, max: 100, items: [] };
	const titles = buildActionPlan(aiReport, quality).map((action) => action.title);
	assert.ok(titles.includes('Add a sitemap.xml'));
	assert.ok(titles.includes('Review robots.txt AI crawler rules'));
	assert.ok(titles.includes('Add structured data'));
});
