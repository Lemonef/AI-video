"""Ep02 (Blackbeard) first-minute shot lists, two cuts of the same opening:

  hybrid   = history + two joke beats (b8 "retirement plan", b10 "chocolate delivery"); 28 shots.
  straight = history only (b8/b10 cut from the VO); b4 split in two so minute one keeps >= 26 cuts.

Shot starts come from each cut's timeline.json (VO beat timing), so the picture can never drift
from the voice. Helpers and lints are copied from make_v11b_shots.py (that file loads the ep01
v10 parts at import time, so it cannot be imported); the ep01-only rules (angled plates, quarter
photo balance) are dropped. Ep02 paints its figures into eleven scenes and uses two public-domain
photos, so no pasted sprites appear on those shots.

Run: python tools/ink/make_ep02_min1_shots.py -> engine/ink/parts/shots_ep02min1/{hybrid,straight}.json
"""
import collections
import hashlib
import json
import pathlib
import sys

ROOT = pathlib.Path(__file__).resolve().parents[2]
# count-card cap is read from the engine (single source), so the lint and the renderer cannot drift
COUNT_MAX = int(__import__('re').search(r'COUNT_MAX = (\d+)', (ROOT / 'engine/ink/parts/cards.tsx').read_text(encoding='utf-8')).group(1))
ASSETS = ROOT / 'videos/pastly-life/02-blackbeard-ink/assets'
OUT = ROOT / 'engine/ink/parts/shots_ep02min1'
CAST = 'ink/cast'
SCENES = 'ink/scenes'
PHOTOS = 'ink/photos'

STAGE_W, STAGE_H = 1920, 1080          # mirrors the stage size in engine/ink (1920x1080)
FLOOR = 1000                            # sprite baseline (same as ep01)
GLYPH = 0.5                             # words width per char per px of size (ep01 v8 p02)
CAM_SCALE = 1.12                        # default 2D camera push for scene shots
TAIL = 6                                # last element must land >= TAIL frames before the cut
MIN_SHOT = 30                           # SKILL rule: every cut >= 1 s
MIN1_CUTS = 26                          # SKILL rule: >= 26 cuts in minute one
ICON_USES_MAX = 2                       # SKILL rule: no icon more than twice per minute
WORD_CARD_SHARE = 0.15                  # SKILL rule: word-only cards <= 15% of shots
SPLIT_RANGE = (2, 4)                    # SKILL rule: 2-4 splits per minute
ONE_OBJECT_MIN = 3                      # SKILL rule: >= 3 one-object cards

METER_LABEL = 'SURVIVAL ODDS'
METER = {'b1': 12, 'b2': 12, 'b3': 12,   # hook: less than a day, stay to the end
         'b4': 35,                       # tonight / not worried
         'b5': 45,                       # inlet (map, s07 pan)
         'b6': 60,                       # party + toast
         'b7': 55,                       # whisper (both shots)
         'b8': 50,                       # great line / terrible plan
         'b9': 50,                       # treasure / cocoa / cotton
         'b10': 45}                      # most feared

TYPE_CAP = {'flow': 2, 'bars': 1}
TYPE_CAP_ANY = 4
LAYOUTS = ['flow', 'bars', 'timeline', 'count', 'split', 'hero', 'crossout', 'checklist', 'quote', 'bignum',
           'doc', 'map', 'grid', 'ring', 'scale', 'transform']
ICON_KEYS = ('icon', 'name')


# ---------- backgrounds ----------
REJECTED = json.loads((ASSETS / SCENES / 'REJECTED.json').read_text(encoding='utf-8'))['rejected']


def SC(name, zoom=(1.0, 1.08), origin=None):
    path = ASSETS / SCENES / f'{name}.png'
    assert path.exists(), f'missing scene {name}'
    digest = hashlib.md5(path.read_bytes()).hexdigest()
    assert digest not in REJECTED, f'scene {name} is a Zen-rejected image: {REJECTED.get(digest)}'
    bg = {'plate': f'{SCENES}/{name}.png', 'zoom': list(zoom)}
    if origin:
        bg['origin'] = origin
    return bg


def PH(name, pos='50% 35%', push=(1.0, 1.08)):
    assert (ASSETS / PHOTOS / name).exists(), f'missing photo {name}'
    return {'photo': f'{PHOTOS}/{name}', 'push': list(push), 'pos': pos}


CARD = {'card': True}
S01, S02, S03, S04, S05 = 's01_deck_party', 's02_inlet_lookout', 's03_deck_work', 's04_hold_cower', 's05_rail_thinking'
S06, S07, S08, S09, S10 = 's06_bb_calm', 's07_guests_toast', 's08_rail_whisper', 's09_hold_carry', 's10_bb_hips'
MAP, BB = 'moseley_map_1733.jpg', 'bb_engraving_1724.jpg'


# ---------- elements ----------
def W(text, at, x=960, y=300, size=100, color=None, ul=False):
    out = [{'t': 'words', 'text': text, 'x': x, 'y': y, 'size': size, 'at': at}]
    if color:
        out[0]['color'] = color
    if ul:
        out.append({'t': 'underline', 'x': x, 'y': y + round(size * 0.55),
                    'w': round(GLYPH * size * len(text)), 'at': at + 8})
    return out


def O(text, at, **k):
    return W(text, at, color='orange', **k)


def SP(name, at, x, h=680, flip=False, y=FLOOR):
    assert (ASSETS / CAST / f'{name}.png').exists(), f'missing sprite {name}'
    e = {'t': 'sprite', 'src': f'{CAST}/{name}.png', 'x': x, 'y': y, 'h': h, 'at': at}
    if flip:
        e['flip'] = True
    return [e]


def TG(text, at, x, y):
    return [{'t': 'tag', 'text': text, 'x': x, 'y': y, 'at': at}]


def X(at, x, y, size=300):
    return [{'t': 'cross', 'x': x, 'y': y, 'size': size, 'at': at}]


def CI(at, x, y, w, h):
    return [{'t': 'circle', 'x': x, 'y': y, 'w': w, 'h': h, 'at': at}]


def ST(text, at, x=960, y=380, rot=-8):
    return [{'t': 'stamp', 'text': text, 'x': x, 'y': y, 'rot': rot, 'color': 'red', 'at': at}]


def CNT(icon, n, at, step, label, x, y, w):
    e = {'t': 'count', 'icon': icon, 'n': n, 'at': at, 'step': step, 'x': x, 'y': y, 'w': w}
    if label:
        e['label'] = label
    return [e]


def SPL(left, right, at, step, vs='vs'):
    e = {'t': 'split', 'at': at, 'step': step,
         'left': {'icon': left[0], 'label': left[1]}, 'right': {'icon': right[0], 'label': right[1]}}
    if vs:
        e['vs'] = vs
    return [e]


def HERO(icon, label, at, x=960, y=520, size=420, burst=False):
    e = {'t': 'hero', 'icon': icon, 'label': label, 'at': at, 'x': x, 'y': y, 'size': size}
    if burst:
        e['burst'] = True
    return [e]


def XO(icon, label, at, crossAt, x=960, y=500, size=420):
    e = {'t': 'crossout', 'icon': icon, 'at': at, 'crossAt': crossAt, 'x': x, 'y': y, 'size': size}
    if label:
        e['label'] = label
    return [e]


def QT(text, who, at, x=960, y=500, w=1300):
    e = {'t': 'quote', 'text': text, 'at': at, 'x': x, 'y': y, 'w': w}
    if who:
        e['who'] = who
    return [e]


def BN(value, label, at, dur, x=960, y=520, suffix=None, year=False):
    e = {'t': 'bignum', 'value': value, 'label': label, 'at': at, 'dur': dur, 'x': x, 'y': y}
    if year:
        e['group'] = False  # a year reads 1718, not 1,718
    if suffix:
        e['suffix'] = suffix
    return [e]


def TF(a, b, at, step, label=None):
    e = {'t': 'transform', 'a': {'icon': a[0], 'label': a[1]}, 'b': {'icon': b[0], 'label': b[1]},
         'at': at, 'step': step}
    if label:
        e['label'] = label
    return [e]


# 2D camera moves (Cam schema in engine/ink/parts/schema.ts)
def PUSH(fx, fy=540, s=CAM_SCALE):
    return {'from': [1.0, STAGE_W / 2, STAGE_H / 2], 'to': [s, fx, fy]}


def PULL(fx, fy=540, s=CAM_SCALE):
    return {'from': [s, fx, fy], 'to': [1.0, STAGE_W / 2, STAGE_H / 2]}


def PAN(fx0, fx1, s=CAM_SCALE, fy=540):
    return {'from': [s, fx0, fy], 'to': [s, fx1, fy]}


def S(start, bg, *els, chip=None, chipAt=None, chipPos=None, meter=None, cam=None):
    flat = [e for group in els for e in group]
    return {'start': start, 'bg': bg, 'els': flat, 'chip': chip, 'chipAt': chipAt, 'chipPos': chipPos,
            'meter': meter, 'cam': cam}


L, R = 600, 1320          # left / right thirds for words opposite a sprite


# ---------- shared beats b1-b7 (same VO timing in both cuts) ----------
def opening():
    shots = [
        # b1 "You have less than a day to live."
        S(0, SC(S01), cam=PUSH(1300, 480, 1.22)),
        S(46, CARD, HERO('clock', 'UNDER 24 HOURS', 50, burst=True)),
        # b2 "one of about twenty men on Blackbeard's ship ... dead or hanged."
        S(91, SC(S02), TG("BLACKBEARD'S SHIP", 110, 960, 330), cam=PUSH(960, 470, 1.3)),
        S(153, CARD, CNT('man', 10, 156, 3, 'ABOUT 20 MEN · EACH = 2', 960, 520, 1300)),
        S(215, SC(S03), cam=PAN(500, 1420)),
        S(276, CARD, XO('man', 'BY NEXT SUMMER', 279, 300)),
        # b3 "Only two kinds of men walk away. Stay to the end ..."
        S(337, SC(S04, (1.0, 1.1)), O('ONLY 2 KINDS', 352, x=R, y=260)),
        S(390, CARD, SPL(('face', 'KIND ONE'), ('face', 'KIND TWO'), 393, 14, vs='?')),
        S(443, SC(S05, (1.08, 1.0)), W('STAY TO THE END', 456, x=R, y=220), cam=PULL(960, 520)),
    ]
    return shots


def tonight(split):
    """b4 'And the strangest part? Tonight, Blackbeard isn't worried at all.' (495..658)."""
    if not split:
        return [
            S(495, CARD, SP('bb_exp_deadpan', 498, 960, h=320, y=620), W('STRANGEST PART?', 506, y=220, size=110)),
            S(577, SC(S06, (1.0, 1.06)), O('NOT WORRIED', 590, x=R, y=240), cam=PAN(1400, 1100)),
        ]
    return [
        S(495, CARD, SP('bb_exp_deadpan', 498, 960, h=320, y=620), W('STRANGEST PART?', 503, y=220, size=110)),
        S(536, SC(S02), W('TONIGHT', 540, x=L, y=240), cam=PAN(400, 1300)),
        S(577, SC(S06, (1.0, 1.06)), O('NOT WORRIED', 590, x=R, y=240), cam=PAN(1400, 1100)),
    ]


def party():
    return [
        # b5 "21 November 1718. A small sloop anchored in a quiet inlet off North Carolina."
        S(658, CARD, BN(1718, '21 NOVEMBER', 661, 36, year=True)),
        S(721, PH(MAP, pos='50% 50%', push=(1.0, 1.12)),
          chip='OCRACOKE INLET, NORTH CAROLINA', chipAt=726, chipPos='tl'),
        S(784, CARD, HERO('ship', 'ONE SMALL SLOOP', 787)),
        S(847, SC(S07), cam=PAN(400, 1300)),
        # b6 "rum, laughing, guests from the little town of Bath ... one of them matters later."
        S(909, SC(S01, origin='30% 60%'), cam=PUSH(500, 620)),
        S(978, CARD, SP('bath_gent_stand', 981, 600, h=320, y=700), SP('bath_merchant_laugh', 987, 960, h=320, y=700),
          SP('bath_farmer_stand', 993, 1320, h=320, y=700), W('GUESTS FROM BATH', 1000, y=240, size=110)),
        S(1047, SC(S07), cam=PUSH(880, 700, 1.35)),
        S(1116, CARD, SP('bath_gent_sly', 1119, 960, h=320, y=640), CI(1130, 960, 480, 380, 380),
          O('REMEMBER HIM', 1136, y=220, size=110)),
        # b7 "... does your wife know where you buried your money? ... me and the devil knows ..."
        S(1185, SC(S08), cam=PUSH(1000, 500, 1.18)),
        S(1262, CARD, QT('Does your wife know where you buried your money?', 'A GUEST', 1266)),
        S(1339, SC(S08), cam=PUSH(1250, 480, 1.35)),
        S(1416, CARD, SP('bb_exp_angry_grin', 1419, 960, h=320, y=640), O('ME AND THE DEVIL', 1430, y=220, size=110)),
    ]


def hybrid():
    return opening() + tonight(False) + party() + [
        # b8 joke "Great line. Terrible retirement plan."
        S(1492, PH(BB, pos='50% 20%'), W('GREAT LINE.', 1500, x=R, y=230, size=90),
          O('TERRIBLE PLAN', 1540, x=R, y=360, size=90)),
        # b9 "Spoiler: no treasure ... cocoa and cotton."
        S(1599, CARD, XO('coin', 'HIS TREASURE', 1602, 1630)),
        S(1702, SC(S09, (1.08, 1.0)), TG('COCOA', 1712, 440, 560), TG('COTTON', 1726, 840, 800),
          cam=PULL(960, 600)),
        # b10 joke "most feared pirate in America is basically running a chocolate delivery."
        S(1805, SC(S10), ST('MOST FEARED', 1816, x=R, y=260), cam=PUSH(560, 520, 1.15)),
        S(1880, CARD, TF(('mask', 'PIRATE'), ('suitcase', 'CHOCOLATE RUN'), 1883, 22)),
    ]


def straight():
    return opening() + tonight(True) + party() + [
        # b9 "Spoiler: no treasure ... cocoa and cotton." (b7 ends on a card, so b9 opens on a photo)
        S(1492, PH(BB, pos='50% 20%'), W('TREASURE', 1505, x=R, y=280, size=120), X(1530, R, 280)),
        S(1595, SC(S09, (1.08, 1.0)), TG('COCOA', 1605, 440, 560), TG('COTTON', 1620, 840, 800),
          cam=PULL(960, 600)),
        S(1660, CARD, TF(('coin', 'TREASURE'), ('suitcase', 'COCOA + COTTON'), 1663, 18)),
    ]


CUTS = {'hybrid': (hybrid, 'min1-hybrid'), 'straight': (straight, 'min1-straight')}
EXTRA_SPLITS = {'straight': {536, 1660}}  # cuts inside a VO shot slot (b4 split, b9 tail card), not in timeline.json


# ---------- lints (from make_v11b_shots.py) ----------
TEXT_ELS = {'words', 'cross', 'tag', 'stamp', 'underline', 'tick', 'redact'}
ICON_H = round(0.3 * STAGE_H)
CARD_WORDS_MAX = 4
CARD_LINES_MAX = 2
FRAMINGS_MIN = 4
MOVE_MIN = 1.1
SPRITE_MAX = 4


def bg_key(bg):
    return bg.get('plate') or bg.get('photo') or 'card'


def framing(shot):
    bg, cam = shot['bg'], shot.get('cam')
    if 'card' in bg:
        return 'card'
    if 'photo' in bg:
        return 'photo'
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
    return bg_key(shot['bg']) == 'card' and all(e['t'] in TEXT_ELS for e in shot['els'])


def layout_of(shot):
    return [e['t'] for e in shot['els'] if e['t'] in LAYOUTS]


def icons_of(shot):
    out = []
    for e in shot['els']:
        out += [e[k] for k in ICON_KEYS if k in e and e['t'] != 'sprite']
        for side in ('left', 'right', 'a', 'b'):
            if isinstance(e.get(side), dict) and 'icon' in e[side]:
                out.append(e[side]['icon'])
        if isinstance(e.get('odd'), dict) and 'icon' in e['odd']:
            out.append(e['odd']['icon'])
    return out


# frame-safe words / sprites (affine of plate zoom x camera, as in make_v11b_shots.py)
GLYPH_BOX = 0.62
CAP_H = 0.6
SAFE = 48
PLATE_ORIGIN = '50% 60%'
SPRITE_BOX_W = 900
_ink_cache = {}


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
    log, states = [], _states(shot)
    for e in [e for e in shot['els'] if e['t'] == 'words']:
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
    return log


def _sprite_ink(src):
    if src not in _ink_cache:
        from PIL import Image
        im = Image.open(ASSETS / src)
        l, t, r, b = im.getchannel('A').getbbox() if 'A' in im.getbands() else (0, 0, *im.size)
        w, h = im.size
        _ink_cache[src] = (w / h, (l / w, t / h, r / w, b / h))
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
        x0, h0 = e['x'], e['h']
        for _ in range(12):
            l, t, r, b = _sprite_box(e)
            lo_x = max((SAFE - bx) / ax - l for ax, bx, _, _ in states)
            hi_x = min((STAGE_W - SAFE - bx) / ax - r for ax, bx, _, _ in states)
            fits_y = all(ay * t + by >= SAFE for _, _, ay, by in states)
            if lo_x <= hi_x and fits_y:
                break
            e['h'] = int(e['h'] * 0.94)
        else:
            raise SystemExit(f"{shot['start']}: sprite {e['src']} cannot fit the frame")
        e['x'] = round(min(max(e['x'], lo_x), hi_x))
        if (e['x'], e['h']) != (x0, h0):
            log.append(f"{e['src'].rsplit('/', 1)[-1]}: x {x0}->{e['x']} h {h0}->{e['h']}")
    return log


def el_times(e):
    times = [e[k] for k in ('at', 'bracketAt', 'crossAt') if k in e]
    if e['t'] == 'count':
        times.append(e['at'] + (e['n'] - 1) * e['step'])
    elif e['t'] in ('split', 'transform'):
        times.append(e['at'] + e['step'])
    elif e['t'] == 'bignum':
        times.append(e['at'] + e['dur'])
    return times


def add_meters(shots, tl):
    """Every non-card shot carries the survival-odds meter for its beat; `from` = the previous value."""
    spans = [(b['start'], b['start'] + b['dur'], b['id']) for b in tl['beats']]
    prev = None
    for s in shots:
        if 'card' in s['bg']:
            continue
        beat = next((bid for a, z, bid in spans if a <= s['start'] < z), None)
        if beat not in METER:
            raise SystemExit(f'{s["start"]}: no survival-odds beat for this shot')
        m = {'label': METER_LABEL, 'value': METER[beat]}
        if prev is not None:
            m['from'] = prev
        s['meter'] = m
        prev = METER[beat]


def build_cut(name):
    make, audio = CUTS[name]
    tl = json.loads((ASSETS / audio / 'timeline.json').read_text(encoding='utf-8'))
    total = tl['totalFrames']
    want = sorted({s['start'] for b in tl['beats'] for s in b['shots']} | EXTRA_SPLITS.get(name, set()))
    shots = make()
    add_meters(shots, tl)
    errors, fits, out = [], [], []
    starts = [s['start'] for s in shots]
    if starts != want:
        errors.append(f'{name}: shot starts {starts} != timeline {want}')
    prev_bg = None
    for i, s in enumerate(shots):
        end = shots[i + 1]['start'] if i + 1 < len(shots) else total
        tag = f'{name}@{s["start"]}'
        if end - s['start'] < MIN_SHOT:
            errors.append(f'{tag}: shot only {end - s["start"]}f')
        key = bg_key(s['bg'])
        if key == prev_bg and key != 'card':
            errors.append(f'{tag}: same background as previous shot ({key})')
        if key == 'card' and prev_bg == 'card':
            errors.append(f'{tag}: two cards in a row')
        prev_bg = key
        if key == 'card':
            for e in s['els']:
                if e['t'] == 'sprite':
                    e['h'] = min(e['h'], ICON_H)
            lines = [e['text'] for e in s['els'] if e['t'] == 'words']
            if len(lines) > CARD_LINES_MAX:
                errors.append(f'{tag}: card has {len(lines)} lettered lines > {CARD_LINES_MAX}')
            errors += [f'{tag}: card line "{t}" > {CARD_WORDS_MAX} words' for t in lines if len(t.split()) > CARD_WORDS_MAX]
        if text_only(s):
            errors.append(f'{tag}: text-only shot, needs a living picture')
        errors += [f'{tag}: count n={e["n"]} > engine COUNT_MAX {COUNT_MAX}' for e in s['els']
                   if e['t'] == 'count' and not 1 <= e['n'] <= COUNT_MAX]
        fits += [f'{tag} {m}' for m in fit_words(s)]
        fits += [f'{tag} {m}' for m in fit_sprites(s)]
        for e in s['els']:
            for t in el_times(e):
                if not s['start'] <= t <= end - TAIL:
                    errors.append(f'{tag}-{end}: {e["t"]} {e.get("text", e.get("label", ""))} at {t} outside shot')
        if s['chipAt'] is not None and not s['start'] <= s['chipAt'] <= end - TAIL:
            errors.append(f'{tag}: chip at {s["chipAt"]} outside shot')
        if s['meter'] is not None:
            m = s['meter']
            if not isinstance(m.get('label'), str) or not m['label'].strip():
                errors.append(f'{tag}: meter needs a non-empty label')
            for k in ('value', 'from'):
                if k == 'from' and k not in m:
                    continue
                if k not in m or not 0 <= m[k] <= 100:
                    errors.append(f'{tag}: meter {k} {m.get(k)} outside 0..100')
        shot = {'f0': s['start'], 'f1': end, 'bg': s['bg']}
        for k in ('cam', 'chip', 'chipAt', 'chipPos', 'meter'):
            if s[k] is not None:
                shot[k] = s[k]
        shot['els'] = s['els']
        out.append(shot)

    # minute-one SKILL rules
    n = len(shots)
    if n < MIN1_CUTS:
        errors.append(f'{name}: {n} cuts < {MIN1_CUTS}')
    if len({framing(s) for s in shots}) < FRAMINGS_MIN:
        errors.append(f'{name}: framings {sorted({framing(s) for s in shots})} < {FRAMINGS_MIN}')
    cards = [s for s in shots if 'card' in s['bg']]
    word_cards = [s for s in cards if all(e['t'] in TEXT_ELS for e in s['els'])]
    if len(word_cards) > WORD_CARD_SHARE * n:
        errors.append(f'{name}: {len(word_cards)} word-only cards > {WORD_CARD_SHARE:.0%}')
    one_obj = [s for s in cards if len([e for e in s['els'] if e['t'] not in TEXT_ELS]) == 1]
    if len(one_obj) < ONE_OBJECT_MIN:
        errors.append(f'{name}: {len(one_obj)} one-object cards < {ONE_OBJECT_MIN}')
    splits = sum(e['t'] == 'split' for s in shots for e in s['els'])
    split_like = splits + sum(e['t'] in ('transform',) for s in shots for e in s['els'])
    if not SPLIT_RANGE[0] <= split_like <= SPLIT_RANGE[1]:
        errors.append(f'{name}: {split_like} split/transform cards outside {SPLIT_RANGE}')
    icon_uses = collections.Counter(i for s in shots for i in icons_of(s))
    errors += [f'{name}: icon {k} used {v}x > {ICON_USES_MAX}' for k, v in icon_uses.items() if v > ICON_USES_MAX]
    sprite_uses = collections.Counter(e['src'] for s in shots for e in s['els'] if e['t'] == 'sprite')
    errors += [f'{name}: sprite {k} used {v}x > {SPRITE_MAX}' for k, v in sprite_uses.items() if v > SPRITE_MAX]
    layouts = collections.Counter(t for s in shots for t in set(layout_of(s)))
    errors += [f'{name}: {t} used {c}x > {TYPE_CAP.get(t, TYPE_CAP_ANY)}' for t, c in layouts.items()
               if c > TYPE_CAP.get(t, TYPE_CAP_ANY)]
    for a, b in zip(cards, cards[1:]):
        shared = set(layout_of(a)) & set(layout_of(b))
        if shared:
            errors.append(f'{name}: cards {a["start"]} and {b["start"]} repeat layout {shared}')
    cams = collections.Counter(framing(s) for s in shots if 'card' not in s['bg'])
    return {'_doc': f'ep02 minute one, {name} cut (generated by tools/ink/make_ep02_min1_shots.py; edit there).',
            'part': name, 'f0': 0, 'f1': total, 'shots': out}, errors, fits, (n, len(cards), dict(cams))


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    bad = False
    for name in CUTS:
        part, errors, fits, (n, nc, cams) = build_cut(name)
        if fits:
            print(f'FITS {name}:', *fits, sep='\n  ')
        if errors:
            print(f'ERRORS {name}:', *errors, sep='\n  ')
            bad = True
            continue
        (OUT / f'{name}.json').write_text(json.dumps(part, separators=(',', ':')), encoding='utf-8')
        print(f'OK {name}: {n} shots ({nc} cards), {part["f1"]} frames, scene framings {cams}')
    sys.exit(1 if bad else 0)


if __name__ == '__main__':
    main()
