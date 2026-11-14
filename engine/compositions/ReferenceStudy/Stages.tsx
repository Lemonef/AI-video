import React from 'react';
import {W,H} from '../../lib/tokens';
import {FONT_CAPTION} from '../../lib/fonts';
import type {StudyShot} from './shots';

const C={night:'#0A1821',sky:'#132A36',wall:'#DCD5BC',floor:'#C5BDA6',shelf:'#E5DDC7',edge:'#9C8F70',green:'#2D654B',cap:'#24533D',skin:'#EEEBDD',ink:'#151C1A',red:'#C74739',gold:'#EBC451',steel:'#9BABA8',blue:'#344C55'};
const CASHIER_GEOM={chainHandX:150};
const GOODS=['#BA3C32','#E8BB49','#326B76','#486F4B','#8D3E43','#DFD9BF'];
export type StageProps={shot:StudyShot;frame:number;local:number;p:number};
const clamp=(p:number)=>Math.max(0,Math.min(1,p));
const ease=(p:number)=>{const v=clamp(p);return v*v*(3-2*v);};
const txt=(x:number,y:number,s:string,size=32,color=C.ink,anchor:'middle'|'start'='middle')=><text x={x} y={y} textAnchor={anchor} fontSize={size} fontFamily={FONT_CAPTION} fontWeight={800} fill={color}>{s}</text>;

export const PracticeCashier:React.FC<{x:number;y:number;scale?:number;frame:number;pose?:'idle'|'alert'|'phone'|'point'|'pull'|'walk'|'light';back?:boolean;panic?:boolean}> = ({x,y,scale=1,frame,pose='idle',back=false,panic=false})=>{
 const step=pose==='walk'?Math.sin(frame/6):0;
 const pull=pose==='pull'?Math.sin(frame/4):0;
 const bob=pose==='walk'?Math.abs(step)*5:0;
 const blink=!panic && frame%113>=76 && frame%113<80;
 const arm=(side:number)=>{
  const root={x:side*64,y:-500};
  let hand={x:side*92,y:-300};
  if(pose==='alert')hand={x:-side*25,y:-480};
  if(pose==='phone'&&side===1)hand={x:0,y:-380};
  if(pose==='point'&&side===1)hand={x:220,y:-465};
  if(pose==='pull'&&side===1)hand={x:CASHIER_GEOM.chainHandX,y:-480+pull*85};
  if(pose==='light'&&side===1)hand={x:195,y:-450};
  if(pose==='walk')hand={x:side*85+step*15*side,y:-310};
  const elbow={x:side*(pose==='alert'?145:110),y:pose==='alert'?-470:-395};
  return <g key={side}><path d={`M${root.x},${root.y} L${elbow.x},${elbow.y}`} stroke={C.green} strokeWidth={46} strokeLinecap="round"/><path d={`M${elbow.x},${elbow.y} L${hand.x},${hand.y}`} stroke={C.ink} strokeWidth={20} strokeLinecap="round"/><circle cx={hand.x} cy={hand.y} r={16} fill={C.skin}/>{pose==='phone'&&side===1?<g transform={`translate(${hand.x-23} ${hand.y-45})`}><rect width={46} height={86} rx={10} fill="#172326"/><rect x={7} y={12} width={32} height={49} rx={3} fill="#C54A3F"/></g>:null}{pose==='light'&&side===1?<g transform={`translate(${hand.x} ${hand.y})`}><rect x={0} y={-18} width={80} height={36} rx={9} fill="#283A40"/><rect x={64} y={-24} width={24} height={48} fill="#B4BFB4"/><path d="M88,-15 L470,-110 L470,110 L88,15 Z" fill="#F5EAC0" opacity={.08}/></g>:null}</g>;
 };
 return <g transform={`translate(${x} ${y-bob}) scale(${scale})`}>
  <ellipse cy={4+bob} rx={92} ry={18} fill="#000" opacity={.24}/>
  {[-1,1].map(side=><g key={side}><path d={`M${side*28},-285 Q${side*32+step*12},-135 ${side*35+step*side*22},${-18-Math.max(0,step*side)*20}`} stroke="#A79F79" strokeWidth={40} fill="none" strokeLinecap="round"/><ellipse cx={side*35+step*side*22} cy={-9-Math.max(0,step*side)*20} rx={30} ry={14} fill="#333E38"/></g>)}
  <path d="M-75,-520 Q0,-550 75,-520 L65,-280 H-65 Z" fill={C.green}/><path d="M-47,-500 H47 L54,-260 H-54 Z" fill="#1B3C31"/>
  {arm(-1)}{arm(1)}
  {!back?<><path d="M-22,-510 L0,-440 L22,-510" fill="none" stroke="#A6B6A0" strokeWidth={5}/><rect x={-15} y={-443} width={30} height={25} rx={4} fill="#D0D9BF"/></>:null}
  <rect x={-18} y={-610} width={36} height={65} fill={C.skin}/><circle cy={-660} r={108} fill={C.skin}/>
  {!back?<><g>{[-34,34].map(dx=>blink?<path key={dx} d={`M${dx-12},-642 h24`} stroke={C.ink} strokeWidth={6} strokeLinecap="round"/>:<g key={dx}>{panic?<circle cx={dx} cy={-642} r={24} fill="none" stroke={C.ink} strokeWidth={6}/>:null}<circle cx={dx} cy={-642} r={panic?9:10} fill={C.ink}/></g>)}</g>{panic?<ellipse cy={-606} rx={13} ry={20} fill={C.ink}/>:<path d={pose==='phone'||pose==='pull'?'M-18,-606 q9,-12 18,0 q9,12 18,0':'M-14,-606 h28'} fill="none" stroke={C.ink} strokeWidth={6} strokeLinecap="round"/>}</>:null}
  <path d="M-117,-681 Q-108,-792 0,-788 Q109,-783 118,-683 Z" fill={C.cap}/><ellipse cx={13} cy={-681} rx={132} ry={21} fill={C.green}/><circle cx={0} cy={-790} r={8} fill={C.cap}/>
 </g>;
};

const Merchandise:React.FC<{x:number;y:number;scale?:number;seed?:number}>=({x,y,scale=1,seed=0})=><g transform={`translate(${x} ${y}) scale(${scale})`}><rect x={-16} y={-80} width={32} height={80} rx={4} fill={GOODS[seed%GOODS.length]}/><rect x={-17} y={-61} width={34} height={15} fill="#E5DFC8" opacity={.7}/><rect x={-10} y={-91} width={20} height={12} rx={2} fill={GOODS[(seed+1)%GOODS.length]}/></g>;
const Basket:React.FC<{x:number;y:number;scale?:number}>=({x,y,scale=1})=><g transform={`translate(${x} ${y}) scale(${scale})`}><rect x={-70} y={-200} width={140} height={180} rx={8} fill="#A33B30"/>{[0,1,2,3,4].map(i=><line key={i} x1={-60} x2={60} y1={-180+i*31} y2={-180+i*31} stroke="#6B2927" strokeWidth={7}/>)}<circle cx={-50} r={14} fill="#182A2C"/><circle cx={50} r={14} fill="#182A2C"/></g>;
const Cart:React.FC<{x:number;y:number;scale?:number}>=({x,y,scale=1})=><g transform={`translate(${x} ${y}) scale(${scale})`}><path d="M-80,-230 H-44 L-20,-50 H120 L140,-210 H-35 M-20,-50 L-8,-5 H110" fill="none" stroke="#B4C0BA" strokeWidth={9}/>{[0,1,2,3,4].map(i=><path key={i} d={`M${-20+i*30},-206 l10,150`} stroke="#A6B5B1" strokeWidth={3}/>)}{[-155,-110,-65].map(yy=><line key={yy} x1={-28} x2={125} y1={yy} y2={yy} stroke="#A6B5B1" strokeWidth={3}/>)}<circle cx={-5} cy={14} r={17} fill="#1A292B"/><circle cx={106} cy={14} r={17} fill="#1A292B"/></g>;
const Car:React.FC<{x:number;y:number;color:string;scale?:number;top?:boolean}>=({x,y,color,scale=1,top=false})=><g transform={`translate(${x} ${y}) scale(${scale})`}>{top?<><rect x={-42} y={-90} width={84} height={180} rx={25} fill={color}/><rect x={-32} y={-42} width={64} height={82} rx={12} fill="#33454E"/><rect x={-29} y={-55} width={58} height={16} fill="#739093"/></>:<><path d="M-125,0 L-112,-60 L-70,-95 H60 L105,-45 L133,-25 V18 H-125 Z" fill={color}/><path d="M-65,-85 H50 L85,-48 H-90 Z" fill="#39515B"/><circle cx={-72} cy={16} r={27} fill="#152028"/><circle cx={82} cy={16} r={27} fill="#152028"/><rect x={105} y={-25} width={25} height={12} rx={4} fill="#BEBF9C"/></>}</g>;
const Threat:React.FC<{x:number;y:number;scale:number;frame:number;index:number}>=({x,y,scale,frame,index})=>{const sway=Math.sin(frame/22+index)*6;return <g transform={`translate(${x+sway} ${y}) scale(${scale})`}><ellipse cy={6} rx={40} ry={10} fill="#000" opacity={.2}/><path d="M-17,-130 L-30,-8 M17,-130 L35,-8" stroke={index%2?'#9E9164':'#61727D'} strokeWidth={23} strokeLinecap="round"/><path d="M-25,-250 H25 L33,-127 H-31 Z" fill={['#8D482F','#D7D4B3','#7A8247'][index%3]}/><path d="M-25,-237 L-53,-199 L-72,-257 M25,-237 L55,-207 L67,-260" fill="none" stroke="#82906C" strokeWidth={15} strokeLinecap="round"/><circle cy={-297} r={40} fill="#8B9772"/><path d="M-34,-318 l5,-27 l17,23 l14,-29 l10,27" stroke="#425342" strokeWidth={8} fill="none"/>{[-14,14].map(dx=><g key={dx}><circle cx={dx} cy={-301} r={12} fill="#E8E5C6"/><circle cx={dx} cy={-301} r={4} fill="#17211E"/></g>)}<ellipse cy={-272} rx={9} ry={10} fill="#26382E"/></g>;};

export const Parking:React.FC<{frame:number;crowd?:boolean;progress?:number}>=({frame,crowd=true,progress=0})=><g>
 <rect width={W} height={H} fill={C.sky}/><path d="M0,650 L140,550 L260,640 L360,590 L470,650 L620,560 L760,640 L920,580 L1080,650 V900 H0Z" fill="#0D2628"/><rect y={630} width={W} height={H-630} fill="#536369"/>
 {[0,1,2,3].map(i=><g key={i}><line x1={80+i*300} y1={860} x2={-600+i*850} y2={H} stroke="#98A9A8" strokeWidth={5} opacity={.6}/><line x1={0} x2={W} y1={980+i*260} y2={980+i*260} stroke="#98A9A8" strokeWidth={4} opacity={.4}/></g>)}
 {[{x:130,y:980,c:'#85593F'},{x:940,y:1020,c:'#C6C6AF'},{x:90,y:1310,c:'#3C4B59'},{x:1010,y:1460,c:'#7A5057'}].map((car,i)=><Car key={i} x={car.x} y={car.y-170} color={car.c} scale={.65+i*.15}/>)}
 {[170,720].map((x,i)=><g key={x}><rect x={x} y={480+i*60} width={12} height={460} fill="#263F48"/><path d={`M${x},${480+i*60} q-50,-22 -86,8`} stroke="#263F48" strokeWidth={10} fill="none"/><ellipse cx={x-76} cy={486+i*60} rx={29} ry={9} fill="#E8C377"/><ellipse cx={x-76} cy={700+i*60} rx={115} ry={290} fill="#EAC87E" opacity={.035}/></g>)}
 <Cart x={230} y={990} scale={.8}/>
 {crowd?[{x:330,y:1280,s:.65},{x:700,y:1480,s:.9},{x:490,y:1050,s:.48},{x:100,y:1500,s:.9},{x:900,y:1160,s:.6}].map((z,i)=><Threat key={i} x={z.x+(540-z.x)*progress*.15} y={z.y-120+progress*120} scale={z.s+progress*.12} frame={frame} index={i}/>):null}
 <rect width={W} height={H} fill="#071117" opacity={.1}/>
 </g>;

export const Exterior:React.FC<{frame:number;crowd?:boolean}>=({frame,crowd=false})=><g>
 <defs><linearGradient id="pr-sky" x2="0" y2="1"><stop stopColor="#071720"/><stop offset="1" stopColor="#213D46"/></linearGradient></defs><rect width={W} height={H} fill="url(#pr-sky)"/>
 {[80,180,310,820,970].map((x,i)=><path key={x} d={`M${x-95},850 L${x},${480+i%2*70} L${x+95},850 Z`} fill="#0C2525"/>)}
 <rect y={1220} width={W} height={H-1220} fill="#26343C"/>{[-2,-1,0,1,2].map(i=><line key={i} x1={540+i*200} y1={1280} x2={540+i*500} y2={H} stroke="#7E8D8D" strokeWidth={4} opacity={.45}/>)}
 <rect x={80} y={820} width={920} height={420} fill="#D1C7AF"/><rect x={70} y={760} width={940} height={95} fill="#4A3A37"/>
 <rect x={105} y={860} width={870} height={345} fill="#F2E4B8"/>{Array.from({length:10},(_,i)=><g key={i}><rect x={112+i*86} y={865} width={5} height={340} fill="#6A7469"/>{[0,1,2].map(j=><g key={j}><rect x={118+i*86} y={960+j*77} width={77} height={7} fill="#ACA087"/>{[0,1,2].map(k=><Merchandise key={k} x={130+i*86+k*22} y={960+j*77} scale={.38} seed={i+j+k}/>)}</g>)}</g>)}
 <rect x={585} y={900} width={240} height={340} fill="#A89F85"/><rect x={600} y={915} width={210} height={310} fill="#A3B3A2" opacity={.7}/><line x1={705} x2={705} y1={915} y2={1225} stroke="#D9D5B7" strokeWidth={12}/><rect x={570} y={882} width={270} height={30} fill="#70483C"/>
 <PracticeCashier x={400} y={1200} scale={.26} frame={frame} pose="walk"/>
 <Cart x={880} y={1260} scale={.45}/><Cart x={940} y={1270} scale={.42}/><Car x={50} y={1390} scale={.7} color="#1B2B36"/><Car x={1080} y={1410} scale={.65} color="#313D45"/>
 {crowd?[240,500,820].map((x,i)=><Threat key={x} x={x} y={1640+i%2*100} scale={.9} frame={frame} index={i}/>):null}
 <rect width={W} height={H} fill="#071219" opacity={.15}/>
 </g>;

export const Aisle:React.FC<{frame:number;dark?:boolean;actor?:boolean}>=({frame,dark=false,actor=false})=><g>
 <rect width={W} height={H} fill="#DAD4BE"/><path d="M0,0 H1080 L740,560 H340 Z" fill="#444E4A"/><path d="M0,1920 H1080 L740,1100 H340 Z" fill={C.floor}/><rect x={340} y={560} width={400} height={540} fill="#BDB69C"/>
 {[-1,1].map(side=><g key={side}><path d={side<0?'M0,200 L340,560 V1230 L0,1850Z':'M1080,200 L740,560 V1230 L1080,1850Z'} fill="#343C36"/>{Array.from({length:5},(_,level)=>{const near=400+level*270,far=610+level*115;return <g key={level}><polygon points={side<0?`0,${near} 340,${far} 340,${far+35} 0,${near+70}`:`1080,${near} 740,${far} 740,${far+35} 1080,${near+70}`} fill={C.shelf}/>{Array.from({length:17},(_,k)=>{const t=(k+.2)/17,x=side<0?340*t:1080-340*t,y=near+(far-near)*t;return <Merchandise key={k} x={x} y={y-4} scale={(1.1-.77*t)*1.4} seed={k+level*3+(side<0?0:2)}/>;})}</g>;})}</g>)}
 {[0,1,2,3].map(i=><polygon key={i} points={`${500+i*7},${70+i*145} ${580-i*7},${70+i*145} ${568-i*5},${155+i*115} ${512+i*5},${155+i*115}`} fill="#EEEBD4"/>)}
 <Cart x={670} y={1220} scale={.42}/><rect x={655} y={1030} width={70} height={95} fill="#B19F47"/>
 {actor?<PracticeCashier x={470} y={1690} scale={.7} frame={frame} panic={dark} pose={dark?'light':'idle'}/>:<PracticeCashier x={620} y={1180} scale={.28} frame={frame} pose="walk"/>}
 {dark?<><rect width={W} height={H} fill="#061117" opacity={.79}/><path d="M610,1370 L260,1900 H950Z" fill="#ECE7BE" opacity={.07}/>{actor?<PracticeCashier x={470} y={1690} scale={.7} frame={frame} pose="light"/>:null}</>:null}
 </g>;

const PaperBag:React.FC<{x:number;y:number;scale?:number}>=({x,y,scale=1})=><g transform={`translate(${x} ${y}) scale(${scale})`}><path d="M-65,-190 Q-70,-315 -35,-315 Q-10,-315 -7,-190 M0,-190 Q0,-305 34,-305 Q64,-305 65,-190" stroke="#9B8157" strokeWidth={6} fill="none"/><path d="M-90,-210 H90 L115,70 L75,98 H-95Z" fill="#AB8F59"/><path d="M75,-210 L115,70 L75,98Z" fill="#806943"/></g>;
const Radio:React.FC<{x:number;y:number;scale?:number;frame:number}>=({x,y,scale=1,frame})=><g transform={`translate(${x} ${y}) rotate(-9) scale(${scale})`}><rect x={-30} y={-300} width={22} height={190} rx={8} fill="#1A2A2D"/><rect x={-80} y={-150} width={170} height={280} rx={23} fill="#344B51"/><circle cx={57} cy={-160} r={14} fill={frame%45<12?'#D0573B':'#576B51'}/><rect x={-57} y={-115} width={120} height={65} rx={6} fill="#93AE87"/>{[0,1,2,3,4].map(i=><rect key={i} x={-60} y={-13+i*25} width={125-i%2*15} height={11} rx={5} fill="#192D36"/>)}</g>;
export const RadioInsert:React.FC<{frame:number;dark?:boolean}>=({frame,dark=false})=><g><rect width={W} height={H} fill={C.wall}/><rect x={0} y={400} width={400} height={40} fill="#425445"/>{[0,1,2].map(i=><Merchandise key={i} x={60+i*100} y={395} scale={1.5} seed={i}/>)}<polygon points="-100,840 860,760 1180,1380 0,1550" fill="#577172"/><polygon points="0,1550 1180,1380 1180,1920 0,1920" fill="#253D43"/><PaperBag x={265} y={1060} scale={1.1}/><Radio x={700} y={1160} scale={1.15} frame={frame}/>{dark?<rect width={W} height={H} fill="#071218" opacity={.7}/>:null}</g>;

export const Counter:React.FC<{frame:number;alert?:boolean;phone?:boolean}>=({frame,alert=false,phone=false})=><g>
 <rect width={W} height={H} fill={C.wall}/><rect x={600} y={450} width={480} height={800} fill="#192F38"/><svg x={600} y={450} width={480} height={800} viewBox="0 650 1080 1270" preserveAspectRatio="xMidYMid slice"><Parking frame={frame} crowd={false}/></svg><path d="M600,450 V1250 M840,450 V1250 M600,850 H1080" stroke="#B7BCAF" strokeWidth={15}/>
 {Array.from({length:5},(_,j)=><g key={j}><rect x={0} y={500+j*150} width={500} height={22} fill="#E7DEC0"/>{Array.from({length:10},(_,i)=><Merchandise key={i} x={25+i*48} y={497+j*150} scale={.73} seed={i+j}/>)}</g>)}
 <rect x={400} y={310} width={310} height={100} rx={8} fill="#1D2929"/>{txt(555,380,'22:52',64,'#D45142')}
 <PracticeCashier x={650} y={1740} scale={1.2} frame={frame} pose={alert?'alert':phone?'phone':'idle'} panic={alert}/>
 <polygon points="-20,1290 850,1290 1090,1510 -20,1590" fill="#65827E"/><polygon points="-20,1590 1090,1510 1090,1920 -20,1920" fill="#345157"/>
 <path d="M65,1190 L270,1170 L300,1420 L100,1440Z" fill="#183437"/><path d="M90,1210 L250,1198 L270,1330 L110,1345Z" fill="#31575B"/><rect x={280} y={1380} width={160} height={70} rx={9} fill="#233F43"/>
 <PaperBag x={590} y={1400} scale={1.05}/><Radio x={875} y={1450} scale={.46} frame={frame}/>
 </g>;

export const Door:React.FC<{frame:number;progress?:number;pull?:boolean;walk?:boolean;closed?:boolean}>=({frame,progress=0,pull=false,walk=false,closed=false})=>{
 const down=closed?1:progress;
 const cashierX=walk?450-ease(frame/60)*250:200;
 const cashierScale=1.05;
 const chainX=cashierX+CASHIER_GEOM.chainHandX*cashierScale;
 return <g><rect width={W} height={H} fill={C.wall}/><g transform="matrix(1 -.12 0 1 0 80)"><rect x={220} y={380} width={860} height={1170} fill="#13232A"/><svg x={240} y={410} width={840} height={1120} viewBox="0 480 1080 1440" preserveAspectRatio="xMidYMid slice"><Parking frame={frame} progress={progress*.6}/></svg>
 <path d="M240,410 V1530 M630,410 V1530 M240,970 H1080" stroke="#4D6368" strokeWidth={20}/><path d="M280,450 L390,450 L240,1380Z" fill="#DBE3CB" opacity={.08}/>
 <rect x={225} y={370} width={855} height={100} rx={35} fill="#AFB9AF"/><line x1={235} x2={1080} y1={410} y2={410} stroke="#7C8F8A" strokeWidth={13}/>
 {down>0?<g><rect x={245} y={465} width={835} height={1055*down} fill={C.steel}/>{Array.from({length:Math.ceil(1055*down/42)},(_,i)=><line key={i} x1={245} x2={1080} y1={475+i*42} y2={475+i*42} stroke="#6A807E" strokeWidth={7}/>)}<rect x={245} y={465+1055*down-17} width={835} height={22} fill="#607572"/></g>:null}
 </g><rect y={1550} width={W} height={H-1550} fill="#CFC4A7"/><path d="M360,1550 L960,1550 L1030,1630 H300Z" fill="#394942"/>
 <Cart x={170} y={1490} scale={.9}/><Basket x={445} y={1560} scale={.68}/><Basket x={1030} y={1605} scale={.72}/>
 <PracticeCashier x={cashierX} y={1730} scale={cashierScale} frame={frame} pose={pull?'pull':walk?'walk':closed?'idle':'phone'} panic={pull}/>
 {pull?<g><path d={`M${chainX},800 V1640 Q${chainX},1680 ${chainX-42},1660 V815`} stroke="#37463B" strokeWidth={11} fill="none"/><path d={`M${chainX},800 V1640 Q${chainX},1680 ${chainX-42},1660 V815`} stroke="#A2ACA1" strokeWidth={5} strokeDasharray="7 12" strokeDashoffset={-frame*4} fill="none"/></g>:null}
 </g>;
};

export const MapView:React.FC<{frame:number;p:number}>=({frame,p})=><g>
 <rect width={W} height={H+900} fill="#182B30"/>{Array.from({length:8},(_,i)=><g key={i}><rect x={10+i*143} y={140} width={95} height={125} rx={4} fill="#66766A"/><rect x={20+i*143} y={160} width={75} height={45} fill="#879486"/></g>)}
 <rect x={0} y={300} width={W} height={150} fill="#3B4E50"/><line x1={0} x2={W} y1={375} y2={375} stroke="#C1C3A1" strokeWidth={4} strokeDasharray="30 24"/>
 <rect x={120} y={490} width={840} height={700} fill="#8D9D98" stroke="#657D78" strokeWidth={14}/>{[[280,680],[700,620],[770,960],[370,1040]].map(([x,y],i)=><g key={i}><rect x={x} y={y} width={65} height={55} rx={7} fill="#6C827D"/><path d={`M${x+12},${y+10} l40,35 M${x+52},${y+10} l-40,35`} stroke="#9DABA4" strokeWidth={4}/></g>)}<rect x={420} y={1135} width={250} height={45} fill="#BDE0DA"/>
 <rect x={0} y={1240} width={W} height={1500} fill="#34494D"/>{Array.from({length:7},(_,i)=><g key={i}><path d={`M${80+i*150},1290 v220 M${80+i*150},1610 v220`} stroke="#A1ADA0" strokeWidth={4}/><Car x={150+i*150} y={1410} color={GOODS[i%GOODS.length]} scale={.67} top/><Car x={140+i*150} y={1740} color={GOODS[(i+2)%GOODS.length]} scale={.65} top/></g>)}
 <rect x={0} y={1950} width={W} height={150} fill="#3B4E50"/><rect x={160} y={2180} width={780} height={560} fill="#6B6650"/><rect x={150} y={2150} width={800} height={70} fill="#3F443D"/><circle cx={540} cy={1150} r={14} fill={C.red}/><circle cx={540} cy={1150} r={26+Math.sin(frame/8)*6} fill="none" stroke={C.red} strokeWidth={3}/>
 {p>.2?<g><rect x={300} y={770} width={480} height={73} rx={22} fill="#E8E4CD"/>{txt(540,820,'STOCK AND WATER',33)}</g>:null}
 {p>.46?<g><rect x={300} y={530} width={480} height={73} rx={22} fill="#E8E4CD"/>{txt(540,580,'SERVICE ACCESS',33)}</g>:null}
 {p>.7?<g><rect x={300} y={1040} width={480} height={73} rx={22} fill="#E8E4CD"/>{txt(540,1090,'FRONT BARRIER',33)}</g>:null}
 </g>;

export const Phone:React.FC<{frame:number;p:number}>=({frame,p})=>p>.52?<g><rect width={W} height={H} fill="#15282E"/>{Array.from({length:7},(_,i)=><g key={i}><line x1={80+i*155} x2={100+i*155} y1={0} y2={H} stroke="#344A4A" strokeWidth={35}/><line x1={0} x2={W} y1={180+i*240} y2={180+i*240} stroke="#344A4A" strokeWidth={35}/></g>)}<path d="M400,0 Q760,700 350,1920" fill="none" stroke="#2C6681" strokeWidth={85}/><circle cx={530} cy={650} r={150+ease((p-.5)*2)*170} fill={C.red} opacity={.35}/><circle cx={570} cy={1570} r={15} fill={C.gold}/></g>:<g><rect width={W} height={H} fill="#17272A"/><rect x={240} y={380} width={600} height={1160} rx={75} fill="#10181A" stroke="#293E43" strokeWidth={13}/><rect x={275} y={430} width={530} height={1050} rx={45} fill="#462628"/>{txt(540,540,'22:52',42,'#E0D6C6')}<rect x={320} y={800} width={440} height={390} rx={22} fill="#71342E"/>{txt(540,890,'LOCAL ALERT',46,'#F1E3CC')}{txt(540,970,'CHECK THE EXIT',39,'#F1E3CC')}<rect x={365} y={1100} width={350} height={55} rx={14} fill="#B0A58F"/>{txt(540,1140,'ACKNOWLEDGE',28)}</g>;

export const Control:React.FC<{p:number}>=({p})=>{
 const hand=1080-ease(p/.5)*450;
 return <g><rect width={W} height={H} fill={C.wall}/><rect x={250} y={550} width={580} height={900} rx={35} fill="#E8E5CD" stroke="#989E8C" strokeWidth={6}/>{txt(540,650,'SHUTTER',44)}<circle cx={540} cy={720} r={13} fill="#4C8E53"/>{[{y:850,c:'#4A8B57',s:'UP'},{y:1040,c:'#B04D3D',s:'DOWN'},{y:1230,c:'#C1A04F',s:'STOP'}].map(button=><g key={button.y}><rect x={365} y={button.y-60} width={350} height={115} rx={50} fill={button.c} stroke="#516052" strokeWidth={6}/>{txt(540,button.y+15,button.s,40,'#EBE6D5')}</g>)}<path d={`M1080,1120 L${hand+50},1060`} stroke={C.green} strokeWidth={80} strokeLinecap="round"/><ellipse cx={hand} cy={1040} rx={43} ry={27} fill={C.skin}/><path d={`M${hand-25},1038 h-75`} stroke={C.skin} strokeWidth={22} strokeLinecap="round"/></g>;
};
export const Mechanism:React.FC<{frame:number}>=({frame})=><g><rect width={W} height={H} fill={C.wall}/><rect x={270} y={570} width={600} height={180} rx={18} fill="#A3AFAB" stroke="#3F5559" strokeWidth={5}/><circle cx={455} cy={660} r={57} fill="none" stroke="#3C5257" strokeWidth={7}/>{[0,1,2].map(i=><line key={i} x1={455} y1={660} x2={455+50*Math.cos(i*Math.PI*.66)} y2={660+50*Math.sin(i*Math.PI*.66)} stroke="#3C5257" strokeWidth={5}/>)}<rect x={650} y={610} width={150} height={100} rx={15} fill="#4D666C"/>{Array.from({length:9},(_,i)=><rect key={i} x={285} y={755+i*76} width={570} height={72} fill="#A4B0AA" stroke="#607874" strokeWidth={4}/>)}<path d="M260,650 H220 V1500 Q220,1540 260,1510 V690" fill="none" stroke="#45605B" strokeWidth={8} strokeDasharray="8 12" strokeDashoffset={-frame*3}/>{txt(570,520,'MOTOR',36)}{txt(255,1610,'MANUAL RELEASE',34)}</g>;
export const Gap:React.FC<{frame:number;p:number}>=({frame,p})=><g><rect width={W} height={H} fill="#101C21"/><rect y={1530} width={W} height={390} fill="#B8B091"/><rect width={W} height={1220+Math.sin(frame/6)*8} fill={C.steel}/>{Array.from({length:27},(_,i)=><line key={i} x1={0} x2={W} y1={i*46} y2={i*46} stroke="#677F7B" strokeWidth={7}/>)}{[280,530,800].map((x,i)=><g key={x} transform={`translate(${x} ${1240+Math.sin(frame/9+i)*8+ease(p)*20})`}><path d="M0,125 V0" stroke="#72845D" strokeWidth={22} strokeLinecap="round"/><ellipse cy={0} rx={23} ry={19} fill="#89986D"/>{[-18,-6,6,18].map(dx=><path key={dx} d={`M${dx},0 v-25`} stroke="#89986D" strokeWidth={8} strokeLinecap="round"/>)}</g>)}</g>;

export const Stage:React.FC<StageProps>=({shot,frame,local,p})=>{
 const id=shot.id;
 if(shot.stage==='exterior')return <Exterior frame={local} crowd={id>=18}/>;
 if(shot.stage==='aisle')return <Aisle frame={local} dark={id>=29}/>;
 if(shot.stage==='counter')return <Counter frame={local} alert={id===5||id===7} phone={id===9}/>;
 if(shot.stage==='radio')return <RadioInsert frame={local} dark={id>=32}/>;
 if(shot.stage==='phone')return <Phone frame={local} p={p}/>;
 if(shot.stage==='parking')return <Parking frame={local} progress={p*.4}/>;
 if(shot.stage==='door')return <Door frame={local} walk={id===10} progress={id===22?.65*p:id>=27?1:0} closed={id>=27}/>;
 if(shot.stage==='map')return <MapView frame={local} p={id===17?p:0}/>;
 if(shot.stage==='control')return <Control p={p}/>;
 if(shot.stage==='mechanism')return <Mechanism frame={local}/>;
 if(shot.stage==='chain')return <Door frame={local} pull progress={id===24?.65+.3*p:.98+.02*p}/>;
 if(shot.stage==='gap')return <Gap frame={local} p={p}/>;
 if(shot.stage==='dark')return <g><Aisle frame={local} dark actor/>{id===30?<g transform={`translate(540 850) rotate(-3)`}><rect x={-365} y={-145} width={730} height={260} rx={8} fill="#E3E2CC"/>{txt(0,-65,'INVENTORY',48)}<line x1={-300} x2={300} y1={-20} y2={-20} stroke="#68796B" strokeWidth={3}/>{txt(-300,32,'FOOD  /  WATER  /  FIRST AID',30,C.ink,'start')}</g>:null}</g>;
 return <g><rect width={W} height={H} fill="#081619"/>{txt(540,950,'VISUAL STUDY',88,'#E6E1C9')}<rect x={390} y={1000} width={300} height={6} fill={C.red}/>{txt(540,1080,'PRIVATE PRACTICE',34,'#B5BBA5')}</g>;
};
