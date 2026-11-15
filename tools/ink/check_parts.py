"""Check parts.json covers every VO beat once, in order; print part durations."""
import json, sys
p = sys.argv[1]
t = json.load(open(p + '/timeline_full.json', encoding='utf-8'))
parts = json.load(open(p + '/parts.json', encoding='utf-8'))['parts']
ids = [b['id'] for b in t['beats']]
pos = {b: i for i, b in enumerate(ids)}
fps = t['fps']
nxt = 0
for q in parts:
    a, z = pos[q['first']], pos[q['last']]
    assert a == nxt and z >= a, (q, a, nxt)
    bs = t['beats'][a:z + 1]
    s, e = bs[0]['start'], bs[-1]['start'] + bs[-1]['dur']
    print(f"{q['id']} {s/fps:6.1f}-{e/fps:6.1f} {(e-s)/fps:5.1f}s {z-a+1:2d} beats  {q['name']}")
    nxt = z + 1
assert nxt == len(ids), (nxt, len(ids))
print('OK', len(parts), 'parts cover', len(ids), 'beats')
