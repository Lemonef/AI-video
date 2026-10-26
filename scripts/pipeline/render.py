"""Render an episode (with timing) to MP4 through the Remotion CLI."""
import json
import shutil
import subprocess
from pathlib import Path

COMPOSITION = "Episode"
ENTRY = "src/index.ts"


def render(root: Path, episode: dict, timing: dict, out_mp4: Path) -> None:
    props_path = out_mp4.with_suffix(".props.json")
    props_path.write_text(json.dumps({"episode": {**episode, "timing": timing}}, ensure_ascii=False), encoding="utf-8")
    npx = shutil.which("npx") or "npx"
    subprocess.run(
        [npx, "remotion", "render", ENTRY, COMPOSITION, str(out_mp4), f"--props={props_path}"],
        cwd=root, check=True,
    )
