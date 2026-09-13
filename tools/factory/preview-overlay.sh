#!/usr/bin/env bash
# Update .factory/overlay.json with an active quick-tunnel preview, or mark it
# expired when the tunnel stops. Only local file sync; never touches Cloudflare.
# Usage:
#   preview-overlay.sh activate <slug> <url>
#   preview-overlay.sh expire <slug>
#   preview-overlay.sh list
set -euo pipefail
factory_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
repo_root="$(cd "$factory_dir/../.." && pwd)"
overlay="$repo_root/.factory/overlay.json"
[[ -f "$overlay" ]] || printf '{"sites":[]}\n' > "$overlay"

cmd=${1:-list}
slug=${2:-}
url=${3:-}

case "$cmd" in
  activate)
    [[ -n "$slug" && -n "$url" ]] || { echo "usage: preview-overlay.sh activate <slug> <url>" >&2; exit 2; }
    jq --arg slug "$slug" --arg url "$url" --arg updated "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
      '.sites = ([.sites[] | select(.id != $slug)] + [{id:$slug, previewUrl:$url, updated:$updated, expiry:"active"}])' \
      "$overlay" > "$overlay.tmp" && mv "$overlay.tmp" "$overlay"
    echo "overlay: $slug -> $url (active)"
    ;;
  expire)
    [[ -n "$slug" ]] || { echo "usage: preview-overlay.sh expire <slug>" >&2; exit 2; }
    jq --arg slug "$slug" --arg updated "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
      '.sites = [.sites[] | if .id == $slug then . + {previewUrl:"", expiry:"expired", updated:$updated} else . end]' \
      "$overlay" > "$overlay.tmp" && mv "$overlay.tmp" "$overlay"
    echo "overlay: $slug expired"
    ;;
  list)
    jq -r '.sites[] | "\(.id)\t\(.previewUrl)\t\(.expiry // "unknown")"' "$overlay"
    ;;
  *)
    echo "usage: preview-overlay.sh activate|expire|list" >&2; exit 2 ;;
esac
