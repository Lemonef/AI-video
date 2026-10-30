import React from 'react';
import {AbsoluteFill,interpolate,useCurrentFrame} from 'remotion';
import {W,H} from '../../lib/tokens';
import {FONT_CAPTION} from '../../lib/fonts';
import {Stage} from './Stages';
import {shotAt,STUDY_FPS} from './shots';

export const ReferenceStudy:React.FC<{showStudyLabels?:boolean}> = ({showStudyLabels=true}) => {
 const frame=useCurrentFrame();
 const shot=shotAt(frame);
 const local=frame-shot.start;
 const p=Math.max(0,Math.min(1,local/Math.max(1,shot.end-shot.start-1)));
 const zoom=interpolate(p,[0,1],shot.zoom);
 const focusY=shot.stage==='map'&&shot.id===17?interpolate(p,[0,1],[1550,850]):shot.focus[1];
 const fullSec=frame/STUDY_FPS;
 const remaining=Math.max(0,299-Math.floor(fullSec-47.36));
 const timer=`${Math.floor(remaining/60).toString().padStart(2,'0')}:${(remaining%60).toString().padStart(2,'0')}`;
 const count=shot.id===24?Math.min(38,6+Math.floor(p*32)):shot.id===25?39:40;
 return <AbsoluteFill style={{background:'#071218',overflow:'hidden'}}>
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
   <defs><radialGradient id="study-vignette"><stop offset=".42" stopColor="#000" stopOpacity={0}/><stop offset="1" stopColor="#000" stopOpacity={.48}/></radialGradient></defs>
   <g transform={`translate(${W/2} ${H/2}) scale(${zoom}) translate(${-shot.focus[0]} ${-focusY})`}>
    <Stage shot={shot} frame={frame} local={local} p={p}/>
   </g>
   {shot.id===28?<rect width={W} height={H} fill="#071318" opacity={p*.45}/>:null}
   <rect width={W} height={H} fill="url(#study-vignette)"/>
   {shot.id>=18&&shot.id<=28?<g><rect x={110} y={185} width={240} height={95} rx={15} fill="#172221" opacity={.94}/><text x={230} y={252} textAnchor="middle" fontFamily="monospace" fontSize={59} fontWeight={800} fill={shot.id>=27?'#82AE79':'#D4503F'}>{timer}</text></g>:null}
   {shot.stage==='chain'||shot.stage==='gap'?<g><rect x={740} y={210} width={240} height={67} rx={8} fill={count===40?'#436A40':'#E1E2CC'}/><text x={860} y={255} textAnchor="middle" fontFamily={FONT_CAPTION} fontSize={34} fontWeight={800} fill={count===40?'#ECEDD6':'#25362C'}>{count} / 40</text></g>:null}
   {shot.id===28&&p>.4?<g><rect x={350} y={650} width={650} height={230} rx={6} fill="#E6E5CD"/><text x={675} y={745} textAnchor="middle" fontFamily={FONT_CAPTION} fontSize={44} fontWeight={800} fill="#25362F">LIGHT / SILHOUETTE</text><text x={675} y={810} textAnchor="middle" fontFamily={FONT_CAPTION} fontSize={30} fontWeight={600} fill="#5B6D60">HOLD BEFORE THE DARK CUT</text></g>:null}
   {showStudyLabels&&shot.stage!=='end'?<text x={W/2} y={1380} textAnchor="middle" fontFamily={FONT_CAPTION} fontSize={shot.label.length>29?34:40} fontWeight={800} fill="#EEEBD5" stroke="#17272C" strokeWidth={6} paintOrder="stroke">{shot.label.toUpperCase()}</text>:null}
   {showStudyLabels?<g><rect x={665} y={55} width={330} height={52} rx={12} fill="#0A191E" opacity={.72}/><text x={830} y={90} textAnchor="middle" fontFamily={FONT_CAPTION} fontSize={23} fontWeight={600} fill="#C2CCB9">PRIVATE STUDY  /  {shot.id.toString().padStart(2,'0')}</text></g>:null}
  </svg>
 </AbsoluteFill>;
};
