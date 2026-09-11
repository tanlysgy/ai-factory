---
id: exp-002
slug: seo-checker
opportunity_id: null                    # deliberate: this tests the pipeline, not a demand signal
status: launched
type: demo
hypothesis: >-
  AI Factory can take a known consumer-web product pattern (utility tool:
  input → instant result → conversion), rebuild the functionality in one
  session on the existing Astro + Cloudflare pipeline, and ship it publicly
  without new infrastructure.
expected_signal:
  metric: "pipeline outcome — tool reachable on the public URL and returning a real analysis"
  target: 1                             # binary: it works end to end, or it does not
  window: "1 session"
method: >-
  Build /experiments/seo-checker: a single URL input, a serverless analysis
  endpoint on the existing Cloudflare Worker, and a result view. Analysis is
  done with a dependency-free parser over one fetched page — no paid API, no
  crawler, no storage, no accounts. Deploy through the existing
  git push → GitHub Actions → Cloudflare pipeline. Verify with unit tests,
  a headless-browser UI suite, and a live end-to-end check against production.
created_at: "2026-09-11"
launched_at: "2026-09-11"
concluded_at: null

observed_signal: >-
  Shipped in one session and worked end to end on the first deployment. The page
  is publicly reachable, and the live Worker fetched and analyzed real external
  sites at request time. Verified 2026-09-11.
observed_numbers:
  metric: "live end-to-end checks passed"
  value: 11
result: iterate
decision: null
decision_why: null
cost_hours: 0
---

# Experiment exp-002: SEO checker replication prototype

## Hypothesis

AI Factory can take a known consumer-web product pattern (utility tool: input → instant
result → conversion), rebuild the functionality in one session on the existing Astro +
Cloudflare pipeline, and ship it publicly without new infrastructure.

This is a **capability** experiment, not a demand experiment. It has no linked
opportunity on purpose — it produces no evidence about whether anyone wants this, and
should not be scored as if it did.

## Copied pattern

Two reference patterns were studied for mechanics only. No branding, assets, copy, or
proprietary design was taken from either product.

| Reference | Pattern extracted |
|---|---|
| Ahrefs Backlink Checker | Landing page → single text input → immediate generated result → conversion opportunity at the moment of curiosity |
| Nano Banana | Capability presented first, instant value before any signup, no account required to see output |

What was reused is the **shape**: one input, one immediate result, no login, no
friction between question and answer. What was deliberately *not* copied is the
underlying product — a backlink database or an image model are both far outside
Experiment 002's scope.

## What is being tested

1. Can the pattern be reproduced in the existing stack without new services?
2. Does a serverless request-time fetch work on the current Worker configuration
   (`output: static` with one on-demand route, `global_fetch_strictly_public`)?
3. Does the existing deploy pipeline ship it publicly unchanged?
4. Can the result be genuinely useful rather than a stub?

## Success criteria

- [x] User can enter a URL.
- [x] Server fetches that page and returns real analysis (status, title, meta description, headings, links, technology hints).
- [x] Result view renders the analysis readably — verified in a headless browser.
- [x] Deployed publicly through the existing pipeline.
- [x] `pnpm build` passes; existing tests unaffected.

## Non-goals

Explicitly not built, and not to be built under this experiment:

- crawler infrastructure, multi-page crawling, or scheduling
- a backlink database or any index of the wider web
- user accounts, login, or saved history
- payments, subscriptions, or a pricing system
- a dashboard or reporting UI
- AI agents or LLM calls of any kind
- enterprise features, teams, exports, API keys

## Method

- **Route:** `/experiments/seo-checker` (static page) plus `/api/analyze`
  (`prerender = false`, so it runs on the existing Worker).
- **Analysis:** `src/lib/seo-analyze.ts` — dependency-free, regex-based parsing of a
  single fetched page. One request per analysis; no recursion, no crawling.
- **Bounds:** 10s timeout, 600 KB maximum read, at most 25 unique links displayed.
- **Safety:** only `http`/`https`; embedded credentials rejected; local, private, and
  link-local hosts rejected; the Worker compatibility flag
  `global_fetch_strictly_public` independently restricts outbound fetches to public IPs.
- **Privacy:** nothing is stored. The page is fetched, analyzed in memory, returned.

## Observed signal

Verified 2026-09-11 against production, not only locally:

- `/experiments/seo-checker/` → **HTTP 200**, publicly reachable.
- `POST /api/analyze` on the live Worker → **HTTP 200** for real targets:
  `example.com` (559 B, title "Example Domain", no meta description → correctly flagged)
  and `astro.build` (~309 KB, 136 links, 6 checks) with correct technology hints.
- Private-host input rejected live (`127.0.0.1` → refused server-side).
- Web Vitals, backlinks, and keyword data: absent, as scoped.

## Result & decision

- **Result:** iterate — the pipeline hypothesis held; the tool is real but the analyzer is a prototype.
- **Decision:** _pending human review (AI must not decide)._
- **AI's honest read:** the capability question is answered — a consumer-web utility pattern was
  reproduced and shipped publicly in one session on the existing stack, with no new services,
  accounts, or spend. The *product* question is not answered and this experiment provides no
  evidence for it: nothing here shows demand. The smallest honest next increment is replacing the
  regex parser with a real HTML parser; anything larger should wait for evidence this file cannot give.

## Verification

| Layer | Method | Result |
|---|---|---|
| Analysis logic | `node --test --experimental-strip-types src/lib/seo-analyze.test.ts` | 20 passed, 0 failed |
| Real-world parsing | analyzer run against live `example.com`, `astro.build`, `github.com`, `news.ycombinator.com` | correct titles, checks, and technology hints |
| API contract | HTTP calls against the dev server | invalid URL → 400, GET → 405, private host → rejected |
| UI behaviour | headless Chromium against the built site | 21 checks passed (states, rendering, XSS safety, responsive) |
| Existing tests | `node radar/engine/score.test.mjs` | 26 passed, 0 failed |
| Build | `pnpm build` | passes; 3 static routes + 1 on-demand route |
| Production | headless browser + live HTTP against the deployed Worker | 11 checks passed, real external fetch |

### Known limitations (honest)

- **Local end-to-end fetching is not possible in this environment.** The dev sandbox
  reaches the internet only through a local HTTP proxy that Node's `fetch` and
  workerd ignore, so outbound fetches fail *locally* while working in production. The
  live production check is therefore the authoritative end-to-end test, not the local run.
- Regex parsing, not a real HTML parser. It will misread malformed or exotic markup.
- Only the delivered HTML is analyzed — client-rendered content is invisible.
- No render-blocking/Core Web Vitals data, no backlink data, no keyword data: those all
  require the infrastructure this experiment deliberately refuses to build.
- `robots.txt` is not consulted; the tool fetches a single page the user explicitly names.

## Next step (if this continues)

Swap the regex parser for a real HTML parser, and only then consider whether real
traffic justifies anything more. No further features should be added on the strength of
this experiment alone — it proves capability, not demand.
