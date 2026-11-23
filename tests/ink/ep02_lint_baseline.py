"""ep02 full-cut lint baseline gate (planner-written, protected).

ep02_full_shots.py exits nonzero while the scene rewire is pending, so `--draft` alone cannot gate a build.
This runs the generator's build() and fails on any lint error that is not in the 2026-11-24 snapshot:
  - "reuse: scene <plate> in minutes [...]"  only for the 11 plates below (minute lists may change: a converted
    sprite+words card puts its plate in one more minute). A NEW plate or photo in a reuse error fails.
  - "reuse: photo <photo> used Nx"           only the 2 photos below, N not above the snapshot.
  - "minN: K split/transform cards outside"  only min7 and min9.
`bg.under` is not a background for reuse (reuse_errors reads bg.plate / bg.photo only); keep it that way.
Every other error (two cards in a row, same background as previous shot, text-only, banned icon, layout repeat,
words under the meter, element outside its shot, ...) is a regression and fails the gate.
Fixing a snapshot error is fine; the gate only blocks new ones.

Run: python -I tests/ink/ep02_lint_baseline.py
"""
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / 'tools/ink'))
import ep02_full_shots as full  # noqa: E402

SCENES = {f'ink/scenes/{n}.png' for n in (
    's01_deck_party', 's02_inlet_lookout', 's03_deck_haul', 's04_hold_cower', 's05_rail_thinking', 's06_bb_calm',
    's07_guests_toast', 's08_rail_whisper', 's09_hold_carry', 's10_bb_hips', 's11_inlet_spyglass')}
PHOTOS = {'ink/photos/bb_engraving_1724.jpg': 4, 'ink/photos/moseley_map_1733.jpg': 3}
SPLIT_MINUTES = {7, 9}


def known(e):
    if m := re.match(r'^reuse: scene (\S+) in minutes ', e):
        return m[1] in SCENES
    if m := re.match(r'^reuse: photo (\S+) used (\d+)x$', e):
        return int(m[2]) <= PHOTOS.get(m[1], 0)
    if m := re.match(r'^min(\d+): \d+ split/transform cards outside ', e):
        return int(m[1]) in SPLIT_MINUTES
    return False


_, errors, _, _ = full.build()
bad = [e for e in errors if not known(e)]
if bad:
    print('NEW LINT ERRORS:', *bad, sep='\n  ')
    sys.exit(1)
print(f'OK: {len(errors)} known pending errors, no new ones')
