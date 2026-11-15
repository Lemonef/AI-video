import React, {useId} from 'react';
import {Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {Sprite, Tower, Words, Underline, useIn, INK, PAPER, ORANGE, RED, GREEN, TEAL, FONT, LINE} from '../compositions/InkProof';
import type {Color, El, SpriteEl, WordsEl, UnderlineEl, StampEl, TowerEl, CrossEl, TicketEl, TagEl, PhotoEl, RedactEl, TickEl, TimelineEl, ChimneyEl, RadioEl} from './schema';
const progress = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
const color = (c?: Color) => c ? ({orange: ORANGE, red: RED, green: GREEN, teal: TEAL}[c]) : INK;
type Props<T> = {el: T; shotF0: number; shotF1: number};
const delay = (el: {at?: number}, f0: number) => (el.at ?? f0) - f0;
const Center: React.FC<{x: number; y: number; children: React.ReactNode}> = ({x, y, children}) => <div style={{position: 'absolute', left: x, top: y, transform: 'translate(-50%,-50%)', whiteSpace: 'nowrap'}}>{children}</div>;
export const SpriteElement: React.FC<Props<SpriteEl>> = ({el, shotF0, shotF1}) => {
  const f = useCurrentFrame(); const d = delay(el, shotF0); const p = useIn(d);
  const moving = el.x2 !== undefined; const x = el.x + ((el.x2 ?? el.x) - el.x) * progress(f, d, shotF1 - shotF0);
  const bounce = moving && f >= d && f < shotF1 - shotF0 ? -Math.abs(Math.sin(f / 4)) * 10 : 0;
  return <g opacity={progress(f, d, d + 4)} transform={`translate(${x} ${el.y + bounce}) scale(${0.9 + 0.1 * p})`}><Sprite {...el} x={0} y={0}/></g>;
};
export const WordsElement: React.FC<Props<WordsEl>> = ({el, shotF0}) => <Center {...el}><Words text={el.text} size={el.size} color={color(el.color)} delay={delay(el, shotF0)}/></Center>;
export const UnderlineElement: React.FC<Props<UnderlineEl>> = ({el, shotF0}) => <Center {...el}><Underline w={el.w} delay={delay(el, shotF0)}/></Center>;
export const StampElement: React.FC<Props<StampEl>> = ({el, shotF0}) => {
  const f = useCurrentFrame() - delay(el, shotF0); const p = useIn(delay(el, shotF0), 10);
  return <Center {...el}><div style={{border: `10px solid ${color(el.color)}`, borderRadius: 12, fontFamily: 'Arial Black, Arial, sans-serif', fontWeight: 900, fontSize: 110, padding: '8px 28px', color: color(el.color), opacity: 0.92 * progress(f, 0, 4), transform: `translateX(${f >= 0 && f < 6 ? Math.sin(f * 4) * 6 : 0}px) rotate(${el.rot}deg) scale(${2.2 - 1.2 * p})`}}>{el.text}</div></Center>;
};
export const TowerElement: React.FC<Props<TowerEl>> = ({el, shotF0}) => {
  const f = useCurrentFrame(); const id = useId().replace(/:/g, '');
  const build = el.build ? progress(f, el.build[0] - shotF0, el.build[1] - shotF0) : 1;
  const raw = el.cut ? progress(f, el.cut[1] - shotF0, el.cut[1] - shotF0 + 14) : 0; const cut = raw * raw * (3 - 2 * raw);
  const line = el.cut ? progress(f, el.cut[0] - shotF0, el.cut[0] - shotF0 + 8) : 0;
  return <g><defs><clipPath id={`${id}build`}><rect x={el.x - el.h} y={el.y - el.h * build - (build === 1 ? 20 : 0)} width={el.h * 2} height={el.h * build + (build === 1 ? 40 : 0)}/></clipPath>{[0, 1, 2].map(i => <clipPath key={i} id={`${id}s${i}`}><rect x={el.x - el.h} y={el.y - el.h * (i + 1) / 3 - (i === 2 ? 20 : 0)} width={el.h * 2} height={el.h / 3 + (i === 2 ? 20 : i === 0 ? 20 : 0)}/></clipPath>)}</defs><g clipPath={`url(#${id}build)`}>{[0, 1, 2].map(i => <g key={i} transform={i === 1 ? `translate(${30 * cut} 0)` : i === 2 ? `translate(0 ${-60 * cut}) rotate(${8 * cut} ${el.x} ${el.y - el.h * 2 / 3})` : undefined}><g clipPath={`url(#${id}s${i})`}><Tower x={el.x} y={el.y} k={el.h / 430}/></g></g>)}</g>{el.cut && [1, 2].map(i => <line key={i} x1={el.x - el.h * 0.35} x2={el.x + el.h * 0.35 * (2 * line - 1)} y1={el.y - el.h * i / 3} y2={el.y - el.h * i / 3} stroke={RED} strokeWidth={6} strokeDasharray="18 12" opacity={line > 0 ? 1 : 0}/>)}</g>;
};
export const CrossElement: React.FC<Props<CrossEl>> = ({el, shotF0}) => {
  const f = useCurrentFrame() - delay(el, shotF0); const r = el.size / 2;
  return <g transform={`translate(${el.x} ${el.y})`} stroke={RED} strokeWidth={22} strokeLinecap="round">{[0, 1].map(i => <path key={i} d={i ? `M${r} ${-r} L${-r} ${r}` : `M${-r} ${-r} L${r} ${r}`} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - progress(f, i * 4, i * 4 + 7)} opacity={f > i * 4 ? 1 : 0}/>)}</g>;
};
export const TicketElement: React.FC<Props<TicketEl>> = ({el, shotF0}) => {
  const p = useIn(delay(el, shotF0)); const h = el.w * 0.38; const perf = el.w * 0.26;
  return <g transform={`translate(${el.x} ${el.y}) rotate(-3) scale(${p})`} opacity={p}><rect x={-el.w / 2} y={-h / 2} width={el.w} height={h} rx={18} fill={PAPER} stroke={INK} strokeWidth={LINE}/><line x1={perf} x2={perf} y1={-h / 2} y2={h / 2} stroke={INK} strokeWidth={4} strokeDasharray="12 10"/>{[-1, 1].map(s => <path key={s} d={`M${perf - 16} ${s * h / 2} a16 16 0 0 ${s === -1 ? 0 : 1} 32 0`} fill={PAPER} stroke={INK} strokeWidth={4}/>)}<text x={-el.w * 0.12} y={0} dominantBaseline="middle" textAnchor="middle" fontFamily={FONT} fontSize={el.w * 0.075} fill={INK}>{el.text}</text></g>;
};
export const TagElement: React.FC<Props<TagEl>> = ({el, shotF0}) => {
  const p = useIn(delay(el, shotF0)); return <Center {...el}><div style={{background: PAPER, border: `${LINE}px solid ${INK}`, borderRadius: 16, fontFamily: FONT, fontSize: 56, textTransform: 'uppercase', color: INK, padding: '10px 28px', opacity: p, transform: `scale(${0.8 + 0.2 * p})`}}>{el.text}</div></Center>;
};
export const PhotoElement: React.FC<Props<PhotoEl>> = ({el, shotF0}) => {
  const p = useIn(delay(el, shotF0)); return <Center {...el}><div style={{position: 'relative', background: '#ffffff', padding: '18px 18px 80px', boxShadow: `0 12px 28px ${INK}55`, opacity: p, transform: `translateY(${80 * (1 - p)}px) rotate(${el.rot}deg) scale(${0.9 + 0.1 * p})`}}><Img src={staticFile(el.src)} style={{display: 'block', width: el.w, height: 'auto'}}/><div style={{position: 'absolute', bottom: 18, left: 0, width: '100%', textAlign: 'center', fontFamily: FONT, fontSize: 40, color: INK}}>{el.label}</div><div style={{position: 'absolute', top: -20, left: '50%', width: 140, height: 40, background: PAPER, opacity: 0.7, transform: 'translateX(-50%) rotate(-8deg)'}}/></div></Center>;
};
export const RedactElement: React.FC<Props<RedactEl>> = ({el, shotF0}) => {const f = useCurrentFrame(); return <rect x={el.x} y={el.y} width={el.w * (el.at === undefined ? 1 : progress(f, delay(el, shotF0), delay(el, shotF0) + 8))} height={el.h} rx={6} fill={INK}/>;};
export const TickElement: React.FC<Props<TickEl>> = ({el, shotF0}) => {const f = useCurrentFrame() - delay(el, shotF0); return <path d={`M${el.x - 60} ${el.y} l40 40 l80 -80`} fill="none" stroke={GREEN} strokeWidth={20} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - progress(f, 0, 8)} opacity={f > 0 ? 1 : 0}/>;};
export const TimelineElement: React.FC<Props<TimelineEl>> = ({el, shotF0}) => {
  const f = useCurrentFrame(); const p = progress(f, el.at - shotF0, el.at - shotF0 + 15); const b = progress(f, el.bracketAt - shotF0, el.bracketAt - shotF0 + 12); const mid = (el.x1 + el.x2) / 2;
  return <g fontFamily={FONT} fontSize={70} textAnchor="middle"><line x1={el.x1} x2={el.x1 + (el.x2 - el.x1) * p} y1={el.y} y2={el.y} stroke={INK} strokeWidth={LINE}/><g opacity={p} fill={INK}>{[el.x1, el.x2].map(x => <line key={x} x1={x} x2={x} y1={el.y - 20} y2={el.y + 20} stroke={INK} strokeWidth={LINE}/>)}<text x={el.x1} y={el.y + 100}>{el.left}</text><text x={el.x2} y={el.y + 100}>{el.right}</text></g><path d={`M${el.x1} ${el.y - 70} Q${el.x1} ${el.y - 110} ${el.x1 + 50} ${el.y - 110} L${mid - 45} ${el.y - 110} Q${mid} ${el.y - 110} ${mid} ${el.y - 145} Q${mid} ${el.y - 110} ${mid + 45} ${el.y - 110} L${el.x2 - 50} ${el.y - 110} Q${el.x2} ${el.y - 110} ${el.x2} ${el.y - 70}`} fill="none" stroke={ORANGE} strokeWidth={LINE} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - b} opacity={b > 0 ? 1 : 0}/><text x={mid} y={el.y - 185} fill={ORANGE} opacity={b}>{el.bracket}</text></g>;
};
export const ChimneyElement: React.FC<Props<ChimneyEl>> = ({el, shotF0}) => {
  const f = useCurrentFrame(); const p = progress(f, el.at - shotF0, el.done - shotF0); const w = el.h * 0.16;
  return <g><g opacity={1 - p} transform={`translate(${el.x} ${el.y}) scale(${1 - p * 0.5} 1)`}><Tower x={0} y={0} k={el.h / 430}/></g><g opacity={p} transform={`translate(${el.x} ${el.y})`}><path d={`M${-w / 2} 0 L${-el.h * 0.055} ${-el.h} L${el.h * 0.055} ${-el.h} L${w / 2} 0 Z`} fill={INK}/><rect x={-el.h * 0.065} y={-el.h} width={el.h * 0.13} height={20} fill={INK}/>{Array.from({length: 12}, (_, i) => <path key={i} d={`M${-w * (0.34 + i * 0.01)} ${-el.h + (i + 1) * el.h / 13} h${w * (0.68 + i * 0.02)}`} stroke={PAPER} strokeWidth={2} opacity={0.18}/>)}</g>{f >= el.done - shotF0 && Array.from({length: 4}, (_, i) => {const age = ((f - (el.done - shotF0) + i * 20) % 80) / 80; return <circle key={i} cx={el.x + Math.sin(age * 5 + i) * 25} cy={el.y - el.h - age * 240} r={15 + age * 60} fill="#6b6b70" opacity={(1 - age) * 0.55}/>;})}</g>;
};
export const RadioElement: React.FC<Props<RadioEl>> = ({el, shotF0}) => {
  const f = useCurrentFrame() - delay(el, shotF0); return <g fill="none" stroke={ORANGE} strokeWidth={10} strokeLinecap="round">{f >= 0 && [0, 1, 2].flatMap(i => {const p = ((f + 30 - i * 10) % 30) / 30; const r = 35 + p * 180; return [-1, 1].map(s => <path key={`${i}-${s}`} d={`M${el.x + s * r * 0.65} ${el.y - r * 0.75} Q${el.x + s * r * 1.3} ${el.y} ${el.x + s * r * 0.65} ${el.y + r * 0.75}`} opacity={1 - p}/>);})}</g>;
};
export const Element: React.FC<Props<El>> = props => {
  const el = props.el; const common = {shotF0: props.shotF0, shotF1: props.shotF1};
  switch (el.t) {
    case 'sprite': return <SpriteElement {...common} el={el}/>;
    case 'words': return <WordsElement {...common} el={el}/>;
    case 'underline': return <UnderlineElement {...common} el={el}/>;
    case 'stamp': return <StampElement {...common} el={el}/>;
    case 'tower': return <TowerElement {...common} el={el}/>;
    case 'cross': return <CrossElement {...common} el={el}/>;
    case 'ticket': return <TicketElement {...common} el={el}/>;
    case 'tag': return <TagElement {...common} el={el}/>;
    case 'photo': return <PhotoElement {...common} el={el}/>;
    case 'redact': return <RedactElement {...common} el={el}/>;
    case 'tick': return <TickElement {...common} el={el}/>;
    case 'timeline': return <TimelineElement {...common} el={el}/>;
    case 'chimney': return <ChimneyElement {...common} el={el}/>;
    case 'radio': return <RadioElement {...common} el={el}/>;
    default: throw new Error(`Unknown element type: ${(el as {t: string}).t}`);
  }
};
