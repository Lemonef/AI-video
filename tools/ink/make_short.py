"""Build a Short's cut and caption data from episode timing assets."""
import json
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[2]


def build(spec_path):
    spec = json.loads((ROOT / spec_path).read_text(encoding='utf-8'))
    assets = ROOT / spec['episode_assets']
    timeline = json.loads((assets / 'timeline_full.json').read_text(encoding='utf-8'))
    beats = {b['id']: b for b in timeline['beats']}
    words = [w for p in sorted((assets / 'words').glob('*.json'))
             for w in json.loads(p.read_text(encoding='utf-8'))['words']
             if w['beat'] in spec['beats']]
    clips = []
    dst = 0
    for beat_id in spec['beats']:
        beat = beats[beat_id]
        last = max((w['f1'] for w in words if w['beat'] == beat_id), default=beat['start'])
        length = max(beat['dur'], last - beat['start'])
        clips.append(dict(beat=beat_id, src0=beat['start'], len=length, dst0=dst))
        dst += length
    by_beat = {c['beat']: c for c in clips}
    groups = []
    for word in words:
        clip = by_beat[word['beat']]
        shift = clip['dst0'] - clip['src0']
        if (not groups or groups[-1]['beat'] != word['beat']
                or len(groups[-1]['words']) >= spec['captions']['max_words']
                or groups[-1]['words'][-1]['w'].endswith(('.', '?', '!'))):
            groups.append(dict(beat=word['beat'], words=[]))
        groups[-1]['words'].append(dict(w=word['w'], f0=word['f0'] + shift, f1=word['f1'] + shift))
    for i, group in enumerate(groups):
        group['f0'] = group['words'][0]['f0']
        group['f1'] = group['words'][-1]['f1']
        nxt = groups[i + 1] if i + 1 < len(groups) else None
        if (nxt and nxt['beat'] == group['beat']
                and nxt['words'][0]['f0'] - group['f1'] < spec['captions']['hold_gap_frames']):
            group['f1'] = nxt['words'][0]['f0']
    end = dst + round(spec['end_card']['seconds'] * timeline['fps'])
    return dict(id=spec['id'], fps=timeline['fps'], hook=spec['hook'], vo=spec['vo'],
                music=spec['music'], clips=clips, captions=groups,
                endCard=dict(f0=dst, f1=end, lines=spec['end_card']['lines']), totalFrames=end)


if __name__ == '__main__':
    data = build(Path(sys.argv[1]))
    output = ROOT / 'engine/ink/parts/shorts' / (data['id'] + '.json')
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(data, indent=2) + '\n', encoding='utf-8')
