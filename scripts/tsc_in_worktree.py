"""Type-check from a throwaway pipeline worktree (links the main checkout's node_modules).

  python scripts/tsc_in_worktree.py
"""
from pathlib import Path
import subprocess
import sys

HERE = Path(__file__).resolve().parents[1]
MAIN = Path(subprocess.run(['git', 'rev-parse', '--path-format=absolute', '--git-common-dir'], cwd=HERE,
                           capture_output=True, text=True, check=True).stdout.strip()).parent
if HERE != MAIN and not (HERE/'node_modules').exists():
    subprocess.run(['cmd', '/c', 'mklink', '/J', str(HERE/'node_modules'), str(MAIN/'node_modules')], check=True, capture_output=True)
sys.exit(subprocess.run(['cmd', '/c', 'npx', 'tsc', '--noEmit'], cwd=HERE).returncode)
