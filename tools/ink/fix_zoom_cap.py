"""Cap aggressive zoom and re-frame every focus shot so its actors AND props sit inside the window.

Why (Zen 2026-11-15, watching the voiced render): zoom up to 2.1 cropped props/text off-frame and showed floor,
and close-ups made the thin limbs look bad. Rule: focus zoom never above MAX_ZOOM; the window is then centred
on the bounding box of everything the shot shows (actors + props at their final size); zoom is lowered further
(down to 1.0) only if the box does not fit. Non-focus push/pull/pan amt is capped at MAX_AMT.

Idempotent. Prop box = top-left (x,y), size PROP_BOX[kind] * k (mirrors PROPS w/h in engine/ink/ink/props.tsx;
change together). Actor box = x +- h*ACTOR_HALF_W_RATIO, y-h .. y (y is the feet line).
Run: python -I tools/ink/fix_zoom_cap.py [--dry]
"""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DOC = ROOT / 'videos/pastly-life/01-eiffel-ink/assets/ink60full/directed_full.json'
W, H = 1920, 1080
MAX_ZOOM = 1.25            # Zen: 1.33 avg / 2.1 max felt too hard; Beanie/gly2 refs hold 1.00-1.05
MAX_AMT = 0.08             # non-focus camera travel cap (default is 0.06)
MARGIN = 60                # px of air around the framed box
ACTOR_HALF_W_RATIO = 0.35  # sprite half-width as a fraction of its height (sprites are ~0.7 as wide as tall)
PROP_BOX = {               # w, h from PROPS in props.tsx
    'suitcase': (420, 270), 'banknotes': (440, 170), 'door': (300, 520), 'newspaper': (420, 520),
    'tower': (None, None), 'coin': (120, 120), 'papers': (316, 388), 'telegram': (380, 240),
    'handcuffs': (360, 160), 'ship': (620, 340), 'keys': (260, 140),
}


def prop_box(p):
    w, h = PROP_BOX.get(p['kind'], (300, 300))
    if p['kind'] == 'tower':        # TOWER_HALF_W / TOWER_H live in props.tsx; tall narrow lattice
        w, h = 260, 560
    k = p.get('k', 1)
    return p['x'], p['y'], p['x'] + w * k, p['y'] + h * k


def shot_box(s):
    boxes = []
    for a in s.get('actors') or []:
        hw = a['h'] * ACTOR_HALF_W_RATIO
        boxes.append((a['x'] - hw, a['y'] - a['h'], a['x'] + hw, a['y']))
    for p in s.get('props') or []:
        boxes.append(prop_box(p))
    if not boxes:
        return None
    return (min(b[0] for b in boxes), min(b[1] for b in boxes), max(b[2] for b in boxes), max(b[3] for b in boxes))


def fix_shot(s):
    cam = s.get('cam')
    if not cam:
        return False
    changed = False
    if not cam.get('focus'):
        if cam.get('amt', 0) > MAX_AMT:
            cam['amt'] = MAX_AMT
            return True
        return False
    z = cam.get('zoom', 1.0)
    box = shot_box(s)
    new_z = min(z, MAX_ZOOM)
    if box:
        bw, bh = box[2] - box[0] + 2 * MARGIN, box[3] - box[1] + 2 * MARGIN
        new_z = max(1.0, min(new_z, W / bw, H / bh))     # lower zoom until the whole box fits
        cx, cy = (box[0] + box[2]) / 2, (box[1] + box[3]) / 2
        # biased down a touch is wrong here: centre the box so nothing is cropped on either axis
        fx, fy = round(min(max(cx / W, 0), 1), 3), round(min(max(cy / H, 0), 1), 3)
    else:
        fx, fy = cam['focus']['x'], cam['focus']['y']
    new_z = round(new_z, 2)
    if cam['zoom'] != new_z or cam['focus'] != {'x': fx, 'y': fy}:
        cam['zoom'] = new_z
        cam['focus'] = {'x': fx, 'y': fy}
        changed = True
    return changed


def main():
    doc = json.load(open(DOC, encoding='utf-8'))
    shots = [s for blk in doc['shots'].values() for s in blk]
    n = sum(fix_shot(s) for s in shots)
    zs = [s['cam']['zoom'] for s in shots if s.get('cam') and s['cam'].get('focus')]
    print('changed', n, 'focus shots', len(zs), 'avg zoom', round(sum(zs) / max(1, len(zs)), 2), 'max', max(zs))
    if '--dry' not in sys.argv:
        with open(DOC, 'w', encoding='utf-8') as fh:
            json.dump(doc, fh, ensure_ascii=False, indent=1)   # file's existing format: indent=1, no trailing newline


if __name__ == '__main__':
    main()
