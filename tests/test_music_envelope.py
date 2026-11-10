from scripts.pipeline.music import envelope


EVENTS = [{"at": 10, "action": "swell"}, {"at": 20, "action": "drop"}, {"at": 30, "action": "out"}]


def test_music_ducks_only_under_voice():
    assert round(envelope(EVENTS, 9, 5, True, 40), 3) == 0.355
    assert envelope(EVENTS, 9, 5, False, 40) == 1


def test_music_events_and_out_fade_are_ordered():
    assert envelope(EVENTS, 0, 11, False, 40) == 1.28
    assert envelope(EVENTS, 0, 21, False, 40) == 0.62
    assert envelope(EVENTS, 0, 30.625, False, 40) == 0.5
    assert envelope(EVENTS, 0, 32, False, 40) == 0
