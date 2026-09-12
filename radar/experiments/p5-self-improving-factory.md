# Experiment P5 — Self-improving Website Factory

- Type: infrastructure / capability experiment
- Date: 2026-09-12
- Status: run
- Demand claim: none. P5 validates factory repeatability and decision quality,
  not market demand.

## What was built

- Factory memory system: .agent/memory/{factory-rules,ui-pattern-library,
  successful-patterns,failed-patterns,deployment-lessons}.md
- Selection framework: radar/factory/website-selection-framework.md
- Reference ranking tool: tools/factory/rank-reference.sh
- Premium pipeline: tools/factory/factory-create-premium.sh +
  tools/factory/test-site.sh (desktop, mobile, accessibility)
- Candidate research: radar/websites/research-2026-09.md (20 sites, top 5)
- Premium demo: sites/codeflare/ from Cursor reference

## Premium demo

- Reference: https://cursor.com/
- Brand: Codeflare (fictional)
- Public preview (P5 run):
  https://guy-billing-routine-reply.trycloudflare.com
- Interaction: prompt → plan → diff → apply (mock only)
- Browser verification: desktop 1440x1000 + mobile 390x844, no horizontal
  overflow, diff panel opens, pricing/CTA present.
- Screenshots: references/cursor/recreation/production-{desktop,mobile}.png

## Ranking

Top 5 candidates this sprint:

1. Cursor (87) — AI code editor
2. Stripe (85) — payments/editorial
3. Vercel (84) — dev platform
4. Attio (83) — CRM
5. Gamma (82) — AI presentation

Full table in radar/websites/research-2026-09.md.

## What worked

- rank-reference consumed existing captures without re-capturing.
- create-premium ran capture → rank → brief → scaffold → brand substitution →
  browser/mobile/a11y tests end-to-end.
- Codeflare reached Linear/Resend-quality polish on desktop and mobile.

## What failed / fixed

- test-site initially validated whatever occupied the default port; fixed by
  probing for a free port and starting a temporary server for the site under
  test.
- Template brand-token substitution alone is insufficient; agents must rewrite
  title/hero/copy after scaffolding (recorded in failed-patterns.md).

## Decision

The factory now has memory, a scoring framework, ranking automation, a premium
pipeline, and browser tests. Next: use create-premium on the next ranked
candidate and wire a stable named preview hostname after Cloudflare approval.
