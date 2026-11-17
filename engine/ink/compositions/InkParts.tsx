import React from 'react';
import {AbsoluteFill, Audio, Easing, Img, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {Dust, FONT, INK, LINE, PAPER, Vignette, Watermark, useIn} from './InkProof';
import {BoilDefs, DoodleChip, useBoil} from '../parts/doodle';
import {Element} from '../parts/elements';
import type {Cam, Part, Shot} from '../parts/schema';
import v2p01 from '../parts/shots_v2/p01.json';
import v2p02 from '../parts/shots_v2/p02.json';
import v3p01 from '../parts/shots_v3/p01.json';
import v3p02 from '../parts/shots_v3/p02.json';
import v5p01 from '../parts/shots_v5/p01.json';
import v5p02 from '../parts/shots_v5/p02.json';
import v6p01 from '../parts/shots_v6/p01.json';
import v6p02 from '../parts/shots_v6/p02.json';
import v8p01 from '../parts/shots_v8/p01.json';
import v8p02 from '../parts/shots_v8/p02.json';
import v10p03 from '../parts/shots_v10/p03.json';
import v10p04 from '../parts/shots_v10/p04.json';
import v10p05 from '../parts/shots_v10/p05.json';
import v10p06 from '../parts/shots_v10/p06.json';
import v10p07 from '../parts/shots_v10/p07.json';
import v10p08 from '../parts/shots_v10/p08.json';
import v10p09 from '../parts/shots_v10/p09.json';
import v10p10 from '../parts/shots_v10/p10.json';
import v10p11 from '../parts/shots_v10/p11.json';
import v10p12 from '../parts/shots_v10/p12.json';
import v10p13 from '../parts/shots_v10/p13.json';
import v10p14 from '../parts/shots_v10/p14.json';
import v10p15 from '../parts/shots_v10/p15.json';
import v10p16 from '../parts/shots_v10/p16.json';
import v10p17 from '../parts/shots_v10/p17.json';
import v10p18 from '../parts/shots_v10/p18.json';
import v10p19 from '../parts/shots_v10/p19.json';
import v10p20 from '../parts/shots_v10/p20.json';
import v10p21 from '../parts/shots_v10/p21.json';
import v10p22 from '../parts/shots_v10/p22.json';
import v10p23 from '../parts/shots_v10/p23.json';
import v10p24 from '../parts/shots_v10/p24.json';
import v11bp03 from '../parts/shots_v11b/p03.json';
import v11bp04 from '../parts/shots_v11b/p04.json';
import v11bp05 from '../parts/shots_v11b/p05.json';
import v11bp06 from '../parts/shots_v11b/p06.json';
import v11bp07 from '../parts/shots_v11b/p07.json';
import v11bp08 from '../parts/shots_v11b/p08.json';
import v11bp09 from '../parts/shots_v11b/p09.json';
import v11bp10 from '../parts/shots_v11b/p10.json';
import v11bp11 from '../parts/shots_v11b/p11.json';
import v11bp12 from '../parts/shots_v11b/p12.json';
import v11bp13 from '../parts/shots_v11b/p13.json';
import v11bp14 from '../parts/shots_v11b/p14.json';
import v11bp15 from '../parts/shots_v11b/p15.json';
import v11bp16 from '../parts/shots_v11b/p16.json';
import v11bp17 from '../parts/shots_v11b/p17.json';
import v11bp18 from '../parts/shots_v11b/p18.json';
import v11bp19 from '../parts/shots_v11b/p19.json';
import v11bp20 from '../parts/shots_v11b/p20.json';
import v11bp21 from '../parts/shots_v11b/p21.json';
import v11bp22 from '../parts/shots_v11b/p22.json';
import v11bp23 from '../parts/shots_v11b/p23.json';
import v11bp24 from '../parts/shots_v11b/p24.json';
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
import p19 from '../parts/shots/p19.json';
import p20 from '../parts/shots/p20.json';
import p21 from '../parts/shots/p21.json';
import p22 from '../parts/shots/p22.json';
import p23 from '../parts/shots/p23.json';
import p24 from '../parts/shots/p24.json';
const part01 = p01 as unknown as Part;
const part02 = p02 as unknown as Part;
export const INK_FIRSTMIN_FRAMES = part02.f1;
// Every part built so far, in story order; append new parts here as they land.
const BUILT_PARTS = [p01, p02, p03, p04, p05, p06, p07, p08, p09, p10, p11, p12, p13, p14, p15, p16, p17, p18, p19, p20, p21, p22, p23, p24] as unknown as Part[];
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
// Never boiled: real photos must stay sharp, painted sprites/towers already carry their own hand line.
const NO_BOIL = ['photo', 'sprite', 'tower', 'chimney'];
const Elements: React.FC<{shot: Shot}> = ({shot}) => {
  const boil = useBoil();
  return <>{shot.els.map((el, i) => {
    const content = <Element el={el} shotF0={shot.f0} shotF1={shot.f1}/>;
    const onScene = !('card' in shot.bg);
    const accentWords = onScene && el.t === 'words' && 'color' in el && el.color !== undefined;
    const b = NO_BOIL.includes(el.t) ? undefined : boil;
    if (['words', 'underline', 'stamp', 'tag', 'photo'].includes(el.t)) return <AbsoluteFill key={i} style={accentWords ? {...KEYLINE, filter: [b, HALO_FILTER].filter(Boolean).join(' ')} : {filter: b, textShadow: onScene && (el.t === 'words' || el.t === 'underline') ? HALO : undefined}}>{content}</AbsoluteFill>;
    return <svg key={i} width={1920} height={1080} style={{position: 'absolute', inset: 0}}><g filter={b}>{content}</g></svg>;
  })}</>;
};
const BoiledChip: React.FC<{text: string; pos?: 'tl' | 'bl'}> = ({text, pos}) => <AbsoluteFill style={{filter: useBoil()}}><DoodleChip text={text} font={FONT} ink={INK} paper={PAPER} pos={pos}/></AbsoluteFill>;
const STAGE_W = 1920, STAGE_H = 1080; // composition size (Root.tsx); the camera frames this stage
// Holds the eased focus point at frame centre at the eased scale; translate is clamped to [stage*(1-s), 0]
// so a zoomed stage never exposes its edge.
const Camera: React.FC<{cam: Cam; len: number; children: React.ReactNode}> = ({cam, len, children}) => {
  const f = useCurrentFrame();
  const t = interpolate(f, [0, Math.max(1, (len - 1) * (cam.span ?? 1))], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic)});
  const [s, fx, fy] = cam.from.map((a, i) => a + (cam.to[i] - a) * t);
  const tx = Math.min(0, Math.max(STAGE_W * (1 - s), STAGE_W / 2 - s * fx));
  const ty = Math.min(0, Math.max(STAGE_H * (1 - s), STAGE_H / 2 - s * fy));
  return <AbsoluteFill style={{transform: `translate(${tx}px, ${ty}px) scale(${s})`, transformOrigin: '0 0'}}>{children}</AbsoluteFill>;
};
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
  if (shot.cam) layer = <Camera cam={shot.cam} len={len}>{layer}</Camera>;
  return <AbsoluteFill style={{overflow: 'hidden'}}>{layer}{!('card' in bg) && <Vignette/>}<Watermark/>{shot.chip && <AbsoluteFill style={{opacity: chip, transform: `translateX(${-100 * (1 - chip)}px)`}}><BoiledChip text={shot.chip} pos={shot.chipPos}/></AbsoluteFill>}</AbsoluteFill>;
};
export const InkParts: React.FC<{parts: Part[]}> = ({parts}) => <AbsoluteFill style={{background: PAPER}}><BoilDefs/>{parts.flatMap(part => part.shots.map(shot => <Sequence key={`${part.part}-${shot.f0}`} from={shot.f0} durationInFrames={shot.f1 - shot.f0}><ShotPlayer shot={shot}/></Sequence>))}</AbsoluteFill>;
// Episode mix Zen picked 2026-11-17 ("ok no sound"): voice + pad + sparse SFX, no music. Copy of .build/.../remix-v4sound/final_nomusic.wav.
const EPISODE_AUDIO = 'ink60full/master_v4nomusic.wav';
export const InkFirstMin: React.FC = () => <><InkParts parts={[part01, part02]}/><Audio src={staticFile('ink60full/master.wav')}/></>;
// v2 (Zen 2026-11-16): same parts + voice, plus a camera plan and fewer bare paper cards. v1 stays untouched.
const V2_PARTS = [v2p01, v2p02] as unknown as Part[];
export const INK_FIRSTMIN_V2_FRAMES = V2_PARTS[V2_PARTS.length - 1].f1;
export const InkFirstMinV2: React.FC = () => <><InkParts parts={V2_PARTS}/><Audio src={staticFile('ink60full/master.wav')}/></>;
// v3 (Zen 2026-11-16, option A): v1 + short cards merged so the first minute breathes; no camera plan.
const V3_PARTS = [v3p01, v3p02] as unknown as Part[];
export const INK_FIRSTMIN_V3_FRAMES = V3_PARTS[V3_PARTS.length - 1].f1;
export const InkFirstMinV3: React.FC = () => <><InkParts parts={V3_PARTS}/><Audio src={staticFile('ink60full/master.wav')}/></>;

// v5 (Zen 2026-11-17): v3 look + long shots split into new pictures (hard cuts, no camera) for >=26 cuts in minute one; made by tools/ink/make_v5_shots.py.
const V5_PARTS = [v5p01, v5p02] as unknown as Part[];
export const INK_FIRSTMIN_V5_FRAMES = V5_PARTS[V5_PARTS.length - 1].f1;
export const InkFirstMinV5: React.FC = () => <><InkParts parts={V5_PARTS}/><Audio src={staticFile(EPISODE_AUDIO)}/></>;
const V6_PARTS = [v6p01, v6p02] as unknown as Part[];
export const INK_FIRSTMIN_V6_FRAMES = V6_PARTS[V6_PARTS.length - 1].f1;
export const InkFirstMinV6: React.FC = () => <><InkParts parts={V6_PARTS}/><Audio src={staticFile(EPISODE_AUDIO)}/></>;
export const InkBuilt: React.FC = () => <><InkParts parts={BUILT_PARTS}/><Audio src={staticFile('ink60full/master.wav')}/></>;
// Full episode: v8 opening = v4 shots + 1888 photo split only (Zen 2026-11-17: splits made v5-v7 worse).
// v10: p01-p02 = v8 opening; p03-p24 = per-quarter balanced rebuild (tools/ink/make_v10_shots.py).
const EP01_FULL_PARTS = [v8p01, v8p02, v10p03, v10p04, v10p05, v10p06, v10p07, v10p08, v10p09, v10p10, v10p11, v10p12, v10p13, v10p14, v10p15, v10p16, v10p17, v10p18, v10p19, v10p20, v10p21, v10p22, v10p23, v10p24] as unknown as Part[];
export const INK_EP01_FULL_FRAMES = EP01_FULL_PARTS[EP01_FULL_PARTS.length - 1].f1;
export const InkEp01Full: React.FC = () => <><InkParts parts={EP01_FULL_PARTS}/><Audio src={staticFile(EPISODE_AUDIO)}/></>;
// v11B: v10.2 timing kept frame-for-frame; card layouts from card library 1 (tools/ink/make_v11b_shots.py).
const EP01_V11B_PARTS = [v8p01, v8p02, v11bp03, v11bp04, v11bp05, v11bp06, v11bp07, v11bp08, v11bp09, v11bp10, v11bp11, v11bp12, v11bp13, v11bp14, v11bp15, v11bp16, v11bp17, v11bp18, v11bp19, v11bp20, v11bp21, v11bp22, v11bp23, v11bp24] as unknown as Part[];
export const INK_EP01_V11B_FRAMES = EP01_V11B_PARTS[EP01_V11B_PARTS.length - 1].f1;
export const InkEp01V11B: React.FC = () => <><InkParts parts={EP01_V11B_PARTS}/><Audio src={staticFile(EPISODE_AUDIO)}/></>;
