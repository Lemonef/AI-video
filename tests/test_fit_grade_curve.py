"""Contract for per-shot, per-frame grade curves fitted from the source (owner loop 2026-11-03).

A static SHOT_GRADE slope cannot follow a source whose lights fade over time (shot 29 dims
106 -> 16 mean luma over local frames 8-31, then recovers). The fit gives one slope per local
frame: base slope x source luma / render luma, clamped, so the composition can follow it.
"""
import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "scripts"))

from fit_grade_curve import MAX_SLOPE, MIN_LUMA, MIN_SLOPE, fit_curve, merge_curve  # noqa: E402


def test_slope_is_source_over_render():
    assert fit_curve([100, 50], [100, 100]) == [1.0, 0.5]


def test_base_slope_multiplies():
    # the render already carries the shot's static grade; the fitted slope replaces it
    assert fit_curve([60], [100], base_slope=.8) == [pytest.approx(.48)]


def test_slopes_are_clamped():
    curve = fit_curve([255, 1], [10, 200])
    assert curve == [MAX_SLOPE, MIN_SLOPE]


def test_near_black_render_frame_carries_previous_slope():
    curve = fit_curve([80, 30, 5], [100, 100, MIN_LUMA/2])
    assert curve[2] == curve[1]


def test_near_black_first_frame_uses_base_slope():
    assert fit_curve([5], [MIN_LUMA/2], base_slope=1.1) == [1.1]


def test_slopes_rounded_to_three_places():
    assert fit_curve([70], [90]) == [.778]


def test_merge_keeps_other_shots_and_does_not_mutate():
    table = {'27': [1.0]}
    out = merge_curve(table, 29, [.9, .8])
    assert out == {'27': [1.0], '29': [.9, .8]}
    assert table == {'27': [1.0]}


def test_merge_replaces_same_shot():
    assert merge_curve({'29': [1.0]}, 29, [.5]) == {'29': [.5]}
