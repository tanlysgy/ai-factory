# Website Factory convention

AI Factory website work follows a repeatable evidence-to-preview loop:

```text
Reference
  ↓
Browser Capture
  ↓
Independent Recreation
  ↓
Tunnel Preview
  ↓
Human Review
  ↓
Git Push
  ↓
Cloudflare Production
```

## Workflow

1. Choose a public reference and record its URL and purpose.
2. Run `tools/browser/capture-site.sh URL references/<slug>`.
3. Inspect the screenshots, HTML snapshot, CSS asset list, palette, and
   typography summary. Treat them as design evidence, not source code.
4. Build the new page independently within the existing Astro conventions.
5. Run `pnpm build` and the relevant tests.
6. Run `pnpm preview:tunnel` for a human-reviewable public preview. The command
   starts Astro when needed and prints the real Cloudflare Tunnel output.
7. Review desktop and mobile behavior, then commit and push through the existing
   GitHub Actions deployment.

## Commands

```bash
pnpm preview:tunnel
PREVIEW_TUNNEL_MODE=named pnpm preview:tunnel
```

Quick Tunnel mode is the default because it prints a temporary public URL
without requiring the named tunnel's Cloudflare ingress hostname. Named mode
uses `~/.cloudflared/config.yml` and requires that tunnel's hostname to already
be configured in Cloudflare.

## Safety and ownership

- Do not copy credentials, cookies, private assets, or authenticated content
  into `references/`.
- Do not modify an existing experiment while capturing a reference.
- Do not claim a preview is available unless the tunnel process actually starts
  and prints its URL.
- Keep capture artifacts scoped to one reference folder and commit only the
  artifacts that are useful for the next implementation.
