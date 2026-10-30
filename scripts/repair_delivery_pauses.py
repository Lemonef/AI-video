"""Tighten measured quiet intervals with one shared audio/video edit clock.

Input gaps must come from an isolated voice stem aligned to the source video,
not the mixed soundtrack. Manual protected ranges preserve intended story beats.
This is a delivery edit; keep the source and JSON plan for reproducibility.
"""
import argparse
import hashlib
import json
import math
import subprocess
from pathlib import Path


def plan_cuts(gaps, fps, total_frames, protected=()):
    merged = []
    for a, b in sorted(gaps):
        if b <= a:
            continue
        if merged and a - merged[-1][1] < .02:
            merged[-1][1] = max(b, merged[-1][1])
        else:
            merged.append([a,b])
    cuts = []
    for a, b in merged:
        duration = b-a
        keep = max(.10, min(.15, duration*.4))
        for lo, hi, minimum in protected:
            if a < hi and b > lo:
                keep = max(keep, minimum)
        frames = max(0, math.floor((duration-keep)*fps))
        lo = max(1, math.ceil((a+.04)*fps))
        hi = min(total_frames-1, math.floor((b-.04)*fps))
        frames = min(frames, max(0,hi-lo))
        if not frames:
            continue
        start = max(lo, min(hi-frames, round((a+b)*fps/2)-frames//2))
        cuts.append([start,start+frames])
    return cuts


def balanced_sum(terms):
    if not terms:
        return '0'
    while len(terms)>1:
        terms=['('+'+'.join(terms[i:i+2])+')' for i in range(0,len(terms),2)]
    return terms[0]


def main():
    ap=argparse.ArgumentParser()
    ap.add_argument('--source',type=Path,required=True)
    ap.add_argument('--measurement',type=Path,required=True)
    ap.add_argument('--out',type=Path,required=True)
    ap.add_argument('--speed',type=float,default=1)
    args=ap.parse_args()
    if args.speed<=0:
        raise ValueError('speed must be positive')
    probe=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_entries','stream=codec_type,nb_frames,r_frame_rate','-of','json',str(args.source)]))
    stream=next(s for s in probe['streams'] if s['codec_type']=='video')
    num,den=map(int,stream['r_frame_rate'].split('/'));fps=num/den;total=int(stream['nb_frames'])
    data=json.loads(args.measurement.read_text())
    source_hash=hashlib.sha256(args.source.read_bytes()).hexdigest()
    if data.get('source_sha256') and data['source_sha256']!=source_hash:
        raise ValueError('measurement belongs to a different source video')
    cuts=plan_cuts(data['safe_gaps'],fps,total,data.get('protected',[]))
    keep=[];cursor=0
    for a,b in cuts:
        if a>cursor:keep.append([cursor,a])
        cursor=b
    if cursor<total:keep.append([cursor,total])
    removed=sum(b-a for a,b in cuts)
    plan={'source_sha256':source_hash,'source':str(args.source),'fps':fps,'source_frames':total,'speed':args.speed,
          'cut_frame_ranges':cuts,'keep_frame_ranges':keep,'removed_quiet_seconds':removed/fps,
          'expected_seconds':(total-removed)/fps/args.speed,'protected':data.get('protected',[]),
          'note':'Only measured quiet centers removed; preserve source for review. Listening acceptance separate.'}
    args.out.parent.mkdir(parents=True,exist_ok=True)
    args.out.with_suffix('.plan.json').write_text(json.dumps(plan,indent=2))
    select='not('+balanced_sum([f'(gte(n,{a})*lt(n,{b}))' for a,b in cuts])+')'
    graph=[f"[0:v]select='{select}',setpts=N/({fps}*{args.speed}*TB)[v]",
           f"[0:a]asplit={len(keep)}"+''.join(f'[s{i}]' for i in range(len(keep)))]
    for i,(a,b) in enumerate(keep):
        dur=(b-a)/fps
        graph.append(f'[s{i}]atrim=start={a/fps:.9f}:end={b/fps:.9f},asetpts=PTS-STARTPTS,afade=t=in:d=0.004,afade=t=out:st={max(0,dur-.004):.9f}:d=0.004[a{i}]')
    graph.append(''.join(f'[a{i}]' for i in range(len(keep)))+f'concat=n={len(keep)}:v=0:a=1,atempo={args.speed}[a]')
    graph_path=args.out.with_suffix('.filters.txt');graph_path.write_text(';'.join(graph))
    subprocess.run(['ffmpeg','-y','-v','error','-i',str(args.source),'-filter_complex',';'.join(graph),
                    '-map','[v]','-map','[a]','-r',str(fps),'-c:v','libx264','-preset','veryfast','-crf','14',
                    '-c:a','aac','-b:a','192k','-ar','48000','-movflags','+faststart',str(args.out)],check=True)
    print(json.dumps({k:v for k,v in plan.items() if 'ranges' not in k}))

if __name__=='__main__':
    main()
