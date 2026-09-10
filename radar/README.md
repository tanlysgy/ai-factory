# Demand Radar — Operator Manual

> This is a **decision system**, not a dashboard. It helps a human systematically
> find and validate business opportunities using evidence. The human decides;
> AI assists.

## What this repo is

Evidence-as-code: every decision lives in git-tracked Markdown + YAML frontmatter.
Git is the version control *and* the audit log. No database, no API, no crawlers.

```
Seed → Research → Evidence → Candidate Demand → Opportunity → Score → Human Decision → Experiment
```

## Directory layout

```
radar/
├── README.md            ← this file
├── seeds/               ← one file per starting point (persona / scenario / pain)
├── keywords/            ← candidate demand keywords (optional, freeform)
├── opportunities/       ← one file per opportunity (frontmatter + narrative)
├── evidence/            ← one file per piece of evidence (the source of truth)
├── experiments/         ← one file per experiment (a bet we ran)
├── templates/           ← copy these when creating new items
└── engine/              ← pure-function score engine (score.mjs + test)
```

## The 10-step cycle

1. **Create a Seed** — copy `templates/seed-template.md` → `seeds/seed-{nnn}-{slug}.md`.
   A seed is a persona/scenario/pain start point. Hypotheses are *hypotheses*, not facts.
2. **Research the seed** — human research (browser, chat, docs, whatever is legitimate).
   No crawlers, no paid APIs. Note sources, URLs, dates, and **facts vs interpretation**.
3. **Record Evidence** — for each observation, copy `templates/evidence-template.md`
   → `evidence/ev-{yymmdd}-{seq}.md`. Every claim gets: source, url, captured_at,
   observation (fact), interpretation (AI/user reading, marked), reliability, freshness.
   Keep the raw snippet. **Never** store a claim without its source URL.
4. **Form Candidate Demands** — group evidence by recurring pains/needs that keep firing.
   A candidate demand is a real pattern backed by ≥1 evidence; do not manufacture one.
5. **Form Opportunity** — when a pattern is coherent, copy
   `templates/opportunity-template.md` → `opportunities/opp-{nnn}-{slug}.md`.
   Fill signals honestly: `Unknown` / `Not Collected` / `Conflicting` are acceptable answers.
   Link `evidence_ids` (the exact filenames in `evidence/`).
6. **Run Score** — `node radar/engine/score.mjs radar/opportunities/opp-{nnn}-{slug}.md`.
   This is a **pure function**: same file → same score + confidence + coverage.
   Record the output in the opportunity frontmatter (`score_raw`, `score_label`, `confidence`, `coverage`).
7. **Human Review** — read the score *and* the evidence. Decide out loud: Build / Watch /
   Reject / Need More Evidence. Update `decision` + `why` in the opportunity file.
   If the evidence is thin or contradicts, **lower** the confidence or mark Not Collected.
8. **Create Experiment** — copy `templates/experiment-template.md`
   → `experiments/exp-{nnn}-{slug}.md`, linked to the opportunity. Minimal form:
   landing page / waitlist / fake door / manual service. State hypothesis + expected signal *before* running.
9. **Record Results** — observed signal (real numbers only), result, decision:
   Continue / Pivot / Kill / Productize. Never decide automatically.
10. **Next round** — if nothing in a seed is worth betting on, that IS a successful outcome
    (the radar saved your time). Pick the next seed or revisit with new evidence.

## Rules that keep this honest

- **Score is not science.** Output is `Score (0–100, bucketed) + Confidence (Low/Medium/High) + Evidence Coverage (x/8)`.
  Missing/conflicting evidence caps confidence. No decimals, no fake precision.
- **"Low competition" ≠ "good opportunity"** and **"high search" ≠ "commercial value"**.
  Both can be false signals.
- **No crawlers / no paid data / no scraping.** V1 research is human. If a step repeats
  dozens of times weekly, record it as an *Automation Candidate* in the README's automation notes —
  do not build it yet.
- **Evidence is first-class.** Every opportunity point is traceable (≤2 clicks) to a raw source.
  AI-generated interpretation is marked `ai_generated: true`.
- **Human decides.** AI never picks "build" for us. Kill is a win — it frees budget.

## Automation Candidates (parked, not built)

_none yet_ — add entries here only when a step is repeated dozens of times/week.

## How a future agent continues

1. Read `README.md` of the repo root + `handoff.md` (state, no secrets).
2. Read this file. Check `radar/` state (`git log --oneline -- radar/`).
3. Read a Seed → collect evidence → update/create opportunities → run score → ask the human to decide.
4. Never invent evidence. Every `evidence` file must have a real source URL and `captured_at`.
5. Keep it minimal: no databases, no dashboards, no crawlers, no SaaS-ifying.

## Change log

- 2026-09-10 — M1 Phase 1: created this repository skeleton, templates, pure score engine (v1).
- 2026-09-10 — **First dogfood cycle for seed-001** (Linux/WSL AI coding-agent workflow): collected 8 real evidence items (HN + GitHub API, human-first research), formed first opportunity `opp-001` (agent session/context workflow tooling), ran score → `Score 41 (Watch) | Confidence low | Coverage 6/8`. No paid-money signal found; competition heavy. Awaiting human decision (Build/Watch/Reject/Need More Evidence). See `evidence/` and `opportunities/opp-001-…md`.