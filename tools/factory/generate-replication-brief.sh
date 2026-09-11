#!/usr/bin/env bash

# Generates a replication brief from a captured reference folder.
# Usage: generate-replication-brief.sh SLUG REFERENCES_DIR OUT_FILE

set -euo pipefail

[[ $# -eq 3 ]] || { echo "Usage: generate-replication-brief.sh SLUG REFERENCES_DIR OUT_FILE" >&2; exit 2; }

slug=$1
refs_dir=$2
out_file=$3

source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/factory-lib.sh"
require_command jq

[[ -f "$refs_dir/design-signals.json" ]] || { echo "generate-replication-brief: design-signals.json missing in $refs_dir" >&2; exit 1; }

signals="$refs_dir/design-signals.json"
title=$(jq -r '.title // "Untitled"' "$signals")
url=$(jq -r '.url // empty' "$signals")
page_height=$(jq -r '.page.scrollHeight // 0' "$signals")
overflow=$(jq -r '.page.overflowX // false' "$signals")
cta_labels=$(jq -r '[.ctaPatterns[].text] | unique | join(" | ")' "$signals" 2>/dev/null || echo "")
top_colors=$(jq -r '.colors[0:6] | map(.[0]) | join(", ")' "$signals" 2>/dev/null || echo "")
top_fonts=$(jq -r '.typography.fontFamilies[0:3] | map(.[0]) | join(", ")' "$signals" 2>/dev/null || echo "")
sections=$(jq -r '[.sections[] | "\(.tag)#\(.id) \(.heading)" | gsub(" +"; " ") | gsub("[[:space:]]+$"; "")] | .[0:12] | join("\n- ")' "$signals" 2>/dev/null || echo "")

site_type="Marketing landing page"
if grep -qiE 'login|sign ?in|pricing|plan' "$refs_dir/index.html" 2>/dev/null; then
  site_type="SaaS / AI tool landing page (with product/pricing signals)"
elif grep -qiE 'dashboard|analytics|stat|chart|metric' "$refs_dir/index.html" 2>/dev/null; then
  site_type="Dashboard-style tool page"
elif grep -qiE 'check|scanner|audit|analyzer|tool' "$refs_dir/index.html" 2>/dev/null; then
  site_type="SEO / utility tool page"
fi

cat > "$out_file" <<EOF
# Website Factory replication brief — $slug

## Reference

- URL: $url
- Page title: $title
- Detected type: $site_type

## Page structure

- Desktop page height: ${page_height}px
- Horizontal overflow: $overflow
- Main sections:

- $sections

## Core components

- **Header / navigation**: sticky or static nav with logo, links, and CTA.
- **Hero**: primary headline, subcopy, and a high-visibility CTA.
- **Body sections**: feature/card grids that preserve spacing and hierarchy.
- **CTA patterns**: $cta_labels
- **Footer**: navigation and legal/notes block.

## Visual system

- Colors (top): $top_colors
- Typography (top): $top_fonts
- See design-signals.json for full spacing, radius, shadow, and section data.

## Independent recreation rules

- Recreate layout, hierarchy, spacing, typography, and color relationships only.
- Do not copy logos, proprietary illustrations, marketing copy, screenshots,
  source code, tracking scripts, or third-party private assets.
- Replace brand identity with a fictional name and original placeholder copy.

## Reusable open-source project suggestions

- Static marketing / landing: Astro (current stack) or plain HTML/CSS/JS.
- Tailwind CSS for rapid, token-driven styling when a component system is
  useful.
- SVG/feGaussianBlur or CSS gradients for geometric hero visuals (no proprietary
  images).
- lucide (or tabler) icons when icon sets are needed — MIT licensed.
- For functional demos only: small self-contained JS; avoid SaaS or analytics
  dependencies.

## Adapters / templates

Pick the closest template in sites/templates/:

- saas-landing
- ai-tool-landing
- dashboard
- seo-tool

Then replace brand tokens, colors, sections, and copy before committing.
EOF

echo "Replication brief written to $out_file"
