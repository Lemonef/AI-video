"""Build v5 first-minute shot lists (Zen 2026-11-17: first minute needs Ink-level pace, "no drop" across the video).

v5 = v3 (Zen-approved look, same voice, same slow per-shot push-in, NO camera plan) with the long shots SPLIT into
new pictures on a voice word boundary: object close-ups (letter desk, rust), a real 1888 construction photo, a
bird's-eye plate, story places (Crillon, radio station). Target from the 21-video Ink study: >= 26 cuts in the first
minute (hits 26-34, v3 had 20). Every split must change the background (plate/photo/card) so the cut is a real new
picture (scene>0.3), never a camera move.

'at' frames stay absolute (voice-synced). Each split lists its new shots; they must exactly tile the old shot.

usage: python tools/ink/make_v5_shots.py [v5|v6]   (reads shots_v3, writes engine/ink/parts/shots_<ver>/p01.json, p02.json)
"""
import copy
import json
from pathlib import Path

REPO = Path(__file__).resolve().parents[2]
SRC = REPO / 'engine/ink/parts/shots_v3'
VER = __import__('sys').argv[1] if len(__import__('sys').argv) > 1 else 'v5'
DST = REPO / f'engine/ink/parts/shots_{VER}'
FPS = 30
MIN_S = 1.0  # report threshold
PUSH = [1.0, 1.05]  # same slow push-in v1/v3 plates use


def plate(src, **kw):
    return {'plate': src, 'zoom': PUSH, **kw}


# old shot f0 -> new shots tiling [old.f0, old.f1]; split frames sit on word starts (words/pNN.json)
SPLITS = {
    # "a man sold | the Eiffel Tower": Lustig outside the Crillon, then SOLD lands on the tower itself
    55: [
        {'f0': 55, 'f1': 95, 'bg': plate('ink60full/plates/hotel_crillon_facade_day.png'), 'els': [
            {'t': 'sprite', 'src': 'ink60/cast/lustig_4.png', 'x': 1240, 'y': 1000, 'h': 680, 'at': 57}]},
        {'f0': 95, 'f1': 143, 'bg': plate('ink60/plates/paris_tower_night.png', origin='75% 40%'), 'els': [
            {'t': 'stamp', 'text': 'SOLD', 'x': 1180, 'y': 560, 'rot': -12, 'color': 'red', 'at': 98}]},
    ],
    # "then he conned | Al Capone": the office, then a hard cut to the real mugshot full frame (dark plate -> sepia
    # photo registers as a cut; the v3 polaroid-on-office version did not count at scene>0.3)
    402: [
        {'f0': 402, 'f1': 432, 'bg': plate('ink60full/plates/capone_office.png'), 'els': [
            {'t': 'sprite', 'src': 'ink60/cast/capone_seated_desk.png', 'x': 1300, 'y': 1000, 'h': 660, 'at': 404}]},
        {'f0': 432, 'f1': 455, 'bg': {'photo': 'ink60full/pd/capone_mugshot.jpg', 'push': [1.0, 1.06], 'pos': '50% 30%'},
         'chip': 'AL CAPONE', 'chipAt': 433, 'els': []},
    ],
    # "his whole trick | fit inside one sentence": the sentence becomes a real letter on a desk (object close-up)
    666: [
        {'f0': 666, 'f1': 708, 'bg': {'card': True}, 'els': [
            {'t': 'words', 'text': 'HIS WHOLE TRICK', 'x': 760, 'y': 300, 'size': 100, 'at': 673},
            {'t': 'sprite', 'src': 'ink60/cast/lustig_lean_whisper.png', 'x': 1480, 'y': 1010, 'h': 720, 'at': 668}]},
        {'f0': 708, 'f1': 788, 'bg': plate('ink60full/plates/desk_topdown_papers.png'), 'els': [
            {'t': 'redact', 'x': 470, 'y': 380, 'w': 880, 'h': 64, 'at': 708},
            {'t': 'redact', 'x': 470, 'y': 480, 'w': 680, 'h': 64, 'at': 714},
            {'t': 'words', 'text': 'ONE SENTENCE.', 'x': 900, 'y': 720, 'size': 110, 'color': 'orange', 'at': 720}]},
    ],
    # "by the end of this video, | you will know the sentence"
    788: [
        {'f0': 788, 'f1': 836, 'bg': {'card': True}, 'els': [
            {'t': 'words', 'text': 'BY THE END', 'x': 960, 'y': 260, 'size': 110, 'at': 790},
            {'t': 'redact', 'x': 460, 'y': 470, 'w': 1000, 'h': 64, 'at': 798},
            {'t': 'redact', 'x': 460, 'y': 570, 'w': 780, 'h': 64, 'at': 806}]},
        {'f0': 836, 'f1': 889, 'bg': plate('ink60full/plates/forger_desk_night.png'), 'els': [
            {'t': 'sprite', 'src': 'ink60/cast/lustig_point_viewer.png', 'x': 460, 'y': 1010, 'h': 720, 'at': 836},
            {'t': 'words', 'text': 'THE SENTENCE', 'x': 1300, 'y': 260, 'size': 100, 'color': 'orange', 'at': 848},
            {'t': 'underline', 'x': 1300, 'y': 360, 'w': 640, 'at': 855}]},
    ],
    # "why it works on ... | almost everyone": the crowd ticks, then a bird's-eye of the whole city
    889: [
        {'f0': 889, 'f1': 948, 'bg': plate('ink60/plates/paris_dusk.png'), 'els': [
            {'t': 'sprite', 'src': 'ink60/cast/parisian_1.png', 'x': 420, 'y': 990, 'h': 560, 'at': 891},
            {'t': 'sprite', 'src': 'ink60/cast/parisian_2.png', 'x': 780, 'y': 990, 'h': 560, 'at': 895},
            {'t': 'sprite', 'src': 'ink60/cast/parisian_3.png', 'x': 1140, 'y': 990, 'h': 560, 'at': 899},
            {'t': 'sprite', 'src': 'ink60/cast/mark_talking_gesturing.png', 'x': 1500, 'y': 990, 'h': 560, 'at': 903},
            {'t': 'tick', 'x': 420, 'y': 330, 'at': 921},
            {'t': 'tick', 'x': 780, 'y': 330, 'at': 927},
            {'t': 'tick', 'x': 1140, 'y': 330, 'at': 937},
            {'t': 'tick', 'x': 1500, 'y': 330, 'at': 942}]},
        {'f0': 948, 'f1': 1001, 'bg': plate('ink60full/plates/paris_birdseye_champ_de_mars.png', origin='50% 50%'), 'els': [
            {'t': 'words', 'text': 'ALMOST EVERYONE.', 'x': 1240, 'y': 200, 'size': 100, 'color': 'orange', 'at': 950}]},
    ],
    # "start with the tower itself. | It was built in 1889": real construction photo carries the date
    1001: [
        {'f0': 1001, 'f1': 1081, 'bg': {'plate': 'ink60full/plates/tower_low_angle_up.png', 'zoom': [1.0, 1.15], 'origin': '50% 15%'},
         'chip': 'THE TOWER', 'chipAt': 1027, 'els': []},
        {'f0': 1081, 'f1': 1128, 'bg': {'photo': 'ink60full/pd/eiffel_construction_1888.jpg', 'push': [1.0, 1.06], 'pos': '50% 35%'}, 'els': [
            {'t': 'words', 'text': '1889', 'x': 1460, 'y': 460, 'size': 220, 'color': 'orange', 'at': 1102},
            {'t': 'underline', 'x': 1460, 'y': 580, 'w': 440, 'at': 1110}]},
    ],
    # "then be taken apart. | Most Parisians hated it": a grey rainy street of grumpy Parisians
    1263: [
        {'f0': 1263, 'f1': 1337, 'bg': {'card': True}, 'els': [
            {'t': 'tower', 'x': 960, 'y': 1000, 'h': 700, 'cut': [1284, 1294]},
            {'t': 'words', 'text': 'TAKEN APART', 'x': 960, 'y': 150, 'size': 100, 'color': 'orange', 'at': 1284}]},
        {'f0': 1337, 'f1': 1375, 'bg': plate('ink60/plates/paris_grey.png'), 'els': [
            {'t': 'sprite', 'src': 'ink60/cast/parisian_1.png', 'x': 620, 'y': 1010, 'h': 600, 'at': 1337},
            {'t': 'sprite', 'src': 'ink60/cast/parisian_3.png', 'x': 1300, 'y': 1010, 'h': 600, 'flip': True, 'at': 1344},
            {'t': 'stamp', 'text': 'HATED', 'x': 960, 'y': 300, 'rot': -8, 'color': 'red', 'at': 1362}]},
    ],
    # "gigantic black factory chimney. |" (chimney finishes drawing at 1508): cut to the real rusting iron
    1455: [
        {'f0': 1455, 'f1': 1508, 'bg': {'card': True}, 'els': [
            {'t': 'chimney', 'x': 960, 'y': 1000, 'h': 420, 'at': 1461, 'done': 1506},
            {'t': 'words', 'text': '"A GIGANTIC BLACK', 'x': 960, 'y': 150, 'size': 80, 'at': 1461},
            {'t': 'words', 'text': 'FACTORY CHIMNEY"', 'x': 960, 'y': 260, 'size': 80, 'color': 'orange', 'at': 1492}]},
        {'f0': 1508, 'f1': 1555, 'bg': plate('ink60full/plates/tower_rust_closeup.png'), 'els': [
            {'t': 'stamp', 'text': 'EYESORE', 'x': 1460, 'y': 300, 'rot': -10, 'color': 'red', 'at': 1512}]},
    ],
    # "it only survived because | the army found a use for it"
    1555: [
        {'f0': 1555, 'f1': 1599, 'bg': plate('ink60/plates/paris_tower_grey.png'), 'els': [
            {'t': 'words', 'text': 'IT SURVIVED', 'x': 600, 'y': 240, 'size': 110, 'at': 1566}]},
        {'f0': 1599, 'f1': 1645, 'bg': plate('ink60full/plates/tower_radio_station.png'), 'els': [
            {'t': 'sprite', 'src': 'ink60/cast/soldier_radio_operator.png', 'x': 560, 'y': 1000, 'h': 660, 'at': 1599},
            {'t': 'tag', 'text': 'THE ARMY', 'x': 1000, 'y': 360, 'at': 1601}]},
    ],
}


# v6 (Zen 2026-11-17 review of v5: 0:03-0:04, 0:29, 0:32, ~0:50 rush + 0:50, 0:53-0:54 worse; liked 0:36): keep only the
# splits whose new picture was made FOR its line; library plates picked to pad the cut count, and splits that halve a
# drawn-in build (chimney), go back to the v3 shot.
VERSIONS = {'v5': set(SPLITS), 'v6': {402, 666, 1001, 1263}}


def bg_key(s):
    return json.dumps(s['bg'].get('plate') or s['bg'].get('photo') or 'card')


def build(part):
    d = json.loads((SRC / f'{part}.json').read_text(encoding='utf-8'))
    out = copy.deepcopy(d)
    out['_doc'] = f'{VER} of {part} (generated by tools/ink/make_v5_shots.py from shots_v3; edit there).'
    shots = []
    for s in d['shots']:
        new = SPLITS.get(s['f0']) if s['f0'] in VERSIONS[VER] else None
        if not new:
            shots.append(copy.deepcopy(s))
            continue
        assert new[0]['f0'] == s['f0'] and new[-1]['f1'] == s['f1'], f'{part}: split at {s["f0"]} does not tile the old shot'
        shots += copy.deepcopy(new)
    for a, b in zip(shots, shots[1:]):
        assert a['f1'] == b['f0'], f'{part}: gap/overlap at {a["f1"]}->{b["f0"]}'
        assert 'cam' not in b, f'{part}: camera move at {b["f0"]} (v5 is hard cuts only)'
        # a split must be a new picture: same plate/photo back-to-back would not read as a cut
        if b['f0'] in {n['f0'] for k in VERSIONS[VER] for n in SPLITS[k]}:
            assert 'card' in a['bg'] and 'card' in b['bg'] or bg_key(a) != bg_key(b), f'{part}: same background across cut at {b["f0"]}'
    assert shots[0]['f0'] == d['f0'] and shots[-1]['f1'] == d['f1'], f'{part}: span changed'
    out['shots'] = shots
    DST.mkdir(parents=True, exist_ok=True)
    (DST / f'{part}.json').write_text(json.dumps(out, indent=1, ensure_ascii=False), encoding='utf-8')
    short = [(s['f0'], round((s['f1'] - s['f0']) / FPS, 2)) for s in shots if s['f1'] - s['f0'] < MIN_S * FPS]
    print(part, len(d['shots']), '->', len(shots), 'shots; under', MIN_S, 's:', short)
    return len(shots)


if __name__ == '__main__':
    n = sum(build(p) for p in ('p01', 'p02'))
    print('total shots', n, '-> cuts', n - 1)
