"""Extend a reference-assisted clean plate past its 270x480 frame.

The aisle plate was made from one source still, so it covers exactly one frame.
Where the fitted source camera pulls back or tilts up (shots 3, 19, 29) the plate
stops short of the frame edge and the stage background shows as black bars.
A clean plate cannot invent a field of view, but the source video itself sees
those margins in other frames: this warps every listed source frame into an
enlarged plate canvas with the same calibration matrices the composition uses,
masks screen-space overlays (title, clock, captions), and takes a per-pixel
median. The original plate is pasted back unchanged in the centre, so any frame
that never left the plate renders bit-identical.

  python scripts/extend_clean_plate.py            # aisle plate, default shots

Writes public/reference-study/<plate>-clean-v2.png (gitignored, like v1) and
src/compositions/ReferenceStudy/plate-extents.json (tracked: where the
composition places the image). Margins are measured from calibration.json, so
a recalibrated camera only needs a re-run.
"""
import argparse
import json
from pathlib import Path
import subprocess

import cv2
import numpy as np

REPO = Path(__file__).resolve().parents[1]
STUDY = REPO/'out/drafts/reference-study/DegJCmXtbGj'
SCENE = REPO/'src/compositions/ReferenceStudy'
PUBLIC = REPO/'public/reference-study'
UNITS = (270, 480)       # study plane the calibration matrices map (calibration.json coordinate_plane)
SOURCE_PX_PER_UNIT = 4   # source.mp4 is 1080x1920
# Margin past the furthest frame corner any sample sees: covers interpolation between
# calibration samples (stride 10) overshooting the sampled extremes slightly.
SAFETY_UNITS = 2
REMAP_ROW = 4096
FRAME_STRIDE = 2         # every 2nd source frame: neighbours add nothing to a median
# Screen-space overlays in the source, study units (x0, y0, x1, y1), measured on source
# frames 160 / 1520 / 2175. They stay put while the camera moves, so they would print
# onto the plate wherever the median is short of clean samples.
OVERLAYS = {
    3: [(92, 58, 178, 120)],     # ZOMBIE OUTBREAK / DAY 1 / time tag
    19: [(2, 62, 72, 102)],      # countdown clock
}
CAPTION_BOX = (50, 290, 220, 340)  # burned-in captions, every shot
# Bright-lit spans only: the plate is the lit aisle, dark/torch frames would pull it down.
# (shot, first local frame, end local frame or None = to the shot end). Shot 15 opens on the door
# plate and cuts to map-parking at source frame 894 (calibration.json), so its span starts there.
DEFAULT_SPANS = {'aisle': [(3, 0, None), (19, 0, None), (29, 0, 31)],
                 'map-parking': [(15, 42, None), (16, 0, None)],
                 'door': [(10, 0, None), (13, 0, None), (14, 0, None), (15, 0, 42), (22, 0, None),
                          (24, 0, None), (26, 0, None), (27, 0, None), (28, 0, None)]}


def matrix_at(samples, frame):
    """Same interpolation as index.tsx: linear between the bracketing calibration samples."""
    past = [k for k in samples if k['frame'] <= frame]
    before = past[-1] if past else samples[0]
    after = next((k for k in samples if k['frame'] >= frame), samples[-1])
    t = 0 if after['frame'] == before['frame'] else (frame - before['frame'])/(after['frame'] - before['frame'])
    return np.array(before['matrix']) + (np.array(after['matrix']) - np.array(before['matrix']))*t


def as_rows(flat):
    """cv2.remap caps each map dimension below 32767, so a long pixel list goes in as rows."""
    rows = -(-len(flat)//REMAP_ROW)
    return np.pad(flat.astype(np.float32), (0, rows*REMAP_ROW - len(flat)), constant_values=-1).reshape(rows, REMAP_ROW)


def read_frames(start, end):
    w, h = UNITS[0]*SOURCE_PX_PER_UNIT, UNITS[1]*SOURCE_PX_PER_UNIT
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', str(STUDY/'source.mp4'), '-vf',
                          f'trim=start_frame={start}:end_frame={end},setpts=PTS-STARTPTS,scale={w}:{h},format=bgr24',
                          '-f', 'rawvideo', '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.uint8).reshape(-1, h, w, 3)


def main():
    p = argparse.ArgumentParser()
    p.add_argument('--plate', default='aisle')
    a = p.parse_args()
    cal = json.loads((SCENE/'calibration.json').read_text(encoding='utf-8'))['samples']
    shots = json.loads((STUDY/'shot-review.json').read_text(encoding='utf-8'))['shots']
    plate_samples = [k for k in cal if k['plate'] == a.plate]
    v1 = cv2.imread(str(PUBLIC/f'{a.plate}-clean-v1.png'))
    ph, pw = v1.shape[:2]
    dx, dy = pw/UNITS[0], ph/UNITS[1]

    # Extent: every frame corner seen by any calibrated shot of this plate, in plate units.
    corners = np.array([[0, UNITS[0], 0, UNITS[0]], [0, 0, UNITS[1], UNITS[1]], [1, 1, 1, 1]])
    seen = np.hstack([(np.linalg.inv(np.vstack([k['matrix'], [0, 0, 1]])) @ corners)[:2] for k in plate_samples])
    lo = np.minimum(seen.min(1) - SAFETY_UNITS, 0)
    hi = np.maximum(seen.max(1) + SAFETY_UNITS, UNITS)
    left, top = int(np.ceil(-lo[0]*dx)), int(np.ceil(-lo[1]*dy))
    right, bottom = int(np.ceil((hi[0] - UNITS[0])*dx)), int(np.ceil((hi[1] - UNITS[1])*dy))
    W, H = left + pw + right, top + ph + bottom

    # Canvas pixel -> plate units -> (per frame) source pixel.
    u, v = np.meshgrid(np.arange(W, dtype=np.float32), np.arange(H, dtype=np.float32))
    X, Y = (u - left)/dx, (v - top)/dy
    margin = ~((u >= left) & (u < left + pw) & (v >= top) & (v < top + ph))
    mi = np.nonzero(margin)
    Xm, Ym = X[mi], Y[mi]
    stack = []
    for shot_id, start_local, end_local in DEFAULT_SPANS[a.plate]:
        s = shots[shot_id - 1]
        start = s['start'] + start_local
        end = s['end'] if end_local is None else s['start'] + end_local
        samples = [k for k in plate_samples if k['shot'] == shot_id]
        boxes = OVERLAYS.get(shot_id, []) + [CAPTION_BOX]
        frames = read_frames(start, end)
        for i in range(0, len(frames), FRAME_STRIDE):
            m = matrix_at(samples, start + i)
            fx = (m[0, 0]*Xm + m[0, 1]*Ym + m[0, 2])
            fy = (m[1, 0]*Xm + m[1, 1]*Ym + m[1, 2])
            ok = (fx >= 0) & (fx < UNITS[0]) & (fy >= 0) & (fy < UNITS[1])
            for x0, y0, x1, y1 in boxes:
                ok &= ~((fx >= x0) & (fx < x1) & (fy >= y0) & (fy < y1))
            px = cv2.remap(frames[i], as_rows(fx*SOURCE_PX_PER_UNIT), as_rows(fy*SOURCE_PX_PER_UNIT),
                           cv2.INTER_LINEAR).reshape(-1, 3)[:len(fx)]
            col = px.astype(np.float16)
            col[~ok] = np.nan
            stack.append(col)
        print(f'shot {shot_id}: {len(frames)} frames')
    med = np.nanmedian(np.stack(stack), axis=0)   # all-nan columns warn and stay nan: inpainted below
    canvas = np.zeros((H, W, 3), np.uint8)
    hole = np.zeros((H, W), np.uint8)
    good = ~np.isnan(med[:, 0])
    canvas[mi[0][good], mi[1][good]] = np.clip(med[good], 0, 255).astype(np.uint8)
    hole[mi[0][~good], mi[1][~good]] = 255
    canvas[top:top + ph, left:left + pw] = v1
    if hole.any():
        canvas = cv2.inpaint(canvas, hole, 5, cv2.INPAINT_TELEA)
        canvas[top:top + ph, left:left + pw] = v1
    out = PUBLIC/f'{a.plate}-clean-v2.png'
    cv2.imwrite(str(out), canvas)

    extents_path = SCENE/'plate-extents.json'
    extents = json.loads(extents_path.read_text(encoding='utf-8')) if extents_path.exists() else {}
    # Placement in study units; the v1 pixels land exactly on (0,0)-(270,480).
    extents[a.plate] = {'file': out.name, 'x': -left/dx, 'y': -top/dy, 'width': W/dx, 'height': H/dy}
    extents_path.write_text(json.dumps(extents, indent=1) + '\n', encoding='utf-8')
    print(f'{out.name}: {W}x{H}, unseen px inpainted {int(hole.astype(bool).sum())}, extent {extents[a.plate]}')


if __name__ == '__main__':
    main()
