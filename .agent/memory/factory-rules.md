# AI Factory — Factory Rules (operational)

Every agent building a website demo must read this file before starting. These
are hard constraints learned from P2–P4, not suggestions.

## Capture first, build second

- Run `pnpm factory:create <url>` before writing any demo site. The capture is
  the source of truth for layout, typography, color, spacing, radius, shadows,
  sections, and CTA placement.
- Never hand-wave a design from memory. If the reference capture is missing,
  stop and capture it.

## Never copy a brand

- Do not reuse the reference site's name, logo, tagline, illustration,
  screenshot, marketing copy, pricing, or source code.
- Always create a new fictional brand (e.g. Ledger, Relay, Lumina) with
  original copy and original geometric/CSS visuals.
- A demo may imitate visual *mechanics* (composition, hierarchy, spacing,
  color relationships) but must not imitate identity.

## Always verify in a real browser

- After building a site, serve it locally and verify 1440x1000 desktop and
  390x844 mobile.
- Required checks: no horizontal overflow, all sections render, interactive
  demo works, CTA links work, pricing/footer present.
- Then publish through Quick Tunnel (`PREVIEW_PORT=<port> pnpm preview:tunnel`)
  and re-run the same browser checks against the public URL.

## Preview hygiene

- Prefer Quick Tunnel for verification; named tunnel changes require explicit
  user approval.
- Record the real public URL produced by the tunnel in the experiment log. Do
  not claim a preview works unless the browser opened it successfully.
- Kill preview processes after verification unless the user wants them alive.

## Quality bar

- A demo must look like a real product page: restrained palette, large
  whitespace, tight typography hierarchy, one clear CTA per viewport,
  responsive pricing, and at least one interactive element.
- Do not ship template-looking cards, emoji decorations, generic gradients, or
  multi-color card soup.

## Product honesty

- A beautiful landing page is a capability demonstration, not proof of demand.
- Never write demand claims into experiment records unless evidence exists.
- Prefer targets with an obvious user pain and an input→output flow that can
  be faked with mock data.

## Process invariants

- Do not add databases, auth, payments, analytics, or LLM APIs without an
  explicit request.
- Do not modify existing experiments or the radar scoring engine.
- Keep the pipeline reproducible: scripts not ad-hoc commands; artifacts in
  `references/<slug>/`; demos in `sites/<name>/`.
- Commit everything that documents or enables the workflow.
