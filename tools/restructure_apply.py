"""Apply the layout-v2 manifest to files git does not move: untracked + gitignored (public/, out/, ...).

Tracked files move through the git merge of chore/restructure-v2; this handles the rest.
Same-volume os.replace (a rename, no copy). Refuses on a destination that already exists with
different content; identical content = source removed. Prints a before/after count+bytes
reconciliation and exits non-zero on any mismatch.

    python -I tools/restructure_apply.py --manifest .build/m.json [--root D:/AI-video] [--apply]

Default is a dry run. Written by the main session (not the pipeline): one-off mover, reviewed by a
cross-agent pass before --apply.
"""
from __future__ import annotations

import argparse
import filecmp
import json
import os
import sys
from pathlib import Path


def plan(manifest: dict, root: Path) -> tuple[list[tuple[Path, Path, int]], list[str]]:
    moves, problems = [], []
    for r in manifest["rows"]:
        if r["state"] == "tracked" or r["dst"] is None or r["dst"] == r["src"]:
            continue
        src, dst = root / r["src"], root / r["dst"]
        if not src.is_file():
            if not dst.is_file():
                problems.append(f"MISSING {r['src']}")
            continue  # already moved (idempotent re-run)
        if dst.exists() and not filecmp.cmp(src, dst, shallow=False):
            problems.append(f"COLLISION {r['dst']} differs from {r['src']}")
            continue
        moves.append((src, dst, r["bytes"]))
    return moves, problems


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--manifest", required=True)
    ap.add_argument("--root", default=".")
    ap.add_argument("--apply", action="store_true")
    a = ap.parse_args()
    root = Path(a.root).resolve()
    manifest = json.loads(Path(a.manifest).read_text(encoding="utf-8"))
    moves, problems = plan(manifest, root)
    total = sum(b for _, _, b in moves)
    print(f"{len(moves)} moves, {total / 1e6:.0f} MB, {len(problems)} problems")
    for p in problems[:20]:
        print(" ", p)
    if problems or not a.apply:
        return 1 if problems else 0
    done = done_bytes = 0
    for src, dst, size in moves:
        dst.parent.mkdir(parents=True, exist_ok=True)
        if dst.exists():  # identical content (checked in plan)
            src.unlink()
        else:
            os.replace(src, dst)
        if dst.stat().st_size != size:
            print(f"SIZE MISMATCH {dst}")
            return 2
        done += 1
        done_bytes += size
    print(f"moved {done} files, {done_bytes / 1e6:.0f} MB; expected {len(moves)} / {total / 1e6:.0f} MB")
    return 0 if (done, done_bytes) == (len(moves), total) else 2


if __name__ == "__main__":
    sys.exit(main())
