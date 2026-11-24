"""Allowed-file gate for the ep02 card-fix-1 build (planner-written, protected).

Fails if the working tree changed any file outside the brief's allowed list, tracked or untracked,
compared with HEAD. Both endpoints of a rename/copy are checked, so a protected file cannot be moved onto
an allowed path. The build runs in a clean pipeline worktree, so no untracked file is exempt (ignored
files such as __pycache__ never appear in git status). Run from the repo root:
    python -I tests/ink/ep02_cardfix1_diffgate.py
"""
import subprocess
import sys

ALLOWED = {'tools/ink/ep02_full_shots.py', 'engine/ink/parts/shots_ep02full/full.json'}
# -z: NUL-delimited, paths unquoted; a rename/copy entry (status R or C) is followed by its source path.
out = subprocess.run(['git', 'status', '--porcelain', '-z', '--untracked-files=all'], capture_output=True,
                     text=True, check=True).stdout
fields = out.split('\0')
paths = []
i = 0
while i < len(fields):
    entry = fields[i]
    i += 1
    if not entry:
        continue
    status, path = entry[:2], entry[3:]
    paths.append(path)
    if 'R' in status or 'C' in status:
        paths.append(fields[i])  # source endpoint
        i += 1
bad = sorted({p for p in paths if p not in ALLOWED})
if bad:
    print('FILES OUTSIDE THE ALLOWED LIST:', *bad, sep='\n  ')
    sys.exit(1)
print(f'OK: {len(set(paths) & ALLOWED)} allowed files changed; no other tracked, untracked, renamed or copied path')
