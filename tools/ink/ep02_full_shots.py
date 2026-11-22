"""Ep02 (Blackbeard) full video, hybrid cut: 88 beats, one shot builder per timeline shot.

Every builder is f(t, d) -> shot, where t = shot start and d = its length in frames, both read from
full-hybrid/timeline.json, so the picture can never drift from the voice and element timings scale
with the slot. Helpers and whole-video lints come from make_ep02_min1_shots.py; the minute-one
SKILL rules run per minute window here (start // 1800).

House style = the plain sNN scene plates (no _mid/_blend/_flat). Icons 'man', 'mask', 'face' are
banned (Zen 2026-11-23): people on cards are cast sprites.

Run: python -I tools/ink/ep02_full_shots.py -> engine/ink/parts/shots_ep02full/full.json
"""
import collections
import json
import sys

sys.path.insert(0, 'D:/AI-video/tools/ink')
import make_ep02_min1_shots as m1  # noqa: E402
from make_ep02_min1_shots import *  # noqa: E402,F401,F403
from make_ep02_min1_shots import (ASSETS, ROOT, CARD, TEXT_ELS, ICON_H, CARD_WORDS_MAX, CARD_LINES_MAX,  # noqa: E402
                                  FRAMINGS_MIN, SPRITE_MAX, ICON_USES_MAX, WORD_CARD_SHARE, SPLIT_RANGE,
                                  ONE_OBJECT_MIN, MIN1_CUTS, TYPE_CAP, TYPE_CAP_ANY, TAIL, MIN_SHOT, COUNT_MAX,
                                  bg_key, framing, text_only, layout_of, icons_of, fit_words, fit_sprites,
                                  add_meters)

OUT = ROOT / 'engine/ink/parts/shots_ep02full'
AUDIO = 'full-hybrid'
MINUTE = 1800                       # 60 s x 30 fps: window for the per-minute SKILL rules
BANNED_ICONS = {'man', 'mask', 'face'}
S11 = 's11_inlet_spyglass'

# survival odds per beat (story arc: safe party -> navy -> massacre -> trial -> two walk away)
m1.METER.update({
    'b11': 50, 'b12': 50, 'b13': 55, 'b14': 55, 'b15': 45, 'b16': 40, 'b17': 45, 'b18': 50, 'b19': 55,
    'b20': 55, 'b21': 45, 'b22': 40, 'b23': 40, 'b24': 35, 'b25': 35, 'b26': 40, 'b27': 35, 'b28': 45,
    'b29': 45, 'b30': 50, 'b31': 45, 'b32': 35, 'b33': 30, 'b34': 30, 'b35': 25, 'b36': 20, 'b37': 25,
    'b38': 25, 'b39': 30, 'b40': 30, 'b41': 30, 'b42': 30, 'b43': 25, 'b44': 30, 'b45': 25, 'b46': 25,
    'b47': 20, 'b48': 20, 'b49': 18, 'b50': 15, 'b51': 12, 'b52': 10, 'b53': 15, 'b54': 18, 'b55': 15,
    'b56': 12, 'b57': 12, 'b58': 10, 'b59': 8, 'b60': 10, 'b61': 8, 'b62': 5, 'b63': 10, 'b64': 10,
    'b65': 12, 'b66': 10, 'b67': 10, 'b68': 20, 'b69': 20, 'b70': 20, 'b71': 25, 'b72': 20, 'b73': 20,
    'b74': 15, 'b75': 12, 'b76': 10, 'b77': 5, 'b78': 5, 'b79': 5, 'b80': 60, 'b81': 60, 'b82': 60,
    'b83': 60, 'b84': 40, 'b85': 40, 'b86': 40, 'b87': 40, 'b88': 40})

LEAD = 4                            # first element lands this many frames after the cut


def stp(d, n, fixed=0, cap=14, lead=LEAD):
    """Largest step (<= cap) so an n-item layout ending at at + fixed + (n-1)*step stays inside the slot."""
    return max(2, min(cap, (d - lead - fixed - TAIL - 2) // max(1, n - 1)))


def DOC(t, d, title, lines, kind='card', mark=None, stamp=None, rot=-3, w=860, h=480):
    e = {'t': 'doc', 'x': 960, 'y': 540, 'w': w, 'h': h, 'kind': kind, 'title': title, 'lines': lines,
         'at': t + LEAD, 'step': stp(d, len(lines), 20, cap=8), 'rot': rot}
    if mark:
        e['mark'] = {'line': mark[0], 'style': mark[1]}
    if stamp:
        e['stamp'] = stamp
    return [e]


def FLOW(t, d, items):
    return [{'t': 'flow', 'x': 960, 'y': 560, 'w': 420, 'gap': 120, 'at': t + LEAD,
             'step': stp(d, len(items), cap=20), 'items': items, 'color': 'orange'}]


def BARS(t, d, items):
    return [{'t': 'bars', 'x': 960, 'y': 820, 'w': 900, 'h': 420, 'at': t + LEAD, 'step': stp(d, len(items), cap=24),
             'items': [{'label': a, 'value': v, 'text': s} for a, v, s in items]}]


def CHK(t, d, rows):
    return [{'t': 'checklist', 'x': 960, 'y': 480, 'w': 900, 'at': t + LEAD, 'step': stp(d, len(rows), cap=14),
             'rows': [{'text': a, 'mark': m} for a, m in rows]}]


def MAPE(t, d, frm, to, label=None):
    e = {'t': 'map', 'region': 'atlantic', 'from': {'x': frm[0], 'y': frm[1], 'label': frm[2]},
         'to': {'x': to[0], 'y': to[1], 'label': to[2]}, 'at': t + LEAD, 'dur': min(30, d - LEAD - TAIL - 2)}
    if label:
        e['label'] = label
    return [e]


def GRID(t, d, icon, cols, rows, odd_i, odd_icon, label=None):
    e = {'t': 'grid', 'x': 960, 'y': 440, 'w': 880, 'icon': icon, 'cols': cols, 'rows': rows,
         'odd': {'index': odd_i, 'icon': odd_icon}, 'at': t + LEAD, 'step': stp(d, cols * rows, cap=4)}
    if label:
        e['label'] = label
    return [e]


def RING(t, d, icon, n, odd_label, odd_icon=None, label=None):
    odd = {'angle': 30, 'label': odd_label}
    if odd_icon:
        odd['icon'] = odd_icon
    e = {'t': 'ring', 'x': 960, 'y': 470, 'r': 260, 'icon': icon, 'n': n, 'odd': odd, 'at': t + LEAD,
         'step': max(2, min(4, (d - LEAD - 10 - TAIL - 2) // n))}
    if label:
        e['label'] = label
    return [e]


def SCALE(t, d, left, right, heavy, label=None):
    # Mirrors engine/ink/parts/layouts/scaleLayout.ts: the renderer throws mid-render on equal icons.
    assert left[0] != right[0], f'scale left and right must have different icons ({left[0]})'
    e = {'t': 'scale', 'left': {'icon': left[0], 'label': left[1]}, 'right': {'icon': right[0], 'label': right[1]},
         'heavy': heavy, 'at': t + LEAD, 'dur': max(8, min(20, d - LEAD - 30 - TAIL - 2))}
    if label:
        e['label'] = label
    return [e]


def TL(t, d, left, right, bracket):
    return [{'t': 'timeline', 'x1': 300, 'x2': 1620, 'y': 620, 'left': left, 'right': right, 'at': t + LEAD,
             'bracket': bracket, 'bracketAt': t + min(30, d - TAIL - 4)}]


def CS(name, t, x=960, h=320, y=640, flip=False):
    """One cast sprite on a card (card sprites are clamped to ICON_H by the lint)."""
    return SP(name, t, x, h=h, flip=flip, y=y)


def CW(text, t, color=None):
    """Card headline line (top of card)."""
    return W(text, t, y=220, size=110, color=color)


def el_times(e):
    """Every frame an element changes, incl. the last item of each layout (must sit inside its shot)."""
    times = m1.el_times(e)
    k = e['t']
    if k == 'doc':
        times.append(e['at'] + 20 + (len(e['lines']) - 1) * e['step'])
    elif k == 'grid':
        times.append(e['at'] + (e['cols'] * e['rows'] - 1) * e['step'])
    elif k == 'ring':
        times.append(e['at'] + 10 + e['n'] * e['step'])
    elif k == 'scale':
        times.append(e['at'] + 30 + e['dur'])
    elif k == 'map':
        times.append(e['at'] + e['dur'])
    elif k in ('flow', 'bars'):
        times.append(e['at'] + (len(e['items']) - 1) * e['step'])
    elif k == 'checklist':
        times.append(e['at'] + (len(e['rows']) - 1) * e['step'])
    return times


S01, S02, S03, S04, S05 = m1.S01, m1.S02, m1.S03, m1.S04, m1.S05
S06, S07, S08, S09, S10 = m1.S06, m1.S07, m1.S08, m1.S09, m1.S10
MAP, BB = m1.MAP, m1.BB

# ---------- shot plan: beat id -> one builder per timeline shot ----------
P = {
    # b1 "You have less than a day to live."
    'b1': [lambda t, d: S(t, SC(S01), ST('LESS THAN A DAY TO LIVE', t + 10), cam=PUSH(1300, 480, 1.22)),
           lambda t, d: S(t, CARD, HERO('clock', 'UNDER 24 HOURS', t + LEAD, burst=True))],
    # b2 one of about twenty men ... dead or hanged
    'b2': [lambda t, d: S(t, SC(S02), TG("BLACKBEARD'S SHIP", t + 19, 960, 330), cam=PUSH(960, 470, 1.3)),
           lambda t, d: S(t, CARD, CS('crew_stand', t + 3, 600, y=700), CS('crew_scrub', t + 9, 960, y=700),
                          CS('crew_haul_rope', t + 15, 1320, y=700), CW('ABOUT 20 MEN', t + 20)),
           lambda t, d: S(t, SC(S03), cam=PAN(500, 1420)),
           lambda t, d: S(t, CARD, CS('crew_scared', t + 3), X(t + 24, 960, 480), CW('BY NEXT SUMMER', t + 14))],
    # b3 only two kinds walk away; stay to the end
    'b3': [lambda t, d: S(t, SC(S04, (1.0, 1.1)), O('ONLY 2 KINDS', t + 15, x=R, y=260)),
           lambda t, d: S(t, CARD, SPL(('key', 'KIND ONE'), ('padlock', 'KIND TWO'), t + 3, 14, vs='?')),
           lambda t, d: S(t, SC(S05, (1.08, 1.0)), W('STAY TO THE END', t + 13, x=R, y=220), cam=PULL(960, 520))],
    # b4 strangest part: tonight he isn't worried
    'b4': [lambda t, d: S(t, CARD, CS('bb_exp_deadpan', t + 3, y=620), CW('STRANGEST PART?', t + 11)),
           lambda t, d: S(t, SC(S06, (1.0, 1.06)), O('NOT WORRIED', t + 13, x=R, y=240), cam=PAN(1400, 1100))],
    # b5 21 November 1718, small sloop, quiet inlet
    'b5': [lambda t, d: S(t, CARD, BN(1718, '21 NOVEMBER', t + 3, 36, year=True)),
           lambda t, d: S(t, PH(MAP, pos='50% 50%', push=(1.0, 1.12)),
                          chip='OCRACOKE INLET, NORTH CAROLINA', chipAt=t + 5, chipPos='tl'),
           lambda t, d: S(t, CARD, HERO('ship', 'ONE SMALL SLOOP', t + 3)),
           lambda t, d: S(t, SC(S07), cam=PAN(400, 1300))],
    # b6 rum, guests from Bath, one matters later
    'b6': [lambda t, d: S(t, SC(S01, origin='30% 60%'), cam=PUSH(500, 620)),
           lambda t, d: S(t, CARD, CS('bath_gent_stand', t + 3, 600, y=700), CS('bath_merchant_laugh', t + 9, 960, y=700),
                          CS('bath_farmer_stand', t + 15, 1320, y=700), CW('GUESTS FROM BATH', t + 22)),
           lambda t, d: S(t, SC(S07), cam=PUSH(880, 700, 1.35)),
           lambda t, d: S(t, CARD, CS('bath_gent_sly', t + 3), CI(t + 14, 960, 480, 380, 380),
                          CW('REMEMBER HIM', t + 20, color='orange'))],
    # b7 does your wife know where you buried your money? me and the devil
    'b7': [lambda t, d: S(t, SC(S08), cam=PUSH(1000, 500, 1.18)),
           lambda t, d: S(t, CARD, QT('Does your wife know where you buried your money?', 'A GUEST', t + 4)),
           lambda t, d: S(t, SC(S08), cam=PUSH(1250, 480, 1.35)),
           lambda t, d: S(t, CARD, CS('bb_exp_angry_grin', t + 3), CW('ME AND THE DEVIL', t + 14, color='orange'))],
    # b8 joke: great line, terrible retirement plan
    'b8': [lambda t, d: S(t, PH(BB, pos='50% 20%'), W('GREAT LINE.', t + 8, x=R, y=230, size=90),
                          O('TERRIBLE PLAN', t + 48, x=R, y=360, size=90))],
    # b9 no treasure: cocoa and cotton
    'b9': [lambda t, d: S(t, CARD, TF(('coin', 'TREASURE'), ('suitcase', 'COCOA + COTTON'), t + 3, 22)),
           lambda t, d: S(t, SC(S09, (1.08, 1.0)), TG('COCOA', t + 10, 440, 560), TG('COTTON', t + 24, 840, 800),
                          cam=PULL(960, 600))],
    # b10 joke: most feared pirate = chocolate delivery
    'b10': [lambda t, d: S(t, SC(S10), ST('MOST FEARED', t + 11, x=R, y=260), cam=PUSH(560, 520, 1.15)),
            lambda t, d: S(t, CARD, SPL(('ship', 'PIRATE'), ('suitcase', 'CHOCOLATE RUN'), t + 3, 22, vs='='))],
    # b11 royal pardon five months ago
    'b11': [lambda t, d: S(t, SC(S06), O('ROYAL PARDON', t + 14, x=R, y=240), cam=PAN(1400, 1000)),
            lambda t, d: S(t, CARD, DOC(t, d, 'ROYAL PARDON', ['STOP PIRATING', 'THE CRIME IS WIPED', 'BY ORDER OF THE KING'],
                                        kind='certificate', mark=(1, 'underline')))],
    # b12 didn't stop: caught speeding, 200 on the drive home
    'b12': [lambda t, d: S(t, SC(S10), W("HE DIDN'T STOP", t + 12, x=R, y=240), cam=PUSH(560, 520, 1.18)),
            lambda t, d: S(t, CARD, TF(('pen', '"NEVER AGAIN"'), ('clock', 'DOING 200'), t + LEAD, 24))],
    # b13 governor is his neighbour: landlord = getaway driver; who comes here?
    'b13': [lambda t, d: S(t, SC(S07), TG('NORTH CAROLINA', t + 10, 960, 300), cam=PAN(400, 1300)),
            lambda t, d: S(t, CARD, SPL(('crown', 'GOVERNOR'), ('key', 'GETAWAY DRIVER'), t + LEAD, 16, vs='=')),
            lambda t, d: S(t, SC(S02), O('WHO COMES HERE?', t + 12, x=L, y=240), cam=PULL(960, 500))],
    # b14 One Piece villain named after him; the real one
    'b14': [lambda t, d: S(t, CARD, CS('bb_exp_grin', t + 3), CW('THE REAL ONE', t + 16)),
            lambda t, d: S(t, PH(BB, pos='50% 22%'), W('NAMED AFTER HIM', t + 10, x=R, y=260, size=90))],
    # b15 one state over, Virginia's governor wants him dead
    'b15': [lambda t, d: S(t, CARD, MAPE(t, d, (330, 640, 'NORTH CAROLINA'), (310, 520, 'VIRGINIA'), 'ONE STATE OVER'),
                           ST('WANTS HIM DEAD', t + 60, y=880, rot=-6))],
    # b16 navy too big for shallows: 2 small boats, own budget, sent to kill
    'b16': [lambda t, d: S(t, SC(S11), TG('WARSHIPS TOO BIG', t + 10, 960, 320), cam=PUSH(1100, 480, 1.2)),
            lambda t, d: S(t, CARD, CNT('ship', 2, t + LEAD, 12, 'PAID FROM HIS OWN BUDGET', 960, 520, 900)),
            lambda t, d: S(t, SC(S03), O('SENT TO KILL HIM', t + 12, x=R, y=240), cam=PAN(1400, 500))],
    # b17 most feared pirate alive, tiny boat, twenty men
    'b17': [lambda t, d: S(t, CARD, BN(20, 'MEN ON A TINY BOAT', t + 3, 30)),
            lambda t, d: S(t, SC(S04), W('MOST FEARED ALIVE?', t + 12, x=R, y=240), cam=PULL(960, 560))],
    # b18 rewind a year: Queen Anne's Revenge, 40 cannons, ~300 men
    'b18': [lambda t, d: S(t, CARD, TL(t, d, '1717', '1718', 'REWIND ONE YEAR')),
            lambda t, d: S(t, SC(S01), TG("QUEEN ANNE'S REVENGE", t + 10, 960, 300), cam=PUSH(960, 460, 1.2)),
            lambda t, d: S(t, CARD, BARS(t, d, [('CANNONS', 40, '40'), ('MEN', 300, '~300')]))],
    # b19 Charleston blockade, a week nothing moves
    'b19': [lambda t, d: S(t, PH(MAP, pos='50% 65%', push=(1.0, 1.14)), chip='CHARLESTON, SOUTH CAROLINA',
                           chipAt=t + 6, chipPos='tl'),
            lambda t, d: S(t, CARD, GRID(t, d, 'ship', 4, 2, 5, 'padlock', 'A WEEK. NOTHING MOVES'))],
    # b20 hostages; ransom = chest of medicine
    'b20': [lambda t, d: S(t, SC(S09), O('HOSTAGES', t + 12, x=R, y=240), cam=PAN(500, 1400)),
            lambda t, d: S(t, CARD, TF(('coin', 'RANSOM'), ('suitcase', 'FIRST-AID KIT'), t + LEAD, 30))],
    # b21 June, flagship on a sandbank
    'b21': [lambda t, d: S(t, SC(S05), W('JUNE: SANDBANK', t + 14, x=R, y=240), cam=PUSH(1100, 600, 1.2))],
    # b22 did it on purpose; fewer shares; layoff
    'b22': [lambda t, d: S(t, CARD, QT('He did it on purpose.', 'ONE OF HIS OWN MEN', t + LEAD)),
            lambda t, d: S(t, SC(S03), W('FEWER MEN, FEWER SHARES', t + 10, x=960, y=220, size=80), cam=PULL(900, 560)),
            lambda t, d: S(t, CARD, FLOW(t, d, ['CHARLESTON', 'SANDBANK', 'LAYOFF']))],
    # b23 sails off with the loot, leaves the rest
    'b23': [lambda t, d: S(t, SC(S11), O('LEAVES THE REST', t + 10, x=L, y=240), cam=PAN(1300, 600)),
            lambda t, d: S(t, CARD, SPL(('ship', 'HE SAILS OFF'), ('padlock', 'THE REST: LEFT'), t + LEAD, 16))],
    # b24 wreck found 1996; 300 gone; one of twenty
    'b24': [lambda t, d: S(t, SC(S02), TG('THE WRECK', t + 10, 960, 320), cam=PUSH(700, 600, 1.22)),
            lambda t, d: S(t, CARD, TL(t, d, '1718', '1996', 'WRECK FOUND')),
            lambda t, d: S(t, SC(S06), O('ONE OF TWENTY', t + 10, x=R, y=240), cam=PULL(1300, 520))],
    # b25 count the men: nineteen, maybe twenty-five
    'b25': [lambda t, d: S(t, CARD, CNT('hat', 10, t + LEAD, 6, 'EACH = 2 MEN', 960, 520, 1300))],
    # b26 about six Black sailors; free or enslaved; hangman won't care
    'b26': [lambda t, d: S(t, SC(S01), W('LOOK CLOSER', t + 10, x=L, y=240), cam=PUSH(700, 600, 1.25)),
            lambda t, d: S(t, CARD, BN(6, 'BLACK SAILORS ON BOARD', t + 3, 24)),
            lambda t, d: S(t, SC(S09), TG('FREE OR ENSLAVED', t + 10, 960, 320), cam=PAN(1400, 600)),
            lambda t, d: S(t, CARD, SPL(('pen', 'FREE SAILOR'), ('handcuffs', 'ENSLAVED'), t + LEAD, 16, vs='='))],
    # b27 Israel Hands + two dozen men in town, miles away
    'b27': [lambda t, d: S(t, SC(S07), O('WHERE IS EVERYONE?', t + 12, x=R, y=240), cam=PAN(1300, 500)),
            lambda t, d: S(t, CARD, TF(('ship', 'ON DECK: 20'), ('hotel', 'IN TOWN: ~24'), t + LEAD, 26))],
    # b28 shares not wages: 1 for you, 2 for the captain; fairer than offices
    'b28': [lambda t, d: S(t, SC(S03), W('NO WAGES', t + 10, x=R, y=240), cam=PUSH(1200, 560, 1.2)),
            lambda t, d: S(t, CARD, BARS(t, d, [('YOU', 1, '1 SHARE'), ('CAPTAIN', 2, '2 SHARES')])),
            lambda t, d: S(t, SC(S10), O('FAIRER THAN OFFICES', t + 10, x=R, y=240), cam=PULL(600, 520))],
    # b29 quartermaster voted in: HR with a sword
    'b29': [lambda t, d: S(t, CARD, HERO('badge', 'QUARTERMASTER', t + 3), CW('HR, WITH A SWORD', t + 30)),
            lambda t, d: S(t, SC(S05), TG('VOTED IN BY THE CREW', t + 10, 960, 320), cam=PAN(600, 1300))],
    # b30 rules: lights out at 8, no gambling, gun clean, no smoking near powder
    'b30': [lambda t, d: S(t, CARD, CHK(t, d, [('LIGHTS OUT AT 8', 'tick'), ('NO GAMBLING', 'tick')])),
            lambda t, d: S(t, SC(S04), W('PIRATE RULES', t + 10, x=R, y=240), cam=PULL(960, 520)),
            lambda t, d: S(t, CARD, DOC(t, d, 'SHIP RULES', ['KEEP YOUR GUN CLEAN', 'NO SMOKING BY THE POWDER'],
                                        kind='memo', mark=(1, 'circle')))],
    # b31 nobody keeps watch
    'b31': [lambda t, d: S(t, SC(S08), O('NOBODY ON WATCH', t + 12, x=R, y=240), cam=PUSH(1000, 500, 1.2)),
            lambda t, d: S(t, CARD, XO('clock', 'THE NIGHT WATCH', t + 3, t + 34))],
    # b32 dawn, mist, a sail, then a second
    'b32': [lambda t, d: S(t, SC(S02), W('DAWN', t + 10, x=L, y=230), TG('A SAIL. THEN ANOTHER.', t + 70, 960, 380),
                           cam=PUSH(1300, 480, 1.25))],
    # b33 two boats, about 60 sailors, local guides
    'b33': [lambda t, d: S(t, CARD, CNT('ship', 2, t + LEAD, 12, '2 BOATS · ABOUT 60 SAILORS', 960, 520, 900)),
            lambda t, d: S(t, SC(S11), TG('LOCAL GUIDES ON BOARD', t + 10, 960, 320), cam=PAN(600, 1300))],
    # b34 stopped last night, sandbanks
    'b34': [lambda t, d: S(t, CARD, CS('crew_spyglass', t + 3), CW('STOPPED LAST NIGHT', t + 12)),
            lambda t, d: S(t, PH(MAP, pos='50% 45%', push=(1.0, 1.15)), chip='SANDBANKS EVERYWHERE', chipAt=t + 6,
                           chipPos='tl')],
    # b35 Lt Robert Maynard; no legal right
    'b35': [lambda t, d: S(t, CARD, DOC(t, d, 'LT. ROBERT MAYNARD', ['ROYAL NAVY', 'SENT BY VIRGINIA'])),
            lambda t, d: S(t, SC(S06), O('NO LEGAL RIGHT', t + 10, x=R, y=240), cam=PULL(1200, 520)),
            lambda t, d: S(t, CARD, XO('pen', 'PERMISSION', t + 3, t + 30))],
    # b36 twenty of you, sixty of them
    'b36': [lambda t, d: S(t, SC(S04), W('20 OF YOU', t + 8, x=L, y=240), O('60 OF THEM', t + 50, x=R, y=240),
                           cam=PUSH(960, 560, 1.15))],
    # b37 Edward Teach, two years a pirate
    'b37': [lambda t, d: S(t, CARD, BN(2, 'YEARS AS A PIRATE', t + 3, 24)),
            lambda t, d: S(t, PH(BB, pos='50% 28%', push=(1.06, 1.0)), W('EDWARD TEACH', t + 10, x=R, y=260, size=90))],
    # b38 claims 40 men, has 20: buying followers
    'b38': [lambda t, d: S(t, CARD, SPL(('newspaper', 'CLAIMS 40'), ('chair', 'REALLY 20'), t + LEAD, 16)),
            lambda t, d: S(t, SC(S01), TG('BUYING FOLLOWERS', t + 10, 960, 320), cam=PAN(500, 1400)),
            lambda t, d: S(t, CARD, CS('bb_exp_smirk', t + 3), CW('FAKE FOLLOWERS', t + 12))],
    # b39 the look
    'b39': [lambda t, d: S(t, SC(S10), O('THE LOOK', t + 14, x=R, y=240), cam=PUSH(560, 480, 1.3))],
    # b40 slow fuses under his hat, three pairs of pistols
    'b40': [lambda t, d: S(t, CARD, HERO('hat', 'SLOW FUSES UNDER HIS HAT', t + 3, burst=True)),
            lambda t, d: S(t, SC(S06), cam=PUSH(1300, 460, 1.25)),
            lambda t, d: S(t, CARD, CS('bb_hand_hilt', t + 3), CW('3 PAIRS OF PISTOLS', t + 12))],
    # b41 look terrifying so people give up
    'b41': [lambda t, d: S(t, SC(S04), W('LOOK TERRIFYING', t + 10, x=R, y=240), cam=PULL(960, 500)),
            lambda t, d: S(t, CARD, TF(('hat', 'THE LOOK'), ('key', 'THEY GIVE UP'), t + LEAD, 26))],
    # b42 may never have killed anyone
    'b42': [lambda t, d: S(t, SC(S05), O('NEVER KILLED ANYONE?', t + 10, x=R, y=240, size=80), cam=PAN(1300, 700)),
            lambda t, d: S(t, CARD, QT('He may never have killed anyone.', None, t + LEAD))],
    # b43 cut the anchor, jolt
    'b43': [lambda t, d: S(t, SC(S03), ST('CUT THE ANCHOR', t + 10, x=R, y=260), cam=PUSH(800, 600, 1.2)),
            lambda t, d: S(t, CARD, CS('crew_haul_rope', t + 3), CW('JOLT!', t + 10, color='orange'))],
    # b44 sandbar; so are they
    'b44': [lambda t, d: S(t, SC(S11), W('STUCK', t + 10, x=R, y=240), cam=PAN(1400, 700)),
            lambda t, d: S(t, CARD, SPL(('padlock', 'US: STUCK'), ('padlock', 'THEM: STUCK'), t + LEAD, 18, vs='='))],
    # b45 navy dumps ballast and water barrels
    'b45': [lambda t, d: S(t, SC(S09), TG('NAVY DUMPS WEIGHT', t + 10, 960, 320), cam=PULL(960, 600)),
            lambda t, d: S(t, CARD, FLOW(t, d, ['BALLAST', 'WATER BARRELS', 'AFLOAT']))],
    # b46 beach traffic jam
    'b46': [lambda t, d: S(t, SC(S02), O('TRAFFIC JAM', t + 10, x=R, y=240), cam=PUSH(960, 520, 1.2)),
            lambda t, d: S(t, CARD, CS('crew_exp_deadpan', t + 3), CW('BEACH TRAFFIC', t + 12))],
    # b47 gap closing, still alive
    'b47': [lambda t, d: S(t, SC(S08), W('GAP CLOSING', t + 10, x=L, y=240), cam=PUSH(1100, 480, 1.25)),
            lambda t, d: S(t, CARD, TF(('clock', 'GAP CLOSING'), ('key', 'STILL ALIVE'), t + LEAD, 26))],
    # b48 "Damn you for villains, who are you?"
    'b48': [lambda t, d: S(t, SC(S10), TG('"WHO ARE YOU?"', t + 20, 960, 320), cam=PUSH(600, 460, 1.3))],
    # b49 "we're no pirates"
    'b49': [lambda t, d: S(t, CARD, QT("We're no pirates.", 'MAYNARD', t + LEAD))],
    # b50 no mercy, no prisoners
    'b50': [lambda t, d: S(t, SC(S06), O('NO MERCY', t + 10, x=R, y=240), cam=PULL(1300, 500)),
            lambda t, d: S(t, CARD, XO('handcuffs', 'NO PRISONERS', t + 3, t + 30))],
    # b51 broadside
    'b51': [lambda t, d: S(t, SC(S01), ST('BROADSIDE!', t + 8, x=R, y=260), cam=PUSH(960, 560, 1.25)),
            lambda t, d: S(t, CARD, HERO('ship', 'ALL GUNS AT ONCE', t + 3, burst=True))],
    # b52 about 20 navy hit, 9 on the other boat, its captain dead
    'b52': [lambda t, d: S(t, SC(S03), cam=PAN(1400, 500)),
            lambda t, d: S(t, CARD, BARS(t, d, [('NAVY HIT', 20, '~20'), ('OTHER BOAT', 9, '9')])),
            lambda t, d: S(t, SC(S11), TG('THEIR CAPTAIN: DEAD', t + 10, 960, 320), cam=PUSH(1200, 520, 1.2))],
    # b53 a third down
    'b53': [lambda t, d: S(t, CARD, GRID(t, d, 'hat', 3, 1, 0, 'scrap', 'A THIRD DOWN')),
            lambda t, d: S(t, SC(S07), W('THEY ARE HURTING', t + 10, x=R, y=240), cam=PULL(800, 560))],
    # b54 might live to see lunch
    'b54': [lambda t, d: S(t, CARD, TF(('clock', 'DEAD BY NOON?'), ('coin', 'LUNCH, MAYBE'), t + LEAD, 22)),
            lambda t, d: S(t, SC(S05), O('ODDS GOING UP', t + 10, x=R, y=240), cam=PAN(700, 1300))],
    # b55 deck looks empty
    'b55': [lambda t, d: S(t, CARD, CS('crew_hide_barrel', t + 3), CW('DECK LOOKS EMPTY', t + 12)),
            lambda t, d: S(t, SC(S08), cam=PUSH(960, 520, 1.2))],
    # b56 grenades, hooks pull the boats together
    'b56': [lambda t, d: S(t, CARD, FLOW(t, d, ['GRENADES', 'HOOKS', 'PULLED TOGETHER'])),
            lambda t, d: S(t, SC(S03), ST('GRAPPLE!', t + 10, x=R, y=260), cam=PULL(960, 520))],
    # b57 "they're finished"
    'b57': [lambda t, d: S(t, CARD, QT("They're finished.", 'BLACKBEARD', t + LEAD))],
    # b58 never trust a free win; jump across
    'b58': [lambda t, d: S(t, SC(S10), W('NEVER TRUST A FREE WIN', t + 10, x=960, y=220, size=80), cam=PUSH(600, 500, 1.2)),
            lambda t, d: S(t, CARD, TF(('coin', 'FREE WIN'), ('handcuffs', 'TRAP'), t + LEAD, 30))],
    # b59 hatches burst: men hidden below
    'b59': [lambda t, d: S(t, SC(S04), O('HATCHES BURST', t + 8, x=R, y=240), cam=PUSH(960, 600, 1.25)),
            lambda t, d: S(t, CARD, RING(t, d, 'hat', 8, 'HIDDEN BELOW'))],
    # b60 now it's even, on their ship
    'b60': [lambda t, d: S(t, SC(S01), W('NOW IT IS EVEN', t + 10, x=L, y=240), cam=PAN(1400, 600))],
    # b61 powder room, lit fuse
    'b61': [lambda t, d: S(t, CARD, HERO('key', 'THE POWDER ROOM', t + 3)),
            lambda t, d: S(t, SC(S09), O('LIT FUSE', t + 10, x=R, y=240), cam=PUSH(960, 600, 1.25)),
            lambda t, d: S(t, CARD, CS('crew_lantern', t + 3), CW('ONE SPARK', t + 10, color='orange'))],
    # b62 blow the ship up
    'b62': [lambda t, d: S(t, SC(S04), ST('BLOW THE SHIP UP', t + 12, x=960, y=300), cam=PUSH(960, 560, 1.28))],
    # b63 pistols
    'b63': [lambda t, d: S(t, CARD, SPL(('hat', 'BLACKBEARD'), ('badge', 'MAYNARD'), t + LEAD, 16)),
            lambda t, d: S(t, SC(S06), ST('BANG', t + 10, x=R, y=260), cam=PUSH(1300, 480, 1.25))],
    # b64 swords; his blade snaps Maynard's; neck cut
    'b64': [lambda t, d: S(t, CARD, CS('bb_cutlass', t + 3), CW('SWORD SNAPS', t + 14)),
            lambda t, d: S(t, SC(S10), O('NECK CUT', t + 10, x=R, y=240), cam=PULL(600, 500))],
    # b65 five bullets, about twenty cuts
    'b65': [lambda t, d: S(t, CARD, BARS(t, d, [('BULLETS', 5, '5'), ('SWORD CUTS', 20, '~20')])),
            lambda t, d: S(t, SC(S05), W('STILL STANDING', t + 10, x=R, y=240), cam=PAN(700, 1300))],
    # b66 crewmates going down
    'b66': [lambda t, d: S(t, CARD, CS('crew_exp_scared', t + 3), CW('CREWMATES GOING DOWN', t + 12)),
            lambda t, d: S(t, SC(S03), cam=PUSH(1100, 560, 1.22))],
    # b67 they still outnumber you, a few minutes
    'b67': [lambda t, d: S(t, CARD, SCALE(t, d, ('chair', 'YOU'), ('badge', 'NAVY'), 'right', 'STILL OUTNUMBERED')),
            lambda t, d: S(t, SC(S08), O('A FEW MINUTES', t + 10, x=R, y=240), cam=PULL(1000, 500))],
    # b68 head on the bowsprit, body over the side
    'b68': [lambda t, d: S(t, CARD, XO('hat', 'BLACKBEARD', t + 3, t + 24)),
            lambda t, d: S(t, SC(S11), cam=PUSH(1200, 480, 1.2)),
            lambda t, d: S(t, CARD, CS('crew_exp_oh', t + 3), CW('OVER THE SIDE', t + 8))],
    # b69 head to Virginia: pics or it didn't happen
    'b69': [lambda t, d: S(t, SC(S02), W('TO VIRGINIA', t + 10, x=R, y=240), cam=PAN(600, 1400)),
            lambda t, d: S(t, CARD, MAPE(t, d, (330, 640, 'OCRACOKE'), (310, 520, 'VIRGINIA'), 'THE PROOF')),
            lambda t, d: S(t, PH(BB, pos='50% 20%'), O("PICS OR IT DIDN'T HAPPEN", t + 10, x=R, y=260, size=70))],
    # b70 legend: headless swim
    'b70': [lambda t, d: S(t, CARD, SPL(('ship', 'LEGEND: SWIMS'), ('newspaper', 'FACT: SANK'), t + LEAD, 18, vs='?')),
            lambda t, d: S(t, SC(S07), TG('JUST A LEGEND', t + 10, 960, 320), cam=PULL(960, 600))],
    # b71 fuse stopped in time
    'b71': [lambda t, d: S(t, CARD, XO('clock', 'THE FUSE', t + 3, t + 30)),
            lambda t, d: S(t, SC(S09), W('IN TIME', t + 10, x=R, y=240), cam=PAN(1400, 700))],
    # b72 no gold: cocoa, cotton, letters
    'b72': [lambda t, d: S(t, CARD, CHK(t, d, [('GOLD', 'cross'), ('COCOA', 'tick'), ('COTTON', 'tick'),
                                               ('LETTERS', 'tick')])),
            lambda t, d: S(t, SC(S04), O('NO GOLD', t + 10, x=R, y=240), cam=PUSH(960, 600, 1.2))],
    # b73 Tobias Knight: in the pirate's DMs
    'b73': [lambda t, d: S(t, CARD, DOC(t, d, 'A LETTER', ['TO: BLACKBEARD', 'FROM: TOBIAS KNIGHT'], kind='memo',
                                        mark=(1, 'circle'))),
            lambda t, d: S(t, SC(S06), TG("IN THE PIRATE'S DMS", t + 10, 960, 320), cam=PUSH(1300, 480, 1.22))],
    # b74 accused, never stuck; nobody important jailed
    'b74': [lambda t, d: S(t, CARD, TF(('pen', 'ACCUSED'), ('key', 'WALKS FREE'), t + LEAD, 30)),
            lambda t, d: S(t, SC(S07), W('NOBODY IMPORTANT JAILED', t + 10, x=960, y=220, size=80), cam=PAN(500, 1400))],
    # b75 men in charge walk away; what about you
    'b75': [lambda t, d: S(t, CARD, SPL(('crown', 'MEN IN CHARGE'), ('hat', 'YOU'), t + LEAD, 20, vs='?'))],
    # b76 how long do you last
    'b76': [lambda t, d: S(t, SC(S05), O('HOW LONG DO YOU LAST?', t + 6, x=960, y=240, size=80), cam=PUSH(1000, 520, 1.15))],
    # b77 dead by noon or in chains: 16 to Virginia
    'b77': [lambda t, d: S(t, CARD, CNT('handcuffs', 16, t + LEAD, 4, '16 TAKEN TO VIRGINIA', 960, 520, 1300)),
            lambda t, d: S(t, SC(S03), W('DEAD BY NOON OR CHAINS', t + 10, x=960, y=220, size=80), cam=PULL(960, 560))],
    # b78 jail almost four months
    'b78': [lambda t, d: S(t, CARD, TL(t, d, 'NOV 1718', 'MAR 1719', 'ALMOST 4 MONTHS IN JAIL'))],
    # b79 March, no jury, 14 sentenced, about 12 hang
    'b79': [lambda t, d: S(t, SC(S08), TG('NO JURY', t + 10, 960, 320), cam=PULL(1100, 520)),
            lambda t, d: S(t, CARD, DOC(t, d, 'THE SENTENCE', ['14 SENTENCED', 'ABOUT 12 HANG'], kind='certificate',
                                        stamp='GUILTY')),
            lambda t, d: S(t, SC(S10), cam=PUSH(600, 480, 1.22))],
    # b80 two men walk away (46 frames)
    'b80': [lambda t, d: S(t, CARD, CS('crew_exp_surprised', t + 2), CW('TWO WALK AWAY', t + 6))],
    # b81 Samuel Odel, the party guest, freed
    'b81': [lambda t, d: S(t, SC(S07), TG('SAMUEL ODEL', t + 8, 960, 320), cam=PUSH(880, 700, 1.3)),
            lambda t, d: S(t, CARD, CS('bath_gent_sly', t + 3), CW('PARTY GUEST: FREED', t + 10))],
    # b82 Israel Hands pardoned
    'b82': [lambda t, d: S(t, SC(S11), W('ISRAEL HANDS', t + 8, x=R, y=240), cam=PAN(600, 1300)),
            lambda t, d: S(t, CARD, HERO('pen', 'PARDONED', t + 3, burst=True))],
    # b83 don't be on it
    'b83': [lambda t, d: S(t, SC(S01), O("DON'T BE ON IT", t + 12, x=R, y=240), cam=PULL(960, 520))],
    # b84 400 pounds promised; waited four years
    'b84': [lambda t, d: S(t, CARD, BN(400, 'POUNDS PROMISED', t + 3, 30)),
            lambda t, d: S(t, SC(S06), W('WAITED 4 YEARS', t + 10, x=R, y=240), cam=PAN(1400, 900))],
    # b85 kept 90, no promotion
    'b85': [lambda t, d: S(t, CARD, SCALE(t, d, ('pen', 'PROMISED 400'), ('coin', 'KEPT 90'), 'left')),
            lambda t, d: S(t, SC(S05), O('NO PROMOTION', t + 8, x=R, y=240), cam=PUSH(1000, 520, 1.15)),
            lambda t, d: S(t, CARD, XO('badge', 'PROMOTION', t + 3, t + 30))],
    # b86 paid four years late; work never changes
    'b86': [lambda t, d: S(t, SC(S03), W('PAID 4 YEARS LATE', t + 10, x=R, y=240), cam=PULL(1100, 560)),
            lambda t, d: S(t, CARD, TF(('clock', 'PROMISED 1718'), ('bill', 'PAID 1722'), t + LEAD, 30))],
    # b87 CTA: at the party, in town, on deck?
    'b87': [lambda t, d: S(t, SC(S07), TG('WHERE WOULD YOU BE?', t + 8, 960, 320), cam=PAN(400, 1300)),
            lambda t, d: S(t, CARD, CHK(t, d, [('AT THE PARTY', 'none'), ('IN TOWN', 'none'), ('ON DECK', 'none')])),
            lambda t, d: S(t, SC(S02), W('TELL US IN COMMENTS', t + 8, x=960, y=220, size=80), cam=PUSH(960, 520, 1.15))],
    # b88 when a deck looks empty, ask who's hiding
    'b88': [lambda t, d: S(t, CARD, GRID(t, d, 'suitcase', 4, 2, 6, 'hat', "WHO'S HIDING?"))],
}


def lint_window(name, shots, errors, partial):
    """Minute-one SKILL rules applied to one minute window; lower bounds relaxed on a partial last window."""
    n = len(shots)
    if not partial and len({framing(s) for s in shots}) < FRAMINGS_MIN:
        errors.append(f'{name}: framings {sorted({framing(s) for s in shots})} < {FRAMINGS_MIN}')
    cards = [s for s in shots if 'card' in s['bg']]
    word_cards = [s for s in cards if all(e['t'] in TEXT_ELS for e in s['els'])]
    if len(word_cards) > WORD_CARD_SHARE * n:
        errors.append(f'{name}: {len(word_cards)} word-only cards > {WORD_CARD_SHARE:.0%}')
    one_obj = [s for s in cards if len([e for e in s['els'] if e['t'] not in TEXT_ELS]) == 1]
    if not partial and len(one_obj) < ONE_OBJECT_MIN:
        errors.append(f'{name}: {len(one_obj)} one-object cards < {ONE_OBJECT_MIN}')
    split_like = sum(e['t'] in ('split', 'transform') for s in shots for e in s['els'])
    if split_like > SPLIT_RANGE[1] or (not partial and split_like < SPLIT_RANGE[0]):
        errors.append(f'{name}: {split_like} split/transform cards outside {SPLIT_RANGE}')
    icon_uses = collections.Counter(i for s in shots for i in icons_of(s))
    errors += [f'{name}: icon {k} used {v}x > {ICON_USES_MAX}' for k, v in icon_uses.items() if v > ICON_USES_MAX]
    sprite_uses = collections.Counter(e['src'] for s in shots for e in s['els'] if e['t'] == 'sprite')
    errors += [f'{name}: sprite {k} used {v}x > {SPRITE_MAX}' for k, v in sprite_uses.items() if v > SPRITE_MAX]
    layouts = collections.Counter(t for s in shots for t in set(layout_of(s)))
    errors += [f'{name}: {t} used {c}x > {TYPE_CAP.get(t, TYPE_CAP_ANY)}' for t, c in layouts.items()
               if c > TYPE_CAP.get(t, TYPE_CAP_ANY)]


def build():
    tl = json.loads((ASSETS / AUDIO / 'timeline.json').read_text(encoding='utf-8'))
    total = tl['totalFrames']
    errors, fits = [], []
    starts = [s['start'] for b in tl['beats'] for s in b['shots']] + [total]
    shots, k = [], 0
    for b in tl['beats']:
        fns = P.get(b['id'], [])
        if len(fns) != len(b['shots']):
            errors.append(f"{b['id']}: {len(fns)} builders for {len(b['shots'])} timeline shots")
            fns = (fns + [None] * len(b['shots']))[:len(b['shots'])]
        for fn in fns:
            t, d = starts[k], starts[k + 1] - starts[k]
            k += 1
            if fn is None:
                continue
            shots.append(fn(t, d))
    if errors:
        return None, errors, fits, None
    add_meters(shots, tl)

    out, prev_bg = [], None
    for i, s in enumerate(shots):
        end = shots[i + 1]['start'] if i + 1 < len(shots) else total
        tag = f'@{s["start"]}'
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
        errors += [f'{tag}: banned icon {i}' for i in icons_of(s) if i in BANNED_ICONS]
        errors += [f'{tag}: count n={e["n"]} > engine COUNT_MAX {COUNT_MAX}' for e in s['els']
                   if e['t'] == 'count' and not 1 <= e['n'] <= COUNT_MAX]
        fits += [f'{tag} {m}' for m in fit_words(s)]
        fits += [f'{tag} {m}' for m in fit_sprites(s)]
        for e in s['els']:
            for t in el_times(e):
                if not s['start'] <= t <= end - TAIL:
                    errors.append(f'{tag}-{end}: {e["t"]} {e.get("text", e.get("label", e.get("title", "")))} at {t} outside shot')
        if s['chipAt'] is not None and not s['start'] <= s['chipAt'] <= end - TAIL:
            errors.append(f'{tag}: chip at {s["chipAt"]} outside shot')
        m = s['meter']
        if m is not None:
            for k2 in ('value', 'from'):
                if k2 in m and not 0 <= m[k2] <= 100:
                    errors.append(f'{tag}: meter {k2} {m[k2]} outside 0..100')
        shot = {'f0': s['start'], 'f1': end, 'bg': s['bg']}
        for k2 in ('cam', 'chip', 'chipAt', 'chipPos', 'meter'):
            if s[k2] is not None:
                shot[k2] = s[k2]
        shot['els'] = s['els']
        out.append(shot)

    cards = [s for s in shots if 'card' in s['bg']]
    for a, b in zip(cards, cards[1:]):
        shared = set(layout_of(a)) & set(layout_of(b))
        if shared:
            errors.append(f'cards {a["start"]} and {b["start"]} repeat layout {shared}')
    windows = collections.defaultdict(list)
    for s in shots:
        windows[s['start'] // MINUTE].append(s)
    last = max(windows)
    for w, ws in sorted(windows.items()):
        if w == 0 and len(ws) < MIN1_CUTS:
            errors.append(f'min0: {len(ws)} cuts < {MIN1_CUTS}')
        lint_window(f'min{w}', ws, errors, partial=(w == last and total - w * MINUTE < MINUTE))
    stats = (len(shots), len(cards), dict(collections.Counter(framing(s) for s in shots)))
    return ({'_doc': 'ep02 full video, hybrid cut (generated by tools/ink/ep02_full_shots.py; edit there).',
             'part': 'full', 'f0': 0, 'f1': total, 'shots': out}, errors, fits, stats)


def main():
    part, errors, fits, stats = build()
    if fits:
        print('FITS:', *fits, sep='\n  ')
    if errors:
        print('ERRORS:', *errors, sep='\n  ')
        sys.exit(1)
    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / 'full.json').write_text(json.dumps(part, separators=(',', ':')), encoding='utf-8')
    print(f'OK full: {stats[0]} shots ({stats[1]} cards), {part["f1"]} frames, framings {stats[2]}')


if __name__ == '__main__':
    main()
