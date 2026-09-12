# Website Factory replication brief — linear

## Reference

- URL: https://linear.app/
- Page title: Linear – The system for product development
- Detected type: SaaS / AI tool landing page (with product/pricing signals)

## Page structure

- Desktop page height: 9960px
- Horizontal overflow: false
- Main sections:

- header#
- main# The product development system for teams and agentsThe product developmentsystem for teams and agent
- header#
- section# Intakeand integrations
- header#
- section# Planningand monitoring
- header#
- section# AI andautomations
- header#
- header#
- header#
- header#

## Core components

- **Header / navigation**: sticky or static nav with logo, links, and CTA.
- **Hero**: primary headline, subcopy, and a high-visibility CTA.
- **Body sections**: feature/card grids that preserve spacing and hierarchy.
- **CTA patterns**: Agent Insights | Agent tasks | Contact | Customer Requests + | Customers | Docs | Documents + | Faster app launch | Favorites | Inbox | Initiatives | Initiatives + | Learn more→ | Linear | Linear Agent + | Linear Asks + | Log in | More | My issues | NewLoops → | Now | Open app | Performance | Pricing | Product | Projects | Projects + | Pulse | Pulse + | Resources | Reviews | Sign up | Skip to content → | Triage + | UI Refresh | Visual planning + | Workspace | iOS
- **Footer**: navigation and legal/notes block.

## Visual system

- Colors (top): rgb(247, 248, 248), rgb(138, 143, 152), rgb(98, 102, 109), rgb(208, 214, 224), rgb(255, 255, 255), rgb(226, 228, 231)
- Typography (top): "Inter Variable", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif, "Berkeley Mono", ui-monospace, "SF Mono", Menlo, monospace
- See design-signals.json for full spacing, radius, shadow, and section data.

## Independent recreation rules

- Recreate layout, hierarchy, spacing, typography, and color relationships only.
- Do not copy logos, proprietary illustrations, marketing copy, screenshots,
  source code, tracking scripts, or third-party private assets.
- Replace brand identity with a fictional name and original placeholder copy.

## Reusable open-source project suggestions

- Static marketing / landing: Astro (current stack) or plain HTML/CSS/JS.
- Tailwind CSS for rapid, token-driven styling when a component system is
  useful.
- SVG/feGaussianBlur or CSS gradients for geometric hero visuals (no proprietary
  images).
- lucide (or tabler) icons when icon sets are needed — MIT licensed.
- For functional demos only: small self-contained JS; avoid SaaS or analytics
  dependencies.

## Adapters / templates

Pick the closest template in sites/templates/:

- saas-landing
- ai-tool-landing
- dashboard
- seo-tool

Then replace brand tokens, colors, sections, and copy before committing.
