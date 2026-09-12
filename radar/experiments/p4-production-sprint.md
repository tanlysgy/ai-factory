# Experiment P4 — Overnight production sprint

- Type: production / capability sprint
- Date: 2026-09-12
- Status: run
- Demand claim: none. This sprint validates whether AI Factory can repeatedly
  produce polished, saleable-looking website demos.

## Reference websites

- Linear — https://linear.app/
- Resend — https://resend.com/
- Perplexity — https://www.perplexity.ai/
- Full candidate pool: radar/websites/

## Copied UX patterns (studied, not copied)

- Linear: dark product system page, keyboard-first app mock, clean feature
  grid, tight typography, pricing/footer rhythm.
- Resend: developer tool with a request/preview terminal demo, simple API
  storytelling, muted neutral surfaces and mono labels.
- Perplexity: minimal search-first landing with an input → cited-answer
  answer panel.

## Generated demos

- sites/ai-ledger/ — Ledger, AI-native product system (Linear reference)
  interactive issue-board demo; public preview:
  https://possibilities-journalism-relative-critics.trycloudflare.com
- sites/relay-mail/ — Relay, email API for developers (Resend reference)
  API request → preview playground; public preview:
  https://identification-housewares-swim-authentication.trycloudflare.com
- sites/lumina-answers/ — Lumina, AI answer engine
  (Perplexity reference) ask → cited answer demo; public preview:
  https://entertaining-mood-code-locks.trycloudflare.com

All demos include hero, product showcase, interactive demo, CTA, pricing, and
footer; fully responsive with no horizontal overflow at 1440x1000 and 390x844.

## Screenshots

- references/linear/recreation/production-desktop.png and
  references/linear/recreation/production-mobile.png
- references/resend/recreation/production-desktop.png and
  references/resend/recreation/production-mobile.png
- references/perplexity/recreation/production-desktop.png and
  references/perplexity/recreation/production-mobile.png
- Homepage showcase images: public/showcase/{ai-ledger,relay-mail,lumina-answers}.png

## What worked

- factory:create produced complete research artifacts for all three
  references.
- Independent static demos matched the polished dark/light developer/AI
  aesthetics without copying branding or assets.
- Quick Tunnel published all three demos and browser automation verified
  desktop and mobile rendering plus zero horizontal overflow.
- Homepage now has an AI Factory Showcase section linking each demo.

## What failed / limitations

- Quick Tunnel URLs are temporary and will die with the processes; persistent
  named-tunnel previews still await Cloudflare DNS/ingress approval.
- The interactive demos use mock data only (no backend, no LLM).
- Visual parity is judged by screenshots and automated layout checks, not
  pixel-perfect fidelity.

## Decision

AI Factory successfully produced three polished, independently recreated
website demos in one overnight run and published them publicly. Next step is
persistent named preview hostnames and production routing for chosen demos.
