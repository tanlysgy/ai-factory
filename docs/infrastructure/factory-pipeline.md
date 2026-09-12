# AI Factory Website Factory — P3 Infrastructure

## Goal

Turn the one-off Raycast replication experiment into a repeatable pipeline.

Input:

```text
https://some-public-site/
```

Automatically produces:

```text
references/<slug>/
  source.md
  full-page.png
  desktop.png
  mobile.png
  index.html
  metadata.json
  color-palette.json
  typography-summary.json
  design-signals.json
  replication-brief.md

sites/<slug>/            (after factory:scaffold + edits)
preview URL
```

## Commands

```bash
# Full research pipeline: capture + design signals + replication brief
pnpm factory:create https://example.com

# Explicit slug
pnpm factory:create https://example.com --slug example

# Scaffold a site from a template
pnpm factory:scaffold example saas-landing

# Premium end-to-end pipeline (capture -> rank -> brief -> scaffold ->
# brand substitution -> browser/mobile/accessibility tests -> preview)
pnpm factory:create-premium https://attio.com --name Atrix --template saas-landing

# Rank an existing capture without re-capturing
pnpm factory:rank https://attio.com --slug attio --skip-capture

# Preview a static site locally
pnpm preview:static sites/example
PREVIEW_PORT=4399 pnpm preview:static sites/example

# Expose it after it is running
PREVIEW_PORT=4399 pnpm preview:tunnel
```

Available templates:

- `sites/templates/saas-landing/`
- `sites/templates/ai-tool-landing/`
- `sites/templates/dashboard/`
- `sites/templates/seo-tool/`

## Workflow

```text
Website URL
  ↓
1. Browser capture (Codex Browser / Chromix)
  → screenshots, HTML snapshot, metadata
  ↓
2. Design signal extraction
  → colors, typography, spacing, radius, shadows, sections, CTA patterns
  ↓
3. Replication brief
  → site type, structure, components, reusable open-source suggestions
  ↓
4. Template scaffold + independent recreation
  → sites/<slug>/ (original brand name, copy, and assets)
  ↓
5. Local static preview
  → http://127.0.0.1:<port>
  ↓
6. Cloudflare Quick Tunnel preview
  → public URL (temporary)
  ↓
7. Browser verification + Git push
  → GitHub Actions deploy / named preview hostname (future)
```

## Template anatomy

Each template is a self-contained static site:

- `index.html` — sections and copy; replace brand name, nav, and copy.
- `styles.css` — CSS custom properties at the top (`--bg`, `--text`,
  `--primary`, `--radius`, `--shadow`); replace tokens to restyle the site.
- `app.js` — small optional interactions (filters, demo form, nav state).

## Cloudflare preview design

Quick Tunnel remains the zero-configuration preview path and is what P3 uses
for verification. For persistent named previews, the intended design is:

- Named tunnel: `xiaoxin-linux` (ID `fc1cd43d-df14-4a9a-bd23-cfd6d875efaf`)
- Preview zone: `sgyyyds.qzz.io`
- One public preview hostname such as:

  ```text
  preview.ai-factory.sgyyyds.qzz.io
  ```

- Host routing options:

  ```text
  preview.ai-factory.sgyyyds.qzz.io         → localhost:4321 (Astro main site)
  *.preview.ai-factory.sgyyyds.qzz.io       → localhost:4399 (static site server)
  ```

The current system tunnel ingress is configured in `/etc/cloudflared/config.yml`
and is managed by root. Adding a preview hostname requires two Cloudflare
changes that P3 does NOT make automatically:

1. A DNS CNAME record for the chosen hostname targeting
   `fc1cd43d-df14-4a9a-bd23-cfd6d875efaf.cfargotunnel.com`.
2. An ingress entry in the named tunnel config pointing that hostname to the
   local preview service.

Those steps are documented here and should be applied only with explicit
approval, to avoid breaking the existing deployed ingress.

## Constraints

- No database, auth, payments, analytics, or LLM API calls are added.
- The pipeline only records public, unauthenticated signals.
- `references/<slug>/` keeps only research artifacts; copied proprietary
  assets and credentials are prohibited.
- Named tunnel and system ingress are never modified automatically.
