import React from 'react';
import {AbsoluteFill, Audio, Img, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {Chip, Dust, PAPER, Vignette, Watermark, useIn} from './InkProof';
import {Element} from '../parts/elements';
import type {Part, Shot} from '../parts/schema';
import p01 from '../parts/shots/p01.json';
import p02 from '../parts/shots/p02.json';
import p03 from '../parts/shots/p03.json';
import p04 from '../parts/shots/p04.json';
import p05 from '../parts/shots/p05.json';
const part01 = p01 as unknown as Part;
const part02 = p02 as unknown as Part;
export const INK_FIRSTMIN_FRAMES = part02.f1;
// Every part built so far, in story order; append new parts here as they land.
const BUILT_PARTS = [p01, p02, p03, p04, p05] as unknown as Part[];
export const INK_BUILT_FRAMES = BUILT_PARTS[BUILT_PARTS.length - 1].f1;
// Paper halo behind hand-lettered words on photo/plate backgrounds: a tight ring keeps glyph edges crisp,
// a wide soft glow lifts accent colours (orange on a warm sky or rust) off busy backgrounds. Cards need none.
const HALO = [...Array(3).fill(`0 0 4px ${PAPER}`), ...Array(3).fill(`0 0 16px ${PAPER}`)].join(',');
const Elements: React.FC<{shot: Shot}> = ({shot}) => <>{shot.els.map((el, i) => {
  const content = <Element el={el} shotF0={shot.f0} shotF1={shot.f1}/>;
  if (['words', 'underline', 'stamp', 'tag', 'photo'].includes(el.t)) return <AbsoluteFill key={i} style={{textShadow: !('card' in shot.bg) && (el.t === 'words' || el.t === 'underline') ? HALO : undefined}}>{content}</AbsoluteFill>;
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
