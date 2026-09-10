---
# Evidence template — copy to evidence/ev-{yymmdd}-{seq}.md
#
# Every claim needs this. If there's no source URL, there's no evidence.
# observation = the fact (quote/numbers/what happened). interpretation = the reading (marked).

id: ev-000000-00
example: true                         # true for template/example files ONLY
opportunity_id: null                  # fill when attached; else leave null (seed-level evidence)
seed_id: seed-000-template            # which seed this came from
signal_type: search|money|pain|paid_replacement|competition|pricing|distribution|other
source: "TODO: name of the source / platform"
source_url: "https://..."             # REQUIRED — human-clickable original
source_type: official_api|public_page|manual_browser|user_provided|third_party|other
captured_at: "YYYY-MM-DD"
observation: >-
  TODO: the FACT. Quote the original text, paste the number, describe what actually exists.
  Keep the raw snippet. No interpretation here.
interpretation: >-
  TODO: what this fact suggests about demand/pain/money. Mark this as interpretation.
  It can be wrong.
ai_generated: false                   # true ONLY when an AI wrote the interpretation
reliability: low|medium|high          # how trustworthy is the source itself
freshness: recent|dated|stale         # recent <=30d, dated <=180d, stale >180d
conflicting_with: null                # or evidence id it contradicts
raw_snippet: |-
  TODO: raw quote / data paste (keep exactly, no editing)
---

# Evidence {id}: {signal_type} — {short topic}

## Observation (fact)

TODO — facts only, with source + date.

## Interpretation (reading)

TODO — what this suggests. Label as interpretation. It may be wrong.

## Confidence notes

- source reliability: ...
- freshness: ...
- conflicts: ...