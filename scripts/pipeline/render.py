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


def render(root: Path, episode: dict, timing: dict, out_mp4: Path) -> None:
    props_path = out_mp4.with_suffix(".props.json")
    props_path.write_text(json.dumps({"episode": {**episode, "timing": timing}}, ensure_ascii=False), encoding="utf-8")
    npx = shutil.which("npx") or "npx"
    subprocess.run(
        [npx, "remotion", "render", ENTRY, COMPOSITION, str(out_mp4), f"--props={props_path}", f"--scale={UPLOAD_SCALE}", f"--crf={UPLOAD_CRF}"],
        cwd=root, check=True,
    )
