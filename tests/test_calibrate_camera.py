"""Contract for adaptive camera-key densification (reference study, shot 19 finding 2026-11-03).

Fixed-stride keys are linearly interpolated by the renderer; during an eased push-in the
interpolated camera drifts several frames off the source between keys. Keys are added by
bisection wherever a fitted mid-gap matrix departs from the interpolated one.
"""
import sys
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "scripts"))

from calibrate_reference_camera import blend, corner_gap, densify, merge_samples  # noqa: E402


def scale(s, tx=0.0):
    return np.array([[s, 0.0, tx], [0.0, s, 0.0]])


def test_corner_gap_is_max_corner_displacement():
    assert abs(corner_gap(scale(1), scale(1, tx=3)) - 3) < 1e-9
    assert corner_gap(scale(1.2), scale(1.2)) == 0


def test_blend_is_linear_like_the_renderer():
    assert np.allclose(blend(scale(1), scale(2), .5), scale(1.5))
    assert np.allclose(blend(scale(1), scale(2), 0), scale(1))


def test_linear_motion_needs_no_extra_keys():
    truth = lambda f: scale(1 + .01*f)
    assert densify(truth, {0: truth(0), 10: truth(10)}, tol=.5) == {}


def test_eased_motion_gets_keys_until_interpolation_fits():
    ease = lambda f: (1 - np.cos(np.pi*f/20))/2
    truth = lambda f: scale(.9 + .2*ease(f))
    keys = {0: truth(0), 20: truth(20)}
    added = densify(truth, keys, tol=.5)
    assert added
    allk = {**keys, **added}
    frames = sorted(allk)
    for f in range(21):
        a = max(k for k in frames if k <= f)
        b = min(k for k in frames if k >= f)
        guess = allk[a] if a == b else blend(allk[a], allk[b], (f - a)/(b - a))
        assert corner_gap(guess, truth(f)) <= .5 + 1e-6, f


def test_failed_fits_are_omitted_not_invented():
    ease = lambda f: (1 - np.cos(np.pi*f/20))/2
    truth = lambda f: scale(.9 + .2*ease(f))
    assert densify(lambda f: None, {0: truth(0), 20: truth(20)}, tol=.5) == {}


def test_adjacent_keys_are_not_split():
    assert densify(lambda f: scale(5), {0: scale(1), 1: scale(2)}, tol=.5) == {}


def test_merge_replaces_only_refit_shots():
    old = [{'frame': 5, 'shot': 1}, {'frame': 50, 'shot': 2}, {'frame': 90, 'shot': 3}]
    new = [{'frame': 52, 'shot': 2}, {'frame': 51, 'shot': 2}]
    rows = merge_samples(old, new, {2})
    assert [r['frame'] for r in rows] == [5, 51, 52, 90]
