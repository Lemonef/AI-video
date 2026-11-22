"""Cut a pose sheet into transparent per-pose PNGs.

usage: python tools/ink/cut_sprites.py <sheet.png> <outdir> <prefix> [expected_count]
                                           [--key {magenta,white}] [--merge N]

Magenta mode (default) keys out #FF00FF. White mode keys out the pure-white sheet
background of the ep02 masters, keeping white heads and gloves that sit inside the
black outlines opaque. Nearby bits (hat, glove) are merged into one blob per pose,
then each blob is cropped and ordered row-major.
"""
import argparse

import numpy as np
from PIL import Image
from scipy import ndimage as ndi

# White mode: every RGB channel above this is "near white", i.e. a background candidate.
NEAR_WHITE = 235
# A band divider is a thin strip spanning almost the whole sheet (master_bath has them);
# it is much wider/taller than a pose but only a fraction of the other dimension thick.
DIVIDER_SPAN = 0.90
DIVIDER_THIN = 0.02
# Magenta needs 8 dilation steps to merge a pose's parts; the ep02 white sheets pack rows
# only a few pixels apart, so any more than 1 step glues neighbouring cells together.
DEFAULT_MERGE = {'magenta': 8, 'white': 1}


def parse_args(argv=None):
    p = argparse.ArgumentParser(description='Cut a pose sheet into transparent per-pose PNGs.')
    p.add_argument('sheet')
    p.add_argument('outdir')
    p.add_argument('prefix')
    p.add_argument('expected_count', nargs='?', type=int, default=None)
    p.add_argument('--key', choices=('magenta', 'white'), default='magenta')
    p.add_argument('--merge', type=int, default=None)
    return p.parse_args(argv)


def magenta_foreground(im):
    r, g, b = im[..., 0], im[..., 1], im[..., 2]
    key = (r > 170) & (b > 170) & (g < 130)          # magenta incl. antialias fringe
    return ndi.binary_opening(~key, iterations=1)


def drop_dividers(fg):
    h_img, w_img = fg.shape
    lab, n = ndi.label(fg)
    keep = np.ones(n + 1, dtype=bool)
    keep[0] = False
    for i in range(1, n + 1):
        ys, xs = np.where(lab == i)
        h, w = ys.max() - ys.min() + 1, xs.max() - xs.min() + 1
        if (w >= DIVIDER_SPAN * w_img and h < DIVIDER_THIN * h_img) or \
           (h >= DIVIDER_SPAN * h_img and w < DIVIDER_THIN * w_img):
            keep[i] = False
    return keep[lab]


def white_foreground(im):
    near_white = im.min(axis=2) > NEAR_WHITE
    lab, _ = ndi.label(near_white)
    border = np.unique(np.concatenate([lab[0, :], lab[-1, :], lab[:, 0], lab[:, -1]]))
    border = border[border != 0]
    background = np.isin(lab, border)               # only white touching the border is background
    fg = ndi.binary_opening(~background, iterations=1)
    return drop_dividers(fg)


def main(argv=None):
    args = parse_args(argv)
    im = np.array(Image.open(args.sheet).convert('RGB')).astype(int)

    if args.key == 'magenta':
        fg = magenta_foreground(im)
    else:
        fg = white_foreground(im)
    merge = args.merge if args.merge is not None else DEFAULT_MERGE[args.key]

    lab, n = ndi.label(ndi.binary_dilation(fg, iterations=merge))   # merge hat/gloves into the body blob
    min_area = 0.15 * fg.sum() / max(args.expected_count or 3, 1)   # drop specks (sweat drops etc. merge via dilation)
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
    if args.expected_count and len(ordered) != args.expected_count:
        print(f'WARN found {len(ordered)} blobs, wanted {args.expected_count}')

    for k, (y0, y1, x0, x1, i) in enumerate(ordered):
        alpha = (((lab == i) & fg)[y0:y1 + 1, x0:x1 + 1]).astype(np.uint8) * 255
        rgb = im[y0:y1 + 1, x0:x1 + 1].astype(np.uint8)
        if args.key == 'magenta':
            cr, cg, cb = rgb[..., 0].astype(int), rgb[..., 1].astype(int), rgb[..., 2].astype(int)
            fringe = (cr - cg > 60) & (cb - cg > 60)           # leftover magenta halo on edges
            alpha[fringe] = 0
        Image.fromarray(np.dstack([rgb, alpha])).save(f'{args.outdir}/{args.prefix}{k + 1}.png')
        print(f'{args.prefix}{k + 1}: {x1 - x0 + 1}x{y1 - y0 + 1}')


if __name__ == '__main__':
    main()
