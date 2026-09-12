# Website Factory — Reference Selection Framework

Used to decide which website to replicate next. Score 0-100 on seven criteria,
then follow the decision rules. Run this before `factory:create`.

## Criteria

1. **Visual quality (0-25)**
   - 20-25: distinctive layout, excellent typography, cohesive palette,
     polished product mock, no template feel.
   - 10-19: clean but common; strong hero, average rest.
   - 0-9: plain, dated, or template-like.

2. **UX simplicity (0-15)**
   - 13-15: one clear job, input→output flow visible in the hero.
   - 8-12: clear value but multi-path or heavy navigation.
   - 0-7: confusing, multi-product, or dashboard-first.

3. **Monetization clarity (0-15)**
   - 13-15: obvious subscription/usage pricing on page or in market category.
   - 8-12: freemium or enterprise-with-sales.
   - 0-7: unclear how customers pay.

4. **Existing market proof (0-20)**
   - 16-20: category leader with visible paying-customer signal (logos,
     testimonials, growth).
   - 8-15: multiple competitors, some evidence.
   - 0-7: speculative or pre-product category.

5. **MVP feasibility (0-15)**
   - 13-15: static landing + fake interactive demo with mock data is
     convincing; no real backend needed for the demo.
   - 8-12: some real logic needed but can be faked well.
   - 0-7: requires accounts, live data, payments, or deep integration to feel
     real.

6. **AI enhancement opportunity (0-5)**
   - 5: a clear AI-tool transformation exists (analyze, generate, summarize,
     answer, automate).
   - 3: AI can improve one feature noticeably.
   - 1: AI is irrelevant.

7. **Differentiation opportunity (0-5)**
   - 5: adjacent niche underserved, can reposition with AI/UX angle.
   - 3: crowded but angle available.
   - 1: commodity category.

## Scoring

```text
Total = visual(25) + ux(15) + monetization(15) + market(20)
      + mvp(15) + ai(5) + differentiation(5) = 100
```

Record each score with a one-line reason and the reference URL.

## Decision rules

- 80+: strong replicant. Capture and build now.
- 60-79: good replicant. Build if it fills a portfolio gap.
- 40-59: capture only; useful for a library, not a premium demo.
- <40: skip; add to reference pool only if visually unique.

## Reference examples

| Site | Visual | UX | Monetization | Market | MVP | AI | Diff | Total |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Linear | 23 | 13 | 13 | 18 | 12 | 4 | 3 | 86 |
| Resend | 22 | 14 | 14 | 17 | 13 | 3 | 3 | 86 |
| Perplexity | 21 | 15 | 13 | 18 | 12 | 5 | 2 | 86 |
| Raycast | 23 | 14 | 13 | 17 | 12 | 3 | 3 | 85 |
| Ahrefs | 16 | 8 | 14 | 18 | 6 | 5 | 2 | 69 |
| Google Docs | 12 | 9 | 12 | 20 | 2 | 4 | 2 | 61 |

## Output contract

Every selected site file in `radar/websites/` must include:

- why chosen (score summary)
- reference URL
- UI patterns
- UX patterns
- possible AI transformation
- difficulty
- business potential

Keep reusing this framework for every future selection; never select on
looks alone.
