# exp-001 — Outreach drafts (sprint 001-B)

Prepared: 2026-09-11 · Used with `radar/experiments/exp-001-distribution-opportunities.md`

Three reusable templates. They are conversation starters, not copy to paste verbatim everywhere —
adapt the first line to the specific thread, or skip that community.

**Hard rules for all three**

- Say plainly that this is an experiment and that no product exists.
- Never claim a saving, a percentage, or a user count.
- Invite disagreement; do not ask people to "check it out" or "sign up".
- No hype words: no "revolutionary", "game-changing", "10x", "seamless".
- Disclose that nothing is stored or sent when the form is mentioned.
- If a community's rules forbid this, don't post it.

Replace `<URL>` with the landing page URL. Replace the bracketed personal details with something true.

---

## 1. Hacker News style

Plain, technical, no marketing. State the observation, state the test, ask a specific question.
HN reacts badly to enthusiasm and well to specifics and self-doubt.

```
I run Claude Code / Codex most of the day across a few repos, and the thing that keeps
nagging me isn't the code it writes — it's how much of each session goes into rebuilding
context I already handed over yesterday. The same files, the same conventions, the same
decisions. I notice it when I hit a limit or the bill arrives, not while it's happening.

[ONE CONCRETE DETAIL: e.g. "on a repo with ~N files I end up re-explaining the module
boundaries every session because the agent can't see the previous one."]

I can't tell whether that's a real, widely-felt problem or an artefact of how I work, so
I've been testing the message rather than building anything: <URL>

To be clear about what that page is: there is no product. It's a fake door. The form tells
me whether anyone cares enough to raise a hand, and it's client-side only — nothing is
stored and nothing is sent anywhere.

What I'd actually like to know from people running many sessions a day:

  - Do you actively try to reduce repeated context, and what does that look like?
  - Is it cost, context-window pressure, or mostly annoyance?
  - If you tried memory files / MCP context servers / prompt caching, what made you stop?

Critical answers are more useful to me than encouraging ones — especially if the honest
answer is "this isn't a real problem, prompt caching already covers it."
```

**Do not:** post this as `Show HN` (there is no product to show). If it becomes a submission at all,
`Ask HN` is the honest framing and should be discussed with the human first.

---

## 2. Reddit style

Closer to a person talking, matched to the subreddit's register. Lead with the shared annoyance,
not with the link. Keep the title specific and unclickbaity.

```
Title: I keep re-sending the same context to Claude Code — is that just me?

Body:

I run Claude Code across a couple of repos most days. The part that nags me isn't the code
it writes — it's how much of every session is spent rebuilding context I already gave it.
Same files, same conventions, same decisions I made last week. And I usually only notice
when I hit a limit, which is the worst possible time to notice.

Before I assume that's a shared problem, I want to check whether it's just my workflow. So
I stuck up one page describing the direction and a way to raise your hand if it resonates:
<URL>

Being upfront: there's no product, this is an experiment to find out whether the problem is
real enough to be worth building, and the form doesn't store or send anything anywhere. It's
a fake door, and I'm saying that on the page too.

If you've already solved this, I'd rather hear how — plain files, a memory MCP, subagents,
caching, or just being disciplined about clearing between tasks. What actually stuck after
the novelty wore off?

[If the subreddit has a self-promo rule: "Mods — happy to remove this if it breaks the
self-promotion rules; I checked the sidebar but say the word and it's gone."]
```

**Do not:** repost this text into another subreddit unchanged. Rewrite, or skip. Do not post it into
someone else's thread.

---

## 3. GitHub Discussion style

Terse, technical, critique-seeking. Post in `Show and tell` or `General` — never append it to
someone else's discussion. Numbers and mechanisms, no adjectives.

```
Title: Exploring whether repeated context re-sends are worth attacking (no product, not a launch)

I've been looking at how much of a long agent session is spent re-establishing context —
the same files, conventions and decisions being re-sent across sessions and subagents.

[OPTIONAL: one or two concrete observations, with numbers if you have them, e.g. "most of
the growth in my sessions comes from re-reading files the agent already read earlier in the
same task, not from new files."]

I'm trying to find out whether this is a real problem for heavy users or a niche one, so I'm
running a small distribution experiment rather than building anything: <URL>

There's nothing to install, no product exists, and the page says so. I'm posting mainly for
critique from people who know these codebases better than I do:

  - Is context re-send actually a dominant cost, or does prompt caching already absorb it?
  - For those maintaining memory/context tooling: what's the common failure mode — staleness,
    retrieving the wrong context, or overhead exceeding the savings?
  - Has anything here already been tried and rejected? I'd rather learn that now.

Dissent welcome. If the answer is "solved problem, you're three years late", that's a useful
result for me.
```

**Do not:** post this in a bug-report thread, a release thread, or alongside other people's
show-and-tell posts. One discussion, one community.

---

## What to do after posting

1. Reply to every response, including hostile ones — briefly and without defending the idea.
2. Record the post in `radar/experiments/exp-001-distribution-log.md` the same day.
3. Record negative signal as carefully as positive signal; "no interest" is a valid finding.
4. Feed the wording that actually landed back into these templates.

## What a good outcome looks like

The goal is not traffic. It is to learn whether this problem produces unprompted, specific replies —
people describing their own version of the pain, or explaining precisely why it is not real. A thread
of "doesn't happen to me, here's why" is a successful experiment result, not a failure.
