import React from 'react';

/** Original SVG reconstructions measured against the private DegJCmXtbGj study.
 * All coordinates are SCREEN pixels on the 270 x 480 review plane. Integrate
 * outside the calibrated world transform (scale 4 at the 1080 x 1920 root), or
 * use an identity camera for full inserts. No source images/audio are embedded.
 * Source-specific text/geometry are private comparison material, not Jaab assets.
 */
const F = 'Anton, Impact, sans-serif';
const BODY = 'Arial Narrow, Arial, sans-serif';
const clamp = (v: number) => Math.max(0, Math.min(1, v));
const ease = (v: number) => {const t = clamp(v); return t * t * (3 - 2 * t);};
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const rnd = (n: number) => {const v = Math.sin(n * 127.1 + 311.7) * 43758.5453; return v - Math.floor(v);};
type FrameProps = {frame: number};

const SEGMENTS = ['abcedf', 'bc', 'abged', 'abgcd', 'fgbc', 'afgcd', 'afgecd', 'abc', 'abcdefg', 'abfgcd'];
const Digit: React.FC<{value: string; x: number; y: number; h: number}> = ({value, x, y, h}) => {
 const w = h * .47, t = h * .105, mid = h / 2;
 const horizontal = (yy: number) => `${t},${yy} ${w-t},${yy} ${w},${yy+t/2} ${w-t},${yy+t} ${t},${yy+t} 0,${yy+t/2}`;
 const vertical = (xx: number, yy: number) => `${xx},${yy+t} ${xx+t/2},${yy} ${xx+t},${yy+t} ${xx+t},${yy+mid-t} ${xx+t/2},${yy+mid} ${xx},${yy+mid-t}`;
 const shapes: Record<string, string> = {a: horizontal(0), g: horizontal(mid-t/2), d: horizontal(h-t), f: vertical(0,0), b: vertical(w-t,0), e: vertical(0,mid), c: vertical(w-t,mid)};
 return <g transform={`translate(${x} ${y}) skewX(-5)`}>{Object.entries(shapes).map(([key, points]) => <polygon key={key} points={points} fill={SEGMENTS[Number(value)]?.includes(key) ? '#d23f45' : '#442c2c'} />)}</g>;
};

/** Count formatting matches the source; no extra wall clock or timer is implied. */
export const ReferenceCountdown: React.FC<FrameProps & {x?: number; y?: number; scale?: number; value?: string}> = ({frame, x=10, y=73, scale=1, value}) => {
 const seconds = Math.max(0, 299 - Math.floor(frame / 30 - 47));
 const digits = (value ?? `${Math.floor(seconds/60).toString().padStart(2,'0')}:${(seconds%60).toString().padStart(2,'0')}`);
 return <g transform={`translate(${x} ${y}) scale(${scale})`}>
  <rect width="53" height="21" rx="3" fill="#211e20" stroke="#954047" strokeWidth=".8" />
  <g opacity=".22" style={{filter:'blur(1.2px)'}}>{digits.replace(':','').split('').map((d,i) => <Digit key={i} value={d} x={4+i*11.5+(i>1?2:0)} y={3} h={15}/>)}</g>
  {digits.replace(':','').split('').map((d,i) => <Digit key={i} value={d} x={4+i*11.5+(i>1?2:0)} y={3} h={15}/>)}
  <circle cx="26.3" cy="8" r=".9" fill="#d23f45"/><circle cx="26.3" cy="13.5" r=".9" fill="#d23f45"/>
 </g>;
};

/** Frame375 is the actual hard cut from phone to defocused city map. */
export const ReferencePhoneInsert: React.FC<FrameProps> = ({frame}) => frame >= 375 ? <ReferenceCityInsert frame={frame}/> : <g>
 <defs>
  <radialGradient id="ri-phone-outside"><stop stopColor="#a0272e" stopOpacity=".58"/><stop offset="1" stopColor="#1a2322" stopOpacity="0"/></radialGradient>
  <linearGradient id="ri-phone-glass" x2=".2" y2="1"><stop stopColor="#4f0f16"/><stop offset=".45" stopColor="#1b080d"/><stop offset="1" stopColor="#0d080b"/></linearGradient>
  <radialGradient id="ri-phone-red"><stop stopColor="#9e1720" stopOpacity=".8"/><stop offset="1" stopColor="#6e1017" stopOpacity="0"/></radialGradient>
  <linearGradient id="ri-alert-card" x2="1" y2="1"><stop stopColor="#4b292e"/><stop offset="1" stopColor="#291e23"/></linearGradient>
  <filter id="ri-phone-background"><feGaussianBlur stdDeviation="5.5"/></filter>
 </defs>
 <rect width="270" height="480" fill="#1e2927"/>
 <g filter="url(#ri-phone-background)" opacity=".75"><path d="M0,23 H270 V43 H0Z M0,102 H270 V123 H0Z M0,208 H270 V227 H0Z M0,332 H270 V350 H0Z" fill="#706155"/>{[0,1,2,3,4,5].map(i=><rect key={i} x={i*53-8} y={25+i%2*35} width="22" height="350" fill={i%2?'#482b2d':'#303d37'}/>)}</g>
 <ellipse cx="136" cy="211" rx="148" ry="240" fill="url(#ri-phone-outside)"/>
 <rect x="30" y="25" width="214" height="434" rx="25" fill="#151d20" stroke="#301e22" strokeWidth="3"/>
 <rect x="36" y="32" width="202" height="420" rx="18" fill="url(#ri-phone-glass)"/>
 <ellipse cx="135" cy="59" rx="106" ry="140" fill="url(#ri-phone-red)"/>
 <text x="135" y="60" textAnchor="middle" fontFamily={BODY} fontWeight="700" fontSize="9" fill="#e8d7d2">10:52</text>
 <rect x="50" y="106" width="171" height="178" rx="12" fill="url(#ri-alert-card)"/>
 <path d="M61,134 L69,118 L77,134Z" fill="#e94b55"/><path d="M69,123 v5" stroke="#fff4e7" strokeWidth="1.6"/><circle cx="69" cy="131" r=".8" fill="#fff4e7"/>
 <text x="87" y="130" fontFamily={BODY} fontWeight="800" fontSize="8.3" letterSpacing="1.1" fill="#e58287">EMERGENCY ALERT</text>
 <text x="61" y="166" fontFamily={F} fontSize="21.7" fill="#f4f0e9">INFECTION</text>
 <text x="61" y="189" fontFamily={F} fontSize="21.7" fill="#f4f0e9">OUTBREAK</text>
 <text x="61" y="208" fontFamily={BODY} fontSize="9.2" fontWeight="600" fill="#e1d6d3"><tspan x="61">A deadly infection is spreading</tspan><tspan x="61" dy="12.8">through the city. Stay inside. Do not</tspan><tspan x="61" dy="12.8">go out.</tspan></text>
 <rect x="61" y="250" width="149" height="23" rx="6" fill="#504448"/><text x="135.5" y="265.5" textAnchor="middle" fontFamily={BODY} fontWeight="800" fontSize="10" fill="#f1eeeb">OK</text>
 </g>;

export const ReferenceCityInsert: React.FC<FrameProps> = ({frame}) => {
 const xs=[-20,7,34,61,87,115,143,171,199,229,258], ys=[-12,22,57,93,129,167,207,246,285,327,366,408,448,488];
 const reveal=ease((frame-396)/12), marker=ease((frame-403)/10);
 return <g>
  <defs><radialGradient id="ri-outbreak"><stop stopColor="#b4222e" stopOpacity=".65"/><stop offset=".65" stopColor="#a1252d" stopOpacity=".5"/><stop offset="1" stopColor="#a92c34" stopOpacity=".16"/></radialGradient><filter id="ri-city-focus"><feGaussianBlur stdDeviation={6*(1-ease((frame-375)/23))}/></filter></defs>
  <g filter="url(#ri-city-focus)">
   <rect width="270" height="480" fill="#172825"/>
   {xs.flatMap((x,c)=>ys.map((y,r)=>{
    const seed=c*19+r*31, w=17+rnd(seed)*9, h=22+rnd(seed+2)*11, inset=rnd(seed+4)*4;
    return <g key={`${c}-${r}`}><rect x={x+2+inset} y={y+3} width={w} height={h} fill="#101e1d" opacity=".75"/><rect x={x+inset} y={y} width={w} height={h} fill={['#344342','#30413f','#3c4947','#2d3b3c'][seed%4]}/><path d={`M${x+inset},${y+h} h${w} v-${h}`} stroke="#45504c" strokeWidth=".6" fill="none"/>{seed%3===0?<rect x={x+inset+w-4} y={y+h-3} width="1.5" height="1.1" fill="#948e61"/>:null}</g>;
   }))}
   <path d="M85,-10 C68,80 80,178 101,252 C120,326 100,389 76,490" stroke="#365751" strokeWidth="43" fill="none" opacity=".5"/>
   <path d="M85,-10 C68,80 80,178 101,252 C120,326 100,389 76,490" stroke="#244c5f" strokeWidth="33" fill="none"/>
   <path d="M0,83 H270 M0,304 H270 M0,397 H270" stroke="#52605a" strokeWidth="5" opacity=".6"/>
   <g opacity={reveal}><circle cx="92" cy="183" r="126" fill="url(#ri-outbreak)"/><circle cx="92" cy="183" r="126" fill="none" stroke="#be2c3d" strokeWidth="1.1" strokeDasharray="4 4"/>{[[-1,76],[43,121],[61,218],[164,165],[181,259],[120,275],[169,98]].map(([x,y],i)=><circle key={i} cx={x} cy={y} r="1.2" fill="#f34a46" opacity={.4+.4*Math.sin(frame/7+i)**2}/>)}</g>
   <g opacity={marker}><rect x="187" y="359" width="35" height="24" fill="#7b8382" stroke="#e3e9df" strokeWidth="1.1"/><path d="M204,352 V359" stroke="#d7d9d0" strokeWidth=".9"/><circle cx="204" cy="355" r="2.9" fill="#cf3b3b"/><rect x="184" y="332" width="40" height="14" rx="7" fill="#e8e8d6"/><path d="M190,337 l3,-3 3,3 v4 h-2 v-3 h-2 v3 h-2Z" fill="#535943"/><text x="207" y="342" textAnchor="middle" fontFamily={F} fontSize="8" fill="#252c25">YOU</text></g>
  </g>
 </g>;
};

const Pill: React.FC<{x:number;y:number;w:number;text:string;icon?:'cart'|'truck'|'door'}> = ({x,y,w,text,icon}) => <g>
 <rect x={x} y={y} width={w} height="15" rx="7.5" fill="#edeada" stroke="#c4c3b5" strokeWidth=".3"/>
 {icon==='door'?<rect x={x+7} y={y+4} width="5" height="7" fill="#2e3429"/>:icon==='truck'?<path d={`M${x+6},${y+5} h7 v5 h-7Z m7,2 h3 v3 h-3Z`} fill="#32372a"/>:<path d={`M${x+6},${y+4} l1,1 1,5 h6 l1,-5 h-8 M${x+9},${y+6} v3 M${x+12},${y+6} v3`} stroke="#30392c" strokeWidth=".8" fill="none"/>}
 <text x={x+w/2+4} y={y+10.6} textAnchor="middle" fontFamily={F} fontSize="6.9" letterSpacing=".4" fill="#222921">{text}</text>
 </g>;

/** Overlay only. Keep the registered source-assisted base, remove its invented pill. */
export const ReferenceMapOverlay: React.FC<FrameProps> = ({frame}) => {
 const key=[{f:1088,x:163.5,y:258.5},{f:1310,x:163.5,y:258.5},{f:1320,x:164,y:258},{f:1335,x:168.5,y:244},{f:1350,x:180,y:190},{f:1380,x:185.5,y:153},{f:1420,x:185.5,y:153}];
 const a=[...key].reverse().find(k=>frame>=k.f)??key[0],b=key.find(k=>k.f>=frame)??key[key.length-1], t=b.f===a.f?0:clamp((frame-a.f)/(b.f-a.f));
 const x=mix(a.x,b.x,t),y=mix(a.y,b.y,t), ordinary=frame>=1088&&frame<1180||frame>=1316;
 return <g>
  {ordinary?<g opacity={ease((frame-1088)/8)}><rect x={x-25} y={y-9} width="20" height="11" rx="4" fill="#c33435"/><text x={x-15} y={y-1} textAnchor="middle" fontFamily={F} fontSize="6.4" fill="#f1eadb">YOU</text><circle cx={x} cy={y} r="5" fill="#c62d32" opacity=".25"/><circle cx={x} cy={y} r="2.7" fill="#d13a3c"/></g>:null}
  {frame>=1179&&frame<1316?<g opacity={ease((frame-1179)/7)}><Pill x={83} y={160} w={104} text="12 AISLES OF FOOD" icon="cart"/><path d="M135,175 V183" stroke="#e6dfc8" strokeWidth=".75" strokeDasharray="1.8 1.8"/><circle cx="135" cy="186.5" r="2.4" fill="#c5373b"/></g>:null}
  {frame>=1227&&frame<1316?<g opacity={ease((frame-1227)/7)}><Pill x={83} y={243} w={104} text="STEEL SHUTTER" icon="door"/><path d="M135,258 V266.5" stroke="#e6dfc8" strokeWidth=".75" strokeDasharray="1.8 1.8"/><circle cx="135" cy="270.5" r="2.4" fill="#c5373b"/></g>:null}
  {frame>=1260&&frame<1316?<g opacity={ease((frame-1260)/7)}><Pill x={31} y={75} w={85} text="LOADING DOCK" icon="truck"/><path d="M73.5,90 V97" stroke="#e6dfc8" strokeWidth=".75" strokeDasharray="1.8 1.8"/><circle cx="73.5" cy="100.5" r="2.2" fill="#c5373b"/><path d="M119,74 v-3 a1.4,1.4 0 0 1 2.8,0 v3 M118.6,74 h3.7 v3 h-3.7Z" fill="#d6b145"/></g>:null}
  {frame>=1388?<g opacity={ease((frame-1388)/8)}><ReferenceCountdown frame={frame} x={67} y={166} scale={2.55} value="05:00"/></g>:null}
 </g>;
};

/** Diagram geometry at source frame1705: motor [39,104,192,50]. */
export const ReferenceMechanism: React.FC<FrameProps & {showTimer?:boolean}> = ({frame,showTimer=true}) => {
 const chain=ease((frame-1716)/23);
 return <g>
  <defs><radialGradient id="ri-diagram-paper"><stop stopColor="#ddd9c9"/><stop offset="1" stopColor="#b8b5a8"/></radialGradient><pattern id="ri-paper-grid" width="15" height="15" patternUnits="userSpaceOnUse"><path d="M15,0 H0 V15" fill="none" stroke="#a7a99c" strokeWidth=".4" opacity=".24"/></pattern></defs>
  <rect width="270" height="480" fill="url(#ri-diagram-paper)"/><rect width="270" height="480" fill="url(#ri-paper-grid)"/>
  {showTimer?<ReferenceCountdown frame={frame}/>:null}
  <rect x="165" y="84" width="37" height="15" rx="7.5" fill="#eeeade"/><text x="183.5" y="94.5" textAnchor="middle" fontFamily={F} fontSize="7" fill="#30362d">MOTOR</text>
  <rect x="39.8" y="105" width="190" height="48" rx="4.5" fill="#bcc3c3" stroke="#242c2d" strokeWidth="1.5"/>
  <circle cx="125" cy="129" r="17.5" fill="#aab3b4" stroke="#273033" strokeWidth="1.4"/>
  {[0,1,2,3,4,5].map(i=><path key={i} d="M125,129 L125,113" transform={`rotate(${i*60+((frame-1692)/107)*18} 125 129)`} stroke="#323d40" strokeWidth="1.3"/>)}
  <rect x="170" y="115" width="42" height="28" rx="4" fill="#53626b" stroke="#273033" strokeWidth="1.4"/>{[0,1,2,3].map(i=><path key={i} d={`M${177+i*8},118 v22`} stroke="#2a343c" strokeWidth="1.2"/>)}
  {Array.from({length:16},(_,i)=><rect key={i} x="50" y={153.5+i*12} width="150" height="11.2" fill={i%2?'#b5bdbd':'#bfc6c6'} stroke="#525d60" strokeWidth=".95"/>)}
  <g opacity={chain}><path d="M39,117 Q17,117 17,139 V342 Q17,351 24,351 Q31,351 31,343 V139" stroke="#646d67" strokeWidth="1.5" fill="none" strokeDasharray="2 2"/><circle cx="24" cy="348" r="5.4" fill="#d6d2c3" stroke="#687169" strokeWidth="1.4"/>
  <rect x="17" y="357" width="57" height="15" rx="7.5" fill="#bb3a37"/><text x="45.5" y="367.2" textAnchor="middle" fontFamily={F} fontSize="6.8" fill="#eee9d7">HAND CHAIN</text>
  <text x="145" y="365.5" fontFamily={BODY} fontSize="6.4" fontWeight="700" fill="#343a2f"><tspan x="145">works with</tspan><tspan x="145" dy="8.5">no power</tspan></text></g>
 </g>;
};

/** The source writes the three supply lines progressively, not a static blank card. */
export const ReferenceInventory: React.FC<FrameProps> = ({frame}) => {
 const typed=(s:string,start:number,end:number)=>s.slice(0,Math.floor(s.length*clamp((frame-start)/(end-start))));
 return <g transform="rotate(-2.6 135 241)">
  <rect x="44" y="202" width="185" height="81" fill="#f2f2e4" stroke="#c8cfc4" strokeWidth=".6"/>
  {[0,1,2,3,4].map(i=><path key={i} d={`M46,${215+i*13.8} H226`} stroke="#c2cfc8" strokeWidth=".55" opacity=".58"/>)}
  <text x="54" y="225" fontFamily={F} fontSize="10.5" fill="#161d1b">DAY 1 · SUPPLIES</text><path d="M54,228 H217" stroke="#48534c" strokeWidth=".9"/>
  <text x="54" y="243" fontFamily={BODY} fontStyle="italic" fontSize="10" fill="#354a64">{typed('Food: about 4 years',2255,2276)}</text>
  <text x="54" y="257" fontFamily={BODY} fontStyle="italic" fontSize="10" fill="#354a64">{typed('Water: about 6 months',2277,2298)}</text>
  <text x="54" y="271" fontFamily={BODY} fontStyle="italic" fontSize="10" fill="#354a64">{typed('Light: 1 torch',2299,2319)}</text>
 </g>;
};

export const referenceTorchOrigin=(frame:number):{x:number;y:number}=>{
 const keys=[{f:2337,x:137,y:361},{f:2375,x:141,y:348},{f:2413,x:146,y:342}];
 const a=[...keys].reverse().find(k=>frame>=k.f)??keys[0],b=keys.find(k=>frame>=k.f)??keys[keys.length-1];const t=b.f===a.f?0:clamp((frame-a.f)/(b.f-a.f));return{x:mix(a.x,b.x,t),y:mix(a.y,b.y,t)};
};

/** Overlay only; pass the actual rig lens origin after integrating the new actor. */
export const ReferenceTorchBeam:React.FC<FrameProps&{origin?:{x:number;y:number};opacity?:number}>=({frame,origin,opacity=1})=>{
 const {x,y}=origin??referenceTorchOrigin(frame);
 return <g opacity={opacity} style={{mixBlendMode:'screen'}}>
  <defs><linearGradient id="ri-torch-falloff" gradientUnits="userSpaceOnUse" x1={x} y1={y} x2={260} y2={480}><stop stopColor="#e5d8b7" stopOpacity=".35"/><stop offset=".28" stopColor="#ebdfc6" stopOpacity=".5"/><stop offset="1" stopColor="#d9ccaa" stopOpacity=".15"/></linearGradient><filter id="ri-torch-soft"><feGaussianBlur stdDeviation="7"/></filter><radialGradient id="ri-torch-core"><stop stopColor="#f4edcf" stopOpacity=".45"/><stop offset="1" stopColor="#eadfbd" stopOpacity="0"/></radialGradient></defs>
  <path d={`M${x},${y} Q${x+38},${y+12} 305,437 L306,516 L153,516 Q${x+3},${y+45} ${x},${y}Z`} fill="url(#ri-torch-falloff)" filter="url(#ri-torch-soft)"/>
  <ellipse cx={x+8} cy={y+19} rx="29" ry="35" fill="url(#ri-torch-core)"/>
 </g>;
};

/** Independent prop, for use after masking/replacing the old plate prop. */
export const ReferenceRadioProp:React.FC<FrameProps&{x?:number;y?:number;scale?:number;rotation?:number}>=({frame,x=169,y=247,scale=1,rotation=-11})=><g transform={`translate(${x} ${y}) rotate(${rotation}) scale(${scale})`}>
 <path d="M-25,-29 L19,-29 L23,31 L-26,31Z" fill="#283336"/>
 <path d="M19,-29 L25,-24 L29,27 L23,31Z" fill="#172629"/>
 <path d="M12,-29 V-53" stroke="#222c2e" strokeWidth="4.8" strokeLinecap="round"/>
 <rect x="-19" y="-22" width="34" height="16" rx="1.7" fill="#a2b28e"/>
 <rect x="-16" y="-19.5" width="29" height="11" fill="#9fae8b" opacity=".65"/>
 {[0,1,2,3,4,5].map(i=><path key={i} d={`M-15,${i*6} h30`} stroke="#132024" strokeWidth="2.4"/>)}
 <path d="M-27,-16 h-4 v15 h4" fill="#1a282b"/><circle cx="21" cy="-30" r="2.2" fill={frame>=2577&&Math.floor((frame-2577)/17)%2===0?'#c52d2d':'#5b3030'}/>
 </g>;

export const ReferenceStudyEnd:React.FC<FrameProps>=({frame})=><g>
 <defs><radialGradient id="ri-end-dark"><stop stopColor="#20211e"/><stop offset=".8" stopColor="#0b0e0d"/><stop offset="1" stopColor="#070b09"/></radialGradient></defs>
 <rect width="270" height="480" fill="url(#ri-end-dark)"/>
 <g opacity={ease((frame-2704)/13)}><text x="135" y="234" textAnchor="middle" fontFamily={F} fontSize="33" letterSpacing=".8" fill="#e7e4d6">PART 2</text>
 <path d="M78,245 H191" stroke="#9e3439" strokeWidth="1"/>
 <text x="135" y="259" textAnchor="middle" fontFamily={F} fontSize="7.4" letterSpacing="1" fill="#b63b40">WHO'S ON THE RADIO?</text>
 <text x="135" y="285" textAnchor="middle" fontFamily={BODY} fontWeight="700" fontSize="5.8" letterSpacing="1.3" fill="#d5d4c9">FOLLOW TO SURVIVE DAY 1</text></g>
 </g>;

/** Actual source insert: focus resolves before the glove lands on DOWN. */
export const ReferenceControls:React.FC<FrameProps&{showTimer?:boolean}>=({frame,showTimer=true})=>{
 const focus=6*(1-ease((frame-1565)/6));
 const reach=ease((frame-1567)/4), handX=mix(290,138,reach), press=Math.sin(clamp((frame-1571)/8)*Math.PI)*.8;
 return <g>
  <defs><radialGradient id="ri-controls-wall"><stop stopColor="#d1cebc"/><stop offset="1" stopColor="#aaa999"/></radialGradient><filter id="ri-controls-focus"><feGaussianBlur stdDeviation={focus}/></filter><filter id="ri-controls-shadow"><feGaussianBlur stdDeviation="3"/></filter><radialGradient id="ri-controls-power"><stop stopColor="#7aff70"/><stop offset="1" stopColor="#6dce60" stopOpacity="0"/></radialGradient></defs>
  <rect width="270" height="480" fill="url(#ri-controls-wall)"/>
  {showTimer?<ReferenceCountdown frame={frame}/>:null}
  <g filter="url(#ri-controls-focus)">
   <rect x="70" y="148" width="133" height="180" rx="5" fill="#4b5045" opacity=".28" filter="url(#ri-controls-shadow)"/>
   <rect x="70" y="144" width="130" height="180" rx="5" fill="#e6e5d9" stroke="#d6d8c7" strokeWidth=".8"/>
   <text x="135" y="163.5" textAnchor="middle" fontFamily={BODY} fontWeight="800" fontSize="7.7" letterSpacing="1.2" fill="#222b26">SHUTTER</text>
   <text x="84" y="179.4" fontFamily={BODY} fontWeight="700" fontSize="4.4" fill="#3c493a">POWER</text>
   <circle cx="116.5" cy="177" r="5.2" fill="url(#ri-controls-power)" opacity={frame>=1580?.85:.25}/><circle cx="116.5" cy="177" r="3" fill={frame>=1580?'#8df47c':'#397344'}/>
   {[{y:197,fill:'#4d945b',label:'▲ UP'},{y:240,fill:'#c24847',label:'▼ DOWN'},{y:282,fill:'#d3ac3f',label:'■ STOP'}].map(b=><g key={b.y}><rect x="94" y={b.y} width="82" height="28" rx="14" fill="#273b31"/><rect x="96" y={b.y+2} width="78" height="24" rx="12" fill={b.fill}/><text x="135" y={b.y+17.8} textAnchor="middle" fontFamily={BODY} fontSize="8.4" fontWeight="800" fill="#efefdd">{b.label}</text></g>)}
   {reach>0?<g transform={`translate(${handX} ${254+press})`}><path d="M9,-6 L150,17 V35 L7,6Z" fill="#2c774c"/><path d="M8,3 L150,27 V35 L7,7Z" fill="#226440" opacity=".6"/><ellipse cx="0" cy="0" rx="10" ry="9.5" fill="#20382a"/><path d="M6,-1 H19" stroke="#20382a" strokeWidth="4" strokeLinecap="round"/><path d="M2,5 q5,1 10,-1" stroke="#162d22" strokeWidth="1.3" fill="none"/></g>:null}
  </g>
 </g>;
};

// The source badge turns green the frame the count reaches 40 (1964) and stays green; colours sampled on
// source frame 2005: fill RGB 48,146,72, text brightest pixels 216-233 (count), /40 dimmer.
const PULL_DONE={fill:'#30924a',label:'#d4ecd7',count:'#e8efe7',total:'#c0e2c3'};
export const ReferencePullBadge:React.FC<{count?:number;x?:number;y?:number}>=({count=39,x=198,y=73})=>{
 const done=count>=40;
 return <g transform={`translate(${x} ${y})`}>
 <rect width="61" height="23" rx="3" fill={done?PULL_DONE.fill:'#eeeada'} stroke={done?'none':'#c7c6b9'} strokeWidth=".5"/>
 <text x="5" y="14.2" fontFamily={BODY} fontSize="3.7" letterSpacing=".5" fill={done?PULL_DONE.label:'#73786b'}>PULLS</text><text x="33" y="16.6" textAnchor="middle" fontFamily={F} fontSize="11.2" fill={done?PULL_DONE.count:'#1e2925'}>{count}</text><text x="45" y="15.7" fontFamily={BODY} fontSize="6.5" fill={done?PULL_DONE.total:'#555e50'}>/ 40</text>
 </g>;
};

/** Screen-space low insert. Hands attach to the moving lower edge, then release. */
export const ReferenceGap:React.FC<FrameProps&{showHud?:boolean}>=({frame,showHud=true})=>{
 const edge=236+(frame-1886)*.6;
 const present=frame>=1887&&frame<1941;
 const extend=frame<1890?clamp((frame-1886)/4):frame>1935?mix(1,.22,clamp((frame-1935)/6)):1;
 return <g>
  <defs><linearGradient id="ri-gap-metal" x2="0" y2="1"><stop stopColor="#a2a7b1"/><stop offset="1" stopColor="#9da4ae"/></linearGradient><linearGradient id="ri-gap-floor" x2="1" y2="0"><stop stopColor="#bfbbaa"/><stop offset=".5" stopColor="#d2cdbb"/><stop offset="1" stopColor="#bdb9a8"/></linearGradient><radialGradient id="ri-gap-lamp"><stop stopColor="#a47c3e" stopOpacity=".7"/><stop offset=".45" stopColor="#896a39" stopOpacity=".35"/><stop offset="1" stopColor="#745f3a" stopOpacity="0"/></radialGradient><clipPath id="ri-gap-slatclip"><rect width="270" height={edge}/></clipPath><filter id="ri-gap-lamp-soft"><feGaussianBlur stdDeviation="5"/></filter></defs>
  <rect width="270" height="480" fill="#262727"/>
  <ellipse cx="190" cy="320" rx="23" ry="35" fill="url(#ri-gap-lamp)" filter="url(#ri-gap-lamp-soft)"/>
  <g clipPath="url(#ri-gap-slatclip)"><rect width="270" height="320" fill="url(#ri-gap-metal)"/>{Array.from({length:26},(_,i)=><g key={i}><path d={`M0,${10.5+i*13} H270`} stroke="#747c89" strokeWidth="1.45"/><path d={`M0,${13+i*13} H270`} stroke="#c1c6cd" strokeWidth=".5" opacity=".65"/></g>)}</g>
  <path d={`M0,${edge-1} H270`} stroke="#c1c5cc" strokeWidth="2"/><path d={`M0,${edge+2} H270`} stroke="#5e6671" strokeWidth="2.2"/>
  {present?[75,125,180].map((x,i)=><g key={x}><path d={`M${x},${edge+8} L${x+(i-1)*.5},${edge+8+extend*35}`} stroke="#586e4e" strokeWidth="4.9" strokeLinecap="round"/><ellipse cx={x} cy={edge+4.2} rx="7.8" ry="5.2" fill="#91a978" stroke="#687f57" strokeWidth=".45"/>{[-4.6,-1.4,1.8,5].map(dx=><path key={dx} d={`M${x+dx},${edge+1} v-3.9`} stroke="#91a978" strokeWidth="1.9" strokeLinecap="round"/>)}{[-3,0,3].map(dx=><path key={dx} d={`M${x+dx},${edge-.9} v1.7`} stroke="#566f4e" strokeWidth=".6"/>)}</g>):null}
  <rect y="348" width="270" height="132" fill="url(#ri-gap-floor)"/><path d="M0,347.5 H270" stroke="#8b8b7b" strokeWidth="1"/>{Array.from({length:15},(_,i)=><path key={i} d={`M${i*20+5},348 V480`} stroke="#a9aa9a" strokeWidth=".5" opacity=".35"/>)}
  {showHud?<><ReferenceCountdown frame={frame} value={frame>=1940?'04:42':undefined}/><ReferencePullBadge/></>:null}
 </g>;
};
