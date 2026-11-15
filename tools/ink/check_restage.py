"""Gate for restage-variety: focus cams present, in range, scene count unchanged."""
import json
from pathlib import Path

d = json.load(open(Path(__file__).resolve().parents[2] / 'videos/pastly-life/01-eiffel-ink/assets/ink60full/directed_full.json', encoding='utf-8'))['shots']
sc = [s for b in d.values() for s in b if s.get('k') == 'scene']
f = [s for s in sc if (s.get('cam') or {}).get('focus')]
assert len(sc) == 193, len(sc)
assert 40 <= len(f) <= 110, len(f)
for s in f:
    c = s['cam']
    assert 0 <= c['focus']['x'] <= 1 and 0 <= c['focus']['y'] <= 1 and 1.3 <= c['zoom'] <= 2.6, c
print('OK', len(f))
