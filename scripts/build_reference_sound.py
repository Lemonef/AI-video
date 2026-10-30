"""Original scratch narration and procedural foley for the private reconstruction.

No source audio is copied. This is a timing/texture study, not a voice match claim.
Uses the repository's existing free Edge dependency. Generated media remains ignored.
"""
import argparse
import hashlib
import asyncio
import json
from pathlib import Path
import subprocess
import wave

import numpy as np

FPS, SR, DURATION = 30, 48000, 93.3
LINES = [
 (0,3.7,'Imagine the outbreak begins during your last shift at the supermarket.'),
 (3.7,5.766667,'You are the only worker still here.'),
 (5.766667,7.6,'It is nearly closing time.'),
 (7.6,9.3,'Only eight minutes left.'),
 (9.3,10.466667,'The alarm.'),
 (10.466667,11,'Now.'),
 (11,15,'An outbreak. Keep the doors locked. Stay off the streets.'),
 (15,17.9,'Do not step outside.'),
 (17.9,19.866667,'Look past the glass.'),
 (19.866667,22.466667,'People scatter between the cars.'),
 (22.466667,24.866667,'Something follows without slowing.'),
 (24.866667,26.3,'Your keys.'),
 (26.3,28.4,'Home feels safer.'),
 (28.4,32.366667,'Stop. Every road out is already blocked.'),
 (32.366667,34.5,'Your car becomes a cage.'),
 (34.5,47.366667,'Think about the building instead. Shelves of food. Running water. A solid shutter. You have a shelter, if you close it before they reach the entrance.'),
 (47.366667,49.3,'Your front wall is glass.'),
 (49.3,50.866667,'Every light is on.'),
 (50.866667,52.166667,'They see you.'),
 (52.166667,53.5,'The switch.'),
 (53.5,56.4,'It drops, then locks above the floor.'),
 (56.4,59.966667,'The motor stopped. But the emergency chain still works.'),
 (59.966667,62.866667,'Pull. Keep pulling.'),
 (62.866667,65.4,'Fingers catch the edge, then release.'),
 (65.4,66.733333,'Last pull.'),
 (66.733333,67.9,'Shut.'),
 (67.9,71.7,'First rule: when you are visible, they follow. Kill the lights.'),
 (71.7,75.166667,'In darkness, you count your supplies.'),
 (75.166667,77.6,'Food. Water. Torch.'),
 (77.6,80.8,'You finally allow yourself a breath.'),
 (80.8,83.9,'The guard left a radio by the register.'),
 (83.9,85.9,'Its red lamp blinks.'),
 (85.9,90.133333,'A voice asks: why did you switch off the lights?'),
]


def decode(path):
    p = subprocess.run(['ffmpeg','-v','error','-i',str(path),'-ac','1','-ar',str(SR),
                        '-f','f32le','-'], check=True,capture_output=True)
    return np.frombuffer(p.stdout,np.float32)


def main():
    p=argparse.ArgumentParser()
    p.add_argument('--out',type=Path,required=True)
    p.add_argument('--voice',default='en-US-ChristopherNeural')
    p.add_argument('--foley-only',action='store_true')
    args=p.parse_args();args.out.mkdir(parents=True,exist_ok=True)
    rng=np.random.default_rng(1942)
    stereo=np.zeros((round(DURATION*SR),2),np.float32)
    events=[]

    def add(start,data,gain=.1,pan=0,name=''):
        idx=round(start*SR);data=np.asarray(data,dtype=np.float32)
        length=min(len(data),len(stereo)-idx)
        if length<=0:return
        stereo[idx:idx+length,0]+=data[:length]*gain*np.sqrt((1-pan)/2)
        stereo[idx:idx+length,1]+=data[:length]*gain*np.sqrt((1+pan)/2)
        if name:events.append({'start':start,'duration':len(data)/SR,'name':name})

    def tone(duration,hz):
        t=np.arange(round(duration*SR))/SR
        return np.sin(2*np.pi*hz*t)

    def noise(duration):return rng.normal(0,1,round(duration*SR)).astype(np.float32)
    def click(start,name,gain=.1):
        t=np.arange(round(.12*SR))/SR
        add(start,(rng.normal(0,.5,len(t))+np.sin(2*np.pi*420*t))*np.exp(-t*75),gain,name=name)

    # Beds change with location and drop after the power cut.
    t=np.arange(round(DURATION*SR))/SR
    drone=(np.sin(2*np.pi*55*t)+.35*np.sin(2*np.pi*82.4*t)+.12*np.sin(2*np.pi*110.2*t))
    envelope=np.interp(t,[0,9,11,47,53,67,71.7,72.8,80,85,90,93.3],
                      [.006,.006,.012,.018,.025,.012,.008,.002,.003,.009,.002,0])
    add(0,drone*envelope,1,name='original tension bed')
    hum=(tone(68.8,60)+.12*tone(68.8,120))*.006
    add(3.9,hum,name='store electrical ambience',gain=1)
    for sec in np.arange(.3,3.4,.39):
        tt=np.arange(round(.09*SR))/SR
        add(float(sec),np.sin(2*np.pi*4100*tt)*np.sin(np.pi*tt/.09)**2,.007,pan=-.4,name='outside insect')
    for sec in [10.03,10.31,10.59]:
        tt=np.arange(round(.18*SR))/SR
        add(sec,(np.sin(2*np.pi*880*tt)+.5*np.sin(2*np.pi*1320*tt))*np.sin(np.pi*tt/.18)**2,.075,name='phone alert')
    for sec in [18.2,18.6,26.8,27.2]:click(sec,'foot contact',.035)
    tt=np.arange(round(6*SR))/SR
    add(19.8,np.sin(2*np.pi*(560*tt-150/(2*np.pi)*np.cos(2*np.pi*.6*tt)))*np.sin(np.pi*tt/6)**2,.013,pan=.4,name='distant siren')
    click(52.72,'shutter button contact',.1)
    tt=np.arange(round(1.10*SR))/SR
    motor=(np.sin(2*np.pi*115*tt)+.25*np.sin(2*np.pi*230*tt)+rng.normal(0,.1,len(tt)))*np.minimum(tt*18,1)
    add(53.54,motor,.044,name='shutter motor until jam')
    click(54.64,'motor jam',.15)
    for sec in [60.10,60.48,60.86,61.24,61.62,62.0,62.38,65.63]:
        tt=np.arange(round(.26*SR))/SR
        scrape=noise(.26)*np.sin(np.pi*tt/.26)**2
        add(sec,scrape,.028,pan=-.2,name='manual chain stroke')
        click(sec+.17,'chain link contact',.035)
    tt=np.arange(round(.65*SR))/SR
    add(66.79,(noise(.65)*.25+np.sin(2*np.pi*73*tt))*np.exp(-tt*9),.19,name='shutter floor impact')
    click(72.75,'power switch',.08)
    for sec in [81.1,86.04,87.05,89.48]:
        tt=np.arange(round(.23*SR))/SR
        static=noise(.23);static=np.diff(static,prepend=0)*np.sin(np.pi*tt/.23)**2
        add(sec,static,.029,pan=.2,name='radio static burst')
    captions=[];voice_checks=[]
    if not args.foley_only:
        import edge_tts
        async def voices():
            for i,(start,end,text) in enumerate(LINES):
                asset=args.out/f'voice-{i:02}.mp3';timing=args.out/f'voice-{i:02}.json'
                cache=args.out/f'voice-{i:02}.key'
                key=hashlib.sha256((args.voice+'|+8%|'+text).encode()).hexdigest()
                if not asset.exists() or not timing.exists() or not cache.exists() or cache.read_text()!=key:
                    comm=edge_tts.Communicate(text,args.voice,rate='+8%',boundary='WordBoundary')
                    audio=bytearray();words=[]
                    async for chunk in comm.stream():
                        if chunk['type']=='audio':audio.extend(chunk['data'])
                        elif chunk['type']=='WordBoundary':words.append({'text':chunk['text'],'start':chunk['offset']/1e7,'end':(chunk['offset']+chunk['duration'])/1e7})
                    asset.write_bytes(audio);timing.write_text(json.dumps(words),encoding='utf-8');cache.write_text(key)
                pcm=decode(asset)
                # Measure voiced support; Edge adds leading/trailing silence to every short request.
                active=np.flatnonzero(np.abs(pcm)>.003)
                first=max(0,int(active[0])-.025*SR) if len(active) else 0
                last=min(len(pcm),int(active[-1])+.07*SR) if len(active) else len(pcm)
                trim_start,trim_end=first/SR,last/SR
                duration=trim_end-trim_start;available=end-start-.04
                speed=max(.95,duration/available)
                # Do not force a whole long sentence into a half-second reaction insert.
                if speed>1.45:
                    voice_checks.append({'line':i,'status':'omitted: cannot fit naturally','speed':speed});continue
                fitted=args.out/f'fitted-{i:02}.wav'
                filters=f'atrim=start={trim_start:.8f}:end={trim_end:.8f},asetpts=PTS-STARTPTS,atempo={speed:.8f}'
                if i==32:filters+=',highpass=f=350,lowpass=f=2900'
                subprocess.run(['ffmpeg','-y','-v','error','-i',str(asset),'-af',filters,'-ar',str(SR),str(fitted)],check=True)
                add(start,decode(fitted),.74,name=f'original scratch narration {i}')
                words=json.loads(timing.read_text())
                for k in range(0,len(words),3):
                    group=words[k:k+3]
                    captions.append({'start':round((start+max(0,group[0]['start']-trim_start)/speed)*FPS),
                                     'end':round((start+max(0,group[-1]['end']-trim_start)/speed)*FPS),
                                     'text':' '.join(w['text'] for w in group).upper()})
                voice_checks.append({'line':i,'status':'fit','speed':round(speed,3),'end':start+len(decode(fitted))/SR})
                print(f'voice {i+1}/{len(LINES)} ready',flush=True)
        asyncio.run(voices())
    peak=float(np.max(np.abs(stereo)))
    if peak>.94:stereo*=.94/peak
    with wave.open(str(args.out/'study-sound.wav'),'wb') as f:
        f.setnchannels(2);f.setsampwidth(2);f.setframerate(SR)
        f.writeframes((stereo*32767).astype('<i2').tobytes())
    (args.out/'sound-review.json').write_text(json.dumps({'duration':DURATION,'sample_rate':SR,
        'original_audio':True,'source_audio_reused':False,'events':events,'voice_checks':voice_checks,
        'captions':captions,'listening_signoff':False},indent=2),encoding='utf-8')
    print(f'Built original sound: {len(events)} events, {len(captions)} caption chunks; peak {peak:.3f}')

if __name__=='__main__':main()
