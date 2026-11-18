import React from 'react';
import {INK, PAPER, GREEN, RED, ORANGE, LINE} from '../compositions/InkProof';

export type IconName = 'tower' | 'hat' | 'bill' | 'coin' | 'padlock' | 'letter' | 'mask' | 'pin' | 'ship' | 'newspaper' | 'factory' | 'badge' | 'clock' | 'scrap' | 'key' | 'suitcase' | 'handcuffs' | 'pen' | 'hotel' | 'crown' | 'face' | 'man' | 'chair';
export const DOODLE = {
  yellow: '#E8C15A', // muted gold marker
  blue: '#7FA6C9', // muted blue marker
  skin: '#E9C3A0', // warm skin marker
  brown: '#9A6B47', // muted brown marker
  grey: '#A7A9A6', // neutral grey marker
  cream: '#F1E6CC', // warm paper marker
};

// Hand-drawn window quads: a small corner drift keeps the panes off-square.
const WIN_W = 25, WIN_H = 28, WIN_TOP = 24, WIN_WOBBLE = 2, WIN_DRIFT = 1;
const HOTEL_WIN_W = 17, HOTEL_WIN_H = 18;

// All artwork shares the same outline and one upper-left paper glint.
export const DoodleIcon: React.FC<{name: IconName; size: number; fill?: string}> = ({name, size, fill}) => {
  let art: React.ReactNode;
  let highlight: string;
  const base = (c: string) => fill ?? c;
  switch (name) {
    case 'tower':
      art = <><path fill={base(DOODLE.brown)} d="M-77 86 Q-40 30 -25 -20 L-9 -69 L0 -92 L8 -68 L24 -20 Q39 35 77 86 L42 86 Q29 32 0 34 Q-29 33 -43 87Z"/><path fill={base(DOODLE.brown)} d="M-38 9 L37 7 L40 19 L-41 21Z M-23 -31 L22 -33 L25 -23 L-26 -21Z"/><path fill="none" d="M-57 65 l22 7 m-17 -18 l22 6 m-13 -19 l20 6 M56 65 l-22 7 m17 -18 l-22 6 m13 -19 l-20 6 M-51 72 l19 -18 m-10 -1 l18 -16 M51 72 L32 54 m10 -1 L24 37 M-25 7 L15 -20 M25 7 L-15 -20 M-13 -35 L8 -56 M13 -35 L-8 -56"/></>;
      highlight = 'M-15 -43 L-11 -55'; break;
    case 'hat':
      art = <><path fill={base(INK)} d="M-57 28 Q-64 -66 -3 -68 Q59 -72 57 28 Q77 37 88 23 Q97 51 65 59 Q-1 74 -71 55 Q-96 47 -87 25 Q-74 38 -57 28Z"/><path fill={DOODLE.grey} d="M-58 9 Q0 24 58 8 L58 28 Q0 44 -58 28Z"/></>;
      highlight = 'M-41 -24 Q-39 -43 -22 -49'; break;
    case 'bill':
      art = <><path fill={base(GREEN)} d="M-87 -48 Q-8 -54 63 -47 L86 -25 L83 49 Q0 45 -85 53Z"/><path fill={INK} fillOpacity={0.3} d="M63 -47 L62 -22 L86 -25Z"/><ellipse rx={24} ry={34} fill={DOODLE.cream}/><path fill="none" d="M-9 17 Q-14 4 -5 1 Q-18 -18 0 -21 Q18 -18 7 0 Q20 4 15 18 M-69 -29 l7 -3 v16 m-11 1 h18 M55 15 l8 -3 v18 m-10 1 h18"/></>;
      highlight = 'M-70 -34 L-43 -35'; break;
    case 'coin':
      art = <><path fill={base(DOODLE.yellow)} d="M-62 -49 Q3 -89 65 -40 L74 18 Q56 79 -8 79 Q-70 69 -71 10Z"/><ellipse cx={-6} cy={-7} rx={64} ry={66} fill={base(DOODLE.yellow)}/><path fill="none" d="M-11 28 L-10 -33 L20 -32 M-9 -7 L15 -8 M-23 15 L7 15 M48 47 l5 14 M29 57 l3 13"/>{[-2.5,-1.8,-1.1,-0.4,0.3,1,1.7,2.4].map(a => <circle key={a} cx={-6 + 51*Math.cos(a)} cy={-7 + 52*Math.sin(a)} r={2} fill={INK} stroke="none"/>)}</>;
      highlight = 'M-49 -29 Q-42 -43 -31 -47'; break;
    case 'padlock':
      art = <><path fill={INK} d="M-45 -10 L-44 -46 Q-42 -89 0 -86 Q45 -86 46 -44 L45 -8 L26 -8 L26 -45 Q23 -65 0 -65 Q-24 -64 -25 -44 L-25 -9Z"/><path fill={base(DOODLE.grey)} d="M-61 -10 Q0 -16 61 -8 L64 74 Q2 81 -62 73Z"/><path fill={INK} d="M-11 24 A13 13 0 1 1 10 25 L14 49 L-15 50Z"/></>;
      highlight = 'M-45 9 L-23 8'; break;
    case 'letter':
      art = <><path fill={base(DOODLE.cream)} d="M-85 -53 L85 -49 L82 56 L-83 59Z"/><path fill="none" d="M-82 -48 L1 13 L82 -47 M-81 55 L-26 6 M82 54 L28 7"/><path fill={RED} d="M-17 8 Q-21 -8 -3 -10 Q14 -14 20 5 Q23 24 4 27 Q-15 29 -17 8Z"/></>;
      highlight = 'M-65 -35 L-45 -22'; break;
    case 'mask':
      art = <><path fill="none" d="M-70 -10 Q-92 -42 -91 -62 M-70 0 Q-94 15 -89 42 M71 -10 Q95 -38 90 -63 M72 0 Q93 14 91 44"/><path fill={base(INK)} d="M-79 -29 Q-45 -52 0 -24 Q44 -53 78 -29 L68 20 Q37 48 0 9 Q-38 46 -70 21Z"/><path fill={PAPER} d="M-60 -10 Q-38 -27 -17 -6 Q-37 12 -59 4Z M17 -6 Q38 -27 60 -9 L58 5 Q37 13 17 -6Z"/></>;
      highlight = 'M-58 -30 Q-46 -34 -36 -31'; break;
    case 'pin':
      art = <><path fill={base(RED)} d="M0 89 Q-19 52 -46 17 Q-77 -30 -42 -65 Q0 -100 43 -64 Q78 -27 46 18Z"/><path fill={PAPER} d="M-23 -27 Q-25 -53 1 -53 Q28 -52 26 -26 Q24 -3 0 -3 Q-24 -3 -23 -27Z"/></>;
      highlight = 'M-42 -35 Q-41 -50 -30 -58'; break;
    case 'ship':
      art = <><path fill={PAPER} d="M-62 5 L-56 -24 L58 -22 L68 7Z"/><path fill={ORANGE} d="M-37 -23 L-39 -65 L-13 -65 L-10 -23Z M15 -23 L14 -61 L40 -62 L44 -21Z"/><path fill={INK} d="M-39 -65 L-13 -65 L-12 -52 L-38 -51Z M14 -61 L40 -62 L41 -49 L14 -48Z"/><path fill={base(DOODLE.grey)} d="M-89 4 Q-6 13 88 1 L64 54 Q-5 67 -69 50Z"/>{[-51,-26,0,26,52].map(x=><circle key={x} cx={x} cy={29} r={6} fill={PAPER}/>)}<path fill="none" d="M-90 70 Q-67 61 -43 70 T5 70 T53 70 T89 68"/></>;
      highlight = 'M-67 17 L-45 19'; break;
    case 'newspaper':
      art = <><path fill={base(DOODLE.cream)} d="M-70 -81 L70 -76 L65 61 Q82 79 61 82 L-69 78 Q-79 77 -75 55Z"/><path fill={INK} d="M-56 -63 L53 -59 L52 -43 L-57 -46Z"/><path fill="none" d="M-55 -28 L48 -25 M-56 -13 L49 -10 M-2 9 L48 11 M-2 25 L47 27 M-55 49 L47 51 M-55 63 L45 65 M65 61 L48 61 Q47 78 61 82"/><path fill={DOODLE.blue} d="M-56 4 L-19 6 L-21 35 L-55 33Z"/></>;
      highlight = 'M-65 -69 L-65 -49'; break;
    case 'factory':
      art = <><path fill={DOODLE.grey} d="M39 -69 Q16 -73 28 -88 Q37 -99 51 -89 Q71 -98 78 -82 Q93 -68 74 -60 Q56 -53 39 -69Z"/><path fill={base(DOODLE.brown)} d="M-82 76 L-82 -12 L-35 -40 L-34 -11 L12 -39 L14 -9 L36 -9 L36 -57 L59 -58 L63 1 L80 1 L81 77Z"/>{[-61,-12,38].map((x,i)=><path key={x} fill={DOODLE.cream} d={`M${x} ${WIN_TOP} l${WIN_W} ${i - WIN_DRIFT} l${-WIN_DRIFT} ${WIN_H} l${-WIN_W + WIN_DRIFT} ${-WIN_WOBBLE}Z`}/>)}</>;
      highlight = 'M-68 9 L-52 0'; break;
    case 'badge':
      art = <><path fill={base(DOODLE.yellow)} d="M0 -87 L23 -46 L69 -51 L53 -7 L87 24 L42 39 L33 84 L-2 57 L-39 83 L-43 37 L-87 20 L-52 -9 L-67 -53 L-23 -46Z"/><circle r={32} fill={DOODLE.cream}/><path fill="none" d="M-17 -8 L17 -9 M-15 10 L15 9"/></>;
      highlight = 'M-19 -40 L-8 -58'; break;
    case 'clock':
      art = <><path fill={INK} d="M-78 -3 Q-80 -81 0 -82 Q80 -80 80 0 Q81 81 0 82 Q-80 79 -78 -3Z"/><path fill={base(DOODLE.cream)} d="M-65 0 Q-67 -67 0 -68 Q68 -66 67 0 Q68 67 0 68 Q-66 66 -65 0Z"/><path fill="none" d="M0 -53 l1 12 M53 0 l-12 1 M0 53 l-1 -12 M-53 0 l12 -1 M-24 -27 L0 0 L32 -13"/><circle r={5} fill={INK}/></>;
      highlight = 'M-47 -31 Q-42 -43 -31 -48'; break;
    case 'scrap':
      art = <>{['M-86 53 L-55 -16 L-39 -10 L-53 22 L-20 37 L-27 53 L-65 37 L-72 60Z','M-34 67 L-4 -58 L14 -54 L-9 64Z','M-65 -48 L-57 -66 L63 -7 L56 9Z','M18 73 L41 13 L58 16 L44 57 L83 59 L81 77Z','M-74 8 L-73 -10 L71 -27 L75 -8Z'].map(d=><path key={d} d={d} fill={base(DOODLE.grey)}/>)}{[[-61,-53],[-9,-39],[49,-15],[-52,0],[55,66],[-24,40]].map(([x,y])=><circle key={`${x},${y}`} cx={x} cy={y} r={4} fill={PAPER}/>)}</>;
      highlight = 'M-48 -52 L-29 -42'; break;
    case 'key':
      art = <><path fill={base(DOODLE.yellow)} fillRule="evenodd" d="M-29 -53 Q-65 -89 -84 -52 Q-99 -20 -64 -6 Q-46 0 -30 -15 L45 60 L65 41 L77 53 L90 39 L76 25 L64 37 L-17 -41 Q-16 -46 -29 -53Z M-43 -47 Q-60 -63 -68 -46 Q-76 -30 -59 -23 Q-41 -20 -43 -47Z"/></>;
      highlight = 'M-77 -44 Q-74 -57 -62 -59'; break;
    case 'suitcase':
      art = <><path fill="none" d="M-25 -47 L-24 -69 Q0 -77 25 -68 L26 -46"/><path fill={base(DOODLE.brown)} d="M-81 -45 Q0 -51 82 -43 L85 69 Q4 76 -83 67Z"/><path fill={DOODLE.yellow} d="M-49 -47 L-32 -48 L-31 70 L-49 69Z M34 -47 L51 -46 L53 70 L35 72Z"/><path fill={DOODLE.cream} d="M-20 1 L19 -8 L26 26 L-13 36Z"/><path fill="none" d="M-11 13 L13 7 M-8 23 L16 17"/></>;
      highlight = 'M-69 -30 L-57 -31'; break;
    case 'handcuffs':
      art = <><path fill={base(DOODLE.grey)} fillRule="evenodd" d="M-88 -21 Q-83 -65 -45 -63 Q-6 -60 -8 -19 Q-9 22 -49 25 Q-89 23 -88 -21Z M-71 -20 Q-70 -45 -46 -45 Q-24 -44 -25 -19 Q-25 5 -49 7 Q-72 5 -71 -20Z M8 25 Q9 -17 48 -18 Q87 -18 88 24 Q87 66 47 68 Q8 67 8 25Z M25 25 Q26 0 48 0 Q72 1 71 25 Q72 49 48 50 Q24 48 25 25Z"/><g fill="none"><ellipse cx={-20} cy={15} rx={15} ry={9} transform="rotate(34 -20 15)"/><ellipse cx={0} cy={22} rx={14} ry={9} transform="rotate(-25 0 22)"/><ellipse cx={20} cy={30} rx={15} ry={9} transform="rotate(34 20 30)"/></g><circle cx={-48} cy={16} r={3} fill={INK}/><circle cx={48} cy={59} r={3} fill={INK}/></>;
      highlight = 'M-76 -29 Q-72 -46 -60 -49'; break;
    case 'pen':
      art = <g transform="rotate(30)"><path fill={base(INK)} d="M-15 -84 Q0 -91 15 -83 L14 36 L-14 35Z"/><path fill={DOODLE.yellow} d="M-14 35 L14 36 L20 55 L0 88 L-20 55Z"/><path fill="none" d="M0 86 L0 54"/><circle cy={52} r={3} fill={INK}/><path stroke={DOODLE.grey} fill="none" d="M9 -73 L23 -69 L22 -24"/></g>;
      highlight = 'M24 -65 L14 -47'; break;
    case 'hotel':
      art = <><path fill={base(DOODLE.cream)} d="M-61 81 L-63 -69 L59 -72 L63 82Z"/><path fill="none" d="M7 -72 L7 -96"/><path fill={RED} d="M8 -95 L43 -88 L9 -79Z"/>{[-40,-9,22].flatMap((x,i)=>[-51,-22,7].map((y,j)=><path key={`${x},${y}`} fill={DOODLE.blue} d={`M${x} ${y} l${HOTEL_WIN_W} ${i % 2 + WIN_DRIFT} l${-WIN_DRIFT} ${HOTEL_WIN_H} l${-HOTEL_WIN_W + WIN_DRIFT} ${-WIN_DRIFT - j % 2}Z`}/>))}<path fill={INK} d="M-16 80 L-16 49 Q0 44 17 49 L18 81Z"/><path fill={RED} d="M-60 33 L60 32 L73 49 Q61 57 48 50 Q34 57 23 50 Q9 57 -4 50 Q-17 57 -30 50 Q-44 57 -57 50 Q-69 57 -74 49Z"/></>;
      highlight = 'M-53 -57 L-52 -38'; break;
    case 'crown':
      art = <><path fill={base(DOODLE.yellow)} d="M-77 -45 L-42 -8 L-35 -63 L-8 -24 L4 -81 L24 -24 L53 -61 L51 -6 L84 -41 L65 64 Q0 79 -63 64Z"/><path fill={base(DOODLE.yellow)} d="M-66 41 Q0 53 68 39 L65 64 Q0 79 -63 64Z"/>{[[-77,-47],[-35,-65],[4,-83],[53,-63],[84,-43]].map(([x,y])=><circle key={x} cx={x} cy={y} r={6} fill={base(DOODLE.yellow)}/>)}{[-38,0,38].map(x=><circle key={x} cx={x} cy={57} r={6} fill={RED}/>)}</>;
      highlight = 'M-55 14 L-49 28'; break;
    case 'face':
      art = <><path fill={base(DOODLE.skin)} d="M-59 -27 Q-79 -37 -79 -12 Q-78 10 -59 8Z"/><path fill={base(DOODLE.skin)} d="M59 -28 Q78 -36 80 -12 Q79 9 59 9Z"/><path fill={base(DOODLE.skin)} d="M-61 -37 Q-65 -79 -5 -81 Q58 -82 62 -38 Q65 6 51 46 Q37 79 2 80 Q-33 78 -49 48 Q-64 12 -61 -37Z"/><path fill="none" d="M-68 -17 Q-75 -23 -70 -3 M69 -18 Q76 -23 71 -2"/><path fill={base(DOODLE.brown)} d="M-62 -53 Q-66 -91 -21 -95 Q23 -98 49 -79 Q64 -68 62 -48 L53 -56 L47 -68 Q23 -62 8 -75 Q-14 -58 -48 -61 L-57 -49Z"/><path fill="none" d="M8 -75 Q15 -83 24 -86 M-38 -31 Q-25 -37 -14 -32 M15 -32 Q27 -36 38 -30"/><path fill={INK} d="M-29 -16 Q-29 -22 -24 -22 Q-19 -21 -19 -16 Q-19 -10 -24 -10 Q-29 -10 -29 -16Z"/><path fill={INK} d="M19 -15 Q19 -21 24 -21 Q29 -21 29 -15 Q29 -9 24 -9 Q19 -9 19 -15Z"/><path fill="none" d="M1 -9 L-5 15 Q-2 20 6 17 M-20 39 Q0 51 21 38"/></>;
      highlight = 'M-46 -46 Q-49 -39 -48 -31'; break;
    case 'man':
      art = <><path d="M-27 -80 Q-27 -99 0 -99 Q27 -99 27 -80 Z" fill={base(INK)}/><path d="M-42 -82 Q0 -80 42 -82 L42 -73 Q0 -72 -42 -73 Z" fill={INK}/><path d="M-30 -80 Q0 -84 30 -80 Q38 -66 38 -44 Q36 -16 20 -6 Q0 -2 -20 -6 Q-36 -16 -38 -44 Q-38 -66 -30 -80 Z" fill={base(DOODLE.skin)}/><path d="M-18 -50 Q-18 -52 -16 -52 Q-14 -52 -14 -50 Q-14 -48 -16 -48 Q-18 -48 -18 -50 Z M14 -50 Q14 -52 16 -52 Q18 -52 18 -50 Q18 -48 16 -48 Q14 -48 14 -50 Z" fill={INK}/><path d="M-10 -30 Q0 -24 10 -30" fill="none"/><path d="M-30 3.49 Q-46 4.86 -49 22 L-49 38.46 L-35 39.83 L-32 23.37 L-23 13.09 Z" fill={base(DOODLE.grey)}/><path d="M29 3.49 Q45 4.86 48 22 L49 39.14 L35 39.83 L32 23.37 L23 13.09 Z" fill={base(DOODLE.grey)}/><path d="M-49 37.77 L-35 38.46 Q-31 50.55 -42 50.55 Q-53 49.64 -49 37.77 Z" fill={base(DOODLE.skin)}/><path d="M35 38.46 L49 37.77 Q53 48.73 43 50.55 Q32 51.45 35 38.46 Z" fill={base(DOODLE.skin)}/><path d="M-29 2.11 Q0 -2 29 2.8 L34 45.31 Q1 50.55 -34 46 Z" fill={base(DOODLE.grey)}/><path d="M-15 1.43 L0 6.23 L15 1.43 L9 15.14 L-8 15.14 Z" fill={DOODLE.cream}/><path d="M-4 6.23 L4 6.23 L6 11.03 L2 13.77 L7 28.86 L0 33.66 L-7 28.86 L-3 13.77 L-6 11.03 Z" fill={DOODLE.brown}/><path d="M-18 3.49 L-23 14.46 L-12 17.89 L-19 22.69 L-3 35.71 M18 3.49 L23 14.46 L13 17.89 L20 22.69 L7 35.71 M1 37.77 L1 45.31" fill="none"/><path d="M-3 36.4 Q0 34.34 3 36.4 Q5 39.14 1 39.83 Q-3 39.83 -3 36.4 Z M-3 42.57 Q0 40.51 3 42.57 Q5 45.31 1 46 Q-3 46 -3 42.57 Z" fill={INK}/><path d="M-29 42.57 L-4 43.94 L-7 84.18 L-27 85.09 Q-30 66 -29 42.57 Z" fill={base(DOODLE.grey)}/><path d="M5 43.94 L29 43.26 Q31 64.18 27 85.09 L8 84.18 Z" fill={base(DOODLE.grey)}/><path d="M-28 80.55 L-8 81.45 L-7 93.27 Q-25 96 -37 92.36 Q-41 86 -28 80.55 Z" fill={INK}/><path d="M8 81.45 L27 80.55 Q42 86 38 93.27 L8 94.18 Z" fill={INK}/></>;
      highlight = 'M-16 -93 Q-10 -96 -4 -96'; break;
    case 'chair':
      art = <><path fill={base(DOODLE.brown)} d="M-43 1 L-31 0 L-33 69 L-43 70Z M39 -2 L50 -1 L56 68 L46 70Z"/><path fill={base(DOODLE.brown)} d="M-45 5 L-49 -87 Q-45 -93 -36 -91 L-31 5Z M32 2 L28 -89 Q34 -94 41 -90 L45 3Z"/><path fill={base(DOODLE.brown)} d="M-48 -88 Q-7 -97 40 -90 L41 -75 Q-3 -82 -47 -73Z M-46 -61 Q-6 -67 42 -61 L42 -50 Q-3 -55 -45 -49Z M-44 -35 Q-4 -40 43 -35 L44 -24 Q-1 -29 -43 -23Z"/><path fill={base(DOODLE.brown)} d="M-58 17 L-46 19 L-49 92 L-59 91Z M44 19 L57 16 L62 90 L51 92Z"/><path fill={base(DOODLE.brown)} d="M-53 59 Q-3 63 55 58 L56 66 Q1 71 -54 67Z"/><path fill={base(DOODLE.brown)} d="M-41 -5 Q0 -9 43 -5 L64 15 Q8 24 -64 18Z"/><path fill={INK} fillOpacity={0.25} d="M-64 18 Q5 24 64 15 L63 24 Q6 33 -63 27Z"/><path fill="none" d="M-32 4 Q-8 1 16 4 M-16 12 Q12 15 35 9"/></>;
      highlight = 'M-32 -85 Q-20 -88 -9 -87'; break;
    default: throw new Error(`Unknown icon name: ${name}`);
  }
  if (!Number.isFinite(size) || size <= 0) throw new Error(`Icon ${name}: size must be positive and finite`);
  return <g transform={`scale(${size / 200})`} stroke={INK} strokeWidth={LINE * 200 / size} strokeLinecap="round" strokeLinejoin="round">{art}<path d={highlight} fill="none" stroke={PAPER}/></g>;
};
