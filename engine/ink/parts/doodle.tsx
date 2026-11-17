import React from 'react';
import {useCurrentFrame} from 'remotion';
import {FPS, LINE} from '../compositions/InkProof';

// Doodle feel (Zen 2026-11-17, brain docs/ink-card-patterns.md item 9): cards and diagrams must look drawn by
// hand, not CSS-perfect. Two tools:
// 1. BOIL: an SVG turbulence displacement re-seeded a few times a second, so every ruler-straight edge and
//    letter wobbles a little and "boils" like redrawn animation. Applied per element by InkParts.Elements;
//    real photos and painted sprites/plates are never boiled (they are already drawn / must stay sharp).
// 2. HAND_RADIUS: uneven corner radii so boxes are never perfect rounded rects.
export const BOIL_FPS = 10; // reference boil rate 8-12 fps; frames per seed = FPS / BOIL_FPS
const BOIL_STEP = Math.round(FPS / BOIL_FPS);
const BOIL_SEEDS = 3; // classic 3-drawing boil cycle
const BOIL_SCALE = LINE / 2; // displacement px: half a line weight, so edges wobble but stay one line
const BOIL_FREQ = 0.018; // noise cycles/px: one wobble every ~55 px along an edge, slow like a marker hand
const STAGE = {x: -100, y: -100, width: 2120, height: 1280}; // 1920x1080 stage + margin (Root.tsx size)
const boilId = (k: number) => `ink-boil-${k}`;

export const BoilDefs: React.FC = () => (
  <svg width={0} height={0} style={{position: 'absolute'}} aria-hidden>
    <defs>{Array.from({length: BOIL_SEEDS}, (_, k) => (
      <filter key={k} id={boilId(k)} filterUnits="userSpaceOnUse" {...STAGE}>
        <feTurbulence type="fractalNoise" baseFrequency={BOIL_FREQ} numOctaves={2} seed={k + 1} result="n"/>
        <feDisplacementMap in="SourceGraphic" in2="n" scale={BOIL_SCALE} xChannelSelector="R" yChannelSelector="G"/>
      </filter>
    ))}</defs>
  </svg>
);
export const useBoil = () => `url(#${boilId(Math.floor(useCurrentFrame() / BOIL_STEP) % BOIL_SEEDS)})`;

// Uneven radii (elliptical per corner), scaled from LINE so they track the stroke weight.
export const HAND_RADIUS = [2.2, 0.9, 2.6, 1.2].map(k => `${Math.round(LINE * k)}px`).join(' ') + ' / ' + [1.1, 2.4, 0.8, 1.9].map(k => `${Math.round(LINE * k)}px`).join(' ');

// Red hand circle: an ellipse drawn on in one stroke that overshoots its start (1.15 turns), slightly tilted,
// the way a marker circles a detail. Radius wobbles per angle so it is never a perfect ellipse.
const OVERSHOOT = 1.15, TILT = -6, STEPS = 64;
export const scribbleEllipse = (rx: number, ry: number) => {
  const pts = Array.from({length: Math.round(STEPS * OVERSHOOT) + 1}, (_, i) => {
    const a = (i / STEPS) * Math.PI * 2 - Math.PI * 0.6;
    const w = 1 + 0.05 * Math.sin(a * 3 + 1) + 0.04 * (i / STEPS); // lumpy + spirals out a touch on the overshoot
    return `${(Math.cos(a) * rx * w).toFixed(1)} ${(Math.sin(a) * ry * w).toFixed(1)}`;
  });
  return {d: `M${pts.join(' L')}`, tilt: TILT};
};

// HUD chip: top-left (default) or bottom-left; hand font, uneven border, slight tilt; boiled by the caller.
const CHIP_TILT = -1.5;
const CHIP_INSET = 40; // shared inset for top/bottom and left
export const DoodleChip: React.FC<{text: string; font: string; ink: string; paper: string; pos?: 'tl' | 'bl'}> = ({text, font, ink, paper, pos = 'tl'}) => {
  const style: React.CSSProperties = {
    position: 'absolute',
    left: CHIP_INSET + 8, // 48 = 40 + 8
    padding: '6px 26px',
    background: paper,
    border: `${LINE * 0.8}px solid ${ink}`,
    borderRadius: HAND_RADIUS,
    color: ink,
    fontFamily: font,
    fontWeight: 700,
    fontSize: 48,
    letterSpacing: 2,
    textTransform: 'uppercase',
    transform: `rotate(${CHIP_TILT}deg)`,
  };
  if (pos === 'bl') {
    style.top = undefined;
    style.bottom = CHIP_INSET;
  } else {
    style.top = CHIP_INSET;
    style.bottom = undefined;
  }
  return <div style={style}>{text}</div>;
};
