#!/usr/bin/env bash
# Start a queued mission.
# Usage: mission-start.sh <mission-id>
set -euo pipefail
factory_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$factory_dir/mission-lib.sh"
id=$1
[[ -f "$missions_dir/$id.json" ]] || { echo "Mission $id not found" >&2; exit 1; }
mission=$(cat "$missions_dir/$id.json")
status=$(jq -r '.status' <<<"$mission")
[[ "$status" == "queued" || "$status" == "blocked" ]] || { echo "Cannot start mission in status '$status'" >&2; exit 1; }
next=$(jq '.status = "running"' <<<"$mission")
mission_set "$id" "$next"
mission_sync_state
echo "mission-start: $id — status=running"
