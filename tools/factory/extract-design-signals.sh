#!/usr/bin/env bash

# Extracts computed design signals from a rendered page using Codex Browser.
# Usage: extract-design-signals.sh URL OUTPUT_JSON

set -euo pipefail

source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/factory-lib.sh"

[[ $# -eq 2 ]] || { echo "Usage: extract-design-signals.sh URL OUTPUT_JSON" >&2; exit 2; }
require_browser
require_command jq

url=$1
output=$2
wait_ms=${BROWSER_WAIT_MS:-1500}
timeout_ms=${BROWSER_TIMEOUT_MS:-120000}

signals_js='() => {
  const elements = [...document.querySelectorAll("*")];
  const styles = elements.map((element) => getComputedStyle(element));
  const count = (values) => Object.entries(values.reduce((map, value) => {
    if (value && value !== "none" && value !== "rgba(0, 0, 0, 0)" && value !== "transparent" && value !== "0px") {
      map[value] = (map[value] || 0) + 1;
    }
    return map;
  }, {})).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 24);
  const rgb = (value) => {
    const match = value && value.match(/rgba?\(([^)]+)\)/);
    if (!match) return value;
    const parts = match[1].split(",").map((part) => part.trim());
    return parts.length === 4 && parts[3] !== "1" ? value : `rgb(${parts.slice(0, 3).join(", ")})`;
  };
  const colorCount = Object.entries(elements.reduce((map, element) => {
    const style = getComputedStyle(element);
    for (const key of ["color", "backgroundColor", "borderTopColor", "borderBottomColor"]) {
      const value = rgb(style[key]);
      if (value && !value.startsWith("rgba(") && value !== "rgb(0, 0, 0)") map[value] = (map[value] || 0) + 1;
    }
    return map;
  }, {})).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 24);
  const sections = [...document.querySelectorAll("header, nav, main, section, article, footer")]
    .map((element) => ({ tag: element.tagName.toLowerCase(), id: element.id || "", class: typeof element.className === "string" ? element.className : "", heading: element.querySelector("h1,h2,h3")?.textContent?.trim().slice(0, 100) || "" }))
    .filter((section) => section.heading || section.tag === "header" || section.tag === "footer")
    .slice(0, 40);
  const spacingDeltas = elements.map((element) => {
    const style = getComputedStyle(element);
    const size = (value) => { const num = parseFloat(value); return Number.isFinite(num) ? Math.round(num) : 0; };
    return [size(style.marginTop), size(style.paddingTop), size(style.marginBottom), size(style.paddingBottom)]
      .filter((value) => value > 0);
  }).flat().reduce((map, value) => { map[value] = (map[value] || 0) + 1; return map; }, {});
  const spacing = Object.entries(spacingDeltas).sort((a, b) => b[1] - a[1]).slice(0, 20);
  const ctas = [...document.querySelectorAll("a, button")].map((element) => {
    const text = element.textContent.trim().replace(/\s+/g, " ");
    const style = getComputedStyle(element);
    const classes = typeof element.className === "string" ? element.className : "";
    return { text: text.slice(0, 60), tag: element.tagName.toLowerCase(), classes: classes.slice(0, 80), style: { bg: rgb(style.backgroundColor), radius: style.borderRadius, border: style.borderTopColor } };
  }).filter((cta) => cta.text && cta.text.length <= 60).slice(0, 40);
  return {
    capturedAt: new Date().toISOString(),
    url: location.href,
    title: document.title,
    viewport: { width: innerWidth, height: innerHeight },
    page: { scrollHeight: document.documentElement.scrollHeight, overflowX: document.documentElement.scrollWidth > document.documentElement.clientWidth },
    colors: colorCount,
    typography: {
      fontFamilies: count(styles.map((style) => style.fontFamily)),
      fontSizes: count(styles.map((style) => style.fontSize)),
      fontWeights: count(styles.map((style) => style.fontWeight)),
      lineHeights: count(styles.map((style) => style.lineHeight))
    },
    spacing: spacing.map(([value, occurrences]) => ({ px: Number(value), occurrences })),
    radius: count(styles.map((style) => style.borderRadius)),
    shadows: count(styles.map((style) => style.boxShadow)),
    sections,
    ctaPatterns: ctas
  };
}'

tmp=$(mktemp)
trap 'rm -f "$tmp"' EXIT

echo "Extracting design signals from $url"
browser_args=()
if [[ -n "$factory_proxy" ]]; then browser_args+=(--proxy "$factory_proxy"); fi
"$browser_bin" eval "$url" "$signals_js" --viewport 1440x1000 --wait "$wait_ms" \
	--timeout "$timeout_ms" "${browser_args[@]}" > "$tmp"
jq -e '.result and (.result | type == "object")' "$tmp" >/dev/null
jq '.result' "$tmp" > "$output"
echo "Design signals written to $output"
