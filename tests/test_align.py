import sys

import pytest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "scripts"))

from pipeline.align import scene_cuts, snap, spoken_len, words_in  # noqa: E402
from pipeline.tts import Word  # noqa: E402


def test_tags_are_not_spoken():
    assert spoken_len("[whispers] กขค") == 3


def test_cut_lands_in_the_gap_before_the_next_line():
    lines = ["กกกก", "[excited] ขขขข"]
    words = [Word("กกกก", 0.0, 1.0), Word("ขขขข", 2.0, 3.0)]
    cuts = scene_cuts(lines, words, take_sec=3.5)
    assert cuts == [(0.0, 1.5), (1.5, 3.5)]


def test_words_in_retimes_relative_to_cut():
    words = [Word("ก", 0.2, 0.4), Word("ข", 1.7, 2.0)]
    (w,) = words_in(words, 1.5, 3.0)
    assert w.text == "ข" and w.start == pytest.approx(0.2) and w.end == pytest.approx(0.5)


def test_snap_prefers_the_real_pause_near_the_estimate():
    # estimate drifted into the next word; the real 0.5 s pause is 0.6 s earlier
    assert snap(5.0, [(4.3, 4.7), (6.9, 7.0)]) == pytest.approx(4.5)


def test_snap_ignores_pauses_outside_the_window():
    assert snap(5.0, [(1.0, 2.0)]) == 5.0


def test_cuts_snap_to_measured_silence():
    lines = ["กกกก", "ขขขข"]
    words = [Word("กกกก", 0.0, 1.0), Word("ขข", 1.2, 1.6), Word("ขข", 2.0, 3.0)]  # whisper split oddly
    cuts = scene_cuts(lines, words, take_sec=3.2, silences=[(1.0, 1.2)])
    assert cuts[1][0] == pytest.approx(1.1)


def test_fuzzy_alignment_survives_misheard_words():
    # line 2 starts with "ขาว"; whisper misheard line 1's last word and spelled numbers differently
    lines = ["กินข้าวเจ็ดโมง", "ขาวดำ"]
    words = [Word("กินข้าว", 0.0, 0.8), Word("7โมง", 0.9, 1.5), Word("ขาว", 2.0, 2.4), Word("ดำ", 2.5, 2.9)]
    cuts = scene_cuts(lines, words, take_sec=3.0)
    assert cuts[1][0] == pytest.approx(1.75)
