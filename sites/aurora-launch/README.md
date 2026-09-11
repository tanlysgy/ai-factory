# Aurora — Website Factory P2 recreation

Independent, self-contained recreation used as the first end-to-end Website
Factory pipeline test.

- Reference URL: https://www.raycast.com/
- Recreation goal: recreate the visual/product mechanics of a dark,
  keyboard-first command launcher landing page without copying Raycast's
  identity, copy, logos, illustrations, or assets.
- Implementation stack: static HTML, CSS, and vanilla JavaScript. No build
  step, no runtime dependencies, no tracking or analytics.
- Local run (port 4321):

  ```bash
  python3 -m http.server 4321 --directory sites/aurora-launch
  ```

  Then open http://127.0.0.1:4321

- Preview command (existing AI Factory pipeline):

  ```bash
  PREVIEW_PORT=4321 pnpm preview:tunnel
  ```

  The script reuses a server already answering on the port, then creates a
  Cloudflare Quick Tunnel. Mode used for P2: `quick`.

- Public preview URL (P2 run, temporary):
  `https://deutschland-touch-mechanical-promotions.trycloudflare.com`
- Build command: none required; the site is plain static HTML/CSS/JS.

## Features

- Sticky top nav and primary download CTA.
- Hero with original headline/subcopy and two CTAs.
- Fictional launcher window mock with functioning command search.
- Principle cards, collection tab filtering, assistant card, pricing grid.
- Responsive layouts for desktop/tablet/mobile with no horizontal overflow.
- Reduced-motion support.

## Known differences

- No Raycast branding, logo, illustrations, screenshots, marketing copy,
  pricing, or proprietary assets.
- Simplified single-page structure with anchor navigation instead of
  multi-page product documentation.
- Mock launcher is a lightweight HTML/CSS demo rather than a real app; search
  filters the demo rows only.
- Hover/scroll reveals are simplified to CSS transitions; reduced-motion media
  query disables them.

## Known limitations

- The recreation intentionally implements only the visual/presentation layer
  needed for the demo.
- No authentication, accounts, payments, backend, analytics, or external
  requests.
- Placeholder pricing and copy are fictional (Aurora demo brand).
