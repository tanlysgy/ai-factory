#!/usr/bin/env bash

# Ranks a reference website for replication potential.
# Usage: rank-reference.sh <url> [--slug NAME] [--skip-capture]
#
# Reuses the factory capture + design-signals pipeline, then analyzes the
# artifacts to decide "should we replicate this website?".

set -euo pipefail

factory_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
repo_root="$(cd "$factory_dir/../.." && pwd)"
source "$factory_dir/factory-lib.sh"

usage() {
	cat >&2 <<'EOF'
Usage: rank-reference.sh <url> [--slug NAME] [--skip-capture]

Analyzes a captured reference and writes:
  references/<slug>/reference-analysis.md

Controls:
  BROWSER_WAIT_MS       settle time (default 1500)
  BROWSER_TIMEOUT_MS    capture timeout (default 120000)
EOF
	exit 2
}

[[ $# -ge 1 ]] || usage
url=$1
slug=""
skip_capture=0
shift

while [[ $# -gt 0 ]]; do
	case "$1" in
		--slug)
			[[ $# -ge 2 ]] || usage
			slug=$2
			shift 2
			;;
		--skip-capture)
			skip_capture=1
			shift
			;;
		*)
			usage
			;;
	esac
done

require_browser
require_command jq
require_command file

if [[ -z "$slug" ]]; then slug=$(slug_from_url "$url"); fi
refs_dir="$repo_root/references/$slug"

if [[ "$skip_capture" -eq 1 && -d "$refs_dir" ]]; then
	echo "Reusing existing capture at $refs_dir"
else
	echo "Running capture pipeline for $url"
	"$repo_root/tools/factory/factory-create.sh" "$url" --slug "$slug"
fi

signals="$refs_dir/design-signals.json"
html="$refs_dir/index.html"
[[ -f "$signals" ]] || { echo "rank-reference: $signals missing" >&2; exit 1; }
[[ -f "$html" ]] || { echo "rank-reference: $html missing" >&2; exit 1; }

title=$(jq -r '.title // "Untitled"' "$signals")
sections=$(jq '[.sections[] | select(.tag == "section" or .tag == "header" or .tag == "footer")] | length' "$signals")
ctas=$(jq '.ctaPatterns | length' "$signals")
scroll=$(jq -r '.page.scrollHeight // 0' "$signals")
overflow=$(jq -r '.page.overflowX // false' "$signals")
colors=$(jq '.colors | length' "$signals")
fonts=$(jq '.typography.fontFamilies | length' "$signals")
shadows=$(jq '[.shadows[] | select(.[1] > 0)] | length' "$signals")
radii=$(jq '[.radius[] | select(.[1] > 0)] | length' "$signals")

html_lc=$(tr '[:upper:]' '[:lower:]' < "$html")
grep_pricing=0; grep_demo=0; grep_saas=0; grep_auth=0
echo "$html_lc" | rg -qi 'pricing|plans?|per month|subscribe|/month|enterprise' && grep_pricing=1 || true
echo "$html_lc" | rg -qi 'playground|demo|try it|terminal|screenshot|watch|interactive|mockup' && grep_demo=1 || true
echo "$html_lc" | rg -qi 'start free|free trial|book a demo|get started|sign ?up|login|request access' && grep_saas=1 || true
echo "$html_lc" | rg -qi 'log ?in|sign ?in|sign ?up|account|enterprise' && grep_auth=1 || true

desktop_png="$refs_dir/desktop.png"
screenshot_score=0
if [[ -f "$desktop_png" ]]; then
	size=$(stat -c %s "$desktop_png" 2>/dev/null || echo 0)
	if [[ "$size" -gt 150000 ]]; then screenshot_score=20
	elif [[ "$size" -gt 70000 ]]; then screenshot_score=14
	else screenshot_score=8; fi
fi

layout_score=0
if [[ "$scroll" -gt 15000 ]]; then layout_score=8
elif [[ "$scroll" -gt 7000 ]]; then layout_score=14
else layout_score=10; fi
[[ "$sections" -ge 6 ]] && layout_score=$((layout_score + 4)) || true

cta_score=0
if [[ "$ctas" -ge 8 ]]; then cta_score=12
elif [[ "$ctas" -ge 4 ]]; then cta_score=9
else cta_score=4; fi

visual_score=0
[[ "$colors" -ge 3 ]] && visual_score=$((visual_score + 5)) || true
[[ "$fonts" -ge 2 ]] && visual_score=$((visual_score + 4)) || true
[[ "$shadows" -ge 3 ]] && visual_score=$((visual_score + 4)) || true
[[ "$radii" -ge 3 ]] && visual_score=$((visual_score + 2)) || true

product_score=0
[[ "$grep_demo" -eq 1 ]] && product_score=$((product_score + 12)) || true
[[ "$overflow" == "false" ]] && product_score=$((product_score + 3)) || true
[[ "$grep_pricing" -eq 1 ]] && product_score=$((product_score + 5)) || true

market_score=0
[[ "$grep_saas" -eq 1 ]] && market_score=$((market_score + 8)) || true
[[ "$grep_auth" -eq 1 ]] && market_score=$((market_score + 4)) || true
[[ "$grep_pricing" -eq 1 ]] && market_score=$((market_score + 3)) || true

ai_score=0
echo "$html_lc" | rg -qi 'ai|llm|agent|assistant|automation|model|chat|suggest' && ai_score=6 || true

total=$((screenshot_score + layout_score + cta_score + visual_score + product_score + market_score + ai_score))
[[ "$total" -gt 100 ]] && total=100 || true

if [[ "$total" -ge 80 ]]; then
	decision="STRONG REPLICANT — capture and build now"
elif [[ "$total" -ge 60 ]]; then
	decision="GOOD REPLICANT — build if it fills a portfolio gap"
elif [[ "$total" -ge 40 ]]; then
	decision="WATCH — capture only, not a premium demo"
else
	decision="SKIP for replication"
fi

cat > "$refs_dir/reference-analysis.md" <<EOF
# Reference analysis — $slug

- URL: $url
- Title: $title
- Date: $(date -u +%Y-%m-%dT%H:%M:%SZ)
- Total score: $total / 100
- Decision: $decision

## Signals

| Signal | Value |
| --- | ---: |
| Screenshot quality | $screenshot_score / 20 |
| Layout complexity (scroll=${scroll}px, sections=${sections}) | $layout_score / 22 |
| CTA clarity (${ctas} CTAs) | $cta_score / 12 |
| Visual system (colors=${colors}, fonts=${fonts}, shadows=${shadows}, radii=${radii}) | $visual_score / 15 |
| Product demo presence | $product_score / 20 |
| SaaS market signals (pricing=$grep_pricing, auth=$grep_auth, saas=$grep_saas) | $market_score / 15 |
| AI enhancement signal | $ai_score / 6 |

## Checks

- Horizontal overflow: $overflow
- Pricing section visible: $([ "$grep_pricing" -eq 1 ] && echo yes || echo no)
- Interactive/product demo signal: $([ "$grep_demo" -eq 1 ] && echo yes || echo no)
- Login/signup present: $([ "$grep_auth" -eq 1 ] && echo yes || echo no)

## Recommendation

$decision

Run pnpm factory:create with this URL for the full capture if not already
present.
EOF

echo "Reference analysis written to $refs_dir/reference-analysis.md"
echo "score=$total decision=$decision"
