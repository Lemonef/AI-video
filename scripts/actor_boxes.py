"""Derive per-frame actor boxes for the character score from the measured lead rig.

The whole-frame score barely moves when only the actor changes (the actor is
~5% of the frame), so the gate also scores a crop around the actor. Boxes are
in the 270x480 review plane, the same plane the lead keys were measured in, and
come from the SOURCE landmarks: the crop asks "does the render match the actor
where the source actor is". Shots without a measured rig get hand-measured boxes
in the same file; this script only rewrites the shots it derives.

  python scripts/actor_boxes.py            # update actor-boxes.json
  python scripts/actor_boxes.py --check    # fail if the file is out of date
"""
import argparse
import json
import os
from pathlib import Path
import re
import sys

REPO = Path(__file__).resolve().parents[1]
STUDY_DIR = Path(os.environ.get('REFERENCE_STUDY_DIR', REPO/'out/drafts/reference-study/DegJCmXtbGj'))
RIG = REPO/'src/compositions/ReferenceStudy/LeadPerformance.tsx'
JOINTS = ('hip', 'lk', 'la', 'rk', 'ra', 'le', 'lw', 're', 'rw')
# Extents in head units (s = r/30), copied from the drawing in LeadPerformance:
# head circle r=30, hat brim to x+44, hat button at y-37, ground shadow rx=32
# 5 below the lower ankle, limb strokes 9 wide. Change together with the rig.
HEAD_LEFT, BRIM_RIGHT, HAT_TOP, SHADOW_RX, SHADOW_DROP, STROKE_HALF = 30, 44, 37, 32, 10, 4.5


def parse_rig():
    src = RIG.read_text(encoding='utf-8')
    arrays = {}
    for name, body in re.findall(r'const (\w+):Key\[\]=\[(.*?)\];', src, re.S):
        keys = []
        for k in re.findall(r'\{f:[^}]*\}', body):
            nums = {m[0]: [float(v) for v in m[1].strip('[]').split(',')]
                    for m in re.findall(r'(\w+):(\[[^\]]*\]|[-\d.]+)', k[1:-1])}
            keys.append(nums)
        arrays[name] = keys
    shots = [int(x) for x in re.search(r'hasMeasuredLead=.*?\[([\d,]+)\]', src).group(1).split(',')]
    dispatch = re.search(r'k=at\((.*?),frame\)', src).group(1)
    named = {int(a): b for a, b in re.findall(r'shot===(\d+)\?(\w+)', dispatch)}
    fallback = dispatch.rsplit(':', 1)[1]
    return {shot: arrays[named.get(shot, fallback)] for shot in shots}


def box(k):
    r, s = k['r'][0], k['r'][0]/30
    (hx, hy) = k['h']
    pts = [k[j] for j in JOINTS]
    xs = [p[0] for p in pts] + [hx - HEAD_LEFT*s, hx + BRIM_RIGHT*s]
    ys = [p[1] for p in pts] + [hy - HAT_TOP*s]
    feet_x, feet_y = (k['la'][0]+k['ra'][0])/2, max(k['la'][1], k['ra'][1])
    xs += [feet_x - SHADOW_RX*s, feet_x + SHADOW_RX*s]
    ys += [feet_y + SHADOW_DROP*s]
    pad = STROKE_HALF*s
    return [int(k['f'][0]), round(min(xs)-pad, 1), round(min(ys)-pad, 1), round(max(xs)+pad, 1), round(max(ys)+pad, 1)]


def main():
    p = argparse.ArgumentParser()
    p.add_argument('--check', action='store_true')
    args = p.parse_args()
    shots = json.loads((STUDY_DIR/'shot-review.json').read_text(encoding='utf-8'))['shots']
    path = STUDY_DIR/'actor-boxes.json'
    current = json.loads(path.read_text(encoding='utf-8')) if path.exists() else {'boxes': {}}
    derived = {}
    for shot, keys in parse_rig().items():
        s = shots[shot-1]
        inside = [box(k) for k in keys if s['start'] <= k['f'][0] < s['end']]
        if not inside:
            sys.exit(f'shot {shot}: no rig key inside frames {s["start"]}-{s["end"]}')
        derived[str(shot)] = {'from': 'LeadPerformance keys', 'keys': inside}
    updated = {'plane': '270x480 review', 'boxes': {**current['boxes'], **derived}}
    if args.check:
        sys.exit(0 if updated == current else 'actor-boxes.json is out of date; run scripts/actor_boxes.py')
    path.write_text(json.dumps(updated, indent=1), encoding='utf-8')
    for shot, v in derived.items():
        print(shot, len(v['keys']), 'keys', v['keys'][0])


if __name__ == '__main__':
    main()
