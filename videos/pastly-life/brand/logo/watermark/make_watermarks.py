"""Simple watermark variants for Pastly Life (Ink Free lettering, brand tokens only).

Outputs: wm_01..wm_12.png (transparent, cropped) + wm_sheet.png (each variant on paper
and at real watermark size on a frame from the episode).
Run: python make_watermarks.py   (from this folder)
"""
import math
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

# Brand tokens - mirror engine/ink palette (INK / PAPER / ORANGE); change together.
INK = (0x1b, 0x1b, 0x1f, 255)
PAPER = (0xfb, 0xfa, 0xf6, 255)
ORANGE = (0xe8, 0x86, 0x2b, 255)
FONT = "C:/Windows/Fonts/Inkfree.ttf"

HERE = Path(__file__).parent
S = 4  # supersample factor; everything below is in 1x units then multiplied
WM_HEIGHT = 72  # px height of the watermark on a 1920x1080 frame in the mockup
PAD = 12


def font(px):
    return ImageFont.truetype(FONT, int(px * S))


def canvas(w, h):
    im = Image.new("RGBA", (w * S, h * S), (0, 0, 0, 0))
    return im, ImageDraw.Draw(im)


def text(d, xy, s, px, fill, anchor="mm", stroke=0):
    d.text((xy[0] * S, xy[1] * S), s, font=font(px), fill=fill, anchor=anchor,
           stroke_width=int(stroke * S), stroke_fill=fill)


def swoosh(d, x0, x1, y, sag, width, fill):
    """Hand-ish underline: shallow arc, thick ends tapering slightly."""
    pts = []
    n = 40
    for i in range(n + 1):
        t = i / n
        pts.append(((x0 + (x1 - x0) * t) * S, (y + sag * math.sin(math.pi * t) - sag * 0.6 * t) * S))
    d.line(pts, fill=fill, width=int(width * S), joint="curve")
    r = width * S / 2
    for p in (pts[0], pts[-1]):
        d.ellipse((p[0] - r, p[1] - r, p[0] + r, p[1] + r), fill=fill)


def stickman(d, cx, top, h, fill, wave=False):
    """Minimal ink stickman, h = total height."""
    hr = h * 0.16
    w = max(2.0, h * 0.07) * S
    hc = (cx * S, (top + hr) * S)
    d.ellipse((hc[0] - hr * S, hc[1] - hr * S, hc[0] + hr * S, hc[1] + hr * S), outline=fill, width=int(w))
    neck = top + 2 * hr
    hip = top + h * 0.68
    d.line([(cx * S, neck * S), (cx * S, hip * S)], fill=fill, width=int(w))
    arm_y = neck + h * 0.12
    if wave:
        d.line([(cx * S, arm_y * S), ((cx + h * 0.22) * S, (arm_y - h * 0.2) * S)], fill=fill, width=int(w))
    else:
        d.line([(cx * S, arm_y * S), ((cx + h * 0.22) * S, (arm_y + h * 0.12) * S)], fill=fill, width=int(w))
    d.line([(cx * S, arm_y * S), ((cx - h * 0.22) * S, (arm_y + h * 0.12) * S)], fill=fill, width=int(w))
    d.line([(cx * S, hip * S), ((cx - h * 0.16) * S, (top + h) * S)], fill=fill, width=int(w))
    d.line([(cx * S, hip * S), ((cx + h * 0.16) * S, (top + h) * S)], fill=fill, width=int(w))


def finish(im):
    box = im.getbbox()
    im = im.crop(box)
    out = Image.new("RGBA", (im.width + 2 * PAD * S, im.height + 2 * PAD * S), (0, 0, 0, 0))
    out.paste(im, (PAD * S, PAD * S))
    return out.resize((out.width // S, out.height // S), Image.LANCZOS)


# ---------- the 12 variants ----------
def v01():  # one line + orange swoosh
    im, d = canvas(600, 160)
    text(d, (300, 70), "PASTLY LIFE", 80, INK)
    swoosh(d, 90, 510, 125, 8, 9, ORANGE)
    return im


def v02():  # Zen's stacked wordmark, tightened
    im, d = canvas(400, 260)
    text(d, (200, 65), "PASTLY", 80, INK)
    text(d, (200, 150), "LIFE", 80, INK)
    swoosh(d, 110, 290, 205, 7, 9, ORANGE)
    return im


def v03():  # PL monogram + swoosh
    im, d = canvas(260, 220)
    text(d, (130, 90), "PL", 130, INK)
    swoosh(d, 55, 205, 175, 7, 10, ORANGE)
    return im


def v04():  # PL in hand ink circle
    im, d = canvas(240, 240)
    d.ellipse((20 * S, 20 * S, 220 * S, 220 * S), outline=INK, width=9 * S)
    text(d, (122, 118), "PL", 110, INK)
    d.ellipse((168 * S, 158 * S, 186 * S, 176 * S), fill=ORANGE)
    return im


def v05():  # PASTLY • LIFE
    im, d = canvas(640, 140)
    text(d, (340, 70), "PASTLY", 80, INK, anchor="rm")
    d.ellipse((358 * S, 64 * S, 378 * S, 84 * S), fill=ORANGE)
    text(d, (396, 70), "LIFE", 80, INK, anchor="lm")
    return im


def v06():  # LIFE in orange
    im, d = canvas(600, 140)
    text(d, (220, 70), "PASTLY", 80, INK)
    text(d, (470, 70), "LIFE", 80, ORANGE)
    return im


def v07():  # stacked, LIFE orange, no underline
    im, d = canvas(400, 240)
    text(d, (200, 65), "PASTLY", 80, INK)
    text(d, (200, 155), "LIFE", 80, ORANGE)
    return im


def v08():  # tag: rounded ink box
    im, d = canvas(620, 170)
    d.rounded_rectangle((20 * S, 25 * S, 600 * S, 145 * S), radius=30 * S, outline=INK, width=7 * S, fill=PAPER)
    text(d, (310, 85), "PASTLY LIFE", 72, INK)
    swoosh(d, 140, 480, 128, 4, 6, ORANGE)
    return im


def v09():  # orange PL disc
    im, d = canvas(240, 240)
    d.ellipse((20 * S, 20 * S, 220 * S, 220 * S), fill=ORANGE)
    text(d, (122, 118), "PL", 110, PAPER)
    return im


def v10():  # wordmark + stickman standing on swoosh end
    im, d = canvas(700, 200)
    text(d, (290, 95), "PASTLY LIFE", 80, INK)
    swoosh(d, 80, 560, 150, 8, 9, ORANGE)
    stickman(d, 615, 72, 80, INK, wave=True)
    return im


def v11():  # PL + tiny stickman leaning on L
    im, d = canvas(320, 220)
    text(d, (130, 100), "PL", 130, INK)
    stickman(d, 245, 70, 90, INK, wave=True)
    swoosh(d, 50, 290, 185, 6, 9, ORANGE)
    return im


def v12():  # small caps line, orange bracket ticks (film-corner feel)
    im, d = canvas(620, 160)
    text(d, (310, 80), "PASTLY LIFE", 72, INK)
    w = 7 * S
    for (x, sx) in ((40, 1), (580, -1)):
        d.line([(x * S, 40 * S), (x * S, 120 * S)], fill=ORANGE, width=w)
        d.line([(x * S, 40 * S), ((x + sx * 22) * S, 40 * S)], fill=ORANGE, width=w)
        d.line([(x * S, 120 * S), ((x + sx * 22) * S, 120 * S)], fill=ORANGE, width=w)
    return im


VARIANTS = [v01, v02, v03, v04, v05, v06, v07, v08, v09, v10, v11, v12]


def main():
    frame = Image.open(HERE / "_frame.png").convert("RGBA")
    # The episode frame carries the old placeholder mark bottom-right; cover it with the
    # paper pixels just left of it (keeps the vignette tone) so mockups show only the new mark.
    patch = frame.crop((frame.width - 260, frame.height - 120, frame.width - 130, frame.height))
    frame.paste(patch, (frame.width - 130, frame.height - 120))
    marks = []
    for i, fn in enumerate(VARIANTS, 1):
        m = finish(fn())
        m.save(HERE / f"wm_{i:02d}.png")
        marks.append(m)

    # Sheet: per tile = big on paper (top) + real-size in frame corner (bottom).
    TW, BIG_H, MOCK_H = 560, 220, 315
    cols, rows = 4, 3
    sheet = Image.new("RGBA", (cols * TW, rows * (BIG_H + MOCK_H)), PAPER)
    num = ImageFont.truetype(FONT, 34)
    for i, m in enumerate(marks):
        cx, cy = (i % cols) * TW, (i // cols) * (BIG_H + MOCK_H)
        k = min((TW - 60) / m.width, (BIG_H - 40) / m.height)
        big = m.resize((int(m.width * k), int(m.height * k)), Image.LANCZOS)
        sheet.alpha_composite(big, (cx + (TW - big.width) // 2, cy + (BIG_H - big.height) // 2))
        f = frame.copy()
        k2 = WM_HEIGHT / m.height
        small = m.resize((max(1, int(m.width * k2)), WM_HEIGHT), Image.LANCZOS)
        a = small.getchannel("A").point(lambda v: int(v * 0.8))  # watermark opacity
        small.putalpha(a)
        f.alpha_composite(small, (f.width - small.width - 36, f.height - small.height - 30))
        mock = f.resize((TW - 20, MOCK_H - 20), Image.LANCZOS)
        sheet.alpha_composite(mock, (cx + 10, cy + BIG_H + 10))
        ImageDraw.Draw(sheet).text((cx + 14, cy + 8), f"{i + 1:02d}", font=num, fill=ORANGE)
    sheet.convert("RGB").save(HERE / "wm_sheet.png")
    # Corner crops at true 1:1 pixel size, so readability is judged honestly.
    crops = Image.new("RGBA", (cols * 420, rows * 160), PAPER)
    for i, m in enumerate(marks):
        f = frame.copy()
        k2 = WM_HEIGHT / m.height
        small = m.resize((max(1, int(m.width * k2)), WM_HEIGHT), Image.LANCZOS)
        small.putalpha(small.getchannel("A").point(lambda v: int(v * 0.8)))
        f.alpha_composite(small, (f.width - small.width - 36, f.height - small.height - 30))
        c = f.crop((f.width - 420, f.height - 160, f.width, f.height))
        crops.alpha_composite(c, ((i % cols) * 420, (i // cols) * 160))
        ImageDraw.Draw(crops).text(((i % cols) * 420 + 8, (i // cols) * 160 + 4), f"{i + 1:02d}", font=num, fill=ORANGE)
    crops.convert("RGB").save(HERE / "wm_corners_1to1.png")


if __name__ == "__main__":
    main()
