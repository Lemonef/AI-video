"""Gate for the ep02 plate rewire: minutes 2-11 show the fresh per-minute scene plates.

The beat -> plate map is read from the scene specs themselves (scenes_min*.py 'minute' strings), so the
specs stay the single source. Checks, on the generated engine/ink/parts/shots_ep02full/full.json:
 0. every specified plate is on disk, except the named MISSING_OK plates still being drawn;
 1. every fresh plate on disk is used as a shot background inside its own minute window(s);
 2. every mapped beat outside the pinned CARD_ONLY set uses its own plate in at least one plate shot
    (card-only beats are exempt: their plate goes to a neighbouring plate shot of the same minute);
    2b. every plate a shot references exists on disk;
 3. from b10 on, no plate shot uses an old s* plate, except the named S01 callback at b83,
    which is required (b83 shows s01_deck_party; CALLBACKS names it with a reason naming b83);
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
MISSING_OK = {'m9d_hands_in_town'}    # still being drawn; drop from this set once its plate is accepted
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
for p in sorted(set(plates) - present - MISSING_OK):
    check(False, f'0: specified plate {p} is not on disk')
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


used = {}      # beat -> set of plate stems used as shot backgrounds
used_win = {}  # plate stem -> set of minute windows it is on screen in
for s in shots:
    p = s['bg'].get('plate')
    if p:
        used.setdefault(beat_at(s['f0']), set()).add(stem(p))
        used_win.setdefault(stem(p), set()).add(s['f0'] // G.MINUTE)

# minute windows each beat's own shots fall in (timeline shot starts)
win = {b['id']: {s['start'] // G.MINUTE for s in b['shots']} for b in tl['beats']}

# 1. every fresh plate on disk is on screen inside a window its own beats live in
for p in sorted(present):
    own = set().union(*(win[b] for b in plates[p]))
    check(used_win.get(p, set()) & own,
          f'1: plate {p} is not on screen in its own window(s) {sorted(own)} (seen in {sorted(used_win.get(p, set()))})')

# 2. every plate-bearing mapped beat uses its own plate. Card-only beats are pinned here, not inferred from
#    the build (a build that drops a beat's plate shots must not turn it card-only); a card-only beat may gain
#    a plate shot (brief step 7, b19). Source: the beats with
#    no plate background in the pre-rewire full.json (commit 6ecc0d4); the rewire swaps plates, not shot kinds.
CARD_ONLY = {'b8', 'b15', 'b19', 'b25', 'b37', 'b49', 'b57', 'b75', 'b78'}
for p, beats in sorted(plates.items()):
    if p not in present:
        continue
    for bid in beats:
        if bid not in CARD_ONLY:
            check(p in used.get(bid, set()), f'2: {bid} must show its own plate {p} (has {sorted(used.get(bid, set()))})')

# 2b. every plate a shot references exists on disk
for st in sorted(used_win):
    check(any((EP / 'assets' / d / f'{st}.png').exists() for d in ('ink/scenes', 'ink')),
          f'2b: shots reference plate {st}, not found under assets')

# 3. no old s* plates from b10 on, except the callback
for bid, stems in sorted(used.items(), key=lambda kv: beat_num(kv[0] or 'b0')):
    if bid is None or beat_num(bid) < FIRST_REDO_BEAT:
        continue
    for st in stems:
        if st.startswith('s') and (bid, st) != CALLBACK:
            check(False, f'3: {bid} still shows old plate {st}')
check(CALLBACK[1] in used.get(CALLBACK[0], set()), f'3: {CALLBACK[0]} must show the callback plate {CALLBACK[1]}')
check(f'ink/scenes/{CALLBACK[1]}.png' in G.CALLBACKS, f'3: CALLBACKS must name ink/scenes/{CALLBACK[1]}.png')
reason = G.CALLBACKS.get(f'ink/scenes/{CALLBACK[1]}.png', '') if isinstance(G.CALLBACKS, dict) else ''
check(isinstance(reason, str) and CALLBACK[0] in reason and len(reason.split()) >= 4,
      f'3: CALLBACKS reason for {CALLBACK[1]} must name {CALLBACK[0]} and say why (got {reason!r})')

# 4. CALLBACKS stays honest
allowed = {CALLBACK[1]} | {p for p, beats in plates.items()
                           if len(set().union(*(win[b] for b in beats))) > 1}
for p in G.CALLBACKS:
    check(stem(p) in allowed, f'4: CALLBACKS names {p}; only {sorted(allowed)} may be callbacks')

if fails:
    print('\n'.join(fails))
    print(f'FAIL ({len(fails)})')
    sys.exit(1)
print(f'OK: {len(present)} fresh plates wired, beats b{FIRST_REDO_BEAT}+ clear of old plates')
