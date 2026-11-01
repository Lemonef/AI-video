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


def test_reviewed_starts_override_bad_fuzzy_cuts_without_revoicing(tmp_path, monkeypatch):
    import json
    from types import SimpleNamespace
    from pipeline import narrate as module
    from pipeline.tts.word import Word
    ep = {'id': 'review', 'voice': 'Iapetus', 'tempo': 1.0,
          'scenes': [{'id': 'a', 'say': 'hello'}, {'id': 'b', 'say': 'world'}]}
    engine = SimpleNamespace(name='gemini', whole_take=True)
    _, _, voice_key = module._take_keys(ep, engine)
    key = module._key(voice_key, '1.0')
    cache = {'_take': {'voice_key': voice_key, 'key': key, 'tempo': 1.0,
                      'words': [vars(Word('hello', 0, 1)), vars(Word('world', 2, 3))],
                      'reviewed_line_starts': [0, 2]}}
    (tmp_path / 'take.raw.mp3').touch()
    (tmp_path / 'take.mp3').touch()
    monkeypatch.setattr(module.media, 'duration', lambda _: 4)
    monkeypatch.setattr(module.media, 'silences', lambda _: [(1.6, 2)])
    cut_pairs = []
    monkeypatch.setattr(module.media, 'cut', lambda source, a, b, dest: cut_pairs.append((a, b)))
    monkeypatch.setattr(module, 'scene_cuts', lambda *args: [(0, 0), (0, 4)])
    timing_path = tmp_path / 'timing.json'
    module._narrate_take(ep, engine, tmp_path, timing_path, cache)
    assert cut_pairs == [(0, 1.8), (1.8, 4)]
    assert json.loads(timing_path.read_text(encoding='utf-8'))['_take']['reviewed_line_starts'] == [0, 2]
