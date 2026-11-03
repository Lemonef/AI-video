import React from 'react';
import {AbsoluteFill,Html5Audio,Img,staticFile,interpolate,useCurrentFrame} from 'remotion';
import {W,H} from '../../lib/tokens';
import {FONT_CAPTION,OFFLINE_FONTS,localFont} from '../../lib/fonts';
import {loadFont} from '@remotion/google-fonts/Anton';
import captions from './captions.json';
import calibration from './calibration.json';
import actorBlocking from './actor-blocking.json';
import {crowdAt} from './crowd-blocking';
import {FidelityStage} from './FidelityScenes';
import {LeadPerformance,hasMeasuredLead} from './LeadPerformance';
import {ReferencePhoneInsert,ReferenceMechanism,ReferenceMapOverlay,ReferenceInventory,ReferenceTorchBeam,ReferenceStudyEnd,ReferenceCountdown,ReferenceControls,ReferenceGap,ReferencePullBadge} from './ReferenceInserts';
import {SourceCaptions} from './SourceCaptions';
import {shotAt,STUDY_FPS} from './shots';
import gradeCurves from './grade-curves.json';

const STUDY_FONT=OFFLINE_FONTS?localFont('Anton','fonts/Anton-Regular.ttf'):loadFont('normal',{weights:['400'],subsets:['latin']}).fontFamily;
// Per-local-frame overlay opacities measured from the source cut (luma); local frame = frame - shot.start.
// Only gate-kept shots: 8/9/23 gained < the gate's noise bar, 28 already carries its own dark grade (doubled = worse).
const CUT_FX:Record<number,{fill:string;opacity:number[]}>={
 20:{fill:'#fff',opacity:[.82,.55,.27]},
 // 27: source holds a flat light step for local 0-5 (luma 142 vs 123 after), a=(src-ours)/(255-ours).
 27:{fill:'#fff',opacity:[.15,.155,.15,.155,.155,.15]},
 31:{fill:'#000',opacity:[.78,.68,.58,.48,.38,.30,.22,.12,.02]},
 32:{fill:'#000',opacity:[.75,.61,.50,.36,.25,.14,.05]},
 };
// Linear slope = source mean luma / render mean luma per shot (first six frames skipped).
// Gate-kept only: 3 (1.21) and 19 (1.10) got worse, their error is local, not global brightness.
// Spike (scripts/spikes/gp_shot2.py): shot-2 lead as a Blender Grease Pencil render instead of SVG.
const GP_SHOT2=process.env.REMOTION_GP_SHOT2==='1';
const SHOT_GRADE:Record<number,number>={23:1.12,27:.98,28:.85,32:.79,34:.63};
// Shot 28 rule card sits above the shot's dark overlay and grade in the source: it fades in on source frames
// 2045-2048 (local 8-11) to RGB 243,242,233 sampled inside the card. The source has no countdown clock in 28.
const RULE_CARD_FADE=[8,11];
const RULE_CARD_FILL='#f3f2e9';

export const ReferenceStudy:React.FC<{showStudyLabels?:boolean;withSound?:boolean;sourceAssisted?:boolean}> = ({showStudyLabels=false,withSound=true,sourceAssisted=false}) => {
 const frame=useCurrentFrame();
 const shot=shotAt(frame);
 const local=frame-shot.start;
 const fx=CUT_FX[shot.id];
 const value=fx?.opacity[local];
 const p=Math.max(0,Math.min(1,local/Math.max(1,shot.end-shot.start-1)));
 // Camera landmarks in the same 270 x 480 plane as the reconstructed sets.
 const camera:Record<number,[number,number,number,number]>={
  1:[1,1.035,135,240],2:[2,2.12,139,303],3:[1,1.02,135,240],
  4:[1,1.015,135,240],5:[1.58,1.62,174,263],6:[1,1.025,135,240],
  7:[1.75,1.8,174,250],8:[1,1.02,135,240],9:[1.55,1.58,174,263],
  10:[1,1.015,135,240],11:[1,1.02,135,240],12:[1.20,1.24,135,310],
  13:[1,1.02,135,240],14:[1,1.03,135,240],15:[1.1,1.13,152,268],
  16:[1.7,1.75,135,325],17:[1,1,135,240],18:[1.32,1.36,135,288],
  19:[1,1.02,135,240],20:[1.2,1.22,135,310],21:[1,1.01,135,240],
  22:[1,1.015,135,240],23:[1,1.015,135,240],24:[1,1.02,135,240],
  25:[1,1.02,135,240],26:[1,1.015,135,240],27:[1,1.015,135,240],
  28:[1,1.015,135,240],29:[1,1.025,135,240],30:[1,1.02,135,240],
  31:[1.24,1.28,113,300],32:[1,1.03,135,240],33:[1.9,1.96,102,300],
  34:[1.6,1.66,192,300],35:[1,1,135,240]
 };
 const c=camera[shot.id];
 let zoom=interpolate(p,[0,1],[c[0],c[1]]);
 if(shot.id===15&&local>=33)zoom=1;
 if(shot.id===17)zoom=interpolate(local,[0,12,58,290,350,385],[1,.95,.62,.62,1.05,1.1]);
 const focusX=(shot.id===15&&local>=33?135:c[2])*4;
 const focusY=(shot.id===15&&local>=33?240:shot.id===17?interpolate(local,[0,12,58,290,350,385],[240,220,100,100,-100,-120]):c[3])*4;
 // Geometry-only landmark registration is enabled only for the clearly labeled assisted study.
 const plate=shot.id===32||shot.id===34?'dark-prop':shot.id===33?'dark-face':shot.id===16||(shot.id===15&&local>=33)?'map-parking':({dark:'aisle',chain:'door',radio:'prop'} as Record<string,string>)[shot.stage]??shot.stage;
 const keys=calibration.samples.filter(k=>k.shot===shot.id&&k.plate===plate);
 const past=keys.filter(k=>k.frame<=frame);
 const before=past[past.length-1]??keys[0];
 const after=keys.find(k=>k.frame>=frame)??keys[keys.length-1];
 let appliedMatrix=[[zoom,0,135-zoom*focusX/4],[0,zoom,240-zoom*focusY/4]];
 if(sourceAssisted&&shot.id===33)appliedMatrix=[[1,0,0],[0,1,0]];
 let cameraTransform=`translate(${W/2} ${H/2}) scale(${zoom}) translate(${-focusX} ${-focusY})`;
 if(sourceAssisted&&before&&after){
  const t=after.frame===before.frame?0:(frame-before.frame)/(after.frame-before.frame);
  const m=before.matrix.map((row,i)=>row.map((v,j)=>v+(after.matrix[i][j]-v)*t));
  appliedMatrix=m;
  cameraTransform=`matrix(${m[0][0]} ${m[1][0]} ${m[0][1]} ${m[1][1]} ${m[0][2]*4} ${m[1][2]*4})`;
 }
 if(sourceAssisted&&shot.id===33&&!keys.length)cameraTransform='matrix(1 0 0 1 0 0)';
 const actorKeys=actorBlocking.samples.filter(k=>k.shot===shot.id);
 const actorPast=actorKeys.filter(k=>k.frame<=frame);
 const actorBefore=actorPast[actorPast.length-1]??actorKeys[0];
 const actorAfter=actorKeys.find(k=>k.frame>=frame)??actorKeys[actorKeys.length-1];
 let actorTarget: {x:number;y:number;r:number}|undefined;
 if(actorBefore&&actorAfter&&!(shot.id===15&&local>=33)&&!(shot.id===29&&local<31)){
  const t=actorAfter.frame===actorBefore.frame?0:Math.max(0,Math.min(1,(frame-actorBefore.frame)/(actorAfter.frame-actorBefore.frame)));
  const hx=actorBefore.x+(actorAfter.x-actorBefore.x)*t,hy=actorBefore.y+(actorAfter.y-actorBefore.y)*t;
  const radius=actorBefore.r+(actorAfter.r-actorBefore.r)*t;
  const [[a,c,tx],[b,d,ty]]=appliedMatrix,det=a*d-b*c;
  actorTarget={x:(d*(hx-tx)-c*(hy-ty))/det,y:(-b*(hx-tx)+a*(hy-ty))/det,r:radius/Math.hypot(a,b)};
 }
 const crowdTargets=crowdAt(shot.id,frame)?.map(k=>{
  const [[a,c,tx],[b,d,ty]]=appliedMatrix,det=a*d-b*c;
  return {...k,n:k.n,x:(d*(k.x-tx)-c*(k.y-ty))/det,y:(-b*(k.x-tx)+a*(k.y-ty))/det,r:k.r/Math.hypot(a,b)};
 });
 const fullSec=frame/STUDY_FPS;
 const remaining=Math.max(0,299-Math.floor(fullSec-47.0));
 const timer=`${Math.floor(remaining/60).toString().padStart(2,'0')}:${(remaining%60).toString().padStart(2,'0')}`;
 const caption=captions.find(c=>frame>=c.start&&frame<c.end);
 const count=shot.id===24?Math.floor(interpolate(frame,[1799,1807,1810,1823,1837,1868,1885],[0,8,11,24,38,39,39],{extrapolateLeft:'clamp',extrapolateRight:'clamp'})):shot.id===25?39:40;
const fullInsert=sourceAssisted&&[8,21,23,25,35].includes(shot.id);
  // The curve wins over the static slope; fitted by scripts/fit_grade_curve.py
  const grade=sourceAssisted?((gradeCurves as Record<string,number[]>)[shot.id]?.[local]??SHOT_GRADE[shot.id]):undefined;
 let torchOrigin:{x:number;y:number}|undefined;
 if(actorTarget){
  const s=actorTarget.r/30,wx=actorTarget.x+34*s,wy=actorTarget.y+36*s;
  torchOrigin={x:appliedMatrix[0][0]*wx+appliedMatrix[0][1]*wy+appliedMatrix[0][2],y:appliedMatrix[1][0]*wx+appliedMatrix[1][1]*wy+appliedMatrix[1][2]};
 }
 return <AbsoluteFill style={{background:'#071218',overflow:'hidden'}}>
  {withSound?<Html5Audio src={staticFile('reference-study/study-sound.wav')}/>:null}
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
   <defs><radialGradient id="study-vignette"><stop offset=".42" stopColor="#000" stopOpacity={0}/><stop offset="1" stopColor="#000" stopOpacity={sourceAssisted?.12:.35}/></radialGradient>{grade?<filter id="shot-grade" colorInterpolationFilters="sRGB" x="0" y="0" width="100%" height="100%" filterUnits="userSpaceOnUse"><feComponentTransfer><feFuncR type="linear" slope={grade}/><feFuncG type="linear" slope={grade}/><feFuncB type="linear" slope={grade}/></feComponentTransfer></filter>:null}</defs>
   <g filter={grade?'url(#shot-grade)':undefined}>
   {!fullInsert?<g transform={cameraTransform} style={shot.id===10&&local<7?{filter:`blur(${18*(1-local/7)}px)`}:shot.id===18&&local<13?{filter:`blur(${18*(1-local/13)}px)`}:undefined}>
    <FidelityStage hideLead={sourceAssisted&&hasMeasuredLead(shot.id)} crowdTargets={crowdTargets} actorTarget={actorTarget} sourceAssisted={sourceAssisted} shot={shot} frame={frame} local={local} p={p}/>
   </g>:null}
   {fullInsert?<g transform="scale(4)">{shot.id===8?<ReferencePhoneInsert frame={frame}/>:shot.id===21?<ReferenceControls frame={frame} showTimer={false}/>:shot.id===23?<ReferenceMechanism frame={frame}/>:shot.id===25?<ReferenceGap frame={frame} showHud={false}/>:<ReferenceStudyEnd frame={frame}/>}</g>:null}
   {sourceAssisted?GP_SHOT2&&shot.id===2?<foreignObject width={W} height={H}><Img src={staticFile(`reference-study/gp-shot2/${String(frame).padStart(5,'0')}.png`)} style={{width:W,height:H}}/></foreignObject>:<LeadPerformance frame={frame} shot={shot.id}/>:null}
   {sourceAssisted?<g transform="scale(4)">{shot.id===17?<ReferenceMapOverlay frame={frame}/>:null}{shot.id===30?<ReferenceInventory frame={frame}/>:null}{shot.id===31?<ReferenceTorchBeam frame={frame} origin={torchOrigin}/>:null}</g>:null}
   {sourceAssisted&&fx&&typeof value==='number'&&value>0?<rect width={W} height={H} fill={fx.fill} opacity={value}/>:null}
   {shot.id===28?<rect width={W} height={H} fill="#071318" opacity={sourceAssisted?.35+.2*Math.max(0,1-local/20):p*.45}/>:null}
   <rect width={W} height={H} fill="url(#study-vignette)"/>
   {/* the source clock leaves shot 20 at frame 1537 (local 11) */}{shot.id>=18&&shot.id<=28&&!(sourceAssisted&&shot.id===28)&&!(sourceAssisted&&(shot.id===23||shot.id===20&&local>=11))?sourceAssisted?<g transform="scale(4)"><ReferenceCountdown frame={frame} value={shot.id===27?'04:40':undefined} tone={shot.id===27?'safe':'alarm'}/></g>:<g><rect x={25} y={330} width={145} height={65} rx={15} fill="#172221" opacity={.94}/><text x={98} y={379} textAnchor="middle" fontFamily="monospace" fontSize={44} fontWeight={800} fill={shot.id>=27?'#82AE79':'#D4503F'}>{timer}</text></g>:null}
   {shot.stage==='chain'||shot.stage==='gap'||shot.id===27?sourceAssisted?<g transform="scale(4)"><ReferencePullBadge count={count}/></g>:<g><rect x={805} y={330} width={225} height={63} rx={8} fill={count===40?'#436A40':'#E1E2CC'}/><text x={917} y={374} textAnchor="middle" fontFamily={FONT_CAPTION} fontSize={34} fontWeight={800} fill={count===40?'#ECEDD6':'#25362C'}>PULL {count} / 40</text></g>:null}
   {sourceAssisted?<SourceCaptions frame={frame} font={STUDY_FONT}/>:caption&&withSound&&shot.id!==35?<text x={W/2} y={shot.id===3?1280:1272} textAnchor="middle" fontFamily={STUDY_FONT} fontSize={caption.text.length>25?46:54} fill={/OUTBREAK|PULL|STOP|SHUT/.test(caption.text)?'#d5b240':'#e5e3d3'} stroke="#17221f" strokeWidth={2.4} paintOrder="stroke" style={{filter:'drop-shadow(0 2px 2px #17221f88)'}}>{caption.text}</text>:null}
   {shot.id===15&&local<33?<text x={620} y={1530} textAnchor="middle" fontFamily={STUDY_FONT} fontSize={210} fill="#bb392c" transform="rotate(-3 620 1530)">{sourceAssisted?"DON'T.":'STOP.'}</text>:null}
   {shot.id===3&&local>=15?<g><rect x={417} y={203} width={250} height={28} fill="#a83727"/><text x={542} y={226} textAnchor="middle" fontFamily={STUDY_FONT} fontSize={22} fill="#f0e6c4">ZOMBIE OUTBREAK</text><text x={540} y={304} textAnchor="middle" fontFamily={STUDY_FONT} fontSize={88} fill="#eeead5">DAY 1</text></g>:null}
   {showStudyLabels&&shot.stage!=='end'?<text x={W/2} y={1380} textAnchor="middle" fontFamily={FONT_CAPTION} fontSize={shot.label.length>29?34:40} fontWeight={800} fill="#EEEBD5" stroke="#17272C" strokeWidth={6} paintOrder="stroke">{shot.label.toUpperCase()}</text>:null}
   {showStudyLabels?<g><rect x={665} y={55} width={330} height={52} rx={12} fill="#0A191E" opacity={.72}/><text x={830} y={90} textAnchor="middle" fontFamily={FONT_CAPTION} fontSize={23} fontWeight={600} fill="#C2CCB9">PRIVATE STUDY  /  {shot.id.toString().padStart(2,'0')}</text></g>:null}
   </g>
   {shot.id===28?<g opacity={sourceAssisted?interpolate(local,RULE_CARD_FADE,[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp'}):Math.min(1,(local+1)/8)}><rect x={152} y={616} width={776} height={256} rx={7} fill={sourceAssisted?RULE_CARD_FILL:'#eeecdc'}/><rect x={456} y={641} width={168} height={21} rx={5} fill="#be3f38"/><text x={540} y={657} textAnchor="middle" fontFamily={STUDY_FONT} fontSize={15} fill="#f1ede0">SHOP RULE #1</text><text x={540} y={721} textAnchor="middle" fontFamily={STUDY_FONT} fontSize={43} fill="#232a21">IF THEY CAN SEE YOU, THEY</text><text x={540} y={769} textAnchor="middle" fontFamily={STUDY_FONT} fontSize={43} fill="#232a21">COME</text><text x={540} y={819} textAnchor="middle" fontFamily={STUDY_FONT} fontSize={17} letterSpacing={2} fill="#656956">LIGHTS OFF · NO NOISE</text></g>:null}
  </svg>
 </AbsoluteFill>;
};
