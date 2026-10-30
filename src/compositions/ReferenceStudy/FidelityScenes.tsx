import React from 'react';
import {staticFile} from 'remotion';
import {walkCycle} from '../../lib/walkCycle';
import type {StageProps} from './Stages';

// Art coordinates follow the 270 x 480 reference review plane; camera transforms stay outside.
type HeadTarget={x:number;y:number;r:number};
const HeadTargetContext=React.createContext<HeadTarget|undefined>(undefined);
const actorLayout=(x:number,y:number,s:number,pose:string,f:number,lean:number,target?:HeadTarget)=>{
 if(!target)return {x,y,s};
 const theta=lean*Math.PI/180;
 const bob=0; // head guides describe the nominal path; gait supplies its own planted-foot bob
 s=target.r/30;
 return {x:target.x-s*Math.sin(theta)*(110+bob),y:target.y+s*(65+Math.cos(theta)*(110+bob)),s};
};
const P={cream:'#e1dcc7',wall:'#d4cfb8',floor:'#c4bda5',green:'#386a49',skin:'#e6e3d5',ink:'#202923'};
const RIG={pullHandX:29,scale:.88};
const GAIT_SCALE=61/(390-25); // map verified production hip-to-ankle span to the study rig
const range=(n:number)=>Array.from({length:n},(_,i)=>i);
const smooth=(x:number)=>{const t=Math.max(0,Math.min(1,x));return t*t*(3-2*t);};
const mix=(a:number,b:number,t:number)=>a+(b-a)*t;
const pts=(a:number[][])=>a.map(p=>p.join(',')).join(' ');
const COLORS=['#b33221','#debc38','#355d42','#d9d5b6','#37717a','#7f2834','#d16b28'];
const Defs=()=> <defs>
 <linearGradient id="f-sky" x2="0" y2="1"><stop stopColor="#0b1720"/><stop offset="1" stopColor="#253b45"/></linearGradient>
 <linearGradient id="f-floor" x2="0.25" y2="1"><stop stopColor="#e0dac2"/><stop offset="1" stopColor="#a39c85"/></linearGradient>
 <linearGradient id="f-glass" x2="1" y2="1"><stop stopColor="#15323b" stopOpacity=".1"/><stop offset="1" stopColor="#a2aaa1" stopOpacity=".12"/></linearGradient>
 <linearGradient id="f-metal" x2="0" y2="1"><stop stopColor="#c2c8b9"/><stop offset=".5" stopColor="#a4b0a3"/><stop offset="1" stopColor="#647572"/></linearGradient>
 <linearGradient id="f-cap" x2=".6" y2="1"><stop stopColor="#3d724d"/><stop offset="1" stopColor="#294b35"/></linearGradient>
 <radialGradient id="f-lamp"><stop stopColor="#ffe0a0" stopOpacity=".3"/><stop offset="1" stopColor="#ffc270" stopOpacity="0"/></radialGradient>
 <filter id="f-soft"><feGaussianBlur stdDeviation="1.8"/></filter>
 <pattern id="f-grain" width="31" height="37" patternUnits="userSpaceOnUse"><circle cx="2" cy="4" r=".4" fill="#fff" opacity=".1"/><circle cx="19" cy="12" r=".4" fill="#000" opacity=".12"/><circle cx="8" cy="30" r=".3" fill="#fff" opacity=".13"/></pattern>
 </defs>;

// Distinct package shapes and label panels, shrinking with shelf depth.
const Product:React.FC<{x:number;y:number;s?:number;seed:number}>=({x,y,s=1,seed})=>{
 const c=COLORS[seed%COLORS.length],kind=seed%5;
 return <g transform={`translate(${x} ${y}) scale(${s})`}>
 {kind<2?<><path d="M-2.7,0 V-11 Q-2.7,-13 -1.4,-14 V-17 H1.4 V-14 Q2.7,-13 2.7,-11 V0Z" fill={c}/><rect x="-1.6" y="-18" width="3.2" height="2" fill="#c9bf8d"/><rect x="-2.5" y="-9" width="5" height="5" fill="#e8e1bd"/>{kind===0?<circle cy="-6.5" r="1.7" fill="#c25127"/>:null}</>:kind===2?<><rect x="-3.2" y="-14" width="6.4" height="14" rx=".6" fill={c}/><path d="M1.8,-14 H3.2 V0 H1.8Z" fill="#000" opacity=".18"/><rect x="-3" y="-11" width="4.5" height="5" fill="#f1e7bf"/><path d="M-2,-4 H1" stroke="#6d5734" strokeWidth=".6"/></>:kind===3?<><path d="M-3,0 L-3.6,-12 L0,-16 L3.6,-12 L3,0Z" fill={c}/><rect x="-2.4" y="-10" width="4.8" height="6" fill="#e8dfb9"/></>:<><rect x="-3" y="-12" width="6" height="12" rx="1" fill={c}/><ellipse cy="-12" rx="3" ry="1" fill="#c8c5ab"/><rect x="-3" y="-8" width="6" height="4" fill="#eee4bc"/></>}
 <path d="M-2,0 V-11" stroke="#fff" opacity=".1" strokeWidth=".5"/></g>;
};
const Bag:React.FC<{x:number;y:number;s?:number}>=({x,y,s=1})=><g transform={`translate(${x} ${y}) scale(${s})`}><path d="M-10,-38 Q-10,-65 -4,-65 Q3,-65 3,-38 M0,-38 Q1,-67 7,-65 Q13,-64 12,-38" fill="none" stroke="#aa8a52" strokeWidth="1.5"/><path d="M-17,-44 L12,-42 L17,-3 L9,3 L-19,0Z" fill="#b18b50"/><path d="M12,-42 L17,-3 L9,3 L9,-38Z" fill="#8d6b3b"/><path d="M-17,-44 L-19,0 L-15,-2 L-13,-42Z" fill="#c19d63"/></g>;
const Radio:React.FC<{x:number;y:number;s?:number;f:number}>=({x,y,s=1,f})=><g transform={`translate(${x} ${y}) rotate(-12) scale(${s})`}><rect x="-3" y="-46" width="3" height="27" rx="1" fill="#1b2828"/><path d="M-13,-23 L11,-23 L13,12 L-11,14Z" fill="#334c4b"/><path d="M9,-23 L13,12 L17,7 L14,-20Z" fill="#213b3d"/><rect x="-9" y="-18" width="16" height="9" rx="1" fill="#7f9778"/>{range(6).map(i=><line key={i} x1="-8" x2="8" y1={-3+i*2.5} y2={-3+i*2.5} stroke="#1b3031" strokeWidth="1.3"/>)}<circle cx="10" cy="-25" r="1.8" fill={f%41<12?'#b9442a':'#384c38'}/></g>;
const Cart:React.FC<{x:number;y:number;s?:number}>=({x,y,s=1})=><g transform={`translate(${x} ${y}) scale(${s})`}><path d="M-18,-42 H-12 L-5,-6 H23 L29,-37 H-11 M-5,-6 L-2,3 H22" stroke="#aab9b3" strokeWidth="1.8" fill="none"/><path d="M-19,-42 H-11" stroke="#b53628" strokeWidth="2.4"/>{range(6).map(i=><path key={i} d={`M${-8+i*6},-37 L${-3+i*4.7},-7`} stroke="#a5b4b0" strokeWidth=".65"/>)}{range(4).map(i=><path key={i} d={`M${-10+i},${-32+i*7} H${28-i*1.5}`} stroke="#acbbb6" strokeWidth=".65"/>)}<circle cx="-2" cy="5" r="3" fill="#23302f"/><circle cx="21" cy="5" r="3" fill="#23302f"/></g>;
const Baskets:React.FC<{x:number;y:number;s?:number}>=({x,y,s=1})=><g transform={`translate(${x} ${y}) scale(${s})`}><path d="M-17,-47 H18 L14,-3 H-13Z" fill="#a82e24"/>{range(10).map(i=><path key={i} d={`M-17,${-45+i*3.7} H18`} stroke="#d0442b" strokeWidth="1.2"/>)}{range(7).map(i=><path key={i} d={`M${-14+i*4.5},-40 V-9`} stroke="#6b291e" strokeWidth=".65"/>)}<path d="M-18,-46 H19" stroke="#e34c32" strokeWidth="2"/><circle cx="-10" cy="0" r="3" fill="#26302a"/><circle cx="11" cy="0" r="3" fill="#26302a"/></g>;
const Car:React.FC<{x:number;y:number;s?:number;c:string;flip?:boolean}>=({x,y,s=1,c,flip=false})=><g transform={`translate(${x} ${y}) scale(${flip?-s:s} ${s})`}><path d="M-28,0 L-28,-9 L-20,-12 L-11,-23 H10 L21,-12 L31,-8 V1Z" fill={c}/><path d="M-8,-21 H8 L17,-12 H-15Z" fill="#233d46"/><path d="M1,-21 V-12" stroke="#66777a" strokeWidth="1"/><path d="M-24,-8 H27" stroke="#fff" strokeOpacity=".12"/><circle cx="-17" cy="1" r="6" fill="#152225"/><circle cx="19" cy="1" r="6" fill="#142225"/><circle cx="-17" cy="1" r="2.8" fill="#667579"/><circle cx="19" cy="1" r="2.8" fill="#667579"/><path d="M28,-6 h4" stroke="#e0d4a4" strokeWidth="2"/></g>;

// Prop anchors and limb endpoints share local rig space.
const Cashier:React.FC<{x:number;y:number;s?:number;f:number;pose?:string;emotion?:string;lean?:number}>=({x,y,s=1,f,pose='rest',emotion='calm',lean=0})=>{
 ({x,y,s}=actorLayout(x,y,s,pose,f,lean,React.useContext(HeadTargetContext)));
 const gait=walkCycle(f);
 const step=pose==='walk'?gait.swing:0,pull=pose==='pull'?Math.sin(f/3.9):0,headY=-175;
 const bodyBob=pose==='walk'?gait.bob*GAIT_SCALE:0;
 const handR=pose==='pull'?[RIG.pullHandX,-113+pull*20]:pose==='phone'?[17,-102]:pose==='light'?[37,-100]:pose==='alert'?[25,-95]:[28,-97];
 const handL=pose==='alert'?[25,-125]:pose==='keys'?[-31,-107]:[-24,-81];
 const eyeY=headY+4,blink=emotion==='tired'||(f%127>=90&&f%127<94);
 const arm=(side:number,hand:number[])=>{const root=[side*12,-135],elbow=pose==='alert'?[side*32,-124]:side===1&&pose==='pull'?[31,-130+pull*8]:[side*28,-116];return <g><path d={`M${root} L${elbow}`} fill="none" stroke={P.green} strokeWidth="10" strokeLinecap="round"/><path d={`M${elbow} L${hand}`} fill="none" stroke="#29422e" strokeWidth="5.7" strokeLinecap="round"/><circle cx={hand[0]} cy={hand[1]} r="3.6" fill={P.skin}/>{side===1&&pose==='phone'?<g transform={`translate(${hand[0]} ${hand[1]}) rotate(8)`}><rect x="-4" y="-10" width="8" height="16" rx="1.2" fill="#202b27"/><rect x="-3" y="-8" width="6" height="11" fill="#b84131"/></g>:null}{side===-1&&pose==='keys'?<g transform={`translate(${hand[0]} ${hand[1]+4})`}><circle r="3" fill="none" stroke="#b8c5ad"/><path d="M0,3 v8 m0,-3 h4" stroke="#c5c6ad" strokeWidth="1.4"/></g>:null}{side===1&&pose==='light'?<g transform={`translate(${hand[0]} ${hand[1]})`}><path d="M0,-3 H13 V3 H0Z" fill="#233333"/><rect x="10" y="-4" width="5" height="8" fill="#c5cabc"/></g>:null}</g>};
 return <g transform={`translate(${x} ${y}) scale(${s})`}><ellipse cx="4" cy="3" rx="17" ry="3.9" fill="#172322" opacity=".3"/>
 <g transform={`rotate(${lean} 0 -65) translate(0 ${bodyBob})`}>
 {[-1,1].map(side=>{
  const leg=side<0?gait.left:gait.right;
  const walking=pose==='walk';
  const hipX=walking?leg.hipX*GAIT_SCALE:side*6;
  const kneeX=walking?leg.kneeX*GAIT_SCALE:side*6;
  const kneeY=walking?(leg.kneeY+390)*GAIT_SCALE-64:-33;
  const ankleX=walking?leg.ankleX*GAIT_SCALE:side*6;
  const ankleY=walking?(leg.ankleY+390)*GAIT_SCALE-64:-3;
  return <g key={side}><path d={`M${hipX},-64 L${kneeX},${kneeY} L${ankleX},${ankleY}`} fill="none" stroke={side===-1?'#a3a079':'#bbb78c'} strokeWidth="9" strokeLinecap="round" strokeLinejoin="round"/><ellipse cx={ankleX+1} cy={ankleY+3} rx="6.5" ry={2.9-(walking?leg.lift/70:0)} fill="#3c4436"/></g>;
 })}
 <path d="M-17,-143 Q0,-148 17,-141 L13,-63 H-13Z" fill="#2e5a3c"/><path d="M-9,-130 H11 L14,-47 H-11Z" fill="#1b3033"/><rect x="-6" y="-67" width="14" height="6" rx="1.5" fill="#34484b"/><path d="M-14,-80 V-49 H-3 V-80" fill="#263c36"/>
 {arm(-1,handL)}{arm(1,handR)}<rect x="-3.5" y="-152" width="7" height="13" fill={P.skin}/><path d="M-7,-140 L0,-120 L7,-140" fill="none" stroke="#a1b09a" strokeWidth="1.3"/><rect x="-4" y="-122" width="8" height="6" rx="1" fill="#9aaa92"/><rect x="-13" y="-98" width="7" height="15" rx="1" fill="#1b2a25"/><rect x="-12" y="-96" width="5" height="10" fill="#bb3a2e"/>
 <circle cy={headY} r="30" fill={P.skin}/><path d={`M-28,${headY-4} Q-28,${headY+26} 0,${headY+30} Q-22,${headY+20} -19,${headY-3}Z`} fill="#c3c5b5" opacity=".15"/>
 {[-9,9].map(dx=><g key={dx}>{emotion==='panic'?<circle cx={dx} cy={eyeY} r="6.9" fill="none" stroke={P.ink} strokeWidth="1.7"/>:null}{blink&&emotion!=='panic'?<path d={`M${dx-3},${eyeY} h6`} stroke={P.ink} strokeWidth="1.7" strokeLinecap="round"/>:<ellipse cx={dx} cy={eyeY} rx={emotion==='panic'?2.6:2.4} ry={emotion==='panic'?2.8:3.1} fill={P.ink}/>}</g>)}
 {emotion==='panic'?<ellipse cy={headY+18} rx="3.5" ry="4.8" fill={P.ink}/>:emotion==='worried'?<path d={`M-5,${headY+19} q2,-5 5,-1 q3,4 5,-1`} stroke={P.ink} strokeWidth="1.9" fill="none" strokeLinecap="round"/>:<path d={`M-4,${headY+18} h8`} stroke={P.ink} strokeWidth="1.8" strokeLinecap="round"/>}
 <path d={`M-30,${headY-8} Q-30,${headY-34} -2,${headY-35} Q26,${headY-36} 30,${headY-8}Z`} fill="url(#f-cap)"/><ellipse cx="2" cy={headY-8} rx="33" ry="5.1" fill="#315c3d"/><circle cy={headY-35} r="1.6" fill="#456c46"/>
 </g></g>;
};

const Tree:React.FC<{x:number;y:number;s?:number;pine?:boolean}>=({x,y,s=1,pine=false})=><g transform={`translate(${x} ${y}) scale(${s})`}><path d="M-2,0 L0,-47 L3,0Z" fill="#142423"/>{pine?<path d="M0,-65 L-8,-48 H-4 L-15,-32 H-8 L-22,-12 H22 L8,-32 H15 L4,-48 H8Z" fill="#122823"/>:<><circle cx="-11" cy="-33" r="18" fill="#132b27"/><circle cx="10" cy="-27" r="20" fill="#122825"/><circle cy="-48" r="16" fill="#152e28"/></>}</g>;
const Lamp:React.FC<{x:number;y:number;h?:number}>=({x,y,h=110})=><g><rect x={x} y={y-h} width="1.7" height={h} fill="#858a77"/><path d={`M${x+.8},${y-h} l-10,-2`} stroke="#aaa68d" strokeWidth="1.4"/><ellipse cx={x-8} cy={y-h} rx="5" ry="2" fill="#e5bc7e"/><circle cx={x-8} cy={y-h+2} r="22" fill="url(#f-lamp)"/><path d={`M${x-10},${y-h+3} L${x-37},${y} H${x+22}Z`} fill="#e2c68c" opacity=".028"/></g>;

const Roofs=()=> <g><path d="M30,255 V229 H55 L68,210 L81,226 H94 V245 H123 V226 L146,216 H172 L186,232 H207 V254Z" fill="#233531"/><path d="M141,221 L149,217 H172 L187,234 H137Z" fill="#392c2c"/><path d="M140,234 H182 V254 H140Z" fill="#4b4540"/><path d="M71,220 L80,232 H57Z" fill="#514640"/><path d="M58,232 H79 V250 H58Z" fill="#5d594a"/></g>;
const Storefront:React.FC<{f:number}>=({f})=><g>
 <rect y="258" x="20" width="270" height="61" fill="#e4d9b9"/><rect x="23" y="260" width="259" height="55" fill="#f0e7bd"/>
 {range(4).map(row=><g key={row}><rect x="26" y={280+row*9} width="245" height="1.4" fill="#a8a18b"/>{range(43).map(k=><Product key={k} x={28+k*6} y={280+row*9} s={.38} seed={k+row*2}/>)}</g>)}
 <path d="M21,258 H285 M21,273 H285 M21,316 H285" stroke="#7c8070" strokeWidth="1.6"/>{range(14).map(i=><path key={i} d={`M${22+i*19},258 V316`} stroke="#7d8677" strokeWidth="1.4"/>)}
 <path d="M13,240 H290 V257 H13Z" fill="#5a5350"/>{range(64).map(i=><line key={i} x1={15+i*4.4} x2={15+i*4.4} y1="240" y2="255" stroke="#393c3a" strokeWidth=".65"/>)}<path d="M12,255 H290 V260 H12Z" fill="#8a6e61"/><rect x="114" y="241" width="53" height="13" fill="#807976"/>
 <rect x="114" y="277" width="50" height="42" fill="#d8c9a3"/><rect x="118" y="282" width="42" height="33" fill="#eddfb6"/><path d="M139,282 V315 M118,300 H160" stroke="#a79c80" strokeWidth="2"/><path d="M112,273 H166 V280 H112Z" fill="#894c3b"/><path d="M112,272 H166" stroke="#a8664b" strokeWidth="1.6"/>
 <Cashier x={96} y={305} s={.12} f={f} pose="walk" lean={10}/>{range(6).map(i=><Cart key={i} x={176+i*12} y={314} s={.48}/>)}<rect x="0" y="318" width="290" height="4" fill="#9c9985"/>
 </g>;
const Outside:React.FC<{f:number;crowd?:boolean;assisted?:boolean}>=({f,crowd=false,assisted=false})=>assisted?<g><image href={staticFile('reference-study/exterior-clean-v1.png')} width="270" height="480" preserveAspectRatio="none"/><Cashier x={94} y={306} s={.12} f={f} pose="walk" lean={17}/>{crowd?<><Threat x={37} y={383} s={.83} f={f} n={1}/><Threat x={106} y={421} s={1.2} f={f} n={0}/><Threat x={204} y={411} s={1.05} f={f} n={2}/></>:null}</g>:<g><rect width="270" height="480" fill="url(#f-sky)"/><Roofs/>
 {[[2,241,1],[32,246,.5],[201,244,.95],[245,251,.65],[267,242,1]].map(([x,y,s],i)=><Tree key={i} x={x} y={y} s={s} pine={i===2}/>)}
 <rect y="318" width="270" height="162" fill="#303b40"/><path d="M0,321 H270 M0,334 L45,321 M0,353 L65,322 M0,377 L84,322 M176,322 L217,480 M205,323 L270,432" stroke="#7f8078" strokeWidth="1.2" opacity=".55"/>{range(5).map(i=><path key={i} d={`M${180+i*6},${335+i*26} H270`} stroke="#8b8a7e" strokeWidth="1.1" opacity=".45"/>)}
 <Storefront f={f}/><Lamp x={38} y={312} h={92}/><Lamp x={247} y={314} h={107}/><Car x={2} y={318} c="#29383c" s={.65}/><Car x={271} y={327} c="#202e32" s={1}/>
 {crowd?<><Threat x={37} y={383} s={.83} f={f} n={1}/><Threat x={106} y={421} s={1.2} f={f} n={0}/><Threat x={204} y={411} s={1.05} f={f} n={2}/></>:null}<path d="M26,321 H170 L232,444 H0Z" fill="#e4ce9f" opacity=".04"/></g>;

// Each shelf's package scale and baseline use the same depth parameter as its board edges.
const Aisle:React.FC<{f:number;dark?:number;actor?:boolean;assisted?:boolean}>=({f,dark=0,actor=false,assisted=false})=>assisted?<g>
 <image href={staticFile('reference-study/aisle-clean-v1.png')} width="270" height="480" preserveAspectRatio="none"/>
 {!actor?<Cashier x={133} y={287} s={.30} f={f} pose="walk" lean={17}/>:null}
 {dark>0?<rect width="270" height="480" fill="#051013" opacity={dark}/>:null}
 {actor?<><path d="M136,354 L270,372 V471Z" fill="#e5dfc2" opacity=".15" filter="url(#f-soft)"/><g opacity=".65"><Cashier x={102} y={450} s={.93} f={f} pose="light" emotion="worried"/></g></>:null}
 </g>:<g>
 <rect width="270" height="480" fill="#343d3d"/><path d="M0,480 H270 L164,253 H105Z" fill="url(#f-floor)"/><rect x="100" y="139" width="68" height="116" fill="#272e2c"/>
 {range(5).map(row=><g key={row}><rect x="100" y={165+row*20} width="68" height="3" fill="#c3bda7"/>{range(10).map(k=><Product key={k} x={105+k*6} y={165+row*20} s={.30} seed={row+k}/>)}</g>)}
 <path d="M0,0 H18 V48 L102,152 V270 L0,480Z" fill="#686655"/><path d="M270,0 H252 V46 L168,151 V274 L270,480Z" fill="#716b56"/>
 {[-1,1].map(side=><g key={side}>
 {range(6).map(row=>{const near=66+row*74,far=156+row*18;return <g key={row}><polygon points={pts(side<0?[[0,near-30],[102,far-10],[102,far+12],[0,near+35]]:[[270,near-30],[168,far-10],[168,far+12],[270,near+35]])} fill="#252e29"/>
 {range(17).map(k=>{const t=(k+.4)/17,dep=1-t*.76;return <Product key={k} x={side<0?101*t:270-101*t} y={mix(near,far,t)} s={dep*(row<2?2.1:2.25)} seed={Math.floor(k/3)+row*7+(side<0?0:3)}/>;})}
 <polygon points={pts(side<0?[[0,near],[102,far],[102,far+4],[0,near+8]]:[[270,near],[168,far],[168,far+4],[270,near+8]])} fill="#d5cdb4"/><path d={side<0?`M0,${near+7} L102,${far+4}`:`M270,${near+7} L168,${far+4}`} stroke="#b3aa8d" strokeWidth="1.8"/>
 </g>;})}
 {range(5).map(k=><g key={k} transform={`translate(${side<0?22+k*17:247-k*17} ${side<0?25+k*24:20+k*24}) scale(${1-k*.14})`}><path d="M-7,-12 H8 V11 H-7Z" fill={k%2?'#c5ac7c':'#ab946a'}/><path d="M0,-12 V11" stroke="#9c8158" strokeWidth=".6"/></g>)}
 </g>)}
 <path d="M18,14 H252 M59,77 H210 M87,120 H182" stroke="#738079" strokeWidth="1" opacity=".5"/><path d="M121,3 L138,3 L135,48 H125Z M125,55 H136 L134,78 H128Z M127,87 H135 L134,102 H129Z" fill="#e7e7cd"/><path d="M59,83 H209" stroke="#cbd0b9" strokeWidth="5"/>
 <Cart x={109} y={284} s={.73}/><path d="M94,256 H119 V275 H94Z" fill="#c4a41b"/><path d="M95,241 H118 V255 H95Z" fill="#b8baa0"/>
 {actor?<Cashier x={102} y={450} s={.93} f={f} pose="light" emotion="worried"/>:<Cashier x={130+Math.sin(f/25)*1.5} y={287} s={.30} f={f} pose="walk" lean={17}/>}
 {dark>0?<><rect width="270" height="480" fill="#071013" opacity={dark}/>{actor?<><path d="M137,354 L270,373 V471Z" fill="#e1dfbf" opacity=".11" filter="url(#f-soft)"/><g opacity=".65"><Cashier x={102} y={450} s={.93} f={f} pose="light" emotion="worried"/></g></>:null}</>:null}
 </g>;

const Counter:React.FC<{f:number;pose:string;emotion:string;assisted?:boolean}>=({f,pose,emotion,assisted=false})=>assisted?<g>
 <image href={staticFile('reference-study/counter-clean-v1.png')} width="270" height="480" preserveAspectRatio="none"/>
 <defs><mask id="counter-rig-mask"><rect width="270" height="480" fill="white"/><path d="M0,344 L181,347 L224,350 V480 H0Z" fill="black"/><path d="M130,324 L139,311 L158,313 L164,374 L134,375Z" fill="black"/></mask></defs>
 <g mask="url(#counter-rig-mask)"><Cashier x={180} y={432} s={1} f={f} pose={pose} emotion={emotion}/></g>
 </g>:<g>
 <rect width="270" height="480" fill="#d4cfb7"/><path d="M0,0 H270 V112 L0,64Z" fill="#b8b69e"/><path d="M10,4 L22,2 L86,39 L78,45Z M91,55 L99,52 L123,65 L117,70Z M173,0 H186 L208,40 L198,42Z M213,51 L222,49 L246,80 L238,83Z" fill="#e6e6cb"/>
 <rect x="193" y="101" width="77" height="137" fill="#16343b"/><g transform="translate(193 101)"><path d="M0,0 H77 V137 H0Z" fill="#18353c"/><Tree x={51} y={108} s={.48}/><path d="M0,118 H77 V138 H0Z" fill="#555f5a"/><Car x={28} y={127} s={.55} c="#435c5d"/><Car x={70} y={124} s={.5} c="#344c51"/><circle cx="16" cy="73" r="1.7" fill="#b9d5c4"/></g>
 <path d="M192,99 V240 M239,100 V239 M192,130 H270 M192,202 H270" stroke="#a1b0a1" strokeWidth="3.2"/><path d="M190,99 H270 M192,240 H270" stroke="#b6b8a0" strokeWidth="4"/>
 <path d="M0,99 L172,161 V323 L0,410Z" fill="#5b6050"/>
 {range(6).map(row=>{const near=130+row*44,far=172+row*25;return <g key={row}>
 {range(23).map(k=>{const t=(k+.4)/23;return <Product key={k} x={171*t} y={mix(near,far,t)} s={1.85-t*.9} seed={Math.floor(k/4)+row*9}/>;})}<path d={`M0,${near} L172,${far} V${far+4} L0,${near+7}Z`} fill="#ded5b4"/><path d={`M0,${near+6} L172,${far+4}`} stroke="#96997e" strokeWidth="1"/>
 </g>;})}
 <path d="M42,233 L53,237 L54,328 L43,331Z" fill="#e6dcb6"/>{range(6).map(i=><g key={i}><ellipse cx="48" cy={245+i*14} rx="6.3" ry="7" fill={i%2?'#bfa328':'#bc3425'}/>{range(4).map(j=><circle key={j} cx={45+j%2*5} cy={242+i*14+Math.floor(j/2)*5} r="1.2" fill="#eee4b5"/>)}</g>)}
 <path d="M0,340 L270,306 V480 H0Z" fill="url(#f-floor)"/><path d="M94,59 V70 M169,57 V69" stroke="#b4b8a3" strokeWidth=".9"/><rect x="89" y="69" width="85" height="30" rx="1.5" fill="#192b29" stroke="#666d5d" strokeWidth="2"/><text x="102" y="91" fill="#c64132" fontFamily="monospace" fontSize="20" fontStyle="italic" letterSpacing="-2">10:52</text><text x="153" y="91" fill="#bb3a31" fontSize="6" fontWeight="800">P M</text>
 <Cashier x={180} y={432} s={1} f={f} pose={pose} emotion={emotion}/><Baskets x={272} y={331} s={.7}/>
 <path d="M-15,342 L183,323 L228,382 L181,419 L-10,407Z" fill="#84998e"/><path d="M-10,401 L181,413 L225,380 V397 L184,434 L-10,421Z" fill="#3e5d57"/><path d="M-10,421 L184,434 V480 H-10Z" fill="#2b4845"/><path d="M184,434 L225,397 V480 H184Z" fill="#193b3a"/>
 <path d="M-10,258 L38,256 L50,334 L-6,339Z" fill="#1f3d39"/><path d="M-5,265 L30,265 L36,299 L-2,299Z" fill="#548078"/><path d="M17,337 L29,336 L32,350 H11Z" fill="#203a36"/>
 <path d="M-4,375 L186,385 L176,400 L-2,390Z" fill="#1e3534"/>{range(5).map(i=><path key={i} d={`M${20+i*30},376 l-5,18`} stroke="#7c8c7d" strokeWidth="5"/>)}
 <g transform="translate(64 359) rotate(17)"><path d="M-12,-18 H8 V14 H-12Z" fill="#1d3936"/><rect x="-9" y="-14" width="14" height="12" fill="#85b4a7"/><path d="M-8,3 H4 M-8,7 H4" stroke="#537970" strokeWidth="1.8"/></g>
 <path d="M92,338 L105,337 L108,368 L119,370 V378 H89 V373 H99Z" fill="#1a3231"/><path d="M96,326 L112,324 L122,331 L119,337 L98,340 L90,335Z" fill="#1c3331"/><path d="M97,328 L109,326" stroke="#779a89" strokeWidth="2"/>
 <Bag x={154} y={374} s={.97}/><Radio x={201} y={365} s={.77} f={f}/>
 </g>;

const Threat:React.FC<{x:number;y:number;s:number;f:number;n:number}>=({x,y,s,f,n})=>{const a=Math.sin(f/13+n),walk=Math.sin(f/7+n);return <g transform={`translate(${x+Math.sin(f/38+n)*1.7} ${y}) scale(${s})`}><ellipse cy="2" rx="9" ry="2.5" fill="#22302e" opacity=".35"/><path d={`M-4,-31 L${-5+walk*3},-2 M4,-31 L${7-walk*3},-1`} stroke={n%2?'#9e9b65':'#5c7483'} strokeWidth="4.6" strokeLinecap="round"/><path d="M-7,-59 H7 L8,-30 H-7Z" fill={['#d5d4af','#973f31','#3c6745','#b8a64e'][n%4]}/><path d={`M-7,-56 l-7,${11+a*2} l-6,-11 M7,-56 l8,${10-a*3} l6,-12`} stroke="#8f9c69" strokeWidth="3.2" fill="none" strokeLinecap="round"/><circle cy="-69" r="9.5" fill="#a3ac78"/><path d="M-9,-74 l2,-8 l4,6 l3,-9 l3,8 l6,-4 l-1,7" fill="#394935"/>{[-3.5,3.5].map(dx=><g key={dx}><circle cx={dx} cy="-69" r="2.8" fill="#d9dfb7"/><circle cx={dx} cy="-69" r="1" fill="#24342a"/></g>)}<ellipse cy="-62" rx="2" ry="2.6" fill="#26372b"/></g>;};
const Lot:React.FC<{f:number;close?:boolean;assisted?:boolean}>=({f,close=false,assisted=false})=>assisted?<g>
 <image href={staticFile('reference-study/parking-clean-v1.png')} width="270" height="480" preserveAspectRatio="none"/>
 <Threat x={103} y={303} s={.75} f={f} n={0}/><Threat x={41} y={326} s={.8} f={f} n={1}/><Threat x={163} y={305} s={.85} f={f} n={2}/><Threat x={156} y={252} s={.67} f={f} n={3}/><Threat x={249} y={283} s={.72} f={f} n={0}/>
 </g>:<g>
 <rect width="270" height="480" fill="url(#f-sky)"/><path d="M0,158 L20,150 L31,160 L49,143 L68,152 L84,142 L103,151 L117,140 L138,153 L153,137 L171,150 L193,136 L215,150 L237,140 L270,153 V227 H0Z" fill="#112c2b"/>
 <path d="M0,229 H270 V480 H0Z" fill="#5c6b6f"/><path d="M0,219 H270 V238 H0Z" fill="#4a575b"/><path d="M0,226 H270" stroke="#c2bf98" strokeWidth="1.3"/><path d="M0,216 H270" stroke="#687466" strokeWidth="3"/><path d="M0,203 H270" stroke="#889084" strokeWidth="1.2"/><path d="M0,210 H270" stroke="#c8bca1" strokeWidth=".6" strokeDasharray="15 12"/>
 <path d="M95,238 L6,480 M185,238 L271,480" stroke="#b7b9a4" strokeWidth="2.1"/>{range(7).map(i=><path key={i} d={`M0,${251+i*30} H${90-i*10} M${190+i*10},${251+i*30} H270`} stroke="#9da899" strokeWidth="1.7"/>)}
 {range(5).map(i=><g key={i}><Car x={41-i*7} y={250+i*28} s={.5+i*.13} c={['#6d3234','#b3914c','#354f57','#8d4840','#344b56'][i]}/><Car x={228+i*9} y={251+i*29} s={.50+i*.14} c={['#8e9490','#b4b6a6','#596c70','#d0c9b5','#4b555c'][i]} flip/></g>)}
 <path d="M0,190 L24,177 L33,190 V213 H0Z" fill="#5d6357"/><path d="M0,191 H32 L18,176Z" fill="#293e3c"/><path d="M219,184 L242,167 L266,181 V212 H219Z" fill="#555c55"/><path d="M214,183 L243,162 L270,182Z" fill="#223b39"/>
 <Lamp x={62} y={277} h={181}/><Lamp x={174} y={246} h={122}/><Lamp x={103} y={241} h={87}/><path d="M165,153 q-5,-14 1,-18 q-4,-17 7,-21 q0,-15 13,-17 q4,-13 18,-12" stroke="#44585b" strokeWidth="9" fill="none" opacity=".35"/>
 <Cart x={66} y={346} s={.9}/><Threat x={66} y={337} s={.78} f={f} n={1}/><Threat x={112} y={393} s={1.13} f={f} n={0}/><Threat x={142} y={325} s={.71} f={f} n={3}/><Threat x={235} y={379} s={1.03} f={f} n={2}/><Threat x={24} y={367} s={.91} f={f} n={3}/>
 {!close?<><path d="M0,6 H270 V20 H0Z" fill="#183231"/><path d="M0,0 H13 V480 H0Z M257,0 H270 V480 H257Z" fill="#243d3e"/><path d="M0,432 H270 V449 H0Z" fill="#203a3b"/><path d="M0,425 H270" stroke="#7e9087" strokeWidth="2"/><rect x="17" y="326" width="48" height="83" fill="#2c4648"/><rect x="22" y="332" width="38" height="70" fill="#b6c1ae"/></>:null}
 </g>;
const Door:React.FC<{f:number;p:number;id:number;assisted?:boolean}>=({f,p,id,assisted=false})=>{
 const pull=id===24||id===26,closed=id>=27,down=closed?1:id===22?.75*smooth(p/.55):pull?(id===26?.97+.03*p:.75+.22*p):0;
 const x=id===10?mix(82,57,smooth(p)):id===13?100:id===14?mix(100,65,smooth(p)):id===15?32:38;
 const pose=id===10?'walk':pull?'pull':id===14?'keys':closed?'rest':'phone';
 const resolved=actorLayout(x,437,RIG.scale,pose,f,id===10?7:0,React.useContext(HeadTargetContext));
 const chainX=resolved.x+RIG.pullHandX*resolved.s;
 if(assisted)return <g>
 <image href={staticFile('reference-study/door-clean-v1.png')} width="270" height="480" preserveAspectRatio="none"/>
 <defs><clipPath id="door-glass"><path d="M108,158 L270,141 V375 L108,353Z"/></clipPath></defs>
 {id>=15&&id<29?<g clipPath="url(#door-glass)" opacity=".58"><Threat x={168} y={316} s={.7} f={f} n={0}/><Threat x={230} y={305} s={.66} f={f} n={3}/><Threat x={136} y={330} s={.8} f={f} n={1}/></g>:null}
 {down>0?<g><polygon points={pts([[107,158],[270,141],[270,141+232*down],[107,158+195*down]])} fill="url(#f-metal)"/>{range(Math.floor(32*down)).map(i=><path key={i} d={`M107,${161+i*6.1} L270,${144+i*7.25}`} stroke={i%2?'#c1c8b7':'#6e817b'} strokeWidth={i%2?.7:1.25}/>)}<path d={`M107,${158+195*down} L270,${141+232*down}`} stroke="#586e69" strokeWidth="4"/></g>:null}
 <Cashier x={x} y={437} s={RIG.scale} f={f} pose={id===10?'walk':pull?'pull':id===14?'keys':closed?'rest':'phone'} emotion={id===15?'panic':closed?'calm':'worried'} lean={id===10?7:0}/>
 {pull?<g><path d={`M${chainX},150 V429 Q${chainX},438 ${chainX-8},432 V152`} stroke="#334a41" strokeWidth="1.8" fill="none"/><path d={`M${chainX},150 V429 Q${chainX},438 ${chainX-8},432 V152`} stroke="#acb5a2" strokeWidth=".7" strokeDasharray="2 2" strokeDashoffset={-f*.8} fill="none"/></g>:null}
 </g>;

 return <g><rect width="270" height="480" fill="#17313a"/>
 <svg x="20" y="0" width="270" height="391" viewBox="0 40 270 400" preserveAspectRatio="none"><Lot f={f} close/></svg>
 <path d="M0,0 H29 V351 L0,339Z" fill="#8b8875"/><path d="M0,31 L25,48 V335 L0,322Z" fill="#a5a18d"/><path d="M29,0 V352 M107,0 V365 M29,148 L270,116 M27,340 L270,377" stroke="#637b7b" strokeWidth="4"/><path d="M32,0 V352 M111,0 V368" stroke="#284c53" strokeWidth="2.1"/>
 <path d="M0,339 L270,380 V480 H0Z" fill="url(#f-floor)"/><path d="M28,342 L107,355 L150,480 H0Z" fill="#e9dfbd" opacity=".08"/><path d="M96,366 L242,393 L221,416 L78,389Z" fill="#3c4a43"/>{range(9).map(i=><path key={i} d={`M${88+i*17},${383+i*2} l15,-14`} stroke="#63705d" strokeWidth=".6"/>)}<path d="M28,0 H270 V370 L28,342Z" fill="url(#f-glass)"/>
 <path d="M100,137 L270,113 V143 L103,159 Q95,157 97,149Z" fill="url(#f-metal)"/><path d="M103,142 L270,119 M102,150 L270,127" stroke="#d1d2bd" strokeWidth="2"/><path d="M103,158 L270,141" stroke="#5a706d" strokeWidth="2"/><path d="M108,158 L270,141 V375 L108,353Z" fill="#12282c" opacity=".08"/>
 <rect x="125" y="192" width="29" height="59" fill="#e3e3c2"/><path d="M154,200 L270,192" stroke="#75857b" strokeWidth="1.5"/><path d="M191,193 v60" stroke="#263e3b" strokeWidth="1.5"/><path d="M160,204 H205 V234 H160 M165,204 V234 M176,204 V234 M188,204 V234 M200,204 V234 M159,213 H207 M158,223 H205" stroke="#b1c1b7" strokeWidth="1.4" fill="none"/><path d="M160,203 H202" stroke="#be3c29" strokeWidth="2"/>
 <path d="M183,254 V279 M197,252 V277" stroke="#c0c9b8" strokeWidth="6"/><Cart x={18} y={371} s={1.47}/><Cart x={2} y={356} s={1.5}/><Baskets x={93} y={368} s={1.18}/><Baskets x={268} y={424} s={1.25}/>
 {down>0?<g><polygon points={pts([[107,158],[270,141],[270,141+232*down],[107,158+195*down]])} fill="url(#f-metal)"/>{range(Math.floor(32*down)).map(i=><path key={i} d={`M107,${161+i*6.1} L270,${144+i*7.25}`} stroke={i%2?'#c1c8b7':'#6e817b'} strokeWidth={i%2?.7:1.25}/>)}<path d={`M107,${158+195*down} L270,${141+232*down}`} stroke="#586e69" strokeWidth="4"/></g>:null}
 <Cashier x={x} y={437} s={RIG.scale} f={f} pose={id===10?'walk':pull?'pull':id===14?'keys':closed?'rest':'phone'} emotion={id===15?'panic':closed?'calm':'worried'} lean={id===10?7:0}/>
 {pull?<g><path d={`M${chainX},150 V429 Q${chainX},438 ${chainX-8},432 V152`} stroke="#334a41" strokeWidth="1.8" fill="none"/><path d={`M${chainX},150 V429 Q${chainX},438 ${chainX-8},432 V152`} stroke="#acb5a2" strokeWidth=".7" strokeDasharray="2 2" strokeDashoffset={-f*.8} fill="none"/></g>:null}
 </g>;
};

const PropInsert:React.FC<{f:number;dark?:boolean;assisted?:boolean}>=({f,dark=false,assisted=false})=>assisted?<g><image href={staticFile('reference-study/prop-clean-v1.png')} width="270" height="480" preserveAspectRatio="none"/>{dark?<rect width="270" height="480" fill="#020d11" opacity={.73}/>:null}<circle cx="222" cy="208" r="1.7" fill={f%41<12?'#c3442c':'#344536'}/></g>:<g><rect width="270" height="480" fill="#ccc6ac"/><path d="M0,54 L183,98 V132 L0,101Z" fill="#d8d0b4"/>{range(10).map(i=><Product key={i} x={i*20} y={mix(91,125,i/10)} s={2.1-i*.09} seed={i}/>)}<path d="M0,104 L185,139 L181,147 L0,113Z" fill="#6b755d"/>
 <path d="M0,263 L211,225 L284,387 L0,454Z" fill="#8b9e8c"/><path d="M0,454 L284,387 V480 H0Z" fill="#31514c"/><path d="M0,308 L213,274 L243,358 L0,402Z" fill="#304b43"/><Bag x={88} y={326} s={2.12}/><path d="M-10,331 L53,319 L64,364 L-6,379Z" fill="#1c3532"/><Radio x={215} y={350} s={1.88} f={f}/>{dark?<rect width="270" height="480" fill="#020d11" opacity=".73"/>:null}</g>;
const Map:React.FC<{f:number;p:number;assisted?:boolean;parking?:boolean}>=({f,p,assisted=false,parking=false})=>assisted?<g><rect x="-500" y="-900" width="1300" height="2400" fill="#263b33"/><image href={staticFile(`reference-study/${parking?'map-parking':'map'}-clean-v1.png`)} width="270" height="480" preserveAspectRatio="none"/>{p>.3?<g><rect x="82" y="164" width="110" height="15" rx="6" fill="#e5dfc4"/><text x="137" y="175" textAnchor="middle" fontSize="7" fontWeight="800">FOOD AND WATER</text></g>:null}</g>:<g>
 <rect x="-100" y="-700" width="470" height="1400" fill="#223a32"/>
 <rect x="-8" y="-298" width="285" height="310" fill="#899991" stroke="#536a64" strokeWidth="4"/>
 {[[40,-243],[143,-229],[106,-110],[219,-154]].map(([x,y],i)=><g key={i}><rect x={x} y={y} width="25" height="21" fill="#5c7470"/>{range(2).map(j=><g key={j}><circle cx={x+6+j*12} cy={y+10} r="4.7" fill="#344d4b"/><path d={`M${x+2+j*12},${y+6} l8,8 m0,-8 l-8,8`} stroke="#91a196" strokeWidth="1"/></g>)}</g>)}
 <path d="M80,-290 V8 M190,-290 V8" stroke="#6e8278" strokeWidth="1"/>
 <ellipse cx="72" cy="-215" rx="13" ry="4" fill="#697e74"/><ellipse cx="182" cy="-58" rx="16" ry="5" fill="#697e74"/>
<rect x="0" y="37" width="270" height="288" fill="#475852"/><rect x="-7" y="-47" width="284" height="61" fill="#7c8880"/><rect x="125" y="-3" width="80" height="15" fill="#864c3a"/>{range(42).map(i=><circle key={i} cx={mix(12,260,(i*17%43)/43)} cy={17+(i%3)*9} r={2.3+i%2} fill={i%3?'#889770':'#a7ad83'}/>)}
 {range(4).map(row=><g key={row}>{range(9).map(i=><path key={i} d={`M${1+i*31},${52+row*69} v50`} stroke="#aab09a" strokeWidth="1"/>)}{range(6).map(i=><g key={i} transform={`translate(${27+i*40} ${75+row*69})`}><rect x="-11" y="-23" width="22" height="46" rx="5" fill={['#536d80','#303f45','#bec0a4','#6c784b','#8b5e4b'][((i*3+row*7)%5)]}/><rect x="-8" y="-13" width="16" height="11" fill="#233c43"/><rect x="-8" y="7" width="16" height="9" fill="#2b4348"/><path d="M-11,-6 h22" stroke="#fff" opacity=".1"/></g>)}<path d={`M${row%2?12:52},${110+row*69} h22 l-9,-6 v12 l9,-6`} fill="#879081"/></g>)}
 {[{x:8,y:147},{x:168,y:148},{x:232,y:258}].map(({x,y},i)=><g key={i}><Lamp x={x} y={y+20} h={28}/><ellipse cx={x} cy={y} rx="45" ry="57" fill="url(#f-lamp)"/></g>)}
 <g transform={`translate(${118+p*5} ${135+p*6}) rotate(25)`}><Cart x={0} y={0} s={.37}/></g><g transform="translate(222 242) rotate(28)"><Cart x={0} y={0} s={.38}/></g>
 <rect y="325" width="270" height="14" fill="#304d35"/><rect y="342" width="270" height="69" fill="#485a56"/>{range(2).map(row=><g key={row}>{range(8).map(i=><g key={i} transform={`translate(${i*36+10} ${359+row*30}) rotate(90)`}><rect x="-11" y="-17" width="22" height="34" rx="4" fill={['#b5b6a4','#a64f3d','#b8a44e','#507345','#577b89'][i%5]}/><rect x="-7" y="-7" width="14" height="14" fill="#243c42"/><circle cx="-8" cy="15" r="2" fill="#c52f25"/><circle cx="8" cy="15" r="2" fill="#c52f25"/></g>)}</g>)}
 <rect x="4" y="431" width="260" height="160" fill="#2e4735"/><rect x="43" y="443" width="187" height="120" fill="#927854"/><path d="M38,438 H235 V460 H38Z" fill="#6b5d42"/><rect x="118" y="438" width="22" height="10" fill="#435345"/>{p>.2?<g><rect x="98" y="-173" width="160" height="24" rx="9" fill="#e1dfc7"/><text x="178" y="-157" textAnchor="middle" fontSize="8" fontWeight="800">12 AISLES ? FOOD AND WATER</text><circle cx="151" cy="27" r="14" fill="none" stroke="#d2563e" strokeWidth="2"/><path d="M151,41 v31" stroke="#c6c5a6" strokeDasharray="3 3"/></g>:null}</g>;

const Controls:React.FC<{p:number}>=({p})=><g><rect width="270" height="480" fill="#cccbb4"/><rect x="72" y="170" width="143" height="180" rx="5" fill="#777f6d" opacity=".3" filter="url(#f-soft)"/><rect x="72" y="166" width="141" height="178" rx="4" fill="#e5e4d0" stroke="#c2c4aa" strokeWidth="1"/><text x="142" y="187" textAnchor="middle" fontFamily="monospace" fontSize="8" fontWeight="800" letterSpacing="1">SHUTTER</text><text x="88" y="204" fontSize="4" fill="#41533d">POWER</text><circle cx="118" cy="202" r="3" fill="#527f42"/>
 {[{y:235,c:'#4f8651',s:'▲ UP'},{y:277,c:'#b83e32',s:'▼ DOWN'},{y:318,c:'#c3a23a',s:'■ STOP'}].map(b=><g key={b.y}><rect x="93" y={b.y-15} width="101" height="28" rx="14" fill={b.c} stroke="#40533d" strokeWidth="1.5"/><text x="143" y={b.y+3} textAnchor="middle" fontSize="8" fontWeight="800" fill="#e8e3c7">{b.s}</text></g>)}<g transform={`translate(${mix(286,141,smooth(p/.45))} 279)`}><path d="M0,0 L160,24" stroke="#397148" strokeWidth="15" strokeLinecap="round"/><ellipse rx="8" ry="5" fill="#26382b"/></g></g>;
const Mechanism:React.FC<{p:number}>=({p})=><g><rect width="270" height="480" fill="#d6d3ba"/><text x="208" y="155" fontSize="7" fill="#73836d">MOTOR</text><rect x="48" y="164" width="206" height="47" rx="4" fill="#a7b2a9" stroke="#3d5354" strokeWidth="1.7"/><circle cx="128" cy="187" r="16" fill="none" stroke="#3e5553" strokeWidth="1.5"/>{range(6).map(i=><path key={i} transform={`rotate(${i*60+p*16} 128 187)`} d="M128,187 L128,173" stroke="#4a5f58"/>)}<rect x="174" y="175" width="52" height="26" rx="3" fill="#879991"/><rect x="54" y="212" width="145" height="188" fill="#b5bfb0"/>{range(16).map(i=><path key={i} d={`M54,${215+i*12} H199`} stroke="#677e75" strokeWidth="1.4"/>)}<path d="M49,208 V397 Q41,413 33,396 V192" stroke="#516851" strokeWidth="1.5" strokeDasharray="2 3" fill="none"/></g>;
const Gap:React.FC<{p:number}>=({p})=><g><rect width="270" height="480" fill="#d1c9ab"/><rect width="270" height="284" fill="url(#f-metal)"/>{range(26).map(i=><path key={i} d={`M0,${i*11} H270`} stroke="#6b8077" strokeWidth="1.3"/>)}<path d="M0,281 H270 V350 H0Z" fill="#21332c"/>{[80,130,184].map((x,i)=><g key={x} transform={`translate(${x} ${284+smooth(p)*4})`}><path d={`M0,0 L${Math.sin(p*10+i)*4},43`} stroke="#849468" strokeWidth="6" strokeLinecap="round"/><ellipse rx="7" ry="4" fill="#a0ac79"/>{[-4,-1,2,5].map(dx=><path key={dx} d={`M${dx},-1 v-6`} stroke="#a0ac79" strokeWidth="1.7"/>)}</g>)}<path d="M0,347 H270" stroke="#8f9275" strokeWidth="2"/></g>;

export const FidelityStage:React.FC<StageProps&{sourceAssisted?:boolean;actorTarget?:HeadTarget}>=({shot,local,p,sourceAssisted=false,actorTarget})=>{
 const id=shot.id;let content:React.ReactNode;
 if(id===33&&sourceAssisted)content=<g>
 <defs><linearGradient id="portrait-body-shade"><stop stopColor="#000" stopOpacity=".78"/><stop offset=".45" stopColor="#000" stopOpacity=".65"/><stop offset=".56" stopColor="#000" stopOpacity="0"/></linearGradient><clipPath id="portrait-rig-shade"><circle cx={actorTarget?.x??145} cy={actorTarget?.y??228} r={actorTarget?.r??75}/><path d={`M${(actorTarget?.x??145)-30},${(actorTarget?.y??228)+65} h60 l12,210 h-90Z`}/></clipPath></defs>
 <image href={staticFile('reference-study/dark-face-clean-v1.png')} width="270" height="480" preserveAspectRatio="none"/>
 <Cashier x={145} y={648} s={2.4} f={local} pose="light" emotion={p>.35?'panic':'worried'}/>
 <rect width="270" height="480" fill="url(#portrait-body-shade)" opacity=".7" clipPath="url(#portrait-rig-shade)"/>
 </g>;
 else if(id===29&&local>=31)content=<Aisle assisted={sourceAssisted} f={local} dark={.77} actor/>;
 else if(shot.stage==='exterior')content=<Outside assisted={sourceAssisted} f={local} crowd={id===18}/>;
 else if(shot.stage==='aisle')content=<Aisle assisted={sourceAssisted} f={local} dark={0}/>;
 else if(shot.stage==='counter')content=<Counter assisted={sourceAssisted} f={local} pose={id===9?'phone':id===5||id===7?'alert':'rest'} emotion={id===7?'panic':id===5&&p<.7?'tired':id===9?'worried':'calm'}/>;
 else if(id===15&&local>=33)content=<Map assisted={sourceAssisted} parking f={local} p={0}/>;
 else if(shot.stage==='door'||shot.stage==='chain')content=<Door assisted={sourceAssisted} f={local} p={p} id={id}/>;
 else if(shot.stage==='parking')content=<Lot assisted={sourceAssisted} f={local} close={id!==11}/>;
 else if(shot.stage==='radio')content=<PropInsert assisted={sourceAssisted} f={local} dark={id>=32}/>;
 else if(shot.stage==='map')content=<Map assisted={sourceAssisted} parking={id===16} f={local} p={p}/>;
 else if(shot.stage==='control')content=<Controls p={p}/>;
 else if(shot.stage==='mechanism')content=<Mechanism p={p}/>;
 else if(shot.stage==='gap')content=<Gap p={p}/>;
 else if(shot.stage==='dark')content=<><Aisle assisted={sourceAssisted} f={local} dark={.77} actor/>{id===30?<g transform="translate(160 260) rotate(-3)"><rect x="-94" y="-30" width="188" height="70" fill="#e8e8d3"/><text x="-86" y="-15" fontSize="9" fontWeight="800">DAY 1 · SUPPLIES</text>{range(3).map(i=><path key={i} d={`M-86,${-8+i*17} H84`} stroke="#acb4a3" strokeWidth=".5"/>)}<text x="-84" y="7" fontSize="7">Food</text></g>:null}</>;
 else if(shot.stage==='phone')content=p>.375?<g><rect width="270" height="480" fill="#192e32"/>{range(9).map(i=><g key={i}><path d={`M${i*38-20},0 L${i*38+20},480 M0,${i*65} H270`} stroke="#3f5551" strokeWidth="8"/>{range(8).map(j=><rect key={j} x={i*38} y={j*65+9} width="20" height="37" fill={(i+j)%3?'#2a4141':'#354c44'}/>)}</g>)}<path d="M120,0 Q220,90 175,210 T120,480" stroke="#355d70" strokeWidth="22" fill="none"/><circle cx="141" cy="170" r={45+p*23} fill="#963e32" opacity=".37"/></g>:<g><rect width="270" height="480" fill="#443a2e"/><ellipse cx="135" cy="230" rx="165" ry="210" fill="#8f3929" opacity=".23"/><rect x="20" y="56" width="231" height="377" rx="24" fill="#111c1d" stroke="#414c43" strokeWidth="3"/><rect x="29" y="67" width="213" height="355" rx="16" fill="#462b29"/><text x="135" y="96" textAnchor="middle" fontSize="9" fill="#e5deca">10:52</text><rect x="45" y="171" width="183" height="146" rx="10" fill="#713b32"/><text x="59" y="196" fontSize="8" fill="#d2c8a8" letterSpacing="1">⚠ EMERGENCY ALERT</text><text x="59" y="224" fontSize="17" fontWeight="900" fill="#eee9d2">OUTBREAK</text><text x="59" y="244" fontSize="8" fill="#e0d8bc">Remain indoors. Avoid the streets.</text><rect x="60" y="282" width="153" height="21" rx="5" fill="#9c8d73"/><text x="136" y="296" fontSize="8" textAnchor="middle" fill="#e9dfc7">OK</text></g>;
 else content=<g><rect width="270" height="480" fill="#101b1d"/><text x="135" y="269" textAnchor="middle" fontFamily="Impact, sans-serif" fontSize="29" fontWeight="900" fill="#dddccc">PART 2</text><path d="M96,279 H176" stroke="#934c35" strokeWidth="1.5"/></g>;
 return <HeadTargetContext.Provider value={sourceAssisted?actorTarget:undefined}><svg width="1080" height="1920" viewBox="0 0 270 480" fontFamily="Arial, sans-serif"><Defs/>{content}<rect width="270" height="480" fill="url(#f-grain)" opacity=".5"/></svg></HeadTargetContext.Provider>;
};
