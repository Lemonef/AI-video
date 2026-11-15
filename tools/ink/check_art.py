"""Gate for art briefs: python -I tools/check_art.py <manifest.json>
Manifest: {"kind":"plates"|"sheet","files":[paths], "poses": N (sheet only)}.
plates: each PNG exists, >=1500 px wide, ~16:9, not a flat colour.
sheet:  PNG exists, magenta key fraction 0.35-0.92, cut_sprites finds exactly N blobs.
"""
import json
import subprocess
import sys
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
VID = ROOT / "videos/pastly-life/01-eiffel-ink"
m = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
bad = []
for f in m["files"]:
    p = ROOT / f
    if not p.exists():
        bad.append(f"{f}: missing")
        continue
    im = Image.open(p).convert("RGB")
    w, h = im.size
    a = np.array(im).astype(int)
    if m["kind"] == "plates":
        if w < 1500 or abs(w / h - 16 / 9) > 0.08:
            bad.append(f"{f}: size {w}x{h}")
        if a.std() < 20:
            bad.append(f"{f}: nearly flat image")
    else:
        key = (a[..., 0] > 170) & (a[..., 2] > 170) & (a[..., 1] < 130)
        fr = key.mean()
        if not 0.35 <= fr <= 0.92:
            bad.append(f"{f}: magenta fraction {fr:.2f}")
        out = ROOT / "out" / "art_gate_cut" / p.stem
        out.mkdir(parents=True, exist_ok=True)
        r = subprocess.run([sys.executable, "-I", str(ROOT / "tools/ink/cut_sprites.py"), str(p), str(out), "g", str(m["poses"])],
                           capture_output=True, text=True)
        n = len(list(out.glob("g*.png")))
        if r.returncode != 0 or n != m["poses"]:
            bad.append(f"{f}: cut gave {n}/{m['poses']} ({r.stdout[-120:]}{r.stderr[-120:]})")
print("\n".join(bad) if bad else f"OK {len(m['files'])} files")
sys.exit(1 if bad else 0)
