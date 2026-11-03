"""Contract for the gate's motion score (owner-agreed 2026-11-03).

MAE/SSIM score each sampled frame alone, so camera wobble or jerky timing between frames
barely moves them. The motion score compares frame-to-frame change: ours vs source.
Every shot (target and guard) must hold it within noise.
"""
import sys
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "scripts"))

from reference_gate import NOISE_MOTION, judge, motion_error  # noqa: E402


def still(n=6, value=100):
    return np.full((n, 24, 16), value, np.float32)


def test_identical_motion_scores_zero():
    rng = np.random.default_rng(1)
    clip = rng.uniform(0, 255, (6, 24, 16)).astype(np.float32)
    assert motion_error(clip, clip.copy()) == 0


def test_constant_brightness_offset_is_not_motion():
    assert motion_error(still(), still(value=140)) == 0


def test_wobble_on_a_still_source_scores_above_noise():
    ours = still()
    ours[1::2, :, :8] += 30   # flicker every other frame
    assert motion_error(still(), ours) > 100*NOISE_MOTION


def score(mae, ssim, motion, actor=None):
    return {'frame': {'mae_255': mae, 'ssim': ssim}, 'actor': actor, 'motion': motion}


def test_target_mae_gain_with_wobble_fails():
    assert not judge(score(20, .8, 1.0), score(15, .85, 3.0), target=True)


def test_target_mae_gain_with_motion_held_passes():
    assert judge(score(20, .8, 1.0), score(15, .85, 1.0), target=True)


def test_guard_needs_motion_held():
    assert judge(score(20, .8, 1.0), score(20, .8, 1.0), target=False)
    assert not judge(score(20, .8, 1.0), score(20, .8, 2.0), target=False)


def test_target_without_mae_gain_still_fails():
    assert not judge(score(20, .8, 1.0), score(20, .8, .5), target=True)
