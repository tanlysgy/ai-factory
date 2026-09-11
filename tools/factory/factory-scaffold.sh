#!/usr/bin/env bash

# Creates a site scaffold from a reference and template.
# Usage: factory-scaffold.sh <slug> <template>
#
#
set -euo pipefail

factory_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
repo_root="$(cd "$factory_dir/../.." && pwd)"

usage() {
	cat >&2 <<'EOF'
Usage: factory-scaffold.sh <slug> <template>

Creates sites/<slug>/ from the matching template in sites/templates/.
Templates: saas-landing  ai-tool-landing  dashboard  seo-tool
EOF
	exit 2
}

[[ $# -eq 2 ]] || usage
slug=$1
template=$2

tmpl_dir="$repo_root/sites/templates/$template"
[[ -d "$tmpl_dir" ]] || { echo "factory-scaffold: unknown template '$template'. Available:"; ls "$repo_root/sites/templates/"; exit 1; }
[[ -d "$repo_root/sites/$slug" ]] && { echo "factory-scaffold: sites/$slug/ already exists" >&2; exit 1; }
[[ "$slug" =~ ^[a-z0-9-]+$ ]] || { echo "factory-scaffold: slug must be [a-z0-9-]" >&2; exit 2; }

cp -r "$tmpl_dir" "$repo_root/sites/$slug"
echo "Created sites/$slug/ from template '$template'"
echo ""
echo "Next steps:"
echo "  1. Edit sites/$slug/index.html — swap brand name, logo, colors, copy"
echo "  2. Edit sites/$slug/styles.css — update color tokens, fonts, spacing"
echo "  3. Preview: PREVIEW_PORT=4399 pnpm preview:static sites/$slug"
echo "  4. Browse: http://127.0.0.1:4399"
echo "  5. Tunnel: PREVIEW_PORT=4399 pnpm preview:tunnel"
