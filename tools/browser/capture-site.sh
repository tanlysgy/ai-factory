#!/usr/bin/env bash

set -euo pipefail

usage() {
	cat >&2 <<'EOF'
Usage: tools/browser/capture-site.sh URL OUTPUT_FOLDER

Captures a reference website with the local Codex Browser skill.
Optional environment variables:
  BROWSER_PROXY   Browser proxy URL. Defaults to HTTPS_PROXY/http_proxy when set.
  BROWSER_WAIT_MS Extra settle time after navigation. Defaults to 1000.
  BROWSER_TIMEOUT_MS Browser command timeout. Defaults to 30000.
EOF
	exit 2
}

[[ $# -eq 2 ]] || usage

url=$1
output_dir=$2
browser_bin=${CODEX_BROWSER_BIN:-/home/sgy/.local/bin/codex-browser}
proxy=${BROWSER_PROXY:-${HTTPS_PROXY:-${https_proxy:-}}}
wait_ms=${BROWSER_WAIT_MS:-1000}
timeout_ms=${BROWSER_TIMEOUT_MS:-30000}

[[ -n "$url" ]] || { echo "capture-site: URL is required" >&2; exit 2; }
[[ -x "$browser_bin" ]] || { echo "capture-site: Codex Browser not found at $browser_bin" >&2; exit 1; }
command -v jq >/dev/null 2>&1 || { echo "capture-site: jq is required" >&2; exit 1; }
command -v file >/dev/null 2>&1 || { echo "capture-site: file is required" >&2; exit 1; }

mkdir -p "$output_dir"
tmp_dir=$(mktemp -d)
trap 'rm -rf "$tmp_dir"' EXIT

browser_args=()
if [[ -n "$proxy" ]]; then
	browser_args+=(--proxy "$proxy")
fi

echo "Capturing $url"
echo "Output: $output_dir"

"$browser_bin" screenshot "$url" "$output_dir/full-page.png" \
	--full-page --wait "$wait_ms" --timeout "$timeout_ms" "${browser_args[@]}"
"$browser_bin" screenshot "$url" "$output_dir/desktop.png" \
	--viewport 1440x1000 --wait "$wait_ms" --timeout "$timeout_ms" "${browser_args[@]}"
"$browser_bin" screenshot "$url" "$output_dir/mobile.png" \
	--viewport 390x844 --wait "$wait_ms" --timeout "$timeout_ms" "${browser_args[@]}"

"$browser_bin" html "$url" --full-page --max-text 2000000 --wait "$wait_ms" \
	--timeout "$timeout_ms" "${browser_args[@]}" > "$tmp_dir/html.json"
jq -e '.html and (.html | type == "string")' "$tmp_dir/html.json" >/dev/null
jq -r '.html' "$tmp_dir/html.json" > "$output_dir/index.html"

metadata_js='() => {
  const count = (values) => Object.entries(values.reduce((map, value) => {
    if (value) map[value] = (map[value] || 0) + 1;
    return map;
  }, {})).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  const elements = [...document.querySelectorAll("*")];
  const styles = elements.map((element) => getComputedStyle(element));
  const colors = new Set();
  for (const style of styles) {
    for (const value of [style.color, style.backgroundColor, style.borderTopColor, style.borderRightColor, style.borderBottomColor, style.borderLeftColor]) {
      if (value && value !== "rgba(0, 0, 0, 0)" && value !== "transparent") colors.add(value);
    }
  }
  const cssAssets = [...new Set([
    ...[...document.querySelectorAll("link[rel=stylesheet][href]")].map((element) => element.href),
    ...performance.getEntriesByType("resource").filter((entry) => /\\.css(?:[?#]|$)/i.test(entry.name)).map((entry) => entry.name)
  ])].sort();
  return {
    capturedAt: new Date().toISOString(),
    title: document.title,
    url: location.href,
    viewport: { width: innerWidth, height: innerHeight },
    cssAssets,
    inlineStyleBlocks: document.querySelectorAll("style").length,
    colors: count([...colors]),
    typography: {
      fontFamilies: count(styles.map((style) => style.fontFamily)),
      fontSizes: count(styles.map((style) => style.fontSize)),
      fontWeights: count(styles.map((style) => style.fontWeight)),
      lineHeights: count(styles.map((style) => style.lineHeight))
    }
  };
}'

"$browser_bin" eval "$url" "$metadata_js" --viewport 1440x1000 --wait "$wait_ms" \
	--timeout "$timeout_ms" "${browser_args[@]}" > "$tmp_dir/metadata.json"
jq -e '.result and (.result | type == "object")' "$tmp_dir/metadata.json" >/dev/null
jq '.result' "$tmp_dir/metadata.json" > "$output_dir/metadata.json"
jq '.result.cssAssets' "$tmp_dir/metadata.json" > "$output_dir/css-assets.json"
jq -r '.result.cssAssets[]?' "$tmp_dir/metadata.json" > "$output_dir/css-assets.txt"
jq '.result.colors' "$tmp_dir/metadata.json" > "$output_dir/color-palette.json"
jq '.result.typography' "$tmp_dir/metadata.json" > "$output_dir/typography-summary.json"

cat > "$output_dir/README.md" <<EOF
# Browser capture

- Source URL: $url
- Captured: $(jq -r '.result.capturedAt' "$tmp_dir/metadata.json")
- Browser workflow: Codex Browser / Chromix

Files:

- full-page.png: full-page screenshot
- desktop.png: 1440x1000 viewport screenshot
- mobile.png: 390x844 viewport screenshot
- index.html: serialized HTML snapshot
- css-assets.json and css-assets.txt: discovered stylesheet resources
- color-palette.json: computed colors sorted by frequency
- typography-summary.json: computed typography values sorted by frequency
- metadata.json: capture metadata and the combined summaries
EOF

printf 'Capture complete: %s\n' "$output_dir"
find "$output_dir" -maxdepth 1 -type f -printf '%f\n' | sort
