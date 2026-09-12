# AI Factory — Deployment Lessons

## Local preview

- Static sites: `python3 -m http.server <port> --directory sites/<name>`.
- Keep the process independent: `setsid nohup ... </dev/null >log 2>&1 &`,
  then verify with `curl`.
- Astro dev server and static servers share port 4321 historically; choose a
  free port per demo (e.g. 4310-4312) and document it.

## Quick Tunnel

- `PREVIEW_PORT=<port> tools/browser/preview-tunnel.sh` reuses an existing
  local server on that port and prints a public trycloudflare URL.
- Parse the URL from the log with
  `rg -o 'https://[a-z0-9-]+\.trycloudflare\.com'`.
- Tunnel URLs die with the process; kill both the tunnel wrapper and its
  cloudflared child, plus the static server, when verification is done.
- Cloudflare's ICMP ping warning is harmless; QUIC registration is the
  success signal.

## Named tunnel

- System config: `/etc/cloudflared/config.yml` (root-owned) routes
  `sgyyyds.qzz.io` etc. Do not edit it without approval.
- User config at `~/.cloudflared/config.yml` defines tunnel `xiaoxin-linux`
  (ID `fc1cd43d-df14-4a9a-bd23-cfd6d875efaf`).
- Adding a preview hostname requires: DNS CNAME to
  `<tunnel-id>.cfargotunnel.com` + an ingress entry for the chosen hostname.

## GitHub Actions

- CI runs `pnpm build` and deploys on push to master with
  `CLOUDFLARE_API_TOKEN`.
- Local `wrangler` is not authenticated (token expired), so production deploy
  verification happens through Actions runs.
- After push, check `gh run list --limit 3`; deployment success is a required
  gate for "shipped".
