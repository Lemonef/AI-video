"""Measure source speech and authored drone level, before common mastering."""
import json
import subprocess
from pathlib import Path
import numpy as np

ROOT=Path(__file__).resolve().parents[1]
FF=ROOT/'.build/flood03-tools/ffmpeg.exe'
def decode(path):
    return np.frombuffer(subprocess.run([str(FF),'-v','error','-i',str(path),'-f','f32le','-ac','1','-ar','16000','-'],capture_output=True,check=True).stdout,dtype=np.float32)
def db(samples):
    return float(20*np.log10(max(1e-12,np.sqrt(np.mean(samples*samples)))))
def main():
    timing=json.loads((ROOT/'public/flood03/timing.json').read_text(encoding='utf-8'))
    bed=decode(ROOT/'public/sfx/real/dark_drone.mp3')
    rows=[]
    for name in ['count','ring','chair']:
        voice=decode(ROOT/f'public/flood03/{name}.mp3')
        mask=np.zeros(len(voice),bool)
        for word in timing[name]['words']:
            mask[max(0,int(word['start']*16000)):min(len(voice),int(word['end']*16000))]=True
        speech=db(voice[mask]); ambient=db(bed*.3*.18*.12)
        rows.append(dict(scene=name,speech_rms_dbfs=speech,drone_speech_rms_dbfs=ambient,margin_db=speech-ambient))
    assert min(row['margin_db'] for row in rows)>=18
    out=ROOT/'out/drafts/flood03-review/speech-bed.json'
    out.write_text(json.dumps(dict(method='Source RMS during ASR speech windows; authored full duck gain, before common master. All other scenes have zero drone; no rain bed.',scenes=rows),indent=2),encoding='utf-8')
    print(rows)
if __name__=='__main__':main()
