"""v10 shot lists for Ep01 p03-p24 (v9 + per-quarter balance: real photos, camera angles, poses;
crosses fitted to the word they strike).

One shot per spoken line, cued from the REAL word frames (assets/ink60full/words/pXX.json),
not the beat text. Each row = background angle (plate / photo / card) + pose + visual type.
Rules (Zen 2026-11-17): same effect level every part, neighbours differ in background,
reused pictures only as deliberate callbacks, real photos + white cards + diagrams + charts.

Run: python tools/ink/make_v10_shots.py  -> engine/ink/parts/shots_v10/pXX.json (+ checks).
"""
import collections
import json
import pathlib

ROOT = pathlib.Path(__file__).resolve().parents[2]
ASSETS = ROOT / 'videos/pastly-life/01-eiffel-ink/assets'
OUT = ROOT / 'engine/ink/parts/shots_v10'
V1 = ROOT / 'engine/ink/parts/shots'

STAGE_W, STAGE_H = 1920, 1080          # mirrors the stage size in engine/ink (1920x1080)
FLOOR = 1000                            # sprite baseline, as in v8 p02
GLYPH = 0.5                             # words width per char per px of size (v8 p02: "1889" @220 -> 440)
CAM_SCALE = 1.12                        # 2D camera push for scene shots; keeps y>=~70 visible
TAIL = 6                                # last element must land >= TAIL frames before the cut


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


def FL(items, at, step, w=420, gap=120, y=560, color='orange'):
    return [{'t': 'flow', 'x': 960, 'y': y, 'w': w, 'gap': gap, 'at': at, 'step': step,
             'items': items, 'color': color}]


def BR(items, at, step, w=900, h=420, y=820):
    return [{'t': 'bars', 'x': 960, 'y': y, 'w': w, 'h': h, 'at': at, 'step': step,
             'items': [dict(zip(('label', 'value', 'text'), (*it, '')[:3])) for it in items]}]


def TL(left, right, at, bracket, bracket_at):
    return [{'t': 'timeline', 'x1': 300, 'x2': 1620, 'y': 620, 'left': left, 'right': right,
             'at': at, 'bracket': bracket, 'bracketAt': bracket_at}]


def RA(at, x=634, y=100):
    return [{'t': 'radio', 'x': x, 'y': y, 'at': at}]


# 2D "camera angles" for scene shots (Cam schema in engine/ink/parts/schema.ts).
def PUSH(fx, fy=540, s=CAM_SCALE):
    return {'from': [1.0, STAGE_W / 2, STAGE_H / 2], 'to': [s, fx, fy]}


def PAN(fx0, fx1, s=CAM_SCALE, fy=540):
    return {'from': [s, fx0, fy], 'to': [s, fx1, fy]}


def S(start, bg, *els, chip=None, chipAt=None, cam=None):
    flat = [e for group in els for e in group]
    return {'start': start, 'bg': bg, 'els': flat, 'chip': chip, 'chipAt': chipAt, 'cam': cam}


L, R = 600, 1320          # left / right thirds for words opposite a sprite

PARTS = {}

PARTS['p03'] = [
    S(1716, PL('paris_birdseye_champ_de_mars', origin='50% 60%'), TG('1925', 1742, 360, 520),
      PO('citroen_tower_1925.jpg', 1770, 1500, 620, 340, 5, 'THE TOWER, 1925'),
      O('TEMPORARY', 1831, y=240, size=160, ul=True)),
    S(1918, PL('tower_rust_closeup', zoom=(1.05, 1.18)), SP('parisian_awe_looking_up', 1930, 420, 560), ST('BAD SHAPE', 1952, x=1380, y=400)),
    S(1986, CARD, O('BILLS KEEP GROWING', 2061, y=180, size=100),
      BR([('PAINT', 3), ('REPAIRS', 5), ('BILLS', 9)], 1997, 32)),
    S(2120, PL('vienna_cafe_morning'), SP('lustig_reading_newspaper', 2130, 1560, 680),
      TG('NEWSPAPERS', 2128, 560, 520), O('EVERY WEEK', 2186, x=800, y=260, size=110)),
    S(2198, CARD, TW(1500, 560), W('STILL WORTH', 2200, x=700, y=300, size=110),
      O('KEEPING?', 2243, x=700, y=440, size=130, ul=True)),
    S(2282, PL('paris_grey'), SP('parisian_walk_profile', 2287, 560, 560),
      SP('parisian_2', 2303, 1380, 560, flip=True), W('MOVED ON', 2344, y=220, size=110),
      PO('concorde_1922.jpg', 2316, 960, 600, 420, -3, 'PARIS, 1922'),
      cam=PAN(860, 1060)),
    S(2386, PL('hotel_room_night'), SP('lustig_reading_newspaper', 2394, 640, 700),
      O('A DOOR OPEN', 2458, x=R, y=280, size=120, ul=True),
      chip='VICTOR LUSTIG', chipAt=2400, cam=PUSH(800)),
]

PARTS['p04'] = [
    S(2498, PL('tower_low_angle_up', origin='50% 15%'), W('NOT A MONUMENT', 2549, y=220, size=110),
      X(2568, 960, 220, 420), SP('poisson_from_below_greedy', 2510, 1520, 560)),
    S(2586, CARD, TW(700, 600), O('A PILE OF IRON', 2590, x=R, y=280, size=120, ul=True),
      TG('MID-CITY', 2641, R, 560)),
    S(2662, PL('paris_dusk'), SP('parisian_1', 2681, 560, 600),
      SP('loud_braggart_shouting', 2689, 1360, 640, flip=True),
      O('OPENLY ARGUED', 2703, y=180, size=100), cam=PUSH(1160)),
    S(2776, CARD, SP('lustig_passports_fan', 2786, 1720, 480), W('EVERY CON NEEDS', 2781, y=300, size=90),
      O('A BELIEVABLE STORY', 2817, y=440, size=120, ul=True)),
    S(2848, PL('paris_tower_grey', zoom=(1.15, 1.0)), W('THE TOWER WAS ALREADY', 2852, x=L, y=220, size=70),
      O('TELLING ONE', 2896, x=L, y=330, size=110), TG('FOR HIM', 2920, L, 520), SP('lustig_glance_over_shoulder', 2860, 1400, 640)),
    S(2952, PL('forger_desk_night'), SP('lustig_writing_desk', 2959, 1340, 700, flip=True),
      O('FINISH THE SENTENCE', 2991, x=L, y=260, size=90, ul=True), cam=PUSH(1200)),
]

PARTS['p05'] = [
    S(3071, PL('bohemia_village_1890', origin='50% 50%'), SP('lustig_walking_profile_case', 3085, 980, 440, flip=True), O('1890', 3106, x=520, y=300, size=200, ul=True),
      TG('BOHEMIA', 3175, 1400, 520)),
    S(3240, CARD, SP('lustig_polyglot_greeting', 3245, 620, 640), O('5 LANGUAGES', 3255, x=R, y=260, size=110),
      TG('BONJOUR', 3260, 1180, 480), TG('GUTEN TAG', 3266, 1560, 600), TG('HELLO', 3272, 1240, 720)),
    S(3298, PL('tailor_shop_mirror'), SP('lustig_official_tailcoat', 3304, 1340, 700),
      ST('DIPLOMAT', 3322, x=600, y=380, rot=-9), cam=PUSH(1200)),
    S(3330, CARD, SP('lustig_lean_murmur', 3334, 1460, 560, flip=True),
      W('NEVER RAISED', 3361, x=700, y=300, size=100), O('HIS VOICE', 3381, x=700, y=440, size=130, ul=True)),
    S(3448, PL('paris_night'), SP('lustig_walking_profile_case', 3453, 960, 620),
      W('NO GUN', 3462, x=500, y=240, size=110), X(3469, 500, 240, 300),
      W('NO GANG', 3488, x=1420, y=240, size=110), X(3494, 1420, 240, 300), cam=PAN(800, 1120)),
    S(3507, CARD, W('JUST', 3511, y=260, size=80),
      FL(['A SUIT', 'A SMILE', 'PATIENCE'], 3534, 30, w=400, gap=140)),
]

PARTS['p06'] = [
    S(3654, PH('lustig_fbi_1931.jpg', pos='50% 30%'), O('NOT EVEN LUSTIG', 3695, x=1340, y=220, size=100),
      RD(3708, 1340, 380, 520)),
    S(3720, CARD, SP('lustig_passports_fan', 3724, 600, 660), O('40+ NAMES', 3762, x=R, y=260, size=150, ul=True),
      TG('COUNT LUSTIG', 3778, 1180, 560), TG('ROBERT MILLER', 3790, 1520, 680),
      TG('GEORGE SIMON', 3802, 1220, 800)),
    S(3866, PL('police_records_office'), SP('police_officer_two_files', 3870, 1340, 680),
      TG('SEVERAL COUNTRIES', 3887, 560, 520), cam=PUSH(1240)),
    S(3952, CARD, SP('police_officer_two_files', 3965, 1720, 480), W('NO FILE AGREED', 3957, y=200, size=80),
      TG('AUSTRIAN?', 3973, 480, 520), TG('CZECH?', 3983, 960, 640), TG('FRENCH?', 3995, 1440, 520),
      ST('NO MATCH', 4005, x=960, y=840)),
    S(4070, PL('paris_police_station'), SP('police_officer_reading_file', 4074, 620, 640, flip=True),
      O('THAT MATTERED', 4077, x=R, y=260, size=110)),
    S(4102, PL('paris_tower_night'), SP('lustig_glance_over_shoulder', 4107, 1320, 700),
      W('NOBODY CAN PIN DOWN', 4122, x=L, y=220, size=70), O('NOBODY CAN CHASE', 4180, x=L, y=330, size=90),
      cam=PUSH(1260, 560)),
    S(4256, PL('ocean_liner_deck', origin='50% 60%'), SP('lustig_lean_whisper', 4263, 640, 640),
      TG('EUROPE - AMERICA', 4308, 1300, 480)),
    S(4356, PL('liner_cabin_night'), SP('lustig_rapt_listening', 4362, 620, 640),
      SP('rich_passenger_deckchair', 4376, 1360, 560, flip=True),
      O('TIME TO TALK', 4409, y=200, size=100), cam=PAN(1100, 860)),
]

PARTS['p07'] = [
    S(4466, CARD, SP('lustig_writing_desk', 4479, 1440, 600), O('10 RULES', 4516, x=700, y=320, size=200, ul=True)),
    S(4560, PL('liner_cabin_night', zoom=(1.12, 1.0)), SP('lustig_forging_pen', 4570, 1640, 680), W('A BUSINESS MANUAL', 4603, y=240, size=90),
      O('FOR LYING', 4624, y=380, size=140, ul=True)),
    S(4692, CARD, O('RULE 1', 4699, y=150, size=90), W('BE A PATIENT LISTENER', 4727, y=270, size=80),
      SP('lustig_rapt_listening', 4735, 680, 560), SP('mark_talking_gesturing', 4751, 1260, 560, flip=True)),
    S(4800, PL('elite_banquet_table_night'), SP('loud_braggart_shouting', 4804, 1320, 660),
      W('LET THEM TELL YOU', 4824, x=L, y=220, size=70), O('WHAT THEY WANT', 4835, x=L, y=320, size=90),
      cam=PUSH(1240)),
    S(4898, PL('ocean_liner_deck', zoom=(1.1, 1.2), origin='60% 60%'),
      SP('lustig_nodding_agree', 4903, 600, 660), SP('rich_passenger_deckchair', 4910, 1360, 540, flip=True),
      O('RULE 2: NEVER LOOK BORED', 4924, y=170, size=80)),
    S(5006, CARD, O('RULE 3', 5012, y=200, size=100),
      FL(['WAIT', 'THEY REVEAL', 'YOU AGREE'], 5031, 55, w=440, gap=120)),
]

PARTS['p08'] = [
    S(5200, PL('hotel_suite_corner_34'), SP('loud_braggart_shouting', 5212, 1320, 680),
      O('RULE 4: NEVER BOAST', 5240, x=L, y=220, size=80), X(5249, 1320, 620, 440)),
    S(5290, PL('tailor_shop_mirror', zoom=(1.08, 1.0)), SP('lustig_rehearsing_mirror', 5294, 640, 680),
      O('RULE 5: NEVER BE SHABBY', 5319, x=R, y=220, size=70), cam=PAN(1080, 840)),
    S(5366, CARD, W('A RICH PERSON TRUSTS', 5370, y=280, size=80),
      O('CLEAN SHOES', 5402, y=440, size=160, ul=True), CI(5412, 960, 440, 700, 200)),
    S(5478, PL('records_office_desk'), SP('lustig_glance_over_shoulder', 5490, 1700, 680), W('NOTICE WHAT IS MISSING', 5483, y=200, size=80),
      O('BE CLEVER', 5551, y=460, size=140), X(5566, 960, 460, 440)),
    S(5580, CARD, SP('lustig_polyglot_greeting', 5590, 960, 560), W('BE', 5617, y=200, size=110),
      FL(['CAREFUL', 'CALM', 'KIND'], 5617, 31)),
    S(5742, PL('elite_banquet_table_night', zoom=(1.08, 1.0)), SP('mark_talking_gesturing', 5748, 560, 620),
      SP('gangster_shifty', 5756, 1400, 620, flip=True), W('NOT THE LOUDEST', 5776, y=200, size=100),
      X(5787, 960, 200, 360)),
    S(5835, PL('paris_cafe_artists'), SP('lustig_handshake', 5839, 960, 680),
      O('GLAD TO MEET', 5865, y=200, size=110), cam=PUSH(960, 600)),
    S(5932, PL('paris_skyline_extreme_wide', zoom=(1.0, 1.12)), W('ON ONE AFTERNOON', 5989, y=260, size=90),
      O('IN PARIS', 6013, y=390, size=130, ul=True), SP('lustig_walking_profile_case', 5945, 1540, 560), chip='ALMOST ALL OF THEM', chipAt=6052),
]

PARTS['p09'] = [
    S(6120, CARD, W('HE HAD THE IDEA', 6135, y=220, size=80), TK(6148, 1460, 220),
      FL(['COSTUME', 'STAGE', 'AUDIENCE'], 6201, 28, w=420, gap=130)),
    S(6300, PL('forger_desk_night'), SP('lustig_forging_pen', 6362, 1320, 680),
      TG('FORGED LETTERHEAD', 6382, 600, 520), chip='1. THE COSTUME', chipAt=6307, cam=PUSH(1220)),
    S(6462, PL('ministry_office_day'), SP('lustig_official_tailcoat', 6467, 1460, 700),
      W('DEPUTY DIRECTOR GENERAL', 6516, x=700, y=200, size=60), O('MINISTRY OF POSTS', 6582, x=700, y=320, size=80),
      O('AND TELEGRAPHS', 6618, x=700, y=430, size=80), ST('OFFICIAL', 6624, x=700, y=640)),
    S(6678, PH('antenna_1914.jpg', pos='50% 0%', push=(1.0, 1.1)), W('WHY THAT MINISTRY?', 6682, x=1300, y=200, size=80),
      RA(6775), O('RADIO EQUIPMENT', 6775, x=1300, y=860, size=90)),
    S(6800, CARD, SP('scrap_dealer_reading_letter', 6810, 260, 540), W('IT SOUNDED', 6804, y=380, size=110), O('REAL', 6833, y=560, size=200, ul=True),
      TK(6840, 1320, 560)),
]

PARTS['p10'] = [
    S(6873, PL('hotel_crillon_facade_day', origin='50% 30%'), O('HOTEL DE CRILLON', 6939, y=200, size=100, ul=True),
      PO('expo_1925_concorde.jpg', 6955, 1480, 640, 420, 4, 'PLACE DE LA CONCORDE'),
      chip='2. THE STAGE', chipAt=6895),
    S(6972, CARD, W('THE PRICIEST', 6988, y=300, size=110),
      O('HOTELS IN PARIS', 7015, y=440, size=120, ul=True), CI(7030, 960, 440, 1200, 220)),
    S(7080, PL('backroom_workshop_lamp'), SP('lustig_lean_murmur', 7090, 1700, 520), W('NOT A BACK ROOM', 7086, y=220, size=90), X(7099, 960, 220, 380),
      W('NOT A WAREHOUSE', 7117, y=400, size=90), X(7137, 960, 400, 380)),
    S(7156, PL('crillon_salon_chandeliers', origin='50% 20%'), O('A PALACE', 7173, x=L, y=220, size=160),
      SP('parisian_awe_looking_up', 7191, 1440, 660, flip=True), TG('CHANDELIERS', 7234, L, 520)),
    S(7292, PL('hotel_doorway_framed_view'), SP('lustig_back_walk_case', 7297, 1320, 680),
      W('SOMETHING SIMPLE', 7314, x=L, y=240, size=90), cam=PUSH(1220)),
    S(7372, CARD, W('PEOPLE TRUST', 7377, y=220, size=90),
      FL(['THE ROOM', 'THE PERSON'], 7395, 47, w=520, gap=220), O('FIRST', 7417, x=600, y=800, size=90)),
    S(7505, PL('paris_dusk', zoom=(1.0, 1.08)), W('NOT RICH MEN', 7574, y=260, size=100), X(7590, 960, 260, 420),
      W('MEN WHO WANTED', 7600, y=470, size=80), O('TO BE RICHER', 7655, y=600, size=120, ul=True), SP('scrap_dealer_greedy', 7520, 1600, 520),
      chip='3. THE AUDIENCE', chipAt=7515),
    S(7706, PL('scrap_yard_day'), SP('scrap_dealer_proud', 7713, 380, 520),
      SP('scrap_dealer_greedy', 7721, 760, 560), SP('scrap_dealer_smart', 7734, 1160, 540, flip=True),
      SP('scrap_dealer_lapels', 7743, 1540, 520, flip=True), O('SIX SCRAP DEALERS', 7713, y=160, size=90),
      cam=PAN(800, 1120)),
    S(7764, PL('ministry_office_day'), SP('scrap_dealer_reading_letter', 7791, 1320, 680),
      TG('POLITE', 7813, 600, 480), TG('OFFICIAL LETTER', 7829, 600, 620), cam=PUSH(1240)),
    S(7890, CARD, SP('scrap_dealer_pocketing_letter', 7900, 1720, 440), W('COME TO THE CRILLON', 7958, y=280, size=100),
      O('GREAT IMPORTANCE', 8039, y=440, size=110, ul=True)),
]

PARTS['p11'] = [
    S(8087, PL('train_hall_extreme_wide', zoom=(1.08, 1.0)), SP('scrap_dealer_pocketing_letter', 8090, 1320, 680),
      ST('TELL NO ONE', 8102, x=600, y=380, rot=-9)),
    S(8156, PL('crillon_salon_chandeliers', zoom=(1.0, 1.1), origin='50% 70%'),
      SP('scrap_dealer_proud', 8165, 480, 560), SP('scrap_dealer_smart', 8174, 900, 580),
      SP('scrap_dealer_lapels', 8191, 1440, 560, flip=True), O('PICKED', 8218, y=200, size=140, ul=True)),
    S(8248, CARD, O('THE FIRST HOOK', 8258, y=320, size=130, ul=True), TG('FEEL CHOSEN', 8277, 960, 620), CI(8285, 960, 620, 500, 160)),
    S(8320, PL('hotel_suite_corner_34'), SP('lustig_6', 8327, 600, 680),
      W('THE SMALLEST DETAIL', 8350, x=R, y=220, size=80), O('COULD RUIN HIM', 8387, x=R, y=340, size=100),
      cam=PUSH(700)),
    S(8410, PL('hotel_doorway_framed_view', zoom=(1.1, 1.0)), SP('poisson_back_34_peek', 8415, 1320, 640),
      O('ONE WRONG WORD', 8415, x=L, y=220, size=90), TG('SIX MEN WALK OUT', 8467, L, 520)),
    S(8500, CARD, W('HE PREPARED EVERY DETAIL', 8532, y=220, size=80),
      FL(['PAPERS', 'TITLE', 'HOTEL', 'ORDER'], 8599, 33, w=330, gap=80)),
    S(8752, PL('paris_police_station', zoom=(1.12, 1.0)), O('ONE SLIP', 8767, x=L, y=240, size=130, ul=True),
      SP('police_officer_reading_file', 8844, 1340, 660)),
    S(8900, CARD, SP('lustig_handshake', 8910, 1720, 520), W('NO SECOND TAKE', 8916, y=300, size=120), ST('ONE AFTERNOON', 9021, x=960, y=600)),
]

PARTS['p12'] = [
    S(9056, PL('crillon_salon_over_armchair'), SP('poisson_back_34_peek', 9071, 1340, 700),
      O('QUIETLY', 9127, x=L, y=260, size=120, ul=True)),
    S(9186, CARD, SP('lustig_lean_whisper', 9196, 260, 520, flip=True), W('GENTLEMEN,', 9190, y=200, size=80), O('A STATE SECRET', 9257, y=380, size=140),
      RD(9268, 960, 560, 700)),
    S(9326, PL('tower_rust_closeup', zoom=(1.18, 1.05)), SP('city_official_decree', 9340, 1700, 540), W('TOO EXPENSIVE', 9361, y=200, size=110),
      TG('TO MAINTAIN', 9389, 960, 520)),
    S(9400, CARD, TW(960, 620, cut=(9470, 9485)), O('DEMOLISH IT', 9470, y=150, size=120)),
    S(9520, PL('crillon_ceiling_low_angle', zoom=(1.08, 1.0)), SP('poisson_from_below_greedy', 9528, 520, 600),
      SP('lustig_from_below_smug', 9585, 1400, 620, flip=True),
      W('THE PUBLIC WOULD REVOLT', 9585, y=160, size=70), ST('CONFIDENTIAL', 9675, x=960, y=380),
      cam=PAN(1100, 860)),
]

PARTS['p13'] = [
    S(9730, CARD, PO('eiffel_construction_1888.jpg', 9750, 1600, 760, 400, 5, 'IRON, 1888'), O('7,000 TONS', 9745, y=280, size=200, ul=True), W('OF IRON', 9789, y=460, size=100),
      TG('A FORTUNE', 9819, 960, 680)),
    S(9906, PL('limousine_street_day'), SP('lustig_5', 9910, 1380, 660), TG('TWO LIMOUSINES', 9957, 600, 500),
      cam=PAN(800, 1120)),
    S(10076, PL('tower_low_angle_up', zoom=(1.0, 1.1), origin='50% 20%'),
      SP('poisson_from_below_greedy', 10084, 540, 640),
      PO('eiffel_caricature_1887.png', 10140, 960, 580, 320, 3, 'MOCKED, 1887'),
      W('NOT A MONUMENT', 10181, y=160, size=80)),
    S(10216, CARD, TW(640, 620), O('INVENTORY', 10219, x=R, y=280, size=160, ul=True),
      TG('7,000 TONS', 10240, R, 520), ST('FOR SALE', 10250, x=R, y=720)),
    S(10296, PL('tower_lattice_framing_paris'), SP('poisson_back_stand', 10300, 1340, 680),
      W('HE DID NOT RUSH THEM', 10303, x=L, y=160, size=60), O('ALREADY THEIRS', 10466, x=L, y=280, size=110),
      cam=PUSH(1240)),
]

PARTS['p14'] = [
    S(10527, CARD, W('THE MOMENT A BUYER', 10546, y=220, size=80),
      FL(['PICTURES IT', 'OWNS IT', 'PAYS FOR IT'], 10577, 47, w=440, gap=130)),
    S(10734, PL('banquet_table_high_angle'), CI(10820, 300, 620, 260, 300),
      O('HE PICKED HIS TARGET', 10806, y=160, size=80),
      cam=PAN(900, 1100)),
    S(10866, PL('poisson_parlour_night'), SP('scrap_dealer_proud', 10871, 1320, 700),
      TG('MONEY', 10951, 600, 480), TG('NO PLACE IN THE ELITE', 10999, 600, 640),
      chip='ANDRE POISSON', chipAt=10871, cam=PUSH(1240)),
    S(11072, CARD, SP('scrap_dealer_lapels', 11077, 1420, 620, flip=True),
      W('TAKEN', 11106, x=700, y=300, size=120), O('SERIOUSLY', 11114, x=700, y=440, size=130, ul=True),
      TG('THAT FEELING', 11197, 700, 660)),
]

PARTS['p15'] = [
    S(11245, PL('hotel_crillon_facade_day', zoom=(1.1, 1.2)),
      SP('lustig_official_tailcoat', 11260, 600, 680), O('HIGHEST BIDDER', 11316, x=R, y=220, size=100, ul=True),
      PO('crillon_concorde_1890s.jpg', 11290, 1340, 640, 400, -4, 'HOTEL DE CRILLON')),
    S(11352, PL('hotel_suite_window_dutch'), SP('scrap_dealer_smart', 11357, 1340, 680),
      O('BEING SMART', 11418, x=L, y=260, size=110), cam=PUSH(1240)),
    S(11472, CARD, SP('scrap_dealer_hesitating', 11482, 1700, 560), O('THE SECOND HOOK', 11483, y=360, size=130, ul=True)),
    S(11514, PL('poisson_parlour_night', zoom=(1.08, 1.0)), SP('poisson_wife_suspicious', 11520, 600, 680),
      SP('scrap_dealer_hesitating', 11550, 1400, 640, flip=True), O('TOO FAST', 11611, y=180, size=110),
      cam=PAN(860, 1060)),
    S(11666, CARD, SP('lustig_nodding_agree', 11676, 1720, 520), W('LUSTIG DID NOT ARGUE', 11672, y=280, size=80),
      O('HE SHIFTED THE STORY', 11706, y=440, size=100, ul=True)),
    S(11740, PL('records_office_desk', zoom=(1.08, 1.0)), SP('lustig_embarrassed', 11745, 640, 700),
      TG('LOW-PAID', 11832, 1360, 480), TG('CIVIL SERVANT', 11844, 1360, 620),
      O('NEEDS A LITTLE EXTRA', 11888, x=R, y=220, size=70)),
    S(11958, PL('crillon_salon_over_armchair', zoom=(1.0, 1.08)), SP('poisson_back_34_peek', 11964, 1340, 680),
      O('A BRIBE', 12007, x=L, y=220, size=140), W('FEELS REAL', 12037, x=L, y=380, size=100),
      cam=PUSH(1260)),
    S(12066, CARD, SP('scrap_dealer_secret_smile', 12076, 1720, 520), O('CORRUPTION', 12071, y=300, size=140, ul=True),
      W('PEOPLE ALREADY BELIEVE IN', 12097, y=460, size=70), TK(12128, 960, 640)),
    S(12172, PL('hotel_room_night', zoom=(1.08, 1.0)), SP('lustig_point_viewer', 12178, 1340, 700),
      W('THAT IS THE GENIUS', 12182, x=L, y=240, size=80)),
    S(12216, CARD, SP('lustig_handing_money', 12230, 960, 440), W('NOT A LIE', 12261, x=560, y=360, size=110), X(12276, 560, 360, 360),
      O('A SMALL SIN', 12318, x=1360, y=360, size=120, ul=True)),
]

PARTS['p16'] = [
    S(12379, PL('parlour_through_doorway', zoom=(1.0, 1.1)), SP('poisson_back_34_peek', 12390, 1700, 520), W('A SECOND REASON', 12406, y=180, size=90),
      TG('NEW TO THE ELITE', 12466, 960, 480)),
    S(12518, CARD, W('THEY ALL HAD NAMES', 12523, y=240, size=80),
      O('HE WANTED ONE', 12564, y=400, size=110, ul=True), SP('scrap_dealer_greedy', 12568, 960, 360)),
    S(12620, PL('banquet_table_high_angle', zoom=(1.12, 1.2), origin='50% 70%'),
      CI(12700, 400, 800, 300, 260), W('NOT A TOWER', 12644, x=560, y=170, size=80),
      X(12659, 560, 170, 320), O('A SEAT AT THE TABLE', 12696, x=R, y=300, size=90)),
    S(12736, CARD, W('POISSON PAID', 12741, y=160, size=80),
      BR([('THE TOWER', 5, 'PAID'), ('THE BRIBE', 2, 'PAID AGAIN')], 12781, 37)),
    S(12874, PL('paris_train_station_night'), SP('lustig_walking_profile_case', 12878, 1320, 680),
      W('TOOK THE CASH', 12900, x=L, y=200, size=80), O('TOOK THE TRAIN', 12922, x=L, y=320, size=90),
      TG('VIENNA', 12973, L, 520), cam=PAN(1100, 860)),
]

PARTS['p17'] = [
    S(12997, PL('vienna_cafe_morning'), SP('lustig_reading_newspaper', 13012, 1320, 680),
      TG('EVERY MORNING', 13046, 600, 480), O('NOTHING.', 13072, x=L, y=260, size=130)),
    S(13106, CARD, SP('scrap_dealer_head_in_hands', 13116, 1720, 480), W('NO', 13110, y=220, size=120),
      FL(['HEADLINES', 'ARRESTS', 'MANHUNT'], 13110, 34, y=420), O('SILENCE.', 13205, y=720, size=150)),
    S(13256, PL('parlour_through_doorway', zoom=(1.12, 1.0)), SP('poisson_back_stand', 13266, 1320, 640),
      W('COULD NOT UNDO', 13308, x=L, y=240, size=100)),
    S(13372, CARD, W('HE PAID A BRIBE', 13385, y=200, size=90), O('FOR A MONUMENT', 13419, y=330, size=70),
      TW(960, 420)),
    S(13488, PL('police_office_through_bars', zoom=(1.0, 1.1)), SP('poisson_back_stand', 13494, 1320, 680),
      W('IF HE WENT TO THE POLICE', 13500, x=L, y=200, size=60), ST('LOST', 13604, x=L, y=420),
      cam=PUSH(1240)),
    S(13646, CARD, SP('scrap_dealer_humiliated', 13656, 1700, 560), O('SHAME', 13651, y=320, size=200, ul=True), W('DID THE WORK', 13668, y=540, size=100)),
]

PARTS['p18'] = [
    S(13754, PL('parlour_tea_table_high_angle', zoom=(1.0, 1.15)),
      CI(13769, 1140, 480, 380, 300), TG('WAITING', 13800, 600, 480),
      O('PART OF A SECRET', 13875, x=L, y=240, size=90)),
    S(13926, PL('paris_tower_night', zoom=(1.0, 1.08), origin='50% 20%'), SP('scrap_dealer_proud', 13930, 600, 660),
      W('HE THOUGHT', 14006, x=R, y=200, size=80), O('WAS HIS', 14013, x=R, y=330, size=140), cam=PAN(860, 1060)),
    S(14060, PL('paris_birdseye_champ_de_mars', zoom=(1.0, 1.06)), CI(14075, 960, 460, 260, 300), W('THE TOWER DID NOT MOVE', 14068, x=L, y=220, size=70)),
    S(14100, CARD, TL('THE DEAL', '?', 14104, 'WEEKS PASSED', 14121),
      O('A DIFFERENT FEELING', 14174, y=220, size=90)),
]

PARTS['p19'] = [
    S(14234, PL('paris_skyline_extreme_wide', zoom=(1.12, 1.0)), SP('lustig_2', 14292, 1340, 660),
      TG('MONTHS LATER', 14265, 600, 480), O('HE DID IT AGAIN', 14340, x=L, y=240, size=100),
      PO('lustig_1935.jpg', 14300, 1700, 420, 300, 5, 'VICTOR LUSTIG')),
    S(14370, PL('crillon_salon_through_doors'), SP('poisson_back_stand', 14374, 960, 620),
      W('SAME HOTEL. SAME SCRIPT.', 14415, y=160, size=80), cam=PAN(1060, 860)),
    S(14490, PL('police_station_high_angle'), CI(14519, 1600, 380, 500, 240),
      O('THIS TIME', 14495, y=170, size=90),
      ST('POLICE', 14539, x=960, y=380)),
    S(14576, PL('paris_train_station_night'), SP('lustig_glance_over_shoulder', 14581, 1320, 700),
      O('LEFT FRANCE', 14591, x=L, y=220, size=100), TG('THAT NIGHT', 14609, L, 480), cam=PUSH(1240)),
    S(14708, CARD, SP('lustig_forging_pen', 14720, 1640, 520), W('THE PART MOST', 14713, y=300, size=80), O('RETELLINGS SKIP', 14739, y=430, size=110, ul=True)),
    S(14764, PL('vienna_street_dusk'), SP('lustig_counting_cash', 14768, 1320, 680),
      O('HE HAD ALREADY WON', 14788, x=L, y=220, size=80), TG('A FORTUNE', 14830, L, 480),
      TG('A CLEAN EXIT', 14853, L, 620)),
    S(14892, CARD, SP('lustig_counting_cash', 14902, 1720, 480), W('CON MAN WHO STOPS', 14899, y=280, size=80), O('THIEF WITH A HOBBY', 14942, y=440, size=90)),
    S(15000, PL('hotel_suite_window_dutch'), SP('lustig_back_window', 15006, 1320, 680),
      W('THE STORY HAD TO', 15032, x=L, y=220, size=70), O('KEEP GOING', 15048, x=L, y=330, size=110),
      cam=PUSH(1240)),
    S(15090, PL('prison_corridor_low_angle', zoom=(1.08, 1.0)), W('WHAT CAUGHT UP WITH HIM', 15109, y=180, size=70), SP('lustig_from_below_smug', 15100, 1500, 600)),
    S(15140, CARD, SP('lustig_rehearsing_mirror', 15150, 1760, 440), W('NOT THE POLICE', 15144, y=300, size=100), X(15159, 960, 300, 420),
      O('NEED TO BE BELIEVED', 15183, y=500, size=90, ul=True)),
]

PARTS['p20'] = [
    S(15229, PL('liner_deck_high_angle', zoom=(1.0, 1.1)), TG('ACROSS THE ATLANTIC', 15264, 960, 480),
      O('AMERICA', 15338, y=220, size=160, ul=True), CI(15290, 1400, 320, 500, 240), cam=PAN(800, 1120)),
    S(15372, CARD, W('THE PROHIBITION YEARS', 15380, y=260, size=90),
      TL('1920', '1933', 15384, 'PROHIBITION', 15397)),
    S(15438, PL('backroom_workshop_lamp', zoom=(1.0, 1.1)), SP('lustig_money_box', 15443, 1320, 680),
      TG('WOODEN BOX', 15464, 600, 480), O('PRINTS $100 BILLS?', 15527, x=L, y=240, size=80)),
    S(15604, PL('new_york_street_night'), SP('lustig_handshake', 15610, 600, 660),
      SP('buyer_paying', 15620, 1360, 660, flip=True), O('TENS OF THOUSANDS', 15640, y=180, size=90),
      cam=PAN(1060, 860)),
    S(15678, CARD, SP('buyer_amazed', 15690, 260, 540), W('THE BOX DID NOT', 15707, y=300, size=90), O('PRINT ANYTHING', 15729, y=440, size=110),
      ST('FAKE', 15740, x=1500, y=700)),
    S(15788, PL('tower_radio_station', zoom=(1.0, 1.1)), SP('lustig_money_box', 15798, 1600, 680), O('THE TRICK', 15795, y=300, size=150, ul=True)),
    S(15860, CARD, O('PERFECT COPIES?', 15978, y=220, size=90),
      FL(['2 REAL BILLS IN', '6 HOURS', '2 BILLS OUT'], 15866, 52, w=460, gap=120)),
    S(16056, PL('wax_seal_extreme_closeup', zoom=(1.12, 1.2)), SP('lustig_money_box', 16062, 600, 700),
      O('ALSO REAL', 16104, x=R, y=260, size=120), TG('HIDDEN IN THE BOX', 16128, R, 520)),
    S(16154, PL('chicago_street_night'), SP('buyer_amazed', 16180, 1340, 680),
      O('A MIRACLE', 16202, x=L, y=240, size=130, ul=True), cam=PUSH(1240)),
]

PARTS['p21'] = [
    S(16277, PL('texas_main_street_day'), SP('sheriff_paying', 16295, 1320, 700),
      TG('A SHERIFF IN TEXAS', 16295, 600, 480)),
    S(16320, CARD, SP('buyer_paying', 16330, 1720, 520), O('$30,000', 16323, y=380, size=220, ul=True), W('FOR ONE BOX', 16361, y=600, size=90)),
    S(16396, PL('texas_main_street_day', zoom=(1.12, 1.22), origin='70% 60%'), SP('sheriff_angry', 16415, 1340, 700),
      O('LONG GONE', 16454, x=L, y=240, size=130)),
    S(16510, PH('capone_mugshot.jpg', pos='50% 30%'), W('THE BOLDEST MOVE', 16537, x=1340, y=200, size=80),
      chip='AL CAPONE', chipAt=16564),
    S(16620, PL('capone_office'), SP('capone_seated_desk', 16630, 1340, 680),
      SP('lustig_lean_murmur', 16641, 560, 660), TG('$50,000', 16660, 960, 480), cam=PAN(860, 1060)),
    S(16705, CARD, W('DOUBLE IN 60 DAYS', 16739, y=170, size=70),
      BR([('BORROW', 50, '$50,000'), ('IN 60 DAYS', 100, '$100,000')], 16711, 45)),
    S(16825, PL('capone_desk_low_angle', zoom=(1.12, 1.24)), SP('capone_from_below_menace', 16829, 1320, 720),
      O('DO NOT MAKE ME', 16905, x=L, y=220, size=90), O('REGRET IT', 16927, x=L, y=340, size=120)),
    S(16975, PL('bank_vault_safe_deposit'), TG('SAFE DEPOSIT BOX', 17003, 960, 480),
      O('DID NOTHING', 17045, y=220, size=110), TG('2 MONTHS', 17083, 960, 640), SP('lustig_money_box', 16985, 1560, 600), cam=PUSH(960)),
    S(17130, PL('capone_office'), SP('lustig_sad', 17135, 600, 680), SP('capone_thinking', 17150, 1400, 680, flip=True),
      W('THE DEAL FELL THROUGH', 17209, y=160, size=70), O('SORRY.', 17247, y=290, size=110)),
]

PARTS['p22'] = [
    S(17276, CARD, SP('lustig_handing_money', 17291, 640, 640), O('EVERY DOLLAR', 17306, x=R, y=300, size=110),
      TK(17320, R, 460)),
    S(17340, PL('capone_desk_topdown_cash', zoom=(1.08, 1.0)), CI(17345, 300, 750, 300, 500),
      W('IMPRESSED', 17367, x=L, y=220, size=110), O('+ $5,000', 17428, x=L, y=380, size=130, ul=True)),
    S(17478, CARD, W('WHAT CAPONE SAW', 17494, x=700, y=200, size=80),
      SP('capone_seated_desk', 17503, 1520, 560, flip=True),
      O('HE GAVE IT BACK', 17603, x=700, y=480, size=80)),
    S(17645, PL('limousine_backseat_view', zoom=(1.15, 1.0)), SP('capone_back_34', 17655, 1720, 540), W('NOT WEAKNESS', 17686, y=220, size=100),
      X(17693, 960, 220, 380), O('PROOF', 17725, y=420, size=170, ul=True)),
    S(17756, CARD, W('A WORLD OF LIARS', 17765, y=240, size=80),
      O('ONE HONEST MAN', 17816, y=400, size=120, ul=True), SP('lustig_nodding_agree', 17821, 960, 380)),
    S(17884, PL('police_records_office'), SP('police_officer_two_files', 17890, 560, 640),
      W('THE MONEY WAS NEVER THE CON', 17943, x=1420, y=440, size=50), O('THE TRUST WAS.', 18001, x=1420, y=600, size=110, ul=True)),
]

PARTS['p23'] = [
    S(18039, CARD, SP('lustig_arrested', 18060, 1660, 520), O('1935', 18058, y=300, size=200, ul=True), W('HIS LUCK ENDED', 18097, y=520, size=100)),
    S(18110, PL('new_york_street_night', zoom=(1.08, 1.0)), SP('lustig_arrested', 18114, 600, 660),
      SP('secret_service_agent', 18138, 1360, 700, flip=True), O('COUNTERFEIT MONEY', 18168, y=160, size=80),
      cam=PAN(1060, 860)),
    S(18232, PL('federal_jail_exterior_night'), SP('lustig_bedsheet_rope', 18239, 900, 720),
      TG('BEDSHEETS', 18318, 1480, 520), chip='NEW YORK JAIL', chipAt=18262),
    S(18345, PL('chicago_street_night', zoom=(1.0, 1.1)), SP('lustig_rope_escape', 18350, 600, 640),
      SP('police_officer_reading_file', 18358, 1360, 660, flip=True), ST('CAUGHT AGAIN', 18373, x=960, y=300)),
    S(18420, PH('alcatraz_1930s.jpg', pos='50% 50%'), chip='ALCATRAZ', chipAt=18436),
    S(18484, PL('prison_hospital_ward'), SP('lustig_sick_bed', 18507, 960, 600),
      TG('MISSOURI', 18548, 480, 480), TG('PNEUMONIA', 18592, 1440, 480), O('1947', 18614, y=200, size=130),
      cam=PUSH(960, 600)),
    S(18674, CARD, SP('clerk_3', 18690, 1760, 480), TG('DEATH CERTIFICATE', 18682, 960, 160), W('OCCUPATION:', 18723, y=300, size=80),
      O('APPRENTICE SALESMAN', 18752, y=440, size=110, ul=True)),
    S(18808, PL('prison_cell'), SP('lustig_prison_sad', 18818, 1340, 680),
      W('SOLD THE MOST FAMOUS BUILDING', 18834, x=L, y=200, size=50), O('DIED AN APPRENTICE', 18891, x=L, y=320, size=80),
      cam=PUSH(1260)),
    S(18956, CARD, SP('lustig_sad_prisoner', 18966, 1760, 480), W('NO MONEY. NO TITLE.', 18961, y=240, size=100),
      O('JUST A NUMBER', 19020, y=480, size=120, ul=True)),
]

PARTS['p24'] = [
    S(19090, PL('tower_lattice_framing_paris', zoom=(1.0, 1.1)), W('SO WHAT WAS', 19105, y=300, size=90),
      O('THE SENTENCE?', 19118, y=440, size=140), SP('lustig_back_walk_case', 19098, 1620, 540)),
    S(19160, CARD, SP('lustig_point_viewer', 19170, 1760, 440), W('GIVE PEOPLE A REASON', 19165, y=280, size=90), O('TO FEEL SPECIAL', 19188, y=420, size=130, ul=True)),
    S(19296, PL('tower_top_looking_down', zoom=(1.0, 1.15)), W('THE TOWER NEVER MOVED', 19305, y=200, size=90), CI(19320, 960, 620, 300, 240)),
    S(19336, PH('expo_1889.jpg', push=(1.0, 1.08)), W('ONLY BORROWED', 19390, x=1300, y=200, size=80),
      O('OUR OLDEST WEAKNESS', 19417, x=1300, y=320, size=90)),
    S(19478, CARD, SP('lustig_point_viewer', 19483, 1420, 660), O('WHICH PART', 19542, x=650, y=300, size=110),
      W('WOULD YOU FALL FOR?', 19576, x=650, y=440, size=80)),
]


def bg_key(bg):
    return bg.get('plate') or bg.get('photo') or 'card'


# ---------- same effort every quarter ----------
# v9 front-loaded its real photos and 2D camera-angle plates, so the back half felt flat (Zen 2026-11-17).
# Every quarter of the runtime must carry at least this many of each. Floors = the thinnest quarter
# after the v10 rebalance (photos 3/3/3/5, angle plates 5/8/6/5), so a later edit cannot quietly drain one.
ANGLE_PLATES = ('birdseye', 'low_angle', 'corner_34', 'topdown', 'doorway_framed', 'extreme_wide', 'closeup',
                'high_angle', 'over_', 'through_', 'dutch', 'looking_down', 'framing', 'backseat')
# Reuse caps (Zen 2026-11-17: "you didn't just use same one every where right" / "mostly sides").
# The hook (p01-p02) is outside PARTS, so a hook photo may come back here once as a callback.
PHOTO_MAX = 1   # each real photo once in the body
PLATE_MAX = 2   # each background plate at most twice in the body
SPRITE_MAX = 4  # each sprite pose at most 4x in the body (current eye-level worst case; lower, never raise)
# Top-down poses read as just a hat from above, so a repeat is obvious (Zen 2026-11-17: "why so many scene
# got this guy looking like this"). A desk/shelf top-down is an object insert: no figure in it.
TOPDOWN_SPRITE_MAX = 2
QUARTER_MIN = {'photo': 3}  # no angle quota (Zen 2026-11-17: Ink barely uses angles)
# Per-SHOT bar (Zen 2026-11-17, "the whole thing should get same effort"): quarter averages hid
# 37 text-only slides. Every shot needs >=1 living picture: a non-text element or a photo bg.
TEXT_ELS = {'words', 'cross', 'tag', 'stamp', 'underline', 'tick', 'redact'}
# Ink card bar (docs/ink-card-patterns.md section B): ONE idea, 1-4 big words, icon IS the idea. A sprite on a
# card is a mini-figure icon, so its height is capped structurally, not per shot.
ICON_H = round(0.3 * STAGE_H)   # mini-figure icon height on a card
CARD_WORDS_MAX = 4              # words per lettered line on a card
CARD_LINES_MAX = 2              # lettered lines per card (flow/bar labels are the diagram, not lines)
# Plates seen from above have no ground line: a standing figure there floats (rule: figures on a ground plate).
FLOORLESS = ('high_angle', 'birdseye', 'topdown', 'looking_down')
FRAMINGS_MIN = 4                # distinct framing classes per part (Beanie: 4-6 framings per scene)
MOVE_MIN = 1.1                  # net scale ratio that reads as a camera move; under it = the default PL drift (1.08)


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
    # Net scale move = bg zoom x cam scale, start vs end: in = push, out = pull (reveal back to wide).
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


# 2D viewpoint rule (Zen 2026-11-17): no camera exists, so an angled plate needs a sprite DRAWN from that
# angle. Plate keyword -> sprite-name tags that qualify. Neutral plates (closeup, extreme_wide, corner_34,
# dutch) take any pose. Change together with ANGLE_PLATES.
ANGLE_SPRITE = {
    'topdown': ('_topdown_',), 'birdseye': ('_topdown_',), 'looking_down': ('_topdown_',),
    'low_angle': ('_from_below_',), 'high_angle': ('_high_angle_',),
    'over_': ('_back_',), 'through_': ('_back_',), 'doorway': ('_back_',),
    'backseat': ('_back_',), 'framing': ('_back_',),
}


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
# Rendered hand-lettered width per char per px of size, measured on v9 stills (2026-11-17):
# "A BELIEVABLE STORY"@120 = 1275px (0.59), "THE BILLS KEPT GROWING"@80 = 1086px (0.62). GLYPH above
# stays the underline length (a slightly short underline reads fine); this one bounds the real box.
GLYPH_BOX = 0.62
CAP_H = 0.6               # half the glyph box height, as a fraction of size (caps + halo)
SAFE = 48                 # px kept clear at every frame edge (~2.5% title-safe of 1920)
PLATE_ORIGIN = '50% 60%'  # mirrors the plate zoom transformOrigin default in InkParts.tsx ShotPlayer


def _origin(bg):
    ox, oy = (float(v.rstrip('%')) / 100 for v in bg.get('origin', PLATE_ORIGIN).split())
    return ox * STAGE_W, oy * STAGE_H


def _states(shot):
    """Affine maps stage->frame (x: a*x+b, y: c*y+d) at shot start and end; mirrors InkParts.tsx
    (plate zoom around origin, then Camera translate clamp + scale). Both transforms are monotonic
    in time, so the two ends bound the whole shot."""
    bg, cam, out = shot['bg'], shot['cam'], []
    for t in (0, 1):
        z = bg['zoom'][t] if 'plate' in bg else 1.0           # photo push scales the photo only
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
    """Move (then if needed shrink) every words element so its box stays inside the safe frame for the
    whole shot; its underline moves with it. Returns a list of what changed, for the build log."""
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
            e['size'] = int(e['size'] * 0.92)                   # too wide for any position: shrink
        e['x'] = round(min(max(e['x'], lo_x), hi_x)) if lo_x <= hi_x else STAGE_W // 2
        e['y'] = round(max(e['y'], lo_y))
        if (e['x'], e['y'], e['size']) != (x0, y0, size0):
            log.append(f"{e['text']}: x {x0}->{e['x']} y {y0}->{e['y']} size {size0}->{e['size']}")
            if ul:
                ul['x'], ul['y'] = e['x'], e['y'] + round(e['size'] * 0.55)
                ul['w'] = round(GLYPH * e['size'] * len(e['text']))
    return log


# ---------- sprites fitted to the frame ----------
# Mirrors InkProof.tsx Sprite: image box = SPRITE_BOX_W x h, preserveAspectRatio "xMidYMax meet", so the drawn
# width is min(SPRITE_BOX_W, h * png aspect), bottom-centred on (x, FLOOR). The visible ink is the PNG's alpha
# bbox inside that box. v10.1 bug (Zen 2026-11-17 "thisi sbroken" @01:10): a tall sprite swapped for a wide
# top-down one kept its old x/h and hung off the right edge. Change SPRITE_BOX_W together with InkProof.tsx.
SPRITE_BOX_W = 900
# Top-down sprites have no floor: the body is seen from above, so all four edges are checked and the anchor may
# rise off FLOOR. Their height is capped so the figure reads at desk/plate scale, not as a giant over the plate
# (Zen 2026-11-17 @01:10 "oversized"; 520px hat-to-shoes covered half a desk). 0.36 x STAGE_H ~= 390px.
TOPDOWN_MAX_H = round(0.36 * STAGE_H)
_ink_cache = {}


def _sprite_ink(src):
    """(png aspect w/h, alpha bbox as fractions l, t, r, b) of a cast PNG, cached."""
    if src not in _ink_cache:
        from PIL import Image
        im = Image.open(ASSETS / src)
        l, t, r, b = im.getchannel('A').getbbox() if 'A' in im.getbands() else (0, 0, *im.size)
        W, H = im.size
        _ink_cache[src] = (W / H, (l / W, t / H, r / W, b / H))
    return _ink_cache[src]


def _sprite_box(e):
    """Stage-space box (left, top, right, bottom) of the visible ink, relative to x (left/right are offsets)."""
    ar, (fl, ft, fr, fb) = _sprite_ink(e['src'])
    w = min(SPRITE_BOX_W, e['h'] * ar)
    h = w / ar
    if e.get('flip'):
        fl, fr = 1 - fr, 1 - fl
    return -w / 2 + fl * w, e['y'] - h + ft * h, -w / 2 + fr * w, e['y'] - h + fb * h


def fit_sprites(shot):
    """Move (then if needed shrink) every sprite so its visible ink stays inside the safe frame for the whole
    shot (start and end of plate zoom / camera). Bottom is not checked: feet sit on FLOOR whatever h is, and a
    push that crops below the knees is normal framing, not an overflow."""
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
            e['h'] = int(e['h'] * 0.94)                       # too big for any position: shrink
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
# A cross drawn on a word's own (x, y) strikes that word: its box is the word's glyph box plus STRIKE_PAD
# each side, height STRIKE_H x size. Stacked "NO X / NO Y / NO Z" rows then never overlap (v9 p17 had
# 260px squares on 140px rows -> a lattice). Crosses on anything else keep their square `size`.
STRIKE_PAD = 30           # px past each end of the word, so the strokes clearly overrun it
STRIKE_H = 1.1            # x size: covers caps + halo, stays under the usual 1.4-1.6 x size row pitch


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
                for t in times:
                    if not s['start'] <= t <= end - TAIL:
                        errors.append(f'{pid}@{s["start"]}-{end}: {e["t"]} {e.get("text", "")} at {t} outside shot')
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
        part = {'_doc': f'v10 of {pid} (generated by tools/ink/make_v10_shots.py; edit there).',
                'part': pid, 'f0': f0, 'f1': f1, 'shots': out}
        (OUT / f'{pid}.json').write_text(json.dumps(part, indent=1), encoding='utf-8')
        mins = (f1 - f0) / 30 / 60
        kinds = {'card': sum(bg_key(s['bg']) == 'card' for s in shots),
                 'photo': sum('photo' in s['bg'] for s in shots) + sum(e['t'] == 'photo' for s in shots for e in s['els']),
                 'chart': sum(e['t'] in ('bars', 'flow', 'timeline', 'tower') for s in shots for e in s['els']),
                 'cam': sum(bool(s['cam']) for s in shots)}
        els = sum(len(s['els']) for s in shots) / len(shots)
        rows.append(f'{pid} shots={len(shots):2d} per_min={len(shots) / mins:5.1f} els/shot={els:.1f} {kinds}')
    print('\n'.join(rows))
    counts, qerrs = quarter_balance(PARTS, f1)
    print('per quarter: ' + ' | '.join(f'Q{i + 1} {c}' for i, c in enumerate(counts)))
    errors += qerrs + reuse_errors(PARTS) + angle_errors(PARTS) + sprite_reuse_errors(PARTS)
    total = sum(len(v) for v in PARTS.values())
    print(f'total shots {total}')
    print(f'frame-safe fits ({len(fits)}):\n  ' + '\n  '.join(fits))
    if errors:
        print('ERRORS:\n' + '\n'.join(errors))
        raise SystemExit(1)
    print('ok')


if __name__ == '__main__':
    build()
