# Reference analysis — cursor

- URL: https://cursor.com/
- Title: AI Coding Agent for Building Ambitious Software | Cursor
- Date: 2026-09-12T01:11:21Z
- Total score: 68 / 100
- Decision: GOOD REPLICANT — build if it fills a portfolio gap

## Signals

| Signal | Value |
| --- | ---: |
| Screenshot quality | 20 / 20 |
| Layout complexity (scroll=8249px, sections=17) | 18 / 22 |
| CTA clarity (40 CTAs) | 12 / 12 |
| Visual system (colors=24, fonts=8, shadows=8, radii=15) | 15 / 15 |
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
> tools/factory/factory-create.sh https://cursor.com/

Factory create: https://cursor.com/ -> references/cursor-com/
Step 1: detailed capture
Capturing https://cursor.com/
Output: /home/sgy/ai-factory/references/cursor-com
{
  "url": "https://cursor.com/",
  "title": "AI Coding Agent for Building Ambitious Software | Cursor",
  "screenshot": "/home/sgy/ai-factory/references/cursor-com/full-page.png"
}
{
  "url": "https://cursor.com/",
  "title": "AI Coding Agent for Building Ambitious Software | Cursor",
  "screenshot": "/home/sgy/ai-factory/references/cursor-com/desktop.png"
}
{
  "url": "https://cursor.com/",
  "title": "AI Coding Agent for Building Ambitious Software | Cursor",
  "screenshot": "/home/sgy/ai-factory/references/cursor-com/mobile.png"
}
Capture complete: /home/sgy/ai-factory/references/cursor-com
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
Extracting design signals from https://cursor.com/
Design signals written to /home/sgy/ai-factory/references/cursor-com/design-signals.json
Step 3: replication brief
Replication brief written to /home/sgy/ai-factory/references/cursor-com/replication-brief.md
Step 4: site scaffold (optional)
Run: pnpm factory:scaffold cursor-com <template>
Templates:
  ai-tool-landing
  dashboard
  saas-landing
  seo-tool

Factory create complete: /home/sgy/ai-factory/references/cursor-com
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
