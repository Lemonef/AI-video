import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
from pipeline import postkit  # noqa: E402

VOTE_EP = {"id": "t1", "scenes": [{"id": "hook", "say": "hook"}, {"id": "end", "say": "", "type": "endcard", "a": "บอกความจริง", "b": "โกหก"}],
           "post": {"part": 1, "total": 3}}
FINALE_EP = {"id": "t3", "scenes": [{"id": "hook", "say": "hook"}, {"id": "end", "say": "", "type": "endcard"}], "post": {"part": 3, "total": 3}}


def _post(tmp_path, ep):
    postkit.write(tmp_path, ep, lambda *a: None)
    return (tmp_path / "post.txt").read_text(encoding="utf-8")


def test_vote_episode_gets_a_and_b_replies(tmp_path):
    text = _post(tmp_path, VOTE_EP)
    assert "7) COMMENT REPLIES" in text
    assert "- A: " in text and "- B: " in text and "Troll / hate" in text


def test_finale_has_no_vote_replies(tmp_path):
    text = _post(tmp_path, FINALE_EP)
    assert "- A: " not in text and "guessed the ending" in text


def test_episode_overrides_and_schedule(tmp_path):
    ep = {**VOTE_EP, "post": {**VOTE_EP["post"], "nextWhen": "พรุ่งนี้ 20:00",
                             "replies": {"A": "custom A"}}}
    text = _post(tmp_path, ep)
    assert "- A: custom A" in text and "พรุ่งนี้ 20:00 กดติดตาม" in text
