import React from 'react';
import type {EnvProps} from '../v2/Forest';
import {Character2} from '../v2/Character';
import {CAST2} from '../v2/cast';
import {Set,Actor,Door,residents,PhoneFrame,Worker,Chair,Cabinet,label,phase,mix} from './FloodEscape';

const SittingJaab:React.FC<{x:number;y:number;s:number;p:number;f:number;id:string}>=({x,y,s,p,f,id})=><g transform={`translate(${x} ${y}) scale(${s})`}>
  <defs><clipPath id={id}><rect x="-260" y="-1100" width="520" height="710"/></clipPath></defs>
  <g clipPath={`url(#${id})`}><Character2 look={CAST2.jaab} pose="hold" expr="smile" turn={.3} frame={f} torch={false}/></g>
  {[-1,1].map((side,i)=>{const hip=side*40,knee=mix(hip,150+i*75,p),foot=mix(hip,130+i*75,p),fy=mix(0,-100,p);return <g key={side}><path d={`M${hip},-400 L${knee},${mix(-200,-360,p)} L${foot},${fy}`} stroke={CAST2.jaab.pants} strokeWidth="52" strokeLinecap="round" fill="none"/><ellipse cx={foot+17*p} cy={fy+7} rx="40" ry="15" fill="#d6d7c9"/></g>})}
</g>;

const Bag: React.FC<{x?:number;y?:number}> = ({x=590,y=1120}) => <g transform={`translate(${x} ${y})`}><path d="M-110,-70 Q0,-115 110,-70 L85,100 Q0,135 -85,100Z" fill="#786c57" stroke="#baaa88" strokeWidth="7"/><ellipse cy="-70" rx="110" ry="35" fill="#182837"/><path d="M-70,-85 Q0,-200 70,-85" fill="none" stroke="#bcac8c" strokeWidth="12"/></g>;
const Phone:React.FC<{x:number;y:number;cracked?:boolean}> = ({x,y,cracked})=><g transform={`translate(${x} ${y})`}><rect x="-25" y="-45" width="50" height="90" rx="7" fill="#101d2a" stroke="#a1bec3" strokeWidth="4"/><rect x="-19" y="-35" width="38" height="65" fill="#709eac"/>{cracked?<path d="M-18,-31 L8,-8 -9,4 18,26 M8,-8 L19,-20" stroke="#d8e4da" fill="none" strokeWidth="3"/>:null}</g>;

export const FloodRing:React.FC<EnvProps>=({frame,progress=0})=><Set warm><Door x={660} y={430} w={270} h={720} open={.5}/><Actor x={325} y={1320} s={.69} f={frame} expr="shock" turn={.25}/><ellipse cx="325" cy="947" rx="39" ry="59" fill="#b7eaff" opacity={.18+Math.sin(frame/3)*.12}/><Actor who="floodThug" x={790} y={1430} s={.98} f={frame} pose="hold" expr="angry" turn={mix(-.05,-.65,phase(progress,.1,.4))}/><Cabinet x={825} y={1310}/></Set>;
export const FloodRewind:React.FC<EnvProps>=({frame,progress=0})=><Set warm><Door x={750} y={490} w={240} h={600} number="606" open={.8}/>{residents.map((look,i)=><Actor key={i} look={look} x={180+i%4*170} y={1040+Math.floor(i/4)*170} s={.29} f={frame+i*9} turn={.25} expr="sweat"/>)}<Cabinet x={845}/><Actor x={mix(160,340,phase(progress,.05,.8))} y={1335} s={.49} f={frame} walk={progress<.8} turn={.6}/></Set>;
export const FloodStall:React.FC<EnvProps>=({frame,progress=0})=><Set warm><Door x={620} y={380} w={300} h={790} open={.7}/><Actor who="floodThug" x={795} y={1110} s={.48} f={frame} pose="armsCrossed" expr="angry"/><Cabinet x={780} y={1090}/><Actor x={300} y={1480} s={.86} f={frame} back pose={progress>.35?'hold':'idle'}/><Bag x={505} y={1180}/></Set>;
export const FloodDecoy:React.FC<EnvProps>=({frame,progress=0})=>{const p=phase(progress,.12,.48);return <Set warm><Worker id="f3-decoy" who="mum" x={mix(290,350,p)} y={1320} s={.66} f={frame} expr="smile" hands={[[mix(290,350,p)-30,960],[mix(mix(390,510,p),420,phase(progress,.48,.65)),mix(mix(930,1010,p),960,phase(progress,.48,.65))]]}/><Actor x={790} y={1320} s={.63} f={frame} pose="hold" turn={-.35}/><Phone x={mix(390,510,p)} y={mix(930,1010,p)} cracked/><Bag x={510} y={1060}/><Phone x={770} y={mix(1020,965,phase(progress,.48,.8))}/><path d="M730,920 Q770,900 812,922 V1015 H730Z" fill="#238c91" opacity={phase(progress,.65,.9)}/></Set>};
export const FloodUpload:React.FC<EnvProps>=()=> <Set><PhoneFrame><rect x="285" y="490" width="510" height="700" fill="#203b4a"/>{label(540,590,'กลุ่มกู้ภัย',42)}{label(540,685,'คลิป + ตำแหน่งตึก',31)}{label(540,840,'12%',85,'#d9d6aa')}<rect x="340" y="900" width="400" height="24" rx="12" fill="#102434"/><rect x="340" y="900" width="48" height="24" rx="12" fill="#9acbb0"/>{label(540,1035,'สัญญาณ  ▂ · · ·',32)}{label(540,1125,'แบตเตอรี่ 9%',32,'#efb597')}</PhoneFrame><path d="M100,400 Q290,420 290,1350 M980,400 Q790,420 790,1350" stroke="#185c64" strokeWidth="100" opacity=".7" fill="none"/></Set>;
export const FloodCount:React.FC<EnvProps>=({frame,progress=0})=><Set><Actor x={865} y={1170} s={.34} f={frame} expr="shock"/><Actor who="floodThug" x={430} y={1480} s={1.04} f={frame} pose={progress<.6?'hold':'point'} expr="angry" turn={.2}/><g transform="translate(54 -60) scale(.9 .72)"><path d="M-100,1600 L110,1150 Q540,1390 970,1150 L1200,1600Z" fill="#85765e" stroke="#b5a889" strokeWidth="18"/>{[0,1,2,3,4,5,6].map(i=><Phone key={i} x={160+i*125} y={1370+i%2*80}/>)}</g>{progress>.6?label(780,550,'ขาดไปเครื่องนึง',42,'#edba8d'):null}</Set>;
export const FloodChairSwing:React.FC<EnvProps>=({frame,progress=0})=>{const hit=phase(progress,.32,.47);const x=mix(430,580,hit),y=mix(1020,980,hit);return <Set warm><Door x={590} y={420} w={320} h={740} open={.75}/><Actor who="floodThug" x={mix(750,855,phase(progress,.47,.7))} y={1190} s={.58} f={frame} expr="shock" turn={-.4}/><Actor x={235} y={1330} s={.5} f={frame} expr="shock"/><Worker id="finale-swing" who="mum" x={x-30} y={1300} s={.62} f={frame} expr="angry" hands={[[x-56,y-10],[x+60,y+20]]}/><Chair x={x} y={y}/><Cabinet x={890} y={1150}/></Set>};
export const FloodDoorLatch:React.FC<EnvProps>=({frame,progress=0})=>{const p=phase(progress,.02,.58),close=phase(progress,.58,.76);return <Set><Door x={340} y={420} w={340} h={700} open={.85*(1-close)}/>{progress<.68?<g><path d="M650,820 l-45,10 -20,45 55,10" fill="#deb08b" stroke="#4a7159" strokeWidth="18"/></g>:null}<Actor x={mix(760,470,p)} y={mix(1410,1130,p)} s={mix(.73,.4,p)} f={frame} back walk={progress<.58} pose="hold"/><rect x="580" y="830" width="155" height="42" rx="7" fill="#243747"/><rect x={mix(655,590,phase(progress,.8,.94))} y="839" width="100" height="24" rx="6" fill="#c3c7b8"/>{label(510,380,'ประตูบริการ',34)}</Set>};
export const FloodWindowSignal:React.FC<EnvProps>=({frame,progress=0})=><g><rect width="1080" height="1920" fill="#182c40"/><rect x="90" y="250" width="900" height="1230" fill="#526879"/>{[0,1,2].map(row=>[0,1,2].map(col=><rect key={`${row}-${col}`} x={165+col*270} y={390+row*320} width="170" height="220" fill="#152d42"/>))}<Actor x={520} y={929} s={.22} f={frame} pose="wave"/><circle cx="550" cy="800" r={frame%20<10?18:7} fill="#fff3c9"/><path d={`M900,1500 L${mix(100,430,phase(progress,.1,.9))},700 L690,700Z`} fill="#f2e7af" opacity=".16"/><rect y="1460" width="1080" height="460" fill="#2f5268"/><path d="M650,1490 H1040 L980,1600 H720Z" fill="#af6248"/>{label(845,1550,'กู้ภัย',33)}</g>;
export const FloodSearchlight:React.FC<EnvProps>=({frame,progress=0})=><Set warm>
  {/* The opening and its mullions belong to the wall, behind the actor. */}
  <rect x="610" y="440" width="340" height="820" fill="#183345" stroke="#7f9298" strokeWidth="22"/>
  <path d="M780,450 V1250 M620,850 H940" stroke="#69828c" strokeWidth="16"/>
  <path d={`M960,520 L${mix(800,160,phase(progress,.03,.55))},620 L120,1370 L960,1150Z`} fill="#fff2ba" opacity=".25"/>
  <g style={{filter:'drop-shadow(7px -3px 0 rgba(255,237,168,.65))'}}><Actor x={345} y={1290} s={.72} f={frame} pose="wave" expr="smile" turn={.3}/></g>
  <ellipse cx="350" cy="885" rx="115" ry="230" fill="#fff0b0" opacity={phase(progress,.2,.6)*.14}/>
</Set>;

export const FloodArrest:React.FC<EnvProps>=({frame,progress=0})=>{
  const climb=phase(progress,.1,.85);
  return <g style={{fontFamily:'Sarabun, sans-serif'}}>
    <rect width="1080" height="1920" fill="#284b60"/>
    {/* Building foot and submerged doorway establish where the water begins. */}
    <path d="M-30,200 H1110 V670 H-30Z" fill="#536978"/>
    <path d="M-30,200 H1110 V270 H-30Z" fill="#344b5d"/>
    {[100,420,740].map(x=><g key={x}><rect x={x} y="330" width="190" height="330" fill="#1b3143" stroke="#85969b" strokeWidth="12"/><path d={`M${x},610 h190`} stroke="#a9b7b6" strokeWidth="7"/></g>)}
    <path d="M0,650 Q160,628 320,650 T640,650 T1080,650 V1920 H0Z" fill="#315f75"/>
    <path d="M0,650 Q160,628 320,650 T640,650 T1080,650" fill="none" stroke="#a1bec2" strokeWidth="9"/>
    {[740,900,1110,1280,1500,1720].map((y,i)=><path key={y} d={`M-40,${y} q160,-20 320,0 t320,0 t520,0`} transform={`translate(${Math.sin(frame/28+i)*12} 0)`} fill="none" stroke="#84a9b5" strokeWidth="4" opacity=".4"/>)}
    {/* A level hull, pointed bow, inset deck and blue police light. */}
    <path d="M365,835 H850 L1010,1010 L875,1210 H360 L275,1010Z" fill="#152c40" stroke="#b0bfc0" strokeWidth="10"/>
    <path d="M385,870 H830 L955,1010 L850,1150 H390 L330,1010Z" fill="#71858a"/>
    <path d="M360,1165 H875 L835,1240 H400Z" fill="#1c3850"/>
    {label(630,1200,'ตำรวจ',38,'#eee5c6')}
    <rect x="910" y="960" width="38" height="20" rx="5" fill="#c6d2ca"/>
    <circle cx="930" cy="948" r="20" fill={frame%24<12?'#88d7ff':'#3b83cc'}/>
    <circle cx="930" cy="948" r="43" fill="#91d9f3" opacity=".12"/>
    {/* The stolen television rests on deck, on its own stand. */}
    <rect x="630" y="840" width="150" height="112" rx="10" fill="#162632" stroke="#b1bdba" strokeWidth="7"/>
    <rect x="645" y="854" width="120" height="80" fill="#466777"/>
    <path d="M703,951 V969 M666,972 H742" stroke="#bec5ba" strokeWidth="9"/>
    {label(704,812,'ทีวีที่ขโมยมา',25,'#eee0b6')}
    {/* A shared wrist target connects the officer to the thug in the water. */}
    <Worker id="f3-pulled" who="floodThug" x={350} y={1190} s={.4} f={frame} expr="shock" hands={[[315,1005],[450,900]]}/>
    <path d="M235,1040 Q350,1060 427,1040 V1270 H230Z" fill="#315f75"/>
    <path d="M245,1042 Q330,1062 415,1042 M250,1080 Q340,1104 425,1080" stroke="#adc9cb" strokeWidth="6" fill="none"/>
    <Worker id="f3-officer" who="runner" x={560} y={1120} s={.42} f={frame} expr="flat" hands={[[450,900],[580,920]]}/>
    <rect x="535" y="731" width="51" height="17" rx="6" fill="#1b344b"/><rect x="554" y="734" width="12" height="12" fill="#ebd79c"/>
    {/* Stern ladder and a second, surrendering climber. */}
    <path d="M790,1150 V1310 M885,1150 V1310 M790,1190 H885 M790,1235 H885 M790,1280 H885" stroke="#b7c6c1" strokeWidth="8" fill="none"/>
    <Actor who="floodThug2" x={825} y={mix(1290,1130,climb)} s={.36} f={frame} expr="sweat" pose={progress>.3?'shock':'hold'}/>
  </g>;
};
export const FloodBatteryDie:React.FC<EnvProps>=({progress=0})=><Set><PhoneFrame><rect x="285" y="490" width="510" height="700" fill="#203b4a"/>{label(540,650,'ส่งถึงกลุ่มกู้ภัยแล้ว',34)}{label(540,860,'100%',90,'#b9dcac')}{label(540,1050,'แบตเตอรี่ 1%',38,'#edaa89')}{progress>.68?<rect x="285" y="490" width="510" height="700" fill="#03090e" opacity={phase(progress,.68,.82)}/>:null}</PhoneFrame></Set>;
export const FloodDawnChair:React.FC<EnvProps>=({frame,progress=0})=>{const sit=phase(progress,.45,.8);return <Set warm><path d="M950,510 L270,1260 H1080 V520Z" fill="#ffdfa0" opacity=".13"/><Chair x={365} y={1110}/><SittingJaab x={365} y={mix(1320,1430,sit)} s={.59} p={sit} f={frame} id="f3-sit"/><Actor who="mum" x={710} y={1330} s={.62} f={frame} pose={progress<.5?'point':'idle'} expr="smile" turn={-.4}/></Set>};
export const FloodFinale:React.FC<EnvProps>=({frame})=><Set warm>{residents.map((look,i)=><Actor key={i} look={look} x={170+i%4*200} y={1120+Math.floor(i/4)*190} s={.3} f={frame+i*8} expr="smile"/>)}<Chair x={330} y={1190}/><SittingJaab x={330} y={1440} s={.44} p={1} f={frame} id="f3-seated"/>{label(540,475,'จบซีซั่น · กรุงเทพจมน้ำ',43,'#f4d59b')}</Set>;




