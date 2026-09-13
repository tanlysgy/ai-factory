# lesson-008: Launch Kit screenshots need real section anchors, not hash guessing

- mission: p9-launch-pipeline
- outcome: success
- date: 2026-09-13T02:15:00Z

## what worked

- `pnpm launch:create codeflare` produced a complete kit (5 real browser
  screenshots, OG/banner/thumbnail, Product Hunt/X/Reddit copy, metadata,
  checklist) from a single command, all local, no online services.
- The script self-manages its static server, so it works standalone.
- `preview_url` is filled into metadata from factory state automatically.
- `/factory/` renders Recent Launches from `launch/*/metadata.json` via state
  sync.

## what failed

- The first run captured `desktop-feature.png` by targeting a non-existent
  `#demo` hash; the browser silently fell back to the hero, so the feature
  screenshot was an exact duplicate of the hero (identical md5).
- State sync was not run after regenerating the kit, so the dashboard showed
  stale launch data until `factory:state:sync` was re-run.
- Hash-anchored screenshots are a fragile shortcut: `python3 -m http.server`
  ignores hashes and the browser silently captures whatever is at top.

## reusable pattern

- Screenshot scripts must target **real, verified section ids** from the site
  HTML (`#agent`, `#pricing`, ...), and the generated screenshot should be
  pixel-compared or checked for uniqueness as part of the pipeline.

## browser issue

- Desktop 1440 and mobile 390 verified: zero horizontal overflow, launch cards
  render, screenshot asset serves as image/png. Screenshots in
  `references/p9-launch/`.

## deployment lesson

- Factory page state comes from a Vite plugin at build time: after updating
  `launch` metadata or state, restart the dev server (or rebuild) before
  browser verification, otherwise stale data renders.

## next time

- Verify screenshot uniqueness automatically (md5 or pixel diff) and re-run
  `pnpm factory:state:sync` + restart dev until the launch card shows the new
  timestamp.
