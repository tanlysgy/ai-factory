#!/usr/bin/env bash
# Shared helpers for the AI Factory Mission Runtime.
# Source: source "$(dirname "$0")/mission-lib.sh"
set -euo pipefail

factory_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
repo_root="$(cd "$factory_dir/../.." && pwd)"
missions_dir="$repo_root/.factory/missions"
state_file="$repo_root/.factory/state.json"

mission_status_valid() {
	case "$1" in
		queued|running|review|completed|blocked) return 0 ;;
		*) return 1 ;;
	esac
}

mission_next_id() {
	# mission-001, mission-002, ...
	local max=0
	for f in "$missions_dir"/mission-*.json; do
		[[ -e "$f" ]] || continue
		local n
		n=$(basename "$f" .json | sed -E 's/^mission-0*//')
		[[ "$n" =~ ^[0-9]+$ ]] && [[ "$n" -gt "$max" ]] && max=$n
	done
	printf 'mission-%03d' $((max + 1))
}

mission_get() {
	local id=$1
	cat "$missions_dir/$id.json"
}

mission_set() {
	local id=$1
	local next=$2
	local now
	now=$(date -u +%Y-%m-%dT%H:%M:%SZ)
	printf '%s\n' "$next" | jq --arg now "$now" '.updated = $now' > "$missions_dir/$id.tmp"
	mv "$missions_dir/$id.tmp" "$missions_dir/$id.json"
}

mission_sync_state() {
	# Delegate to the authoritative sync: rescans experiments/sites/missions/
	# lessons/tasks and carries the preview overlay forward.
	"$repo_root/tools/factory/state-sync.sh" >/dev/null
	echo "mission: state synced — $(jq -r '.counts.missions // 0' "$state_file") missions, $(jq -r '.counts.lessons // 0' "$state_file") lessons"
}
