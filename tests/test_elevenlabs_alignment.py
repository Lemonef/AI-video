import sys
from pathlib import Path
from types import SimpleNamespace

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "scripts"))
from pipeline.narrate import _take_keys
from pipeline.tts.elevenlabs_engine import alignment_words


def test_provider_alignment_preserves_thai_marks_and_retimes_without_translation():
    words = alignment_words({"characters": ["จ", "๊", "า", "บ", " "],
        "character_start_times_seconds": [0, .1, .1, .2, .3],
        "character_end_times_seconds": [.1, .1, .2, .3, .4]}, 2)
    assert "".join(w.text for w in words) == "จ๊าบ"
    assert words[-1].end == .15


def test_broken_provider_alignment_is_rejected_before_captioning():
    with pytest.raises(ValueError):
        alignment_words({"characters": ["a"], "character_start_times_seconds": [],
                         "character_end_times_seconds": [.2]})


def test_model_or_voice_setting_changes_invalidate_only_new_provider_cache():
    ep = {"voice": "male", "voiceModel": "eleven_v3", "scenes": [{"say": "จ๊าบ"}]}
    engine = SimpleNamespace(name="elevenlabs")
    key = _take_keys(ep, engine)[2]
    assert _take_keys({**ep, "voiceModel": "eleven_v4"}, engine)[2] != key
    assert _take_keys({**ep, "voiceSettings": {"stability": .5}}, engine)[2] != key


def test_english_direction_cannot_accidentally_be_read_by_elevenlabs():
    with pytest.raises(ValueError, match="inline audio tags"):
        _take_keys({"voice": "male", "narrationDirection": "Read naturally",
                    "scenes": [{"say": "จ๊าบ"}]}, SimpleNamespace(name="elevenlabs"))
