# AI Factory — Component Library

Source: P7A Design Review + Linear / Raycast / Resend.

## Button

- Height 46px; padding 0 22px; radius 0; font 13px/700; letter-spacing 0.
- Primary: ink bg + cream text. Dark-mode primary: acid bg + ink text.
- Hover: `translate(-2px,-2px)` + 4px hard shadow (`box-shadow: 4px 4px 0 rgba(0,0,0,.14)`),
  150ms transition. Focus-visible: 2px ink outline + 2px offset.
- Disabled: 40% opacity. Secondary: 1px ink border + transparent bg.

## StatusChip

- Markup: `<span class="status-chip"><i class="dot"></i><span>LIVE</span></span>`
- Dot 8px circle; label 11px mono uppercase, 0.1em spacing.
- Variants: live (acid), shipped (ink / green on dark), rejected (40% ink),
  queued (hollow ring), warn (amber), error (red).
- Never use emoji as status.

## SectionHeader

- Eyebrow mono 11px + H2 (48px light / 40px dense) + optional aside on the right.
- Desktop: flex baseline, gap 24px. Mobile: stacked, beyond 650px.
- Section number prefix `01 /` from the same mono system.

## Card

- Light: white bg, 1px line border, 22px padding, radius 0.
- Dark: #111A16 bg, 1px line-dark border, 22px padding, radius 0.
- Card title: 22px/700/-0.035em; body 13px muted; hover row bg 4% ink.
- Featured: 2px ink border or acid border on dark.

## Divider

- 1px `var(--color-line)`; full width; margin derived from spacing token (16/24/40).
- Dark: `var(--color-line-dark)`. Vertical dividers allowed in metric grids.

## Navigation

- Desktop: mono 11px uppercase links, gap 28px; brand mark 31px ink square + cream AF.
- Sticky top; background cream 92% + backdrop blur 8px; bottom 1px line.
- Mobile (<640px): single "MENU" mono button; full-screen drawer with 16px links.
- Drawer: fixed inset-0, ink or cream bg, close button, focus trapped.

## Footer

- Top padding 96px, 1px line above; horizontal flex; mono 10px meta; page links.
- Hover on links: underline + 4px offset. Mobile stacks vertically.
