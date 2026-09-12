#!/usr/bin/env bash

# Creates a premium demo through the full factory pipeline.
# Usage: factory-create-premium.sh <url> --name <brand> --template <template>
#
# Pipeline:
#   capture -> rank analysis -> memory retrieval -> replication brief
#   -> scaffold -> generate site -> browser test -> mobile test -> preview

set -euo pipefail

factory_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
repo_root="$(cd "$factory_dir/../.." && pwd)"
source "$factory_dir/factory-lib.sh"

usage() {
	cat >&2 <<'EOF'
Usage: factory-create-premium.sh <url> --name BRAND [--template TEMPLATE] [--slug SLUG]

Required:
  --name BRAND       fictional brand name for the recreation
  --template NAME    template in sites/templates/ (default: ai-tool-landing)

Environment:
  BROWSER_WAIT_MS / BROWSER_TIMEOUT_MS / BROWSER_PROXY
  PREVIEW_PORT      port used for preview (default 4313)
EOF
	exit 2
}

[[ $# -ge 3 ]] || usage
url=$1
shift
name=""
template="ai-tool-landing"
slug=""
while [[ $# -gt 0 ]]; do
	case "$1" in
		--name) name=$2; shift 2 ;;
		--template) template=$2; shift 2 ;;
		--slug) slug=$2; shift 2 ;;
		*) usage ;;
	esac
done

[[ -n "$name" ]] || usage
require_browser
require_command jq
require_command file

export BROWSER_WAIT_MS=${BROWSER_WAIT_MS:-1500}
export BROWSER_TIMEOUT_MS=${BROWSER_TIMEOUT_MS:-120000}
port=${PREVIEW_PORT:-4313}

if [[ -z "$slug" ]]; then slug=$(slug_from_url "$url"); fi
refs_dir="$repo_root/references/$slug"
site_dir="$repo_root/sites/${slug}"

echo ""
echo "=== Step 0: memory retrieval ==="
echo "Factory rules: $(test -f "$repo_root/.agent/memory/factory-rules.md" && echo loaded || echo missing)"
echo "UI patterns:  $(test -f "$repo_root/.agent/memory/ui-pattern-library.md" && echo loaded || echo missing)"
echo "Lessons:      $(test -f "$repo_root/.agent/memory/successful-patterns.md" && echo loaded || echo missing)"

echo ""
echo "=== Step 1: capture ==="
"$repo_root/tools/factory/factory-create.sh" "$url" --slug "$slug"

echo ""
echo "=== Step 2: design analysis / ranking ==="
"$repo_root/tools/factory/rank-reference.sh" "$url" --slug "$slug" --skip-capture

echo ""
echo "=== Step 3: replication brief ==="
"$repo_root/tools/factory/generate-replication-brief.sh" "$slug" "$refs_dir" "$refs_dir/replication-brief.md"

echo ""
echo "=== Step 4: scaffold ==="
if [[ -d "$site_dir" ]]; then
	echo "sites/$slug already exists; editing in place with brand tokens."
else
	"$repo_root/tools/factory/factory-scaffold.sh" "$slug" "$template"
fi

echo ""
echo "=== Step 5: brand substitution ==="
if [[ -f "$site_dir/index.html" ]]; then
	sed -i "s/Acme/$name/g; s/Nova/$name/g" "$site_dir/index.html" 2>/dev/null || true
	sed -i "s/Acme/$name/g; s/Nova/$name/g" "$site_dir/styles.css" 2>/dev/null || true
	echo "Replaced placeholder brand tokens with $name"
else
	echo "Warning: site scaffold missing index.html; you must create it manually."
fi

echo ""
echo "=== Step 6: browser + mobile tests ==="
test_args=()
if [[ -n "${PREVIEW_PORT+x}" ]]; then
	test_args+=(--port "$PREVIEW_PORT")
fi
"$repo_root/tools/factory/test-site.sh" "$site_dir" "${test_args[@]}"

echo ""
echo "=== Step 7: preview ==="
echo "Site is ready. Run with local server + tunnel:"
echo "  PREVIEW_PORT=$port pnpm preview:tunnel"
echo ""
echo "Premium pipeline complete: $site_dir"
