---
id: exp-001
slug: cost-reduction-fake-door
opportunity_id: opp-001
status: draft                          # draft | launched | running | concluded | killed
type: fake_door
hypothesis: >-
  Heavy AI coding-agent users care more about reducing wasted API/context cost
  than about organizing sessions, and will signal interest in a local-first
  context-reduction tool rather than a session manager.
expected_signal:
  metric: form_submit events (console-only — not countable in production, no analytics by design)
  target: 0                            # honest expected value: qualitative signal, not numbers
  window: "7 days"
method: >-
  Single landing page at /experiments/cost-reduction inside the existing Astro site.
  Copy is grounded in opp-001 evidence themes (rebuilding context, repeated sends,
  unexpected bills, DIY workarounds). Client-side console-only track() events for
  cta_click and form_submit. Fake-door form: email + optional frustration, thank-you
  state, no backend, no storage, no analytics, no network requests. Page explicitly
  framed as a validation experiment with an honesty note.
created_at: "2026-09-10"
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

# Experiment exp-001: cost-reduction fake door

## Hypothesis

Heavy AI coding-agent users care more about reducing wasted API/context cost than
about organizing sessions, and will signal interest in a local-first context-reduction
tool rather than a session manager.

## Expected signal

- metric: `form_submit` events (console-only — not countable in production, no analytics by design)
- target: 0 (honest — qualitative engagement signal, not numbers)
- window: 7 days

## Method

Single landing page at `/experiments/cost-reduction` inside the existing Astro site.
Copy is grounded in opp-001 evidence themes (rebuilding context, repeated sends,
unexpected bills, DIY workarounds). Client-side console-only `track()` events for
`cta_click` and `form_submit`. Fake-door form: email + optional frustration, thank-you
state, no backend, no storage, no analytics, no network requests. Page explicitly
framed as a validation experiment with an honesty note.

## Observed signal

_filled after running: numbers + narrative, real data only_

## Result & decision

- **Result:** ...
- **Decision:** ...
- **Why:** ...

## Evidence

- radar/opportunities/opp-001-context-light-agent-session-workflow-tools.md
- radar/evidence/ev-260910-01.md (multi-session costs/conflicts/context loss)
- radar/evidence/ev-260910-07.md (context-window cost aversion)
