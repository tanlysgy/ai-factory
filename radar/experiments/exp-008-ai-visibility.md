---
id: exp-008
slug: ai-visibility
opportunity_id: opp-002
status: launched
type: demo
hypothesis: >-
  A transparent public audit of AI-search visibility signals can make the
  discovered opportunity concrete enough to evaluate as a capability demo.
expected_signal:
  metric: "a public visitor can receive a deterministic AI visibility report"
  target: 1
  window: "1 session"
method: >-
  Inspect one public homepage plus same-origin robots.txt, llms.txt and one
  sitemap. Score crawlability, entity authority and citation readiness using a
  fixed 100-point checklist. Do not call an LLM or external API.
created_at: "2026-09-11"
launched_at: "2026-09-11"
concluded_at: null
observed_signal: >-
  The demo is implemented as an on-demand Astro/Cloudflare Worker route with
  bounded requests, public-signal scoring and URL safety checks.
observed_numbers:
  metric: "bounded outbound requests on a successful report"
  value: 4
result: iterate
decision: null
decision_why: null
cost_hours: 0
---

# Experiment exp-008: AI Search Visibility Audit

## Purpose

This experiment validates a product-shaped capability for the `opp-002` AI
search visibility opportunity. It is a public demo, not a production SaaS or a
demand result.

## Implementation

- `/experiments/ai-visibility/` accepts a website URL and optional brand name.
- The API makes at most four bounded requests: homepage, robots.txt, llms.txt,
  and one same-origin sitemap.
- The score is deterministic: AI Crawlability is 40 points, Entity Authority
  is 30 points, and Citation Readiness is 30 points.
- Existing URL validation, HTML parsing, robots parsing, sitemap parsing and
  JSON-LD extraction utilities are reused.
- There is no database, auth, analytics, external API, crawler recursion, or
  LLM call.

## Limitations

The audit only sees public server-returned markup and text. Regex-based parsing
is intentionally lightweight and does not execute client-side JavaScript. The
score describes observable preparation signals; it does not predict AI
recommendations, rankings, traffic, citations, indexing, or business outcomes.
`llms.txt` is treated as an optional convention, not a universal requirement.

No demand, usage, conversion, willingness-to-pay, or traction claim is made by
this experiment. The opportunity remains subject to the evidence and
recommendation recorded in `opp-002`.
