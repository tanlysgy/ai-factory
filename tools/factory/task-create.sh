#!/usr/bin/env bash
# Create a factory task in .factory/tasks/.
# Usage: task-create.sh --type website-replication --reference <url> [--style copy-ui] [--deploy]
set -euo pipefail

factory_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
repo_root="$(cd "$factory_dir/../.." && pwd)"
cd "$repo_root"

type=""
reference=""
style="copy-ui"
deploy=false
while [[ $# -gt 0 ]]; do
  case "$1" in
    --type) type=$2; shift 2 ;;
    --reference) reference=$2; shift 2 ;;
    --style) style=$2; shift 2 ;;
    --deploy) deploy=true; shift ;;
    *) echo "task-create: unknown arg $1" >&2; exit 2 ;;
  esac
done
[[ -n "$type" && -n "$reference" ]] || { echo "Usage: task-create.sh --type TYPE --reference URL [--style STYLE] [--deploy]" >&2; exit 2; }

mkdir -p .factory/tasks
id="task-$(date -u +%Y-%m-%d-%H%M%S)-$RANDOM"
now=$(date -u +%Y-%m-%dT%H:%M:%SZ)
cat > ".factory/tasks/$id.json" <<EOF_TASK
{
  "id": "$id",
  "type": "$type",
  "reference": "$reference",
  "style": "$style",
  "deploy": $deploy,
  "status": "queued",
  "created": "$now",
  "updated": "$now"
}
EOF_TASK
echo "task-create: wrote .factory/tasks/$id.json"
echo "Task: $type $reference (style=$style deploy=$deploy)"
"$repo_root/tools/factory/state-sync.sh" >/dev/null && echo "state-sync: task visible in state.json"
