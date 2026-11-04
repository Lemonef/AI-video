import React from 'react';
import type {EnvProps} from '../v2/Forest';
import {Actor, phase, mix, label} from './FloodEscape';
import {Darkness, Glow, Shaft, ContactShadow} from './light';

type SetProps = {id: string; lit?: number; children?: React.ReactNode};
const Display: React.FC<{floor?: string}> = ({floor='13'}) => <g><rect x="432" y="360" width="216" height="96" rx="12" fill="#18232d" stroke="#89969e" strokeWidth="7"/>{label(540,432,floor,64,'#ff9b83')}</g>;
const Panel: React.FC<{id: string}> = ({id}) => <g>
  <rect x="0" y="0" width="180" height="630" rx="16" fill="#8898a3" stroke="#c6ced0" strokeWidth="5"/>
  {Array.from({length:21},(_,i)=><g key={i}><circle cx={48+i%2*84} cy={45+Math.floor(i/2)*37} r="15" fill="#253641" stroke="#b2d0dc" strokeWidth="2"/>{label(48+i%2*84,50+Math.floor(i/2)*37,i===0?'G':String(i),13,'#d6edf3')}</g>)}
  <circle cx="90" cy="474" r="35" fill="#9e363d" stroke="#f79c80" strokeWidth="4"/>
  <path d="M77,480 H103 L100,464 Q90,448 80,464Z M86,487 H94" fill="none" stroke="#ffe0bb" strokeWidth="3"/>
  {label(90,526,'EMERGENCY',15,'#fff0d7')}
  <rect x="26" y="546" width="128" height="61" rx="9" fill="#29363f"/>
  {[0,1,2,3,4].map(i=><path key={i} d={`M40,${557+i*9} H119`} stroke="#7d8e96" strokeWidth="3"/>)}
  <Glow id={`${id}-led`} x={143} y={565} r={67} color="#ff4237" strength={.8}/><circle cx="143" cy="565" r="8" fill="#ff6555"/><circle cx="141" cy="563" r="3" fill="#ffd6bb"/>
</g>;
const LiftInterior: React.FC<SetProps & {floor?:string}> = ({id,lit=1,floor,children}) => <g style={{fontFamily:'Sarabun, sans-serif'}}>
  <defs><linearGradient id={`${id}-steel`}><stop stopColor="#697e8a"/><stop offset=".45" stopColor="#b2bec2"/><stop offset=".55" stopColor="#8d9ea6"/><stop offset="1" stopColor="#60717e"/></linearGradient><pattern id={`${id}-speckle`} width="47" height="39" patternUnits="userSpaceOnUse"><rect width="47" height="39" fill="#36434d"/><circle cx="8" cy="12" r="2" fill="#73808a"/><circle cx="35" cy="29" r="1.5" fill="#182933"/></pattern></defs>
  <rect width="1080" height="1920" fill={`url(#${id}-steel)`}/><path d="M0,0 L240,300 V1130 L0,1450Z M1080,0 L840,300 V1130 L1080,1450Z" fill="#738691"/>
  <path d="M0,0 H1080 L840,300 H240Z" fill="#465967"/><rect x="240" y="300" width="600" height="830" fill={`url(#${id}-steel)`}/>
  {[80,170,240,440,640,840,910,1000].map(x=><path key={x} d={`M${x},${x<240||x>840?0:300} V${x<240||x>840?1430:1130}`} stroke="#465966" strokeWidth="3" opacity=".6"/>)}
  <rect x="265" y="490" width="550" height="240" fill="#a9bec4" stroke="#d0d9da" strokeWidth="7"/><path d="M300,500 L490,720 H570 L380,500 M645,500 L790,677" stroke="#e3eceb" strokeWidth="22" opacity=".23"/>
  <path d="M0,1010 L240,900 M840,900 L1080,1010" stroke="#344550" strokeWidth="23"/><path d="M0,1003 L240,893 M840,893 L1080,1003" stroke="#d2d7d5" strokeWidth="10"/>
  <path d="M240,1130 H840 L1080,1450 V1920 H0 V1450Z" fill={`url(#${id}-speckle)`}/>
  <rect x="360" y="115" width="360" height="100" rx="10" fill={lit?'#ecf6f7':'#f0bd78'} stroke="#293c49" strokeWidth="13"/>
  <Display floor={floor}/><g transform="translate(875 525) scale(.7)"><Panel id={`${id}-panel`}/></g>
  <Darkness id={`${id}-dark`} color={lit?'#152234':'#1c1519'} opacity={mix(.8,.24,lit)} lights={lit?[{x:540,y:175,reach:1450}]:[{x:540,y:175,reach:1150},{x:975,y:920,reach:570}]}/>
  {/* power out = the lift's amber emergency light, not horror darkness: this is a rom-com */}{lit>0?null:<Glow id={`${id}-emerg`} x={540} y={170} r={520} color="#ffc27a" strength={.32}/>}{lit>0?<><Shaft id={`${id}-ceiling`} points={[[365,215],[715,215],[1020,1300],[60,1300]]} from={[540,215]} to={[540,1300]} color="#dcecff" opacity={lit*.18}/><Glow id={`${id}-top`} x={540} y={170} r={430} color="#dcecff" strength={lit*.35}/></>:null}
  <Glow id={`${id}-red`} x={975} y={920} r={650} color="#ff453e" strength={lit?.12:.22}/>
  {children}
</g>;
// The inherited actor has a cool base; the outer treatment supplies the practical's local rim.
const Cast: React.FC<React.ComponentProps<typeof Actor> & {lit?:number; warm?:boolean}> = ({lit=1,warm,...props}) => <g style={{filter:warm?'brightness(1.05) drop-shadow(-3px -3px 0 rgba(255,205,140,.45))':lit?'brightness(1.05) drop-shadow(0 -4px 0 rgba(220,235,255,.5))':'brightness(.86) sepia(.3) saturate(1.15) drop-shadow(0 -4px 0 rgba(255,195,125,.5))'}}><Actor {...props}/></g>;
const Phone: React.FC<{x:number;y:number;id:string; low?:boolean}> = ({x,y,id,low}) => <g transform={`translate(${x} ${y})`}><Glow id={id} x={0} y={-8} r={100} color="#b8d9ef" strength={.2}/><rect x="-31" y="-62" width="62" height="113" rx="10" fill="#15222e" stroke="#a2acb2" strokeWidth="4"/><rect x="-24" y="-49" width="48" height="85" rx="3" fill="#b9cbd3"/>{low?<><rect x="-18" y="-35" width="36" height="14" fill="#403941"/><rect x="-16" y="-33" width="6" height="10" fill="#dc444a"/>{label(0,10,'3%',24,'#b42d3b')}</>:null}</g>;
const Speaker: React.FC<{id:string;frame:number;active?:boolean}> = ({id,frame,active=true}) => <g><rect x="530" y="896" width="170" height="115" rx="13" fill="#34414b" stroke="#a89d83" strokeWidth="5"/>{active?<Glow id={`${id}-speaker`} x={615} y={950} r={160} color="#ffd28a" strength={.4+.15*Math.sin(frame*.5)}/>:null}{[0,1,2,3,4,5].map(i=><path key={i} d={`M552,${918+i*14} H678`} stroke={active?'#e7bc79':'#7a807d'} strokeWidth="5" opacity={active?.7+.25*Math.sin(frame*.5):.5}/>)}<circle cx="684" cy="910" r="5" fill={active?'#f3bb68':'#6b655e'}/></g>;
const Lobby: React.FC<{id:string;frame:number;active?:boolean;children?:React.ReactNode;behind?:React.ReactNode}> = ({id,frame,active=true,children,behind}) => <g>
  <defs><linearGradient id={`${id}-floor`} x2="0" y2="1"><stop stopColor="#8c7c69"/><stop offset="1" stopColor="#28323e"/></linearGradient></defs>
  <rect width="1080" height="1920" fill="#55565b"/><rect x="490" y="150" width="550" height="650" fill="#10212f"/>
  {[0,1,2,3,4,5].map(i=><g key={i}><path d={`M${500+i*105},150 V800`} stroke="#6e7779" strokeWidth="11"/><rect x={520+i*90} y={450+i%3*70} width="10" height="7" fill="#e5c58a"/></g>)}
  <rect x="70" y="360" width="330" height="680" fill="#9da6a5" stroke="#343d45" strokeWidth="24"/><path d="M235,370 V1030" stroke="#414e58" strokeWidth="5"/><g transform="translate(-54 85) scale(.53)"><Display/></g>
  <path d="M0,1050 H1080 V1920 H0Z" fill={`url(#${id}-floor)`}/>{[180,410,630,830].map(x=><path key={x} d={`M${x},1080 l-65,760 h80 l20,-760Z`} fill="#ffcd86" opacity=".09"/>)}
  <Darkness id={`${id}-dark`} color="#101c2a" opacity={.66} lights={[{x:850,y:780,reach:720},{x:615,y:950,reach:300}]}/>
  <Glow id={`${id}-lamp`} x={850} y={780} r={570} color="#ffcf89" strength={.55}/>
  {behind}
  <ContactShadow x={735} y={1200} rx={320} ry={30}/><path d="M455,1010 H1050 V1200 H455Z" fill="#6c5344"/><path d="M430,996 H1070 V1035 H430Z" fill="#c0a57e"/><path d="M490,1060 H1015" stroke="#9d7c58" strokeWidth="6"/>
  <path d="M850,998 V830 L900,780" fill="none" stroke="#9d9d8c" strokeWidth="12"/><path d="M810,1000 H890 M840,760 L920,770 L930,815 H820Z" fill="#d0b185"/><ellipse cx="876" cy="815" rx="48" ry="8" fill="#ffe2ad"/>
  <Speaker id={id} frame={frame} active={active}/>
  <g><ellipse cx="170" cy="1210" rx="70" ry="22" fill="#172b35"/><path d="M100,1140 H240 L226,1210 H114Z" fill="#50898a"/><ellipse cx="170" cy="1140" rx="70" ry="20" fill="#9bb8b2"/><path d="M112,1134 Q170,1040 228,1134" fill="none" stroke="#bdc7ba" strokeWidth="7"/></g>
  {children}
</g>;
const Mops:React.FC<{p:number}> = ({p})=><g transform={`rotate(${mix(0,14,p)} 165 1150)`}><path d="M140,1150 L200,620 M190,1150 L250,640" stroke="#c1aa7e" strokeWidth="9"/><path d="M120,1170 l20,-35 35,40 M167,1170 l23,-35 32,40" fill="none" stroke="#c6c9b9" strokeWidth="19"/></g>;
const Chair:React.FC<{x:number;y:number}> = ({x,y})=><g transform={`translate(${x} ${y})`}><rect x="-52" y="-140" width="104" height="105" rx="16" fill="#afbbb1" stroke="#596d70" strokeWidth="7"/><path d="M-60,-35 H60 V-5 H-60Z" fill="#d0d5c5"/><path d="M-45,-5 L-56,80 M45,-5 L56,80" stroke="#a9b8af" strokeWidth="13"/></g>;

// an open palm seen from inside, fingers up, cuff of her cream blouse below: reads as "a hand stopped the doors"
const Hand: React.FC<{x:number;y:number;s?:number;r?:number}> = ({x,y,s=1,r=-8}) => <g transform={`translate(${x} ${y}) scale(${s}) rotate(${r})`} stroke="#9c6f55" strokeWidth="4" strokeLinejoin="round">
  <rect x="-46" y="70" width="92" height="120" rx="14" fill="#e7e1d6" stroke="#a9a196"/><rect x="-46" y="70" width="92" height="20" fill="#bdb5a8" stroke="none"/>
  <rect x="-40" y="-20" width="80" height="100" rx="30" fill="#e8b996"/>
  {[[-30,-78,52],[-10,-92,64],[10,-90,62],[30,-72,48]].map(([fx,fy,h],k)=><rect key={k} x={fx-9} y={fy} width="18" height={h+20} rx="9" fill="#e8b996"/>)}
  <rect x="34" y="0" width="18" height="52" rx="9" fill="#e8b996" transform="rotate(30 43 26)"/>
  <path d="M-24,40 Q0,52 24,40" fill="none" stroke="#c79574" strokeWidth="3"/>
</g>;
export const LiftJolt:React.FC<EnvProps>=({frame,progress:p=0})=>{const shake=frame<10?(1-frame/10)*Math.sin(frame*2.7)*15:0;const lit=p<.03?1:p<.15?(frame%4<2?1:0):.6;return <g transform={`translate(${shake} ${shake*.4})`}><LiftInterior id="lift-liftJolt" lit={lit}><Cast x={270} y={1250} s={.62} f={frame} lit={lit} pose={p<.5?'shock':'idle'} expr={p<.5?'shock':'sweat'} turn={p<.5?0:.6}/><Cast who="fon" x={810} y={1250} s={.62} f={frame} lit={lit} pose={p<.5?'shock':'hold'} expr={p<.5?'shock':'flat'}/><Phone x={800} y={945} id="lift-liftJolt-phone"/></LiftInterior></g>};
export const LiftDoors:React.FC<EnvProps>=({frame,progress:p=0})=>{const close=mix(0,1,phase(p,.35,.75))-.16*phase(p,.75,.83);return <LiftInterior id="lift-liftDoors"><rect x="200" y="300" width="680" height="970" fill="#111d29"/><path d="M200,300 L460,600 H620 L880,300 M200,1270 L460,890 H620 L880,1270" fill="#293b47"/><rect x="485" y="632" width="110" height="45" fill="#28694f"/>{label(540,663,'EXIT',29,'#c7ffe0')}<Glow id="lift-liftDoors-exit" x={540} y={650} r={140} color="#75efa2" strength={.3}/><rect x={-480+680*close/2} y="300" width="680" height="980" fill="#889aa4" stroke="#c1cacc" strokeWidth="10"/><rect x={880-680*close/2} y="300" width="680" height="980" fill="#889aa4" stroke="#c1cacc" strokeWidth="10"/>{/* the arm reaches in from behind the left door and grips the right one: clipped at the left door's edge so it never floats */}{p>.75?<g><defs><clipPath id="lift-liftDoors-reach"><rect x={200+340*close} y="300" width="700" height="980"/></clipPath></defs><g clipPath="url(#lift-liftDoors-reach)"><Hand x={572} y={880} r={84}/></g></g>:null}<Cast x={230} y={1320} s={.8} f={frame} pose={p>.75?'shock':'idle'} expr={p>.75?'shock':'flat'}/></LiftInterior>};
export const LiftRecognize:React.FC<EnvProps>=({frame,progress:p=0})=><LiftInterior id="lift-liftRecognize"><Cast x={360} y={1510} s={.95} f={frame} expr={p>.4?'sweat':'shock'} turn={.4}/><Cast who="fon" x={mix(720,700,phase(p,0,.65))} y={1510} s={.95} f={frame} expr="flat" turn={-.5}/><Phone x={mix(704,684,phase(p,0,.65))} y={1050} id="lift-liftRecognize-phone"/></LiftInterior>;
export const LiftAwkward:React.FC<EnvProps>=({frame,progress:p=0})=>{const lit=p<.72?1:0;return <LiftInterior id="lift-liftAwkward" lit={lit}><Cast x={185} y={1260} s={.59} f={frame} lit={lit} pose="armsCrossed" expr="flat"/><Cast who="fon" x={845} y={1260} s={.59} f={frame} lit={lit} pose="hold" expr="flat"/><Phone x={835} y={975} id="lift-liftAwkward-phone"/></LiftInterior>};
export const LiftPanel:React.FC<EnvProps>=({frame,progress:p=0})=>{const pressFrames=p>0?frame/p*.5:1;const jab=p<.5?Math.max(0,Math.sin((frame/Math.max(1,pressFrames))*Math.PI*8)):0;return <g><rect width="1080" height="1920" fill="#152531"/><g transform="translate(300 220) scale(2.35 1.7)"><Panel id="lift-liftPanel-panel"/></g><Darkness id="lift-liftPanel-dark" color="#180d1b" opacity={.85} lights={[{x:636,y:1180,reach:480},{x:510,y:660,reach:400}]}/><Glow id="lift-liftPanel-red" x={636} y={1180} r={530} color="#ff5545" strength={.7}/><Glow id="lift-liftPanel-buttons" x={510} y={660} r={400} color="#b3d6ee" strength={.15}/><g transform={`translate(${-35+jab*42} ${jab*10})`}><path d="M-50,1340 L320,1135" stroke="#4a7159" strokeWidth="145" strokeLinecap="round"/><path d="M320,1135 L475,1030 L510,1026" fill="none" stroke="#e3b18c" strokeWidth="67" strokeLinecap="round"/></g></g>};
export const LobbyGuard:React.FC<EnvProps>=({frame,progress:p=0})=><Lobby id="lift-lobbyGuard" frame={frame} active={p>.4} behind={<Cast who="liftGuard" x={775} y={p>.4?1180:1240} s={.48} f={frame} warm pose={p>.4?'shock':'yawn'} expr={p>.4?'shock':'sleepy'} turn={p>.4?-.55:0}/>} >{p>.4?[0,1,2].map(i=><path key={i} d={`M${510-i*25},${920-i*15} q${-35-i*9},32 0,64`} fill="none" stroke="#efce8b" strokeWidth="5" opacity={.8-i*.15}/>):null}</Lobby>;
export const LiftBicker:React.FC<EnvProps>=({frame,progress:p=0})=><LiftInterior id="lift-liftBicker" lit={0}><Cast x={320} y={1470} s={.82} f={frame} lit={0} pose="armsCrossed" expr={p>.55?'shock':'flat'} turn={.35}/><Cast who="fon" x={760} y={1470} s={.82} f={frame} lit={0} pose={p>.55?'point':'hold'} expr={p>.55?'angry':'talk'} turn={-.5}/>{/* the 3% beat lands before the point; after it the phone is lowered out of frame instead of floating */}{p>.55?null:<Phone x={784} y={1000} id="lift-liftBicker-phone" low/>}</LiftInterior>;
export const LobbyCrowd:React.FC<EnvProps>=({frame,progress:p=0})=>{const t=phase(p,.2,.55),chair=phase(p,.6,.9);return <g transform="translate(-95 -125) scale(1.16)"><Lobby id="lift-lobbyCrowd" frame={frame} behind={<Cast who="liftGuard" x={mix(980,800,chair)} y={1260} s={.48} f={frame} warm pose={p>.6&&p<.9?'hold':'idle'} expr="smile" turn={-.5} walk={p>.6&&p<.9}/> }><Mops p={phase(p,0,.3)}/><Cast who="cleaner" x={mix(170,420,t)} y={1260} s={.46} f={frame} warm expr="smile" turn={.6} walk={p>.2&&p<.55}/><Cast who="cleaner2" x={mix(290,770,t)} y={1300} s={.47} f={frame} warm expr="talk" turn={-.6} walk={p>.2&&p<.55}/>{p>.6?<Chair x={mix(1030,875,chair)} y={mix(1090,1270,chair)}/>:null}</Lobby></g>};
export const LiftQuestion:React.FC<EnvProps>=({frame,progress:p=0})=><LiftInterior id="lift-liftQuestion" lit={0}><Cast x={340} y={1510} s={.88} f={frame} lit={0} pose={p<.4?'shock':'idle'} expr={p<.4?'shock':'sweat'} turn={.3}/><g transform={`rotate(${mix(7,0,phase(p,.1,.6))} 740 780)`}><Cast who="fon" x={740} y={1510} s={.88} f={frame} lit={0} expr="flat" turn={mix(0,-.6,phase(p,.25,.65))}/></g></LiftInterior>;
export const LiftPressure:React.FC<EnvProps>=()=> <g><LiftInterior id="lift-liftPressure" lit={0}><Cast x={290} y={980} s={.45} f={0} lit={0} expr="sweat" turn={.4}/><Cast who="fon" x={750} y={980} s={.45} f={0} lit={0} expr="flat" turn={-.5}/></LiftInterior><defs><linearGradient id="lift-liftPressure-calm" x2="0" y2="1"><stop stopColor="#171923" stopOpacity="0"/><stop offset=".2" stopColor="#171923" stopOpacity=".64"/><stop offset=".8" stopColor="#171923" stopOpacity=".64"/><stop offset="1" stopColor="#171923" stopOpacity="0"/></linearGradient></defs><rect y="560" width="1080" height="1080" fill="url(#lift-liftPressure-calm)"/><defs><clipPath id="lift-liftPressure-inset"><rect x="650" y="1550" width="380" height="300" rx="35"/></clipPath></defs><g clipPath="url(#lift-liftPressure-inset)"><rect x="650" y="1550" width="380" height="300" fill="#766044"/><g transform="translate(460 1270) scale(.55)"><Cast who="cleaner" x={450} y={1020} s={.44} f={0} warm expr="smile" turn={.6}/><Cast who="liftGuard" x={710} y={990} s={.43} f={0} warm expr="smile" turn={-.4}/><Cast who="cleaner2" x={890} y={1020} s={.44} f={0} warm expr="talk" turn={-.6}/><path d="M350,1010 H1050 V1100 H350Z" fill="#b49970"/><Speaker id="lift-liftPressure-inset" frame={0}/></g></g><rect x="650" y="1550" width="380" height="300" rx="35" fill="none" stroke="#c2a57e" strokeWidth="6"/></g>;
// cast-free lit lift: the cover draws its own big actors on top
export const LiftEmpty:React.FC<EnvProps>=()=> <LiftInterior id="lift-liftEmpty"/>;

// ---- Part 2 sets (docs/lift02-beat-sheet.md) ----
// Handset + base of the desk phone at the guard desk. The receiver only leaves the base after .45,
// because the whole beat is "he put the technician on hold".
const Handset:React.FC<{x:number;y:number;r?:number}> = ({x,y,r=-3})=><g transform={`translate(${x} ${y}) rotate(${r})`}><rect x="-38" y="-9" width="76" height="18" rx="9" fill="#39454f" stroke="#95a0a6" strokeWidth="3"/><rect x="-38" y="-16" width="22" height="32" rx="9" fill="#485560" stroke="#95a0a6" strokeWidth="3"/><rect x="16" y="-16" width="22" height="32" rx="9" fill="#485560" stroke="#95a0a6" strokeWidth="3"/></g>;
const DeskPhone:React.FC<{id:string;frame:number;ringing:boolean;hop:number}> = ({id,frame,ringing,hop})=><g>
  <ellipse cx="512" cy="1008" rx="54" ry="10" fill="#1d1712" opacity=".5"/>
  <rect x="470" y="972" width="86" height="34" rx="7" fill="#303b45" stroke="#8e999f" strokeWidth="4"/>
  {[0,1,2].map(i=><circle key={i} cx={492+i*18} cy={991} r="4.5" fill="#7d888f"/>)}
  {/* the amber hold lamp blinks 10 frames on, 10 off, so it reads as a deliberate hold */}
  <circle cx="546" cy="991" r="4.5" fill={!ringing&&frame%20<10?'#ffb347':'#5a4a37'}/>
  {!ringing&&frame%20<10?<Glow id={`${id}-led`} x={546} y={991} r={26} color="#ffb347" strength={.5}/>:null}
  {ringing?<g><g transform={`translate(0 ${-hop})`}><Handset x={513} y={958}/></g>{[0,1,2].map(i=><path key={i} d={`M${468-i*15},${940-i*9} q${-26-i*8},26 0,52`} fill="none" stroke="#efce8b" strokeWidth="5" opacity={.35+.45*Math.abs(Math.sin(frame*.35-i*.6))}/>)}</g>:<Handset x={444} y={1006} r={-8}/>}
</g>;
// Pink cat-ear case shared by the cafe flashback and the ring insert: the clue must be identical.
const CatPhone:React.FC<{id:string;x:number;y:number;s:number;glow?:string;strength?:number;children?:React.ReactNode}> = ({id,x,y,s,glow='#ffd0b0',strength=.6,children})=><g transform={`translate(${x} ${y}) scale(${s})`}>
  <Glow id={id} x={0} y={0} r={86} color={glow} strength={strength}/>
  <path d="M-20,-56 L-16,-78 L-4,-57Z M4,-57 L16,-78 L20,-56Z" fill="#e9a3b6" stroke="#c9808f" strokeWidth="2.5"/>
  <rect x="-31" y="-56" width="62" height="113" rx="11" fill="#e9a3b6" stroke="#c9808f" strokeWidth="2.5"/>
  <rect x="-24" y="-48" width="48" height="97" rx="5" fill="#f6efe6"/>
  {children}
</g>;
const SnackBag:React.FC<{x:number;y:number}> = ({x,y})=><g transform={`translate(${x} ${y})`}>
  <path d="M-22,-30 H22 L18,34 Q0,42 -18,34Z" fill="#f2efe7" stroke="#b9b3a5" strokeWidth="3"/>
  <path d="M-10,-30 q0,-14 10,-14 q10,0 10,14" fill="none" stroke="#b9b3a5" strokeWidth="3"/>
  <path d="M-14,-26 L-6,-52 L16,-50 L18,-26Z" fill="#d8643a" stroke="#a2452a" strokeWidth="2.5"/>
  <path d="M-6,-52 L-3,-58 L2,-52 L7,-58 L12,-52 L16,-50" fill="#f0c14b"/>
  <path d="M-16,-8 H16 M-17,4 H17" stroke="#d8d2c4" strokeWidth="3"/>
</g>;
const CoffeeCup:React.FC<{x:number;y:number;r:number}> = ({x,y,r})=><g transform={`translate(${x} ${y}) rotate(${r})`}>
  <path d="M-15,-20 H15 L12,12 Q0,19 -12,12Z" fill="#ece7dc" stroke="#a79f90" strokeWidth="3"/>
  <path d="M15,-12 q13,4 0,18" fill="none" stroke="#a79f90" strokeWidth="4"/>
  <ellipse cx="0" cy="-20" rx="15" ry="5" fill="#6b3a22"/>
</g>;
const CafeCup:React.FC<{x:number;y:number}> = ({x,y})=><g transform={`translate(${x} ${y})`}>
  <ellipse cx="0" cy="18" rx="26" ry="8" fill="#5b3a22" opacity=".35"/>
  <path d="M-22,-18 H22 L17,12 Q0,22 -17,12Z" fill="#efe7da" stroke="#b3a692" strokeWidth="3"/>
  <ellipse cx="0" cy="-18" rx="22" ry="7" fill="#6b3a22"/>
  <path d="M22,-10 q16,5 0,20" fill="none" stroke="#b3a692" strokeWidth="4"/>
</g>;

export const LobbyHold:React.FC<EnvProps>=({frame,progress:p=0})=>{const ringing=p<.45;const hop=Math.abs(Math.sin(frame*.55))*6;return <Lobby id="lift-lobbyHold" frame={frame} active behind={<Cast who="liftGuard" x={775} y={ringing?1240:1180} s={.48} f={frame} warm pose={ringing?'idle':'hold'} expr={ringing?'talk':'smile'} turn={ringing?-.72:-.55}/>}><DeskPhone id="lift-lobbyHold-desk" frame={frame} ringing={ringing} hop={hop}/></Lobby>};

export const LiftCafe:React.FC<EnvProps>=({frame,progress:p=0})=><g style={{fontFamily:'Sarabun, sans-serif'}}>
  <defs>
    <linearGradient id="lift-liftCafe-wall" x2="0" y2="1"><stop stopColor="#c49a6f"/><stop offset="1" stopColor="#a37a52"/></linearGradient>
    <linearGradient id="lift-liftCafe-wood" x2="0" y2="1"><stop stopColor="#c08a52"/><stop offset="1" stopColor="#8a5a30"/></linearGradient>
    <radialGradient id="lift-liftCafe-vig" cx=".5" cy=".48" r=".78"><stop offset=".52" stopColor="#2a1a10" stopOpacity="0"/><stop offset="1" stopColor="#2a1a10" stopOpacity=".6"/></radialGradient>
  </defs>
  <rect width="1080" height="1920" fill="url(#lift-liftCafe-wall)"/>
  <rect y="700" width="1080" height="26" fill="#8a6544"/>
  <rect y="1130" width="1080" height="790" fill="#7c5f45"/>
  <g><rect x="70" y="300" width="260" height="380" fill="#f4dcae" stroke="#7a5a3c" strokeWidth="14"/><path d="M200,300 V680 M70,490 H330" stroke="#7a5a3c" strokeWidth="9"/><path d="M86,316 L150,470 M186,316 L250,470" stroke="#e6c48d" strokeWidth="8" opacity=".55"/></g>
  {/* menu board, no lettering: the cafe reads from the chalk shapes alone */}
  <g><rect x="760" y="280" width="280" height="360" rx="8" fill="#2f2c24" stroke="#7a5c3e" strokeWidth="12"/>{[0,1,2,3,4,5].map(i=><path key={i} d={`M790,${330+i*42} H${980-(i%3)*40}`} stroke="#cfc7b0" strokeWidth="5" opacity=".45"/>)}<path d="M900,570 h34 l-5,22 h-24Z" fill="none" stroke="#cfc7b0" strokeWidth="4" opacity=".5"/></g>
  <path d="M540,0 V232" stroke="#4b3a28" strokeWidth="7"/><path d="M500,232 H580 L566,282 H514Z" fill="#384349" stroke="#71808a" strokeWidth="4"/>
  <Darkness id="lift-liftCafe-dark" color="#3a2415" opacity={.28} lights={[{x:540,y:290,reach:900},{x:200,y:500,reach:640},{x:880,y:840,reach:620}]}/>
  <Glow id="lift-liftCafe-lamp" x={540} y={296} r={330} color="#ffdba0" strength={.5}/>
  {/* Fon keeps her back to us so the phone, not her face, is this shot's subject */}
  <Cast who="fon" x={860} y={1150} s={.38} f={frame} warm pose="point" expr="talk" turn={-.9}/>
  <g>
    <rect x="700" y="930" width="380" height="360" fill="#8a5f3c"/><rect x="678" y="906" width="424" height="40" rx="6" fill="#d8b083" stroke="#7a4e2c" strokeWidth="6"/><rect x="700" y="946" width="380" height="16" fill="#6d4a2e" opacity=".6"/>
    <rect x="930" y="842" width="130" height="66" rx="8" fill="#6b6f72" stroke="#4a4f52" strokeWidth="5"/><rect x="946" y="856" width="46" height="30" rx="4" fill="#8f9496"/><rect x="1004" y="858" width="30" height="10" rx="4" fill="#b9bcbe"/>
    {[0,1,2,3].map(i=><circle key={i} cx={754+i*34} cy={896} r={9} fill="#c98d5e" stroke="#8a5f3c" strokeWidth="2"/>)}
  </g>
  <Cast x={300} y={1230} s={.7} f={frame} warm pose="idle" expr={p>.5?'sweat':'flat'} turn={.5}/>
  <g>
    <ellipse cx="540" cy="1100" rx="400" ry="168" fill="#6b4426"/>
    <ellipse cx="540" cy="1050" rx="400" ry="170" fill="url(#lift-liftCafe-wood)" stroke="#7a4e2c" strokeWidth="6"/>
    <ellipse cx="540" cy="1050" rx="330" ry="128" fill="none" stroke="#d9a86c" strokeWidth="3" opacity=".5"/>
    <CafeCup x={300} y={990}/><CafeCup x={790} y={1000}/>
  </g>
  {/* flashback treatment; the phone is redrawn after it so the screen is the hottest thing in frame */}
  <rect width="1080" height="1920" fill="#c9a878" opacity=".4" style={{mixBlendMode:'multiply'}}/>
  <rect width="1080" height="1920" fill="url(#lift-liftCafe-vig)"/>
  <CatPhone id="lift-liftCafe-phone" x={540} y={1085} s={3} glow="#ffd7a8" strength={.6}>
    <rect x="-18" y="-44" width="36" height="8" rx="4" fill="#ded3c6"/><circle cx="-12" cy="-40" r="2" fill="#c3a68f"/><rect x="-4" y="-42" width="18" height="4" rx="2" fill="#cbb9a6"/>
    {label(0,-4,'ที่รัก ❤️',13,'#6b4f44')}
    <rect x="-16" y="14" width="32" height="9" rx="4.5" fill="#ece1d4"/><rect x="-9" y="28" width="25" height="9" rx="4.5" fill="#e2d5c6"/>
  </CatPhone>
</g>;

export const LiftRing:React.FC<EnvProps>=({frame,progress:p=0})=>{const buzz=Math.sin(frame*2.2)*4;const px=865,py=985;return <LiftInterior id="lift-liftRing" lit={0}>
  <Glow id="lift-liftRing-key" x={px} y={py} r={520} color="#8fc4ff" strength={.55}/>
  <Cast x={340} y={1510} s={.88} f={frame} lit={1} expr={p<.35?'shock':'sweat'} turn={.35}/>
  <Cast who="fon" x={740} y={1510} s={.88} f={frame} lit={1} expr={p<.2?'shock':'flat'} turn={-.3}/>
  {/* the phone is the key: a blue wash over the cast so both faces go cool on its side */}
  <Glow id="lift-liftRing-faces" x={px} y={py-70} r={540} color="#8fc4ff" strength={.22}/>
  <g>
    <g transform={`translate(${buzz} 0)`}>
      <CatPhone id="lift-liftRing-phone" x={px} y={py} s={2.3} glow="#bcd9ff" strength={.7}>
        {label(0,-10,'ที่รัก ❤️',10,'#5b4a4a')}
        {label(0,8,'กำลังโทร…',7,'#8c7f74')}
        <rect x="11" y="-51" width="10" height="6" rx="1.5" fill="#b42d3b"/><rect x="21" y="-49" width="2.5" height="2" fill="#b42d3b"/>
        {label(4,-44,'2%',7,'#b42d3b')}
      </CatPhone>
      {/* arcs hug the case's left edge so they pulse into the gap between the two characters */}
      {[0,1,2].map(i=><path key={i} d={`M${785-i*20},${990-i*16} q${-34-i*8},34 0,68`} fill="none" stroke="#bcdcff" strokeWidth="5" opacity={.25+.5*Math.abs(Math.sin(frame*.25-i*.7))}/>)}
    </g>
    {/* her forearm grows out of the blouse from the elbow tucked into her hip up to the wrist, so the hand is attached to her, not floating beside her: the wider shade stroke underneath reads as the sleeve's outline */}
    <path d="M834,1252 Q846,1216 868,1188" fill="none" stroke="#a9a196" strokeWidth="72" strokeLinecap="round"/>
    <path d="M834,1252 Q846,1216 868,1188" fill="none" stroke="#E7E1D6" strokeWidth="64" strokeLinecap="round"/>
    {/* the hand comes after the case and the sleeve: only the fingertips lap its bottom bezel, so the call text stays clean */}
    <Hand x={865} y={1170} s={.8} r={-6}/>
    {/* the cat-hair clue runs down the sleeve's cream cuff, below the phone and outside its box: visible, never labelled */}
    {[[0,0,9,-3],[14,10,10,4],[-8,22,8,6],[10,32,11,-2],[-4,44,9,5],[16,52,8,-4]].map(([hx,hy,ex,ey],k)=><path key={k} d={`M${848+hx},${1252+hy} q${ex},${ey} ${ex*1.8},${ey*1.4}`} fill="none" stroke="#dfd8cf" strokeWidth="3" strokeLinecap="round" opacity={.85}/>)}
  </g>
</LiftInterior>};

export const LobbyPeak:React.FC<EnvProps>=({frame,progress:p=0})=>{const walked=phase(p,0,.35),gasp=p>=.55,lean=phase(p,.55,.7),drop=phase(p,.55,.7);return <g transform="translate(-95 -125) scale(1.16)">
  <Lobby id="lift-lobbyPeak" frame={frame} active behind={<Cast who="liftGuard" x={mix(790,775,lean)} y={1260} s={.48} f={frame} warm pose={gasp?'shock':'idle'} expr={gasp?'shock':'smile'} turn={gasp?-.5:0}/>}>
    <Mops p={1}/>
    <Chair x={870} y={1270}/>
    <Cast who="cleaner" x={mix(380,412,lean)} y={1260} s={.46} f={frame} warm pose={gasp?'shock':'idle'} expr={gasp?'shock':'talk'} turn={.6}/>
    <Cast who="cleaner2" x={mix(720,690,lean)} y={1300} s={.47} f={frame} warm pose={gasp?'shock':'idle'} expr={gasp?'shock':'smile'} turn={-.6}/>
    <SnackBag x={mix(-60,300,walked)+44} y={1205}/>
    <Cast who="runner" x={mix(mix(-60,300,walked),326,lean)} y={1300} s={.46} f={frame} warm pose={gasp?'shock':'idle'} expr={gasp?'shock':'flat'} turn={gasp?.6:0} walk={p<.35}/>
    {/* the coffee starts on the counter right of every head so it never sits on cleaner2's face, then tips in front of the counter so it lands on screen and reads as a spill */}
    <CoffeeCup x={mix(850,845,drop)} y={mix(984,1236,drop)} r={mix(0,120,drop)}/>
    {drop>.9?<g opacity={Math.min(1,(drop-.9)*10)}><ellipse cx={845} cy={1244} rx={46} ry={11} fill="#5a3320" opacity=".8"/>{[[-34,-4],[-14,-10],[12,-8],[30,-2]].map(([sx,sy],k)=><circle key={k} cx={845+sx} cy={1244+sy} r={4-k*.4} fill="#6b3a22"/>)}</g>:null}
  </Lobby>
</g>};

// ---- Part 3 sets (docs/lift03-beat-sheet.md) ----
// A pet-camera feed: a warped room behind a fill-the-frame cat face. Only the cat is in focus, so
// the screen reads as a live call, not a photo.
const CatCam:React.FC<{p:number;frame:number}> = ({p,frame}) => {
  const meow=p<.4?0:p<.65?phase(p,.4,.65):Math.max(0,1-phase(p,.65,.8));
  const flick=Math.sin(frame*.5)*4;
  return <g>
    <defs>
      <clipPath id="lift-liftCatCall-screen"><rect x="-23" y="-47" width="46" height="94" rx="4"/></clipPath>
      <radialGradient id="lift-liftCatCall-room" cx=".5" cy=".45" r=".75"><stop stopColor="#3d4c58"/><stop offset="1" stopColor="#151d24"/></radialGradient>
      <radialGradient id="lift-liftCatCall-fish" cx=".5" cy=".5" r=".7"><stop offset=".5" stopColor="#000" stopOpacity="0"/><stop offset="1" stopColor="#05080b" stopOpacity=".6"/></radialGradient>
    </defs>
    <g clipPath="url(#lift-liftCatCall-screen)">
      <rect x="-23" y="-47" width="46" height="94" fill="url(#lift-liftCatCall-room)"/>
      <rect x="-7" y="-34" width="14" height="26" rx="1" fill="#121920"/><rect x="-4" y="-23" width="8" height="8" fill="#3a4a55"/>
      <path d="M-23,25 Q0,16 23,25 V47 H-23Z" fill="#262e34"/>
      <rect x="-23" y="-47" width="46" height="94" fill="url(#lift-liftCatCall-fish)"/>
      {/* ears flick on a slow sine: the cat is alive, the room is not */}
      <g transform={`rotate(${flick} -13 -19)`}><path d="M-21,-17 L-18,-39 L-4,-24Z" fill="#e08a3c" stroke="#a95f26" strokeWidth="1.2"/><path d="M-18,-22 L-16,-32 L-9,-25Z" fill="#f0b9a0"/></g>
      <g transform={`rotate(${-flick} 13 -19)`}><path d="M21,-17 L18,-39 L4,-24Z" fill="#e08a3c" stroke="#a95f26" strokeWidth="1.2"/><path d="M18,-22 L16,-32 L9,-25Z" fill="#f0b9a0"/></g>
      <ellipse cx="0" cy="0" rx="23" ry="30" fill="#e08a3c"/>
      <path d="M-6,-26 q2,8 0,14 M6,-26 q-2,8 0,14" stroke="#b5682a" strokeWidth="2.2" fill="none" opacity=".7"/>
      <path d="M-22,-21 q9,-5 17,-1 M5,-22 q9,-4 17,1" stroke="#b5682a" strokeWidth="2.4" fill="none" opacity=".8"/>
      <ellipse cx="0" cy="8" rx="14" ry="10" fill="#f4d4b2"/>
      <ellipse cx="-9" cy="-4" rx="4.6" ry="5.4" fill="#2b211c"/><ellipse cx="9" cy="-4" rx="4.6" ry="5.4" fill="#2b211c"/>
      <circle cx="-10.2" cy="-6" r="1.5" fill="#fff"/><circle cx="7.8" cy="-6" r="1.5" fill="#fff"/>
      <path d="M-3,2.5 H3 L0,6Z" fill="#c06a5a"/>
      <ellipse cx="0" cy="11.5" rx={mix(3,8.5,meow)} ry={mix(1.4,7,meow)} fill="#6c2f39"/>
      <ellipse cx="0" cy="14.5" rx={mix(2,6,meow)} ry={mix(.8,4.5,meow)} fill="#d9808c"/>
      <path d="M-12,5 L-22,3 M-12,8 L-22,9 M12,5 L22,3 M12,8 L22,9" stroke="#f6e6d2" strokeWidth=".9" opacity=".75"/>
      {/* a red dot and a red 1%: the generic cam UI, no app branding */}
      <circle cx="-18" cy="-42" r="2.1" fill="#ff4b4b"/>
      <rect x="11" y="-45" width="9" height="4.6" rx="1" fill="none" stroke="#ff6a62" strokeWidth=".9"/>
      <rect x="20" y="-44" width="1.4" height="2.6" fill="#ff6a62"/><rect x="12" y="-44" width="2.2" height="2.4" fill="#ff4b4b"/>
      {label(16,-39,'1%',4.2,'#ff6a62')}
      <path d="M-23,-30 L-6,-47 H2 L-23,-9Z" fill="#fff" opacity=".06"/>
    </g>
  </g>;
};

export const LiftCatCall:React.FC<EnvProps>=({frame,progress:p=0})=>{
  const lean=phase(p,.4,.75);
  return <LiftInterior id="lift-liftCatCall" lit={0}>
    <Darkness id="lift-liftCatCall-dark" color="#101421" opacity={.32} lights={[{x:650,y:960,reach:800},{x:540,y:240,reach:520}]}/>
    <Glow id="lift-liftCatCall-key" x={650} y={960} r={560} color="#8fc4ff" strength={.55}/>
    <Cast x={mix(340,392,lean)} y={1510} s={.88} f={frame} lit={1} expr={p<.4?'sweat':p<.75?'shock':'flat'} turn={p<.4?.12:.3}/>
    <Cast who="fon" x={740} y={1510} s={.88} f={frame} lit={1} expr={p<.6?'flat':'smile'} turn={-.3}/>
    <Glow id="lift-liftCatCall-faces" x={650} y={890} r={520} color="#8fc4ff" strength={.2}/>
    <CatPhone id="lift-liftCatCall-phone" x={650} y={960} s={3.6} glow="#bcd9ff" strength={.8}><CatCam p={p} frame={frame}/></CatPhone>
    {/* the arcs live in the gap between them, only while the mouth is open */}
    {p>.4&&p<.72?[0,1,2].map(i=><path key={i} d={`M${516-i*19},${900-i*34} q${-36-i*9},34 0,68`} fill="none" stroke="#bcdcff" strokeWidth="6" opacity={.25+.5*Math.abs(Math.sin(frame*.4-i*.7))}/>):null}
  </LiftInterior>;
};

// A memory of a stray by a cafe door: small, warm and a little washed out.
const Kitten:React.FC<{x:number;y:number}> = ({x,y}) => <g transform={`translate(${x} ${y}) scale(1.3)`}>
  <ellipse cx="0" cy="0" rx="30" ry="8" fill="#101418" opacity=".5"/>
  <path d="M18,-16 q22,6 12,18" fill="none" stroke="#c9cecd" strokeWidth="7" strokeLinecap="round"/>
  <ellipse cx="0" cy="-20" rx="19" ry="21" fill="#ccd1d0"/>
  <ellipse cx="0" cy="-14" rx="12" ry="14" fill="#e6e8e5"/>
  <path d="M-8,-35 L-11,-54 L2,-42Z M8,-35 L11,-54 L-2,-42Z" fill="#ccd1d0" stroke="#a3adae" strokeWidth="1.5"/>
  <path d="M-7,-38 L-9,-47 L-1,-41Z M7,-38 L9,-47 L1,-41Z" fill="#e7b7b3"/>
  <circle cx="0" cy="-50" r="17" fill="#dadfdd"/>
  <path d="M-11,-58 q6,-3 10,0 M1,-58 q6,-3 10,0" stroke="#9aa5a6" strokeWidth="2.6" fill="none" opacity=".7"/>
  <ellipse cx="-6" cy="-52" rx="3.4" ry="4" fill="#28313a"/><ellipse cx="6" cy="-52" rx="3.4" ry="4" fill="#28313a"/>
  <circle cx="-7" cy="-53.4" r="1.1" fill="#fff"/><circle cx="5" cy="-53.4" r="1.1" fill="#fff"/>
  <path d="M-2,-47 H2 L0,-45Z" fill="#d99a9a"/>
  <path d="M-14,-48 L-23,-50 M-14,-45 L-23,-44 M14,-48 L23,-50 M14,-45 L23,-44" stroke="#eef0ec" strokeWidth="1.1" opacity=".9"/>
  <path d="M-9,-38 q9,5 18,0" stroke="#a7b1b2" strokeWidth="1.6" fill="none" opacity=".7"/>
</g>;

export const LiftCafeKitten:React.FC<EnvProps>=({frame,progress:p=0})=>{
  const first=p<.5;
  return <g style={{fontFamily:'Sarabun, sans-serif'}}>
    <defs>
      <linearGradient id="lift-liftCafeKitten-sky" x2="0" y2="1"><stop stopColor="#243544"/><stop offset="1" stopColor="#121a23"/></linearGradient>
      <linearGradient id="lift-liftCafeKitten-glass" x2="0" y2="1"><stop stopColor="#ffe0a2"/><stop offset="1" stopColor="#d08d4c"/></linearGradient>
      <linearGradient id="lift-liftCafeKitten-wall" x2="0" y2="1"><stop stopColor="#3b2b20"/><stop offset="1" stopColor="#241a15"/></linearGradient>
      <linearGradient id="lift-liftCafeKitten-table" x2="0" y2="1"><stop stopColor="#8a6544"/><stop offset="1" stopColor="#4d3524"/></linearGradient>
      <radialGradient id="lift-liftCafeKitten-vig" cx=".5" cy=".48" r=".78"><stop offset=".5" stopColor="#2a1a10" stopOpacity="0"/><stop offset="1" stopColor="#2a1a10" stopOpacity=".62"/></radialGradient>
    </defs>
    {first?<g>
      <rect width="1080" height="1920" fill="#1a232c"/>
      <rect width="1080" height="1240" fill="url(#lift-liftCafeKitten-sky)"/>
      {/* the street is almost featureless so the cafe glass is the only warm thing */}
      <rect x="0" y="150" width="560" height="1030" fill="#1f2a33"/>
      {[0,1,2,3,4].map(i=><g key={i}><rect x={70+i*96} y={230+i%2*90} width="52" height="72" fill={i%2?'#33404a':'#2b3741'}/><rect x={70+i*96} y={400+i%2*110} width="52" height="72" fill={i%3?'#2b3741':'#3a4650'}/></g>)}
      <rect y="1180" width="1080" height="740" fill="#20262c"/>
      <path d="M0,1180 H1080" stroke="#3a444c" strokeWidth="9"/>
      <path d="M0,1370 L1080,1300 M0,1570 L1080,1490 M0,1800 L1080,1710" stroke="#2a3238" strokeWidth="5"/>
      <Darkness id="lift-liftCafeKitten-dark" color="#0c131b" opacity={.5} lights={[{x:256,y:584,reach:430},{x:800,y:840,reach:560},{x:580,y:1100,reach:420}]}/>
      <path d="M160,1180 V580" stroke="#3f4b54" strokeWidth="11"/>
      <path d="M160,590 q40,-42 86,-24" fill="none" stroke="#3f4b54" strokeWidth="9"/>
      <rect x="228" y="552" width="58" height="26" rx="10" fill="#4a565f"/>
      <Glow id="lift-liftCafeKitten-lamp" x={256} y={584} r={330} color="#ffd9a0" strength={.6}/>
      <ellipse cx="258" cy="596" rx="34" ry="9" fill="#fff1c9"/>
      <rect x="600" y="400" width="400" height="840" rx="10" fill="#241a14" stroke="#4d3a2a" strokeWidth="14"/>
      <rect x="620" y="420" width="360" height="820" rx="4" fill="url(#lift-liftCafeKitten-glass)"/>
      <path d="M800,420 V1240 M620,830 H980" stroke="#7a5534" strokeWidth="12"/>
      <path d="M636,436 L742,780 M952,436 L846,780" stroke="#fff1c8" strokeWidth="8" opacity=".28"/>
      <rect x="930" y="840" width="12" height="70" rx="6" fill="#8a6a3f"/>
      <Glow id="lift-liftCafeKitten-door" x={800} y={840} r={520} color="#ffcf89" strength={.55}/>
      {/* blank hanging sign (a cup, no lettering) */}
      <path d="M770,300 V332 M860,300 V332" stroke="#5a4a3a" strokeWidth="5"/>
      <rect x="752" y="330" width="148" height="88" rx="8" fill="#f0d39a" stroke="#5d4830" strokeWidth="7"/>
      <path d="M806,378 h44 l-6,22 h-32Z" fill="none" stroke="#7a5836" strokeWidth="5"/><path d="M850,382 q14,6 0,16" fill="none" stroke="#7a5836" strokeWidth="4"/>
      <g transform="rotate(7 360 1270)"><Cast x={360} y={1270} s={.6} f={frame} warm expr="smile" turn={.5}/></g>
      <g transform="rotate(4 470 1270)"><Cast who="fon" x={470} y={1270} s={.6} f={frame} warm expr="smile" turn={.4}/></g>
      <Kitten x={560} y={1190}/>
    </g>:<g>
      <rect width="1080" height="1920" fill="url(#lift-liftCafeKitten-wall)"/>
      <rect y="1220" width="1080" height="700" fill="#33241a"/>
      <ellipse cx="540" cy="1240" rx="500" ry="70" fill="url(#lift-liftCafeKitten-table)"/>
      <path d="M402,770 q138,-142 276,0" fill="none" stroke="#5a4739" strokeWidth="24"/>
      <rect x="200" y="760" width="680" height="480" rx="28" fill="#8b7360" stroke="#554238" strokeWidth="9"/>
      <rect x="244" y="812" width="592" height="360" rx="16" fill="#17130f"/>
      {/* cat face first, grille second: the bars sit in front of the fur */}
      <ellipse cx="540" cy="1010" rx="150" ry="140" fill="#e08a3c"/>
      <path d="M414,900 L436,812 L526,890Z M666,900 L644,812 L554,890Z" fill="#e08a3c" stroke="#a95f26" strokeWidth="7"/>
      <path d="M470,870 q10,50 0,88 M610,870 q-10,50 0,88 M540,872 q4,52 0,92" stroke="#b5682a" strokeWidth="13" fill="none" opacity=".7"/>
      <ellipse cx="540" cy="1078" rx="92" ry="62" fill="#f4d4b2"/>
      <ellipse cx="490" cy="990" rx="26" ry="31" fill="#2b211c"/><ellipse cx="590" cy="990" rx="26" ry="31" fill="#2b211c"/>
      <circle cx="482" cy="978" r="9" fill="#fff"/><circle cx="582" cy="978" r="9" fill="#fff"/>
      <path d="M524,1046 H556 L540,1068Z" fill="#c06a5a"/>
      <path d="M520,1084 q20,16 40,0" stroke="#8d5a4a" strokeWidth="7" fill="none"/>
      {[0,1,2,3,4,5,6,7,8,9].map(i=><path key={i} d={`M${284+i*58},812 V1172`} stroke="#4a3a30" strokeWidth="11"/>)}
      <path d="M244,872 H836 M244,990 H836 M244,1110 H836" stroke="#4a3a30" strokeWidth="9"/>
      <rect x="244" y="812" width="592" height="360" rx="16" fill="none" stroke="#3a2c24" strokeWidth="10"/>
      <rect x="760" y="930" width="86" height="26" rx="6" fill="#6c5644" stroke="#3d2f27" strokeWidth="4"/>
      <rect x="222" y="1180" width="636" height="66" rx="14" fill="#6c5644" stroke="#42332a" strokeWidth="6"/>
      <ellipse cx="540" cy="1258" rx="380" ry="34" fill="#1c140f" opacity=".55"/>
    </g>}
    {/* flashback treatment; in the gift half the bow and card are repainted after it */}
    <rect width="1080" height="1920" fill="#c9a878" opacity=".42" style={{mixBlendMode:'multiply'}}/>
    <rect width="1080" height="1920" fill="url(#lift-liftCafeKitten-vig)"/>
    {first?null:<g>
      <path d="M540,758 C466,692 420,724 444,772 C466,816 518,792 540,758Z" fill="#d8433c" stroke="#9e2c2a" strokeWidth="5"/>
      <path d="M540,758 C614,692 660,724 636,772 C614,816 562,792 540,758Z" fill="#d8433c" stroke="#9e2c2a" strokeWidth="5"/>
      <path d="M520,770 L492,858 L522,840 L540,772Z" fill="#c23a34" stroke="#9e2c2a" strokeWidth="4"/>
      <path d="M560,770 L588,858 L558,840 L540,772Z" fill="#c23a34" stroke="#9e2c2a" strokeWidth="4"/>
      <ellipse cx="540" cy="766" rx="23" ry="19" fill="#e25548" stroke="#a8302c" strokeWidth="4"/>
      <path d="M462,738 q20,-22 48,-10 M618,738 q-20,-22 -48,-10" stroke="#ff9a86" strokeWidth="6" fill="none" opacity=".55"/>
      <g transform="rotate(-9 776 1178)">
        <rect x="688" y="1108" width="176" height="128" rx="7" fill="#fff6e4" stroke="#d8c2a2" strokeWidth="5"/>
        <rect x="702" y="1122" width="148" height="100" rx="3" fill="none" stroke="#ecdcc4" strokeWidth="3"/>
        {label(776,1170,'ให้จ๊าบ ❤️',30,'#c2453f')}
        <path d="M776,1192 q10,-8 20,0" fill="none" stroke="#d9a3a0" strokeWidth="3"/>
      </g>
    </g>}
  </g>;
};

export const LobbyDoorsOpen:React.FC<EnvProps>=({frame,progress:p=0})=>{
  const open=phase(p,0,.3), split=phase(p,.55,.8), out=phase(p,.5,1);
  return <g style={{fontFamily:'Sarabun, sans-serif'}}>
    <defs>
      <clipPath id="lift-lobbyDoorsOpen-door"><rect x="200" y="300" width="680" height="980"/></clipPath>
      <linearGradient id="lift-lobbyDoorsOpen-steel" x2="0" y2="1"><stop stopColor="#7b8d98"/><stop offset=".5" stopColor="#aab7bb"/><stop offset="1" stopColor="#687983"/></linearGradient>
      <pattern id="lift-lobbyDoorsOpen-speckle" width="47" height="39" patternUnits="userSpaceOnUse"><rect width="47" height="39" fill="#36434d"/><circle cx="8" cy="12" r="2" fill="#73808a"/><circle cx="35" cy="29" r="1.5" fill="#182933"/></pattern>
    </defs>
    <rect width="1080" height="1920" fill="#56646c"/>
    {/* what is outside the car, clipped to the doorway */}
    <g clipPath="url(#lift-lobbyDoorsOpen-door)">
      <Lobby id="lift-lobbyDoorsOpen" frame={frame} active={false}>
        <Cast who="cleaner" x={mix(356,280,split)} y={1250} s={.5} f={frame} warm expr={p<.6?'shock':'sweat'} turn={.35}/>
        <Cast who="liftGuard" x={mix(540,610,split)} y={1248} s={.5} f={frame} warm expr={p<.6?'shock':'sweat'} turn={0}/>
        <Cast who="cleaner2" x={mix(700,780,split)} y={1252} s={.5} f={frame} warm expr={p<.6?'shock':'flat'} turn={-.35}/>
        <SnackBag x={mix(596,650,split)} y={1190}/>
        <Cast who="runner" x={mix(636,700,split)} y={1254} s={.5} f={frame} warm expr={p<.6?'shock':'flat'} turn={-.2}/>
      </Lobby>
    </g>
    {/* the panels part and slide behind the walls, which are painted after them */}
    <rect x={200-340*open} y="300" width="340" height="980" fill="url(#lift-lobbyDoorsOpen-steel)" stroke="#c6ced0" strokeWidth="7"/>
    <rect x={540+340*open} y="300" width="340" height="980" fill="url(#lift-lobbyDoorsOpen-steel)" stroke="#c6ced0" strokeWidth="7"/>
    <path d="M0,0 L200,300 V1280 L0,1600Z M1080,0 L880,300 V1280 L1080,1600Z" fill="#738691"/>
    <path d="M0,0 H1080 L880,300 H200Z" fill="#465967"/>
    <path d="M200,1280 H880 L1080,1600 V1920 H0 V1600Z" fill="url(#lift-lobbyDoorsOpen-speckle)"/>
    <path d="M0,1560 L200,1240 M1080,1560 L880,1240" stroke="#d2d7d5" strokeWidth="9" opacity=".6"/>
    <rect x="360" y="140" width="360" height="86" rx="8" fill="#ecf6f7" stroke="#293c49" strokeWidth="11"/>
    <Glow id="lift-lobbyDoorsOpen-ceiling" x={540} y={250} r={620} color="#dcecff" strength={.32}/>
    <Shaft id="lift-lobbyDoorsOpen-shaft" points={[[380,240],[700,240],[940,1280],[140,1280]]} from={[540,240]} to={[540,1280]} color="#dcecff" opacity={.12}/>
    <rect x="200" y="300" width="680" height="980" fill="none" stroke="#3f4e58" strokeWidth="14"/>
    {/* her back and her shrinking size carry the exit; the crowd steps aside as she passes */}
    {p>=.4?<Cast who="fon" x={mix(540,556,out)} y={mix(1640,1330,out)} s={mix(.92,.72,out)} f={frame} warm back turn={1} walk={p>=.5}/>:null}
    <Cast x={170} y={1580} s={.95} f={frame} expr="flat" turn={.5}/>
  </g>;
};

export const LiftDoorsStop:React.FC<EnvProps>=({frame,progress:p=0})=>{
  const close=mix(0,1,phase(p,.1,.7))-.16*phase(p,.72,.82);
  const edge=880-340*close;
  return <LiftInterior id="lift-liftDoorsStop">
    {/* the lit lobby beyond the gap; fon is already out, back to us */}
    <rect x="200" y="300" width="680" height="970" fill="#33251a"/>
    <rect x="200" y="300" width="680" height="580" fill="#8a6a47"/>
    <rect x="200" y="860" width="680" height="410" fill="#5a3e2b"/>
    <path d="M200,860 H880 M200,1000 H880" stroke="#6d5138" strokeWidth="6" opacity=".7"/>
    <rect x="740" y="430" width="140" height="430" fill="#ffe0a0" opacity=".3"/>
    <Glow id="lift-liftDoorsStop-lobby" x={540} y={780} r={430} color="#ffcf89" strength={.6}/>
    <Cast who="fon" x={560} y={1190} s={.4} f={frame} warm back turn={1}/>
    <rect x={-480+680*close/2} y="300" width="680" height="980" fill="#889aa4" stroke="#c1cacc" strokeWidth="10"/>
    <rect x={880-680*close/2} y="300" width="680" height="980" fill="#889aa4" stroke="#c1cacc" strokeWidth="10"/>
    <path d={`M${200+340*close},310 V1270`} stroke="#e7b47c" strokeWidth="5" opacity={phase(p,.1,.7)}/>
    <path d={`M${880-340*close},310 V1270`} stroke="#e7b47c" strokeWidth="5" opacity={phase(p,.1,.7)}/>
    {/* his arm shoots in and stops the right panel; clipped at the left panel's edge so the sleeve
        never floats over the closing door */}
    {p>=.7?<g>
      <defs><clipPath id="lift-liftDoorsStop-reach"><rect x={200+340*close} y="300" width="720" height="980"/></clipPath></defs>
      <g clipPath="url(#lift-liftDoorsStop-reach)">
        <path d="M-90,1580 L540,940" stroke="#4a7159" strokeWidth="150" strokeLinecap="round"/>
        <path d="M540,940 L600,905" stroke="#e3b18c" strokeWidth="64" strokeLinecap="round"/>
        <Hand x={edge+8} y={900} s={.82} r={38}/>
        {/* repaint the shared hand's cream cuff green: this is his sleeve, not hers */}
        <g transform={`translate(${edge+8} 900) scale(.82) rotate(38)`}><rect x="-46" y="70" width="92" height="120" rx="14" fill="#4a7159" stroke="#35513f" strokeWidth="4"/></g>
      </g>
    </g>:null}
    <Cast x={230} y={1320} s={.8} f={frame} pose={p>.7&&p<.82?'shock':'idle'} expr={p<.7?'sweat':p<.82?'shock':'flat'} turn={.25}/>
  </LiftInterior>;
};

export const LobbyExit:React.FC<EnvProps>=({frame,progress:p=0})=>{
  const walk=phase(p,.3,1);
  const bob=(i:number)=>Math.sin(frame*.28+i*1.7)*7;
  const cheer=p<.8?1:mix(1,0,phase(p,.8,.85));
  return <Lobby id="lift-lobbyExit" frame={frame} active={p<.8} behind={<Cast who="liftGuard" x={775} y={1180} s={.48} f={frame} warm pose="hold" expr={p<.5?'talk':'smile'} turn={-.55}/>}>
    <DeskPhone id="lift-lobbyExit-desk" frame={frame} ringing={p<.5} hop={0}/>
    <g opacity={cheer}>
      <Cast who="cleaner" x={250} y={1250+bob(0)} s={.46} f={frame} warm pose="wave" expr="smile" turn={.5}/>
      <Cast who="cleaner2" x={360} y={1290+bob(1)} s={.47} f={frame} warm pose="wave" expr="smile" turn={.3}/>
      <SnackBag x={430} y={1200}/>
      <Cast who="runner" x={470} y={1270+bob(2)} s={.46} f={frame} warm pose="wave" expr="smile" turn={-.2}/>
    </g>
    {/* backs to us, walking out left: the last image leaves the guard alone with the speaker */}
    <Cast x={mix(520,-420,walk)} y={1500} s={.75} f={frame} warm back turn={1} walk={p>.3}/>
    <Cast who="fon" x={mix(620,-320,walk)} y={1500} s={.75} f={frame} warm back turn={1} walk={p>.3}/>
  </Lobby>;
};
