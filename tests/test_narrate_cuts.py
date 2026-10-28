import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "scripts"))

from pipeline.narrate import _cuts_from_starts, _repair_starts  # noqa: E402


def test_invented_starts_are_rebuilt_between_good_neighbours():
    # Gemini answered 100 s for line 3 of a 10 s take; lines 2 and 4 are good anchors.
    starts = [0.0, 3.0, 100.0, 8.0]
    letters = [10, 10, 10, 10]
    pauses = [(2.6, 3.0), (5.2, 5.6), (6.2, 6.4), (7.6, 8.0)]
    fixed, bad = _repair_starts(starts, letters, take_sec=10.0, pauses=pauses)
    assert bad == 1
    assert fixed[2] == 5.6  # the pause end nearest the letter-proportional estimate (5.5)


def test_a_cut_sits_in_the_pause_just_before_a_line():
    cuts = _cuts_from_starts([0.0, 3.1, 5.7], take_sec=8.0, pauses=[(2.6, 3.0), (5.2, 5.6)])
    assert cuts == [(0.0, 2.8), (2.8, 5.4), (5.4, 8.0)]
