"""Ep01 thumbs v2 (Zen 2026-11-17): straightforward, text carries the story:
'HE SOLD THE EIFFEL TOWER / TWICE.' One subject, no stamp clutter.
Text size self-measures to fit its box (no hand-tuned font sizes)."""
from PIL import Image, ImageDraw, ImageFont, ImageEnhance

ROOT = 'D:/AI-video/videos/pastly-life/01-eiffel-ink/'
PLATES = ROOT + 'assets/ink60full/plates/'
CAST = ROOT + 'assets/ink60/cast/'
OUT = ROOT + 'final/thumbs/'
W, H = 1280, 720
PAD = 40                      # edge margin
TEXT_W = int(W * 0.60)        # left 60% for text, right 40% for the character
FONT = 'C:/Windows/Fonts/ariblk.ttf'
WHITE, YELLOW, BLACK = (255, 255, 255), (255, 200, 0), (0, 0, 0)


def fit_font(draw, text, max_w, max_h):
    size = max_h
    while size > 10:
        f = ImageFont.truetype(FONT, size)
        l, t, r, b = draw.textbbox((0, 0), text, font=f, stroke_width=size // 12)
        if r - l <= max_w and b - t <= max_h:
            return f, (l, t, r, b)
        size -= 2
    raise ValueError(text)


def make(plate, sprite, out, sprite_h=0.92):
    bg = Image.open(PLATES + plate).convert('RGB').resize((W, H), Image.LANCZOS)
    bg = ImageEnhance.Brightness(bg).enhance(0.8)          # text pops off a darker plate
    # dark gradient behind text block for contrast
    shade = Image.new('L', (W, H), 0)
    sd = ImageDraw.Draw(shade)
    for x in range(TEXT_W + PAD * 2):
        sd.line([(x, 0), (x, H)], fill=int(170 * (1 - x / (TEXT_W + PAD * 2))))
    bg.paste(Image.new('RGB', (W, H), BLACK), (0, 0), shade)

    sp = Image.open(CAST + sprite).convert('RGBA')
    sp = sp.crop(sp.getbbox())
    sh = int(H * sprite_h)
    sp = sp.resize((int(sp.width * sh / sp.height), sh), Image.LANCZOS)
    bg.paste(sp, (W - sp.width - PAD // 2, H - sp.height), sp)

    d = ImageDraw.Draw(bg)
    avail_h = H - PAD * 2
    # three lines; the hook word TWICE gets the biggest share of height
    lines = [('HE SOLD THE', WHITE, 0.22), ('EIFFEL TOWER', WHITE, 0.26), ('TWICE.', YELLOW, 0.44)]
    gap = int(avail_h * 0.08 / (len(lines) - 1))
    y = PAD
    for text, col, share in lines:
        f, (l, t, r, b) = fit_font(d, text, TEXT_W, int(avail_h * share))
        sw = f.size // 12
        d.text((PAD - l, y - t), text, font=f, fill=col, stroke_width=sw, stroke_fill=BLACK)
        y += (b - t) + gap
    bg.save(OUT + out, quality=92)
    return bg


a = make('tower_low_angle_up.png', 'lustig_from_below_smug.png', 'thumbD_he_sold_tower_twice.jpg')
b = make('tower_lattice_framing_paris.png', 'lustig_counting_cash.png', 'thumbE_he_sold_tower_twice_cash.jpg', 0.8)
# phone-size check: ~ 246x138 is a YouTube mobile feed thumb
pw, ph = 320, 180
prev = Image.new('RGB', (pw * 2 + 30, ph + 20), (24, 24, 24))
prev.paste(a.resize((pw, ph), Image.LANCZOS), (10, 10))
prev.paste(b.resize((pw, ph), Image.LANCZOS), (pw + 20, 10))
prev.save(OUT + 'phone_size_preview_v2.jpg', quality=92)
print('ok')
