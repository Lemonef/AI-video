"""Every render is kept as a dated version; the video's final/ only ever holds the one to post.

    videos/<channel>/<video>/draft/versions/2026-10-28_1710.mp4   every cut, for comparing
    videos/<channel>/<video>/final/video.mp4                      the latest, nothing else
"""
import shutil
from datetime import datetime
from pathlib import Path

from . import layout

STAMP = "%Y-%m-%d_%H%M%S"


def new_version(root: Path, episode_id: str) -> Path:
    folder = layout.versions_dir(root, episode_id)
    folder.mkdir(parents=True, exist_ok=True)
    return folder / f"{datetime.now().strftime(STAMP)}.mp4"


def latest(root: Path, episode_id: str) -> Path:
    cuts = sorted(layout.versions_dir(root, episode_id).glob("*.mp4"))
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
            f"    python tools/make.py {final.parent.name} --publish\n"
            f"(the new cut is saved: {version})"
        )
