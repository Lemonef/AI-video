import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "scripts"))
from types import SimpleNamespace
from pipeline.narrate import _take_keys
from pipeline import retention


def test_performance_direction_invalidates_voice_cache_without_changing_alignment_lines():
    ep = {"voice": "Iapetus", "scenes": [{"say": "story one"}, {"say": "story two"}]}
    engine = SimpleNamespace(name="gemini")
    lines, old_script, old_key = _take_keys(ep, engine)
    revised = {**ep, "narrationDirection": "Read conversationally, vary the emphasis", "narrationJoin": " "}
    new_lines, script, new_key = _take_keys(revised, engine)
    assert lines == new_lines
    assert old_script == "story one\nstory two"
    assert "story one story two" in script
    assert new_key != old_key


def test_long_story_is_not_rejected_for_total_runtime():
    long_scene = {"id": "long", "say": "story", "shots": [{"at": i / 100} for i in range(100)]}
    ep = {"scenes": [{"id": "hook", "say": "hook", "title": "hook"}, long_scene]}
    findings = retention.check(ep, {"hook": {"duration": 3}, "long": {"duration": 240}})
    assert not any(f.scene == "episode" for f in findings)
    assert not any(f.level == "FAIL" for f in findings)


def test_removing_runtime_cap_keeps_visual_stagnation_checks():
    ep = {"scenes": [{"id": "hook", "say": "hook", "title": "hook"}, {"id": "static", "say": "long"}]}
    findings = retention.check(ep, {"hook": {"duration": 3}, "static": {"duration": 30}})
    assert any(f.scene == "static" and f.level == "FAIL" for f in findings)
