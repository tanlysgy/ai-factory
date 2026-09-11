# Website Factory replication brief — eleventy-dev

## Reference

- URL: https://www.11ty.dev/
- Page title: Eleventy is a simpler static site generator
- Detected type: Dashboard-style tool page

## Page structure

- Desktop page height: 10377px
- Horizontal overflow: false
- Main sections:

- header#
- main# Eleventy is a simpler static site generator
- footer# Sponsors

## Core components

- **Header / navigation**: sticky or static nav with logo, links, and CTA.
- **Hero**: primary headline, subcopy, and a high-visibility CTA.
- **Body sections**: feature/card grids that preserve spacing and hierarchy.
- **CTA patterns**: 11ty | 3.1.6 | 4.0.0-alpha.10 | Back Build Awesome Pro and make it easier to build for the w | Blog | Blog Awesome | Bluesky | Build Awesome | CommonJS, ESM, TypeScript | Community | Discord | Eleventy | Firehose | Font Awesome | Get Started | GitHub | Glossary | History | Installing JavaScript | Mastodon | Opening a Terminal | Performance | Podcast Awesome | Search | Skip to main content | Skip to navigation | Starter Projects | Versions | Web Awesome | Why Eleventy? | YouTube | v0 | v1 | v2 | v3 Stable | v3.1.6 | v4 Pre-release
- **Footer**: navigation and legal/notes block.

## Visual system

- Colors (top): rgb(56, 56, 56), rgb(34, 34, 34), rgb(24, 115, 165), rgb(255, 255, 255), rgb(102, 102, 102), rgb(204, 204, 204)
- Typography (top): system-ui, sans-serif, "Roboto Mono", Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace, Georgia, serif
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
