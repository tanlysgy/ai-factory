# Reference: raycast.com

- Source URL: https://www.raycast.com/
- Captured: 2026-09-11 via Codex Browser / Chromix
- Viewport: 1440x1000 (desktop), 390x844 (mobile)
- Page height (desktop): ~16030px
- Horizontal overflow: none

## Why this website was selected

Raycast's homepage is publicly accessible, visually strong, mostly a long
marketing/landing page, and requires no login or complex backend to render. Its
primary value is presentation and product-storytelling, which makes it a good
reference for testing independent visual recreation.

## Major visual characteristics

- Dark product theme: near-black background `rgb(7, 8, 10)`, white text.
- Inter-first sans-serif stack; system SF Pro used for app chrome; monospace
  for labels and keyboard hints.
- Large, tight headline type with layered section headlines
  (`H1`: "Your shortcut to everything.", `H2`: "Take shortcuts, not detours.",
  "It's not about saving time.", "There's an extension for that.", ...).
- Prominent keyboard-first product UI mock: a focused launcher/search field
  with autocomplete results, small colored icon swatches, and keyboard hints.
- Small radii (`8px`, `11px`, `12px`, `16px`, `20px`) and pill buttons.
- 1px inner-border shadows on controls, subtle white-on-black layered glows,
  and a few colored neon glow accents.
- Repeated rhythm: eyebrow label, strong headline, supporting copy, CTA.
- Responsive behavior: desktop expanded nav collapses to a compact/mobile
  header; hero visual stacks; cards become single column.

## Major sections

- Sticky top nav: Store, Pro, AI, iOS, Windows, Teams, Enterprise, Blog,
  Pricing, Log in, Download CTA.
- Hero: headline + subcopy + "Download for Mac", Homebrew and "Download V1"
  sub-actions, plus keyboard CTA.
- Large launcher/product mock.
- "One interface, everything you need" / "It's not about saving time" feature
  band.
- "There's an extension for that": category tabs (Productivity, Engineering,
  Design, Writing) and extension cards.
- "AI Agent / AI Chat / Quick AI / AI Extensions" section.
- "Built for professionals like you", "Don't repeat yourself", "Stay in the
  loop", and extension-build/community sections.
- Final "Take the short way." CTA and footer.

## Interactions observed

- Sticky header with primary CTA.
- Navigation links pointing to product/feature pages.
- Download / install CTAs (not followed during research).
- Large app mock with filter-style search input and keyboard hints.
- Category tabs and card grids.
- Hover states on buttons and cards (subtle lightening / border glow).
- Smooth scroll and layout reveals where present; verified layout doesn't
  overflow horizontally at desktop RDP inspection viewport.

## Typography

- Body: Inter, sans-serif; base sizes 13–16px; leading tight (~18.4px).
- Headlines: large, high weight, tight letter-spacing; H1 sample 64px,
  section H2 samples ~32px (measured on rendered page).
- Labels/mono hints: GeistMono / JetBrains Mono stacks for keyboard shortcuts,
  small uppercase labels.

## Color palette (measured)

- Background: `rgb(7, 8, 10)`, surfaces `rgb(8, 9, 12)`, borders/tones
  `rgba(255,255,255,0.05-0.1)`.
- Text: white with opacity tiers `0.4-0.9`; muted grays
  `rgb(106,107,108)` / `rgb(156,156,157)`.
- Chips/controls: `rgba(255,255,255,0.05-0.1)` backgrounds, 1px inset
  highlights.
- Accents observed in the mock: warm red `#FF6363`, green `#59D499`, blue
  `#56C2FF`, amber `#FFC531`; page accents include subtle neon glow colors.

## Border radius / shadow signals

- Radii: 6–20px for controls/cards, 100% for avatars, pill for taps/buttons.
- Shadows: layered `rgba(0,0,0,0.4)` + 1px inset white highlights on app
  chrome; subtle `rgba(255,255,255,0.05)` ambient glows behind large mock
  panels.

## Screenshots captured

- desktop.png (1440x1000)
- mobile.png (390x844)
- full-page.png
- index.html (rendered HTML snapshot)
- design-signals.json (computed style signals)

## Assets observed

- Product UI graphics / app screenshots (verified visually).
- Logo (Raycast wordmark and icon).
- Product and community photos (e.g. keyboard, card images).
- SVG/PNG in page HTML snapshot; private/proprietary assets are NOT copied into
  the recreation.

## Recreation scope

Independent recreation keeps the overall dark launcher-first layout, visual
hierarchy, spacing rhythm, Inter-like typography system, card/category
structure, small radii, 1px inner borders, and responsive behavior. It uses a
new fictional brand ("Aurora"), original headline copy, geometric CSS mock
shapes, and no Raycast logos, illustrations, marketing copy, or proprietary
images.
