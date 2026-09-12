# AI Factory — Typography System

Source: P7A Design Review + Linear / Stripe / Raycast.

## Stacks

- Sans (UI): `Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif`
- Mono (labels/meta): `ui-monospace, "JetBrains Mono", SFMono-Regular, Menlo, monospace`

## Headline system (fixed steps)

| Token | Size | Line height | Letter spacing | Weight | Usage |
| --- | --- | --- | --- | --- | --- |
| `--font-h1-home` | 112px | 0.92 | -0.04em | 800 | Homepage hero only |
| `--font-h1-page` | 96px | 0.94 | -0.05em | 800 | Radar/Factory hero |
| `--font-h1-tool` | 44px | 1.06 | -0.03em | 700 | Experiment/tool pages |
| `--font-h2` | 48px | 1.04 | -0.05em | 500 | Section titles (light pages 400) |
| `--font-h3` | 22px | 1.15 | -0.035em | 700 | Card titles |
| `--font-body` | 15px | 1.6 | 0 | 400 | Default copy |
| `--font-lede` | 20px | 1.4 | -0.02em | 500 | Hero subtitles |
| `--font-caption` | 13px | 1.45 | 0 | 400 | Card secondary copy |
| `--font-mono-label` | 11px | 1.2 | 0.1em | 700 | Eyebrows, chips, meta |
| `--font-number` | 44px | 0.9 | -0.04em | 800 | Stats (tabular-nums) |

## Rules

- H1 letter-spacing must never go below -0.05em (P7A measured -0.075em collision).
- Tool pages: product-name H1 + 20px subtitle. Long sentences are subtitles, not H1.
- Keep one intermediate step between H1 and body: lede 20px always present when H1 > 48px.
- Mono labels are uppercase, 11px, letter-spacing 0.1em. Never below 10px on light pages;
  mobile can drop to 9px only inside dense tables.
- Numbers that change (scores, counts, metrics) use `font-variant-numeric: tabular-nums`.
