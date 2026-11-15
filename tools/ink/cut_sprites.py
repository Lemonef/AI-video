"""Cut a magenta-keyed pose sheet into transparent per-pose PNGs.
usage: python tools/cut_sprites.py <sheet.png> <outdir> <prefix> [expected_count]
Keys #FF00FF, merges nearby bits (hat, glove) into one blob per pose, crops, orders row-major.
"""
import sys

import numpy as np
from PIL import Image
from scipy import ndimage as ndi

src, outdir, prefix = sys.argv[1], sys.argv[2], sys.argv[3]
want = int(sys.argv[4]) if len(sys.argv) > 4 else None

im = np.array(Image.open(src).convert('RGB')).astype(int)
r, g, b = im[..., 0], im[..., 1], im[..., 2]
key = (r > 170) & (b > 170) & (g < 130)          # magenta incl. antialias fringe
fg = ndi.binary_opening(~key, iterations=1)

lab, n = ndi.label(ndi.binary_dilation(fg, iterations=8))   # merge hat/gloves into the body blob
min_area = 0.15 * fg.sum() / max(want or 3, 1)               # drop specks (sweat drops etc. merge via dilation)
boxes = []
for i in range(1, n + 1):
    body = (lab == i) & fg
    if body.sum() < min_area:
        continue
    ys, xs = np.where(body)
    boxes.append((ys.min(), ys.max(), xs.min(), xs.max(), i))

boxes.sort(key=lambda t: (t[0] + t[1]) / 2)
rows, cur = [], [boxes[0]]
for bx in boxes[1:]:
    ref = cur[0]
    if abs((bx[0] + bx[1]) / 2 - (ref[0] + ref[1]) / 2) < 0.5 * (ref[1] - ref[0]):
        cur.append(bx)
    else:
        rows.append(cur)
        cur = [bx]
rows.append(cur)
ordered = [bx for row in rows for bx in sorted(row, key=lambda t: t[2])]
if want and len(ordered) != want:
    print(f'WARN found {len(ordered)} blobs, wanted {want}')

for k, (y0, y1, x0, x1, i) in enumerate(ordered):
    alpha = (((lab == i) & fg)[y0:y1 + 1, x0:x1 + 1]).astype(np.uint8) * 255
    rgb = im[y0:y1 + 1, x0:x1 + 1].astype(np.uint8)
    cr, cg, cb = rgb[..., 0].astype(int), rgb[..., 1].astype(int), rgb[..., 2].astype(int)
    fringe = (cr - cg > 60) & (cb - cg > 60)           # leftover magenta halo on edges
    alpha[fringe] = 0
    Image.fromarray(np.dstack([rgb, alpha])).save(f'{outdir}/{prefix}{k + 1}.png')
    print(f'{prefix}{k + 1}: {x1 - x0 + 1}x{y1 - y0 + 1}')
