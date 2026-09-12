#!/usr/bin/env bash

# Static browser verification for a site folder.
# Usage: test-site.sh <site-dir> [--port PORT]

set -euo pipefail

factory_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
repo_root="$(cd "$factory_dir/../.." && pwd)"
source "$factory_dir/factory-lib.sh"

usage() { echo "Usage: test-site.sh <site-dir> [--port PORT]" >&2; exit 2; }
[[ $# -ge 1 ]] || usage
browser_bin=${CODEX_BROWSER_BIN:-/home/sgy/.local/bin/codex-browser}
site_dir=$1
shift
port=""
while [[ $# -gt 0 ]]; do
	case "$1" in
		--port) port=$2; shift 2 ;;
		*) usage ;;
	esac
done
[[ -f "$site_dir/index.html" ]] || { echo "test-site: $site_dir/index.html missing" >&2; exit 1; }

if [[ -z "$port" ]]; then
	for candidate in 4410 4411 4412 4413 4414; do
		if ! ss -ltn 2>/dev/null | rg -q ":$candidate "; then
			port=$candidate
			break
		fi
	done
fi
[[ -n "$port" ]] || { echo "test-site: no free port available" >&2; exit 1; }

base="http://127.0.0.1:$port"
started_server=0
if ! curl --silent --show-error --fail --max-time 2 "$base/" >/dev/null 2>&1; then
	echo "test-site: starting temporary server on port $port"
	python3 -m http.server "$port" --directory "$site_dir" >/tmp/test-site-http.log 2>&1 &
	server_pid=$!
	started_server=1
	sleep 1
fi

echo "Testing $base (desktop + mobile)"
"$browser_bin" eval "$base/" '() => ({ title: document.title, h1: document.querySelector("h1")?.textContent.trim() || "", overflowX: document.documentElement.scrollWidth > document.documentElement.clientWidth, sections: document.querySelectorAll("section").length })' --wait 800 --viewport 1440x1000 --timeout 60000
"$browser_bin" eval "$base/" '() => ({ overflowX: document.documentElement.scrollWidth > document.documentElement.clientWidth, viewport: innerWidth + "x" + innerHeight, sections: document.querySelectorAll("section").length })' --wait 800 --viewport 390x844 --timeout 60000
echo "Testing $base (accessibility)"
"$browser_bin" eval "$base/" '() => {
  const images = [...document.querySelectorAll("img")];
  const noAlt = images.filter((img) => !img.hasAttribute("alt") && !img.getAttribute("aria-hidden")).length;
  const inputs = [...document.querySelectorAll("input")];
  const unlabeled = inputs.filter((input) => {
    const id = input.id;
    return !document.querySelector(`label[for="${id}"]`) && !input.getAttribute("aria-label") && !input.getAttribute("aria-labelledby");
  }).length;
  const buttons = [...document.querySelectorAll("button, a.button")];
  const empty = buttons.filter((el) => (el.textContent || "").trim() === "" && !el.getAttribute("aria-label")).length;
  return { noAlt, unlabeled, empty, lang: document.documentElement.lang || "missing" };
}' --wait 800 --viewport 1440x1000 --timeout 60000
echo "test-site: desktop and mobile checks passed"

if [[ "$started_server" -eq 1 ]]; then
	kill "$server_pid" 2>/dev/null || true
	sleep 0.3
	echo "test-site: temporary server stopped"
fi
