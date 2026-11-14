"""Per-video folder layout (layout v2): the one place that knows where a video's files live.

    videos/<channel>/<NN-name>/script/<id>.json        episode data (was episodes/<id>.json)
    videos/<channel>/<NN-name>/script/docs/<id>/        beat sheets, reviews (was docs/episodes/<id>/)

An id with a channel is listed in CHANNEL_DIRS; every other id waits in videos/unsorted/<id>/
until it is given a channel. Readers call these helpers instead of joining paths themselves,
so naming a channel later is a one-line change here (plus the files' move).
"""
from __future__ import annotations

from pathlib import Path

VIDEOS = "videos"
UNSORTED = "unsorted"
SCRIPT = "script"
SCRIPT_DOCS = "docs"

# Episode id -> "<channel>/<NN-name>". Ids not listed fall to videos/unsorted/<id>/.
CHANNEL_DIRS = {"ink": "pastly-life/01-eiffel-ink"}
# Ids known to have no channel yet (the restructure manifest matches files against these).
UNSORTED_IDS = (
    "ghost", "bangkok-flood", "lift01", "lift02", "lift03", "queue01", "mood01", "sukuna01",
    "takrut01", "ep01", "ep02", "ep03", "flood01", "flood02", "flood03", "wishes01",
)


def video_dir(episode_id: str) -> str:
    """Repo-relative POSIX folder of one video."""
    return f"{VIDEOS}/" + CHANNEL_DIRS.get(episode_id, f"{UNSORTED}/{episode_id}")


def video_root(root: Path, episode_id: str) -> Path:
    return root / video_dir(episode_id)


def script_json(root: Path, episode_id: str) -> Path:
    """The episode's data file, the input of tools/make.py."""
    return video_root(root, episode_id) / SCRIPT / f"{episode_id}.json"


def script_docs(root: Path, episode_id: str) -> Path:
    """The episode's planning/review docs (the inner <id>/ folder is kept from docs/episodes/<id>/)."""
    return video_root(root, episode_id) / SCRIPT / SCRIPT_DOCS / episode_id
