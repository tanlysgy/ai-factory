#!/usr/bin/env python3
"""Generate launch copy, metadata, and checklist for a launch kit.

Outputs:
- producthunt.md  (name/tagline/description/first comment/FAQ; demo disclaimer)
- x-thread.md     (7 posts, disclosure first)
- reddit.md       (3 variants, disclosure first)
- metadata.json   (slug/title/created/reference/colors/preview_url/screenshots)
- launch-checklist.md (all checkboxes)
"""
import json
import sys
from datetime import datetime, timezone
from pathlib import Path


def main():
    out_s, slug, title, tagline, reference, created = sys.argv[1:7]
    out = Path(out_s)

    is_demo = reference != "-" and reference != ""
    demo_note = (
        f"Reference: {reference}. This is an independent visual demo; no affiliation "
        "with the referenced product."
    )
    ph_inline = (
        f"\n\n> **Demo disclosure:** {title} is an independent fictional demo "
        f"(visual recreation of {reference}). No user claims, no affiliate, no paid "
        "partnerships."
        if is_demo
        else "\n\n> **Demo disclosure:** This is a capability demo built by AI Factory."
    )

    producthunt = f"""# {title}

**Tagline:** {tagline}

## Description

{title} is a public demo built by the AI Factory — a repeatable pipeline that
captures a reference website, extracts design signals, recreates the experience
independently, and ships a working preview.

{demo_note}

## First Comment

> We built {title} to prove the factory pipeline, not to fake a startup. Every
> screenshot here comes from a real browser. The code is open, the copy is
> honest, and the "users" are fictional.

## FAQ

**Is this a real product?**

No. It is a capability demo for AI Factory. There is no billing, no accounts,
and no production service behind it.

**How was the site built?**

A reference website is inspected in a real browser, design signals are
extracted into a brief, and the site is rebuilt independently with original
branding and placeholder content.

**Can I get the source?**

Yes — the full factory and the generated site live in the AI Factory
repository.
"""

    x_thread = f"""# X Thread — {title}

1. We rebuilt {title} in hours with a factory pipeline. Not a pitch — a demo of the pipeline.
2. Reference website → real browser inspection → design signals → independent recreation → public preview.
3. Every screenshot is a real browser capture. No mockups, no stock UI.
4. The brand is fictional. The layout language is borrowed; the identity is ours.
5. What we learned: hero first, quiet motion, mobile overflow is the most common silent defect.
6. This is a demo. No accounts, no pricing, no fake users. Just a working artifact.
7. Want to see more? The whole factory is open in the AI Factory repo.
"""

    reddit = f"""# Reddit — {title}

## Version A (r/webdev — build log)

Title: I built {title} with a repeatable "website factory" pipeline — here's the kit

Body:

> Disclosure first: this is a demo, not a product. I built an agent pipeline that
> can capture a reference site, extract design tokens, and recreate it
> independently. {title} is the result. No fake users, no signup wall — all code
> is open.

## Version B (r/SideProject — honest demo)

Title: Show HN-style demo: {title} (open source, no signup, no tracking)

Body:

> {demo_note} It is a visual demo of the factory, so expectations stay low:
> interactions are mock, there are no users, and nothing is for sale.

## Version C (r/Entrepreneur — process)

Title: We stopped buying landing pages and started generating them — {title} demo

Body:

> Full transparency: this is a capability demo from AI Factory. It demonstrates
> the production loop (capture → signals → build → verify → preview). We are
> not selling it, and it has no users.
"""

    checklist = f"""# Launch Checklist — {slug}

## Build
- [ ] Site builds (`pnpm build`)

## Deploy
- [ ] Production URL responds 200

## Desktop
- [ ] 1440 screenshot captured

## Mobile
- [ ] 390 screenshot captured

## OG
- [ ] og-image.png (1200x630)

## Banner
- [ ] social-banner.png (1600x900)

## Thumbnail
- [ ] thumbnail.png (800x450)

## Preview
- [ ] Preview link recorded in metadata.json

## Product Hunt
- [ ] producthunt.md drafted (demo disclosure included)

## X
- [ ] x-thread.md drafted (7 posts)

## Reddit
- [ ] reddit.md drafted (3 versions, disclosure first)
"""

    metadata = {
        "slug": slug,
        "title": title,
        "tagline": tagline,
        "created": created,
        "reference": reference or None,
        "colors": {
            "ink": "#173B32",
            "ink_strong": "#0D1512",
            "cream": "#F4F5EF",
            "acid": "#B9D957",
            "muted": "#71827B",
        },
        "preview_url": "",
        "screenshots": sorted(p.name for p in (out / "screenshots").glob("*.png")),
    }

    (out / "producthunt.md").write_text(producthunt)
    (out / "x-thread.md").write_text(x_thread)
    (out / "reddit.md").write_text(reddit)
    (out / "launch-checklist.md").write_text(checklist)
    (out / "metadata.json").write_text(json.dumps(metadata, indent=2) + "\n")
    print(f"launch-copy: {slug} copy/metadata/checklist written")


if __name__ == "__main__":
    main()
