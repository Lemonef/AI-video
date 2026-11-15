"""Re-frame focus cams that crop an actor's head.

Cause: close-up cams (zoom ~1.65) were centred below the actors' heads, so
the visible window [cy - H/z/2, cy + H/z/2] started under the head line.
Fix: for each such shot, frame the span head-margin .. feet-margin of the
tallest-reaching actor. Zoom is lowered only as far as MIN_ZOOM to make the
span fit; below that the head wins and the feet are cropped instead.

Idempotent: a shot already framing every head is left untouched.
Run: python -I tools/ink/fix_focus_crop.py [--dry]
"""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DOC = ROOT / 'videos/pastly-life/01-eiffel-ink/assets/ink60full/directed_full.json'
W, H = 1920, 1080          # canvas; focus is normalised against this
HEAD_MARGIN = 40           # px of air above the head
FEET_MARGIN = 30           # px of ground below the feet
MIN_ZOOM = 1.3             # never zoom out of the close-up feel past this
CROP_TOLERANCE = 5         # px a head may poke out before we call it cropped


def window(cy, z):
    half = H / z / 2
    return cy - half, cy + half


def fix_shot(s):
    cam = s.get('cam') or {}
    z, f = cam.get('zoom', 1.0), cam.get('focus')
    actors = s.get('actors') or []
    if not f or z <= 1.0 or not actors:
        return False
    top, _ = window(f['y'] * H, z)
    heads = [a['y'] - a['h'] for a in actors]
    if min(heads) >= top - CROP_TOLERANCE:
        return False
    need_top = min(heads) - HEAD_MARGIN
    need_bot = max(a['y'] for a in actors) + FEET_MARGIN
    span = need_bot - need_top
    new_z = max(MIN_ZOOM, min(z, H / span))
    half = H / new_z / 2
    cy = need_top + half
    cy = min(max(cy, half), H - half)          # keep the window on the canvas
    cam['zoom'] = round(new_z, 2)
    f['y'] = round(cy / H, 3)
    return True


def main():
    doc = json.load(open(DOC, encoding='utf-8'))
    n = sum(fix_shot(s) for blk in doc['shots'].values() for s in blk)
    print('re-framed', n)
    if '--dry' not in sys.argv:
        with open(DOC, 'w', encoding='utf-8') as fh:
            # indent=1 + no trailing newline = the file's existing format (keeps diffs small)
            json.dump(doc, fh, ensure_ascii=False, indent=1)


if __name__ == '__main__':
    main()
