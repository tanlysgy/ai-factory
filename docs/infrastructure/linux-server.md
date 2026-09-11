# Linux server inventory

Captured on 2026-09-11 from `/home/sgy/ai-factory`.

## Operating system

- OS: Ubuntu 24.04.4 LTS (Noble Numbat)
- Kernel: Linux 7.0.0-31-generic, x86_64

## Runtime and tooling

| Tool | Version / status | Path |
|---|---|---|
| Node.js | `v22.23.2` | `/usr/bin/node` |
| pnpm | `10.34.5` | `/usr/bin/pnpm` |
| git | `2.43.0` | `/usr/bin/git` |
| cloudflared | `2026.8.3` (2026-08-31 build) | `/usr/local/bin/cloudflared` |
| Google Chrome | `152.0.7977.82` | `/usr/bin/google-chrome` |
| Playwright CLI | Not installed / not in project dependencies | N/A |

## Browser automation available to Codex

The repository does not depend on Playwright. The installed Codex Browser skill
is available at `/home/sgy/.codex/skills/codex-browser/SKILL.md` and runs the
Codex Browser CLI at `/home/sgy/.local/bin/codex-browser`.

Observed Codex Browser runtime:

- Chromix SDK: `152.0.7977.82`
- Chromix binary: `/home/sgy/.cache/chromix/v152.0.7977.82/linux-x64/chromix/chrome`
- Python: `3.12.3`
- Cached Playwright Chromium for fallback inspection: Chrome for Testing `151.0.7922.34`

Codex Browser is the standardized browser interface for this pipeline. It is
not the same thing as a globally installed Playwright CLI.

## Proxy

This host currently exposes an HTTP proxy at `http://127.0.0.1:7897` through
the `HTTP_PROXY`/`HTTPS_PROXY` environment variables. External browser capture
needs the proxy passed explicitly with `--proxy`; `capture-site.sh` uses those
variables by default.

## Cloudflare Tunnel

`cloudflared` is installed and a local configuration exists at
`~/.cloudflared/config.yml`. The configuration names the tunnel
`xiaoxin-linux` and references a credentials file outside this repository.
Credentials are intentionally not copied into project documentation.

No `cloudflared` process was running during inventory. The local configuration
does not contain an ingress hostname, so the named tunnel's public hostname is
managed by Cloudflare rather than discoverable from this repository. The
preview script therefore defaults to a Quick Tunnel, which prints its temporary
`trycloudflare.com` URL directly. Named mode remains available when the
Cloudflare ingress hostname is already known.
