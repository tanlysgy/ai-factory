# AI Factory — Failed Patterns

What went wrong and must not be repeated.

## Capture failures

- The default 30s browser timeout failed on Raycast's long/animating page.
  Fix: `BROWSER_TIMEOUT_MS=120000` for heavy pages; always set it explicitly.
- Some commands got killed mid-write leaving partial files. Fix: write capture
  into a temp file and move it into place; verify file exists before use.
- First background server attempts exited with the shell and were unreachable.
  Fix: start servers with `setsid nohup` and confirm the listener with
  `curl`/`ss` before pointing a tunnel at them.

## UI failures

- Default template cards look generic ("bootstrap/Tailwind default").
  Fix: every generated site must start from reference-specific design signals,
  not from stock components.
- Replacing only the brand token in a template is not enough: the scaffolded
  page still says "SaaS — Brand landing" and reads generic. Fix: after
  scaffolding, an agent must rewrite the title, hero, section headings, and
  copy from the reference's actual messaging structure before browser tests.
- CTA rows with more than two buttons dilute attention; keep max two.
- Mobile polish must include collapsing nav, single-column grids, full-width
  buttons, and no 1024px+ content islands.

## Automation gaps

- `test-site.sh` started against whatever already occupied the default port,
  silently validating the wrong site. Fix: it now probes for a free port and
  starts a temporary server for the exact site under test.
- `factory:create-premium` was passing a hard-coded port to the tester. Fix:
  the tester only receives `--port` when the operator sets `PREVIEW_PORT`.

## Browser verification gaps

- Claiming a preview works without actually opening it in the browser was
  wrong. Always assert real public URL load + section presence + overflow=0.
- Local `127.0.0.1` verification is not enough for a shipped-looking demo;
  the same checks run through the tunnel are the real gate.

## Deployment lessons

- `git diff --check` failed on trailing whitespace inside captured HTML
  snapshots. Fix: the store step trims trailing whitespace from artifacts.
- Do not modify `/etc/cloudflared/config.yml` or the named tunnel without
  explicit approval; named ingress changes are a separate documented step.
- Do not let a demonstration run touch existing experiments or radar engine.

## Demand discipline

- Beautiful UI repeatedly produced zero demand evidence on its own.
  "Capability is not demand" stays the operating rule.
