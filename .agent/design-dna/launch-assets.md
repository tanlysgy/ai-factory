# Launch Assets Rules

From P9.5 independent visual QA (2026-09-13). Two rules that repeatedly broke across pages and assets.

## R1. Static assets never carry ephemeral URLs

`og-image`, `social-banner`, `thumbnail`, and factory Preview/Launch cards must only reference:

- the canonical product domain (e.g. `codeflare.dev`), or
- the production domain path (e.g. `ai-factory.sgyyyds.qzz.io/sites/<slug>/`).

Runtime URLs (`preview_url`, `*.trycloudflare.com`, localhost) are forbidden in baked assets.
If no stable URL exists, omit the URL from the asset rather than embedding a tunnel.

(Exception: a dev-only build may bake a preview URL, but the launch pipeline must regenerate
assets from `metadata.canonical_url` only.)

## R2. Preview links are secondary, labeled, and time-stamped

When a card offers both a live preview (tunnel) and a permanent page:

- primary link = permanent page on the production domain
- preview link = secondary, with `TEMP` label and creation time (e.g. `Preview · TEMP 02:05`)

Tunnels rotate; a "Preview ↗" as the primary link creates a wall of 404s on public pages.

## R3. Launch asset composition baseline (canonical)

- OG 1200×630：logo top-left · one product headline (≥2 lines at 500px) · product UI screenshot card · CTA chip
- Social banner 1600×900：headline left · mock/code right · CTA chip
- Thumbnail 800×450：centered headline + tagline + single product glyph

One domain story across all three (see R1).