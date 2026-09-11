# Experiment P2 — Website Factory replication pipeline

- Type: infrastructure / capability experiment
- Date: 2026-09-11
- Status: run
- Demand claim: none. This experiment does not claim market demand.

## Question

Can AI Factory automatically reproduce a visually strong public website as an
independent static recreation and publish a working public preview?

## Hypothesis

The existing browser capture pipeline plus an independent static recreation
can produce a public, tunnel-served preview that survives desktop and mobile
browser verification.

## Implementation

1. Reference: https://www.raycast.com/
2. Browser research via Codex Browser: rendered desktop/mobile/full-page
   screenshots, HTML snapshot, computed design signals (colors, type, radii,
   shadows, overflow, page height).
3. Independent recreation under `sites/aurora-launch/` with a fictional
   "Aurora" brand and original placeholder content; no copied logos,
   illustrations, screenshots, copy, or third-party assets.
4. Local server: `python3 -m http.server 4321 --directory sites/aurora-launch`
5. Public exposure: Cloudflare Quick Tunnel via
   `PREVIEW_PORT=4321 pnpm preview:tunnel` (`PREVIEW_TUNNEL_MODE=quick`).
6. Browser verification of the public preview: desktop + mobile screenshots,
   layout overflow and section checks.

## Artifacts

- Research: `references/raycast/source.md`, screenshots, HTML snapshot,
  `design-signals.json`
- Recreation: `sites/aurora-launch/`
- Local run command: `python3 -m http.server 4321 --directory sites/aurora-launch`
- Preview: `https://deutschland-touch-mechanical-promotions.trycloudflare.com`
  (temporary Quick Tunnel, recorded for P2 verification; not a production URL)

## Metrics

- Reference page height (desktop): ~16030px
- Reference horizontal overflow: none
- Recreation verified locally and through the public tunnel on desktop and
  mobile viewports.

## Limitations

- Recreated site is a visual demo, not a functional product; the launcher
  search filters demo rows only.
- Quick Tunnel URLs expire when the process stops; no stable preview hostname.
- The recreation deliberately omits the reference site's multi-page
  navigation, login, downloads, and app functionality.
- Visual fidelity is judged automatically via screenshots/layout checks, not
  pixel-perfect parity.

## Decision

Pipeline capability validated for further Website Factory use; next step is a
real project artifact rather than a demo replica.
