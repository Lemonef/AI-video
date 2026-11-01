import React from 'react';
import {Character2, type Look2} from '../v2/Character';
import {CAST2} from '../v2/cast';
import type {EnvProps} from '../v2/Forest';
import type {Expr, Pose} from '../types';

// Original Part2 sets. Motion is sampled on the narration's shared progress clock.
const font = {fontFamily: 'Sarabun, sans-serif'};
const clamp = (x: number) => Math.min(1, Math.max(0, x));
const ease = (x: number) => {const t = clamp(x); return t * t * (3 - 2 * t);};
export const phase = (p: number, a: number, b: number) => ease((p - a) / (b - a));
export const mix = (a: number, b: number, p: number) => a + (b - a) * p;
export const label = (x: number, y: number, text: string, size = 32, color = '#e2dfce') => <text x={x} y={y} textAnchor="middle" fontSize={size} fontWeight="700" fill={color}>{text}</text>;

const WarmLight = React.createContext(false);
export const Set: React.FC<{warm?: boolean; children?: React.ReactNode}> = ({warm, children}) => <WarmLight.Provider value={!!warm}><g style={font}>
  <defs>
    <linearGradient id="f2-wall" x2="0" y2="1"><stop stopColor={warm ? '#3e4449' : '#1c2d40'}/><stop offset="1" stopColor={warm ? '#67635a' : '#435c6c'}/></linearGradient>
    <linearGradient id="f2-floor" x2="0" y2="1"><stop stopColor={warm ? '#797466' : '#687d87'}/><stop offset="1" stopColor="#1e3347"/></linearGradient>
    <linearGradient id="f2-reflection" x2="0" y2="1"><stop stopColor="#a8b5b6" stopOpacity=".10"/><stop offset="1" stopColor="#a8b5b6" stopOpacity="0"/></linearGradient>
    <radialGradient id="f2-warm"><stop stopColor="#f3c77e" stopOpacity=".34"/><stop offset="1" stopColor="#e2bb7c" stopOpacity="0"/></radialGradient>
    <radialGradient id="f2-practical"><stop stopColor="#ffe4a0" stopOpacity=".8"/><stop offset=".15" stopColor="#efc787" stopOpacity=".25"/><stop offset="1" stopColor="#edc887" stopOpacity="0"/></radialGradient>
  </defs>
  <rect x="-500" y="-500" width="2100" height="3000" fill="#112235"/>
  <path d="M-80,-100 H1160 V1460 L820,1090 H260 L-80,1460Z" fill="url(#f2-wall)"/>
  <path d="M-80,-100 L260,350 V1090 L-80,1460Z" fill="#152b3d" opacity={warm ? .2 : .65}/>
  <path d="M1160,-100 L820,350 V1090 L1160,1460Z" fill="#182f42" opacity=".4"/>
  <path d="M-80,-100 H1160 L820,350 H260Z" fill="#101e2f"/>
  <path d="M0,100 H1080 M260,350 H820" stroke="#364c5c" strokeWidth="28"/>
  <path d="M0,117 H1080 M260,367 H820" stroke="#85949a" strokeWidth="4" opacity=".4"/>
  <path d="M755,-20 L675,340 V415 H724" fill="none" stroke="#71828a" strokeWidth="12"/>
  <path d="M748,-20 L668,340 V415" fill="none" stroke="#1b2d3b" strokeWidth="4"/>
  <rect x="687" y="395" width="110" height="34" rx="7" fill="#b5bca8"/>
  <rect x="701" y="404" width="79" height="14" rx="4" fill="#d6dfc1"/>
  <path d="M706,430 L590,1050 H910 L783,430Z" fill="#c3d3bc" opacity=".045"/>
  <path d="M260,1090 V350 M820,1090 V350" stroke="#8f9da1" strokeWidth="5" opacity=".5"/>
  <path d="M-80,1440 L260,1078 H820 L1160,1440" stroke="#142738" strokeWidth="24" fill="none"/>
  <path d="M-80,1423 L260,1063 H820 L1160,1423" stroke="#94a1a0" strokeWidth="5" opacity=".45" fill="none"/>
  <path d="M260,1090 H820 L1300,1920 H-200Z" fill="url(#f2-floor)"/>
  {[0, 1, 2, 3, 4, 5].map(i => <path key={i} d={`M540,990 L${-250 + i * 320},1920`} stroke="#a6b0b2" strokeWidth="3" opacity=".23"/>)}
  {[1175, 1310, 1510, 1810].map(y => <g key={y}><path d={`M0,${y} H1080`} stroke="#152d40" strokeWidth="5" opacity=".24"/><path d={`M0,${y + 5} H1080`} stroke="#9cabad" strokeWidth="2" opacity=".18"/></g>)}
  <path d="M365,1090 H660 L748,1490 H280Z" fill="url(#f2-reflection)"/>
  <path d="M782,365 q-34,96 -8,157 l-22,57 13,80 -31,70 25,75" fill="none" stroke="#b7bdab" strokeWidth="13" opacity=".065"/>
  <path d="M292,420 h210 M292,432 h150 M792,870 l-24,12 -7,39" stroke="#a4b0ac" strokeWidth="4" opacity=".12" fill="none"/>
  {warm ? <g>
    <path d="M195,1205 H850 L1030,1700 H40Z" fill="#5f625d" stroke="#9a9682" strokeWidth="8"/>
    <path d="M220,1230 H830 L975,1650 H90Z" fill="none" stroke="#b3a58b" strokeWidth="3" opacity=".55"/>
    <rect x="681" y="515" width="269" height="403" fill="#162d43" stroke="#b0aa8f" strokeWidth="12"/>
    <path d="M690,527 H938 V904 H690Z" fill="#293e54"/><path d="M811,520 V910 M690,724 H941" stroke="#72838b" strokeWidth="12"/>
    <path d="M695,520 Q745,675 711,910 H675 V520Z M938,520 Q887,680 922,910 H962 V520Z" fill="#8b8476"/>
    <path d="M690,535 Q721,680 697,892 M944,535 Q914,680 936,892" stroke="#c0b59b" strokeWidth="6" opacity=".4" fill="none"/>
    <path d="M758,854 h75 v49 h-75Z M847,817 h48 v86 h-48Z" fill="#15293c"/>
    <rect x="679" y="978" width="357" height="163" rx="31" fill="#495e61" stroke="#263d47" strokeWidth="8"/>
    <rect x="718" y="944" width="127" height="143" rx="24" fill="#647371"/>
    <rect x="853" y="944" width="130" height="143" rx="24" fill="#5b6c6b"/>
    <path d="M679,1040 v94 M1024,1040 v94 M740,1139 v28 M977,1139 v28" stroke="#283b44" strokeWidth="20" strokeLinecap="round"/>
    <path d="M891,961 l55,14 -20,68 -54,-12Z" fill="#a09275" opacity=".7"/>
    <path d="M127,1050 L263,1030 L290,1080 L146,1100Z" fill="#9b8263" stroke="#4a4b43" strokeWidth="6"/>
    <path d="M145,1100 V1242 M272,1082 V1210" stroke="#665d4d" strokeWidth="14"/>
    <rect x="150" y="594" width="91" height="135" rx="3" fill="#2d3b43" stroke="#aea18a" strokeWidth="8"/>
    <rect x="163" y="607" width="65" height="109" fill="#787f74"/><path d="M166,700 L190,648 L221,700Z" fill="#a8a58e"/>
    <circle cx="885" cy="453" r="49" fill="#b5b39a" stroke="#36464c" strokeWidth="8"/><path d="M885,423 v30 l19,10" stroke="#3e4d50" strokeWidth="5" fill="none"/>
    <ellipse cx="204" cy="983" rx="365" ry="480" fill="url(#f2-warm)"/>
    <circle cx="203" cy="997" r="133" fill="url(#f2-practical)"/>
    <path d="M177,1034 H230 L224,976 H185Z" fill="#e9cf8d" stroke="#6c6550" strokeWidth="6"/>
    <path d="M177,1038 H232 M186,973 Q204,943 223,973" stroke="#a1a087" strokeWidth="8" fill="none"/><rect x="190" y="982" width="27" height="40" fill="#ffeab6"/>
    <path d="M250,986 h18 v57 h-18Z" fill="#a2b2a5" stroke="#344b50" strokeWidth="3"/><path d="M254,977 h10 v10 h-10Z" fill="#d1d5bd"/>
  </g> : <g>
    <path d="M873,512 L1011,432 V883 L873,923Z" fill="#14283e" stroke="#607786" strokeWidth="8"/>
    <path d="M889,526 L994,466 V862 L889,891Z" fill="#2c465b"/><path d="M943,495 V885 M881,719 L1003,657" stroke="#637b88" strokeWidth="8"/>
    <path d="M920,502 L970,474 L1000,866 L953,886Z" fill="#a4bdc2" opacity=".07"/>
    <path d="M145,582 L220,614 V807 L145,777Z" fill="#a1adab" stroke="#3a5362" strokeWidth="5"/>
    <path d="M159,614 l46,20 M159,640 l39,18 M159,672 l43,18 M159,707 l31,14" stroke="#4e6875" strokeWidth="6"/>
    <path d="M163,1003 V938 Q178,921 190,938 V1003Z" fill="#904f48" stroke="#402e32" strokeWidth="4"/>
    <path d="M175,929 v-18 h19 M189,934 q26,17 21,45" stroke="#9ba89e" strokeWidth="6" fill="none"/>
    <path d="M156,1007 h42" stroke="#223a4a" strokeWidth="9"/>
    <path d="M-20,230 H38 V1550 H-20Z M1042,230 H1100 V1550 H1042Z" fill="#0c1e2d"/>
    <path d="M38,230 V1550 M1040,230 V1550" stroke="#65808f" strokeWidth="7" opacity=".5"/>
  </g>}
  {children}
</g></WarmLight.Provider>;

export const Actor: React.FC<{who?: string; look?: Look2; x: number; y: number; s?: number; f: number; pose?: Pose; expr?: Expr; turn?: number; walk?: boolean; back?: boolean}> = ({who = 'jaab', look, x, y, s = .6, f, pose = 'idle', expr = 'sweat', turn = 0, walk, back}) => {const warm = React.useContext(WarmLight); return <g transform={`translate(${x} ${y}) scale(${s})`}>
  <ellipse cy="1" rx="94" ry="17" fill="#081622" opacity=".45"/>
  <g style={{filter: warm ? 'brightness(.94) saturate(.92) drop-shadow(-3px -2px 0 rgba(224,186,119,.32))' : 'brightness(.87) saturate(.86) drop-shadow(3px -3px 0 rgba(149,190,204,.3))'}}><Character2 look={look ?? CAST2[who]} pose={pose} expr={expr} turn={turn} frame={f} walking={walk} back={back} torch={false}/></g>
</g>;};

export const Door: React.FC<{x: number; y: number; w?: number; h?: number; number?: string; open?: number}> = ({x, y, w = 240, h = 510, number, open = 0}) => <g>
  <rect x={x - 4} y={y + 3} width={w + 35} height={h + 26} fill="#081725" opacity=".5"/>
  <rect x={x - 20} y={y - 19} width={w + 40} height={h + 30} fill="#425663" stroke="#839395" strokeWidth="3"/>
  <rect x={x - 12} y={y - 13} width={w + 24} height={h + 20} fill="#111e2d"/>
  <rect x={x} y={y} width={w} height={h} fill="#0c1a29"/>
  <g transform={`translate(${x} ${y}) scale(${1 - open * .83} 1)`}>
    <path d={`M0,0 H${w} V${h} H0Z`} fill="#735a4d" stroke="#a48a72" strokeWidth="4"/>
    <path d={`M20,30 H${w - 20} V${h - 25} H20Z`} fill="none" stroke="#544738" strokeWidth="5"/>
    {[.19,.42,.71,.87].map((n,i)=><path key={i} d={`M${w*n},95 q${i%2?8:-6},${h*.27} 0,${h-130}`} stroke="#c1a17d" strokeWidth="2" fill="none" opacity=".13"/>)}
    <path d={`M4,6 V${h-5} M8,8 H${w-7}`} fill="none" stroke="#d6b58a" strokeWidth="5" opacity=".4"/>
    <rect x={w - 34} y={h * .54} width="11" height="46" rx="4" fill="#b6b7a8"/>
    {number ? <g><rect x={w / 2 - 47} y="38" width="94" height="42" rx="5" fill="#c3bca1"/>{label(w / 2, 70, number, 28, '#293b49')}</g> : null}
  </g>
</g>;

export const residents: Look2[] = [CAST2.mum,
  {...CAST2.runner, top: '#486d8b', hair: '#777a7d', hairHi: '#a4a4a3'},
  {...CAST2.friend, top: '#b48050', topShade: '#7c583c', style: 'short'},
  {...CAST2.runner, top: '#658576', topShade: '#3c6154', skin: '#b88868', skinShade: '#906349'},
  {...CAST2.friend, top: '#a26463', topShade: '#724345', hair: '#1e2832', hairHi: '#374551'},
  {...CAST2.runner, top: '#a59877', topShade: '#70694e', style: 'long'},
  {...CAST2.friend, top: '#596480', topShade: '#39445e', skin: '#e1b48a', style: 'short'},
];

export const PhoneFrame: React.FC<{children: React.ReactNode; recording?: boolean}> = ({children, recording}) => <g>
  <rect x="264" y="440" width="552" height="840" rx="52" fill="#111d2b" stroke="#9fadb3" strokeWidth="7"/>
  <rect x="285" y="490" width="510" height="700" rx="17" fill="#253b4d"/>
  <defs><clipPath id="f2-phone-clip"><rect x="285" y="490" width="510" height="700" rx="17"/></clipPath></defs>
  <g clipPath="url(#f2-phone-clip)">{children}</g>
  <rect x="486" y="461" width="108" height="10" rx="5" fill="#060f1b"/>
  <rect x="460" y="1238" width="160" height="8" rx="4" fill="#b4c0bd"/>
  {recording ? <g><circle cx="325" cy="532" r="10" fill="#ed7563"/>{label(382, 542, 'REC', 26, '#f5ddd2')}</g> : null}
</g>;

export const FloodEvidence: React.FC<EnvProps> = ({frame, progress = 0}) => <Set>
  <Door x={335} y={500} number="601"/>
  <Actor who="floodThug" x={865} y={1250} s={.66} f={frame} expr="angry" turn={-.45}/>
  <rect width="1080" height="1920" fill="#0a1727" opacity=".4"/>
  <g transform={`rotate(${-4 + Math.sin(frame / 45) * .4} 540 900)`}>
    <PhoneFrame recording><Door x={365} y={530} w={260} h={660} number="601"/><Actor who="floodThug" x={565} y={1160} s={.66} f={frame} expr="angry" turn={-.2}/><path d="M305,555 h35 v-35 M735,520 h35 v35 M305,1120 v35 h35 M735,1155 h35 v-35" fill="none" stroke="#e7e8d7" strokeWidth="5" opacity=".7"/></PhoneFrame>
  </g>
  {progress > .55 ? label(540, 395, 'หลักฐานอยู่ในเครื่องนี้', 34, '#e7c978') : null}
</Set>;

const MapView: React.FC<{p: number; trapped?: boolean}> = ({p, trapped}) => {
  const t = phase(p, .08, .75);
  const route = t < .25 ? [300, mix(745, 950, t * 4)] : t < .78 ? [mix(300, 780, (t - .25) / .53), 950] : [780, mix(950, 745, (t - .78) / .22)];
  return <g>
    <rect x="150" y="480" width="804" height="805" rx="20" fill="#071827" opacity=".5"/>
    <rect x="138" y="465" width="804" height="805" rx="20" fill="#142d40" stroke="#a1b4b7" strokeWidth="5"/>
    {[0,1,2,3,4,5,6,7].map(i=><path key={i} d={`M${169+i*105},485 V1250 M158,${500+i*102} H925`} stroke="#6f9ba5" strokeWidth="1" opacity=".12"/>)}
    {label(540, 425, 'ชั้น 6 · ทางเดินสองฝั่ง', 36)}
    <rect x="170" y="520" width="740" height="100" fill="#566773"/>
    <rect x="170" y="900" width="740" height="100" fill="#486477"/>
    {[{x: 180, w: 240, n: '601', sub: 'ห้องจ๊าบ'}, {x: 440, w: 180, n: '603', sub: 'ห้องป้า'}, {x: 660, w: 240, n: '606', sub: 'เพื่อนบ้าน'}].map(r => <g key={r.n}>
      <rect x={r.x} y="650" width={r.w} height="180" fill={r.n === '606' ? '#6d715e' : '#42515d'} stroke="#99a8a8" strokeWidth="3"/>
      {label(r.x + r.w / 2, 715, r.n, 37)}{label(r.x + r.w / 2, 764, r.sub, 26)}
      <path d={`M${r.x + r.w / 2},620 V650`} stroke="#b1a98c" strokeWidth="14"/>
    </g>)}
    <path d="M300,830 V900 M780,830 V900 M865,1000 V1150" stroke="#b1a98c" strokeWidth="16"/>
    <rect x="775" y="1080" width="133" height="130" fill="#324e5d" stroke="#79939c" strokeWidth="3"/>
    {[0, 1, 2, 3].map(i => <path key={i} d={`M790,${1100 + i * 24} h98`} stroke="#9eafb2" strokeWidth="6"/>)}
    {label(444, 1061, 'ทางเดินบริการด้านหลัง', 28, '#c5d7d9')}
    <path d="M300,745 V950 H780 V745" stroke="#e1c66c" strokeWidth="10" strokeDasharray="16 13" fill="none" opacity={trapped ? .32 : .8}/>
    {trapped ? <g>
      <circle cx="780" cy="574" r="28" fill="#ad5c5c"/>{label(780, 586, '1', 28)}
      <circle cx="780" cy="950" r="28" fill="#8ca267"/>{label(780, 962, '2', 28)}
      <rect x="728" y="627" width="105" height="22" fill="#b38b62"/>
      <circle cx="780" cy="800" r="21" fill="#ead278"/>
      {label(400, 1165, 'หน้าโดนขวาง · หลังโดนดัก', 29, '#e8bba2')}
      <path d="M780,608 v18 M780,920 v-75" stroke="#d68170" strokeWidth="8"/>
    </g> : <g><circle cx="300" cy="570" r="27" fill="#a75d5f"/>{label(300, 581, '1', 27)}<circle cx={route[0]} cy={route[1]} r="21" fill="#e6c75b" stroke="#fff0ad" strokeWidth="5"/>{label(500, 1165, 'อ้อมไปสมทบห้อง 606', 31, '#e5d49d')}</g>}
  </g>;
};
export const FloodRoute: React.FC<EnvProps> = ({progress = 0}) => <Set><MapView p={progress}/></Set>;

export const FloodPassage: React.FC<EnvProps> = ({frame, progress = 0}) => {
  const p = phase(progress, .05, .82); const s = mix(.72, .32, p);
  return <Set><Door x={340} y={495} w={270} h={590} open={.95}/><path d="M690,500 h140 v110 H690Z" fill="#2b705d"/>{label(760, 546, 'ทางหนีไฟ', 26)}<path d="M724,580 h65 l-18,-12 m18,12 l-18,12" stroke="#e0e6cd" strokeWidth="7" fill="none"/>
    <path d="M68,1240 L300,1050 L700,1050 L980,1240" stroke="#7e96a4" strokeWidth="13" fill="none"/>
    {[150, 270, 810, 930].map(x => <path key={x} d={`M${x},1190 V1430`} stroke="#5e788a" strokeWidth="10"/>)}
    <Actor x={mix(540, 515, p)} y={mix(1260, 1095, p)} s={s} f={frame} walk={progress < .82} back expr="sweat"/>
  </Set>;
};

export const FloodGroup: React.FC<EnvProps> = ({frame, progress = 0}) => <Set warm>
  <Door x={290} y={485} w={260} h={605} number="606" open={.92}/>
  {residents.slice(1).map((look, i) => <Actor key={i} look={look} x={365 + i % 3 * 175} y={1005 + Math.floor(i / 3) * 140} s={.31 + Math.floor(i / 3) * .025} f={frame + i * 13} expr={i % 2 ? 'shock' : 'sweat'} turn={i % 2 ? -.2 : .2}/>)}
  <Actor who="mum" x={260} y={1240} s={.46} f={frame} pose={progress > .5 ? 'point' : 'idle'} turn={.35}/>
  <Actor x={805} y={1250} s={.53} f={frame} expr="sweat" turn={-.4}/>
  <rect x="133" y="390" width="430" height="67" rx="12" fill="#1d3345"/>{label(348, 436, 'ห้อง 606 · รวม 8 คน', 32)}
</Set>;

// The wrist is the prop contact target; two fixed-length bones determine the elbow.
// Unreachable targets fail rendering instead of detaching the hand from its prop.
const armElbow = (shoulder: number[], wrist: number[], bend: number): number[] => {
  const dx = wrist[0] - shoulder[0]; const dy = wrist[1] - shoulder[1];
  const distance = Math.hypot(dx, dy); const upper = 140; const fore = 130;
  if (distance > upper + fore + .01 || distance < Math.abs(upper - fore) - .01) throw new Error(`Flood contact arm unreachable: ${distance.toFixed(2)}`);
  const along = (upper * upper + distance * distance - fore * fore) / (2 * distance);
  const perpendicular = Math.sqrt(Math.max(0, upper * upper - along * along)) * bend;
  return [shoulder[0] + dx / distance * along - dy / distance * perpendicular,
    shoulder[1] + dy / distance * along + dx / distance * perpendicular];
};

// Contact actors use the original head/legs and world-space grip targets.
export const Worker: React.FC<{id: string; who: string; x: number; y: number; s: number; f: number; hands: [[number, number], [number, number]]; lean?: number; expr?: Expr}> = ({id, who, x, y, s, f, hands, lean = 0, expr = 'sweat'}) => {
  const look = CAST2[who];
  const warm = React.useContext(WarmLight);
  const hand = (i: number) => [(hands[i][0] - x) / s, (hands[i][1] - y) / s];
  return <g transform={`translate(${x} ${y}) scale(${s})`} style={{filter: warm ? 'drop-shadow(-3px -2px 0 rgba(224,186,119,.28))' : 'brightness(.92) drop-shadow(3px -3px 0 rgba(149,190,204,.25))'}}>
    <defs><clipPath id={`f2-worker-${id}`}><rect x="-225" y="-1010" width="450" height="355"/><rect x="-80" y="-400" width="160" height="320"/><rect x="-120" y="-80" width="240" height="130"/></clipPath></defs>
    <ellipse cy="4" rx="98" ry="18" fill="#071b27" opacity=".5"/>
    <g clipPath={`url(#f2-worker-${id})`}><Character2 look={look} pose="idle" expr={expr} turn={who === 'mum' ? .3 : -.2} frame={f} torch={false}/></g>
    <path d={`M-83,-630 Q0,-650 83,-630 L${105 + lean},-393 Q0,-371 -105,-393Z`} fill={look.top} stroke={look.topShade} strokeWidth="10"/>
    {look.lanyard ? <g><path d="M-40,-616 L0,-446 L40,-616" stroke="#d6c788" strokeWidth="12" fill="none"/><rect x="-25" y="-486" width="50" height="66" rx="5" fill="#d8d4b9"/><rect x="-17" y="-474" width="34" height="22" fill="#558a7f"/></g> : null}
    {[-1, 1].map((side, i) => {const h = hand(i); const shoulder = [side * 81, -612]; const elbow = armElbow(shoulder, h, side < 0 ? 1 : -1); return <g key={side}>
      <path d={`M${shoulder} L${elbow} L${h}`} stroke={look.topShade} strokeWidth="44" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      <path d={`M${shoulder} L${elbow}`} stroke={look.top} strokeWidth="38" fill="none" strokeLinecap="round"/>
      <path d={`M${elbow} L${h}`} stroke={look.skin} strokeWidth="31" fill="none" strokeLinecap="round"/>
      <circle cx={h[0]} cy={h[1]} r="21" fill={look.skin}/><path d={`M${h[0] - 10},${h[1] - 7} q10,10 22,0`} stroke={look.skinShade} strokeWidth="5" fill="none" strokeLinecap="round"/>
    </g>;})}
  </g>;
};
export const Chair: React.FC<{x: number; y: number}> = ({x, y}) => <g transform={`translate(${x} ${y})`}><path d="M-70,90 V-45 Q0,-72 70,-45 V90 M-48,10 H48 M-68,95 L-80,210 M65,95 L80,210" fill="none" stroke="#8e7762" strokeWidth="17" strokeLinecap="round"/><path d="M-85,78 L50,60 L87,95 L-58,112Z" fill="#b09a7a" stroke="#594a3d" strokeWidth="7"/></g>;
export const FloodChair: React.FC<EnvProps> = ({frame, progress = 0}) => {
  const transfer = phase(progress, .18, .62); const release = phase(progress, .64, .82);
  const x = mix(445, 525, transfer); const y = 1000 - Math.sin(transfer * Math.PI) * 25;
  return <Set warm><Door x={285} y={485} w={260} h={605} number="606" open={.9}/>
    <Worker id="aunt" who="mum" x={320} y={1240} s={.48} f={frame} hands={[[mix(x - 56, 263, phase(progress, .18, .42)), mix(y - 10, 1065, phase(progress, .18, .42))], [mix(x - 70, 359, release), mix(y + 25, 1065, release)]]}/>
    <Worker id="jaab" who="jaab" x={640} y={1240} s={.5} f={frame} expr={progress < .5 ? 'sleepy' : 'shock'} hands={[[x + 66, y + 25], [mix(688, x + 65, phase(progress, .45, .62)), mix(1035, y - 22, phase(progress, .45, .62))]]}/>
    <ellipse cx={x} cy="1250" rx="105" ry="17" fill="#0b1d2a" opacity=".35"/><Chair x={x} y={y}/>
    {progress > .62 ? <g><path d="M220,425 h640 v96 H220Z" fill="#e0c783"/>{label(540, 487, 'เอาไปขวางประตู!', 44, '#2a3942')}</g> : null}
  </Set>;
};

export const Cabinet: React.FC<{x: number; y?: number}> = ({x, y = 980}) => <g transform={`translate(${x} ${y})`}>
  <ellipse cy="280" rx="235" ry="25" fill="#081a26" opacity=".5"/>
  <path d="M-220,0 L180,-32 L235,0 L-170,34Z" fill="#bfa17c"/>
  <path d="M-220,0 L-170,34 V280 L-220,240Z" fill="#685642"/>
  <path d="M-170,34 L235,0 V246 L-170,280Z" fill="#947657" stroke="#574b3c" strokeWidth="6"/>
  {[67, 144, 219].map(y0 => <g key={y0}><path d={`M-150,${y0} L215,${y0 - 30}`} stroke="#5a4a39" strokeWidth="4"/><path d={`M0,${y0 - 27} l60,-5`} stroke="#c8b794" strokeWidth="10" strokeLinecap="round"/></g>)}
</g>;
export const FloodBarricade: React.FC<EnvProps> = ({frame, progress = 0}) => {
  const push = phase(progress, .18, .74); const x = 560 + 42 * push;
  return <Set><Door x={450} y={480} w={275} h={610}/><Actor who="mum" x={855} y={1245} s={.45} f={frame} pose="shock"/>
    <Worker id="push" who="jaab" x={330} y={1250} s={.5} f={frame} lean={push * 12} hands={[[x - 200, 1001], [x - 197, 1050]]}/>
    <Actor who="runner" x={408} y={1150} s={.4} f={frame} pose="hold" turn={.4}/>
    <Cabinet x={x}/><path d={`M${x - 190},1262 h45 M${x + 165},1258 h45`} stroke="#131f2d" strokeWidth="7" opacity=".5"/>
  </Set>;
};

export const FloodRecord: React.FC<EnvProps> = ({frame, progress = 0}) => {
  const retreat = phase(progress, .35, .85); const s = mix(.62, .39, retreat);
  return <Set><PhoneFrame recording><Door x={370} y={520} w={250} h={660} number="601"/><Actor who="floodThug" x={mix(560, 655, retreat)} y={mix(1160, 1060, retreat)} s={s} f={frame} expr="angry" turn={-.35} walk={retreat > 0 && retreat < 1} back={retreat > .12}/><rect x="300" y="1128" width="480" height="48" fill="#081b2b" opacity=".75"/>{label(540, 1162, 'บันทึกภาพไว้', 29)}</PhoneFrame></Set>;
};
export const FloodRearDoor: React.FC<EnvProps> = ({frame, progress = 0}) => {
  const open = .55 + .45 * phase(progress, .05, .3); const enter = phase(progress, .34, .86);
  return <Set><Door x={345} y={485} w={330} h={610} open={open}/>
    <rect x="346" y="430" width="330" height="56" fill="#284d55"/>{label(511, 470, 'ประตูบริการ', 30)}
    {progress > .3 ? <Actor who="floodThug2" x={mix(535, 570, enter)} y={mix(1090, 1250, enter)} s={mix(.32, .57, enter)} f={frame} walk={enter < 1} expr="flat" turn={-.3}/> : null}
  </Set>;
};
export const FloodSurrounded: React.FC<EnvProps> = ({progress = 0}) => <Set><MapView p={progress} trapped/></Set>;
export const FloodExtort: React.FC<EnvProps> = ({frame, progress = 0}) => <Set><Door x={290} y={400} w={450} h={940}/><Actor who="floodThug" x={560} y={1500} s={1.02} f={frame} pose={progress > .38 ? 'point' : 'armsCrossed'} expr="angry" turn={-.15}/><Cabinet x={570} y={1170}/></Set>;

export const FloodRescue: React.FC<EnvProps> = ({frame, progress = 0}) => {
  const bx = mix(190, 770, phase(progress, .05, .95)); const wave = Math.sin(frame / 21) * 4;
  return <g style={font}>
    <defs><linearGradient id="f2-water" x2="0" y2="1"><stop stopColor="#365b72"/><stop offset="1" stopColor="#122d46"/></linearGradient><linearGradient id="f2-beam"><stop stopColor="#e8e1b2" stopOpacity=".5"/><stop offset="1" stopColor="#eee4ba" stopOpacity=".03"/></linearGradient></defs>
    <rect x="-300" y="-300" width="1700" height="2600" fill="#1c3149"/>
    {[0, 1, 2, 3].map(i => <g key={i}><rect x={i * 285 - 40} y={310 + i % 2 * 100} width="235" height="850" fill={i % 2 ? '#40596a' : '#2d465c'}/>{[0, 1, 2].map(j => <rect key={j} x={i * 285 + 8} y={460 + j * 180} width="95" height="75" fill="#849698" opacity=".35"/>)}</g>)}
    <rect x="-200" y="1060" width="1500" height="1000" fill="url(#f2-water)"/>
    {[0, 1, 2, 3, 4].map(i => <path key={i} d={`M0,${1120 + i * 95} q180,-18 360,0 t720,0`} transform={`translate(${Math.sin(frame / 25 + i) * 15} 0)`} stroke="#7894a0" strokeWidth="4" opacity=".35" fill="none"/>)}
    <path d={`M${bx},${1162 + wave} L${bx - 180 + Math.sin(frame / 38) * 140},470 L${bx + 160 + Math.sin(frame / 38) * 140},470Z`} fill="url(#f2-beam)"/>
    <g transform={`translate(${bx} ${1190 + wave})`}><path d="M-150,-30 H145 L110,42 H-102Z" fill="#aa563f" stroke="#182b3b" strokeWidth="8"/><path d="M-70,-35 L-30,-115 H60 L95,-35Z" fill="#eee1ba"/><rect x="-18" y="-100" width="60" height="45" fill="#305268"/>{label(0, 14, 'กู้ภัย', 29, '#efe4c6')}<circle cy="-111" r="12" fill={frame % 28 < 14 ? '#84c3dc' : '#d18272'}/><circle cy="-26" r="11" fill="#f3e7b5"/></g>
    <path d="M-100,-100 H1180 V400 H-100Z M-100,0 H135 V1920 H-100Z M945,0 H1180 V1920 H945Z M0,1320 H1080 V1920 H0Z" fill="#12263a"/><path d="M139,400 H941 V1310 H139Z" stroke="#708592" strokeWidth="15" fill="none"/><path d="M540,400 V1320" stroke="#4d6577" strokeWidth="15"/>
  </g>;
};

export const FloodBattery: React.FC<EnvProps> = ({frame}) => <Set><PhoneFrame>
  <rect x="285" y="490" width="510" height="700" fill="#233d50"/>
  <rect x="631" y="513" width="113" height="39" rx="7" fill="none" stroke="#d8d9c7" strokeWidth="4"/><rect x="639" y="520" width="12" height="25" rx="2" fill="#dd8067"/>{label(575, 545, '11%', 31, '#efbd98')}
  {label(540, 628, 'คลิปที่เพิ่งถ่าย', 35)}
  <rect x="347" y="675" width="386" height="267" rx="15" fill="#14283a"/>
  <g transform="translate(541 930) scale(.28)"><Character2 look={CAST2.floodThug} pose="armsCrossed" expr="angry" turn={-.2} frame={frame} torch={false}/></g>
  <circle cx="541" cy="811" r="34" fill="#e1e0ce" opacity=".7"/><path d="M532,791 L558,811 L532,831Z" fill="#1c3346"/>
  <rect x="363" y="995" width="355" height="65" rx="13" fill="#59646a"/>{label(540, 1040, 'ยังไม่ได้ส่ง', 32, '#e5dbc5')}
  {label(540, 1136, 'หลักฐาน + ตำแหน่ง', 28, '#bdd0d1')}
  </PhoneFrame></Set>;

export const FloodPressure: React.FC<EnvProps> = ({frame, progress = 0}) => {
  const force = phase(progress, .15, .26) - phase(progress, .32, .46) + .7 * (phase(progress, .61, .73) - phase(progress, .83, .97));
  return <Set><Door x={400} y={485} w={320} h={615}/>
    <Worker id="thug-load" who="floodThug" x={560} y={1220} s={.5} f={frame} hands={[[530, 1005 + force * 8], [620, 1002 + force * 8]]} lean={force * 10} expr="angry"/>
    <Worker id="brace" who="jaab" x={330} y={1255} s={.5} f={frame} hands={[[356, 1000 + force * 8], [359, 1050 + force * 8]]} lean={force * 14}/>
    <Actor who="mum" x={868} y={1260} s={.47} f={frame} pose="hold" expr="shock"/>
    <Cabinet x={575} y={978 + force * 8}/>
    {force > .7 ? <path d="M350,1025 l-24,-20 M344,1072 l-30,0 M806,1010 l29,-15" stroke="#c8bda3" strokeWidth="5" fill="none" opacity=".55"/> : null}
  </Set>;
};
