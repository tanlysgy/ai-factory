---
# Opportunity template — copy to opportunities/opp-{nnn}-{slug}.md
#
# An Opportunity summarizes a coherent pattern backed by evidence.
# Missing signals are honest answers: Unknown / Not Collected / Conflicting.

id: opp-000-template
slug: template
title: "TODO: short opportunity title"
status: draft                          # draft | candidate | watch | build | rejected | killed
seed_id: seed-000-template
evidence_ids: []                      # filenames in evidence/, e.g. ["ev-260910-01.md"]
keywords: []                          # optional, candidate demand keywords
competitors: []                       # optional, names/urls that validate or refute

# Signal snapshots (0=none,1=weak,2=strong) — score engine reads these
signals:
  - search: 0                            # 0..2, 0 = unknown/not collected
  - money: 0
  - pain: 0
  - paid_replacement: 0
  - competition: 0
  - build_feasibility: 0
  - founder_fit: 0
  - acquisition: 0

score_raw: 0                          # output of: node radar/engine/score.mjs <this file>
score_label: "Low"                    # Low | Watch | Candidate | Strong Candidate (engine output)
confidence: low|medium|high
coverage: "0/8"

problem: "TODO: the problem in one sentence"
target_user: "TODO: who has this problem"
next_experiment: null                 # or experiment id

# Human decision (filled by a human, never by the engine)
decision: null                        # build | watch | reject | need_more_evidence
decision_date: null
why: null
---

# Opportunity {id}: {title}

## Problem

TODO one sentence.

## Target user

TODO.

## Signal snapshots

| signal | value | notes |
|---|---|---|
| Search | 0 | ... |
| Money | 0 | ... |
| Pain | 0 | ... |
| Paid replacement | 0 | ... |
| Competition | 0 | ... |
| Build feasibility | 0 | ... |
| Founder fit | 0 | ... |
| Acquisition | 0 | ... |

## Evidence chain (why AI/user think this is worth considering)

For each signal, list the evidence file(s) that support it. Unknown/Not Collected
must stay empty or explicitly marked, not guessed.

## Risks

- ...
- ...

## Human decision

- **Decision:** _filled by human on {date}_
- **Why:** _one sentence_

## Next experiment

- _link to experiment when created_