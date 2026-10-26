import sys

import pytest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "scripts"))

from pipeline.align import scene_cuts, spoken_len, words_in  # noqa: E402
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
