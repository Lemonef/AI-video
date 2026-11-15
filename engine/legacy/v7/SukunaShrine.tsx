import React from 'react';
import type {EnvProps} from '../v2/Forest';

const clamp = (n: number) => Math.max(0, Math.min(1, n));
const ease = (n: number) => {const t = clamp(n); return t * t * (3 - 2 * t);};
const font = {fontFamily: 'Sarabun, sans-serif'};

const Roof: React.FC<{x: number; y: number; s?: number; dark?: boolean}> = ({x, y, s = 1, dark}) => <g transform={`translate(${x} ${y}) scale(${s})`}>
  <path d="M-310 180 L0 -35 L310 180 L230 210 L0 65 L-230 210Z" fill={dark ? '#211526' : '#9b3f35'} stroke={dark ? '#110a17' : '#562824'} strokeWidth="18" strokeLinejoin="round"/>
  <path d="M-245 205 H245 V490 H-245Z" fill={dark ? '#302136' : '#f0c77c'} stroke={dark ? '#17101e' : '#75472e'} strokeWidth="18"/>
  <path d="M-155 490 V245 H155 V490 M0 245 V490" fill="none" stroke={dark ? '#17101e' : '#75472e'} strokeWidth="20"/>
  <circle cx="0" cy="155" r="31" fill={dark ? '#9e2741' : '#f8e1a5'}/>
</g>;

const Visitor: React.FC<{x: number; y: number; s?: number; arm?: number; lotus?: boolean; frame?: number}> = ({x, y, s = 1, arm = 0, lotus, frame = 0}) => <g transform={`translate(${x} ${y}) scale(${s})`}>
  <ellipse cx="0" cy="390" rx="118" ry="28" fill="#291724" opacity=".28"/>
  <path d="M-88 336 Q-72 188 0 172 Q72 188 88 336 L118 390 H-118Z" fill="#2c2534" stroke="#16121d" strokeWidth="14"/>
  <path d="M-54 184 Q-58 87 0 67 Q58 87 54 184" fill="#d5a295" stroke="#211825" strokeWidth="12"/>
  <path d="M-63 93 L-25 24 L0 61 L25 20 L64 96 L48 119 L0 91 L-46 121Z" fill="#c85d84" stroke="#211825" strokeWidth="12"/>
  <path d="M-38 120 L-4 132 M-34 151 L22 143 M-17 177 L35 187" stroke="#682d46" strokeWidth="10" strokeLinecap="round"/>
  <path d={`M-72 230 L${-148 + arm * 22} ${284 - arm * 65}`} stroke="#2c2534" strokeWidth="35" strokeLinecap="round"/>
  <path d={`M72 230 L${148 + arm * 12} ${284 - arm * 65}`} stroke="#2c2534" strokeWidth="35" strokeLinecap="round"/>
  {lotus ? <g transform="translate(142 222)"><path d="M0 95 L-4 8" stroke="#4b8052" strokeWidth="10"/><path d="M0 17 C-43 -20 -25 -67 0 -29 C25 -67 43 -20 0 17" fill="#e89ab4" stroke="#9d4d73" strokeWidth="7"/></g> : null}
</g>;

const Monk: React.FC<{x: number; y: number; s?: number; frame?: number}> = ({x, y, s = 1}) => <g transform={`translate(${x} ${y}) scale(${s})`}>
  <ellipse cx="0" cy="250" rx="92" ry="21" fill="#4a3526" opacity=".18"/><path d="M-72 230 Q-68 125 0 116 Q68 125 72 230Z" fill="#d98a37" stroke="#754126" strokeWidth="10"/><circle cy="88" r="42" fill="#a76e55" stroke="#623d31" strokeWidth="9"/><path d="M-83 162 Q0 210 83 162" fill="none" stroke="#f0b463" strokeWidth="19"/></g>;
const Aunty: React.FC<{x: number; y: number; s?: number; give?: boolean}> = ({x, y, s = 1, give}) => <g transform={`translate(${x} ${y}) scale(${s})`}>
  <ellipse cx="0" cy="292" rx="92" ry="22" fill="#473128" opacity=".2"/><path d="M-82 276 Q-77 150 0 145 Q77 150 82 276Z" fill="#704d9a" stroke="#382750" strokeWidth="11"/><circle cy="111" r="45" fill="#b87c64" stroke="#643f35" strokeWidth="10"/><path d="M-49 85 Q0 29 49 85 V105 H-49Z" fill="#504146"/>{give ? <path d="M59 176 L151 143" stroke="#b87c64" strokeWidth="25" strokeLinecap="round"/> : null}</g>;

const Temple: React.FC<{night?: boolean; red?: number; children?: React.ReactNode}> = ({night, red = 0, children}) => <g style={font}>
  <defs><linearGradient id="skys" x2="0" y2="1"><stop stopColor={night ? '#17233d' : '#6f9fbe'}/><stop offset="1" stopColor={night ? '#53607a' : '#f2bc7b'}/></linearGradient><radialGradient id="lantern"><stop stopColor="#ffe6a4" stopOpacity=".85"/><stop offset="1" stopColor="#ffcd78" stopOpacity="0"/></radialGradient></defs>
  <rect width="1080" height="1920" fill="url(#skys)"/><rect y="1160" width="1080" height="760" fill="#c59b6a"/>
  <circle cx="136" cy="280" r="230" fill="url(#lantern)" opacity=".55"/><circle cx="930" cy="390" r="180" fill="url(#lantern)" opacity=".35"/>
  <Roof x={540} y={460} s={1.22}/><path d="M0 1160 H1080" stroke="#8a694c" strokeWidth="22"/>
  <path d="M90 1160 V790 M990 1160 V790" stroke="#9f6941" strokeWidth="24"/><path d="M50 800 H130 M950 800 H1030" stroke="#d8a145" strokeWidth="19"/>
  {red > 0 ? <rect width="1080" height="1920" fill="#b82038" opacity={red * .24}/>: null}{children}
</g>;

export const ShrineHook: React.FC<EnvProps> = ({frame, progress = 0}) => <Temple night><Visitor x={220} y={1190} s={1.35} frame={frame}/><text x="540" y="250" fill="#fff0cd" fontSize="43" fontWeight="700" textAnchor="middle" style={font}>ศาลเจ้าคู่แข่ง?</text></Temple>;
export const ShrineBell: React.FC<EnvProps> = ({frame}) => <Temple night><path d="M510 230 Q540 150 570 230 V355 H510Z" fill="#c99545" stroke="#6e4924" strokeWidth="12"/><circle cx="540" cy="360" r="16" fill="#5b3c26"/><Visitor x={780} y={1230} s={1.45} arm={.55} frame={frame}/><path d="M486 180 Q540 125 594 180" fill="none" stroke="#f5dd91" strokeWidth="8" opacity=".7"/></Temple>;
export const ShrineDog: React.FC<EnvProps> = ({frame, progress = 0}) => <Temple><Visitor x={650} y={1210} s={1.35} arm={.45} frame={frame}/><g transform={`translate(${360 + ease(progress) * 150} 1430)`}><ellipse cx="0" cy="50" rx="110" ry="43" fill="#b98556" stroke="#65452f" strokeWidth="11"/><circle cx="88" cy="18" r="45" fill="#c79361" stroke="#65452f" strokeWidth="11"/><path d="M100 -15 l30 -42 13 60 M72 -16 L45 -55 42 8" fill="#75492f"/><circle cx="103" cy="13" r="6" fill="#1e1a1b"/><path d="M-68 82 L-89 130 M40 84 L56 130" stroke="#65452f" strokeWidth="18" strokeLinecap="round"/></g></Temple>;
export const ShrineMonk: React.FC<EnvProps> = ({frame}) => <Temple><Monk x={310} y={1230} s={1.25} frame={frame}/><Visitor x={740} y={1190} s={1.35} arm={.18} frame={frame}/><path d="M260 1450 l55 130 M340 1450 l-35 130" stroke="#8c633e" strokeWidth="13"/><path d="M272 1450 L350 1600" stroke="#805b38" strokeWidth="14"/></Temple>;
export const ShrineOffer: React.FC<EnvProps> = ({frame}) => <Temple><Aunty x={280} y={1230} s={1.18} give/><Visitor x={760} y={1200} s={1.38} arm={.42} frame={frame}/><rect x="75" y="1455" width="330" height="125" rx="18" fill="#b67b43" stroke="#714827" strokeWidth="13"/><path d="M170 1455 V1365 H300 V1455" fill="#f1eee2" stroke="#927f66" strokeWidth="11"/><text x="235" y="1428" textAnchor="middle" fontSize="29" fill="#614c3c" style={font}>ข้าวทำบุญ</text></Temple>;
export const ShrineChant: React.FC<EnvProps> = () => <Temple><Monk x={300} y={1290} s={1.1}/><Monk x={540} y={1260} s={1.22}/><Monk x={780} y={1290} s={1.1}/><Visitor x={935} y={1280} s={.78}/><path d="M180 1030 Q540 935 900 1030" fill="none" stroke="#f9e4a7" strokeWidth="12" opacity=".5"/></Temple>;
export const ShrineClash: React.FC<EnvProps> = ({frame, progress = 0}) => <Temple red={ease(progress)}><Visitor x={540} y={1190} s={1.56} arm={.8} frame={frame}/>{[0,1,2].map(i => <path key={i} d={`M${310+i*125} 1110 Q540 ${970-i*45} ${770-i*125} 1110`} fill="none" stroke="#a71f3c" strokeWidth="18" opacity={.25 + i*.15}/>)}</Temple>;
export const ShrineDomain: React.FC<EnvProps> = ({frame, progress = 0}) => <Temple night red={1}><Roof x={540} y={205} s={.82} dark/><Visitor x={540} y={1210} s={1.5} arm={.75} frame={frame}/><Monk x={170} y={1375} s={.72}/><Monk x={910} y={1375} s={.72}/><path d="M75 1580 Q540 1390 1005 1580" fill="none" stroke="#e53a54" strokeWidth="16" opacity=".45"/></Temple>;
export const ShrineLotus: React.FC<EnvProps> = ({frame}) => <Temple><Aunty x={235} y={1260} s={1.34} give/><Visitor x={760} y={1190} s={1.55} arm={.62} lotus frame={frame}/><g transform="translate(508 1220)"><path d="M0 100 L0 18" stroke="#4a8a54" strokeWidth="13"/><path d="M0 30 C-70 -10 -35 -96 0 -42 C35 -96 70 -10 0 30" fill="#efa7c2" stroke="#9e4f76" strokeWidth="10"/></g></Temple>;
export const ShrineExit: React.FC<EnvProps> = ({frame, progress = 0}) => <Temple><Visitor x={590 + progress * 230} y={1215} s={1.34 - progress * .18} lotus frame={frame}/><path d="M80 1150 L80 650 M1000 1150 L1000 650 M30 650 H1050" stroke="#9c603b" strokeWidth="28"/><path d="M50 670 Q540 410 1030 670" fill="none" stroke="#a34435" strokeWidth="48"/></Temple>;
