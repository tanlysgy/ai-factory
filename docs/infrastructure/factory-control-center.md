# AI Factory Command Center

The Command Center turns AI Factory from a set of command-line tools into a
visual operating view. It is NOT a SaaS dashboard: there is no database, no
auth, no analytics, and no external service. Everything renders from a single
JSON state file.

## Task flow

```
Task
 ↓
Research
 ↓
Build
 ↓
Test
 ↓
Deploy
 ↓
Memory Update
```

## Single source of truth

`.factory/state.json` is the only state file. It is generated from repository
truth (files, experiments, sites, memory) by:

```
pnpm factory:state:sync
```

Repository facts scanned automatically:

- `radar/experiments/*.md` → experiment list and status
- `sites/*/` → generated site list
- `.agent/memory/*.md` → memory files and lesson count
- `.factory/tasks/*.json` → queued/running/completed tasks

Manual overlay lives in `.factory/overlay.json` (preview URLs, deployed
status, references) so repository facts always stay authoritative.

## Task format

A task is a JSON file in `.factory/tasks/`:

```json
{
  "type": "website-replication",
  "reference": "https://example.com/",
  "style": "copy-ui",
  "deploy": true
}
```

Create a task:

```
pnpm factory:task:create --type website-replication --reference https://example.com/ --style copy-ui --deploy
```

Complete a task (writes a lesson automatically):

```
pnpm factory:task:complete .factory/tasks/<id>.json --lesson-title "..." --outcome success|fail --pattern "..."
```

## Memory loop

After every experiment/task completes, a lesson file is written to
`.agent/memory/lesson-XXX-<slug>.md`:

- outcome: success|fail
- source: task/experiment id
- reusable pattern

The Command Center's memory panel shows these lessons live.

## Dashboard

`/factory/` renders the state file into:

- running tasks
- generated websites + preview URLs
- experiment count and status
- memory status (files + lessons)
- task flow

Command Center is a public operating view. It shows the truth of the factory:
what has been verified, what is running, and what was learned.

## Verification

```
pnpm test
pnpm build
```

Both must pass before any Command Center change ships.
