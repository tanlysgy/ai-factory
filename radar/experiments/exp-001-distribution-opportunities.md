# exp-001 — Distribution opportunities (sprint 001-B)

Prepared: 2026-09-11 · Linked experiment: `radar/experiments/exp-001-cost-reduction-fake-door.md`
Landing page under test: `/experiments/cost-reduction`

**Purpose.** A shortlist of real, public places where heavy AI coding-agent users already talk about
context cost, context loss, and repeated context work — the exact problem the landing page tests.

**Verification.** Every URL below was fetched/confirmed on 2026-09-11 (see `Verification notes`).
Point/comment counts are the numbers observed that day, not estimates.

**Read this before posting.** These are places to *participate*, not targets to saturate. Comment
counts and dates matter: most threads below are older than a few days, so the default action is a
substantive reply or no action at all — not a link drop. See `Posting etiquette`.

---

## Hacker News

### 1. Ask HN: How are you keeping AI coding agents from burning money?
- **URL:** https://news.ycombinator.com/item?id=47559293
- **Community:** Hacker News (Ask HN)
- **Observed:** 8 points, 32 comments (14 top-level) · posted 2026-03-29
- **Why it matches:** The question *is* the hypothesis. People answering are self-selected heavy users
  actively managing agent spend — the exact audience, with stated intent.
- **Discussion topic:** Practical tactics for controlling AI coding-agent spend.
- **Suggested outreach angle:** Answer the question first with a concrete personal practice, then
  disclose the experiment and ask whether their answer differs. No link in the first reply; offer it
  only if someone asks.
- **Risk:** **Medium** — low-visibility thread (8 points) so few eyes, but HN punishes perceived
  self-promotion. Comment-only.

### 2. Show HN: Context Gateway – Compress agent context before it hits the LLM
- **URL:** https://news.ycombinator.com/item?id=47367526
- **Community:** Hacker News (Show HN)
- **Observed:** 97 points, 64 comments · posted 2026-03-13
- **Why it matches:** Closest adjacent solution to the idea being tested; the thread is a live debate
  about whether context compression actually works or silently degrades output.
- **Discussion topic:** Compressing agent context before the model call.
- **Suggested outreach angle:** Ask what broke under compression — over-compression, lost decisions,
  or eval difficulty. Learn failure modes; do not mention the landing page.
- **Risk:** **High** — a competitor's launch thread. Any link to a waitlist page reads as opportunistic.
  Comment-only, no link, ever.

### 3. Show HN: Badge that shows how well your codebase fits in an LLM's context window
- **URL:** https://news.ycombinator.com/item?id=47181471
- **Community:** Hacker News (Show HN)
- **Observed:** 88 points, 41 comments (19 top-level) · posted 2026-02-27
- **Why it matches:** Window-fit is a proxy for the cost/limits problem; commenters are power users
  reasoning about how much of a repo they can keep in play.
- **Discussion topic:** Measuring how codebases fit inside a model's context window.
- **Suggested outreach angle:** Ask whether window pressure or API spend is the part that actually
  hurts, and whether either changed their workflow.
- **Risk:** **Medium-High** — Show HN thread, promotional links unwelcome. Comment-only.

### 4. Universal Claude.md – cut Claude output tokens
- **URL:** https://news.ycombinator.com/item?id=47581701
- **Community:** Hacker News
- **Observed:** 471 points, 162 comments · posted 2026-03-31
- **Why it matches:** Directly about the DIY-workaround theme ("Universal Claude.md") — people
  hand-rolling config to cut token usage is exactly the workaround behaviour the page references.
- **Discussion topic:** Using a universal `CLAUDE.md` to reduce output tokens.
- **Suggested outreach angle:** Ask how many of these workarounds people maintain and what they drop
  first — a natural bridge to "reduce unnecessary re-sends".
- **Risk:** **Medium** — large, active thread; a link would need a genuine, specific reason.

### 5. Show HN: Mcp2cli – One CLI for every API, 96-99% fewer tokens than native MCP
- **URL:** https://news.ycombinator.com/item?id=47305149
- **Community:** Hacker News (Show HN)
- **Observed:** 146 points, 100 comments · posted 2026-03-09
- **Why it matches:** Token overhead of everyday tooling is the same cost surface; the audience has
  already accepted that token counts are worth optimising.
- **Discussion topic:** Reducing token overhead vs. native MCP.
- **Suggested outreach angle:** Ask where they measured the savings and whether it held up in daily
  use. Topic-relevant, no self-reference.
- **Risk:** **Medium** — Show HN norms; keep it a question, not a plug.

### 6. Launch HN: Tokenless (YC S26) – Automatic model switching to save money
- **URL:** https://news.ycombinator.com/item?id=49099143
- **Community:** Hacker News (Launch HN)
- **Observed:** 71 points, 63 comments · posted 2026-07-29
- **Why it matches:** Evidence that "save agent money" is a real, funded market — the money signal
  opp-001 was missing. Thread commenters state what they would and would not pay for.
- **Discussion topic:** Automatic model switching to reduce agent cost.
- **Suggested outreach angle:** Read for demand evidence; if commenting, ask what buyers expected to
  save and why they churned. No link.
- **Risk:** **High** — a competitor's YC launch thread. Treat as research, not distribution.

---

## Reddit

### 7. r/ClaudeCode — "This seems like a waste of tokens. There has got to be a better way, right?"
- **URL:** https://www.reddit.com/r/ClaudeCode/comments/1qyt0fo/
- **Community:** r/ClaudeCode
- **Observed:** ~85 comments on the post
- **Why it matches:** The single closest match found. The poster is explicitly asking for a better way
  to avoid wasted tokens, and the replies are densely full of the workarounds the page describes.
- **Discussion topic:** Wasted tokens and alternatives to repeated work.
- **Suggested outreach angle:** Reply with substance — describe what you tried and what failed — then
  mention the experiment once, plainly, as a question rather than an invite.
- **Risk:** **Medium** — correct audience and intent, but r/ClaudeCode is sensitive to self-promotion.
  Read the subreddit rules before posting, and do not reuse this comment elsewhere.

### 8. r/ClaudeCode — "Compaction = Lobotomization. Disable it and reclaim context."
- **URL:** https://www.reddit.com/r/ClaudeCode/comments/1qnsmk0/
- **Community:** r/ClaudeCode
- **Observed:** ~83 comments
- **Why it matches:** Compaction is the mechanical cause of context loss; this thread is about how much
  context handling costs users in practice.
- **Discussion topic:** Auto-compaction destroying useful context.
- **Suggested outreach angle:** Ask what they lose first when compaction fires — decisions, constraints,
  or file history. Pure research reply.
- **Risk:** **Medium** — engaged thread; comments that look like marketing get removed.

### 9. r/ClaudeAI — "I blew $417 on Claude Code to build a word game. Here's the brutal truth."
- **URL:** https://www.reddit.com/r/ClaudeAI/comments/1jpddbf/
- **Community:** r/ClaudeAI
- **Observed:** ~623 comments
- **Why it matches:** Unexpected API bill — the sharpest, most emotionally legible form of the pain the
  landing page names. Large audience with lived experience of the cost.
- **Discussion topic:** Real spending on agent-driven hobby projects.
- **Suggested outreach angle:** Ask what share of the spend was re-sending context rather than new work.
  This is a genuine question, not a pitch.
- **Risk:** **Medium-High** — large thread, older post; a link here would likely read as hijacking.

### 10. r/ClaudeCode — "Didn't really think of token's cost vs employee salary. Did any of you make an actual comparison?"
- **URL:** https://www.reddit.com/r/ClaudeCode/comments/1r92i6m/
- **Community:** r/ClaudeCode
- **Observed:** ~114 comments
- **Why it matches:** Users actively reasoning about agent cost in economic terms — a strong signal for
  cost-visibility interest, and a natural place to ask about waste.
- **Discussion topic:** Cost of tokens compared with engineer time.
- **Suggested outreach angle:** Ask whether anyone has measured the wasted portion specifically.
- **Risk:** **Medium** — on-topic, but still requires a disclosure line.

### 11. r/ClaudeCode — "I built a context management plugin and it CHANGED MY LIFE"
- **URL:** https://www.reddit.com/r/ClaudeCode/comments/1odoo3k/
- **Community:** r/ClaudeCode
- **Observed:** ~130 comments
- **Why it matches:** A builder-and-users thread about exactly this problem space; the replies document
  what people actually needed versus what got built.
- **Discussion topic:** A third-party context-management plugin for Claude Code.
- **Suggested outreach angle:** Ask what the plugin does that a plain file does not, and where it fails.
  Research only — this is someone else's launch.
- **Risk:** **High** — promotional-adjacent thread; any link looks like a competing plug attempt.

### 12. r/ChatGPTCoding — "Up to 80% cost reduction using Memory Bank"
- **URL:** https://www.reddit.com/r/ChatGPTCoding/comments/1ni0l5g/
- **Community:** r/ChatGPTCoding
- **Observed:** ~10 comments (small thread)
- **Why it matches:** Smaller and lower-traffic, but the poster is running an experiment in the same
  space and would likely welcome a peer conversation. Good first post — low stakes, high relevance.
- **Discussion topic:** Memory-file approach to cutting agent cost.
- **Suggested outreach angle:** Compare notes on measurement and honest disclosure; this is the best
  candidate for a first, low-risk link share because the thread is small and thematically identical.
- **Risk:** **Low-Medium** — small audience means low amplification, but the context makes disclosure
  natural rather than intrusive.

---

## GitHub Discussions

### 13. openai/codex — "Codex Limits: a cross-platform CLI/TUI for Codex usage, reset times, and reset credits"
- **URL:** https://github.com/openai/codex/discussions/44641
- **Community:** openai/codex Discussions → Show and tell
- **Observed:** 1 comment, updated 2026-09-10
- **Why it matches:** Someone built tooling purely because limits are hard to predict — the same
  anxiety the landing page addresses, in the Codex half of the target audience.
- **Discussion topic:** Tracking Codex usage and reset windows.
- **Suggested outreach angle:** Reply in-thread asking what prompted the build — limit anxiety or actual
  overage — and what they still cannot see.
- **Risk:** **Low** — "Show and tell" exists precisely for sharing; still keep it a question, and do not
  paste the link in someone else's post.

### 14. openai/codex — "CodexFuse 1.2.0 — local Windows dashboard for Codex rate limits"
- **URL:** https://github.com/openai/codex/discussions/41157
- **Community:** openai/codex Discussions → Show and tell
- **Observed:** 4 comments, updated 2026-09-10
- **Why it matches:** Local-first, cost/limit-visibility tooling — the same design instinct the landing
  page describes. Confirms the "local-first" claim resonates with this audience.
- **Discussion topic:** A local dashboard for Codex rate limits.
- **Suggested outreach angle:** Ask why they chose local-only and what they deliberately did not build.
- **Risk:** **Low** — small, focused thread.

### 15. openai/codex — "What are you building with Codex?"
- **URL:** https://github.com/openai/codex/discussions/40132
- **Community:** openai/codex Discussions → General
- **Observed:** 3 comments, updated 2026-09-10
- **Why it matches:** An open, low-pressure prompt that invites describing workflows — a legitimate way to
  introduce an exploration without hijacking a specific technical thread.
- **Discussion topic:** General Codex usage and workflows.
- **Suggested outreach angle:** Post a short, clearly-labelled experiment note asking whether context
  re-send cost shows up in their daily workflow. This is the most acceptable place for a single,
  honest link.
- **Risk:** **Low-Medium** — General category tolerates introductions; keep it brief and non-salesy.

---

## Outreach drafts

Reusable templates live in `radar/experiments/exp-001-outreach-drafts.md`.

## Posting etiquette (binding for this sprint)

1. **One community per day.** No cross-posting the same content on the same day; no batch posting.
2. **Answer before you mention.** Every reply must be useful if the link is removed entirely.
3. **Disclose every time.** State plainly that this is an experiment with no product behind it.
4. **Never revive a dead thread** to add a link. If the last comment is weeks old, skip it.
5. **Read each community's self-promotion rules** before posting. Where rules forbid it, do not post.
6. **Log honestly** — including zero views and negative replies. `radar/experiments/exp-001-distribution-log.md`.
7. **No alt accounts, no vote manipulation, no paid amplification.**
8. **Stop-on-signal:** if two communities react badly, stop distributing and report back to the human.

## Verification notes

- **Hacker News** — thread IDs and numbers confirmed via the HN Algolia API (`hn.algolia.com/api/v1/items/<id>`)
  on 2026-09-11. Two item pages returned HTTP 429 (rate limit) to a direct fetch; the Algolia item
  endpoint confirmed both exist with the stated points and comments.
- **Reddit** — Reddit blocks direct API/HTML access from this network (HTTP 403). Thread URLs were
  discovered and confirmed through a public Reddit read-mirror on 2026-09-11. Comment counts are those
  observed via the mirror and are approximate; treat them as "active thread" evidence, not exact figures.
  Canonical `reddit.com` links are recorded above and should be re-checked by a human before posting.
- **GitHub** — discussion URLs and comment counts confirmed via the GitHub GraphQL API on 2026-09-11.
- No metric in this file is estimated, inferred, or rounded up beyond the note above.
