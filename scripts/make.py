"""make.py — one command per episode: voice -> captions -> sfx -> render -> loudness master -> post kit.

    python scripts/make.py ep01              # voice (cached) + render out/ep01.mp4
    python scripts/make.py ep02 --force      # re-voice every line
    python scripts/make.py ep02 --publish    # copy the newest version into out/final/ep02/ (after closing the player)
    python scripts/make.py ep01 --engine edge --voice th-TH-NiwatNeural   # override the episode's engine/voice
"""
import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "scripts"))

from pipeline import freesound, postkit, retention, sfx, versions  # noqa: E402
from pipeline.master import master  # noqa: E402
from pipeline.narrate import measured_rate, narrate, needs_voicing  # noqa: E402
from pipeline.render import render  # noqa: E402
from pipeline.tts import get_engine  # noqa: E402


def ensure_sound(episode: dict, public: Path) -> None:
    mix = episode.get("mix", {})
    if mix.get("real"):
        freesound.ensure(public, mix.get("realSfx") or None)
    else:
        sfx.ensure(public)
    music = mix.get("music")
    if music:
        freesound.ensure_music(public, [music["name"]], music.get("volume_lufs"))


def story_folder(final_root: Path, slug: str) -> str:
    """Series folders are numbered by release order (03-lift-ex) while episodes carry the bare slug.

    Reuse the existing numbered folder; a new series gets the next number, so a slug never
    produces a second, unnumbered folder beside the real one.
    """
    if final_root.is_dir():
        for d in sorted(final_root.iterdir()):
            head, _, tail = d.name.partition("-")
            if d.is_dir() and (d.name == slug or (head.isdigit() and tail == slug)):
                return d.name
        numbers = [int(d.name.partition("-")[0]) for d in final_root.iterdir() if d.name.partition("-")[0].isdigit()]
    else:
        numbers = []
    return f"{max(numbers, default=0) + 1:02d}-{slug}"


def main() -> None:
    ap = argparse.ArgumentParser(description="Build one episode from episodes/<id>.json")
    ap.add_argument("episode", help="episode id, e.g. ep01")
    ap.add_argument("--engine", help="TTS engine, overrides the episode's (edge | gemini | elevenlabs)")
    ap.add_argument("--voice", help="override the episode's voice")
    ap.add_argument("--force", action="store_true", help="re-voice every line, ignore cache")
    ap.add_argument("--no-render", action="store_true", help="voice + captions only")
    ap.add_argument("--draft", action="store_true", help="build into out/drafts/<ep>/ without changing the published final")
    ap.add_argument("--publish", action="store_true", help="only copy the newest version into out/final/<ep>/")
    ap.add_argument("--allow-retention", action="store_true", help="render even if the retention lint fails (deliberate exceptions only)")
    args = ap.parse_args()
    if args.draft and args.publish:
        ap.error("--draft and --publish cannot be combined")

    src = ROOT / "episodes" / f"{args.episode}.json"
    episode = json.loads(src.read_text(encoding="utf-8"))
    if args.engine:
        episode["engine"] = args.engine
    if args.voice:
        episode["voice"] = args.voice
    engine = get_engine(episode.get("engine", "edge"))
    episode["take"] = engine.whole_take
    # jaab3d compositions are rendered with their isolated public directory.
    public = ROOT / ("public3d" if episode.get("style") == "jaab3d" else "public")
    story = episode.get("seriesSlug", "ghost" if args.episode in ("ep01", "ep02", "ep03") else args.episode)
    release_episode = episode.get("releaseEpisode", args.episode)
    if any(Path(part).name != part or part in (".", "..") for part in (story, release_episode)):
        raise ValueError("release story/episode must be simple folder names")
    final = ROOT / "out" / "final" / story_folder(ROOT / "out" / "final", story) / release_episode
    if args.publish:
        versions.publish(versions.latest(ROOT, args.episode), final / "video.mp4")
        print(f"done: {final / 'video.mp4'}")
        return

    if needs_voicing(episode, engine, public) and not args.allow_retention:
        rate = measured_rate(public)
        if rate:  # free-tier requests are scarce: lint the script on estimated timing before spending one
            print(f"    pre-voice retention estimate ({rate:.1f} letters/s measured)")
            if not retention.report(retention.check(episode, retention.estimate(episode, rate))):
                raise SystemExit("estimated timing fails the retention lint: shorten the script before spending a voice request")
    print(f"[1/4] voice ({engine.name}, {episode['voice']})")
    timing = narrate(episode, engine, public, force=args.force)
    print("    retention check (docs/growth-playbook.md)")
    if not retention.report(retention.check(episode, timing)) and not args.allow_retention and not args.no_render:
        raise SystemExit("retention lint failed: fix the episode (or pass --allow-retention on purpose)")
    print("[2/4] sound effects")
    ensure_sound(episode, public)
    if args.no_render:
        return
    # out/final/<ep>/ holds only what gets posted; intermediates live in the hidden .build/ at the repo root.
    destination = ROOT / "out" / "drafts" / args.episode if args.draft else final
    destination.mkdir(parents=True, exist_ok=True)
    out = destination / "video.mp4"
    build = ROOT / ".build"
    build.mkdir(parents=True, exist_ok=True)
    raw = build / f"{args.episode}.raw.mp4"
    print(f"[3/4] render -> {raw.relative_to(ROOT)}")
    render(ROOT, episode, timing, raw)
    version = versions.new_version(ROOT, args.episode)
    print(f"[4/4] loudness master -> {version.relative_to(ROOT)} -> {out.relative_to(ROOT)}")
    master(raw, version)
    kit = postkit.write(destination, episode, postkit.remotion_still(ROOT, raw.with_suffix(".props.json")))
    versions.publish(version, out)
    print(f"done: {out}")
    print(f"post kit: {kit}")


if __name__ == "__main__":
    main()
