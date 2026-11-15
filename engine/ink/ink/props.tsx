import React from 'react';
import {INK, LINE, ORANGE, PAPER, Tower} from '../compositions/InkProof';

// Flat prop silhouettes in the proof's style (INK stroke, LINE width). Every prop draws from its own top-left
// origin (0,0) like the ep1 originals; PROP_BOX holds each one's drawn width/height so animators can scale
// about the centre and drop/slide by a size-relative distance. Change a prop's geometry and its PROP_BOX entry together.

export const Newspaper: React.FC<{x: number; y: number}> = ({x, y}) => (
  <g transform={`translate(${x} ${y}) rotate(-6)`} stroke={INK} strokeWidth={LINE} fill="#fff" strokeLinejoin="round">
    <rect width={420} height={520} rx={8} />
    <rect x={30} y={30} width={360} height={90} fill={INK} />
    <path d="M30 170 L390 170 M30 220 L390 220 M30 270 L390 270 M30 320 L250 320" strokeWidth={8} />
    <rect x={270} y={300} width={120} height={150} fill="#d9d4c7" strokeWidth={6} />
  </g>
);

export const Suitcase: React.FC<{x: number; y: number; k?: number}> = ({x, y, k = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${k})`} stroke={INK} strokeWidth={LINE} strokeLinejoin="round" strokeLinecap="round">
    <ellipse cx={210} cy={285} rx={250} ry={26} fill="#00000030" stroke="none" />
    <rect width={420} height={270} rx={18} fill="#8a5a2b" />
    <path d="M150 0 L150 -44 Q150 -64 175 -64 L245 -64 Q270 -64 270 -44 L270 0" fill="none" />
    <rect x={185} y={110} width={50} height={36} rx={6} fill="#e8b92b" />
  </g>
);

export const Door: React.FC<{x: number; y: number}> = ({x, y}) => (
  <g transform={`translate(${x} ${y})`} stroke={INK} strokeWidth={LINE} strokeLinejoin="round">
    <ellipse cx={150} cy={535} rx={190} ry={24} fill="#00000030" stroke="none" />
    <rect width={300} height={520} rx={10} fill="#4a3a2c" />
    <rect x={30} y={40} width={110} height={190} fill="#f6d9a8" opacity={0.6} />
    <rect x={160} y={40} width={110} height={190} fill="#f6d9a8" opacity={0.6} />
    <circle cx={260} cy={290} r={14} fill="#e8b92b" />
  </g>
);

export const Banknotes: React.FC<{x: number; y: number}> = ({x, y}) => (
  <g transform={`translate(${x} ${y})`} stroke={INK} strokeWidth={LINE} strokeLinejoin="round">
    {[0, 1, 2].map((i) => (
      <g key={i} transform={`translate(${i * 40} ${-i * 46}) rotate(${i * 5 - 5})`}>
        <rect width={360} height={170} rx={10} fill="#8fcf9e" />
        <circle cx={180} cy={85} r={42} fill="none" strokeWidth={8} />
      </g>
    ))}
  </g>
);

// ---------- added for the directed episode ----------
const GOLD = '#e8b92b';
const SHADOW = '#00000030';
// Tower's own geometry (InkProof Tower path): base half-width 130, height 430 at k=1.
const TOWER_HALF_W = 130;
const TOWER_H = 430;

export const TowerProp: React.FC<{x: number; y: number}> = ({x, y}) => (
  <g transform={`translate(${x} ${y})`}>
    <ellipse cx={TOWER_HALF_W} cy={TOWER_H + 6} rx={TOWER_HALF_W + 30} ry={18} fill={SHADOW} />
    <Tower x={TOWER_HALF_W} y={TOWER_H} k={1} fill="#5b5148" lattice />
  </g>
);

export const Coin: React.FC<{x: number; y: number}> = ({x, y}) => (
  <g transform={`translate(${x} ${y})`} stroke={INK} strokeWidth={LINE} fill={GOLD}>
    <circle cx={60} cy={60} r={56} />
    <circle cx={60} cy={60} r={34} fill="none" strokeWidth={6} />
    <path d="M60 40 L60 80" strokeWidth={8} strokeLinecap="round" />
  </g>
);

export const Papers: React.FC<{x: number; y: number}> = ({x, y}) => (
  <g transform={`translate(${x} ${y})`} stroke={INK} strokeWidth={LINE} strokeLinejoin="round">
    {[0, 1, 2].map((i) => (
      <g key={i} transform={`translate(${i * 18} ${i * 14}) rotate(${(i - 1) * 4} 150 190)`}>
        <rect width={280} height={360} rx={6} fill="#fff" />
        <path d="M34 60 L246 60 M34 110 L246 110 M34 160 L246 160 M34 210 L180 210" strokeWidth={7} />
      </g>
    ))}
    {/* official seal on the top sheet: the "government papers" read */}
    <circle cx={250} cy={310} r={34} fill="#d6453d" strokeWidth={6} />
  </g>
);

export const Telegram: React.FC<{x: number; y: number}> = ({x, y}) => (
  <g transform={`translate(${x} ${y}) rotate(4 190 120)`} stroke={INK} strokeWidth={LINE} strokeLinejoin="round">
    <rect width={380} height={240} rx={6} fill="#f3e6c4" />
    <rect x={20} y={20} width={340} height={46} fill={INK} />
    <text x={190} y={54} textAnchor="middle" fill={PAPER} stroke="none" fontFamily="Arial Black, Arial, sans-serif" fontSize={32} letterSpacing={6}>TELEGRAM</text>
    <path d="M36 110 L344 110 M36 150 L344 150 M36 190 L240 190" strokeWidth={7} strokeDasharray="34 12" />
  </g>
);

export const Handcuffs: React.FC<{x: number; y: number}> = ({x, y}) => (
  <g transform={`translate(${x} ${y})`} stroke={INK} strokeWidth={LINE} fill="none" strokeLinecap="round">
    <circle cx={80} cy={80} r={64} stroke="#9aa3ab" strokeWidth={26} />
    <circle cx={80} cy={80} r={64} />
    <circle cx={280} cy={80} r={64} stroke="#9aa3ab" strokeWidth={26} />
    <circle cx={280} cy={80} r={64} />
    <path d="M144 80 L216 80" strokeDasharray="14 10" strokeWidth={12} />
  </g>
);

export const Ship: React.FC<{x: number; y: number}> = ({x, y}) => (
  <g transform={`translate(${x} ${y})`} stroke={INK} strokeWidth={LINE} strokeLinejoin="round">
    <rect x={150} y={20} width={70} height={140} fill={ORANGE} />
    <rect x={300} y={40} width={70} height={120} fill={ORANGE} />
    <rect x={110} y={150} width={400} height={70} fill="#fff" />
    <path d="M0 220 L620 220 L540 340 L70 340 Z" fill="#2b2b2b" />
    <path d="M30 262 L590 262" stroke={PAPER} strokeWidth={10} />
  </g>
);

export const Keys: React.FC<{x: number; y: number}> = ({x, y}) => (
  <g transform={`translate(${x} ${y})`} stroke={INK} strokeWidth={LINE} strokeLinecap="round" strokeLinejoin="round">
    <circle cx={60} cy={60} r={44} fill="none" />
    {[0, 1].map((i) => (
      <g key={i} transform={`rotate(${i * 34 - 10} 60 60)`} fill={GOLD}>
        <circle cx={130} cy={60} r={26} />
        <path d="M156 60 L250 60 L250 84 M222 60 L222 80" fill="none" strokeWidth={12} />
      </g>
    ))}
  </g>
);

export type PropKind = 'suitcase' | 'banknotes' | 'door' | 'newspaper' | 'tower' | 'coin' | 'papers' | 'telegram' | 'handcuffs' | 'ship' | 'keys';

// kind -> [component, drawn box {w, h}] (box measured from the geometry above; banknotes' stack climbs above y=0)
export const PROPS: Record<PropKind, {C: React.FC<{x: number; y: number}>; w: number; h: number}> = {
  suitcase: {C: Suitcase, w: 420, h: 270},
  banknotes: {C: Banknotes, w: 440, h: 170},
  door: {C: Door, w: 300, h: 520},
  newspaper: {C: Newspaper, w: 420, h: 520},
  tower: {C: TowerProp, w: TOWER_HALF_W * 2, h: TOWER_H},
  coin: {C: Coin, w: 120, h: 120},
  papers: {C: Papers, w: 316, h: 388},
  telegram: {C: Telegram, w: 380, h: 240},
  handcuffs: {C: Handcuffs, w: 360, h: 160},
  ship: {C: Ship, w: 620, h: 340},
  keys: {C: Keys, w: 260, h: 140},
};
