#!/usr/bin/env python3
"""Render OG image, social banner and thumbnail for a Launch Kit.

All graphics are generated locally with PIL from Factory design tokens:
Factory Ink (#173b32), Factory Cream (#f4f5ef), Factory Acid (#b9d957).
No online image services.
"""
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

INK = (23, 59, 50)
INK_STRONG = (13, 21, 18)
CREAM = (244, 245, 239)
ACID = (185, 217, 87)
MUTED = (113, 130, 123)


def font(size, bold=False):
    base = Path("/usr/share/fonts/truetype/dejavu")
    name = "DejaVuSans-Bold.ttf" if bold else "DejaVuSans.ttf"
    p = base / name
    if p.exists():
        return ImageFont.truetype(str(p), size=size)
    return ImageFont.load_default()


def _wrap(draw, text, fnt, max_w):
    words = text.split()
    lines = []
    cur = ""
    for w in words:
        trial = (cur + " " + w).strip()
        if draw.textlength(trial, font=fnt) <= max_w:
            cur = trial
        else:
            if cur:
                lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    return lines


def _base_canvas(w, h, bg=CREAM):
    im = Image.new("RGB", (w, h), bg)
    d = ImageDraw.Draw(im)
    # top-left factory accent block + bottom ink bar
    d.rectangle([0, 0, 18, h], fill=ACID)
    d.rectangle([0, h - 10, w, h], fill=INK)
    return im, d


def _paste_screenshot(im, shot_path, box):
    shot = Image.open(shot_path).convert("RGB")
    w = box[2] - box[0]
    h = box[3] - box[1]
    shot.thumbnail((w, h))
    im.paste(shot, (box[0], box[1], box[0] + shot.width, box[1] + shot.height))
    d = ImageDraw.Draw(im)
    d.rectangle(box, outline=(13, 21, 18), width=2)


def render_og(out: Path, slug: str, title: str, tagline: str):
    W, H = 1200, 630
    im, d = _base_canvas(W, H)
    title_f = font(58, bold=True)
    tag_f = font(28)
    small_f = font(18, bold=True)

    d.text((72, 64), "AI FACTORY / LAUNCH", font=small_f, fill=INK)
    t_lines = _wrap(d, title[:70], title_f, W - 144 - 420)
    y = 150
    for line in t_lines[:3]:
        d.text((72, y), line, font=title_f, fill=INK_STRONG)
        y += 68

    y += 8
    for line in _wrap(d, tagline[:110], tag_f, W - 144 - 420)[:2]:
        d.text((72, y), line, font=tag_f, fill=MUTED)
        y += 38

    shot = Path(out) / "screenshots" / "desktop-hero.png"
    if shot.exists():
        _paste_screenshot(im, shot, (W - 440, 150, W - 56, H - 56))

    d.text((72, H - 58), f"/experiments/launch/{slug}", font=small_f, fill=INK)
    im.save(out / "og-image.png")


def render_banner(out: Path, slug: str, title: str, tagline: str):
    W, H = 1600, 900
    im = Image.new("RGB", (W, H), INK_STRONG)
    d = ImageDraw.Draw(im)
    d.rectangle([0, 0, W, 14], fill=ACID)
    d.rectangle([0, H - 14, W, H], fill=ACID)
    title_f = font(64, bold=True)
    tag_f = font(32)
    small_f = font(20, bold=True)

    d.text((70, 70), "AI FACTORY PRESENTS", font=small_f, fill=ACID)
    t_lines = _wrap(d, title[:72], title_f, W - 140 - 620)
    y = 180
    for line in t_lines[:3]:
        d.text((70, y), line, font=title_f, fill=CREAM)
        y += 76
    y += 10
    for line in _wrap(d, tagline[:130], tag_f, W - 140 - 620)[:3]:
        d.text((70, y), line, font=tag_f, fill=(143, 169, 155))
        y += 42

    shot = Path(out) / "screenshots" / "desktop-hero.png"
    if shot.exists():
        _paste_screenshot(im, shot, (W - 650, 170, W - 60, H - 60))

    d.text((70, H - 72), f"launch/{slug} — factory demo", font=small_f, fill=ACID)
    im.save(out / "social-banner.png")


def render_thumb(out: Path, slug: str, title: str, tagline: str):
    W, H = 800, 450
    im, d = _base_canvas(W, H)
    title_f = font(36, bold=True)
    tag_f = font(18)
    small_f = font(14, bold=True)

    d.text((36, 34), "AI FACTORY", font=small_f, fill=INK)
    for line in _wrap(d, title[:60], title_f, W - 72 - 240)[:2]:
        d.text((36, 84), line, font=title_f, fill=INK_STRONG)
        break
    for line in _wrap(d, tagline[:70], tag_f, W - 72 - 240)[:2]:
        d.text((36, 156), line, font=tag_f, fill=MUTED)
        break
    shot = Path(out) / "screenshots" / "desktop-hero.png"
    if shot.exists():
        _paste_screenshot(im, shot, (W - 270, 70, W - 28, H - 28))
    im.save(out / "thumbnail.png")


def main():
    kind, out_s, slug, title, tagline = sys.argv[1:6]
    out = Path(out_s)
    if kind == "og":
        render_og(out, slug, title, tagline)
    elif kind == "banner":
        render_banner(out, slug, title, tagline)
    elif kind == "thumb":
        render_thumb(out, slug, title, tagline)
    else:
        raise SystemExit(f"unknown render kind: {kind}")


if __name__ == "__main__":
    main()
