#!/usr/bin/env bash
# Create a mission in .factory/missions/.
# Usage: mission-create.sh --title "Replicate Stripe Landing" [--agent codex] [--steps "Capture,Design Signals,Scaffold,Browser Verify,Live Audit"]
set -euo pipefail

factory_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$factory_dir/mission-lib.sh"

title=""
agent="codex"
steps_csv="Capture,Design Signals,Scaffold,Browser Verify,Live Audit"
while [[ $# -gt 0 ]]; do
  case "$1" in
    --title) title=$2; shift 2 ;;
    --agent) agent=$2; shift 2 ;;
    --steps) steps_csv=$2; shift 2 ;;
    *) echo "mission-create: unknown arg $1" >&2; exit 2 ;;
  esac
done
[[ -n "$title" ]] || { echo "Usage: mission-create.sh --title TITLE [--agent AGENT] [--steps CSV]" >&2; exit 2; }

mkdir -p "$missions_dir"
id=$(mission_next_id)
now=$(date -u +%Y-%m-%dT%H:%M:%SZ)
IFS=',' read -r -a steps <<< "$steps_csv"
objects=()
for step in "${steps[@]}"; do
  clean=$(printf '%s' "$step" | sed 's/^[[:space:]]*//; s/[[:space:]]*$//')
  objects+=("{\"label\":\"$clean\",\"time\":\"\"}")
done
steps_json=$(printf '[%s]' "$(IFS=,; echo "${objects[*]}")")

cat > "$missions_dir/$id.json" <<EOF_MISSION
{
  "id": "$id",
  "title": "$title",
  "status": "queued",
  "agent": "$agent",
  "created_at": "$now",
  "updated_at": "$now",
  "steps": $steps_json
}
EOF_MISSION
echo "mission-create: wrote $missions_dir/$id.json"
echo "Mission: $id — $title (agent=$agent, status=queued)"
mission_sync_state
