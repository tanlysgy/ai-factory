#!/usr/bin/env bash
# Print a release checklist (Markdown) for the current repository state.
# Usage: pnpm factory:release-check
set -euo pipefail
factory_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
repo_root="$(cd "$factory_dir/../.." && pwd)"
cd "$repo_root"

updated=$(date -u +%Y-%m-%dT%H:%M:%SZ)
check() {
  # $1 label; $2 0/1
  if [[ "${2:-0}" == "1" ]]; then printf '%s\n' "- [x] $1"; else printf '%s\n' "- [ ] $1"; fi
}

desktop_ok=0; mobile_ok=0; drawer_ok=0; cta_ok=0; overflow_ok=0; focus_ok=0; test_ok=0; build_ok=0; deploy_ok=0
browser_ok_flag=0
deploy_ok_flag=0
while [[ $# -gt 0 ]]; do
  case "$1" in
    --browser-ok) browser_ok_flag=1; shift ;;
    --deploy-ok) deploy_ok_flag=1; shift ;;
    *) echo "release-check: unknown arg $1 (use --browser-ok / --deploy-ok)" >&2; exit 2 ;;
  esac
done

# pnpm test
if pnpm test >/dev/null 2>&1; then test_ok=1; else test_ok=0; fi
# pnpm build
if pnpm build >/dev/null 2>&1; then build_ok=1; else build_ok=0; fi
# overflow: check dist pages for width guards is weak; mark manual
overflow_ok=0
desktop_ok=$browser_ok_flag; mobile_ok=$browser_ok_flag; drawer_ok=$browser_ok_flag; cta_ok=$browser_ok_flag; focus_ok=$browser_ok_flag; overflow_ok=$browser_ok_flag
[[ $deploy_ok_flag -eq 1 ]] && deploy_ok=1

# Browser checks require codex-browser; mark manual unless we run them here.
# For the CLI, we produce an honest checklist and fill what we can verify.

cat <<EOF
# Factory Release Checklist

- generated: ($updated)

## Desktop 1440
$(check "Hero + nav render, no horizontal overflow" $desktop_ok)
$(check "Mission cards + timeline render" $desktop_ok)

## Mobile 390
$(check "Drawer opens fullscreen, Escape closes, scroll locked" $drawer_ok)
$(check "Mobile layout no horizontal overflow" $overflow_ok)
$(check "Mission cards stack" $mobile_ok)

## Components
$(check "CTA visible and 46px" $cta_ok)
$(check "Focus-visible rings present" $focus_ok)

## Gates
$(check "pnpm test passes" $test_ok)
$(check "pnpm build passes" $build_ok)

## Deploy
$(check "GitHub Actions deploy success" $deploy_ok)
EOF

echo
if [[ "$test_ok" == "1" && "$build_ok" == "1" ]]; then
  echo "release-check: test+build pass; browser/deploy items require manual or CI verification."
else
  echo "release-check: FAIL — test or build failed, do not release." >&2
  exit 1
fi
