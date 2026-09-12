# Experiment P6 — Factory Command Center

- Type: infrastructure / capability experiment
- Status: shipped
- Date: 2026-09-12

## Question

Can AI Factory graduate from command-line tooling to a visual operating view
without adding a database, auth, or external services?

## Hypothesis

A single JSON state file (`state.json`) plus static pre-rendering is enough to
run a public Command Center that shows the truth of the factory: tasks, sites,
experiments, memory, and lessons.

## Implementation

- `.factory/state.json` — the only source of truth.
- `.factory/tasks/*.json` — task queue (create/complete via CLI).
- `tools/factory/inspect-state.sh` — scans repository facts into JSON.
- `tools/factory/state-sync.sh` — merges facts with a small overlay into
  state.json (`--commit` optional).
- `tools/factory/task-create.sh` / `task-complete.sh` — queue lifecycle; task
  completion writes a lesson automatically (memory loop).
- `tools/factory/lesson-record.sh` — standalone memory-loop entry.
- `/factory/` — Command Center page, rendered from state.json via a Vite
  virtual module injected at build time (avoids cwd dependence).
- `src/lib/factory-state.test.ts` — state schema/count guards.

## What changed

- New dashboard page, state files, task runtime, memory-loop scripts, docs,
  and test coverage.
- Homepage navigation now links to the Command Center.
- No experiment page, API route, or radar engine was modified.

## Verification

- `pnpm test`: 77 pass / 0 fail.
- `pnpm build`: success (factory page prerendered).
- Browser checks: desktop 1440×1000 and mobile 390×844, no horizontal
  overflow; page renders 5 site cards, 12 experiments, 6 lessons, hero counts.

## Limitations

- Preview URLs are recorded manually in overlay.json; a future Pipeline step
  could write them automatically after each tunnel run.
- The task runner is offline by design: tasks are files, and "running" status
  is updated by agents/CLI, not by a daemon.
- Named-tunnel subdomain routing was not touched (requires user approval).

## No demand claim

This is an infrastructure capability experiment. It measures whether the
factory can operate and communicate its state; it makes no market claim.
