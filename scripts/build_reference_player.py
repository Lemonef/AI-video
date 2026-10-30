"""Build a local synchronized source/reconstruction review player (no external service)."""
import argparse
import json
from pathlib import Path

PAGE='''<!doctype html><meta charset="utf-8"><title>Private animation comparison</title>
<style>
*{box-sizing:border-box}body{margin:0;background:#101618;color:#e6e4d7;font:15px system-ui,sans-serif}
header{padding:16px 22px;border-bottom:1px solid #354449}h1{font-size:20px;margin:0 0 5px}p{margin:4px 0;color:#aebcba}
main{max-width:1140px;margin:auto;padding:16px}.controls{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin:12px 0}
button,select{background:#263b40;color:#eee9d5;border:1px solid #506563;border-radius:5px;padding:9px 12px;cursor:pointer}
input[type=range]{flex:1;min-width:160px}.screens{display:flex;justify-content:center;gap:16px}figure{margin:0;max-width:46%;flex:1}
video{display:block;width:100%;max-height:73vh;background:black}figcaption{padding:7px;color:#b5c5be;font-size:13px}
.badge{color:#e9bb68}textarea{width:100%;background:#172427;color:#eee9d5;border:1px solid #4d6564;border-radius:5px;padding:10px;min-height:80px}
</style>
<header><h1>Private reference comparison</h1><p>Source left · reconstruction right · <span class="badge">__LABEL__</span></p>
<p>Match review remains open. Different words/voice and source-assisted layers are identified in the project notes.</p></header>
<main><div class="controls"><button id="play">Play both</button><button id="prev">−1 frame</button><button id="next">+1 frame</button>
<select id="shots"></select><select id="listen"><option value="study">Reconstruction audio</option><option value="source">Reference audio</option><option value="none">Mute both</option></select>
<select id="speed"><option value="1">1×</option><option value="0.5">0.5×</option><option value="0.25">0.25×</option></select></div>
<div class="screens"><figure><video id="source" src="__SOURCE__" preload="metadata" playsinline></video><figcaption>Supplied reference · local private study</figcaption></figure>
<figure><video id="study" src="__STUDY__" preload="metadata" playsinline></video><figcaption>Reconstruction · __LABEL__</figcaption></figure></div>
<div class="controls"><span id="time">0 / 2799</span><input id="seek" type="range" min="0" max="2798" step="1" value="0"></div>
<p>Space: play/pause. Left/right: one frame. Choose a shot to review its start; inspect contact, lighting and sound at slow speed.</p>
<h3>Review notes</h3><textarea id="notes" placeholder="Shot / frame — geometry, acting, light, typography, sound — next correction"></textarea>
<div class="controls"><button id="save">Download review notes</button></div></main>
<script>
const groups=__SHOTS__,fps=30;
const source=document.querySelector('#source'),study=document.querySelector('#study'),seek=document.querySelector('#seek');
const shotSelect=document.querySelector('#shots'),play=document.querySelector('#play'),notes=document.querySelector('#notes');
groups.forEach((s,i)=>{const o=document.createElement('option');o.value=s.start;o.textContent=`${i+1}. ${s.stage} · ${(s.start/fps).toFixed(2)} s`;shotSelect.append(o)});
source.muted=true;study.muted=false;
const frame=()=>Math.min(2798,Math.round(study.currentTime*fps));
function jump(n){source.pause();study.pause();play.textContent='Play both';n=Math.max(0,Math.min(2798,n));source.currentTime=n/fps;study.currentTime=n/fps;seek.value=n;}
async function toggle(){if(study.paused){source.currentTime=study.currentTime;await Promise.all([source.play(),study.play()]);play.textContent='Pause both'}else{source.pause();study.pause();play.textContent='Play both'}}
play.onclick=toggle;document.querySelector('#prev').onclick=()=>jump(frame()-1);document.querySelector('#next').onclick=()=>jump(frame()+1);
shotSelect.onchange=()=>jump(Number(shotSelect.value));seek.oninput=()=>jump(Number(seek.value));
document.querySelector('#listen').onchange=e=>{source.muted=e.target.value!=='source';study.muted=e.target.value!=='study'};
document.querySelector('#speed').onchange=e=>{source.playbackRate=study.playbackRate=Number(e.target.value)};
document.onkeydown=e=>{if(e.target===notes)return;if(e.code==='Space'){e.preventDefault();toggle()}if(e.code==='ArrowLeft'){e.preventDefault();jump(frame()-1)}if(e.code==='ArrowRight'){e.preventDefault();jump(frame()+1)}};
const key='animation-review-__STUDY__';notes.value=localStorage.getItem(key)||'';notes.oninput=()=>localStorage.setItem(key,notes.value);
document.querySelector('#save').onclick=()=>{const blob=new Blob([notes.value],{type:'text/plain'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='reference-review.txt';a.click();URL.revokeObjectURL(a.href)};
function tick(){if(!study.paused&&Math.abs(source.currentTime-study.currentTime)>.06)source.currentTime=study.currentTime;seek.value=frame();document.querySelector('#time').textContent=`Frame ${frame()} · ${study.currentTime.toFixed(3)} s`;requestAnimationFrame(tick)}tick();
</script>'''

def main():
    p=argparse.ArgumentParser();p.add_argument('--dir',type=Path,required=True)
    p.add_argument('--video',required=True);p.add_argument('--label',default='source-assisted experiment')
    p.add_argument('--out',default='compare.html');args=p.parse_args()
    shots=json.loads((args.dir/'shot-review.json').read_text())['shots']
    import html
    result=PAGE.replace('__SHOTS__',json.dumps(shots)).replace('__SOURCE__','source.mp4')
    result=result.replace('__STUDY__',html.escape(args.video,quote=True)).replace('__LABEL__',html.escape(args.label))
    (args.dir/args.out).write_text(result,encoding='utf-8')
    print(args.dir/args.out)

if __name__=='__main__':main()
