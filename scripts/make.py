"""make.py — one command per episode: voice -> captions -> sfx -> render -> loudness master -> post kit.

    python scripts/make.py ep01              # voice (cached) + render out/ep01.mp4
    python scripts/make.py ep02 --force      # re-voice every line
    python scripts/make.py ep01 --engine edge --voice th-TH-NiwatNeural   # override the episode's engine/voice
"""
import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "scripts"))

from pipeline import postkit, sfx  # noqa: E402
from pipeline.master import master  # noqa: E402
from pipeline.narrate import narrate  # noqa: E402
from pipeline.render import render  # noqa: E402
from pipeline.tts import get_engine  # noqa: E402


def main() -> None:
    ap = argparse.ArgumentParser(description="Build one episode from episodes/<id>.json")
    ap.add_argument("episode", help="episode id, e.g. ep01")
    ap.add_argument("--engine", help="TTS engine, overrides the episode's (edge | gemini)")
    ap.add_argument("--voice", help="override the episode's voice")
    ap.add_argument("--force", action="store_true", help="re-voice every line, ignore cache")
    ap.add_argument("--no-render", action="store_true", help="voice + captions only")
    args = ap.parse_args()

    src = ROOT / "episodes" / f"{args.episode}.json"
    episode = json.loads(src.read_text(encoding="utf-8"))
    if args.engine:
        episode["engine"] = args.engine
    if args.voice:
        episode["voice"] = args.voice
    engine = get_engine(episode.get("engine", "edge"))
    episode["take"] = engine.whole_take
    public = ROOT / "public"

    print(f"[1/4] voice ({engine.name}, {episode['voice']})")
    timing = narrate(episode, engine, public, force=args.force)
    print("[2/4] sound effects")
    sfx.ensure(public)
    if args.no_render:
        return
    # out/final/<ep>/ holds only what gets posted; intermediates live in the hidden .build/ at the repo root.
    final = ROOT / "out" / "final" / args.episode  # one folder per episode: video, cover, post kit, script
    final.mkdir(parents=True, exist_ok=True)
    out = final / "video.mp4"
    build = ROOT / ".build"
    build.mkdir(parents=True, exist_ok=True)
    raw = build / f"{args.episode}.raw.mp4"
    print(f"[3/4] render -> {raw.relative_to(ROOT)}")
    render(ROOT, episode, timing, raw)
    print(f"[4/4] loudness master -> {out.relative_to(ROOT)}")
    out = master(raw, out)
    kit = postkit.write(final, episode, postkit.remotion_still(ROOT, raw.with_suffix(".props.json")))
    print(f"done: {out}")
    print(f"post kit: {kit}")


if __name__ == "__main__":
    main()
