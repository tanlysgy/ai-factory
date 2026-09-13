#!/usr/bin/env bash
# Single source of truth sync: .factory/state.json
# Repository facts (experiments, sites, memory, lessons, tasks) are scanned by
# inspect-state.sh; deployment overlay (preview URLs / status / references)
# is carried forward from the previous state file and .factory/overlay.json.
set -euo pipefail

factory_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
repo_root="$(cd "$factory_dir/../.." && pwd)"
cd "$repo_root"

scan=$(tools/factory/inspect-state.sh)
[[ -f .factory/missions/mission-001.json ]] || mkdir -p .factory/missions
state_file=".factory/state.json"
prev='{}'
[[ -f "$state_file" ]] && prev=$(cat "$state_file")

# Merge each site with its previous record / manual overlay when present.
merged=$(jq -nc \
  --argjson scan "$scan" \
  --argjson prev "$prev" \
  --argjson overlay "$(cat .factory/overlay.json 2>/dev/null || printf '{}')" '
{
  factory: "ai-factory-command-center",
  version: 1,
  updated: $scan.updated,
  counts: $scan.counts,
  tasks: $scan.tasks,
  runningTasks: (($overlay.tasks // []) as $ot |
    if ($ot | length) > 0 then ($ot + $scan.runningTasks)
    else $scan.runningTasks end),
  sites: [ $scan.sites[] as $site |
    (($overlay.sites // []) | map(select(.id == $site.id))[0]) as $o |
    (($prev.sites // []) | map(select(.id == $site.id))[0]) as $p |
    $site + {
      status: ($o.status // $p.status // $site.status // "local"),
      previewUrl: ($o.previewUrl // $p.previewUrl // $site.previewUrl // ""),
      reference: ($o.reference // $p.reference // $site.reference // ""),
      category: ($o.category // $p.category // $site.category // "generated site")
    }
  ],
  experiments: $scan.experiments,
  memory: $scan.memory,
  lessons: $scan.lessons,
  missions: $scan.missions,
  runningAgents: $scan.runningAgents,
  launches: $scan.launches,
  lastSync: $scan.updated
}')

printf '%s\n' "$merged" > "$state_file"
echo "state-sync: $(jq -r '.updated' "$state_file") — $(jq -r '.counts.experiments' "$state_file") experiments, $(jq -r '.counts.sites' "$state_file") sites, $(jq -r '.counts.lessons' "$state_file") lessons, $(jq -r '.counts.tasks' "$state_file") tasks"
site_previews=$(jq '[.sites[] | select(.previewUrl != "")] | length' "$state_file")
echo "state-sync: $site_previews sites carry preview URLs"
