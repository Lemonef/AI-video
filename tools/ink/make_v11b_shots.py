"""v11b shot lists for Ep01 p03-p24 (v10.2 cut timing kept frame-for-frame; card layouts from card library 1).
Only the 17 card shots listed in the brief change; two shots get a "TOWERS SOLD" HUD chip.
Everything else stays byte-identical in its shot data.

Run: python tools/ink/make_v11b_shots.py  -> engine/ink/parts/shots_v11b/pXX.json (+ checks).
"""
import collections
import json
import pathlib

ROOT = pathlib.Path(__file__).resolve().parents[2]
ASSETS = ROOT / 'videos/pastly-life/01-eiffel-ink/assets'
OUT = ROOT / 'engine/ink/parts/shots_v11b'
V1 = ROOT / 'engine/ink/parts/shots'
V10 = ROOT / 'engine/ink/parts/shots_v10'

STAGE_W, STAGE_H = 1920, 1080          # mirrors the stage size in engine/ink (1920x1080)
FLOOR = 1000                            # sprite baseline, as in v8 p02
GLYPH = 0.5                             # words width per char per px of size (v8 p02: "1889" @220 -> 440)
CAM_SCALE = 1.12                        # 2D camera push for scene shots; keeps y>=~70 visible
TAIL = 6                                # last element must land >= TAIL frames before the cut

# Lint constants (mirror tests/ink/v11b.test.mjs)
TYPE_CAP = {'flow': 2, 'bars': 1}
TYPE_CAP_ANY = 4
PHOTO_GAP_MAX = 3600
PHOTO_USES_MAX = 2
LAYOUTS = ['flow', 'bars', 'timeline', 'count', 'split', 'hero', 'crossout', 'checklist', 'quote', 'bignum']


# ---------- backgrounds ----------
def PL(name, zoom=(1.0, 1.08), origin=None):
    for d in ('ink60full/plates', 'ink60/plates'):
        if (ASSETS / d / f'{name}.png').exists():
            bg = {'plate': f'{d}/{name}.png', 'zoom': list(zoom)}
            if origin:
                bg['origin'] = origin
            return bg
    raise SystemExit(f'missing plate {name}')


def PH(name, pos='50% 35%', push=(1.0, 1.08)):
    assert (ASSETS / 'ink60full/pd' / name).exists(), name
    return {'photo': f'ink60full/pd/{name}', 'push': list(push), 'pos': pos}


CARD = {'card': True}


# ---------- elements ----------
def W(text, at, x=960, y=300, size=100, color=None, ul=False):
    out = [{'t': 'words', 'text': text, 'x': x, 'y': y, 'size': size, 'at': at}]
    if color:
        out[0]['color'] = color
    if ul:
        out.append({'t': 'underline', 'x': x, 'y': y + round(size * 0.55),
                    'w': round(GLYPH * size * len(text)), 'at': at + 8})
    return out


def O(text, at, **k):                    # orange emphasis words
    return W(text, at, color='orange', **k)


def SP(name, at, x, h=680, flip=False):
    assert (ASSETS / 'ink60/cast' / f'{name}.png').exists(), name
    e = {'t': 'sprite', 'src': f'ink60/cast/{name}.png', 'x': x, 'y': FLOOR, 'h': h, 'at': at}
    if flip:
        e['flip'] = True
    return [e]


def ST(text, at, x=960, y=380, rot=-8):
    return [{'t': 'stamp', 'text': text, 'x': x, 'y': y, 'rot': rot, 'color': 'red', 'at': at}]


def TG(text, at, x, y):
    return [{'t': 'tag', 'text': text, 'x': x, 'y': y, 'at': at}]


def PO(name, at, x, y, w, rot, label):
    assert (ASSETS / 'ink60full/pd' / name).exists(), name
    return [{'t': 'photo', 'src': f'ink60full/pd/{name}', 'x': x, 'y': y, 'w': w, 'rot': rot,
             'frame': 'polaroid', 'label': label, 'at': at}]


def X(at, x, y, size=300):
    return [{'t': 'cross', 'x': x, 'y': y, 'size': size, 'at': at}]


def TK(at, x, y):
    return [{'t': 'tick', 'x': x, 'y': y, 'at': at}]


def CI(at, x, y, w, h):                  # red hand circle round a detail
    return [{'t': 'circle', 'x': x, 'y': y, 'w': w, 'h': h, 'at': at}]


def RD(at, x, y, w, h=70):
    return [{'t': 'redact', 'x': x, 'y': y, 'w': w, 'h': h, 'at': at}]


def TW(x, h, cut=None, y=FLOOR):
    e = {'t': 'tower', 'x': x, 'y': y, 'h': h}
    if cut:
        e['cut'] = list(cut)
    return [e]


def RA(at, x=634, y=100):
    return [{'t': 'radio', 'x': x, 'y': y, 'at': at}]


# ----- new element helpers for card library 1 (match engine/ink/parts/schema.ts) -----
def CNT(icon, n, at, step, label, x, y, w):
    """Count element: t='count', icon from IconName, n=number, step=frames per count, label<=4 words."""
    e = {'t': 'count', 'icon': icon, 'n': n, 'at': at, 'step': step, 'x': x, 'y': y, 'w': w}
    if label:
        e['label'] = label
    return [e]


def CHK(rows, at, step, x, y, w):
    """Checklist element: t='checklist', rows=[(text, mark)], mark in tick|cross|none."""
    e = {'t': 'checklist', 'rows': [{'text': t, 'mark': m} for t, m in rows], 'at': at, 'step': step, 'x': x, 'y': y, 'w': w}
    return [e]


def SPL(left, right, at, step, vs=True):
    """Split element: t='split', left/right=(icon, label), vs defaults to True."""
    e = {'t': 'split', 'at': at, 'step': step,
         'left': {'icon': left[0], 'label': left[1]},
         'right': {'icon': right[0], 'label': right[1]}}
    if vs:
        e['vs'] = 'vs'
    return [e]


def HERO(icon, label, at, x, y, size, burst=False):
    """Hero element: t='hero', icon from IconName, label<=4 words."""
    e = {'t': 'hero', 'icon': icon, 'label': label, 'at': at, 'x': x, 'y': y, 'size': size}
    if burst:
        e['burst'] = True
    return [e]


def XO(icon, label, at, crossAt, x, y, size):
    """Crossout element: t='crossout', icon from IconName, label<=4 words."""
    e = {'t': 'crossout', 'icon': icon, 'at': at, 'crossAt': crossAt, 'x': x, 'y': y, 'size': size}
    if label:
        e['label'] = label
    return [e]


def QT(text, who, at, x, y, w):
    """Quote element: t='quote'."""
    e = {'t': 'quote', 'text': text, 'at': at, 'x': x, 'y': y, 'w': w}
    if who:
        e['who'] = who
    return [e]


def BN(value, label, at, dur, x, y, suffix=None):
    """Bignum element: t='bignum'."""
    e = {'t': 'bignum', 'value': value, 'label': label, 'at': at, 'dur': dur, 'x': x, 'y': y}
    if suffix:
        e['suffix'] = suffix
    return [e]


# ----- existing element helpers -----
def FL(items, at, step, w=420, gap=120, y=560, color='orange'):
    return [{'t': 'flow', 'x': 960, 'y': y, 'w': w, 'gap': gap, 'at': at, 'step': step,
             'items': items, 'color': color}]


def BR(items, at, step, w=900, h=420, y=820):
    return [{'t': 'bars', 'x': 960, 'y': y, 'w': w, 'h': h, 'at': at, 'step': step,
             'items': [dict(zip(('label', 'value', 'text'), (*it, '')[:3])) for it in items]}]


def TL(left, right, at, bracket, bracket_at):
    return [{'t': 'timeline', 'x1': 300, 'x2': 1620, 'y': 620, 'left': left, 'right': right,
             'at': at, 'bracket': bracket, 'bracketAt': bracket_at}]


# 2D "camera angles" for scene shots (Cam schema in engine/ink/parts/schema.ts).
def PUSH(fx, fy=540, s=CAM_SCALE):
    return {'from': [1.0, STAGE_W / 2, STAGE_H / 2], 'to': [s, fx, fy]}


def PAN(fx0, fx1, s=CAM_SCALE, fy=540):
    return {'from': [s, fx0, fy], 'to': [s, fx1, fy]}


def S(start, bg, *els, chip=None, chipAt=None, cam=None):
    flat = [e for group in els for e in group]
    return {'start': start, 'bg': bg, 'els': flat, 'chip': chip, 'chipAt': chipAt, 'cam': cam}


L, R = 600, 1320          # left / right thirds for words opposite a sprite

# Load v10 parts as base, then apply swaps
with open(V10 / 'p03.json') as f:
    v10_p03 = json.load(f)
with open(V10 / 'p04.json') as f:
    v10_p04 = json.load(f)
with open(V10 / 'p05.json') as f:
    v10_p05 = json.load(f)
with open(V10 / 'p06.json') as f:
    v10_p06 = json.load(f)
with open(V10 / 'p07.json') as f:
    v10_p07 = json.load(f)
with open(V10 / 'p08.json') as f:
    v10_p08 = json.load(f)
with open(V10 / 'p09.json') as f:
    v10_p09 = json.load(f)
with open(V10 / 'p10.json') as f:
    v10_p10 = json.load(f)
with open(V10 / 'p11.json') as f:
    v10_p11 = json.load(f)
with open(V10 / 'p12.json') as f:
    v10_p12 = json.load(f)
with open(V10 / 'p13.json') as f:
    v10_p13 = json.load(f)
with open(V10 / 'p14.json') as f:
    v10_p14 = json.load(f)
with open(V10 / 'p15.json') as f:
    v10_p15 = json.load(f)
with open(V10 / 'p16.json') as f:
    v10_p16 = json.load(f)
with open(V10 / 'p17.json') as f:
    v10_p17 = json.load(f)
with open(V10 / 'p18.json') as f:
    v10_p18 = json.load(f)
with open(V10 / 'p19.json') as f:
    v10_p19 = json.load(f)
with open(V10 / 'p20.json') as f:
    v10_p20 = json.load(f)
with open(V10 / 'p21.json') as f:
    v10_p21 = json.load(f)
with open(V10 / 'p22.json') as f:
    v10_p22 = json.load(f)
with open(V10 / 'p23.json') as f:
    v10_p23 = json.load(f)
with open(V10 / 'p24.json') as f:
    v10_p24 = json.load(f)

# Helper to convert v10 shot dict (with 'start', 'bg', 'els', 'chip', 'chipAt', 'cam')
# to our internal shot format for building
def v10_to_internal(shot):
    return {
        'start': shot['f0'],
        'bg': shot['bg'],
        'els': shot['els'],
        'chip': shot.get('chip'),
        'chipAt': shot.get('chipAt'),
        'cam': shot.get('cam'),
    }

# Build internal PARTS dict from v10 JSON, then apply swaps
PARTS = {}

# p03
PARTS['p03'] = [v10_to_internal(s) for s in v10_p03['shots']]
# p04
PARTS['p04'] = [v10_to_internal(s) for s in v10_p04['shots']]
# p05
PARTS['p05'] = [v10_to_internal(s) for s in v10_p05['shots']]
# p06
PARTS['p06'] = [v10_to_internal(s) for s in v10_p06['shots']]
# p07
PARTS['p07'] = [v10_to_internal(s) for s in v10_p07['shots']]
# p08
PARTS['p08'] = [v10_to_internal(s) for s in v10_p08['shots']]
# p09
PARTS['p09'] = [v10_to_internal(s) for s in v10_p09['shots']]
# p10
PARTS['p10'] = [v10_to_internal(s) for s in v10_p10['shots']]
# p11
PARTS['p11'] = [v10_to_internal(s) for s in v10_p11['shots']]
# p12
PARTS['p12'] = [v10_to_internal(s) for s in v10_p12['shots']]
# p13
PARTS['p13'] = [v10_to_internal(s) for s in v10_p13['shots']]
# p14
PARTS['p14'] = [v10_to_internal(s) for s in v10_p14['shots']]
# p15
PARTS['p15'] = [v10_to_internal(s) for s in v10_p15['shots']]
# p16
PARTS['p16'] = [v10_to_internal(s) for s in v10_p16['shots']]
# p17
PARTS['p17'] = [v10_to_internal(s) for s in v10_p17['shots']]
# p18
PARTS['p18'] = [v10_to_internal(s) for s in v10_p18['shots']]
# p19
PARTS['p19'] = [v10_to_internal(s) for s in v10_p19['shots']]
# p20
PARTS['p20'] = [v10_to_internal(s) for s in v10_p20['shots']]
# p21
PARTS['p21'] = [v10_to_internal(s) for s in v10_p21['shots']]
# p22
PARTS['p22'] = [v10_to_internal(s) for s in v10_p22['shots']]
# p23
PARTS['p23'] = [v10_to_internal(s) for s in v10_p23['shots']]
# p24
PARTS['p24'] = [v10_to_internal(s) for s in v10_p24['shots']]


# ---- Apply the 17 swaps ----
# Each swap: find shot by start frame, replace its elements

# 1986: drop the bars; add CNT('bill', 9, 1997, 8, 'BILLS', 960, 640, 900); keep words BILLS KEEP GROWING
for s in PARTS['p03']:
    if s['start'] == 1986:
        # Keep the O('BILLS KEEP GROWING', 2061, y=180, size=100) words element
        # Drop the BR (bars) element
        new_els = []
        for e in s['els']:
            if e['t'] == 'words' and e['text'] == 'BILLS KEEP GROWING':
                new_els.append(e)
        new_els.extend(CNT('bill', 9, 1997, 8, 'BILLS', 960, 640, 900))
        s['els'] = new_els
        break

# 3240: keep sprite; drop words 5 LANGUAGES and the 3 tags; add CNT('letter', 5, 3255, 6, '5 LANGUAGES', 1340, 540, 760)
for s in PARTS['p05']:
    if s['start'] == 3240:
        new_els = []
        for e in s['els']:
            if e['t'] == 'sprite':
                new_els.append(e)
        new_els.extend(CNT('letter', 5, 3255, 6, '5 LANGUAGES', 1340, 540, 760))
        s['els'] = new_els
        break

# 3507: keep words JUST; drop flow; add CHK([('A SUIT','tick'),('A SMILE','tick'),('PATIENCE','tick')], 3534, 30, 960, 560, 760)
for s in PARTS['p05']:
    if s['start'] == 3507:
        new_els = []
        for e in s['els']:
            if e['t'] == 'words' and e['text'] == 'JUST':
                new_els.append(e)
        new_els.extend(CHK([('A SUIT', 'tick'), ('A SMILE', 'tick'), ('PATIENCE', 'tick')], 3534, 30, 960, 560, 760))
        s['els'] = new_els
        break

# 5006: drop words RULE 3 and the flow; add HERO('clock', 'RULE 3: WAIT', 5012, 960, 520, 360)
for s in PARTS['p07']:
    if s['start'] == 5006:
        new_els = []
        # Drop everything, add HERO
        new_els.extend(HERO('clock', 'RULE 3: WAIT', 5012, 960, 520, 360))
        s['els'] = new_els
        break

# 5580: sprite x -> 1500 (keep the rest of it); drop words BE and flow; add CHK([('BE CAREFUL','tick'),('BE CALM','tick'),('BE KIND','tick')], 5617, 31, 760, 540, 760)
for s in PARTS['p08']:
    if s['start'] == 5580:
        new_els = []
        for e in s['els']:
            if e['t'] == 'sprite':
                # Keep sprite but change x to 1500
                e = dict(e)
                e['x'] = 1500
                new_els.append(e)
        new_els.extend(CHK([('BE CAREFUL', 'tick'), ('BE CALM', 'tick'), ('BE KIND', 'tick')], 5617, 31, 760, 540, 760))
        s['els'] = new_els
        break

# 6120: drop words, tick and flow; add HERO('mask', 'HE HAD THE IDEA', 6135, 960, 520, 360, burst=True)
for s in PARTS['p09']:
    if s['start'] == 6120:
        new_els = []
        new_els.extend(HERO('mask', 'HE HAD THE IDEA', 6135, 960, 520, 360, burst=True))
        s['els'] = new_els
        break

# 7372: keep words PEOPLE TRUST; drop flow and words FIRST; add SPL(('hotel','THE ROOM'), ('hat','THE PERSON FIRST'), 7395, 47)
for s in PARTS['p10']:
    if s['start'] == 7372:
        new_els = []
        for e in s['els']:
            if e['t'] == 'words' and e['text'] == 'PEOPLE TRUST':
                new_els.append(e)
        new_els.extend(SPL(('hotel', 'THE ROOM'), ('hat', 'THE PERSON FIRST'), 7395, 47))
        s['els'] = new_els
        break

# 8500: keep words HE PREPARED EVERY DETAIL; drop flow; add CHK([('PAPERS','tick'),('TITLE','tick'),('HOTEL','tick'),('ORDER','tick')], 8599, 33, 960, 600, 760)
for s in PARTS['p11']:
    if s['start'] == 8500:
        new_els = []
        for e in s['els']:
            if e['t'] == 'words' and e['text'] == 'HE PREPARED EVERY DETAIL':
                new_els.append(e)
        new_els.extend(CHK([('PAPERS', 'tick'), ('TITLE', 'tick'), ('HOTEL', 'tick'), ('ORDER', 'tick')], 8599, 33, 960, 600, 760))
        s['els'] = new_els
        break

# 8900: keep sprite and words NO SECOND TAKE; drop stamp ONE AFTERNOON; add BN(1, 'AFTERNOON', 9021, 24, 760, 640)
for s in PARTS['p11']:
    if s['start'] == 8900:
        new_els = []
        for e in s['els']:
            if e['t'] == 'sprite' or (e['t'] == 'words' and e['text'] == 'NO SECOND TAKE'):
                new_els.append(e)
        new_els.extend(BN(1, 'AFTERNOON', 9021, 24, 760, 640))
        s['els'] = new_els
        break

# 9730: keep the photo and tag A FORTUNE; drop words 7,000 TONS, its underline, words OF IRON; add BN(7000, 'OF IRON', 9745, 45, 760, 420, suffix=' TONS')
for s in PARTS['p13']:
    if s['start'] == 9730:
        new_els = []
        for e in s['els']:
            if e['t'] == 'photo' or (e['t'] == 'tag' and e['text'] == 'A FORTUNE'):
                new_els.append(e)
        new_els.extend(BN(7000, 'OF IRON', 9745, 45, 760, 420, suffix=' TONS'))
        s['els'] = new_els
        break

# 12216: drop everything; add SPL(('mask','NOT A LIE'), ('coin','A SMALL SIN'), 12230, 88)
for s in PARTS['p15']:
    if s['start'] == 12216:
        new_els = []
        new_els.extend(SPL(('mask', 'NOT A LIE'), ('coin', 'A SMALL SIN'), 12230, 88))
        s['els'] = new_els
        break

# 12736: keep words POISSON PAID; drop bars; add SPL(('tower','TOWER PAID'), ('coin','BRIBE PAID AGAIN'), 12781, 37)
for s in PARTS['p16']:
    if s['start'] == 12736:
        new_els = []
        for e in s['els']:
            if e['t'] == 'words' and e['text'] == 'POISSON PAID':
                new_els.append(e)
        new_els.extend(SPL(('tower', 'TOWER PAID'), ('coin', 'BRIBE PAID AGAIN'), 12781, 37))
        s['els'] = new_els
        break

# 13106: keep sprite and words SILENCE.; drop words NO and flow; add XO('newspaper', 'HEADLINES', 13110, 13150, 760, 440, 300)
for s in PARTS['p17']:
    if s['start'] == 13106:
        new_els = []
        for e in s['els']:
            if e['t'] == 'sprite' or (e['t'] == 'words' and e['text'] == 'SILENCE.'):
                new_els.append(e)
        new_els.extend(XO('newspaper', 'HEADLINES', 13110, 13150, 760, 440, 300))
        s['els'] = new_els
        break

# 15140: keep sprite and words NEED TO BE BELIEVED (with its underline); drop words NOT THE POLICE and its cross; add XO('handcuffs', 'THE POLICE', 15144, 15159, 760, 260, 200)
for s in PARTS['p19']:
    if s['start'] == 15140:
        new_els = []
        for e in s['els']:
            if e['t'] == 'sprite' or (e['t'] == 'words' and e['text'] == 'NEED TO BE BELIEVED'):
                new_els.append(e)
            elif e['t'] == 'underline':
                # Keep underline that belongs to NEED TO BE BELIEVED
                # The underline has x=960, y=500+round(90*0.55)=549, at=15191
                # Check if it matches the kept words
                if e['x'] == 960 and e['y'] == 549:
                    new_els.append(e)
        new_els.extend(XO('handcuffs', 'THE POLICE', 15144, 15159, 760, 260, 200))
        s['els'] = new_els
        break

# 18674: keep sprite; drop tag, both words and the underline; add QT('OCCUPATION: APPRENTICE SALESMAN', 'DEATH CERTIFICATE', 18682, 860, 480, 1100)
for s in PARTS['p23']:
    if s['start'] == 18674:
        new_els = []
        for e in s['els']:
            if e['t'] == 'sprite':
                new_els.append(e)
        new_els.extend(QT('OCCUPATION: APPRENTICE SALESMAN', 'DEATH CERTIFICATE', 18682, 860, 480, 1100))
        s['els'] = new_els
        break

# 18956: keep sprite; drop both words and the underline; add CHK([('MONEY','cross'),('TITLE','cross'),('JUST A NUMBER','none')], 18961, 30, 760, 520, 760)
for s in PARTS['p23']:
    if s['start'] == 18956:
        new_els = []
        for e in s['els']:
            if e['t'] == 'sprite':
                new_els.append(e)
        new_els.extend(CHK([('MONEY', 'cross'), ('TITLE', 'cross'), ('JUST A NUMBER', 'none')], 18961, 30, 760, 520, 760))
        s['els'] = new_els
        break

# 19160: keep sprite and words GIVE PEOPLE A REASON; drop TO FEEL SPECIAL; add HERO('crown', 'FEEL SPECIAL', 19188, 800, 600, 300)
for s in PARTS['p24']:
    if s['start'] == 19160:
        new_els = []
        for e in s['els']:
            if e['t'] == 'sprite' or (e['t'] == 'words' and e['text'] == 'GIVE PEOPLE A REASON'):
                new_els.append(e)
        new_els.extend(HERO('crown', 'FEEL SPECIAL', 19188, 800, 600, 300))
        s['els'] = new_els
        break


# ---- Add TOWERS SOLD HUD chips ----
# shot 12874 gets chip='TOWERS SOLD: 1', chipAt=12880
for s in PARTS['p16']:
    if s['start'] == 12874:
        s['chip'] = 'TOWERS SOLD: 1'
        s['chipAt'] = 12880
        break

# shot 14370 gets chip='TOWERS SOLD: 2', chipAt=14376
for s in PARTS['p19']:
    if s['start'] == 14370:
        s['chip'] = 'TOWERS SOLD: 2'
        s['chipAt'] = 14376
        break


def bg_key(bg):
    return bg.get('plate') or bg.get('photo') or 'card'


# ---------- same effort every quarter ----------
ANGLE_PLATES = ('birdseye', 'low_angle', 'corner_34', 'topdown', 'doorway_framed', 'extreme_wide', 'closeup',
                'high_angle', 'over_', 'through_', 'dutch', 'looking_down', 'framing', 'backseat')
PHOTO_MAX = 1
PLATE_MAX = 2
SPRITE_MAX = 4
TOPDOWN_SPRITE_MAX = 2
QUARTER_MIN = {'photo': 3}
TEXT_ELS = {'words', 'cross', 'tag', 'stamp', 'underline', 'tick', 'redact'}
ICON_H = round(0.3 * STAGE_H)
CARD_WORDS_MAX = 4
CARD_LINES_MAX = 2
FLOORLESS = ('high_angle', 'birdseye', 'topdown', 'looking_down')
FRAMINGS_MIN = 4
MOVE_MIN = 1.1


def framing(shot):
    bg, cam = shot['bg'], shot.get('cam')
    if 'card' in bg:
        return 'card'
    if 'photo' in bg:
        return 'photo'
    if any(e['t'] == 'photo' for e in shot['els']):
        return 'photo-insert'
    if cam and cam['from'][0] == cam['to'][0]:
        return 'pan'
    z0, z1 = bg.get('zoom', [1, 1])
    c0, c1 = (cam['from'][0], cam['to'][0]) if cam else (1, 1)
    move = (z1 * c1) / (z0 * c0)
    if move > MOVE_MIN:
        return 'push'
    if move < 1 / MOVE_MIN:
        return 'pull'
    if not any(e['t'] == 'sprite' for e in shot['els']):
        return 'object'
    return 'plate'


def text_only(shot):
    return 'photo' not in shot['bg'] and all(e['t'] in TEXT_ELS for e in shot['els'])


def reuse_errors(parts):
    photos, plates = collections.defaultdict(list), collections.defaultdict(list)
    for shots in parts.values():
        for s in shots:
            for src in [s['bg'].get('photo')] + [e['src'] for e in s['els'] if e['t'] == 'photo']:
                if src:
                    photos[src].append(s['start'])
            if 'plate' in s['bg']:
                plates[s['bg']['plate']].append(s['start'])
    return ([f'photo {k} used {len(v)}x > {PHOTO_MAX}: {v}' for k, v in photos.items() if len(v) > PHOTO_MAX] +
            [f'plate {k} used {len(v)}x > {PLATE_MAX}: {v}' for k, v in plates.items() if len(v) > PLATE_MAX])


def sprite_reuse_errors(parts):
    uses = collections.defaultdict(list)
    for shots in parts.values():
        for s in shots:
            for e in s['els']:
                if e['t'] == 'sprite':
                    uses[e['src'].rsplit('/', 1)[-1].removesuffix('.png')].append(s['start'])
    errs = []
    for k, v in uses.items():
        cap = TOPDOWN_SPRITE_MAX if '_topdown_' in f'_{k}_' else SPRITE_MAX
        if len(v) > cap:
            errs.append(f'sprite {k} used {len(v)}x > {cap}: {v}')
    return errs


def angle_errors(parts):
    errs = []
    for shots in parts.values():
        for s in shots:
            plate = s['bg'].get('plate', '').rsplit('/', 1)[-1]
            need = next((v for k, v in ANGLE_SPRITE.items() if k in plate), None)
            if not need:
                continue
            for e in s['els']:
                name = '_' + e.get('src', '').rsplit('/', 1)[-1].removesuffix('.png') + '_'
                if e['t'] == 'sprite' and not any(tag in name for tag in need):
                    errs.append(f'{s["start"]}: eye-level sprite {name.strip("_")} on angled plate {plate}')
    return errs


def quarter_balance(parts, end):
    counts = [dict.fromkeys(QUARTER_MIN, 0) for _ in range(4)]
    for shots in parts.values():
        for s in shots:
            c = counts[min(3, s['start'] * 4 // end)]
            c['photo'] += ('photo' in s['bg']) + sum(e['t'] == 'photo' for e in s['els'])
    errs = [f'Q{i + 1}: {k}={c[k]} < {m}' for i, c in enumerate(counts) for k, m in QUARTER_MIN.items() if c[k] < m]
    return counts, errs


# ---------- frame-safe words ----------
GLYPH_BOX = 0.62
CAP_H = 0.6
SAFE = 48
PLATE_ORIGIN = '50% 60%'


def _origin(bg):
    ox, oy = (float(v.rstrip('%')) / 100 for v in bg.get('origin', PLATE_ORIGIN).split())
    return ox * STAGE_W, oy * STAGE_H


def _states(shot):
    bg, cam, out = shot['bg'], shot['cam'], []
    for t in (0, 1):
        z = bg['zoom'][t] if 'plate' in bg else 1.0
        ox, oy = _origin(bg) if 'plate' in bg else (0, 0)
        ax, bx, ay, by = z, ox * (1 - z), z, oy * (1 - z)
        if cam:
            s, fx, fy = cam['to'] if t else cam['from']
            tx = min(0, max(STAGE_W * (1 - s), STAGE_W / 2 - s * fx))
            ty = min(0, max(STAGE_H * (1 - s), STAGE_H / 2 - s * fy))
            ax, bx, ay, by = s * ax, s * bx + tx, s * ay, s * by + ty
        out.append((ax, bx, ay, by))
    return out


def fit_words(shot):
    log = []
    states = _states(shot)
    for e in [e for e in shot['els'] if e['t'] == 'words']:
        ul = next((u for u in shot['els'] if u['t'] == 'underline' and u['x'] == e['x']
                   and u['y'] == e['y'] + round(e['size'] * 0.55)), None)
        x0, y0, size0 = e['x'], e['y'], e['size']
        for _ in range(8):
            hw, hh = GLYPH_BOX * e['size'] * len(e['text']) / 2, CAP_H * e['size']
            lo_x = max((SAFE - bx) / ax + hw for ax, bx, _, _ in states)
            hi_x = min((STAGE_W - SAFE - bx) / ax - hw for ax, bx, _, _ in states)
            lo_y = max((SAFE - by) / ay + hh for _, _, ay, by in states)
            if lo_x <= hi_x:
                break
            e['size'] = int(e['size'] * 0.92)
        e['x'] = round(min(max(e['x'], lo_x), hi_x)) if lo_x <= hi_x else STAGE_W // 2
        e['y'] = round(max(e['y'], lo_y))
        if (e['x'], e['y'], e['size']) != (x0, y0, size0):
            log.append(f"{e['text']}: x {x0}->{e['x']} y {y0}->{e['y']} size {size0}->{e['size']}")
            if ul:
                ul['x'], ul['y'] = e['x'], e['y'] + round(e['size'] * 0.55)
                ul['w'] = round(GLYPH * e['size'] * len(e['text']))
    return log


# ---------- sprites fitted to the frame ----------
SPRITE_BOX_W = 900
TOPDOWN_MAX_H = round(0.36 * STAGE_H)
_ink_cache = {}


def _sprite_ink(src):
    if src not in _ink_cache:
        from PIL import Image
        im = Image.open(ASSETS / src)
        l, t, r, b = im.getchannel('A').getbbox() if 'A' in im.getbands() else (0, 0, *im.size)
        W, H = im.size
        _ink_cache[src] = (W / H, (l / W, t / H, r / W, b / H))
    return _ink_cache[src]


def _sprite_box(e):
    ar, (fl, ft, fr, fb) = _sprite_ink(e['src'])
    w = min(SPRITE_BOX_W, e['h'] * ar)
    h = w / ar
    if e.get('flip'):
        fl, fr = 1 - fr, 1 - fl
    return -w / 2 + fl * w, e['y'] - h + ft * h, -w / 2 + fr * w, e['y'] - h + fb * h


def fit_sprites(shot):
    log, states = [], _states(shot)
    for e in [e for e in shot['els'] if e['t'] == 'sprite']:
        x0, h0, y0 = e['x'], e['h'], e['y']
        topdown = '_topdown_' in e['src']
        if topdown:
            e['h'] = min(e['h'], TOPDOWN_MAX_H)
        for _ in range(12):
            l, t, r, b = _sprite_box(e)
            lo_x = max((SAFE - bx) / ax - l for ax, bx, _, _ in states)
            hi_x = min((STAGE_W - SAFE - bx) / ax - r for ax, bx, _, _ in states)
            hi_dy = min((STAGE_H - SAFE - by) / ay - b for _, _, ay, by in states) if topdown else 0
            fits_y = all(ay * (t + min(0, hi_dy)) + by >= SAFE for _, _, ay, by in states)
            if lo_x <= hi_x and fits_y:
                break
            e['h'] = int(e['h'] * 0.94)
        else:
            raise SystemExit(f"{shot['start']}: sprite {e['src']} cannot fit the frame")
        for k in ('x', 'x2'):
            if k in e:
                e[k] = round(min(max(e[k], lo_x), hi_x))
        e['y'] = round(e['y'] + min(0, hi_dy))
        if (e['x'], e['h'], e['y']) != (x0, h0, y0):
            log.append(f"{e['src'].rsplit('/', 1)[-1]}: x {x0}->{e['x']} y {y0}->{e['y']} h {h0}->{e['h']}")
    return log


# ---------- crosses fitted to their word ----------
STRIKE_PAD = 30
STRIKE_H = 1.1


def pair_crosses(shot):
    words = [e for e in shot['els'] if e['t'] == 'words']
    return [(c, next((w for w in words if (w['x'], w['y']) == (c['x'], c['y'])), None))
            for c in shot['els'] if c['t'] == 'cross']


def fit_crosses(pairs):
    for c, w in pairs:
        if w:
            c['x'], c['y'] = w['x'], w['y']
            c['w'] = round(GLYPH_BOX * w['size'] * len(w['text'])) + 2 * STRIKE_PAD
            c['h'] = round(STRIKE_H * w['size'])


def cross_overlaps(shot):
    boxes = [(e['x'] - e.get('w', e['size']) / 2, e['y'] - e.get('h', e['size']) / 2,
              e['x'] + e.get('w', e['size']) / 2, e['y'] + e.get('h', e['size']) / 2)
             for e in shot['els'] if e['t'] == 'cross']
    return [(a, b) for i, a in enumerate(boxes) for b in boxes[i + 1:]
            if a[0] < b[2] and b[0] < a[2] and a[1] < b[3] and b[1] < a[3]]


# 2D viewpoint rule
ANGLE_SPRITE = {
    'topdown': ('_topdown_',), 'birdseye': ('_topdown_',), 'looking_down': ('_topdown_',),
    'low_angle': ('_from_below_',), 'high_angle': ('_high_angle_',),
    'over_': ('_back_',), 'through_': ('_back_',), 'doorway': ('_back_',),
    'backseat': ('_back_',), 'framing': ('_back_',),
}


def layout_of(shot):
    """Return list of layout types in this shot (from LAYOUTS)."""
    return [e['t'] for e in shot['els'] if e['t'] in LAYOUTS]


def photos_of(shot):
    """Return list of photo sources in this shot (bg + elements)."""
    return [shot['bg'].get('photo')] + [e['src'] for e in shot['els'] if e['t'] == 'photo']


def build():
    OUT.mkdir(parents=True, exist_ok=True)
    errors, rows, fits = [], [], []
    prev_bg = None
    for pid, shots in PARTS.items():
        v1 = json.loads((V1 / f'{pid}.json').read_text(encoding='utf-8'))
        f0, f1 = v1['f0'], v1['f1']
        if shots[0]['start'] != f0:
            errors.append(f'{pid}: first shot starts {shots[0]["start"]} != part f0 {f0}')
        out = []
        for i, s in enumerate(shots):
            end = shots[i + 1]['start'] if i + 1 < len(shots) else f1
            if end - s['start'] < 30:
                errors.append(f'{pid}@{s["start"]}: shot only {end - s["start"]}f')
            key = bg_key(s['bg'])
            if key == prev_bg and key != 'card':
                errors.append(f'{pid}@{s["start"]}: same background as previous shot ({key})')
            if key == 'card' and prev_bg == 'card':
                errors.append(f'{pid}@{s["start"]}: two cards in a row')
            prev_bg = key
            if key == 'card':
                for e in s['els']:
                    if e['t'] == 'sprite':
                        e['h'] = min(e['h'], ICON_H)
                lines = [e['text'] for e in s['els'] if e['t'] == 'words']
                if len(lines) > CARD_LINES_MAX:
                    errors.append(f'{pid}@{s["start"]}: card has {len(lines)} lettered lines > {CARD_LINES_MAX}')
                errors += [f'{pid}@{s["start"]}: card line "{t}" > {CARD_WORDS_MAX} words' for t in lines if len(t.split()) > CARD_WORDS_MAX]
            if any(k in s['bg'].get('plate', '') for k in FLOORLESS) and any(e['t'] == 'sprite' for e in s['els']):
                errors.append(f'{pid}@{s["start"]}: figure on floorless plate {s["bg"]["plate"]}')
            if text_only(s):
                errors.append(f'{pid}@{s["start"]}: text-only shot, needs a living picture')
            pairs = pair_crosses(s)
            fits += [f'{pid}@{s["start"]} {m}' for m in fit_words(s)]
            fits += [f'{pid}@{s["start"]} {m}' for m in fit_sprites(s)]
            fit_crosses(pairs)
            if cross_overlaps(s):
                errors.append(f'{pid}@{s["start"]}: crosses overlap')
            for e in s['els']:
                times = [e[k] for k in ('at', 'bracketAt') if k in e]
                if 'cut' in e:
                    times += e['cut']
                if e['t'] in ('bars', 'flow'):
                    times.append(e['at'] + (len(e['items']) - 1) * e['step'])
                elif e['t'] == 'count':
                    times.append(e['at'] + (e['n'] - 1) * e['step'])
                elif e['t'] == 'checklist':
                    times.append(e['at'] + (len(e['rows']) - 1) * e['step'])
                elif e['t'] == 'split':
                    times.append(e['at'] + e['step'])
                elif e['t'] == 'crossout':
                    times.append(e['crossAt'])
                elif e['t'] == 'bignum':
                    times.append(e['at'] + e['dur'])
                for t in times:
                    if not s['start'] <= t <= end - TAIL:
                        errors.append(f'{pid}@{s["start"]}-{end}: {e["t"]} {e.get("text", e.get("label", ""))} at {t} outside shot')
            if s['chipAt'] is not None and not s['start'] <= s['chipAt'] <= end - TAIL:
                errors.append(f'{pid}@{s["start"]}: chip at {s["chipAt"]} outside shot')
            shot = {'f0': s['start'], 'f1': end, 'bg': s['bg']}
            if s['cam']:
                shot['cam'] = s['cam']
            if s['chip']:
                shot['chip'], shot['chipAt'] = s['chip'], s['chipAt']
            shot['els'] = s['els']
            out.append(shot)
        kinds_seen = {framing(s) for s in shots}
        # A part can show at most one framing per scene shot plus 'card'; short parts need every shot different.
        scene_n = sum(framing(s) != 'card' for s in shots)
        need = min(FRAMINGS_MIN, scene_n + any(framing(s) == 'card' for s in shots))
        if len(kinds_seen) < need:
            errors.append(f'{pid}: {len(kinds_seen)} framings {sorted(kinds_seen)} < {need}')
        (OUT / f'{pid}.json').write_text(json.dumps({
            '_doc': f'v11b of {pid} (generated by tools/ink/make_v11b_shots.py; edit there).',
            'part': pid, 'f0': f0, 'f1': f1, 'shots': out
        }, separators=(',', ':')))
    errors += reuse_errors(PARTS)
    errors += sprite_reuse_errors(PARTS)
    errors += angle_errors(PARTS)
    _, qerrs = quarter_balance(PARTS, f1)
    errors += qerrs

    # Layout type caps (flow 2, bars 1, any other 4) and no same layout on back-to-back cards
    all_shots = []
    for shots in PARTS.values():
        all_shots.extend(shots)
    n = {}
    for s in all_shots:
        for t in set(layout_of(s)):
            n[t] = n.get(t, 0) + 1
    for t, c in n.items():
        cap = TYPE_CAP.get(t, TYPE_CAP_ANY)
        if c > cap:
            errors.append(f'{t} used {c}x > {cap}')
    cards = [s for s in all_shots if s['bg'].get('card')]
    for i in range(1, len(cards)):
        shared = set(layout_of(cards[i])).intersection(layout_of(cards[i-1]))
        if shared:
            errors.append(f'cards {cards[i-1]["f0"]} and {cards[i]["f0"]} repeat layout {shared}')

    # At most 2 card shots in a row
    run = 0
    for s in all_shots:
        run = run + 1 if s['bg'].get('card') else 0
        if run > 2:
            errors.append(f'3 cards in a row ending {s["f0"]}')

    # Photo spread (no 2-min gap) and used at most once plus one callback
    uses = {}
    last = PARTS['p03'][0]['start']
    for s in all_shots:
        ph = photos_of(s)
        for src in ph:
            if src:
                uses[src] = uses.get(src, 0) + 1
        if ph:
            if s['start'] - last > PHOTO_GAP_MAX:
                errors.append(f'photo gap {last}->{s["start"]}')
            last = s['start']
    for src, c in uses.items():
        if c > PHOTO_USES_MAX:
            errors.append(f'{src} used {c}x > {PHOTO_USES_MAX}')

    if fits:
        print('FITS:', *fits, sep='\n  ')
    if errors:
        print('ERRORS:', *errors, sep='\n  ')
        raise SystemExit(1)
    print(f'OK: wrote {len(PARTS)} parts to {OUT}')


if __name__ == '__main__':
    build()