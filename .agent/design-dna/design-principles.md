# AI Factory — Design Principles

Source: P7A Design Review + Linear / Raycast / Stripe / Cursor / Resend.

## 1. Editorial Brutalism is the default

- Cream paper (#F4F5EF), ink (#173B32), acid lime accent (#B9D957), mono labels.
- Right angles over radii. `border-radius: 0` on buttons, cards, inputs.
- One 1px ink border is richer than a shadow.
- Live badging uses an 8px dot + 11px mono uppercase label — never an emoji.

## 2. Size is a system, not a preference

- H1 scales through fixed steps: home 112px, inner page 96px, tool page 44px.
- Section rhythm is 112px on light pages, 96px on dense pages, 64px inside cards.
- Button height is 46px; mono labels are 11px with 0.08em+ letter-spacing.
- Draw 1px lines with ink at 100%, 10%, and focus states explicitly.

## 3. Every interactive element has a resting, hover, and focus state

- Links: hover underlines with `text-underline-offset: 4px`.
- Buttons: hover moves `translate(-2px, -2px)` with a 4px hard shadow.
- Cards/rows: hover background `rgba(23,59,50,0.04)`.
- Focus-visible: `outline: 2px solid #173B32; outline-offset: 2px`
  (acid lime on dark pages).

## 4. Mobile is designed, not degraded

- Under 640px the nav becomes a mono "MENU" button + full-screen drawer.
- No horizontal overflow at 390px is an acceptance criterion.
- Long tables wrap in `overflow-x:auto`; sticky first column when valuable.
- Touch targets are ≥ 44px; buttons never shrink below their label.

## 5. Interaction is purposeful and quiet

- Entrance: `translateY(12px)->0 + opacity`, 500ms, `cubic-bezier(0.22,1,0.36,1)`,
  stagger 60ms. Never animate decoration.
- Numbers use `font-variant-numeric: tabular-nums`.
- Respect `prefers-reduced-motion`: disable transitions and counters.

## 6. Proof over polish

- Every shipped template/experiment must be verified at 1440 and 390 in a real
  browser before it counts as done.
- Beautiful UI alone is not demand. Design systems make products look funded;
  they do not make them validated.
