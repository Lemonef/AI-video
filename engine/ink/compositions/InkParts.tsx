import React from 'react';
import {AbsoluteFill, Audio, Img, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {Chip, Dust, INK, LINE, PAPER, Vignette, Watermark, useIn} from './InkProof';
import {Element} from '../parts/elements';
import type {Part, Shot} from '../parts/schema';
import p01 from '../parts/shots/p01.json';
import p02 from '../parts/shots/p02.json';
import p03 from '../parts/shots/p03.json';
import p04 from '../parts/shots/p04.json';
import p05 from '../parts/shots/p05.json';
import p06 from '../parts/shots/p06.json';
import p07 from '../parts/shots/p07.json';
import p08 from '../parts/shots/p08.json';
import p09 from '../parts/shots/p09.json';
import p10 from '../parts/shots/p10.json';
import p11 from '../parts/shots/p11.json';
import p12 from '../parts/shots/p12.json';
import p13 from '../parts/shots/p13.json';
import p14 from '../parts/shots/p14.json';
import p15 from '../parts/shots/p15.json';
import p16 from '../parts/shots/p16.json';
import p17 from '../parts/shots/p17.json';
import p18 from '../parts/shots/p18.json';
const part01 = p01 as unknown as Part;
const part02 = p02 as unknown as Part;
export const INK_FIRSTMIN_FRAMES = part02.f1;
// Every part built so far, in story order; append new parts here as they land.
const BUILT_PARTS = [p01, p02, p03, p04, p05, p06, p07, p08, p09, p10, p11, p12, p13, p14, p15, p16, p17, p18] as unknown as Part[];
export const INK_BUILT_FRAMES = BUILT_PARTS[BUILT_PARTS.length - 1].f1;
// Paper halo behind hand-lettered words on photo/plate backgrounds: a tight ring keeps glyph edges crisp,
// a wide soft glow lifts accent colours (orange on a warm sky or rust) off busy backgrounds. Cards need none.
const HALO_RING = 4, HALO_GLOW = 16; // px blur radii: tight ring, wide glow
const HALO = [...Array(3).fill(`0 0 ${HALO_RING}px ${PAPER}`), ...Array(3).fill(`0 0 ${HALO_GLOW}px ${PAPER}`)].join(',');
// Chromium paints text-shadow once per text paint pass, so with paint-order stroke-fill the fill pass's paper
// shadow lands ON the ink stroke and greys it out. Keylined words take the halo as a filter instead: it shadows
// the composited stroke+fill, so it stays behind both. Chained drop-shadows compound, so one ring + one glow.
const HALO_FILTER = `drop-shadow(0 0 ${HALO_RING}px ${PAPER}) drop-shadow(0 0 ${HALO_GLOW}px ${PAPER})`;
// Accent-coloured words (orange/red/green/teal) are mid-tones: a paper glow alone cannot separate them from a
// warm plate (orange on a sunset sky or rust). They get an ink keyline, the same INK outline the art gives every
// coloured fill (bag, flame). paint-order draws the stroke under the fill, so half the width shows: LINE*2/3 = 6px
// stroke ~ 3px rim, thinner than sprite lines (LINE) so letters stay hand-lettered, not bubble text.
const KEYLINE = {WebkitTextStroke: `${Math.round(LINE * 2 / 3)}px ${INK}`, paintOrder: 'stroke fill'} as const;
const Elements: React.FC<{shot: Shot}> = ({shot}) => <>{shot.els.map((el, i) => {
  const content = <Element el={el} shotF0={shot.f0} shotF1={shot.f1}/>;
  const onScene = !('card' in shot.bg);
  const accentWords = onScene && el.t === 'words' && 'color' in el && el.color !== undefined;
  if (['words', 'underline', 'stamp', 'tag', 'photo'].includes(el.t)) return <AbsoluteFill key={i} style={accentWords ? {...KEYLINE, filter: HALO_FILTER} : {textShadow: onScene && (el.t === 'words' || el.t === 'underline') ? HALO : undefined}}>{content}</AbsoluteFill>;
  return <svg key={i} width={1920} height={1080} style={{position: 'absolute', inset: 0}}>{content}</svg>;
})}</>;
const ShotPlayer: React.FC<{shot: Shot}> = ({shot}) => {
  const f = useCurrentFrame(); const bg = shot.bg; const len = shot.f1 - shot.f0;
  const chip = useIn((shot.chipAt ?? shot.f0) - shot.f0);
  let layer: React.ReactNode;
  if ('plate' in bg) {
    const z = interpolate(f, [0, Math.max(1, len - 1)], bg.zoom, {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    layer = <AbsoluteFill style={{transform: `scale(${z})`, transformOrigin: bg.origin ?? '50% 60%'}}><Img src={staticFile(bg.plate)} style={{width: '100%', height: '100%', objectFit: 'cover', position: 'absolute'}}/><Elements shot={shot}/><svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}><Dust/></svg></AbsoluteFill>;
  } else if ('photo' in bg) {
    const z = interpolate(f, [0, Math.max(1, len - 1)], bg.push, {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    layer = <><AbsoluteFill style={{transform: `scale(${z})`, transformOrigin: bg.origin ?? '50% 50%'}}><Img src={staticFile(bg.photo)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: bg.pos ?? '50% 50%', filter: 'sepia(0.35) contrast(1.08)'}}/></AbsoluteFill><Elements shot={shot}/></>;
  } else if ('card' in bg && bg.card === true) {
    layer = <AbsoluteFill style={{background: PAPER}}><Elements shot={shot}/></AbsoluteFill>;
  } else throw new Error(`Unknown background kind: ${Object.keys(bg).join(', ')}`);
  return <AbsoluteFill style={{overflow: 'hidden'}}>{layer}{!('card' in bg) && <Vignette/>}<Watermark/>{shot.chip && <AbsoluteFill style={{opacity: chip, transform: `translateX(${-100 * (1 - chip)}px)`}}><Chip text={shot.chip}/></AbsoluteFill>}</AbsoluteFill>;
};
export const InkParts: React.FC<{parts: Part[]}> = ({parts}) => <AbsoluteFill style={{background: PAPER}}>{parts.flatMap(part => part.shots.map(shot => <Sequence key={`${part.part}-${shot.f0}`} from={shot.f0} durationInFrames={shot.f1 - shot.f0}><ShotPlayer shot={shot}/></Sequence>))}</AbsoluteFill>;
export const InkFirstMin: React.FC = () => <><InkParts parts={[part01, part02]}/><Audio src={staticFile('ink60full/master.wav')}/></>;
export const InkBuilt: React.FC = () => <><InkParts parts={BUILT_PARTS}/><Audio src={staticFile('ink60full/master.wav')}/></>;
