#!/usr/bin/env bash

set -euo pipefail

repo_root=$(git rev-parse --show-toplevel)
port=${PREVIEW_PORT:-4321}
mode=${PREVIEW_TUNNEL_MODE:-quick}
tunnel_name=${PREVIEW_TUNNEL_NAME:-xiaoxin-linux}
cloudflared_bin=${CLOUDFLARED_BIN:-cloudflared}
started_dev=0
dev_pid=""

command -v "$cloudflared_bin" >/dev/null 2>&1 || {
	echo "preview-tunnel: cloudflared is required but was not found" >&2
	exit 1
}

cleanup() {
	if [[ "$started_dev" -eq 1 ]]; then
		(cd "$repo_root" && pnpm exec astro dev stop >/dev/null 2>&1 || true)
		if [[ -n "$dev_pid" ]]; then
			for _ in $(seq 1 10); do
				kill -0 "$dev_pid" 2>/dev/null || break
				sleep 0.2
			done
			if kill -0 "$dev_pid" 2>/dev/null; then
				kill "$dev_pid" 2>/dev/null || true
				for _ in $(seq 1 10); do
					kill -0 "$dev_pid" 2>/dev/null || break
					sleep 0.2
				done
			fi
			if kill -0 "$dev_pid" 2>/dev/null; then
				kill -KILL "$dev_pid" 2>/dev/null || true
			fi
		fi
	fi
}
trap cleanup EXIT INT TERM

if curl --silent --show-error --fail --max-time 2 "http://127.0.0.1:$port/" >/dev/null 2>&1; then
	echo "Using the existing local server at http://127.0.0.1:$port"
else
	echo "Starting Astro development server on port $port"
	(cd "$repo_root" && pnpm exec astro dev --background --host 127.0.0.1 --port "$port")
	started_dev=1
	dev_pid=$(pnpm exec astro dev status 2>/dev/null | sed -n 's/.*pid \([0-9][0-9]*\).*/\1/p' | head -1)
	for _ in $(seq 1 30); do
		if curl --silent --show-error --fail --max-time 2 "http://127.0.0.1:$port/" >/dev/null 2>&1; then
			break
		fi
		sleep 1
	done
	if ! curl --silent --show-error --fail --max-time 2 "http://127.0.0.1:$port/" >/dev/null 2>&1; then
		echo "preview-tunnel: Astro did not become ready at http://127.0.0.1:$port" >&2
		exit 1
	fi
fi

case "$mode" in
	quick)
		echo "Starting Cloudflare Quick Tunnel for http://127.0.0.1:$port"
	"$cloudflared_bin" tunnel --url "http://127.0.0.1:$port"
		;;
	named)
	config=${CLOUDFLARED_CONFIG:-$HOME/.cloudflared/config.yml}
	[[ -f "$config" ]] || { echo "preview-tunnel: named mode needs $config" >&2; exit 1; }
	echo "Starting named Cloudflare Tunnel '$tunnel_name'"
	echo "The public hostname is controlled by the tunnel's Cloudflare ingress configuration."
	"$cloudflared_bin" --config "$config" tunnel run "$tunnel_name"
		;;
	*)
		echo "preview-tunnel: PREVIEW_TUNNEL_MODE must be quick or named" >&2
		exit 2
		;;
esac
