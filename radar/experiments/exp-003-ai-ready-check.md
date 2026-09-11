---
id: exp-003
slug: ai-ready-check
opportunity_id: null
status: launched
type: demo
hypothesis: >-
  A growing multi-signal product mechanism (AI/SEO readiness checking) can be
  narrowed into a single-purpose, self-contained tool, built independently from
  public standards only, and shipped publicly in one session on the existing
  Astro + Cloudflare pipeline.
expected_signal:
  metric: "live production checks passed against real third-party sites"
  target: 1                             # binary: it works end to end, or it does not
  window: "1 session"
method: >-
  Build /experiments/ai-ready-check: one URL input, four bounded requests
  (page, robots.txt, sitemap, llms.txt), and a transparent 100-point score
  computed in plain code. Reuse exp-002's hardened URL validation. No paid API,
  no LLM, no crawler, no storage.
created_at: "2026-09-11"
launched_at: "2026-09-11"
concluded_at: null

observed_signal: null
observed_numbers:
  metric: null
  value: null
result: null
decision: null
decision_why: null
cost_hours: 0
---

# Experiment exp-003: AI Ready Check

## Hypothesis

A growing multi-signal product mechanism (AI/SEO readiness checking) can be narrowed into a
single-purpose, self-contained tool, built independently from public standards only, and shipped
publicly in one session on the existing Astro + Cloudflare pipeline.

Like exp-002 this is a **capability** experiment: it has `opportunity_id: null` and produces no
demand evidence.

## Copied pattern (mechanism only)

| Reference | Mechanism extracted |
|---|---|
| Traffic.Tools AI Ready Check | Multi-signal automated audit → single headline score → prioritised remediation list. The conversion moment is the diagnosis, not the signup. |
| Current AI-visibility / SEO tool market | Free instant checker as the top of a funnel; the value is legibility ("what is wrong, and what do I do first"), not exhaustive reporting. |

**Not copied, deliberately:** no competitor brand, logo, wording, visual design, private
algorithm, data, or code. The scoring model here is derived from public standards and is written
as an auditable checklist in this repo. The checks are driven only by standards and conventions
that are publicly documented — robots.txt, XML sitemaps, schema.org / JSON-LD, Open Graph,
and the emerging `llms.txt` convention.

## What this proves (and what it does not)

It proves: the mechanism can be extracted, reduced to one function, implemented independently,
and deployed publicly with real output.

It does **not** prove: that anyone wants it. No demand signal is collected here, and none of the
observations below should be read as one.

## What is being tested

1. Can a multi-signal audit be narrowed to a single, legible product in one session?
2. Can it be built without dependencies, without an LLM, and within strict request bounds?
3. Does the exp-002 hardening (URL validation, timeouts, byte caps) hold up when a tool makes
   four requests instead of one?
4. Does the existing pipeline ship it publicly unchanged?

## Success criteria

- [x] User can enter a URL and get a real diagnosis.
- [x] robots.txt, sitemap, llms.txt and HTML signals are read from live sources.
- [x] Score is computed by fixed, readable code — no model, no heuristics.
- [x] Result page leads with score → problems → why → what to fix.
- [x] Deployed publicly through the existing pipeline.
- [x] `pnpm test` and `pnpm build` pass; earlier experiments unaffected.

## Non-goals

Explicitly not built: backlink database, traffic estimation, SERP API, any AI/LLM API, crawler
queue, database, login, payments, email capture, analytics, subscriptions, dashboard,
multi-page crawling, full-site audit, competitor analysis.

## Scoring model

Total 100 points, awarded only by `buildScore()` in `src/lib/ai-ready-check.ts`.

| Section | Max | Points |
|---|---|---|
| Discoverability | 30 | robots.txt accessible +10, sitemap found +10, canonical +5, valid HTML document +5 |
| AI Crawler Access | 30 | major AI crawlers not blocked +20, no site-wide `Disallow: /` +10 |
| Machine-readable Content | 25 | title +5, meta description +5, H1 +5, JSON-LD +5, Open Graph +5 |
| AI-oriented Signals | 15 | llms.txt present +5, sitemap contains usable URLs +5, Organization/WebSite schema +5 |

Bands: 0–39 Needs work · 40–69 Getting there · 70–84 Good · 85–100 AI ready.

### Two deliberate scoring decisions

1. **A missing robots.txt earns nothing in the crawler section.** Crediting a site for "not
   blocking" crawlers it never mentioned would award 30 points on the basis of evidence that does
   not exist. Both items become warnings with a clear "no published rules to evaluate" explanation.
2. **A disallowed crawler is a failure, not a warning**, because the tool's purpose is AI
   discoverability. The remediation text still says to review the rule first, since blocking is
   often intentional and correct.

## Claim discipline

The page never asserts that a crawler will or will not index, use or cite a site. It reports the
**public access rules** found in robots.txt and the markup present on the page, and states plainly
that indexing decisions belong to each platform. `llms.txt` is described everywhere as
"an optional emerging convention, not a universal requirement".

## Safety and bounds

- URL validation reuses exp-002's `normalizeUrl`: http/https only, no credentials, and rejection
  of localhost, loopback, private, link-local and `.internal` hosts.
- At most **four** outbound requests per check, never recursive; enforced by a test that asserts
  the exact request list.
- 10s timeout per request; byte caps (600 KB page, 200 KB robots.txt, 300 KB sitemap, 100 KB
  llms.txt); at most 50 sitemap URLs counted, 10 displayed.
- A cross-origin `Sitemap:` directive in robots.txt is **not** followed, so robots.txt cannot be
  used to make the worker fetch an arbitrary third-party host.
- No database, storage, cookies, accounts, tracking or background jobs.

## Verification

| Layer | Method | Result |
|---|---|---|
| Unit tests | `pnpm test` | 63 passed, 0 failed (42 for this experiment) |
| Real-world parsing | analyzer run against live `example.com`, `astro.build`, `stripe.com`, `x.com`, `reddit.com` | plausible, differentiated scores |
| UI behaviour | headless Chromium against the built site | 28 checks passed |
| Build | `pnpm build` | passes; 4 static routes + 2 on-demand routes |
| Production | live checks against the deployed Worker | see `## Result & decision` |

### Real observed output (2026-09-11, before deployment)

| Site | Score | robots.txt | sitemap | llms.txt | blocked AI crawlers |
|---|---|---|---|---|---|
| `example.com` | 15 · Needs work | no | no | no | none |
| `x.com` | 45 · Getting there | yes (broad `Disallow: /`) | no | yes | all 7 listed |
| `astro.build` | 85 · AI ready | yes | yes | no | none |
| `stripe.com` | 100 · AI ready | yes | yes | yes | none |

These are real tool outputs, not marketing figures. The spread across four real sites is the
evidence that the scoring discriminates rather than returning a constant.

## Known limitations (honest)

- Regex parsing, not a real HTML or sitemap parser; malformed markup will be misread.
- Only the homepage and one sitemap are inspected — this is not a site-wide audit.
- Crawler tokens are matched by name only. A rule aimed at a token that a platform does not use,
  or a platform that changes its token, cannot be detected from robots.txt alone.
- The score is a checklist, not a measurement of real-world AI visibility.
- llms.txt and AI crawler tokens have no formal standard body; the conventions checked here could
  change. The tool reports what exists today.
- Local end-to-end fetching is impossible in this environment (proxy-only networking); production
  is the authoritative end-to-end test. See `handoff.md` Known Issues.

## Next step

None proposed. This experiment answers a capability question; adding features on the strength of
it would repeat exactly the mistake exp-001 was designed to avoid.
