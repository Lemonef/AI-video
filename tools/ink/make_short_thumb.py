"""Vertical (9:16) thumbnail for an ep01 Short, same look as the ep01 long-form thumbs
(tools/ink/make_thumbs.py): ink plate, one cast sprite, white/yellow Arial Black with black keyline.
Text self-measures to fit its box (fit_font from make_thumbs, no hand-tuned font sizes).

  python tools/ink/make_short_thumb.py <short spec.json>

Reads the spec's "thumb" block: out (file name, written next to the spec), plate, sprite, and
lines [text, "white"|"yellow", share of the text block height]."""
import sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageEnhance
from make_thumbs import fit_font, PLATES, CAST, WHITE, YELLOW, BLACK

SPEC = Path(sys.argv[1])
THUMB = __import__('json').loads(SPEC.read_text(encoding='utf-8'))['thumb']
OUT = SPEC.parent / THUMB['out']
COLORS = {'white': WHITE, 'yellow': YELLOW}
W, H = 1080, 1920             # Shorts frame (mirrors Root.tsx / InkShort SHORT_W x SHORT_H)
PAD = 60                      # edge margin
TEXT_TOP = int(H * 0.08)      # text block starts below the shelf/feed top chrome
TEXT_H = int(H * 0.36)        # top ~third carries the story; tower + Lustig below
SPRITE_H = 0.42               # Lustig height as share of H (bottom band, under the text)
SINK = 0.14                   # share of sprite height pushed below the frame edge: crops the shoes off,
                              # so he is framed from the shins up instead of floating on the plate (Zen 2026-11-19)


def cover(img, w, h):
    """Scale to cover w x h, centre crop (plates are 16:9, frame is 9:16)."""
    s = max(w / img.width, h / img.height)
    img = img.resize((round(img.width * s), round(img.height * s)), Image.LANCZOS)
    x, y = (img.width - w) // 2, (img.height - h) // 2
    return img.crop((x, y, x + w, y + h))


bg = cover(Image.open(PLATES + THUMB['plate']).convert('RGB'), W, H)
bg = ImageEnhance.Brightness(bg).enhance(0.8)               # text pops off a darker plate
# dark gradient behind the text block (top), fading out below it
shade = Image.new('L', (W, H), 0)
sd = ImageDraw.Draw(shade)
fade_end = TEXT_TOP + TEXT_H + PAD * 3
for y in range(fade_end):
    sd.line([(0, y), (W, y)], fill=int(180 * (1 - y / fade_end)))
bg.paste(Image.new('RGB', (W, H), BLACK), (0, 0), shade)

sp = Image.open(CAST + THUMB['sprite']).convert('RGBA')
sp = sp.crop(sp.getbbox())
sh = int(H * SPRITE_H)
sp = sp.resize((int(sp.width * sh / sp.height), sh), Image.LANCZOS)
bg.paste(sp, ((W - sp.width) // 2, H - sp.height + int(sp.height * SINK)), sp)

d = ImageDraw.Draw(bg)
lines = [(text, COLORS[col], share) for text, col, share in THUMB['lines']]
gap = int(TEXT_H * 0.10 / (len(lines) - 1))
y = TEXT_TOP
for text, col, share in lines:
    f, (l, t, r, b) = fit_font(d, text, W - PAD * 2, int(TEXT_H * share))
    d.text(((W - (r - l)) // 2 - l, y - t), text, font=f, fill=col, stroke_width=f.size // 12, stroke_fill=BLACK)
    y += (b - t) + gap
bg.save(OUT, quality=92)
# phone-size check copy for Claude only: goes to the repo's gitignored .tmp/, never next to the
# upload file, so the post folder holds exactly one thumbnail (Zen 2026-11-22: "why 2 ... confuse")
PREVIEW = Path(__file__).resolve().parents[2] / '.tmp' / f'{OUT.stem}_phone_preview.jpg'
PREVIEW.parent.mkdir(exist_ok=True)
bg.resize((216, 384), Image.LANCZOS).save(PREVIEW, quality=92)
print('ok', OUT)
