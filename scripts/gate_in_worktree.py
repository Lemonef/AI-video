"""Run reference_gate.py from a throwaway pipeline worktree.

A fresh worktree lacks the git-ignored inputs a render needs. node_modules is
linked (read-only use); the private study assets are COPIED because Remotion's
bundler symlinks public/ subfolders and Windows refuses that through a
junction. Baselines and gate output stay in the main checkout's study folder,
so every attempt is compared with the same cached controls.

  python scripts/gate_in_worktree.py --shots 8 9 --guard 20
"""
import os
from pathlib import Path
import shutil
import subprocess
import sys

HERE = Path(__file__).resolve().parents[1]
MAIN = Path(subprocess.run(['git', 'rev-parse', '--path-format=absolute', '--git-common-dir'], cwd=HERE,
                           capture_output=True, text=True, check=True).stdout.strip()).parent
STUDY = MAIN/'out/drafts/reference-study/DegJCmXtbGj'

if HERE != MAIN:
    if not (HERE/'node_modules').exists():
        subprocess.run(['cmd', '/c', 'mklink', '/J', str(HERE/'node_modules'), str(MAIN/'node_modules')],
                       check=True, capture_output=True)
    assets = HERE/'public/reference-study'
    if not assets.exists():
        shutil.copytree(MAIN/'public/reference-study', assets)

env = {**os.environ, 'PYTHONUTF8': '1', 'REMOTION_OFFLINE_FONTS': '1', 'REFERENCE_STUDY_DIR': str(STUDY)}
sys.exit(subprocess.run([sys.executable, str(HERE/'scripts/reference_gate.py'), *sys.argv[1:]], cwd=HERE, env=env).returncode)
