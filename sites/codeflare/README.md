# Codeflare — AI Factory P5 premium demo

Independent recreation built for the P5 "self-improving factory" sprint.

- Reference URL: https://cursor.com/
- Brand: fictional "Codeflare" (no Cursor branding, copy, logos, or assets).
- Stack: static HTML/CSS/vanilla JS; no dependencies, no backend, no LLM API.
- Local run:

  ```bash
  python3 -m http.server 4313 --directory sites/codeflare
  ```

- Public preview (P5 run, temporary): recorded in P5 experiment log.
- Reference analysis: references/cursor/reference-analysis.md
- Screenshots: references/cursor/recreation/production-{desktop,mobile}.png

## Demo

Prompt → plan → diff → apply. Typing a request builds a mock diff for the
displayed file; "Apply change" marks it applied without touching disk.

## Known limitations

- Mock interaction only; no actual repo or AI model.
- Preview URL is a temporary Quick Tunnel and will expire.
