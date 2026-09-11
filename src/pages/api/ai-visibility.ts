import type { APIRoute } from 'astro';

import { analyzeAiVisibility } from '../../lib/ai-visibility.ts';

export const prerender = false;

const JSON_HEADERS = {
	'content-type': 'application/json; charset=utf-8',
	'cache-control': 'no-store',
};

function json(body: unknown, status = 200): Response {
	return new Response(JSON.stringify(body), { status, headers: JSON_HEADERS });
}

export const POST: APIRoute = async ({ request }) => {
	let payload: { url?: unknown; brandName?: unknown } | null;
	try {
		payload = (await request.json()) as { url?: unknown; brandName?: unknown } | null;
	} catch {
		return json({ ok: false, code: 'bad_request', error: 'Send JSON like {"url":"example.com"}.' }, 400);
	}

	if (!payload || typeof payload.url !== 'string') {
		return json({ ok: false, code: 'bad_request', error: 'A "url" string is required.' }, 400);
	}
	if (payload.brandName !== undefined && typeof payload.brandName !== 'string') {
		return json({ ok: false, code: 'bad_request', error: 'The optional "brandName" must be a string.' }, 400);
	}

	const result = await analyzeAiVisibility(payload.url, payload.brandName ?? '');
	if (!result.ok) {
		const status = result.code === 'invalid_url' ? 400 : 502;
		return json(result, status);
	}
	return json(result);
};

export const GET: APIRoute = () =>
	json({ ok: false, code: 'method_not_allowed', error: 'Use POST with {"url":"..."}.' }, 405);
