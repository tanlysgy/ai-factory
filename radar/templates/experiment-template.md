---
# Experiment template — copy to experiments/exp-{nnn}-{slug}.md
#
# An Experiment is a cheap bet on an Opportunity. Hypothesis + expected signal
# are written BEFORE running. Result + decision AFTER. Real numbers only.

id: exp-000-template
slug: template
opportunity_id: opp-000-template
status: draft                          # draft | launched | running | concluded | killed
type: landing|demo|manual_service|fake_door|waitlist
hypothesis: "TODO: a falsifiable statement, e.g. 'x personas will click through because y'"
expected_signal:
  metric: "TODO which number"          # visitors / clicks / emails / payments / ...
  target: 0                            # honest expected value
  window: "7 days"
method: "TODO: what exactly we will do (one paragraph)"
created_at: "YYYY-MM-DD"
launched_at: null
concluded_at: null

# Filled in AFTER the experiment (real data only)
observed_signal: null                  # description of what actually happened
observed_numbers:
  metric: null
  value: null
result: null                           # continuous | iterate | kill | productize | inconclusive
decision: null                         # continue | pivot | kill | productize
decision_why: null
cost_hours: 0
---

# Experiment {id}: {title}

## Hypothesis

TODO one falsifiable sentence.

## Expected signal

- metric: ...
- target: ...
- window: ...

## Method

TODO.

## Observed signal

_filled after running: numbers + narrative, real data only_

## Result & decision

- **Result:** ...
- **Decision:** ...
- **Why:** ...

## Evidence

- links to evidence files