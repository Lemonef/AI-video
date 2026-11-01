"""Resume flood03 using reviewed line starts and the existing Iapetus take.

No synthesis or voice/model changes. The normal make.py checks/render/master run.
"""
import json
import os
import runpy
import sys
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
os.chdir(ROOT)
os.environ['PATH']=str(ROOT/'.build/flood03-tools')+os.pathsep+os.environ['PATH']
sys.path.insert(0,str(ROOT/'scripts'))
from pipeline import narrate
from pipeline.tts import get_engine
ep=json.loads((ROOT/'episodes/flood03.json').read_text(encoding='utf-8'))
lines,_,voice_key=narrate._take_keys(ep,get_engine('gemini'))
key=narrate._key(voice_key,str(float(ep['tempo'])))
segments=json.loads((ROOT/'.build/flood03-transcript.json').read_text(encoding='utf-8'))
words=[dict(text=w['word'].strip(),start=w['start'],end=w['end']) for s in segments for w in s['words'] if w['word'].strip()]
starts=json.loads((ROOT/'.build/flood03-line-starts.json').read_text())
assert len(starts)==len(lines) and all(b>a for a,b in zip(starts,starts[1:]))
cache=ROOT/'public/flood03/timing.json'
cache.write_text(json.dumps({'_take':dict(key=key,voice_key=voice_key,tempo=ep['tempo'],words=words,reviewed_line_starts=starts)},ensure_ascii=False),encoding='utf-8')
def reviewed_cuts(lines,words,duration,pauses):
    return narrate._cuts_from_starts(starts,duration,pauses)
narrate.scene_cuts=reviewed_cuts
sys.argv=['scripts/make.py','flood03']
runpy.run_path(str(ROOT/'scripts/make.py'),run_name='__main__')
