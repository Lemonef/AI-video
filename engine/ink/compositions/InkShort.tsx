import React from 'react';
import {AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {fitText} from '@remotion/layout-utils';
import {FONT, INK, LINE, ORANGE, PAPER} from './InkProof';
import {EP01_V11B_PARTS, InkParts} from './InkParts';
import type {Part} from '../parts/schema';
import data from '../parts/shorts/ep01-s01.json';
import data2 from '../parts/shorts/ep01-s02.json';

// Canvas mirrors Root; source stage is the episode's native canvas.
const SHORT_W = 1080, SHORT_H = 1920;
const STAGE_W = 1920, STAGE_H = 1080;
const SCALE = SHORT_W / STAGE_W;
const SCENE_H = STAGE_H * SCALE;
// Shorts UI: search/menu, metadata/related link, and action column respectively.
const UI_TOP = 180, UI_BOTTOM = 480, UI_RIGHT = 140;
const SAFE_W = SHORT_W - 2 * UI_RIGHT;
const SAFE_H = SHORT_H - UI_BOTTOM - UI_TOP;
const SCENE_TOP = UI_TOP + (SAFE_H - SCENE_H) / 2;
const HEADER_H = SCENE_TOP - UI_TOP;
const CAPTION_TOP = SCENE_TOP + SCENE_H;
const CAPTION_H = SHORT_H - UI_BOTTOM - CAPTION_TOP;
const LINE_HEIGHT = 1.12; // Matches InkProof's hand-lettered Words line spacing.
const KEYLINE_W = Math.round(LINE * 2 / 3); // Same accent outline as InkParts.
const KEYLINE = {WebkitTextStroke: `${KEYLINE_W}px ${INK}`, paintOrder: 'stroke fill'} as const;
const TEXT_WEIGHT = 700; // Same hand-lettered weight as InkProof Words.
const END_FADE = 12; // 0.4 s at the composition's 30 fps.
const MUSIC_FADE = 30; // Last second of the end card.
const CAPTION_LINES = 2; // Caption band (CAPTION_H) holds two lines; one line made long groups tiny.

type TextLine = {text: string; color?: string};
type Word = {w: string; f0: number; f1: number};
export type ShortData = {
  id: string; fps: number; hook: TextLine[]; vo: string;
  music: {src: string; volume: number};
  clips: {beat: string; src0: number; len: number; dst0: number}[];
  captions: {beat: string; f0: number; f1: number; words: Word[]}[];
  endCard: {f0: number; f1: number; lines: TextLine[]}; totalFrames: number;
};

// Measured fit (canvas metrics of the real font, uppercase, same weight), minus both stroke edges.
const fitSize = (text: string, maxW: number) => fitText({
  text, withinWidth: maxW - KEYLINE_W * 2, fontFamily: FONT, fontWeight: TEXT_WEIGHT,
  textTransform: 'uppercase', validateFontIsLoaded: false,
}).fontSize;
// Largest uniform size at which `words` fit SAFE_W on at most `lines` lines (tries every split point).
// Greedy browser wrapping at this size then also needs at most `lines` lines (greedy minimises line count).
const bestSplitSize = (words: string[], lines: number): number => {
  const whole = fitSize(words.join(' '), SAFE_W);
  if (lines <= 1 || words.length <= 1) return whole;
  let best = whole;
  for (let i = 1; i < words.length; i++) {
    best = Math.max(best, Math.min(fitSize(words.slice(0, i).join(' '), SAFE_W), bestSplitSize(words.slice(i), lines - 1)));
  }
  return best;
};
const textStyle: React.CSSProperties = {
  fontFamily: FONT, fontWeight: TEXT_WEIGHT, lineHeight: LINE_HEIGHT,
  textAlign: 'center', whiteSpace: 'nowrap', textTransform: 'uppercase', color: INK,
};
const lineStyle = (line: TextLine): React.CSSProperties =>
  line.color === 'orange' ? {color: ORANGE, ...KEYLINE} : {color: INK};

export const InkShort: React.FC<{data: ShortData; parts: Part[]}> = ({data, parts}) => {
  const frame = useCurrentFrame();
  const inStory = frame < data.endCard.f0;
  const caption = data.captions.find(g => g.f0 <= frame && frame < g.f1);
  const hookSize = Math.min(
    ...data.hook.map(line => fitSize(line.text, SAFE_W)),
    (HEADER_H - KEYLINE_W * 2) / (data.hook.length * LINE_HEIGHT),
  );
  // One caption size for the whole Short so size never jumps between groups. Each group may wrap to
  // CAPTION_LINES lines: its size is its best split (largest size at which every line fits SAFE_W); the
  // tightest group decides. Capped by the band height and by the hook, which stays the headline.
  const captionSize = React.useMemo(() => Math.min(
    ...data.captions.map(g => bestSplitSize(g.words.map(w => w.w), CAPTION_LINES)),
    (CAPTION_H - KEYLINE_W * 2) / (CAPTION_LINES * LINE_HEIGHT),
    hookSize,
  ), [data, hookSize]);
  // Each end-card line fits independently, then the whole stack fits vertically.
  const endSizes = data.endCard.lines.map(line => fitSize(line.text, SAFE_W));
  const endHeight = endSizes.reduce((sum, size) => sum + size * LINE_HEIGHT, 0);
  const endScale = Math.min(1, (SAFE_H - KEYLINE_W * 2) / endHeight);
  return <AbsoluteFill style={{background: PAPER}}>
    {inStory && <>
      <div style={{position: 'absolute', top: SCENE_TOP, width: SHORT_W, height: SCENE_H, overflow: 'hidden'}}>
        <div style={{position: 'relative', width: STAGE_W, height: STAGE_H, transform: `scale(${SCALE})`, transformOrigin: '0 0'}}>
          {data.clips.map(clip => <Sequence key={clip.beat} from={clip.dst0} durationInFrames={clip.len} layout="none">
            <Sequence from={-clip.src0} layout="none"><InkParts parts={parts}/></Sequence>
          </Sequence>)}
        </div>
      </div>
      <div style={{...textStyle, position: 'absolute', left: UI_RIGHT, top: UI_TOP, width: SAFE_W, height: HEADER_H, display: 'flex', flexDirection: 'column', justifyContent: 'center', fontSize: hookSize}}>
        {data.hook.map((line, i) => <div key={i} style={lineStyle(line)}>{line.text}</div>)}
      </div>
      {caption && <div style={{...textStyle, position: 'absolute', left: UI_RIGHT, top: CAPTION_TOP, width: SAFE_W, height: CAPTION_H, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: captionSize}}>
        <div style={{whiteSpace: 'normal', textWrap: 'balance'}}>{caption.words.map((word, i) => <React.Fragment key={i}>{i > 0 && ' '}<span style={word.f0 <= frame && frame < word.f1 ? {color: ORANGE, ...KEYLINE} : undefined}>{word.w}</span></React.Fragment>)}</div>
      </div>}
    </>}
    {frame >= data.endCard.f0 && frame < data.endCard.f1 && <div style={{...textStyle, position: 'absolute', left: UI_RIGHT, top: UI_TOP, width: SAFE_W, height: SAFE_H, display: 'flex', flexDirection: 'column', justifyContent: 'center', opacity: interpolate(frame - data.endCard.f0, [0, END_FADE], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}}>
      {data.endCard.lines.map((line, i) => <div key={i} style={{...lineStyle(line), fontSize: endSizes[i] * endScale}}>{line.text}</div>)}
    </div>}
    {data.clips.map(clip => <Sequence key={clip.beat} from={clip.dst0} durationInFrames={clip.len}>
      <Audio src={staticFile(data.vo)} trimBefore={clip.src0} trimAfter={clip.src0 + clip.len}/>
    </Sequence>)}
    <Audio src={staticFile(data.music.src)} volume={f => data.music.volume * interpolate(f, [data.endCard.f1 - MUSIC_FADE, data.endCard.f1], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}/>
  </AbsoluteFill>;
};

export const INK_SHORT_EP01_S01_FRAMES = data.totalFrames;
export const InkShortEp01S01: React.FC = () => <InkShort data={data} parts={EP01_V11B_PARTS}/>;
export const INK_SHORT_EP01_S02_FRAMES = data2.totalFrames;
export const InkShortEp01S02: React.FC = () => <InkShort data={data2} parts={EP01_V11B_PARTS}/>;
