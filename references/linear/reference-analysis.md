# Reference analysis — linear

- URL: https://example.com/linear
- Title: Linear – The system for product development
- Date: 2026-09-12T01:06:23Z
- Total score: 62 / 100
- Decision: GOOD REPLICANT — build if it fills a portfolio gap

## Signals

| Signal | Value |
| --- | ---: |
| Screenshot quality | 14 / 20 |
| Layout complexity (scroll=9960px, sections=14) | 18 / 22 |
| CTA clarity (40 CTAs) | 12 / 12 |
| Visual system (colors=24, fonts=2, shadows=13, radii=19) | 15 / 15 |
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
> tools/factory/factory-create.sh https://example.com/linear

Factory create: https://example.com/linear -> references/example-com/
Step 1: detailed capture
Capturing https://example.com/linear
Output: /home/sgy/ai-factory/references/example-com
{
  "url": "https://example.com/linear",
  "title": "Example Domain",
  "screenshot": "/home/sgy/ai-factory/references/example-com/full-page.png"
}
{
  "url": "https://example.com/linear",
  "title": "Example Domain",
  "screenshot": "/home/sgy/ai-factory/references/example-com/desktop.png"
}
{
  "url": "https://example.com/linear",
  "title": "Example Domain",
  "screenshot": "/home/sgy/ai-factory/references/example-com/mobile.png"
}
Capture complete: /home/sgy/ai-factory/references/example-com
README.md
color-palette.json
css-assets.json
css-assets.txt
desktop.png
full-page.png
index.html
metadata.json
mobile.png
source.md
typography-summary.json
Step 2: design signals
Extracting design signals from https://example.com/linear
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
