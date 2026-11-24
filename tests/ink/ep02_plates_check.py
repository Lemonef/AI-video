"""Gate for the ep02 plate rewire: minutes 2-11 show the fresh per-minute scene plates.

The beat -> plate map is read from the scene specs themselves (scenes_min*.py 'minute' strings), so the
specs stay the single source. Checks, on the generated engine/ink/parts/shots_ep02full/full.json:
 1. every fresh plate that exists on disk is used as a shot background at least once;
 2. every mapped beat that has a plate shot uses its own plate in at least one of them
    (card-only beats are exempt: their plate goes to a neighbouring plate shot of the same minute);
 3. from b10 on, no plate shot uses an old s* plate, except the named S01 callback at b83;
 4. CALLBACKS names only that callback and fresh plates whose own mapped beats span two minute windows.
Run after: python tools/ink/ep02_full_shots.py --draft
"""
import importlib.util
import json
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / 'tools/ink'))
import ep02_full_shots as G  # noqa: E402

EP = ROOT / 'videos/pastly-life/02-blackbeard-ink'
BRIEFS = EP / 'script/briefs'
SCENE_DIR = EP / 'assets/ink/scenes'
FULL = ROOT / 'engine/ink/parts/shots_ep02full/full.json'
TIMELINE = EP / 'assets/full-hybrid/timeline.json'
FIRST_REDO_BEAT = 10                  # minute 1 (b1-b9) keeps the old s* plates
CALLBACK = ('b83', 's01_deck_party')  # script beat 18: back on the party deck, named callback
fails = []


def check(ok, msg):
    if not ok:
        fails.append(msg)


def beat_num(bid):
    return int(bid[1:])


def spec_map():
    """{plate stem: [beat ids]} from every scenes_minN.py 'minute' string ('b21-b23' expands)."""
    out = {}
    for f in sorted(BRIEFS.glob('scenes_min*.py')):
        if not re.fullmatch(r'scenes_min\d+\.py', f.name):
            continue
        spec = importlib.util.spec_from_file_location(f.stem, f)
        mod = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(mod)
        for s in mod.SCENES:
            beats = []
            for a, b in re.findall(r'b(\d+)(?:-b(\d+))?', s['minute']):
                beats += [f'b{n}' for n in range(int(a), int(b or a) + 1)]
            out[s['id']] = beats
    return out


plates = spec_map()
present = {p for p in plates if (SCENE_DIR / f'{p}.png').exists()}
check(len(present) * 2 > len(plates), f'only {len(present)} of {len(plates)} fresh plates on disk')
check(FULL.exists(), f'{FULL} missing (run the generator with --draft first)')
shots = json.loads(FULL.read_text(encoding='utf-8'))['shots'] if FULL.exists() else []
tl = json.loads(TIMELINE.read_text(encoding='utf-8'))

# frame -> beat id, from the timeline
bounds = [(b['start'], b['start'] + b['dur'], b['id']) for b in tl['beats']]


def beat_at(f0):
    for a, z, bid in bounds:
        if a <= f0 < z:
            return bid
    return None


def stem(plate):
    return pathlib.PurePosixPath(plate).stem


used = {}  # beat -> set of plate stems used as shot backgrounds
for s in shots:
    p = s['bg'].get('plate')
    if p:
        used.setdefault(beat_at(s['f0']), set()).add(stem(p))
all_used = set().union(*used.values()) if used else set()

# 1. every fresh plate on disk is on screen
for p in sorted(present):
    check(p in all_used, f'1: plate {p} is never used as a shot background')

# 2. mapped beats with a plate shot use their own plate
for p, beats in sorted(plates.items()):
    if p not in present:
        continue
    for bid in beats:
        if bid in used:
            check(p in used[bid], f'2: {bid} has plate shots {sorted(used[bid])} but not its own plate {p}')

# 3. no old s* plates from b10 on, except the callback
for bid, stems in sorted(used.items(), key=lambda kv: beat_num(kv[0] or 'b0')):
    if bid is None or beat_num(bid) < FIRST_REDO_BEAT:
        continue
    for st in stems:
        if st.startswith('s') and (bid, st) != CALLBACK:
            check(False, f'3: {bid} still shows old plate {st}')

# 4. CALLBACKS stays honest
win = {b['id']: {s['start'] // G.MINUTE for s in b['shots']} for b in tl['beats']}
allowed = {CALLBACK[1]} | {p for p, beats in plates.items()
                           if len(set().union(*(win[b] for b in beats))) > 1}
for p in G.CALLBACKS:
    check(stem(p) in allowed, f'4: CALLBACKS names {p}; only {sorted(allowed)} may be callbacks')

if fails:
    print('\n'.join(fails))
    print(f'FAIL ({len(fails)})')
    sys.exit(1)
print(f'OK: {len(present)} fresh plates wired, beats b{FIRST_REDO_BEAT}+ clear of old plates')
