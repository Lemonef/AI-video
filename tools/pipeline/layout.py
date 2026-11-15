"""Per-video folder layout (layout v2): the one place that knows where a video's files live.

    videos/<channel>/<NN-name>/script/<id>.json        episode data (was episodes/<id>.json)
    videos/<channel>/<NN-name>/script/docs/<id>/        beat sheets, reviews (was docs/episodes/<id>/)
    videos/<channel>/<NN-name>/assets/<id>/...          voice takes, timing.json, images (was public/<id>/)
    videos/<channel>/<NN-name>/final/                   only what gets posted (was out/final/<series>/<ep>/)
    videos/<channel>/<NN-name>/draft/                   --draft builds (was out/drafts/<id>/)
    videos/<channel>/<NN-name>/draft/versions/          every dated cut (was out/versions/<id>/)
    videos/<channel>/_shared/                           assets reused across the channel
    engine/shared/                                      fonts, sfx, reference-study (was public/fonts|sfx|...)

Remotion reads ONE public dir per render, so a render stages its own: every staging source
below is hardlinked at the ROOT of .build/<channel>-<NN-name>/public/. The old public/
layout is kept inside each source (assets/<id>/x.png stays staticFile('<id>/x.png')).

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
ASSETS = "assets"
FINAL = "final"
DRAFT = "draft"
VERSIONS = "versions"
CHANNEL_SHARED = "_shared"
ENGINE_SHARED = "engine/shared"
BUILD = ".build"
STAGED_PUBLIC = "public"
STAGE_SHARED = "shared"  # .build/shared/public: renders that belong to no video (the reference gate)
# The pre-v2 public dir. Still a staging source so a checkout whose ignored assets have not
# been moved yet keeps rendering; drop it once the ignored public/ is migrated (plan phase 8).
LEGACY_PUBLIC = "public"

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


def assets_dir(root: Path, episode_id: str) -> Path:
    """The video's own public-dir content; narrate writes <id>/timing.json and takes here."""
    return video_root(root, episode_id) / ASSETS


def final_dir(root: Path, episode_id: str) -> Path:
    return video_root(root, episode_id) / FINAL


def draft_dir(root: Path, episode_id: str) -> Path:
    return video_root(root, episode_id) / DRAFT


def versions_dir(root: Path, episode_id: str) -> Path:
    return draft_dir(root, episode_id) / VERSIONS


def channel_shared(root: Path, episode_id: str) -> Path | None:
    """videos/<channel>/_shared/, or None for an unsorted id (it has no channel yet)."""
    channel = CHANNEL_DIRS.get(episode_id, "").split("/")[0]
    return root / VIDEOS / channel / CHANNEL_SHARED if channel else None


def stage_dir(root: Path, episode_id: str | None) -> Path:
    """.build/<channel>-<NN-name>/public/ for a video, .build/shared/public/ for no video."""
    name = video_dir(episode_id).removeprefix(f"{VIDEOS}/").replace("/", "-") if episode_id else STAGE_SHARED
    return root / BUILD / name / STAGED_PUBLIC


def stage_sources(root: Path, episode_id: str | None) -> list[Path]:
    """Existing trees staged at the public ROOT for a render, most shared first."""
    trees = [root / ENGINE_SHARED]
    if episode_id:
        trees += [channel_shared(root, episode_id), assets_dir(root, episode_id)]
    trees.append(root / LEGACY_PUBLIC)
    return [t for t in trees if t is not None and t.is_dir()]


def asset_roots(root: Path) -> list[Path]:
    """Every video's assets dir (plus the legacy public dir), e.g. to measure voiced takes."""
    return sorted((root / VIDEOS).glob(f"*/*/{ASSETS}")) + [p for p in [root / LEGACY_PUBLIC] if p.is_dir()]
