"""Word-level timings for one story part's VO beats (Groq Whisper, free tier).

Per-part builds cut shots on the words the viewer hears, not on equal slices
(Zen 2026-11-15, build each part like the 10 s proof). Each beat wav in vo/
starts at that beat's timeline start, so a word's frame = beat.start +
word_time * fps. Local faster-whisper is blocked by Windows Application
Control (ctranslate2 DLL), so this calls Groq's hosted Whisper via curl.

Key: ~/.secrets/groq_api_key (never committed).
Usage: python -I tools/ink/word_times.py <ink60full dir> <part id>
Writes <ink60full dir>/words/<part id>.json: {fps, part, words:[{beat, w, f0, f1}]}.
"""
import json, os, subprocess, sys
from pathlib import Path

MODEL = 'whisper-large-v3-turbo'
URL = 'https://api.groq.com/openai/v1/audio/transcriptions'
UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'  # Cloudflare blocks default client UAs

d, pid = sys.argv[1], sys.argv[2]
key = (Path.home() / '.secrets' / 'groq_api_key').read_text(encoding='utf-8').strip()
t = json.load(open(os.path.join(d, 'timeline_full.json'), encoding='utf-8'))
fps = t['fps']
part = [p for p in json.load(open(os.path.join(d, 'parts.json'), encoding='utf-8'))['parts'] if p['id'] == pid][0]
ids = [b['id'] for b in t['beats']]
beats = t['beats'][ids.index(part['first']):ids.index(part['last']) + 1]


def transcribe(wav):
    r = subprocess.run(['curl', '-s', '-A', UA, URL, '-H', 'Authorization: Bearer ' + key,
                        '-F', 'file=@' + wav, '--form-string', 'model=' + MODEL,
                        '--form-string', 'language=en', '--form-string', 'response_format=verbose_json',
                        '--form-string', 'timestamp_granularities[]=word'],
                       capture_output=True, text=True, check=True)
    j = json.loads(r.stdout)
    if 'words' not in j:
        raise SystemExit('no words for %s: %s' % (wav, r.stdout[:300]))
    return j['words']


out = []
for b in beats:
    for w in transcribe(os.path.join(d, 'vo', b['id'] + '.wav')):
        out.append({'beat': b['id'], 'w': w['word'].strip(),
                    'f0': b['start'] + round(w['start'] * fps), 'f1': b['start'] + round(w['end'] * fps)})
os.makedirs(os.path.join(d, 'words'), exist_ok=True)
json.dump({'fps': fps, 'part': pid, 'words': out},
          open(os.path.join(d, 'words', pid + '.json'), 'w', encoding='utf-8'), indent=1)
for x in out:
    print(x['beat'], x['f0'], x['f1'], x['w'])
