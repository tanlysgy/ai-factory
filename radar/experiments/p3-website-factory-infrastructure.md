# Experiment P3 — Website Factory infrastructure

- Type: infrastructure experiment
- Date: 2026-09-11
- Status: run
- Demand claim: none. This experiment validates internal pipeline capability,
  not market demand.

## Question

Can the one-off Website Factory experiment be upgraded into a repeatable
pipeline that takes a website URL and produces capture artifacts, design
signals, a replication brief, scaffolded site templates, and a public preview?

## Implementation

- Unified entry point: `pnpm factory:create <url> [--slug NAME]`.
- Capture: reuses `tools/browser/capture-site.sh` (Codex Browser) with a
  configurable `BROWSER_TIMEOUT_MS`.
- Design signals: new `tools/factory/extract-design-signals.sh` extracts
  colors, typography, spacing, radius, shadows, sections, and CTA patterns.
- Replication brief: new `tools/factory/generate-replication-brief.sh` writes
  site type, structure, core components, and reusable open-source suggestions.
- Scaffold: `pnpm factory:scaffold <slug> <template>` copies a template into
  `sites/<slug>/` for brand/colors/sections/copy replacement.
- Templates: `saas-landing`, `ai-tool-landing`, `dashboard`, `seo-tool`.
- Static preview: `pnpm preview:static sites/<slug>`; tunnel reuse unchanged.

## Real URL test

- Reference: https://www.11ty.dev/
- Slug: `eleventy-dev`
- Result: capture, design signals, and replication brief all generated under
  `references/eleventy-dev/`.
- Public URL verified through Quick Tunnel:
  `https://boot-virtue-author-waiver.trycloudflare.com`
- Browser verification: desktop 1440x1000; title, H1, five demo sections,
  nav links present; no horizontal overflow.

## Metrics

- 73 project tests pass.
- `pnpm build` succeeds.
- All shell and JS artifacts pass syntax checks.

## Limitations

- Persistent named-tunnel preview hostnames still require Cloudflare DNS +
  ingress configuration; intentionally not applied in P3.
- Templates are lightweight static demos; richer variants can be added later.
- Section detection is heading-based and may under-report sites without clear
  heading semantics.

## Decision

Keep the Website Factory pipeline; apply the named preview hostname only after
Cloudflare configuration is explicitly approved.
