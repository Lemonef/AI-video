import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {FONT, INK, PAPER, ORANGE, GREEN, RED, LINE} from '../compositions/InkProof';
import {color, CrossElement} from './elements';
import {DoodleIcon} from './icons';
import {scribbleEllipse} from './doodle';
import type {IconEl, CountEl, SplitEl, HeroEl, CrossoutEl, ChecklistEl, QuoteEl, BignumEl} from './schema';
import {LABEL, SMALL, CHAR_WIDTH} from './layouts/tokens';
export {LABEL, SMALL, CHAR_WIDTH} from './layouts/tokens';

const W = 1920, H = 1080; // stage dimensions
const CX = W / 2, CY = H / 2; // card centre
const WEIGHT = 700; // hand lettering weight
const POP_FRAMES = 8; // total icon entrance
const POP_UP = 5; // eased rise frames
const POP_SETTLE = 3; // settle frames
const POP_START = 0.6, POP_PEAK = 1.08; // entrance scales
const ICON_FADE = 4; // icon opacity frames
const GLIDE = 14; // carry duration
const SMOOTHSTEP_A = 3, SMOOTHSTEP_B = 2; // smoothstep coefficients
const POP_EASE = 3; // pop rise exponent
const COUNT_EASE = 3; // bignum ease-out exponent
const LABEL_FADE = 6; // label opacity duration
const COUNT_MAX = 16, COUNT_ROW_MAX = 8; // count limits
const COUNT_SIZE = 220, COUNT_FILL = 0.8; // count icon cap and slot occupancy
const COUNT_LABEL_DELAY = 12; // label delay after last entry
const SPLIT_SIZE = 360, SPLIT_LEFT = 480, SPLIT_RIGHT = 1440, SPLIT_Y = 460; // split layout
const VS_RADIUS = 68, VS_BASELINE = 0.35; // versus circle and baseline
const DIVIDER_FRAMES = 10; // divider draw time
const DIVIDER_TOP = SPLIT_Y - SPLIT_SIZE / 2;
const DIVIDER_BOTTOM = 2 * CY - DIVIDER_TOP;
const DIVIDER_CTRL_Y = (DIVIDER_TOP + CY - VS_RADIUS) / 2; // Bezier control point y of the upper divider stroke
const DIVIDER_LOWER_CTRL_Y = 2 * CY - DIVIDER_CTRL_Y; // mirror of the upper control point about the card centre
const DIVIDER_BOW = 7; // divider drift
const VS_DRAW = 8, VS_FADE = 4; // versus draw and opacity durations
const BURST_COUNT = 8, BURST_DRAW = 8; // ray count and draw time
const BURST_DROP = 0.1;
const BURST_INNER = 0.64, BURST_OUTER = 0.75, BURST_START = 1 - BURST_DROP, BURST_SWEEP = 1 + 2 * BURST_DROP; // ray geometry, leaving the label sector clear
const CROSS_FRAMES = 10, CROSS_DIM = 0.45; // crossout duration and final opacity
const CROSS_NATIVE_END = 11; // mirrors the native draw length of CrossElement in elements.tsx; the two change together
const ROW_PITCH = LABEL * 1.6, BOX = LABEL * 0.8, TEXT_OFFSET = LABEL * 1.2; // checklist layout
const BOX_DRAW = 8, MARK_DELAY = 8, MARK_DRAW = 8; // checklist timing
const BOX_DRIFT = 2; // checklist corner wobble
const TEXT_BASELINE = 0.35; // checklist vertical alignment
const MARK_LEFT = 0.15, TICK_RUN = 0.25, TICK_DROP = 0.25, TICK_RISE = 0.55, TICK_REACH = 0.45; // tick geometry
const CROSS_MARK_INSET_X = 0.2, CROSS_MARK_INSET_Y = 0.25, CROSS_MARK_SPAN_X = 0.6, CROSS_MARK_SPAN_Y = 0.5; // checkbox X geometry
const QUOTE_HEIGHT = LABEL * 2, QUOTE_GAP = LABEL * 0.4; // quote mark dimensions
const QUOTE_HOOK_X = 0.3, QUOTE_HOOK_Y = 0.6, QUOTE_WIDTH = 0.45, QUOTE_PAIR = 0.55; // quote curves
const QUOTE_DRAW = 8, QUOTE_STEP = 8, QUOTE_DELAY = 6; // quote timing
const LINE_HEIGHT = LABEL * 1.2; // quote line spacing
const BIG_FONT = 260, BIG_FIT = 1680; // number font and maximum width
const BIG_FADE = 4, UNDERLINE_DRAW = 10; // number entrance and underline time
const UNDERLINE_Y = 0.18, UNDERLINE_BOW = 0.04, BIG_LABEL_GAP = 1.5; // number layout (gap below underline in label heights)
const HERO_LABEL_GAP = LABEL * 0.3; // clear space between icon base and label cap top
const HERO_CAP = LABEL * 0.7; // label cap height

type Props<T> = {el: T; shotF0: number; shotF1: number};
export const progress = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
export const delay = (el: {at?: number}, f0: number) => (el.at ?? f0) - f0;
export const smooth = (p: number) => p * p * (SMOOTHSTEP_A - SMOOTHSTEP_B * p);
export const pop = (f: number, at: number) => f < at + POP_UP
  ? POP_START + (POP_PEAK - POP_START) * (1 - Math.pow(1 - progress(f, at, at + POP_UP), POP_EASE))
  : POP_PEAK + (1 - POP_PEAK) * smooth(progress(f, at + POP_UP, at + POP_UP + POP_SETTLE));
export const Text: React.FC<{x: number; y: number; text: string; opacity?: number; size?: number; anchor?: 'start' | 'middle'; fill?: string}> = ({x, y, text, opacity = 1, size = LABEL, anchor = 'middle', fill = INK}) => <text x={x} y={y} opacity={opacity} fontFamily={FONT} fontWeight={WEIGHT} fontSize={size} textAnchor={anchor} fill={fill}>{text.toUpperCase()}</text>;
export const Draw: React.FC<{d: string; p: number; ink?: string}> = ({d, p, ink = INK}) => <path d={d} fill="none" stroke={ink} strokeWidth={LINE} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} opacity={p > 0 ? 1 : 0}/>;

export const IconElement: React.FC<Props<IconEl>> = ({el, shotF0}) => {
  const f = useCurrentFrame(), a = delay(el, shotF0);
  const p = smooth(progress(f, a, a + GLIDE));
  const x = el.from ? el.from[0] + (el.x - el.from[0]) * p : el.x;
  const y = el.from ? el.from[1] + (el.y - el.from[1]) * p : el.y;
  const size = el.from ? el.from[2] + (el.size - el.from[2]) * p : el.size;
  return <g transform={`translate(${x} ${y}) rotate(${el.rot ?? 0}) scale(${el.from ? 1 : pop(f, a)})`} opacity={el.from ? 1 : progress(f, a, a + ICON_FADE)}><DoodleIcon name={el.name} size={size} fill={el.color ? color(el.color) : undefined}/></g>;
};
export const CountElement: React.FC<Props<CountEl>> = ({el, shotF0, shotF1}) => {
  const f = useCurrentFrame();
  if (!Number.isInteger(el.n) || el.n < 1 || el.n > COUNT_MAX) throw new Error('count.n must be an integer in 1..16');
  if (!Number.isFinite(el.w) || el.w <= 0) throw new Error('count.w must be positive and finite');
  const rows = el.n <= COUNT_ROW_MAX ? 1 : 2, columns = Math.ceil(el.n / rows), pitch = el.w / columns;
  const size = Math.min(pitch * COUNT_FILL, COUNT_SIZE), vertical = size + LABEL;
  const bottom = el.y + (rows - 1) * vertical / 2 + size / 2;
  const labelAt = delay(el, shotF0) + (el.n - 1) * el.step + COUNT_LABEL_DELAY;
  return <g>{Array.from({length: el.n}, (_, i) => {
    const row = Math.floor(i / columns), count = row === 0 ? columns : el.n - columns;
    return <IconElement key={i} shotF0={shotF0} shotF1={shotF1} el={{t: 'icon', name: el.icon, x: el.x + (i % columns - (count - 1) / 2) * pitch, y: el.y + (row - (rows - 1) / 2) * vertical, size, color: el.color, at: el.at + i * el.step}}/>;
  })}{el.label && <Text x={el.x} y={bottom + LABEL} text={el.label} opacity={progress(f, labelAt, labelAt + LABEL_FADE)}/>}</g>;
};
export const SplitElement: React.FC<Props<SplitEl>> = ({el, shotF0, shotF1}) => {
  const f = useCurrentFrame(), a = delay(el, shotF0), vsAt = a + el.step + POP_FRAMES;
  const circle = scribbleEllipse(VS_RADIUS, VS_RADIUS);
  const divider = el.vs ? `M${CX} ${DIVIDER_TOP} Q${CX + DIVIDER_BOW} ${DIVIDER_CTRL_Y} ${CX} ${CY - VS_RADIUS} M${CX} ${CY + VS_RADIUS} Q${CX - DIVIDER_BOW} ${DIVIDER_LOWER_CTRL_Y} ${CX} ${DIVIDER_BOTTOM}` : `M${CX} ${DIVIDER_TOP} Q${CX + DIVIDER_BOW} ${CY} ${CX} ${DIVIDER_BOTTOM}`;
  return <g><Draw d={divider} p={progress(f, a, a + DIVIDER_FRAMES)}/>{[el.left, el.right].map((side, i) => {
    const x = i === 0 ? SPLIT_LEFT : SPLIT_RIGHT, labelAt = a + i * el.step + POP_FRAMES;
    return <g key={i}><IconElement shotF0={shotF0} shotF1={shotF1} el={{t: 'icon', name: side.icon, x, y: SPLIT_Y, size: SPLIT_SIZE, color: side.color, at: el.at + i * el.step}}/><Text x={x} y={SPLIT_Y + SPLIT_SIZE / 2 + LABEL} text={side.label} opacity={progress(f, labelAt, labelAt + LABEL_FADE)}/></g>;
  })}{el.vs && <g transform={`translate(${CX} ${CY})`}><Draw d={circle.d} p={progress(f, vsAt, vsAt + VS_DRAW)}/><g transform={`scale(${pop(f, vsAt)})`}><Text x={0} y={LABEL * VS_BASELINE} text={el.vs} opacity={progress(f, vsAt, vsAt + VS_FADE)}/></g></g>}</g>;
};
export const HeroElement: React.FC<Props<HeroEl>> = ({el, shotF0, shotF1}) => {
  const f = useCurrentFrame(), end = delay(el, shotF0) + (el.from ? GLIDE : POP_FRAMES);
  return <g><IconElement shotF0={shotF0} shotF1={shotF1} el={{...el, t: 'icon', name: el.icon}}/><Text x={el.x} y={el.y + el.size / 2 + HERO_LABEL_GAP + HERO_CAP} text={el.label} opacity={progress(f, end, end + LABEL_FADE)}/>{el.burst && Array.from({length: BURST_COUNT}, (_, i) => {
    const a = (BURST_START + i * BURST_SWEEP / (BURST_COUNT - 1)) * Math.PI;
    return <Draw key={i} ink={ORANGE} p={progress(f, end, end + BURST_DRAW)} d={`M${el.x + Math.cos(a) * el.size * BURST_INNER} ${el.y + Math.sin(a) * el.size * BURST_INNER} l${Math.cos(a) * el.size * (BURST_OUTER - BURST_INNER)} ${Math.sin(a) * el.size * (BURST_OUTER - BURST_INNER)}`}/>;
  })}</g>;
};
export const CrossoutElement: React.FC<Props<CrossoutEl>> = ({el, shotF0, shotF1}) => {
  const f = useCurrentFrame(), a = delay(el, shotF0), c = el.crossAt - shotF0;
  // Remap only the cross's local clock so the exact existing bowed strokes finish in ten frames.
  const crossClock = c + (f - c) * CROSS_NATIVE_END / CROSS_FRAMES;
  return <g><g opacity={1 - (1 - CROSS_DIM) * progress(f, c, c + CROSS_FRAMES)}><IconElement shotF0={shotF0} shotF1={shotF1} el={{...el, t: 'icon', name: el.icon}}/></g><g fill="none" strokeLinejoin="round"><CrossElement shotF0={shotF0} shotF1={shotF1} el={{t: 'cross', x: el.x, y: el.y, size: el.size, at: el.crossAt + f - crossClock}}/></g>{el.label && <Text x={el.x} y={el.y + el.size / 2 + LABEL} text={el.label} opacity={progress(f, a + POP_FRAMES, a + POP_FRAMES + LABEL_FADE)}/>}</g>;
};
export const ChecklistElement: React.FC<Props<ChecklistEl>> = ({el, shotF0}) => {
  const f = useCurrentFrame(), left = el.x - el.w / 2;
  return <g>{el.rows.map((row, i) => {
    if (row.text.toUpperCase().length * LABEL * CHAR_WIDTH > el.w - TEXT_OFFSET) throw new Error(`checklist row too wide: ${row.text}`);
    const y = el.y + (i - (el.rows.length - 1) / 2) * ROW_PITCH, a = delay(el, shotF0) + i * el.step;
    const box = `M${left} ${y - BOX / 2} l${BOX} ${BOX_DRIFT} l${-BOX_DRIFT} ${BOX} l${-BOX + BOX_DRIFT} ${-BOX_DRIFT}Z`;
    const mark = row.mark === 'tick' ? <Draw d={`M${left + BOX * MARK_LEFT} ${y} l${BOX * TICK_RUN} ${BOX * TICK_DROP} l${BOX * TICK_REACH} ${-BOX * TICK_RISE}`} ink={GREEN} p={progress(f, a + MARK_DELAY, a + MARK_DELAY + MARK_DRAW)}/> : <Draw d={`M${left + BOX * CROSS_MARK_INSET_X} ${y - BOX * CROSS_MARK_INSET_Y} l${BOX * CROSS_MARK_SPAN_X} ${BOX * CROSS_MARK_SPAN_Y} M${left + BOX * (1 - CROSS_MARK_INSET_X)} ${y - BOX * CROSS_MARK_INSET_Y} l${-BOX * CROSS_MARK_SPAN_X} ${BOX * CROSS_MARK_SPAN_Y}`} ink={RED} p={progress(f, a + MARK_DELAY, a + MARK_DELAY + MARK_DRAW)}/>;
    return <g key={i}><Draw d={box} p={progress(f, a, a + BOX_DRAW)}/><Text x={left + TEXT_OFFSET} y={y + LABEL * TEXT_BASELINE} text={row.text} anchor="start" opacity={progress(f, a, a + LABEL_FADE)}/>{row.mark !== 'none' && mark}</g>;
  })}</g>;
};
export const QuoteElement: React.FC<Props<QuoteEl>> = ({el, shotF0}) => {
  const f = useCurrentFrame(), a = delay(el, shotF0), lines: string[] = [];
  for (const word of el.text.toUpperCase().trim().split(/\s+/)) {
    if (word.length * LABEL * CHAR_WIDTH > el.w) throw new Error(`quote word too wide: ${word}`);
    const last = lines.length - 1;
    if (last >= 0 && (lines[last].length + 1 + word.length) * LABEL * CHAR_WIDTH <= el.w) lines[last] += ` ${word}`;
    else lines.push(word);
  }
  const top = el.y - lines.length * LINE_HEIGHT / 2, end = a + QUOTE_DELAY + (lines.length - 1) * QUOTE_STEP + POP_FRAMES;
  // Each hook spans the full specified height; paired hooks have independent x/y controls.
  const hook = `M${QUOTE_HEIGHT * QUOTE_WIDTH} 0 Q0 ${QUOTE_HEIGHT * QUOTE_HOOK_Y} 0 ${QUOTE_HEIGHT} Q${QUOTE_HEIGHT * QUOTE_HOOK_X} ${QUOTE_HEIGHT} ${QUOTE_HEIGHT * QUOTE_HOOK_X} ${QUOTE_HEIGHT * QUOTE_HOOK_Y}`;
  return <g>{[0, 1].map(close => <g key={close} transform={`translate(${close ? el.x + el.w / 2 + QUOTE_GAP + QUOTE_HEIGHT * QUOTE_WIDTH : el.x - el.w / 2 - QUOTE_GAP - QUOTE_HEIGHT * QUOTE_WIDTH} ${close ? top + lines.length * LINE_HEIGHT : top}) scale(${close ? -1 : 1})`}>{[0, 1].map(i => <g key={i} transform={`translate(${-i * QUOTE_HEIGHT * QUOTE_PAIR} 0)`}><Draw d={hook} ink={ORANGE} p={progress(f, close ? end : a, (close ? end : a) + QUOTE_DRAW)}/></g>)}</g>)}{lines.map((line, i) => {
    const at = a + QUOTE_DELAY + i * QUOTE_STEP;
    return <g key={i} transform={`translate(${el.x} ${top + (i + 1) * LINE_HEIGHT}) scale(${pop(f, at)})`}><Text x={0} y={0} text={line} opacity={progress(f, at, at + ICON_FADE)}/></g>;
  })}{el.who && <Text x={el.x} y={top + (lines.length + 1) * LINE_HEIGHT} text={`\u2014 ${el.who}`} size={SMALL} opacity={progress(f, end, end + LABEL_FADE)}/>}</g>;
};
export const BignumElement: React.FC<Props<BignumEl>> = ({el, shotF0}) => {
  const f = useCurrentFrame(), a = delay(el, shotF0);
  if (!Number.isSafeInteger(el.value) || el.value < 0) throw new Error('bignum.value must be a non-negative safe integer');
  if (!Number.isInteger(el.dur) || el.dur <= 0) throw new Error('bignum.dur must be a positive integer');
  const format = (v: number) => `${el.prefix ?? ''}${Math.round(v).toLocaleString('en-US')}${el.suffix ?? ''}`;
  const size = Math.min(BIG_FONT, BIG_FIT / (format(el.value).length * CHAR_WIDTH));
  const p = progress(f, a, a + el.dur), width = format(el.value).length * size * CHAR_WIDTH;
  return <g><Text x={el.x} y={el.y} text={format(el.value * (1 - Math.pow(1 - p, COUNT_EASE)))} size={size} fill={color(el.color)} opacity={progress(f, a, a + BIG_FADE)}/><Draw ink={ORANGE} p={progress(f, a + el.dur, a + el.dur + UNDERLINE_DRAW)} d={`M${el.x - width / 2} ${el.y + size * UNDERLINE_Y} Q${el.x} ${el.y + size * (UNDERLINE_Y + UNDERLINE_BOW)} ${el.x + width / 2} ${el.y + size * UNDERLINE_Y}`}/><Text x={el.x} y={el.y + size * UNDERLINE_Y + LABEL * BIG_LABEL_GAP} text={el.label} opacity={progress(f, a + el.dur, a + el.dur + LABEL_FADE)}/></g>;
};
