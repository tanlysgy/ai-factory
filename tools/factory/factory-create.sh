#!/usr/bin/env bash

# Unified Website Factory entry point.
# Usage: factory-create.sh <url> [--slug NAME]
#
# Runs the full reference pipeline:
#   1. detailed capture  -> references/<slug>/
#   2. design signals    -> references/<slug>/design-signals.json
#   3. replication brief -> references/<slug>/replication-brief.md

set -euo pipefail

factory_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
repo_root="$(cd "$factory_dir/../.." && pwd)"
source "$factory_dir/factory-lib.sh"

usage() {
	cat >&2 <<'EOF'
Usage: factory-create.sh <url> [--slug NAME]

Captures a reference website and produces design evidence:
  references/<slug>/source.md
  references/<slug>/{full-page,desktop,mobile}.png
  references/<slug>/index.html
  references/<slug>/design-signals.json
  references/<slug>/replication-brief.md

Environment:
  BROWSER_PROXY        Browser proxy URL (defaults to HTTPS_PROXY)
  BROWSER_WAIT_MS      Settle time after navigation (default 1500)
  BROWSER_TIMEOUT_MS   Browser command timeout (default 120000 for signals)
EOF
	exit 2
}

[[ $# -ge 1 ]] || usage
url=$1
slug=""
shift

while [[ $# -gt 0 ]]; do
	case "$1" in
		--slug)
			[[ $# -ge 2 ]] || usage
			slug=$2
			shift 2
			;;
		*)
			usage
			;;
	esac
done

require_browser
require_command jq
require_command file

[[ "${url,,}" =~ ^https?:// ]] || { echo "factory-create: only http(s) URLs are supported" >&2; exit 2; }
case "${url,,}" in
	*localhost*|*127.0.0.1*|*0.0.0.0*|*\.local*)
		echo "factory-create: localhost/private addresses are not valid reference URLs" >&2
		exit 2
		;;
esac

if [[ -z "$slug" ]]; then
	slug=$(slug_from_url "$url")
fi
[[ "$slug" =~ ^[a-z0-9-]+$ ]] || { echo "factory-create: slug must be [a-z0-9-]" >&2; exit 2; }

refs_dir="$repo_root/references/$slug"
export BROWSER_WAIT_MS=${BROWSER_WAIT_MS:-1500}
export BROWSER_TIMEOUT_MS=${BROWSER_TIMEOUT_MS:-120000}

echo "Factory create: $url -> references/$slug/"

mkdir -p "$refs_dir"
cat > "$refs_dir/source.md" <<EOF
# Reference: $slug

- Source URL: $url
- Captured by: factory-create
- Date: $(date -u +%Y-%m-%dT%H:%M:%SZ)
EOF

echo "Step 1: detailed capture"
"$repo_root/tools/browser/capture-site.sh" "$url" "$refs_dir"

echo "Step 2: design signals"
"$repo_root/tools/factory/extract-design-signals.sh" "$url" "$refs_dir/design-signals.json"

echo "Step 3: replication brief"
"$repo_root/tools/factory/generate-replication-brief.sh" "$slug" "$refs_dir" "$refs_dir/replication-brief.md"

echo "Step 4: site scaffold (optional)"
echo "Run: pnpm factory:scaffold $slug <template>"
echo "Templates:"
ls "$repo_root/sites/templates" 2>/dev/null | sed 's/^/  /' || echo "  (none yet)"

echo
echo "Factory create complete: $refs_dir"
find "$refs_dir" -maxdepth 1 -type f -printf '  %f\n' | sort
