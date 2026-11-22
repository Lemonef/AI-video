"""Gate for the white-background mode of tools/ink/cut_sprites.py (ep02 masters).

The ep02 master sheets (Blackbeard, crew, Bath guests) are drawn on pure white, with white
heads and gloves inside thick black outlines. A white-key cutter must keep those white
interiors opaque (only white connected to the sheet border is background), drop the black
band-divider lines on master_bath, and still return one sprite per cell in row-major order.
Magenta mode must behave exactly as before (ep01 regression).
"""
import json
import subprocess
import sys
from pathlib import Path

import numpy as np
import pytest
from PIL import Image
from scipy import ndimage as ndi

ROOT = Path(__file__).resolve().parents[1]
CUT = ROOT / "tools/ink/cut_sprites.py"
EP02 = ROOT / "videos/pastly-life/02-blackbeard-ink/assets/ink/sheets"
EP01 = ROOT / "videos/pastly-life/01-eiffel-ink/assets/ink60full/sheets"

# Cell counts read off each sheet by eye (2026-11-22):
# bb = 6 turnarounds + 24 poses + 12 expressions; crew = 6 + 24 + 12; bath = 3 bands x (3 + 6 + 4).
WHITE_SHEETS = [("master_bb.png", 42), ("master_crew.png", 42), ("master_bath.png", 39)]


def _cut(sheet, outdir, want, *extra):
    return subprocess.run(
        [sys.executable, "-I", str(CUT), str(sheet), str(outdir), "p", str(want), *extra],
        # stdin=DEVNULL: with no stdin given, Windows subprocess duplicates the parent's stdin
        # handle, which is invalid under headless runners (WinError 6, flaky gate 2026-11-22).
        stdin=subprocess.DEVNULL, capture_output=True, text=True, timeout=600,
    )


@pytest.mark.parametrize("name,want", WHITE_SHEETS)
def test_white_key_cuts_every_cell(tmp_path, name, want):
    r = _cut(EP02 / name, tmp_path, want, "--key", "white")
    assert r.returncode == 0, r.stderr
    assert "WARN" not in r.stdout, r.stdout
    files = sorted(tmp_path.glob("p*.png"))
    assert len(files) == want
    white_total = alpha_total = 0
    for f in files:
        a = np.array(Image.open(f))
        assert a.ndim == 3 and a.shape[2] == 4, f"{f.name} not RGBA"
        alpha = a[..., 3]
        # background removed: every corner of the crop is transparent
        assert all(alpha[y, x] == 0 for y, x in [(0, 0), (0, -1), (-1, 0), (-1, -1)]), f.name
        # white heads / gloves inside the outline stay opaque. Per crop only "some white":
        # the top-down pose shows just a black hat + two gloves (~1% white), so a per-crop
        # ratio is unfair; the sheet-wide ratio below catches a cutter that drops interiors.
        white_opaque = ((a[..., :3].min(axis=2) > 235) & (alpha > 0)).sum()
        assert white_opaque > 0, f"{f.name} lost its white interior"
        white_total += white_opaque
        alpha_total += alpha.size
        # no crop is a thin line (band dividers dropped)
        h, w = alpha.shape
        assert min(h, w) > 40 and max(h, w) / min(h, w) < 6, f"{f.name} looks like a line {w}x{h}"
    assert white_total > 0.02 * alpha_total, "white interiors lost across the sheet"


def test_white_key_row_major_order(tmp_path):
    """Top-row turnarounds come first; the last 12 sprites are the expression heads (short)."""
    r = _cut(EP02 / "master_bb.png", tmp_path, 42, "--key", "white")
    assert r.returncode == 0, r.stderr
    hs = [np.array(Image.open(tmp_path / f"p{k}.png")).shape[0] for k in range(1, 43)]
    assert max(hs[-12:]) < min(hs[:6]), "expression heads should be the last row and shorter than full bodies"


@pytest.mark.parametrize("name,want", WHITE_SHEETS)
def test_white_key_no_light_halo(tmp_path, name, want):
    """Zen 2026-11-22 ("pixelate white outlines"): antialiased outline-on-paper pixels at the
    sprite edge were kept fully opaque, so a dotted white rim showed on dark decks. Composited
    on a dark plate, the outermost visible ring must be as dark as the black outline it is."""
    r = _cut(EP02 / name, tmp_path, want, "--key", "white")
    assert r.returncode == 0, r.stderr
    dark = np.array([20, 24, 40], float)                 # night-deck plate colour
    for f in sorted(tmp_path.glob("p*.png")):
        a = np.array(Image.open(f)).astype(float)
        al = a[..., 3:] / 255
        comp = a[..., :3] * al + dark * (1 - al)
        vis = a[..., 3] > 0
        rim = vis & ndi.binary_dilation(~vis, iterations=1)
        light = (comp[rim].min(axis=1) > 120).mean()
        assert light < 0.05, f"{f.name}: {light:.0%} of the edge ring is a light halo"


@pytest.mark.parametrize("sheet", sorted(EP01.glob("sheet_*.png")))
def test_magenta_mode_unchanged(tmp_path, sheet):
    want = len(json.loads(sheet.with_suffix(".order.json").read_text()))
    r = _cut(sheet, tmp_path, want)
    assert r.returncode == 0, r.stderr
    assert "WARN" not in r.stdout, r.stdout
    assert len(list(tmp_path.glob("p*.png"))) == want
