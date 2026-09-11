---
id: exp-004
slug: site-intelligence
opportunity_id: null
status: launched
type: demo
hypothesis: >-
  AI Factory can make its validated SEO and AI-readiness capabilities visible as
  one polished public utility: URL in, combined website intelligence report out.
expected_signal:
  metric: "live production report returned for a real public website"
  target: 1
  window: "1 session"
method: >-
  Compose experiment 002's page parser and experiment 003's bounded AI-readiness
  checker behind one new API route and result page. Use deterministic scoring,
  no storage, no auth, no external APIs, and no LLM calls.
created_at: "2026-09-11"
launched_at: "2026-09-11"
concluded_at: null
observed_signal: >-
  Deployed through the existing GitHub Actions workflow and verified against
  production with a real external website plus local/private URL rejection.
observed_numbers:
  metric: "production report and safety checks passed"
  value: 4
result: iterate
decision: null
decision_why: null
cost_hours: 0
---

# Experiment exp-004: Site Intelligence AI

## Mission

Make AI Factory's replication capability visible by combining the validated
mechanics from exp-002 SEO Checker and exp-003 AI Ready Check into one public
demo at `/experiments/site-intelligence/`.

This is a capability experiment, not a SaaS product or a demand test.

## User flow

One public website URL is entered, the visitor clicks Analyze, and the Worker
returns one report with an overall score, three report sections, and a short
deterministic action plan.

## Report

- **Overall Score:** AI Readiness weighted 60% and Website Quality weighted 40%.
- **AI Readiness:** robots.txt, listed AI crawler access, llms.txt, sitemap, and
  structured data signals from exp-003.
- **Website Quality:** title, meta description, canonical, headings, links, and
  image accessibility signals from exp-002.
- **Action Plan:** fixed recommendations generated from failed or warning
  checks. There is no LLM or external API involved.

## Architecture and bounds

- Astro page with one on-demand Cloudflare Worker API route.
- Existing analyzers are composed; exp-002 and exp-003 are not rewritten.
- Five bounded outbound requests per successful report: the SEO homepage fetch,
  plus exp-003's homepage, robots.txt, llms.txt, and one same-origin sitemap.
- Existing URL hardening, 10-second request timeout, byte caps, and private-host
  rejection remain in force.
- No database, auth, payments, analytics, cookies, crawling, or stored history.

## Success criteria

- [x] Public URL works.
- [x] A visitor can enter a URL and receive a real combined report.
- [x] The result reads as a product demo on desktop and mobile.
- [x] `pnpm test` and `pnpm build` pass.
- [x] Existing experiments remain unchanged and their tests pass.

## Files

- `src/pages/experiments/site-intelligence.astro`
- `src/pages/api/site-intelligence.ts`
- `src/lib/site-intelligence.ts`
- `src/lib/site-intelligence.test.ts`

## Production verification

Deployed from commit `aa96d30` through GitHub Actions run `34563960160`.
The live base is `https://ai-factory.sgyyyds.qzz.io`.

- `/experiments/site-intelligence/` returned HTTP 200.
- `POST /api/site-intelligence` with `example.com` returned HTTP 200, a real
  report, overall score 35, and 5 bounded requests.
- `localhost` and `192.168.1.1` were rejected with HTTP 400 and
  `code: "invalid_url"`.
- `pnpm test`: 67 passed. `pnpm build`: passed.

The local browser automation surface was unavailable in this session, so no
browser screenshot is included in this record. The deployed HTML and API were
verified over HTTP.

## Known limitations

This is still a single-page inspection, not a site-wide audit. Regex-based
parsing cannot fully model malformed HTML. Client-rendered content is not
visible to the analyzer. Scores describe public signals and do not predict
whether a search engine or AI platform will index, use, or cite a site.
