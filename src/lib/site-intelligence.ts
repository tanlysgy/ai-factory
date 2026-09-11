/**
 * Combined website intelligence report for experiment 004.
 *
 * This composes the exp-002 SEO parser and exp-003 AI readiness checker. It
 * does not add crawling, storage, external APIs, or model-generated output.
 */

import {
	buildActions,
	checkAiReadiness,
	type Action as ReadinessAction,
	type AiReadyDeps,
	type AiReadyReport,
} from './ai-ready-check.ts';
import {
	analyzeUrl,
	type AnalyzeDeps,
	type CheckStatus,
	type SeoAnalysis,
} from './seo-analyze.ts';

export interface QualityItem {
	id: string;
	label: string;
	status: CheckStatus;
	points: number;
	maxPoints: number;
	detail: string;
	fix?: string;
}

export interface WebsiteQualityReport {
	score: number;
	max: 100;
	items: QualityItem[];
}

export interface SiteAction {
	title: string;
	detail: string;
	severity: 'fail' | 'warn';
	fix?: string;
}

export interface SiteIntelligenceReport {
	url: string;
	finalUrl: string;
	analyzedAt: string;
	requests: number;
	overallScore: number;
	aiReadiness: AiReadyReport;
	websiteQuality: WebsiteQualityReport;
	actions: SiteAction[];
}

export interface SiteIntelligenceDeps {
	fetchImpl?: typeof fetch;
	now?: () => Date;
}

export type SiteIntelligenceResult =
	| { ok: true; report: SiteIntelligenceReport }
	| { ok: false; error: string; code: string };

const QUALITY_WEIGHTS: Record<string, number> = {
	title: 20,
	description: 20,
	canonical: 15,
	headings: 15,
	links: 15,
	images: 15,
};

function qualityPoints(status: CheckStatus, maxPoints: number): number {
	if (status === 'pass') return maxPoints;
	if (status === 'warn') return Math.round(maxPoints / 2);
	return 0;
}

function seoStatus(analysis: SeoAnalysis, id: string): CheckStatus {
	return analysis.checks.find((check) => check.id === id)?.status ?? 'fail';
}

function qualityItem(
	id: string,
	label: string,
	status: CheckStatus,
	detail: string,
	fix?: string,
): QualityItem {
	const maxPoints = QUALITY_WEIGHTS[id]!;
	return {
		id,
		label,
		status,
		points: qualityPoints(status, maxPoints),
		maxPoints,
		detail,
		fix,
	};
}

export function buildWebsiteQuality(analysis: SeoAnalysis): WebsiteQualityReport {
	const items: QualityItem[] = [
		qualityItem(
			'title',
			'Title',
			seoStatus(analysis, 'title'),
			analysis.title ? `"${analysis.title}"` : 'No title tag found.',
			'Add a clear, descriptive page title.',
		),
		qualityItem(
			'description',
			'Meta description',
			seoStatus(analysis, 'description'),
			analysis.metaDescription
				? `${analysis.metaDescription.length} characters present.`
				: 'No meta description found.',
			analysis.metaDescription
				? 'Refine the meta description to roughly 50–160 characters.'
				: 'Improve the missing meta description.',
		),
		qualityItem(
			'canonical',
			'Canonical',
			analysis.canonical ? 'pass' : 'fail',
			analysis.canonical ? `Declared: ${analysis.canonical}` : 'No canonical link found.',
			'Add a canonical URL to the page head.',
		),
		qualityItem(
			'headings',
			'Headings',
			seoStatus(analysis, 'h1'),
			analysis.h1.length === 0
				? 'No H1 heading found.'
				: `${analysis.h1.length} H1 heading${analysis.h1.length === 1 ? '' : 's'} found.`,
			'Use one descriptive H1 heading.',
		),
		qualityItem(
			'links',
			'Links',
			analysis.linkCount > 0 ? 'pass' : 'warn',
			analysis.linkCount > 0
				? `${analysis.linkCount} link${analysis.linkCount === 1 ? '' : 's'} found.`
				: 'No crawlable links found on the page.',
			'Add useful internal links where visitors need the next step.',
		),
		qualityItem(
			'images',
			'Images',
			seoStatus(analysis, 'alt'),
			analysis.imageCount === 0
				? 'No images to evaluate.'
				: `${analysis.imagesMissingAlt} of ${analysis.imageCount} images are missing alt text.`,
			'Add meaningful alt text to images that convey information.',
		),
	];

	return {
		score: items.reduce((total, item) => total + item.points, 0),
		max: 100,
		items,
	};
}

const ACTION_TITLES: Record<string, string> = {
	'Sitemap found': 'Add a sitemap.xml',
	'Major AI crawlers not blocked': 'Review robots.txt AI crawler rules',
	'No site-wide Disallow': 'Review the site-wide robots.txt rule',
	'"Structured data (JSON-LD)"': 'Add structured data',
	'Structured data (JSON-LD)': 'Add structured data',
	'Meta description': 'Improve the missing meta description',
};

function friendlyTitle(action: ReadinessAction): string {
	return ACTION_TITLES[action.title] ?? action.title;
}

/** Build a short, deterministic plan from both scoring models. */
export function buildActionPlan(
	aiReport: AiReadyReport,
	quality: WebsiteQualityReport,
): SiteAction[] {
	const readinessActions = buildActions(aiReport.score).map((action) => ({
		title: friendlyTitle(action),
		detail: action.detail,
		severity: action.severity,
		fix: action.fix,
		priority: action.maxPoints,
	}));
	const qualityActions = quality.items
		.filter((item) => item.status !== 'pass')
		.map((item) => ({
			title: item.id === 'description' ? 'Improve the missing meta description' : item.fix ?? item.label,
			detail: item.detail,
			severity: item.status,
			fix: item.fix,
			priority: item.maxPoints,
		}));

	const seen = new Set<string>();
	return [...readinessActions, ...qualityActions]
		.sort((a, b) => b.priority - a.priority || a.title.localeCompare(b.title))
		.filter((action) => {
			const key = action.title.toLowerCase();
			if (seen.has(key)) return false;
			seen.add(key);
			return true;
		})
		.slice(0, 6)
		.map(({ priority: _priority, ...action }) => action);
}

function failedResult(result: { ok: false; error: string; code: string }): SiteIntelligenceResult {
	return { ok: false, error: result.error, code: result.code };
}

/** Run both existing analyzers and combine their reports into one response. */
export async function analyzeSiteIntelligence(
	input: string,
	deps: SiteIntelligenceDeps = {},
): Promise<SiteIntelligenceResult> {
	const shared = { fetchImpl: deps.fetchImpl, now: deps.now };
	const [seoResult, aiResult] = await Promise.all([
		analyzeUrl(input, shared as AnalyzeDeps),
		checkAiReadiness(input, shared as AiReadyDeps),
	]);

	if (!seoResult.ok) return failedResult(seoResult);
	if (!aiResult.ok) return failedResult(aiResult);

	const quality = buildWebsiteQuality(seoResult.analysis);
	const overallScore = Math.round(
		(aiResult.report.score.total / aiResult.report.score.max) * 60 + quality.score * 0.4,
	);

	return {
		ok: true,
		report: {
			url: aiResult.report.url,
			finalUrl: aiResult.report.finalUrl,
			analyzedAt: aiResult.report.checkedAt,
			requests: aiResult.report.requests + 1,
			overallScore,
			aiReadiness: aiResult.report,
			websiteQuality: quality,
			actions: buildActionPlan(aiResult.report, quality),
		},
	};
}
