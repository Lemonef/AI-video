"""Allowed-file gate for the ep02 card-fix-1 build (planner-written, protected).

Fails if the working tree changed any file outside the brief's allowed list, tracked or untracked,
compared with HEAD. Run from the repo root: python -I tests/ink/ep02_cardfix1_diffgate.py
"""
import subprocess
import sys

ALLOWED = {'tools/ink/ep02_full_shots.py', 'engine/ink/parts/shots_ep02full/full.json'}
out = subprocess.run(['git', 'status', '--porcelain', '--untracked-files=all'], capture_output=True, text=True,
                     check=True).stdout
rows = [(line[:2], line[3:].strip().strip('"').split(' -> ')[-1]) for line in out.splitlines() if line.strip()]
changed = {p for _, p in rows}
# Any tracked change outside ALLOWED fails. Untracked files fail under the code/asset trees and at the repo root;
# pre-existing untracked owner drafts elsewhere are not the builder's (the pipeline worktree has none anyway).
BUILD_TREES = ('engine/', 'tools/', 'tests/', 'src/', 'docs/', 'videos/', 'public/')
bad = sorted(p for st, p in rows if p not in ALLOWED and (st != '??' or p.startswith(BUILD_TREES) or '/' not in p))
if bad:
    print('FILES OUTSIDE THE ALLOWED LIST:', *bad, sep='\n  ')
    sys.exit(1)
print(f'OK: {len(changed & ALLOWED)} allowed files changed, nothing else under engine/ tools/ tests/ src/')
