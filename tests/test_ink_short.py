"""Contract for tools/ink/make_short.py (brief docs/briefs/ink-short-s01.md). Written by the planner BEFORE
the build and protected. A Short is a list of ep01 timeline beats played back to back: each beat keeps its
full timeline window, and its caption words move with it."""
import importlib.util
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SPEC = ROOT / 'videos/pastly-life/01-eiffel-ink/shorts/s01-sold-twice/spec.json'
ASSETS = ROOT / 'videos/pastly-life/01-eiffel-ink/assets/ink60full'
FPS = 30


def _tool():
    spec = importlib.util.spec_from_file_location('make_short', ROOT / 'tools/ink/make_short.py')
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def _src():
    spec = json.loads(SPEC.read_text(encoding='utf-8'))
    beats = {b['id']: b for b in json.loads((ASSETS / 'timeline_full.json').read_text(encoding='utf-8'))['beats']}
    words = [w for p in sorted((ASSETS / 'words').glob('*.json'))
             for w in json.loads(p.read_text(encoding='utf-8'))['words'] if w['beat'] in spec['beats']]
    return spec, beats, words


def test_clips_are_beat_windows_back_to_back():
    spec, beats, _ = _src()
    out = _tool().build(SPEC)
    assert [c['beat'] for c in out['clips']] == spec['beats']
    dst = 0
    for c in out['clips']:
        b = beats[c['beat']]
        assert (c['src0'], c['len'], c['dst0']) == (b['start'], b['dur'], dst)
        dst += c['len']
    end = round(spec['end_card']['seconds'] * FPS)
    assert out['endCard']['f0'] == dst and out['endCard']['f1'] == dst + end
    assert out['totalFrames'] == dst + end and out['fps'] == FPS


def test_words_follow_their_clip():
    spec, beats, words = _src()
    out = _tool().build(SPEC)
    clip = {c['beat']: c for c in out['clips']}
    assert len(out['words']) == len(words)
    for src, w in zip(words, out['words']):
        c = clip[src['beat']]
        shift = c['dst0'] - c['src0']
        assert (w['w'], w['f0'], w['f1']) == (src['w'], src['f0'] + shift, src['f1'] + shift)
        assert c['dst0'] <= w['f0'] < w['f1'] <= c['dst0'] + c['len'] + 1


def test_passthrough_and_written_file_matches():
    spec, _, _ = _src()
    out = _tool().build(SPEC)
    assert out['id'] == spec['id'] and out['hook'] == spec['hook']
    assert out['endCard']['lines'] == spec['end_card']['lines']
    assert out['vo'] == spec['vo'] and out['music'] == spec['music']
    written = json.loads((ROOT / 'engine/ink/parts/shorts/ep01-s01.json').read_text(encoding='utf-8'))
    assert written == out, 'committed data is stale: re-run python tools/ink/make_short.py <spec>'
