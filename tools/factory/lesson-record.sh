#!/usr/bin/env bash
# Memory loop: record a lesson after an experiment or task completes.
# Usage: lesson-record.sh --title TITLE --outcome success|fail --source SRC [--pattern PATTERN]
set -euo pipefail

factory_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
repo_root="$(cd "$factory_dir/../.." && pwd)"
cd "$repo_root"

title=""
outcome=""
source_id=""
pattern=""
while [[ $# -gt 0 ]]; do
  case "$1" in
    --title) title=$2; shift 2 ;;
    --outcome) outcome=$2; shift 2 ;;
    --source) source_id=$2; shift 2 ;;
    --pattern) pattern=$2; shift 2 ;;
    *) echo "lesson-record: unknown arg $1" >&2; exit 2 ;;
  esac
done
[[ -n "$title" && -n "$outcome" && -n "$source_id" ]] || {
  echo "Usage: lesson-record.sh --title TITLE --outcome success|fail --source SRC [--pattern PATTERN]" >&2
  exit 2
}
[[ "$outcome" == "success" || "$outcome" == "fail" ]] || { echo "lesson-record: outcome must be success or fail" >&2; exit 2; }

mkdir -p .agent/memory
n=$(ls .agent/memory/lesson-*.md 2>/dev/null | wc -l)
n=$((n + 1))
padded=$(printf '%03d' "$n")
slug=$(printf '%s' "$title" | tr '[:upper:]' '[:lower:]' | sed -E 's/[^a-z0-9]+/-/g; s/^-+//; s/-+$//' | cut -c1-48)
lesson_id="lesson-$padded-${slug:-untitled}"
now=$(date -u +%Y-%m-%dT%H:%M:%SZ)

cat > ".agent/memory/$lesson_id.md" <<EOF_LESSON
# lesson-$padded: $title

- outcome: $outcome
- source: $source_id
- date: $now

## what worked

- $source_id completed and was verified before recording this lesson.

## what failed

$([[ "$outcome" == "fail" ]] && echo "- See the experiment log; the approach did not meet the bar." || echo "- Nothing blocking observed.")

## reusable pattern

- ${pattern:-Verified completion is the gate for a new lesson; never record lessons from unverified work.}
EOF_LESSON

echo "memory-loop: wrote .agent/memory/$lesson_id.md"
"$repo_root/tools/factory/state-sync.sh" >/dev/null && echo "memory-loop: state refreshed"
