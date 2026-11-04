"""out/final/<NN-slug>/: publishing must land in the existing numbered series folder."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "scripts"))
import make  # noqa: E402


def test_reuses_numbered_folder(tmp_path):
    for name in ("01-ghost", "02-bangkok-flood", "03-lift-ex"):
        (tmp_path / name).mkdir()
    assert make.story_folder(tmp_path, "lift-ex") == "03-lift-ex"
    assert make.story_folder(tmp_path, "ghost") == "01-ghost"


def test_new_series_gets_next_number(tmp_path):
    (tmp_path / "03-lift-ex").mkdir()
    assert make.story_folder(tmp_path, "wishes") == "04-wishes"


def test_empty_root(tmp_path):
    assert make.story_folder(tmp_path / "missing", "ghost") == "01-ghost"
