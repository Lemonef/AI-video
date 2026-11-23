"""ep02 full-cut lint baseline gate (planner-written, protected).

ep02_full_shots.py exits nonzero while the scene rewire is pending, so `--draft` alone cannot gate a build.
This runs the generator's build() and fails on any lint error that is NOT one of the known pending classes:
  - "reuse: ..."                                   (fixed by the m-scene rewire)
  - "minN: K split/transform cards outside (...)"  (same rewire re-balances card types per minute)
Every other error (two cards in a row, same background as previous shot, text-only, banned icon, layout repeat,
words under the meter, element outside its shot, ...) is a regression and fails the gate.

Run: python -I tests/ink/ep02_lint_baseline.py
"""
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / 'tools/ink'))
import ep02_full_shots as full  # noqa: E402

ALLOWED = [re.compile(r'^reuse: '), re.compile(r'^min\d+: \d+ split/transform cards outside ')]

_, errors, _, _ = full.build()
bad = [e for e in errors if not any(p.match(e) for p in ALLOWED)]
if bad:
    print('NEW LINT ERRORS:', *bad, sep='\n  ')
    sys.exit(1)
print(f'OK: {len(errors)} known pending errors, no new ones')
