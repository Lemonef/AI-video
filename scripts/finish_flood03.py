"""Join the reviewed seated ending, master a new version, and prepare QA."""
import os
import json
from pathlib import Path
import shutil
import subprocess
import sys

ROOT=Path(__file__).resolve().parents[1]
os.environ['PATH']=str(ROOT/'.build/flood03-tools')+os.pathsep+os.environ['PATH']
sys.path.insert(0,str(ROOT/'scripts'))
from pipeline import versions
from pipeline.master import master

def main():
    raw=ROOT/'.build/flood03.raw.mp4'
    patches=[ROOT/'.build'/name for name in ['flood03-decoy.mp4','flood03-signal.mp4','flood03-ending-fixed.mp4','flood03-caught.mp4']]
    joined=ROOT/'.build/flood03-seated.raw.mp4'
    inputs=['-i',str(raw)]
    for patch in patches: inputs += ['-i',str(patch)]
    subprocess.run(['ffmpeg','-v','error','-y',*inputs,
        '-filter_complex','[0:v]trim=end_frame=406,setpts=PTS-STARTPTS[a];[1:v]setpts=PTS-STARTPTS[b];[0:v]trim=start_frame=572:end_frame=1343,setpts=PTS-STARTPTS[c];[2:v]setpts=PTS-STARTPTS[d];[0:v]trim=start_frame=1472:end_frame=1580,setpts=PTS-STARTPTS[e];[4:v]setpts=PTS-STARTPTS[f];[0:v]trim=start_frame=1786:end_frame=1944,setpts=PTS-STARTPTS[g];[3:v]setpts=PTS-STARTPTS[h];[a][b][c][d][e][f][g][h]concat=n=8:v=1:a=0[v]',
        '-map','[v]','-map','0:a','-c:v','libx264','-preset','fast','-crf','14',
        '-c:a','copy','-t','74','-movflags','+faststart',str(joined)],check=True)
    version=versions.new_version(ROOT,'flood03')
    meter=subprocess.run(['ffmpeg','-hide_banner','-i',str(joined),'-af','loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json','-f','null','-'],capture_output=True,text=True,check=True).stderr
    m=json.loads(meter[meter.rfind('{'):meter.rfind('}')+1])
    filt=f"loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true,apad=whole_dur=74,atrim=duration=74"
    subprocess.run(['ffmpeg','-v','error','-y','-i',str(joined),'-af',filt,'-c:v','copy','-c:a','aac','-b:a','192k','-ar','48000','-t','74','-movflags','+faststart',str(version)],check=True)
    final=ROOT/'out/final/bangkok-flood/ep03/video.mp4'
    shutil.copy2(version,final)
    print(version)

if __name__=='__main__': main()

