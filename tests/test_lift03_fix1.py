"""Contract for lift-ex Part 3 fix round 1 (owner review 2026-11-04).

Owner flagged: crossed arms read as a weird X, the phone floats on her chest instead of sitting in
her hand, a detached second arm stops the doors, and the climax shows only the crowd.
"""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def read(rel):
    return (ROOT / rel).read_text(encoding='utf-8')


def body(name):
    src = read('src/v7/Lift.tsx')
    m = re.search(rf'export const {name}\b(.*?)(?=\nexport const |\Z)', src, re.S)
    assert m, name
    return m.group(1)


def test_hand_helper_exported():
    # props in a hand must follow the arm maths, not a hand-tuned coordinate
    assert re.search(r'export const handAt\b', read('src/v2/Character.tsx'))


def test_no_crossed_arms_in_lift_sets():
    for name in ('LiftAwkward', 'LiftBicker', 'LiftDoorsStop'):
        assert 'armsCrossed' not in body(name), name


def test_props_sit_in_hands():
    for name in ('LiftAwkward', 'LiftDoorsStop'):
        assert 'handAt(' in body(name), name


def test_doors_stopped_by_his_own_arm():
    # the old fix drew a second sleeve in his top colour, detached from his body
    assert '#4a7159' not in body('LiftDoorsStop')


def test_climax_set_wired():
    assert re.search(r'export const LobbyGesture\s*:\s*React\.FC<EnvProps>', read('src/v7/Lift.tsx'))
    assert re.search(r'\blobbyGesture\s*:\s*LobbyGesture\b', read('src/v5/Forest.tsx'))
    assert re.search(r'^\s*lobbyGesture\s*:\s*\{', read('src/v7/light.tsx'), re.M)
    assert 'lift-lobbyGesture' in read('src/v7/Lift.tsx')


def test_episode_climax_uses_it():
    ep = json.loads(read('episodes/lift03.json'))
    assert {s['id']: s['bg'] for s in ep['scenes']}['gesture'] == 'lobbyGesture'
