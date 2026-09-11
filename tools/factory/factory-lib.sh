#!/usr/bin/env bash

# Shared helpers for the AI Factory website pipeline.
# Intended to be sourced: source "$(dirname "$0")/factory-lib.sh"

factory_lib_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
repo_root="$(cd "$factory_lib_dir/../.." && pwd)"
browser_bin=${CODEX_BROWSER_BIN:-/home/sgy/.local/bin/codex-browser}
factory_proxy=${BROWSER_PROXY:-${HTTPS_PROXY:-${https_proxy:-}}}

require_command() {
	local name=$1
	if ! command -v "$name" >/dev/null 2>&1; then
		echo "factory: $name is required but was not found" >&2
		exit 1
	fi
}

require_browser() {
	[[ -x "$browser_bin" ]] || { echo "factory: Codex Browser not found at $browser_bin" >&2; exit 1; }
}

slugify() {
	local input=$1
	# Lowercase, keep [a-z0-9-], collapse repeated dashes, trim trailing dashes.
	printf '%s' "$input" \
		| tr '[:upper:]' '[:lower:]' \
		| sed -E 's#[^a-z0-9]+#-#g; s#^-+##; s#-+$##'
}

slug_from_url() {
	local url=$1
	local host
	host=$(printf '%s' "$url" | sed -E 's#https?://##; s#/.*$##; s#:[0-9]+$##')
	[[ -n "$host" ]] || { echo "factory: could not derive a hostname from $url" >&2; exit 2; }
	slugify "$host"
}

proxy_args() {
	if [[ -n "$factory_proxy" ]]; then
		printf '%s\n' "--proxy $factory_proxy"
	fi
}
