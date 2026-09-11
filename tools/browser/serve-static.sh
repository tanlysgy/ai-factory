#!/usr/bin/env bash

# Serves a static site folder for preview.
# Usage: serve-static.sh <site-directory> [port]

set -euo pipefail

[[ $# -ge 1 ]] || { echo "Usage: serve-static.sh <site-directory> [port]" >&2; exit 2; }
site_dir=$1
port=${2:-${PREVIEW_PORT:-4399}}

[[ -f "$site_dir/index.html" ]] || { echo "serve-static: $site_dir/index.html not found" >&2; exit 1; }

if curl --silent --show-error --fail --max-time 2 "http://127.0.0.1:$port/" >/dev/null 2>&1; then
	echo "serve-static: port $port already serving a site; reuse it or choose another port" >&2
	exit 1
fi

echo "Serving $site_dir at http://127.0.0.1:$port"
exec python3 -m http.server "$port" --directory "$site_dir"
