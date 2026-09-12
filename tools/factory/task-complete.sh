#!/usr/bin/env bash
# Mark a task complete and append a lesson to memory.
# Usage: task-complete.sh <task-json> [--lesson-title TITLE] [--outcome success|fail] [--pattern PATTERN]
set -euo pipefail

factory_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
repo_root="$(cd "$factory_dir/../.." && pwd)"
cd "$repo_root"

task_file=$1
shift
[[ -f "$task_file" ]] || { echo "task-complete: $task_file not found" >&2; exit 1; }

outcome="success"
lesson_title=""
pattern=""
while [[ $# -gt 0 ]]; do
  case "$1" in
    --lesson-title) lesson_title=$2; shift 2 ;;
    --outcome) outcome=$2; shift 2 ;;
    --pattern) pattern=$2; shift 2 ;;
    *) echo "task-complete: unknown arg $1" >&2; exit 2 ;;
  esac
done
[[ "$outcome" == "success" || "$outcome" == "fail" ]] || { echo "task-complete: outcome must be success or fail" >&2; exit 2; }

id=$(jq -r '.id' "$task_file")
ref=$(jq -r '.reference // "unknown"' "$task_file")
now=$(date -u +%Y-%m-%dT%H:%M:%SZ)
tmp=$(jq --arg status complete --arg now "$now" '.status=$status | .updated=$now | .completedAt=$now' "$task_file")
printf '%s\n' "$tmp" > "$task_file"
echo "task-complete: $id marked complete"

# lesson generation
if [[ -n "$lesson_title" ]]; then
  mkdir -p .agent/memory
  n=$(ls .agent/memory/lesson-*.md 2>/dev/null | wc -l)
  n=$((n + 1))
  slug=$(printf '%s' "$lesson_title" | tr '[:upper:]' '[:lower:]' | sed -E 's/[^a-z0-9]+/-/g; s/^-+//; s/-+$//' | cut -c1-48)
  padded=$(printf '%03d' "$n")
  lesson_id="lesson-$padded-${slug:-untitled}"
  cat > ".agent/memory/$lesson_id.md" <<EOF_LESSON
# lesson-$padded: $lesson_title

- outcome: $outcome
- source: $id
- date: $now

## what worked

- Task $id completed: $ref

## what failed

$([[ "$outcome" == "fail" ]] && echo "- See task log; $ref did not meet the bar." || echo "- Nothing blocking observed.")

## reusable pattern

- ${pattern:-Reuse the task template and verify with browser tests before declaring done.}
EOF_LESSON
  echo "lesson: wrote .agent/memory/$lesson_id.md"
fi

"$repo_root/tools/factory/state-sync.sh" >/dev/null && echo "state-sync: refreshed"
