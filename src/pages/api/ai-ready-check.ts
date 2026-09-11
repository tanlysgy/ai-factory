import type { APIRoute } from 'astro';

import { checkAiReadiness } from '../../lib/ai-ready-check';

// On-demand: runs on the Cloudflare Worker because it inspects a live URL.
export const prerender = false;

const JSON_HEADERS = {
  'content-type': 'application/json; charset=utf-8',
  'cache-control': 'no-store',
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: JSON_HEADERS });
}

export const POST: APIRoute = async ({ request }) => {
  let input: unknown;
  try {
    const payload = (await request.json()) as { url?: unknown } | null;
    input = payload?.url;
  } catch {
    return json({ ok: false, code: 'bad_request', error: 'Send JSON like {"url":"example.com"}.' }, 400);
  }

  if (typeof input !== 'string') {
    return json({ ok: false, code: 'bad_request', error: 'A "url" string is required.' }, 400);
  }

  const result = await checkAiReadiness(input);
  if (!result.ok) {
    const status = result.code === 'invalid_url' || result.code === 'bad_request' ? 400 : 502;
    return json(result, status);
  }
  return json(result);
};

export const GET: APIRoute = () =>
  json({ ok: false, code: 'method_not_allowed', error: 'Use POST with {"url":"..."}.' }, 405);
