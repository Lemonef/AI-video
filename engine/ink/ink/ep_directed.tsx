import React from 'react';
import {AbsoluteFill, Audio, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import type {CalculateMetadataFunction} from 'remotion';
import {Sprite, TitleCard, CompareCard, LabelCard, Dust, Vignette, Chip, CaptionPill, Watermark, INK, PAPER, ORANGE, LINE, FONT} from '../compositions/InkProof';
import {PROPS} from './props';
import type {PropKind} from './props';
import {planEpisode, camAt, actorAt, shakeAt, easeInOut} from './directed_plan.mjs';
import timeline from '../../../videos/pastly-life/01-eiffel-ink/assets/ink60full/timeline_full.json';

// Directed full episode: public/ink60full/directed_full.json (docs/directed-spec.md, merged per act by
// tools/merge_directed.py) against timeline_full.json. Every cut comes from the timeline; every shot's
// look (plate, pose, camera, motion, props, fx) comes from the director's file. Plates/sprites are checked live
// in calculateMetadata, so a missing PNG renders a labelled placeholder instead of crashing the render.

// Same framing constants as ep1.tsx / ep_full.tsx (feet line on the open foreground of the plates, H = figure height).
const FEET = 900;
const H = 640;
// Plate lookup order: the proof plates first, then the full-episode plates (new places land there).
const PLATE_DIRS = ['ink60/plates', 'ink60full/plates'];
const CAST_DIR = 'ink60/cast';
export const DIRECTED_DEFAULT = 'ink60full/directed_full.json';

const POP_DAMPING = 11; // springy but settles inside ~20 frames
const DROP_DAMPING = 9; // lands with one small bounce
const SLIDE_UP_FRAMES = 14;
const FLASH_FRAMES = 8;
const FLASH_PEAK = 0.85;
const ENTER_DUR_DEFAULT = 18; // mirrors directed_plan.mjs actorAt default
const TITLE_ICONS = new Set(['tower', 'flame', 'coin']);

// ---------- data shapes (docs/directed-spec.md) ----------
type Travel = {how?: 'walk' | 'slide' | 'pop' | 'none'; from?: number; at?: number; dur?: number};
type Actor = {sprite: string; fallback_sprite?: string; x: number; y?: number; h?: number; flip?: boolean; enter?: Travel; move?: {to: number; at?: number; dur?: number}; bob?: number};
type PropSpec = {kind: PropKind; x: number; y: number; k?: number; at?: number; anim?: 'pop' | 'slide_up' | 'drop' | 'none'};
type SceneShot = {k: 'scene'; w?: number; plate: string; fallback_plate?: string; cam?: {move?: string; amt?: number}; actors?: Actor[]; props?: PropSpec[]; fx?: string[]; chip?: string | null; caption?: string | null; why?: string};
type Shot =
  | SceneShot
  | {k: 'title'; lines: string[]; accent?: string | null; icon?: string | null; w?: number}
  | {k: 'compare'; head: string; left: string; right: string; w?: number}
  | {k: 'label'; title: string; a: string; b: string; w?: number}
  | {k: 'missing'};
type Planned = {beat: string; i: number; start: number; dur: number; shot: Shot};
type Resolved = {shots: Planned[]; plates: Record<string, string | null>; sprites: Record<string, string | null>; error: string | null};
export type InkDirectedProps = {directed: string; resolved: Resolved | null};

export const INKDIRECTED_FRAMES: number = timeline.totalFrames;

// ---------- build-time resolve (runs once per render/still, before any frame) ----------
const exists = async (path: string) => {
  try {
    const r = await fetch(staticFile(path), {method: 'HEAD'});
    return r.ok;
  } catch {
    return false;
  }
};

export const calcInkDirected: CalculateMetadataFunction<InkDirectedProps> = async ({props}) => {
  let data: Record<string, unknown>;
  try {
    const r = await fetch(staticFile(props.directed));
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    data = await r.json();
  } catch (e) {
    const error = `${props.directed} not loadable (${(e as Error).message})`;
    return {durationInFrames: INKDIRECTED_FRAMES, props: {...props, resolved: {shots: [], plates: {}, sprites: {}, error}}};
  }
  // merged file = {shots: {beat: [...]}, needed_*}; fixture/act files are the flat beat map
  const beatMap = (data.shots && typeof data.shots === 'object' && !Array.isArray(data.shots) ? data.shots : data) as Record<string, unknown>;
  const plan = planEpisode(timeline, beatMap) as {shots: Planned[]; durationInFrames: number; unknown: string[]};
  if (plan.unknown.length) console.warn(`InkDirected: beats not in timeline, skipped: ${plan.unknown.join(', ')}`);
  const plateIds = new Set<string>();
  const spriteIds = new Set<string>();
  for (const p of plan.shots) {
    if (p.shot.k !== 'scene') continue;
    // fallbacks (existing assets standing in for a needed_* id) are resolved the same way
    for (const id of [p.shot.plate, p.shot.fallback_plate]) if (id) plateIds.add(id);
    for (const a of p.shot.actors ?? []) for (const id of [a.sprite, a.fallback_sprite]) if (id) spriteIds.add(id);
  }
  const plates: Record<string, string | null> = {};
  for (const id of plateIds) {
    plates[id] = null;
    for (const dir of PLATE_DIRS) {
      if (await exists(`${dir}/${id}.png`)) {
        plates[id] = `${dir}/${id}.png`;
        break;
      }
    }
  }
  const sprites: Record<string, string | null> = {};
  for (const id of spriteIds) sprites[id] = (await exists(`${CAST_DIR}/${id}.png`)) ? `${CAST_DIR}/${id}.png` : null;
  const error = plan.shots.length ? null : `${props.directed} has no beat that is in timeline_full.json`;
  return {durationInFrames: Math.max(1, plan.durationInFrames || INKDIRECTED_FRAMES), props: {...props, resolved: {shots: plan.shots, plates, sprites, error}}};
};

// ---------- placeholders (missing data is visible, never a crash) ----------
const Tag: React.FC<{text: string; size?: number}> = ({text, size = 48}) => (
  <div style={{padding: '12px 30px', background: PAPER, border: `${LINE}px dashed ${ORANGE}`, borderRadius: 14, color: INK, fontFamily: FONT, fontWeight: 700, fontSize: size, textAlign: 'center'}}>{text}</div>
);

const MissingCard: React.FC<{text: string}> = ({text}) => (
  <AbsoluteFill style={{background: PAPER, alignItems: 'center', justifyContent: 'center'}}>
    <Tag text={text} size={64} />
  </AbsoluteFill>
);

const MissingPlate: React.FC<{id: string}> = ({id}) => {
  const {width, height} = useVideoConfig();
  return (
    <AbsoluteFill style={{background: PAPER}}>
      <svg width={width} height={height} style={{position: 'absolute', inset: 0}}>
        <rect x={LINE} y={LINE} width={width - 2 * LINE} height={height - 2 * LINE} fill="none" stroke={ORANGE} strokeWidth={LINE} strokeDasharray="40 24" />
        <path d={`M0 ${FEET} L${width} ${FEET}`} stroke={INK} strokeWidth={LINE / 2} opacity={0.35} />
      </svg>
      <div style={{position: 'absolute', top: height * 0.4, width: '100%', display: 'flex', justifyContent: 'center'}}>
        <Tag text={`PLATE MISSING: ${id}`} />
      </div>
    </AbsoluteFill>
  );
};

const MissingSprite: React.FC<{id: string; x: number; y: number; h: number}> = ({id, x, y, h}) => {
  const w = h * 0.4;
  return (
    <g>
      <rect x={x - w / 2} y={y - h} width={w} height={h} rx={20} fill={PAPER} fillOpacity={0.7} stroke={ORANGE} strokeWidth={LINE} strokeDasharray="30 18" />
      <text x={x} y={y - h / 2} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={36} fill={INK}>{`SPRITE? ${id}`}</text>
    </g>
  );
};

// ---------- scene pieces ----------
// Small corner chip naming assets drawn with a fallback, so a stand-in is never mistaken for the final look.
// Top-right so it never sits on the place/date Chip (top-left).
const MissingChip: React.FC<{ids: string[]}> = ({ids}) => (
  <div style={{position: 'absolute', right: 40, top: 40, maxWidth: 760, padding: '6px 18px', background: PAPER, border: `${LINE / 2}px dashed ${ORANGE}`, borderRadius: 10, color: INK, fontFamily: FONT, fontWeight: 700, fontSize: 28}}>
    {`MISSING: ${ids.join(', ')}`}
  </div>
);

// requested asset -> its PNG, else the fallback's PNG (flagged), else null (labelled placeholder)
const pick = (table: Record<string, string | null>, id: string, fallback?: string) => {
  if (table[id]) return {src: table[id], usedFallback: false};
  if (fallback && table[fallback]) return {src: table[fallback], usedFallback: true};
  return {src: null, usedFallback: false};
};

const ActorView: React.FC<{a: Actor; src: string | null}> = ({a, src}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const st = actorAt({...a, enter: a.enter && {...a.enter, dur: a.enter.dur ?? ENTER_DUR_DEFAULT}}, f);
  if (!st.visible) return null;
  const y = a.y ?? FEET;
  const h = a.h ?? H;
  const p = st.popAt === null ? 1 : spring({frame: f - st.popAt, fps, config: {damping: POP_DAMPING}});
  return (
    // pop scales about the feet so the figure grows out of the floor
    <g transform={`translate(${st.x} ${y}) scale(${p}) translate(${-st.x} ${-y})`}>
      {src ? <Sprite src={src} x={st.x} y={y + st.lift} h={h} flip={a.flip} bob={a.bob ?? 0} /> : <MissingSprite id={a.sprite} x={st.x} y={y} h={h} />}
    </g>
  );
};

const PropView: React.FC<{p: PropSpec}> = ({p}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const def = PROPS[p.kind];
  if (!def) return <text x={p.x} y={p.y} fontFamily={FONT} fontSize={40} fill={ORANGE}>{`PROP? ${p.kind}`}</text>;
  const at = p.at ?? 0;
  const anim = p.anim ?? 'pop';
  if (anim !== 'none' && f < at) return null;
  const k = p.k ?? 1;
  let s = 1;
  let dy = 0;
  let op = 1;
  if (anim === 'pop') s = spring({frame: f - at, fps, config: {damping: POP_DAMPING}});
  // drop starts fully above the frame top (distance derived from where the prop rests and its height)
  if (anim === 'drop') dy = -(1 - spring({frame: f - at, fps, config: {damping: DROP_DAMPING}})) * (p.y + def.h * k);
  if (anim === 'slide_up') {
    const t = easeInOut((f - at) / SLIDE_UP_FRAMES);
    dy = (1 - t) * def.h * k * 0.5;
    op = t;
  }
  const {C, w, h} = def;
  return (
    <g opacity={op} transform={`translate(${p.x} ${p.y + dy}) scale(${k}) translate(${w / 2} ${h / 2}) scale(${s}) translate(${-w / 2} ${-h / 2})`}>
      <C x={0} y={0} />
    </g>
  );
};

const DirectedScene: React.FC<{shot: SceneShot; len: number; plates: Record<string, string | null>; sprites: Record<string, string | null>}> = ({shot, len, plates, sprites}) => {
  const f = useCurrentFrame();
  const pl = pick(plates, shot.plate, shot.fallback_plate);
  const plate = pl.src;
  const cast = (shot.actors ?? []).map((a) => ({a, ...pick(sprites, a.sprite, a.fallback_sprite)}));
  const stand = [...(pl.usedFallback ? [shot.plate] : []), ...cast.filter((c) => c.usedFallback).map((c) => c.a.sprite)];
  const {width, height} = useVideoConfig();
  const fx = new Set(shot.fx ?? []);
  const cam = camAt(shot.cam, f, len, width);
  const sh = fx.has('shake') ? shakeAt(f) : {x: 0, y: 0};
  const flash = fx.has('flash') ? interpolate(f, [0, FLASH_FRAMES], [FLASH_PEAK, 0], {extrapolateRight: 'clamp'}) : 0;
  return (
    <AbsoluteFill style={{overflow: 'hidden', background: PAPER}}>
      {/* camera layer: plate + props + actors move together; HUD below stays locked to the frame */}
      <AbsoluteFill style={{transform: `translate(${cam.tx + sh.x}px, ${cam.ty + sh.y}px) scale(${cam.s})`, transformOrigin: '50% 60%'}}>
        {plate ? <Img src={staticFile(plate)} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover'}} /> : <MissingPlate id={shot.plate} />}
        <svg width={width} height={height} style={{position: 'absolute', inset: 0}}>
          {(shot.props ?? []).map((p, i) => <PropView key={`p${i}`} p={p} />)}
          {cast.map((c, i) => <ActorView key={`a${i}`} a={c.a} src={c.src} />)}
        </svg>
        {fx.has('dust') && (
          <svg width={width} height={height} style={{position: 'absolute', inset: 0}}>
            <Dust />
          </svg>
        )}
      </AbsoluteFill>
      <Vignette />
      {flash > 0 && <AbsoluteFill style={{background: '#fff', opacity: flash}} />}
      {shot.chip && <Chip text={shot.chip} />}
      {shot.caption && <CaptionPill text={shot.caption} />}
      {stand.length > 0 && <MissingChip ids={stand} />}
      <Watermark />
    </AbsoluteFill>
  );
};

const ShotView: React.FC<{p: Planned; r: Resolved}> = ({p, r}) => {
  const s = p.shot;
  switch (s?.k) {
    case 'scene': return <DirectedScene shot={s} len={p.dur} plates={r.plates} sprites={r.sprites} />;
    case 'title': return <TitleCard lines={s.lines} accent={s.accent ?? undefined} icon={s.icon && TITLE_ICONS.has(s.icon) ? (s.icon as 'tower' | 'flame' | 'coin') : undefined} />;
    case 'compare': return <CompareCard head={s.head} left={s.left} right={s.right} />;
    case 'label': return <LabelCard title={s.title} a={s.a} b={s.b} />;
    case 'missing': return <MissingCard text={`NO DIRECTED SHOT: ${p.beat}`} />;
    default: return <MissingCard text={`UNKNOWN SHOT KIND: ${p.beat}[${p.i}] ${String((s as {k?: unknown})?.k)}`} />;
  }
};

export const InkDirected: React.FC<InkDirectedProps> = ({resolved}) => (
  <AbsoluteFill style={{background: PAPER}}>
    {!resolved || resolved.error ? (
      <MissingCard text={resolved?.error ?? 'directed data not resolved (calculateMetadata did not run)'} />
    ) : (
      resolved.shots.map((p) => (
        <Sequence key={`${p.beat}-${p.i}`} from={p.start} durationInFrames={p.dur}>
          <ShotView p={p} r={resolved} />
        </Sequence>
      ))
    )}
    {/* master.wav lands in public/ink60full/ once ink_audio.py has run on beats_full.json */}
    {(timeline as {silent?: boolean}).silent ? null : <Audio src={staticFile('ink60full/master.wav')} />}
  </AbsoluteFill>
);

