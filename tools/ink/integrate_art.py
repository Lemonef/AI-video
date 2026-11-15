"""Install accepted art into the places ep_directed.tsx reads: python -I tools/integrate_art.py
- every public/ink60full/sheets/sheet_<x>.png with a sibling .order.json is cut (cut_sprites.py) into
  public/ink60/cast/<pose_id>.png (CAST_DIR in ep_directed.tsx)
- art_aliases.json: ids the directors used for a plate/pose that is drawn under another name get a copy
Idempotent; skips sheets/plates that do not exist yet. Prints one line per file installed.
"""
import json
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
VID = ROOT / "videos/pastly-life/01-eiffel-ink"
PUB = VID / "assets/ink60full"
CAST = VID / "assets/ink60/cast"


def main() -> int:
    CAST.mkdir(parents=True, exist_ok=True)
    for sheet in sorted((PUB / "sheets").glob("sheet_*.png")):
        order = json.loads(sheet.with_suffix(".order.json").read_text(encoding="utf-8"))
        tmp = ROOT / "out" / "integrate_cut" / sheet.stem
        shutil.rmtree(tmp, ignore_errors=True)
        tmp.mkdir(parents=True)
        run = subprocess.run([sys.executable, "-I", str(ROOT / "tools/ink/cut_sprites.py"), str(sheet), str(tmp), "g", str(len(order))],
                             capture_output=True, text=True)
        cuts = sorted(tmp.glob("g*.png"), key=lambda p: int(p.stem[1:]))
        if run.returncode != 0 or len(cuts) != len(order) or "WARN" in run.stdout:
            print(f"FAIL {sheet.name}: {len(cuts)}/{len(order)} {run.stdout[-120:]}{run.stderr[-120:]}")
            return 1
        for pose, cut in zip(order, cuts):
            shutil.copy(cut, CAST / f"{pose}.png")
            print(f"cast {pose}")
    aliases = json.loads((PUB / "art_aliases.json").read_text(encoding="utf-8"))
    for plate, real in aliases["plates"].items():
        src = PUB / "plates" / f"{real}.png"
        if src.exists():
            shutil.copy(src, PUB / "plates" / f"{plate}.png")
            print(f"plate alias {plate} <- {real}")
    for pose, real in aliases["poses"].items():
        src = CAST / f"{real}.png"
        if src.exists():
            shutil.copy(src, CAST / f"{pose}.png")
            print(f"pose alias {pose} <- {real}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
