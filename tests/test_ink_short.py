"""Contract for tools/ink/make_short.py (brief docs/briefs/ink-short-s01.md). Written by the planner BEFORE
the build and protected. A Short is a list of ep01 timeline beats played back to back: each beat keeps its
timeline window (stretched so its last word is never cut), and its caption words move with it, grouped
into short caption groups that never cross a cut or a sentence end."""
import importlib.util
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SPEC = ROOT / 'videos/pastly-life/01-eiffel-ink/shorts/s01-sold-twice/spec.json'
ASSETS = ROOT / 'videos/pastly-life/01-eiffel-ink/assets/ink60full'
FPS = 30
SENTENCE_END = ('.', '?', '!')


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


def _expected_len(beat, words):
    last = max(w['f1'] for w in words if w['beat'] == beat['id'])
    return max(beat['dur'], last - beat['start'])


def test_clips_are_beat_windows_back_to_back():
    spec, beats, words = _src()
    out = _tool().build(SPEC)
    assert [c['beat'] for c in out['clips']] == spec['beats']
    dst = 0
    for c in out['clips']:
        b = beats[c['beat']]
        assert (c['src0'], c['len'], c['dst0']) == (b['start'], _expected_len(b, words), dst)
        dst += c['len']
    end = round(spec['end_card']['seconds'] * FPS)
    assert out['endCard']['f0'] == dst and out['endCard']['f1'] == dst + end
    assert out['totalFrames'] == dst + end and out['fps'] == FPS


def test_caption_words_follow_their_clip():
    spec, beats, words = _src()
    out = _tool().build(SPEC)
    clip = {c['beat']: c for c in out['clips']}
    flat = [(g, w) for g in out['captions'] for w in g['words']]
    assert len(flat) == len(words)
    for src, (g, w) in zip(words, flat):
        c = clip[src['beat']]
        shift = c['dst0'] - c['src0']
        assert (w['w'], w['f0'], w['f1']) == (src['w'], src['f0'] + shift, src['f1'] + shift)
        assert c['dst0'] <= w['f0'] < w['f1'] <= c['dst0'] + c['len'], 'speech must fit inside its clip'
        assert g['beat'] == src['beat']


def test_caption_groups_respect_size_cuts_and_sentences():
    spec, _, _ = _src()
    cap = spec['captions']
    out = _tool().build(SPEC)
    groups = out['captions']
    for i, g in enumerate(groups):
        ws = g['words']
        assert 1 <= len(ws) <= cap['max_words']
        for w in ws[:-1]:
            assert not w['w'].endswith(SENTENCE_END), f'sentence end inside a group: {w["w"]}'
        # f1 can fall before the last word's f1: the aligner overlaps words, and the next group wins
        assert g['f0'] == ws[0]['f0'] and g['f1'] > g['f0']
        nxt = groups[i + 1] if i + 1 < len(groups) else None
        full = nxt is not None and len(ws) == cap['max_words']
        if nxt is not None and nxt['beat'] == g['beat'] and nxt['words'][0]['f0'] - ws[-1]['f1'] < cap['hold_gap_frames']:
            assert g['f1'] == nxt['f0'], 'short gap inside a beat: hold the group until the next one'
        else:
            assert g['f1'] == ws[-1]['f1'], 'long gap or a cut: hide the group when its last word ends'
        if full or nxt is None:
            continue
        # a group ends early (under max_words) only at a cut or a sentence end
        assert nxt['beat'] != g['beat'] or ws[-1]['w'].endswith(SENTENCE_END)


def test_passthrough_and_written_file_matches():
    spec, _, _ = _src()
    out = _tool().build(SPEC)
    assert out['id'] == spec['id'] and out['hook'] == spec['hook']
    assert out['endCard']['lines'] == spec['end_card']['lines']
    assert out['vo'] == spec['vo'] and out['music'] == spec['music']
    written = json.loads((ROOT / 'engine/ink/parts/shorts/ep01-s01.json').read_text(encoding='utf-8'))
    assert written == out, 'committed data is stale: re-run python tools/ink/make_short.py <spec>'
