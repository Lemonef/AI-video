"""Contract for the lift-ex Part 3 sets (docs/lift03-beat-sheet.md).

Each new bg id must be exported from src/v7/Lift.tsx, registered in the ENV5 map and given a
CAST_LIGHT entry, or the episode renders an empty frame / flat-lit cast without any error.
"""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
NEW_SETS = {'liftCatCall': 'LiftCatCall', 'liftCafeKitten': 'LiftCafeKitten',
            'lobbyDoorsOpen': 'LobbyDoorsOpen', 'liftDoorsStop': 'LiftDoorsStop', 'lobbyExit': 'LobbyExit'}


def read(rel):
    return (ROOT / rel).read_text(encoding='utf-8')


def test_sets_exported_from_lift():
    src = read('src/v7/Lift.tsx')
    for comp in NEW_SETS.values():
        assert re.search(rf'export const {comp}\s*:\s*React\.FC<EnvProps>', src), comp


def test_sets_registered_in_env5():
    src = read('src/v5/Forest.tsx')
    for bg, comp in NEW_SETS.items():
        assert re.search(rf'\b{bg}\s*:\s*{comp}\b', src), bg


def test_sets_have_cast_light():
    src = read('src/v7/light.tsx')
    for bg in NEW_SETS:
        assert re.search(rf'^\s*{bg}\s*:\s*\{{', src, re.M), bg


def test_svg_ids_prefixed_per_set():
    # gradients/clips are document-global in SVG: an unprefixed id leaks between scenes
    src = read('src/v7/Lift.tsx')
    for bg in NEW_SETS:
        assert f'lift-{bg}' in src, bg


def test_gift_card_text_present():
    assert 'ให้จ๊าบ ❤️' in read('src/v7/Lift.tsx')


def test_episode_uses_only_known_sets():
    # every bg the episode asks for must exist in ENV5, else that scene renders blank
    env5 = read('src/v5/Forest.tsx')
    ep = json.loads(read('episodes/lift03.json'))
    for s in ep['scenes']:
        bg = s.get('bg')
        if bg:
            assert re.search(rf'\b{bg}\s*:', env5), bg
