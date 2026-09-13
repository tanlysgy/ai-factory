#!/usr/bin/env bash
# Launch Kit Pipeline: generate a full launch kit for a factory site.
# Usage: launch:create <slug> [--title TITLE] [--tagline TAGLINE]
set -euo pipefail
launch_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$launch_dir/launch-lib.sh"

slug=""
title=""
tagline=""
while [[ $# -gt 0 ]]; do
  case "$1" in
    --title) title=$2; shift 2 ;;
    --tagline) tagline=$2; shift 2 ;;
    -*) echo "launch-create: unknown arg $1" >&2; exit 2 ;;
    *) slug=$(slug_from_arg "$1"); shift ;;
  esac
done
[[ -n "$slug" ]] || { echo "Usage: launch:create <slug> [--title TITLE] [--tagline TAGLINE]" >&2; exit 2; }
launch_require_site "$slug"
launch_require_browser

[[ -n "$title" ]] || title=$(launch_title_from_site "$slug")
[[ -n "$tagline" ]] || tagline=$(launch_tagline_from_site "$slug")
reference=$(launch_reference_from_site "$slug" || true)
created=$(date -u +%Y-%m-%dT%H:%M:%SZ)

out="$launch_out/$slug"
mkdir -p "$out/screenshots"

echo "launch: $slug — $title"
echo "launch: tagline: $tagline"
echo "launch: reference: ${reference:-—}"

# ---- Serve the site locally (self-managed; reuse an already-running server) ----
server_pid=""
for port in 4313 4314 4315; do
  if curl -sf -o /dev/null "http://127.0.0.1:$port/"; then
    base="http://127.0.0.1:$port"
    echo "launch: reusing local server at $base"
    break
  fi
  if python3 -m http.server "$port" --directory "$repo_root/sites/$slug" >/tmp/launch-http-$port.log 2>&1 & then
    server_pid=$!
    base="http://127.0.0.1:$port"
    echo "launch: started local server for $slug at $base (pid $server_pid)"
    break
  fi
done
cleanup() { if [[ -n "$server_pid" ]] && kill -0 "$server_pid" 2>/dev/null; then kill "$server_pid" 2>/dev/null || true; fi; }
trap cleanup EXIT
for i in $(seq 1 20); do curl -sf -o /dev/null "$base/" && break; sleep 0.25; done

# ---- Phase 2: browser screenshots ----
"$browser_bin" screenshot "$base/" "$out/screenshots/desktop-hero.png" --viewport 1440x900 --wait 700 --timeout 60000 >/dev/null
"$browser_bin" screenshot "$base/#agent" "$out/screenshots/desktop-feature.png" --viewport 1440x900 --wait 700 --timeout 60000 >/dev/null || true
"$browser_bin" screenshot "$base/#pricing" "$out/screenshots/desktop-pricing.png" --viewport 1440x900 --wait 700 --timeout 60000 >/dev/null || true
"$browser_bin" screenshot "$base/" "$out/screenshots/mobile-hero.png" --viewport 390x844 --wait 700 --timeout 60000 >/dev/null
"$browser_bin" screenshot "$base/" "$out/screenshots/fullpage.png" --full-page --wait 700 --timeout 60000 >/dev/null || true
echo "launch: screenshots captured"

# ---- Phase 3: OG image (1200x630) ----
python3 "$launch_dir/launch-render.py" og "$out" "$slug" "$title" "$tagline"
echo "launch: og-image.png rendered"

# ---- Phase 4: social banner (1600x900) ----
python3 "$launch_dir/launch-render.py" banner "$out" "$slug" "$title" "$tagline"
echo "launch: social-banner.png rendered"

# ---- thumbnail (800x450) ----
python3 "$launch_dir/launch-render.py" thumb "$out" "$slug" "$title" "$tagline"
echo "launch: thumbnail.png rendered"

# ---- Phase 5/6/7: copy, metadata, checklist ----
python3 "$launch_dir/launch-copy.py" "$out" "$slug" "$title" "$tagline" "$reference" "$created"

# Fill preview_url in metadata.json from factory state (if known).
python3 - "$out" "$repo_root" <<'PY'
import json, sys
from pathlib import Path
out = Path(sys.argv[1]); root = Path(sys.argv[2])
metap = out / "metadata.json"
meta = json.loads(metap.read_text())
preview = ""
for cf in (root/".factory/overlay.json", root/".factory/state.json"):
    try:
        data = json.loads(cf.read_text())
    except Exception:
        continue
    for entry in data.get("sites", []):
        if entry.get("id") == meta["slug"] and entry.get("previewUrl"):
            preview = entry["previewUrl"]
    if not preview:
        for entry in data.get("launches", []):
            if entry.get("slug") == meta["slug"] and entry.get("previewUrl"):
                preview = entry["previewUrl"]
    if preview:
        break
meta["preview_url"] = preview
metap.write_text(json.dumps(meta, indent=2) + "\n")
print("launch: preview_url in metadata:", preview or "(none set yet)")
PY
echo "launch: copy + metadata + checklist written"

# ---- README ----
cat > "$out/README.md" <<EOF
# Launch Kit — $slug

- Title: $title
- Tagline: $tagline
- Reference: ${reference:-—}
- Created: $created

Run the kit:

\`\`\`bash
pnpm launch:create $slug
\`\`\`

Artifacts:

- \`og-image.png\` (1200x630)
- \`social-banner.png\` (1600x900)
- \`thumbnail.png\` (800x450)
- \`screenshots/\` (real browser captures)
- \`producthunt.md\`, \`x-thread.md\`, \`reddit.md\`
- \`launch-checklist.md\`, \`metadata.json\`
EOF

echo "launch: kit complete at launch/$slug"
