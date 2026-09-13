# Launch Pipeline (Launch Kit Factory)

A Launch Kit turns one of the Factory's recreated sites into a ready-to-post
launch package — real browser screenshots, locally-rendered OG/banner/thumbnail
images, honest launch copy, metadata, and a checklist — with a single command.

No online image services, no database, no auth, no analytics, no LLM APIs.

## Launch Flow

```text
pnpm launch:create <slug>
        │
        ▼
Read sites/<slug>/ (title, tagline, reference)
        │
        ▼
Phase 2  Real browser screenshots (Codex Browser / Chromix)
         desktop hero · feature · pricing
         mobile hero · full page
        │
        ▼
Phase 3  OG image 1200x630 (PIL, Factory Design Tokens)
        │
        ▼
Phase 4  Social banner 1600x900 + thumbnail 800x450 (PIL)
        │
        ▼
Phase 5  Launch copy: producthunt.md · x-thread.md · reddit.md
        │
        ▼
Phase 6  metadata.json (slug, title, created, reference, colors,
         preview_url, screenshots)
        │
        ▼
Phase 7  launch-checklist.md (all checkboxes)
        │
        ▼
launch/<slug>/  ← complete kit
        │
        ▼
Factory state sync → /factory/ Recent Launches
```

## CLI

```bash
# From the repo root
pnpm launch:create <slug> [--title "My Product"] [--tagline "One line"]
```

Defaults are read from the site:

- `sites/<slug>/README.md` first heading (`# Title — description`) → title
- `sites/<slug>/index.html` H1 or `.lede` → tagline
- `sites/<slug>/README.md` `- Reference URL: ...` → reference

Requirements:

- `sites/<slug>/` must exist (a factory-generated site).
- Codex Browser binary (`~/.local/bin/codex-browser`, override with
  `CODEX_BROWSER_BIN`) must be installed.

The script self-manages a local static server for `sites/<slug>` (reuses a
running server on ports 4313-4315, otherwise starts one with Python and cleans
it up afterwards).

## Browser Assets

All screenshots come from a real browser via the Codex Browser skill:

| File                     | Viewport | Section                |
| ------------------------ | -------- | ---------------------- |
| `desktop-hero.png`       | 1440x900 | Hero (scroll top)      |
| `desktop-feature.png`    | 1440x900 | Feature section        |
| `desktop-pricing.png`    | 1440x900 | Pricing section        |
| `mobile-hero.png`        | 390x844  | Hero (mobile)          |
| `fullpage.png`           | full     | Full-page capture      |

The feature/pricing captures rely on section anchors (`#agent`, `#pricing`).
Keep those anchors intact in generated sites or adjust
`tools/launch/launch-create.sh`.

## Generated Images

All images are rendered locally with Python PIL (no online generators):

| File              | Size    | Use                               |
| ----------------- | ------- | --------------------------------- |
| `og-image.png`    | 1200x630| Social / link previews            |
| `social-banner.png`| 1600x900| Twitter/X and social banners      |
| `thumbnail.png`   | 800x450 | Stores/video thumbnails           |

They use Factory Design Tokens:

- Ink `#173B32`, Ink Strong `#0D1512`, Cream `#F4F5EF`, Acid `#B9D957`, Muted `#71827B`

## Honest Launch Copy

- `producthunt.md` — name, tagline, description, first comment, FAQ. Every kit
  states clearly that the product is a **demo** and never invents users.
- `x-thread.md` — 7 post thread, disclosure first.
- `reddit.md` — 3 versions, disclosure first.

## Metadata

`metadata.json` includes: slug, title, created, reference, colors,
`screenshots` (file names) and `preview_url` (filled from
`.factory/state.json` / `.factory/overlay.json` when available).

## Factory Integration

`tools/factory/inspect-state.sh` discovers every `launch/*/metadata.json` and
`tools/factory/state-sync.sh` merges them into `.factory/state.json` under
`launches` (with `counts.launches`). `/factory/` reads that state and renders a
**Recent Launches** section — screenshot, title, date, reference, preview link.

## Self-improvement Rule

After each mission, a **Workflow Retrospective** is required: ask "is there one
improvement that would make the next launch faster?" Only if it (1) reduces
future task cost, (2) does not add system complexity, and (3) does not change
existing behavior — may be captured in `.agent/memory/`, `tools/launch/`,
`tools/factory/`, or `docs/infrastructure/`. **At most one flow optimization
per mission.** No speculative features.
