"""Swap a deterministic subset of scene shots onto the new angle plates.

Why: Zen (2026-11-15) - the episode was all one flat side-on view; Ink Explainer /
Beanie vary camera angle every few seconds. The six plates-g plates are real
different camera angles (worm's-eye, bird's-eye, extreme wide, framed doorway,
3/4 corner). Each plate has one open zone for the stickman; PLACE holds it per
plate (foot y, height, first x, x step, cam). Props are cleared because their
x/y were authored against the OLD plate and would float on the new one.

NOT idempotent (the source pool shrinks after a run, so a rerun swaps more shots).
Run once on a clean directed_full.json; `git checkout` the file to redo.
"""
import json
from pathlib import Path

PATH = Path(__file__).resolve().parents[2] / 'videos/pastly-life/01-eiffel-ink/assets/ink60full/directed_full.json'

# plate -> (foot y, actor h, first x, x step, cam, keep actors?)
PLACE = {
    'tower_low_angle_up': (1000, 380, 860, 260, {'move': 'push', 'zoom': 1.45, 'focus': {'x': 0.5, 'y': 0.4}}, True),
    'paris_skyline_extreme_wide': (1030, 300, 860, 240, {'move': 'push', 'zoom': 1.9, 'focus': {'x': 0.72, 'y': 0.55}}, True),
    'paris_birdseye_champ_de_mars': (0, 0, 0, 0, {'move': 'push', 'zoom': 1.5, 'focus': {'x': 0.5, 'y': 0.5}}, False),
    'hotel_suite_corner_34': (1010, 520, 860, 300, {'move': 'hold', 'zoom': 1.4, 'focus': {'x': 0.5, 'y': 0.7}}, True),
    'hotel_doorway_framed_view': (1030, 520, 800, 300, {'move': 'push', 'zoom': 1.5, 'focus': {'x': 0.5, 'y': 0.6}}, True),
}

# (source plates, stride, offset, target) - strides chosen so ~25% of scenes change angle
RULES = [
    ({'paris_tower_grey'}, 4, 1, 'tower_low_angle_up'),
    ({'paris_night', 'paris_grey', 'paris_dusk'}, 6, 2, 'paris_skyline_extreme_wide'),
    ({'paris_night', 'paris_grey', 'paris_dusk'}, 9, 4, 'paris_birdseye_champ_de_mars'),
    ({'hotel_room_night', 'crillon_salon_chandeliers'}, 5, 1, 'hotel_suite_corner_34'),
    ({'hotel_room_night', 'crillon_salon_chandeliers'}, 6, 3, 'hotel_doorway_framed_view'),
]


def main():
    doc = json.load(open(PATH, encoding='utf-8'))
    scenes = [s for blk in doc['shots'].values() for s in blk if s.get('k') == 'scene']
    done = {}
    for sources, stride, off, target in RULES:
        pool = [s for s in scenes if s.get('plate') in sources and len(s['actors']) <= 2]
        for i, s in enumerate(pool):
            if i % stride != off % stride:
                continue
            y, h, x0, dx, cam, keep = PLACE[target]
            s['plate'] = target
            s['props'] = []
            s['cam'] = dict(cam)
            if keep:
                for j, a in enumerate(s['actors']):
                    a.update({'x': x0 + j * dx, 'y': y, 'h': h})
            else:
                s['actors'] = []
            done[target] = done.get(target, 0) + 1
    json.dump(doc, open(PATH, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print(done)


if __name__ == '__main__':
    main()
