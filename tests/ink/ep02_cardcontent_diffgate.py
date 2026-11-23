"""Allowed-file gate for the ep02 card-content build (planner-written, protected).

Fails if the working tree changed any file outside the brief's allowed list, tracked or untracked,
compared with HEAD. Run from the repo root: python -I tests/ink/ep02_cardcontent_diffgate.py
"""
import subprocess
import sys

ALLOWED = {
    'engine/ink/compositions/InkParts.tsx', 'engine/ink/parts/schema.ts', 'tools/ink/ep02_full_shots.py',
    'engine/ink/parts/shots_ep02full/full.json',
}
out = subprocess.run(['git', 'status', '--porcelain', '--untracked-files=all'], capture_output=True, text=True,
                     check=True).stdout
changed = {line[3:].strip().strip('"').split(' -> ')[-1] for line in out.splitlines() if line.strip()}
# Pre-existing untracked owner files are not the builder's; only flag paths the build could have produced.
bad = sorted(p for p in changed if p not in ALLOWED and p.startswith(('engine/', 'tools/', 'tests/', 'src/')))
if bad:
    print('FILES OUTSIDE THE ALLOWED LIST:', *bad, sep='\n  ')
    sys.exit(1)
print(f'OK: {len(changed & ALLOWED)} allowed files changed, nothing else under engine/ tools/ tests/ src/')
