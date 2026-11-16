"""Chosen watermark (Zen 2026-11-16: GPT logo #10, rewind-arrow + peeking stickman) -> transparent PNG.

Paper connected to the image border becomes transparent (flood fill on a light mask);
closed shapes (face, fingers) keep their paper fill. Edge pixels get alpha from darkness
so the anti-aliased ink rim does not leave a pale halo.
Run: python make_wm_rewind.py   (from this folder)
"""
from pathlib import Path
import numpy as np
from PIL import Image
from scipy import ndimage

HERE = Path(__file__).parent
SRC = HERE.parent / "gpt" / "gpt_logo_10.png"
OUTS = [HERE / "wm_rewind.png",
        HERE.parents[2] / "01-eiffel-ink" / "assets" / "brand" / "wm_rewind.png"]  # Remotion public dir
LIGHT = 200      # min channel value counted as paper (paper ~244-248, ink 27, orange min ~43)
OUT_PX = 256     # output edge; watermark renders at ~72 px so 256 stays sharp at 2x+
PAD = 8

rgb = np.asarray(Image.open(SRC).convert("RGB")).astype(np.int16)
light = rgb.min(axis=2) >= LIGHT
lab, _ = ndimage.label(light)
border = np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))
bg = np.isin(lab, border[border > 0])
# soft rim: pixels touching the background get alpha from how far they are from paper
rim = ndimage.binary_dilation(bg, iterations=2) & ~bg
paper = rgb[bg].mean(axis=0)
dist = np.abs(rgb - paper).max(axis=2) / 255.0
alpha = np.where(bg, 0.0, 1.0)
alpha[rim] = np.clip(dist[rim] / 0.5, 0, 1)
rgba = np.dstack([rgb, (alpha * 255).astype(np.int16)]).astype(np.uint8)
im = Image.fromarray(rgba, "RGBA")
im = im.crop(im.getbbox())
side = max(im.size) + 2 * PAD
sq = Image.new("RGBA", (side, side), (0, 0, 0, 0))
sq.paste(im, ((side - im.width) // 2, (side - im.height) // 2))
sq = sq.resize((OUT_PX, OUT_PX), Image.LANCZOS)
for o in OUTS:
    o.parent.mkdir(parents=True, exist_ok=True)
    sq.save(o)
    print("wrote", o)
