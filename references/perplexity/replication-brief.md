# Website Factory replication brief — perplexity

## Reference

- URL: https://www.perplexity.ai/
- Page title: Perplexity
- Detected type: SaaS / AI tool landing page (with product/pricing signals)

## Page structure

- Desktop page height: 1000px
- Horizontal overflow: false
- Main sections:

-

## Core components

- **Header / navigation**: sticky or static nav with logo, links, and CTA.
- **Hero**: primary headline, subcopy, and a high-visibility CTA.
- **Body sections**: feature/card grids that preserve spacing and hierarchy.
- **CTA patterns**: Computer | Decline optional | Get work done with ComputerNEWHand off your projects to get  | Got it | Model | Search | Search anythingGet fast and accurate answers from the most t | Sign In | Work in a project
- **Footer**: navigation and legal/notes block.

## Visual system

- Colors (top): rgb(39, 37, 30), rgb(253, 251, 250), color(srgb 0.992157 0.984314 0.980392), rgb(1, 106, 113), color(srgb 0.152941 0.145098 0.117647), rgb(255, 255, 255)
- Typography (top): pplxSans, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"
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
