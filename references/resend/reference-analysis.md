# Reference analysis — resend

- URL: https://example.com/resend
- Title: Resend · Email for developers
- Date: 2026-09-12T01:06:50Z
- Total score: 68 / 100
- Decision: GOOD REPLICANT — build if it fills a portfolio gap

## Signals

| Signal | Value |
| --- | ---: |
| Screenshot quality | 20 / 20 |
| Layout complexity (scroll=12360px, sections=15) | 18 / 22 |
| CTA clarity (40 CTAs) | 12 / 12 |
| Visual system (colors=22, fonts=6, shadows=4, radii=11) | 15 / 15 |
| Product demo presence | 3 / 20 |
| SaaS market signals (pricing=0, auth=0, saas=0) | 0 / 15 |
| AI enhancement signal | 0 / 6 |

## Checks

- Horizontal overflow: false
- Pricing section visible: no
- Interactive/product demo signal: no
- Login/signup present: no

## Recommendation

GOOD REPLICANT — build if it fills a portfolio gap

Run:
> ai-factory@0.0.1 factory:create /home/sgy/ai-factory
> tools/factory/factory-create.sh https://example.com/resend

Factory create: https://example.com/resend -> references/example-com/
Step 1: detailed capture
Capturing https://example.com/resend
Output: /home/sgy/ai-factory/references/example-com
{
  "url": "https://example.com/resend",
  "title": "Example Domain",
  "screenshot": "/home/sgy/ai-factory/references/example-com/full-page.png"
}
{
  "url": "https://example.com/resend",
  "title": "Example Domain",
  "screenshot": "/home/sgy/ai-factory/references/example-com/desktop.png"
}
{
  "url": "https://example.com/resend",
  "title": "Example Domain",
  "screenshot": "/home/sgy/ai-factory/references/example-com/mobile.png"
}
Capture complete: /home/sgy/ai-factory/references/example-com
README.md
color-palette.json
css-assets.json
css-assets.txt
design-signals.json
desktop.png
full-page.png
index.html
metadata.json
mobile.png
replication-brief.md
source.md
typography-summary.json
Step 2: design signals
Extracting design signals from https://example.com/resend
Design signals written to /home/sgy/ai-factory/references/example-com/design-signals.json
Step 3: replication brief
Replication brief written to /home/sgy/ai-factory/references/example-com/replication-brief.md
Step 4: site scaffold (optional)
Run: pnpm factory:scaffold example-com <template>
Templates:
  ai-tool-landing
  dashboard
  saas-landing
  seo-tool

Factory create complete: /home/sgy/ai-factory/references/example-com
  README.md
  color-palette.json
  css-assets.json
  css-assets.txt
  design-signals.json
  desktop.png
  full-page.png
  index.html
  metadata.json
  mobile.png
  replication-brief.md
  source.md
  typography-summary.json for the full capture if not already present.
