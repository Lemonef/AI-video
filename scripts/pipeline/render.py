"""Render an episode (with timing) to MP4 through the Remotion CLI."""
import json
import shutil
import subprocess
from pathlib import Path

COMPOSITION = "Episode"
ENTRY = "src/index.ts"
# Upload master: TikTok recommends 1080p/1440p/4K and re-encodes everything, so give it the cleanest
# source we can. The art is vector, so 4/3 scale renders a native 1440x2560 (not an upscale).
UPLOAD_SCALE = 4 / 3
UPLOAD_CRF = 14  # x264 quality (lower = better); ~2-3x the default bitrate for flat-colour animation
# Standard limited-range BT.709. JPEG frames otherwise yield full-range yuvj420p, which some
# players and re-encoders misread (washed-out or crushed colour).
UPLOAD_COLOUR = ["--pixel-format=yuv420p", "--color-space=bt709"]
# Remotion defaults to half the cores; frames are independent, so a higher share renders faster with
# byte-identical output. Leave headroom for the browser and ffmpeg encoder.
RENDER_CONCURRENCY = "75%"


def render_target(episode: dict) -> tuple[str, str, str | None]:
    """Keep legacy episodes byte-for-byte on the legacy root; 3D shorts opt in by style."""
    if episode.get("style") == "jaab3d":
        return ("src/jaab3d/index.tsx", episode.get("compositionId", episode["id"].title()), "public3d")
    return (ENTRY, COMPOSITION, None)


def render_command(episode: dict, props_path: Path, out_mp4: Path, npx: str) -> list[str]:
    entry, composition, public_dir = render_target(episode)
    public_arg = [f"--public-dir={public_dir}"] if public_dir else []
    return [npx, "remotion", "render", entry, composition, str(out_mp4), f"--props={props_path}", *public_arg, f"--scale={UPLOAD_SCALE}", f"--crf={UPLOAD_CRF}", *UPLOAD_COLOUR, f"--concurrency={RENDER_CONCURRENCY}"]


def render(root: Path, episode: dict, timing: dict, out_mp4: Path) -> None:
    props_path = out_mp4.with_suffix(".props.json")
    props_path.write_text(json.dumps({"episode": {**episode, "timing": timing}}, ensure_ascii=False), encoding="utf-8")
    npx = shutil.which("npx") or "npx"
    subprocess.run(
        render_command(episode, props_path, out_mp4, npx),
        cwd=root, check=True,
    )
