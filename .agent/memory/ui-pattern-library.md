# AI Factory — UI Pattern Library

Operational patterns proven across Raycast, Linear, Resend, Perplexity, and
the P4 demos. Use these as defaults unless reference signals say otherwise.

## Hero

- One bold sentence (≤ 15 words) that names the outcome, not the feature.
- Subhead ≤ 2 lines, muted color, max-width ~52ch.
- Eyebrow label above the H1 using a mono font, small caps, letter-spacing.
- Primary CTA + quiet secondary CTA beside it. Never more than two CTAs.
- Below the hero, a product mock (window, terminal, canvas, board) inside a
  rounded frame with a 1px border and soft layered shadow.

## Navigation

- Sticky light/dark nav: brand mark + name left, 3–5 links center/right, CTA
  right.
- Keep nav ≤ 66px tall; use backdrop blur on the sticky header.
- Mobile: collapse nav links; keep brand and primary CTA visible.

## CTA placement

- One primary CTA above the fold (hero), one after features, one in pricing
  per plan, one in the final section.
- Button style: solid accent with hover lift; quiet button is a bordered
  surface button, not a link-only.
- CTA copy is action + outcome ("Start free today", not "Learn more").

## Pricing section

- Two or three plans, max 720px wide, centered.
- Featured plan marked with a small mono flag and a soft ring/border.
- Price number large (34–48px), suffix muted; feature list uses checkmark
  prefixes in an accent color.
- Pricing is a visual anchor even when the product is a demo.

## Motion

- Micro-animations only: hover lift, image scale 1.025, link color fade.
- Use `prefers-reduced-motion` to disable transitions.
- Do not add looping animations, parallax, or heavy JS animation.

## Background and surfaces

- Dark theme: `#0a0a0c`-style background, `rgba(255,255,255,0.06-0.1)`
  surfaces, 1px inner borders.
- Light theme: near-white background, one muted accent, 1px `#e5e7eb` lines.
- Gradients: one radial glow behind the hero max, never rainbow.

## Typography

- Inter / system sans for UI; mono stack reserved for labels, ids, keyboard
  hints, prices.
- Base 16px; code/terminal blocks 13–14px; H1 60–78px desktop, ~44px mobile.
- Tight tracking on H1/H2 (-0.04em), 16–20px section subtitle in muted color.

## Spacing and radius

- Section vertical padding 80–112px; card grids 16px gaps.
- Radius: controls 8–10px, cards 12–16px, windows 14–16px, pills 999px.
- Soft shadow: `0 18px 50px rgba(0,0,0,0.10)` with a 1px border.

## Interactive demo patterns

- The hero demo must demonstrate input→output. Three proven patterns:
  1. Board/issue: type a title → card created (Ledger).
  2. API playground: edit request fields → preview updates (Relay).
  3. Question/answer: ask question → cited answer panel (Lumina).
- Keep demos to vanilla JS; mock data only.
