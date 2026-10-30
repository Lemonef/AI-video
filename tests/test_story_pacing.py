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


def test_pause_cuts_keep_guards_inside_measured_quiet_intervals():
    from repair_delivery_pauses import plan_cuts
    gaps=[(1.0,1.6),(3.0,3.3)]
    cuts=plan_cuts(gaps,30,300)
    assert cuts
    for a,b in cuts:
        assert any(a/30>=lo+.04 and b/30<=hi-.04 for lo,hi in gaps)
        assert b>a


def test_pause_repair_preserves_protected_reveal_hold():
    from repair_delivery_pauses import plan_cuts
    cuts=plan_cuts([(1.0,1.8)],30,300,[(.9,1.9,.8)])
    assert cuts==[]


def test_pause_repair_leaves_short_breaths_alone():
    from repair_delivery_pauses import plan_cuts
    assert plan_cuts([(1.0,1.1)],30,300)==[]
