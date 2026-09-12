# Browser capture pipeline

## Standard browser skill

The pipeline uses the existing Codex Browser skill at
`/home/sgy/.codex/skills/codex-browser/SKILL.md` and the CLI at
`/home/sgy/.local/bin/codex-browser`.

Supported operations:

- `open`: navigate and inspect accessible page text
- `html`: capture serialized page HTML
- `eval`: run JavaScript in the page and return JSON-serializable inspection data
- `click` and `fill`: interact with page controls
- `screenshot`: capture viewport or full-page PNGs
- `pdf`: export a page to PDF

Common options include `--proxy`, `--viewport`, `--wait`, `--timeout`,
`--profile`, `--headed`, `--full-page`, and `--geoip`.

## Limitations

- Each CLI invocation creates a new browser context unless a profile is supplied.
- The skill is not a Playwright project dependency and does not provide a local
  Playwright test runner.
- Browser access can need the host's explicit proxy configuration.
- Screenshots and HTML show the rendered page state after the configured wait;
  they are not a guarantee that every lazy-loaded or interaction-only state was
  explored.
- `eval` should return JSON-serializable values and must not be used to submit
  external forms or perform other side effects without explicit intent.

## Standard capture workflow

From the repository root:

```bash
tools/browser/capture-site.sh https://example.com references/example
```

The command produces:

- `full-page.png`
- `desktop.png` at 1440x1000
- `mobile.png` at 390x844
- `index.html`
- `css-assets.json` and `css-assets.txt`
- `color-palette.json`
- `typography-summary.json`
- `metadata.json`
- `README.md`

The capture is a reference artifact. It is not an instruction to copy a
brand's code or private assets; use it to record layout, responsive behavior,
colors, typography, and information hierarchy before an independent recreation.

## Timeout handling

- `capture-site.sh` uses `BROWSER_TIMEOUT_MS` (default 30000). Heavy/long
  pages should set `BROWSER_TIMEOUT_MS=120000`; `factory:create` already
  defaults to 120000 for signals.
- Each screenshot/html/metadata step retries once before skipping. A single
  timeout no longer aborts the whole capture; produced artifacts are kept.

## Failed capture recovery

- Screenshots, HTML, and metadata are written independently. If one step
  fails twice, capture continues and the README still lists whatever exists.
- Re-run `pnpm factory:rank <url> --skip-capture` after a partial capture to
  regenerate analysis from available artifacts.

## Mobile and accessibility checks

- `tools/factory/test-site.sh` checks desktop 1440x1000 and mobile 390x844:
  no horizontal overflow, sections render, and accessibility flags (missing
  img alt, unlabeled inputs, empty buttons, missing html lang).
- Every production demo must pass the same checks through the public tunnel,
  not only on localhost.

## create-premium workflow

`pnpm factory:create-premium <url> --name <brand> --template <template>`

Runs capture → design analysis → memory retrieval → replication brief →
scaffold → browser/mobile/accessibility tests → preview instructions. The
pipeline is the path for any future premium demo.
