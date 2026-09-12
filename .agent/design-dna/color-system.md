# AI Factory — Color System

Source: P7A Design Review (honesty panel inconsistency) + Stripe + Cursor.

## Factory official palette

| Token | Value | Usage |
| --- | --- | --- |
| `--color-ink` | #173B32 | Factory Ink: text, primary buttons (dark bg), outlines |
| `--color-ink-strong` | #0D1512 | Dark pages background (Factory Command Center) |
| `--color-cream` | #F4F5EF | Factory Cream: page background |
| `--color-card` | #FFFFFF | Light surface cards |
| `--color-acid` | #B9D957 | Accent: live dots, highlights on dark |
| `--color-acid-strong` | #D4EB73 | Hover/lighter accent |
| `--color-muted` | #71827B | Secondary text on cream |
| `--color-line` | #D4DBD4 | 1px borders on light |
| `--color-line-dark` | #274031 | 1px borders on dark |
| `--color-warn` | #C89431 | Warning dots/labels |
| `--color-danger` | #D98A6F | Failure dots/labels |

## State mapping

- LIVE / success: acid dot (#B9D957)
- SHIPPED / stable: ink dot (#173B32), on dark #8FD39A
- REJECTED: 40% opacity ink dot
- QUEUED: hollow ink ring
- WARNING: #C89431
- ERROR: #D98A6F

## Rules

- There is exactly ONE deep green on light pages: #173B32.
  (P7A found #315A4C on the Radar honesty panel — replaced.)
- Backgrounds are cream, not white, for page shells. Cards may be white.
- On dark pages background is #0D1512 and accents are acid; never introduce new violet.
- Buttons: primary = ink bg + cream text. Dark page primary = acid bg + ink text.
- Hover: rows `rgba(23,59,50,0.04)`; dark pages `rgba(216,242,110,0.04)`.
- Focus outline: ink on light, acid on dark, always 2px + 2px offset.
