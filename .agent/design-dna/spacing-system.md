# AI Factory — Spacing System

Source: P7A measured drift (75/84/28/31/96/104) + Linear/Stripe rhythm.

## Tokens

| Token | Value | Use |
| --- | --- | --- |
| `--space-16` | 16px | Card padding, grid gaps |
| `--space-24` | 24px | Button padding, card internal gaps |
| `--space-40` | 40px | Form rows, compact section gaps |
| `--space-64` | 64px | Panel gaps, H2 to content |
| `--space-96` | 96px | Dense page section rhythm, footer top |
| `--space-112` | 112px | Standard light-page section rhythm |

## Rules

- Section rhythm: 112px on light pages; 96px on dense/dark pages (Factory, demos).
- Exception: compact bands (ticker) may use 28/31 but must be an explicit "band" pattern.
- Cards: 22px padding as default. Gaps between cards: 14px on dark, 17px on light.
- Form rows: 40px gap between label/input and inline note.
- Footer: top padding 96px with a 1px ink line above; footer internal padding 40px.
- Hero: 82px top / 96px bottom on light pages; 62/70 on mobile; panel shadow 14px offset.
- Never mix spacing values from adjacent sections — pick one from the token scale.
