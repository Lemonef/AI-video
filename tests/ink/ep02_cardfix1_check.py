"""ep02 card fix 1 contract (brief docs/briefs/ink-ep02-card-fix1.md). Written by the planner BEFORE the build
and protected. The eye-check of the brief-2 cards found three structural defects:
  (a) the generator's text width model (len * size * CHAR_WIDTH .55) under-measures the real font (Ink Free,
      drawn bold), so captions spill past their sheet;
  (b) every card gets an auto underline at the bottom of the layout box, so doc/ring/timeline/flow cards show a
      line under nothing;
  (c) tags are hard-placed and land on top of the hero caption.
Plus content the owner will notice (fuse beat shows a lantern, "LAYOFF" flow, over-long captions).

This gate measures text itself with the real font file, independent of the builder's code.
Run from the repo root after `python tools/ink/ep02_full_shots.py --draft`:
    python -I tests/ink/ep02_cardfix1_check.py
"""
import json
import pathlib
import sys

from PIL import ImageFont

ROOT = pathlib.Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / 'tools' / 'ink'))
import ep02_full_shots as G  # noqa: E402  (generator geometry: content_box, LABEL, constants)

FONT_FILE = 'C:/Windows/Fonts/Inkfree.ttf'  # the face behind FONT = 'Ink Free' in compositions/InkProof.tsx
OVER_MAX = 1.20  # generator width may over-measure (bold allowance) but not by more than this
TOL = 1.0  # px slack for float rounding
CAPTION_WORDS_MAX = 6  # owner: captions short enough to read in one glance
CAPTION_LAYOUTS = ('hero', 'bignum', 'count')  # layouts whose bottom row is a caption (the only underline targets)
LAYOUTS = ('flow', 'bars', 'timeline', 'count', 'split', 'hero', 'crossout', 'checklist', 'quote', 'bignum',
           'doc', 'map', 'grid', 'ring', 'scale', 'transform')
FULL_STAGE = ('split', 'transform', 'scale', 'map')
MARKS = ('stamp', 'tag', 'circle', 'underline', 'tick', 'cross', 'redact')  # support marks that are not a sprite

_fonts = {}


def real_w(text, size):
    """Advance width of the uppercased text in the real font (regular outline; bold only widens it)."""
    size = int(round(size))
    if size not in _fonts:
        _fonts[size] = ImageFont.truetype(FONT_FILE, size)
    return _fonts[size].getlength(text.upper())


fails = []


def check(ok, msg):
    if not ok:
        fails.append(msg)


# 1. The generator's text measure follows the real font (self-measuring, not a guessed ratio).
measure = getattr(G, 'text_width', None)
check(callable(measure), 'generator has no module-level text_width(text, size)')
if callable(measure):
    for sample, size in (('ALIVE BY NEXT SUMMER', G.LABEL), ('WWW MMM', G.LABEL), ('16 TAKEN', G.TAG_FONT),
                         ('1718', G.BIG_FONT), ('IIII ...', G.STAMP_FONT)):
        got, ref = measure(sample, size), real_w(sample, size)
        check(ref - TOL <= got <= ref * OVER_MAX, f'text_width({sample!r},{size}) = {got:.0f}, real font {ref:.0f}')

shots = json.loads((ROOT / 'engine/ink/parts/shots_ep02full/full.json').read_text(encoding='utf-8'))['shots']
cards = [s for s in shots if s.get('bg', {}).get('card')]
check(len(cards) > 0, 'no cards')


def caption_of(layout):
    return layout.get('label') if layout['t'] in CAPTION_LAYOUTS else None


def caption_box(layout):
    """Bottom caption row of a hero/bignum/count layout, width from the real font."""
    b = G.content_box(layout)
    half = real_w(layout['label'], G.LABEL) / 2
    x = layout.get('x', G.STAGE_W / 2)
    return (x - half, b[3] - G.LABEL - G.CAP_DESCENT, x + half, b[3])


def overlap(a, b):
    return a[0] < b[2] and b[0] < a[2] and a[1] < b[3] and b[1] < a[3]


def text_spans(e):
    """(text, size, centre x) for every text run an element draws on one line."""
    k = e['t']
    if k in ('hero', 'crossout', 'count', 'bignum', 'grid') and e.get('label'):
        yield e['label'], G.LABEL, e.get('x', G.STAGE_W / 2)
    if k == 'timeline':
        yield e['left'], G.LABEL, e['x1']
        yield e['right'], G.LABEL, e['x2']
        yield e['bracket'], G.LABEL, (e['x1'] + e['x2']) / 2
    if k == 'tag':
        yield e['text'], G.TAG_FONT, e['x']
    if k == 'stamp':
        yield e['text'], G.STAMP_FONT, e['x']
    if k == 'words':
        yield e['text'], e['size'], e.get('x', G.STAGE_W / 2)


for c in cards:
    at = f"card @{c['f0']}"
    layouts = [e for e in c['els'] if e['t'] in LAYOUTS]
    if len(layouts) != 1:
        fails.append(f'{at}: {len(layouts)} layouts')
        continue
    lay = layouts[0]
    sx, sy, sw, sh = c['bg']['sheet']

    # 2. every text span sits inside the sheet horizontally, measured with the real font (full-stage layouts
    #    keep the inset panel and draw their own labels, so only their marks are checked).
    for e in c['els']:
        if e['t'] == 'sprite' or (e['t'] in FULL_STAGE):
            continue
        for text, size, cx in text_spans(e):
            half = real_w(text, size) / 2
            check(cx - half >= sx - TOL and cx + half <= sx + sw + TOL,
                  f'{at}: {e["t"]} text {text!r} ({cx - half:.0f}..{cx + half:.0f}) outside sheet x {sx:.0f}..{sx + sw:.0f}')

    # 3. underline only under a real caption, sized to it.
    cap = caption_of(lay)
    unders = [e for e in c['els'] if e['t'] == 'underline']
    check(not cap or len(unders) == 1, f'{at}: {lay["t"]} caption {cap!r} has {len(unders)} underlines (want 1)')
    for u in unders:
        if not cap:
            fails.append(f'{at}: underline on a {lay["t"]} card (no caption to underline)')
            continue
        cb = caption_box(lay)
        cw = cb[2] - cb[0]
        check(abs(u['x'] - (cb[0] + cb[2]) / 2) <= TOL, f'{at}: underline x {u["x"]} not centred on caption')
        check(cw - TOL <= u['w'] <= cw * OVER_MAX + TOL, f'{at}: underline w {u["w"]:.0f} vs caption {cw:.0f}')
        check(cb[1] <= u['y'] <= cb[3] + G.UNDERLINE_HEIGHT, f'{at}: underline y {u["y"]:.0f} not under caption '
                                                             f'({cb[1]:.0f}..{cb[3]:.0f})')

    # 4. no tag / stamp lands on the caption.
    if cap:
        cb = caption_box(lay)
        for e in c['els']:
            if e['t'] in ('tag', 'stamp'):
                check(not overlap(G.content_box(e), cb), f'{at}: {e["t"]} {e["text"]!r} overlaps caption {cap!r}')

    # 5. captions short.
    for e in c['els']:
        for text in ([e.get('label')] if e['t'] in LAYOUTS else []) + ([e['text']] if e['t'] in ('tag', 'stamp') else []):
            if text:
                check(len(text.split()) <= CAPTION_WORDS_MAX, f'{at}: caption {text!r} > {CAPTION_WORDS_MAX} words')

    # 6. a mark that is not a sprite points at the fact (doc marks/stamps count).
    check(any(e['t'] in MARKS for e in c['els']) or (lay['t'] == 'doc' and (lay.get('mark') or lay.get('stamp'))),
          f'{at}: no non-sprite support mark')

by_f0 = {c['f0']: c for c in cards}

# 7. content the owner flagged.
fuse = by_f0.get(8542)
check(fuse is not None, 'fuse card @8542 missing')
if fuse:
    check('lantern' not in json.dumps(fuse).lower(),  # anywhere, nested icons and srcs included
          'card @8542 (fuses under his hat) still shows a lantern')
    check(any(e['t'] == 'sprite' and '/bb_' in e['src'] for e in fuse['els']), 'card @8542 has no Blackbeard sprite')
lay_off = by_f0.get(4659)
check(lay_off is not None, 'sandbank card @4659 missing')
if lay_off:
    words = ' '.join(str(x) for e in lay_off['els'] for x in (e.get('items') or []) + [e.get('label') or '', e.get('text') or ''])
    check('LAYOFF' not in words.upper(), 'card @4659 still says LAYOFF (owner: say what happened)')

if fails:
    print(f'{len(fails)} FAIL', *fails, sep='\n  ')
    sys.exit(1)
print(f'OK: {len(cards)} cards: real-font text inside sheets, underlines only under captions, no tag on a caption, '
      f'captions <= {CAPTION_WORDS_MAX} words, every card has a mark')
