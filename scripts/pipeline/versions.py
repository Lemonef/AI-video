"""Every render is kept as a dated version; out/final/<ep>/ only ever holds the one to post.

    out/versions/<ep>/2026-10-28_1710.mp4   every cut, for comparing
    out/final/<ep>/video.mp4                the latest, nothing else
"""
import shutil
from datetime import datetime
from pathlib import Path

STAMP = "%Y-%m-%d_%H%M%S"


def new_version(root: Path, episode_id: str) -> Path:
    folder = root / "out" / "versions" / episode_id
    folder.mkdir(parents=True, exist_ok=True)
    return folder / f"{datetime.now().strftime(STAMP)}.mp4"


def latest(root: Path, episode_id: str) -> Path:
    cuts = sorted((root / "out" / "versions" / episode_id).glob("*.mp4"))
    if not cuts:
        raise SystemExit(f"no versions of {episode_id} yet: run make.py {episode_id} first")
    return cuts[-1]


def publish(version: Path, final: Path) -> None:
    """Copy a version into final/. A player holding the old file (Windows locks it) stops the
    run instead of leaving a second video beside it."""
    try:
        shutil.copyfile(version, final)
    except PermissionError:
        raise SystemExit(
            f"{final} is open in another program. Close it, then run:\n"
            f"    python scripts/make.py {final.parent.name} --publish\n"
            f"(the new cut is saved: {version})"
        )
