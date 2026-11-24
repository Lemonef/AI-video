"""ep02 card fix 2 contract (brief docs/briefs/ink-ep02-card-fix2.md; checks 1-7 = fix 1 unchanged). Written by the planner BEFORE the build
and protected. The eye-check of the brief-2 cards found three structural defects:
  (a) the generator's text width model (len * size * CHAR_WIDTH .55) under-measures the real font (Ink Free,
      drawn bold), so captions spill past their sheet;
  (b) every card gets an auto underline at the bottom of the layout box, so doc/ring/timeline/flow cards show a
      line under nothing;
  (c) tags are hard-placed and land on top of the hero caption.
Plus content the owner will notice (fuse beat shows a lantern, "LAYOFF" flow, over-long captions).

This gate measures text itself with the real font file, independent of the builder's code.
Run from the repo root after `python tools/ink/ep02_full_shots.py --draft`:
    python -I tests/ink/ep02_cardfix2_check.py
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

# ---- fix 2 (planner audit of fix-1 rungs 1-2): marks must ADD a fact, never echo what is already on screen ----
TEXT_KEYS = ('text', 'label', 'left', 'right', 'bracket', 'title', 'items', 'rows', 'lines', 'by', 'value', 'who',
             'chip', 'odd', 'a', 'b', 'from', 'to', 'prefix', 'suffix', 'name')


def strings_of(e):
    """Every visible string an element draws (nested lists/tuples included); keys that name assets are skipped."""
    out = []

    def walk(v):
        if isinstance(v, (str, int, float)) and not isinstance(v, bool):
            out.append(str(v))
        elif isinstance(v, (list, tuple)):
            for x in v:
                walk(x)
        elif isinstance(v, dict):
            for k, x in v.items():
                if k in TEXT_KEYS:
                    walk(x)
    for k in TEXT_KEYS:
        if k in e:
            walk(e[k])
    return out


PUNCT = ".,!?:;'\"()+~-"
STOP = {'THE', 'A', 'AN', 'OF', 'TO', 'AND', 'OR', 'IN', 'ON', 'AT', 'IS', 'IT', 'BY', 'FOR', 'HIS', 'HE', 'YOU',
        'YOUR', 'ALL', 'NO', 'NOT', 'JUST', 'SO', 'BUT', 'WOW', 'YES', 'OK', 'WAS', 'ARE', 'WITH'}  # filler: never the fact


def words(strings):
    return {w.strip(PUNCT).upper() for s in strings for w in s.split()} - {''}


def content(ws):
    """Words that can carry a fact: filler words never count as the new information a mark adds."""
    return {w for w in ws if w not in STOP}


def mark_text(e):
    """Mark text normalised for the reuse check: case, punctuation and spacing do not make a new mark."""
    return ' '.join(w for w in (x.strip(PUNCT) for x in e['text'].upper().split()) if w)


seen = {}
prev_words = set()
for s in shots:
    marks = [e for e in s.get('els', []) if e['t'] in ('tag', 'stamp')] if s.get('bg', {}).get('card') else []
    if marks:
        at = f"card @{s['f0']}"
        lays = [e for e in s['els'] if e['t'] in LAYOUTS]
        lay_words = words(x for e in lays for x in strings_of(e))
        for e in marks:
            mw = content(words([e['text']]))
            # 8a. a mark must say at least one content word (not filler) the layout does not already say
            check(bool(mw - lay_words), f'{at}: {e["t"]} {e["text"]!r} only repeats the layout text (or is filler)')
            # 8b. ... and not only the words of the shot right before the card (the plate the viewer just read)
            check(bool(mw - prev_words), f'{at}: {e["t"]} {e["text"]!r} only repeats the previous shot')
            # 8c. no mark text (punctuation/spacing normalised) reused on another card
            t = mark_text(e)
            check(seen.get(t, s['f0']) == s['f0'], f'{at}: {e["t"]} {e["text"]!r} already used on card @{seen.get(t)}')
            seen.setdefault(t, s['f0'])
        # 9. non-full-stage layouts: marks never on the layout ink (its whole content box, not only the caption)
        for lay in lays:
            if lay['t'] not in FULL_STAGE:
                lb = G.content_box(lay)
                for e in marks:
                    check(not overlap(G.content_box(e), lb), f'{at}: {e["t"]} {e["text"]!r} overlaps the {lay["t"]} layout')
    # shot-level text the viewer also saw (chip tag, meter label) counts as "already on screen" too
    shot_text = [s['chip']] if s.get('chip') else []
    if isinstance(s.get('meter'), dict):
        shot_text += strings_of(s['meter'])
    prev_words = words([*(x for e in s.get('els', []) if e['t'] != 'sprite' for x in strings_of(e)), *shot_text])

# 10. marks authored per card in P, not a beat-keyed lookup table (fix-1 rung 2 added CARD_FACTS + beat-id branches)
check(not hasattr(G, 'CARD_FACTS'), 'generator keeps a beat-keyed CARD_FACTS table (author each mark in its P entry)')

# 11. full-stage layouts (split/transform/scale/map) fill the panel, so no tag/stamp can be proven clear of their
#     ink; their mark is a circle/tick/cross ON one of the layout's own label anchors (geometry from the generator's
#     mirrored constants, which mirror parts/cards.tsx and parts/layouts/*Layout.ts):
#       split / transform: left or right label centre (STAGE_W/4 or 3*STAGE_W/4, *_LABEL_Y - LABEL/2);
#       scale: its caption centre (STAGE_W/2, SCALE_LABEL_Y - LABEL/2), so a scale card must carry a label;
#       map: the from or to pin point (from.x/y, to.x/y; pin labels move by collision, the pin does not).
#     A circle must also be at least as wide as the label it rings (real font).
def anchors(lay):
    k, half = lay['t'], G.LABEL / 2
    if k == 'split':
        return [(G.STAGE_W / 4, G.SPLIT_LABEL_Y - half, lay['left']['label']),
                (G.STAGE_W * 3 / 4, G.SPLIT_LABEL_Y - half, lay['right']['label'])]
    if k == 'transform':
        return [(G.STAGE_W / 4, G.TRANSFORM_LABEL_Y - half, lay['a']['label']),
                (G.STAGE_W * 3 / 4, G.TRANSFORM_LABEL_Y - half, lay['b']['label'])]
    if k == 'scale':
        return [(G.STAGE_W / 2, G.SCALE_LABEL_Y - half, lay['label'])] if lay.get('label') else []
    if k == 'map':
        return [(lay['from']['x'], lay['from']['y'], None), (lay['to']['x'], lay['to']['y'], None)]
    return []


def contains(b, x, y):
    return b[0] - TOL <= x <= b[2] + TOL and b[1] - TOL <= y <= b[3] + TOL


for c in cards:
    full = [e for e in c['els'] if e['t'] in FULL_STAGE]
    at = f"card @{c['f0']}"
    if full:
        check(not any(e['t'] in ('tag', 'stamp') for e in c['els']), f'{at}: tag/stamp on a full-stage card')
        pts = anchors(full[0])
        check(bool(pts), f'{at}: {full[0]["t"]} card has no label anchor (a scale card needs a label)')
        pointers = [e for e in c['els'] if e['t'] in ('circle', 'tick', 'cross')]
        check(bool(pointers), f'{at}: full-stage card has no circle/tick/cross')
        for e in pointers:
            b = G.content_box(e)
            hit = [p for p in pts if contains(b, p[0], p[1])]
            check(bool(hit), f'{at}: {e["t"]} at ({e["x"]:.0f},{e["y"]:.0f}) is not on any {full[0]["t"]} label anchor')
            if hit and e['t'] == 'circle' and hit[0][2]:
                check(e['w'] >= real_w(hit[0][2], G.LABEL) - TOL,
                      f'{at}: circle w {e["w"]:.0f} narrower than label {hit[0][2]!r}')
    else:
        # 12. every other card carries at least one tag/stamp (the added fact), not only an underline or sprite
        check(any(e['t'] in ('tag', 'stamp') for e in c['els']), f'{at}: no tag/stamp adding a fact')

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
