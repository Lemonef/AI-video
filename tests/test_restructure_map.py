import importlib.util
from pathlib import Path

spec = importlib.util.spec_from_file_location("rm", Path(__file__).parent.parent / "tools" / "restructure_map.py")
rm = importlib.util.module_from_spec(spec)
spec.loader.exec_module(rm)


def test_scripts_to_tools():
    assert rm.destination("scripts/make.py")[0] == "tools/make.py"


def test_legacy_and_engine():
    assert rm.destination("src/v5/Forest.tsx")[0] == "engine/legacy/v5/Forest.tsx"
    assert rm.destination("src/Root.tsx")[0] == "engine/Root.tsx"


def test_shared_fonts_not_episode():
    assert rm.destination("public/fonts/a.ttf")[0] == "engine/shared/fonts/a.ttf"


def test_episode_assets():
    assert rm.destination("public/lift01/x.png")[0] == "videos/unsorted/lift01/assets/lift01/x.png"
    assert rm.destination("episodes/ep02.json")[0] == "videos/unsorted/ep02/script/ep02.json"


def test_out_without_episode_is_parked_not_dropped():
    assert rm.destination("out/drafts/frame_001.png")[0].startswith("_archive/out-unmapped/")
