"""Extract actual scene midpoint frames and measure the final flood03 export."""
import hashlib
import json
import math
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TOOLS = ROOT / '.build/flood03-tools'
OUT = ROOT / 'out/drafts/flood03-review'

def main():
    from PIL import Image, ImageDraw
    OUT.mkdir(parents=True, exist_ok=True)
    props = json.loads((ROOT / '.build/flood03.raw.props.json').read_text(encoding='utf-8'))
    ep = props['episode']
    video = ROOT / 'out/final/02-bangkok-flood/ep03/video.mp4'
    frame = 0
    rows = []
    for i, scene in enumerate(ep['scenes']):
        frames = math.ceil(ep['timing'][scene['id']]['duration'] * 30)
        midpoint = (frame + frames // 2) / 30
        path = OUT / f"{i+1:02}-{scene['id']}.png"
        subprocess.run([str(TOOLS/'ffmpeg.exe'), '-v','error','-y','-ss',str(midpoint),'-i',str(video),'-frames:v','1',str(path)],check=True)
        rows.append(dict(scene=scene['id'],start=frame/30,end=(frame+frames)/30,midpoint=midpoint,still=str(path)))
        frame += frames
    sheet = Image.new('RGB',(5*288,3*548),'#141e28')
    draw = ImageDraw.Draw(sheet)
    for i,row in enumerate(rows):
        im=Image.open(row['still']); im.thumbnail((288,512))
        x,y=(i%5)*288,(i//5)*548
        sheet.paste(im,(x,y)); draw.text((x+8,y+518),f"{i+1:02} {row['scene']}",fill='white')
    sheet.save(OUT/'every-scene.jpg')
    action_rows=[]
    for row in rows:
        if row['scene'] not in ['decoy','chair','door','sent','end']:
            continue
        for fraction in [.15,.47,.78,.94]:
            path=OUT/f"action-{row['scene']}-{fraction:.2f}.png"
            at=row['start']+(row['end']-row['start'])*fraction
            subprocess.run([str(TOOLS/'ffmpeg.exe'),'-v','error','-y','-ss',str(at),'-i',str(video),'-frames:v','1',str(path)],check=True)
            action_rows.append((row['scene'],fraction,path))
    actions=Image.new('RGB',(4*270,5*500),'#141e28')
    adraw=ImageDraw.Draw(actions)
    for i,(scene,fraction,path) in enumerate(action_rows):
        im=Image.open(path);im.thumbnail((270,480));x,y=i%4*270,i//4*500
        actions.paste(im,(x,y));adraw.text((x+6,y+482),f'{scene} {fraction:.2f}',fill='white')
    actions.save(OUT/'action-beats.jpg')
    meter=subprocess.run([str(TOOLS/'ffmpeg.exe'),'-hide_banner','-i',str(video),'-af','loudnorm=I=-14:TP=-1:LRA=11:print_format=json','-f','null','-'],capture_output=True,text=True,check=True)
    (OUT/'loudness.txt').write_text(meter.stderr,encoding='utf-8')
    probe=subprocess.run([str(TOOLS/'ffprobe.exe'),'-v','error','-show_streams','-show_format','-of','json',str(video)],capture_output=True,text=True,check=True)
    receipt=dict(video=str(video),sha256=hashlib.sha256(video.read_bytes()).hexdigest(),scenes=rows,probe=json.loads(probe.stdout))
    (OUT/'receipt.json').write_text(json.dumps(receipt,ensure_ascii=False,indent=2),encoding='utf-8')
    print(OUT)

if __name__ == '__main__':
    main()
