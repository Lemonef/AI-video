"""Dry-run manifest for the layout-v2 move (plan: brain docs/specs/2026-11-15-ai-video-restructure-plan.md).

Lists every file (tracked, untracked and gitignored) with its proposed destination.
Read-only: this phase has no --apply; moves are done by later, reviewed phases.

    python -I tools/restructure_map.py [--root D:/AI-video] [--out .build/restructure-manifest.json]
"""
from __future__ import annotations

import argparse
import json
import re
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from pipeline.layout import UNSORTED_IDS, video_dir  # noqa: E402  single source of the per-video path rule

EP_RE = re.compile("(" + "|".join(sorted(UNSORTED_IDS, key=len, reverse=True)) + ")")

# First matching prefix wins; (source prefix, destination prefix). Order matters.
PREFIX_RULES = (
    ("episodes/archive/", "_archive/episodes/"),
    ("public/reference-study/", "engine/shared/reference-study/"),
    ("public3d/sfx/", "engine/shared/sfx3d/"),
    ("scripts/", "tools/"),
    ("src/v2/", "engine/legacy/v2/"),
    ("src/v5/", "engine/legacy/v5/"),
    ("src/v7/", "engine/legacy/v7/"),
    ("src/", "engine/"),
    ("public/fonts/", "engine/shared/fonts/"),
    ("public/sfx/", "engine/shared/sfx/"),
    ("docs/", "docs/"),
    ("tests/", "tests/"),
)
# Per-episode trees: source dir -> subfolder inside the video folder.
EPISODE_TREES = (
    ("public/", "assets/"),
    ("public3d/", "assets/3d/"),
    ("episodes/", "script/"),
    ("docs/episodes/", "script/docs/"),
    ("out/", "draft/out/"),
)
ROOT_KEEP = {"package.json", "package-lock.json", "remotion.config.ts", "tsconfig.json",
             "README.md", "ARCHITECTURE.md", "CLAUDE.md", ".gitignore", ".mcp.json"}
SKIP_TOPS = {".git", ".pipeline-worktrees", "node_modules", ".build", ".claude", ".venv", ".pytest_cache",
             ".agentsroom", ".agents"}  # tool/cache dirs: stay where they are


def destination(rel: str) -> tuple[str | None, str]:
    """Return (dest or None, reason). None = needs a human decision."""
    if "/" not in rel and rel in ROOT_KEEP:
        return rel, "root-keep"
    for src, dst in PREFIX_RULES[:3]:
        if rel.startswith(src):
            return dst + rel[len(src):], "prefix"
    for src, sub in EPISODE_TREES:
        if rel.startswith(src) and not rel.startswith(("public/fonts/", "public/sfx/")):
            if src == "docs/" and not rel.startswith("docs/episodes/"):
                continue
            m = EP_RE.search(rel[len(src):])
            if m:
                return f"{video_dir(m.group(1))}/{sub}{rel[len(src):]}", "episode"
            if src == "out/":
                return f"_archive/out-unmapped/{rel[len(src):]}", "out-no-episode"
            if src in ("public/", "public3d/"):
                return None, "asset-no-episode"
    for src, dst in PREFIX_RULES:
        if rel.startswith(src):
            return dst + rel[len(src):], "prefix"
    return None, "unmapped"


def list_files(root: Path) -> list[dict]:
    """Tracked + untracked + ignored, with a tracked flag."""
    def git(*a: str) -> list[str]:
        out = subprocess.run(["git", "-C", str(root), *a, "-z"], capture_output=True, check=True).stdout
        return [p for p in out.decode("utf-8", "surrogateescape").split("\0") if p]
    tracked = set(git("ls-files"))
    allfiles = tracked | set(git("ls-files", "-o"))  # untracked, not ignored
    ignored = set(git("ls-files", "-o", "-i", "--exclude-standard"))
    rows = []
    for rel in sorted(allfiles | ignored):
        if rel.split("/")[0] in SKIP_TOPS:
            continue
        p = root / rel
        if not p.is_file():
            continue
        rows.append({"src": rel, "bytes": p.stat().st_size,
                     "state": "tracked" if rel in tracked else ("ignored" if rel in ignored else "untracked")})
    return rows


def build(root: Path) -> dict:
    rows = list_files(root)
    for r in rows:
        r["dst"], r["why"] = destination(r["src"])
    dsts = [r["dst"] for r in rows if r["dst"]]
    dup = sorted({d for d in dsts if dsts.count(d) > 1})
    return {
        "root": str(root),
        "files": len(rows),
        "bytes": sum(r["bytes"] for r in rows),
        "needs_decision": [r["src"] for r in rows if r["dst"] is None],
        "dst_collisions": dup,
        "rows": rows,
    }


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--root", default=".")
    ap.add_argument("--out", default=".build/restructure-manifest.json")
    a = ap.parse_args()
    m = build(Path(a.root).resolve())
    Path(a.out).parent.mkdir(parents=True, exist_ok=True)
    Path(a.out).write_text(json.dumps(m, indent=1), encoding="utf-8")
    print(f"{m['files']} files, {m['bytes']/1e6:.0f} MB, "
          f"{len(m['needs_decision'])} need a decision, {len(m['dst_collisions'])} collisions -> {a.out}")


if __name__ == "__main__":
    main()
