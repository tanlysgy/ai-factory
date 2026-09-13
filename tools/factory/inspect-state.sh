#!/usr/bin/env bash
# Inspect the AI Factory repository and print a JSON status object.
# No writes. Used by state-sync.sh and CI/agents.
set -euo pipefail
factory_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
repo_root="$(cd "$factory_dir/../.." && pwd)"
cd "$repo_root"

now=$(date -u +%Y-%m-%dT%H:%M:%SZ)
state_file=".factory/state.json"

# --- discover experiments ---
experiments=()
for f in radar/experiments/*.md; do
  [[ -e "$f" ]] || continue
  b=$(basename "$f" .md)
  # Prefer frontmatter title, fall back to the first H1 inside the file.
  name=""
  # Pick the first H1 that looks like an experiment title (contains
  # "Experiment", "exp-", or "P[0-9]"); skip placeholder lines.
  name=$(sed -nE '/^# /{s/^#+[[:space:]]*//;p}' "$f" | rg -m1 -i '^(experiment|exp-[0-9]|p[0-9])' | sed -E 's/[[:space:]]+$//' | tr -d '\r' || true)
  [[ -n "$name" ]] || name=$(sed -n '/^# /p' "$f" | head -1 | sed -E 's/^#+[[:space:]]*//' | tr -d '\r')
  [[ -n "$name" ]] || name=$b
  [[ -n "$name" ]] || name=$b
  case "$b" in
    exp-00[234]|exp-008) status=live ;;
    p[0-9]-*) status=shipped ;;
    *) status=research ;;
  esac
  experiments+=("{\"id\":\"$b\",\"name\":\"$name\",\"status\":\"$status\",\"href\":\"/radar/\"}")
done

# --- discover generated sites ---
sites=()
for d in sites/*/; do
  [[ -d "$d" ]] || continue
  slug=$(basename "$d")
  [[ "$slug" == "templates" ]] && continue
  name=$(sed -n '1s/^#[[:space:]]*//p' "$d/README.md" 2>/dev/null | tr -d '\r' || true)
  [[ -n "$name" ]] || name=$slug
  if jq -e --arg slug "$slug" '.sites[]? | select(.id == $slug)' "$state_file" >/dev/null 2>&1; then
    prev=$(jq -c --arg slug "$slug" '.sites[] | select(.id == $slug)' "$state_file")
    prev_status=$(jq -r '.status // "local"' <<<"$prev")
    prev_preview=$(jq -r '.previewUrl // ""' <<<"$prev")
    prev_ref=$(jq -r '.reference // ""' <<<"$prev")
    prev_cat=$(jq -r '.category // "generated site"' <<<"$prev")
  else
    prev_status=local; prev_preview=""; prev_ref=""; prev_cat="generated site"
  fi
  if [[ -z "$prev_ref" && -f "references/$slug/source.md" ]]; then
    prev_ref=$(sed -n 's/^- Source URL: //p' "references/$slug/source.md" | head -1)
  fi
  sites+=("{\"id\":\"$slug\",\"name\":\"$name\",\"category\":\"$prev_cat\",\"page\":\"/sites/$slug/\",\"previewUrl\":\"$prev_preview\",\"reference\":\"$prev_ref\",\"status\":\"$prev_status\",\"created\":\"$(stat -c %y "$d" 2>/dev/null | cut -d. -f1)\"}")
done

# --- memory files + lessons from .agent/memory/lesson-*.md ---
memories=(); lessons=(); lesson_count=0
for f in .agent/memory/*.md; do
  [[ -e "$f" ]] || continue
  b=$(basename "$f" .md)
  memories+=("$(basename "$f")")
  if [[ "$b" == lesson-* ]]; then
    lesson_count=$((lesson_count + 1))
    title=$(sed -n 's/^# //p' "$f" | head -1)
    outcome=$(sed -n 's/^- outcome: //p' "$f" | head -1)
    source=$(sed -n 's/^- source: //p' "$f" | head -1)
    pattern=$(sed -n '/^## reusable pattern/,/^## /p' "$f" | sed '1d;/^## /d;/^$/d;s/^- //' | head -1)
    [[ -n "$outcome" ]] || outcome=unknown
    worked=$(sed -n '/^## what worked/,/^## /p' "$f" | sed '1d;/^## /d;/^$/d;s/^- //' | head -2 | paste -sd ' ' -)
    failed=$(sed -n '/^## what failed/,/^## /p' "$f" | sed '1d;/^## /d;/^$/d;s/^- //' | head -2 | paste -sd ' ' -)
    lessons+=("$(jq -nc --arg id "$b" --arg title "$title" --arg outcome "$outcome" --arg pattern "$pattern" --arg source "$source" --arg worked "$worked" --arg failed "$failed" '{id:$id,title:$title,outcome:$outcome,pattern:$pattern,source:$source,worked:$worked,failed:$failed}')")
  fi
done

# --- tasks (from .factory/tasks/*.json) ---
tasks=(); running=(); task_count=0
for f in .factory/tasks/*.json; do
  [[ -e "$f" ]] || continue
  task_count=$((task_count + 1))
  tasks+=("$(jq -c '{id,type,reference,style,deploy,status,created,updated}' "$f")")
  if jq -e '.status == "running"' "$f" >/dev/null 2>&1; then
    running+=("$(jq -c '{id,type,reference,style,deploy,status,created,updated}' "$f")")
  fi
done

# --- missions (from .factory/missions/*.json) ---
missions=(); mission_count=0
for f in .factory/missions/mission-*.json; do
  [[ -e "$f" ]] || continue
  mission_count=$((mission_count + 1))
  missions+=("$(jq -c '.' "$f")")
done
running_agents=0
if [[ "$mission_count" -gt 0 ]]; then
  running_agents=$(printf '%s\n' "${missions[@]}" | jq -s '[.[] | select(.status == "running" or .status == "review") | .agent // "codex"] | unique | length' 2>/dev/null || echo 0)
fi

# --- launches (from launch/*/metadata.json) ---
launches=(); launch_count=0
for meta in launch/*/metadata.json; do
  [[ -e "$meta" ]] || continue
  slug=$(basename "$(dirname "$meta")")
  launch_count=$((launch_count + 1))
  ltitle=$(jq -r '.title // ""' "$meta")
  lcreated=$(jq -r '.created // ""' "$meta")
  lref=$(jq -r '.reference // ""' "$meta")
  lpreview=$(jq -r '.preview_url // ""' "$meta")
  lshot=""
  [[ -f "launch/$slug/screenshots/desktop-hero.png" ]] && lshot="launch/$slug/screenshots/desktop-hero.png"
  [[ -n "$lshot" ]] || lshot="launch/$slug/og-image.png"
  launches+=("$(jq -nc --arg slug "$slug" --arg title "$ltitle" --arg created "$lcreated" --arg reference "$lref" --arg preview "$lpreview" --arg shot "$lshot" '{slug:$slug,title:$title,created:$created,reference:$reference,previewUrl:$preview,screenshot:$shot}')")
done

jq -nc \
  --arg factory "ai-factory-command-center" \
  --arg updated "$now" \
  --argjson tasks "$(printf '[%s]\n' "$(IFS=,; echo "${running[*]}")" 2>/dev/null || echo '[]')" \
  --argjson tasklist "$(printf '[%s]\n' "$(IFS=,; echo "${tasks[*]}")" 2>/dev/null || echo '[]')" \
  --argjson exp "$(printf '[%s]\n' "$(IFS=,; echo "${experiments[*]}")" 2>/dev/null || echo '[]')" \
  --argjson sites "$(printf '[%s]\n' "$(IFS=,; echo "${sites[*]}")" 2>/dev/null || echo '[]')" \
  --argjson memories "$(printf '%s\n' "${memories[@]:-}" | jq -Rs 'split("\n") | map(select(length>0))' 2>/dev/null || echo '[]')" \
  --argjson lessons "$(printf '[%s]\n' "$(IFS=,; echo "${lessons[*]}")" 2>/dev/null || echo '[]')" \
  --argjson tasks_count "$task_count" \
  --argjson missions "$(printf '[%s]' "$(IFS=,; echo "${missions[*]}")" 2>/dev/null || echo '[]')" \
  --argjson running_agents "${running_agents:-0}" \
  --argjson launches "$(printf '[%s]' "$(IFS=,; echo "${launches[*]}")" 2>/dev/null || echo '[]')" \
  --argjson launch_count "$launch_count" \
  '{ factory: $factory, version: 1, updated: $updated, counts: { experiments: ($exp|length), sites: ($sites|length), memories: ($memories|length), lessons: ($lessons|length), tasks: $tasks_count, missions: ($missions|length), launches: $launch_count }, runningTasks: $tasks, tasks: $tasklist, sites: $sites, experiments: $exp, missions: $missions, runningAgents: $running_agents, memory: { status: "loaded", files: $memories }, lessons: $lessons, launches: $launches, lastSync: $updated }'
