import json
import sys
from pathlib import Path
from types import SimpleNamespace

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / 'scripts'))
import make


def test_draft_build_preserves_final_video_and_postkit(tmp_path, monkeypatch):
    episode = {'id': 'ep03', 'voice': 'Iapetus', 'scenes': []}
    (tmp_path / 'episodes').mkdir()
    (tmp_path / 'episodes/ep03.json').write_text(json.dumps(episode))
    final = tmp_path / 'out/final/ep03'
    final.mkdir(parents=True)
    (final / 'video.mp4').write_bytes(b'original final')
    (final / 'post.txt').write_text('original post')
    monkeypatch.setattr(make, 'ROOT', tmp_path)
    monkeypatch.setattr(sys, 'argv', ['make.py', 'ep03', '--draft'])
    monkeypatch.setattr(make, 'get_engine', lambda _: SimpleNamespace(name='test', whole_take=True))
    monkeypatch.setattr(make, 'needs_voicing', lambda *a: False)
    monkeypatch.setattr(make, 'narrate', lambda *a, **kw: {})
    monkeypatch.setattr(make.retention, 'check', lambda *a: [])
    monkeypatch.setattr(make.sfx, 'ensure', lambda *a: None)
    monkeypatch.setattr(make, 'render', lambda *a: None)
    monkeypatch.setattr(make, 'master', lambda raw, version: version.write_bytes(b'new draft'))
    monkeypatch.setattr(make.postkit, 'remotion_still', lambda *a: None)
    def kit(folder, *args):
        (folder / 'post.txt').write_text('new draft post')
        return folder / 'post.txt'
    monkeypatch.setattr(make.postkit, 'write', kit)
    make.main()
    assert (final / 'video.mp4').read_bytes() == b'original final'
    assert (final / 'post.txt').read_text() == 'original post'
    assert (tmp_path / 'out/drafts/ep03/video.mp4').read_bytes() == b'new draft'
    assert (tmp_path / 'out/drafts/ep03/post.txt').read_text() == 'new draft post'
