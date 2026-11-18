"""Vertical (9:16) thumbnail for ep01 Short s01, same look as the ep01 long-form thumbs
(tools/ink/make_thumbs.py): ink plate, Lustig sprite, white/yellow Arial Black with black keyline.
Text self-measures to fit its box (fit_font from make_thumbs, no hand-tuned font sizes)."""
from PIL import Image, ImageDraw, ImageEnhance
from make_thumbs import fit_font, PLATES, CAST, ROOT, WHITE, YELLOW, BLACK

OUT = ROOT + 'shorts/s01-sold-twice/thumb_s01_sold_twice.jpg'
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


bg = cover(Image.open(PLATES + 'tower_low_angle_up.png').convert('RGB'), W, H)
bg = ImageEnhance.Brightness(bg).enhance(0.8)               # text pops off a darker plate
# dark gradient behind the text block (top), fading out below it
shade = Image.new('L', (W, H), 0)
sd = ImageDraw.Draw(shade)
fade_end = TEXT_TOP + TEXT_H + PAD * 3
for y in range(fade_end):
    sd.line([(0, y), (W, y)], fill=int(180 * (1 - y / fade_end)))
bg.paste(Image.new('RGB', (W, H), BLACK), (0, 0), shade)

sp = Image.open(CAST + 'lustig_from_below_smug.png').convert('RGBA')
sp = sp.crop(sp.getbbox())
sh = int(H * SPRITE_H)
sp = sp.resize((int(sp.width * sh / sp.height), sh), Image.LANCZOS)
bg.paste(sp, ((W - sp.width) // 2, H - sp.height + int(sp.height * SINK)), sp)

d = ImageDraw.Draw(bg)
lines = [('HE SOLD THE', WHITE, 0.24), ('EIFFEL TOWER', WHITE, 0.24), ('TWICE.', YELLOW, 0.42)]
gap = int(TEXT_H * 0.10 / (len(lines) - 1))
y = TEXT_TOP
for text, col, share in lines:
    f, (l, t, r, b) = fit_font(d, text, W - PAD * 2, int(TEXT_H * share))
    d.text(((W - (r - l)) // 2 - l, y - t), text, font=f, fill=col, stroke_width=f.size // 12, stroke_fill=BLACK)
    y += (b - t) + gap
bg.save(OUT, quality=92)
bg.resize((216, 384), Image.LANCZOS).save(ROOT + 'shorts/s01-sold-twice/thumb_phone_preview.jpg', quality=92)
print('ok', OUT)
