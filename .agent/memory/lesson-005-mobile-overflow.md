# lesson-005: Mobile overflow is the most common silent defect

- outcome: fail
- source: p3-browser-pipeline
- date: 2026-09-12T08:50:00Z

## what worked

- Adding 390px mobile checks to the pipeline caught overflows before shipping.

## what failed

- Desktop-perfect pages shipped with horizontal scroll on mobile twice in a row.

## reusable pattern

- Always check horizontal overflow at 390px before declaring done.
- Automate the mobile check; humans forget it under deadline pressure.
