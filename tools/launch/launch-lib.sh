#!/usr/bin/env bash
# Shared helpers for the Launch Kit Pipeline.
# Source: source "$(dirname "$0")/launch-lib.sh"
set -euo pipefail
launch_dir_abs="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
repo_root="$(cd "$launch_dir_abs/../.." && pwd)"
launch_out="$repo_root/launch"
browser_bin=${CODEX_BROWSER_BIN:-/home/sgy/.local/bin/codex-browser}

slug_from_arg() { printf '%s' "$1" | tr '[:upper:]' '[:lower:]' | sed -E 's#[^a-z0-9]+#-#g; s#^-+##; s#-+$##'; }

launch_require_site() {
  local slug=$1
  [[ -d "$repo_root/sites/$slug" ]] || { echo "launch: site not found: sites/$slug" >&2; exit 1; }
}

launch_require_browser() { [[ -x "$browser_bin" ]] || { echo "launch: Codex Browser not found at $browser_bin" >&2; exit 1; }; }

launch_title_from_site() {
  local slug=$1
  local t
  t=$(sed -n '1s/^# //p' "$repo_root/sites/$slug/README.md" 2>/dev/null | head -1)
  [[ -n "$t" ]] || t="$slug"
  # Prefer the short name before an em-dash (README titles often read
  # "Name — description").
  case "$t" in
    *" — "*) t=${t%%" — "*} ;;
  esac
  printf '%s' "$t"
}

launch_tagline_from_site() {
  local slug=$1
  local line
  line=$(grep -m1 -oE '<h1[^>]*>[^<]+' "$repo_root/sites/$slug/index.html" 2>/dev/null | sed -E 's/<h1[^>]*>//' | head -1)
  [[ -n "$line" ]] || line=$(grep -m1 -oE 'class="lede"[^>]*>[^<]+' "$repo_root/sites/$slug/index.html" 2>/dev/null | sed -E 's/.*>//' | head -1)
  printf '%s' "$line"
}

launch_reference_from_site() {
  local slug=$1
  sed -nE 's/^- Reference URL: //p' "$repo_root/sites/$slug/README.md" 2>/dev/null | head -1
}
