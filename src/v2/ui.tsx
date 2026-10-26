import React from 'react';
import {interpolate, spring, useVideoConfig} from 'remotion';
import {FONT_CAPTION} from '../lib/fonts';
import {activeCue} from '../lib/cues';
import {CAPTION_TOP, H, SAFE, W} from '../lib/tokens';
import type {Cue} from '../types';
import {V2} from './tokens';

/** Film finish: animated grain + vignette. Sits on top of everything except text. */
export const Film: React.FC<{frame: number; vignette?: number}> = ({frame, vignette = 0.75}) => (
	<svg width={W} height={H} style={{position: 'absolute', inset: 0, pointerEvents: 'none'}}>
		<defs>
			<filter id="grain">
				{/* new seed every 2 frames = moving film grain */}
				<feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={Math.floor(frame / 2)} />
				<feColorMatrix type="saturate" values="0" />
				<feComponentTransfer>
					<feFuncA type="linear" slope="0.09" />
				</feComponentTransfer>
			</filter>
			<radialGradient id="vig" cx="50%" cy="45%" r="75%">
				<stop offset="0.55" stopColor="#000" stopOpacity={0} />
				<stop offset="1" stopColor="#000" stopOpacity={vignette} />
			</radialGradient>
		</defs>
		<rect width={W} height={H} fill="url(#vig)" />
		<rect width={W} height={H} filter="url(#grain)" />
	</svg>
);

/** Volumetric torch beam from (x, y) toward `angle` degrees (0 = right). Additive look via screen blend. */
export const Beam: React.FC<{x: number; y: number; angle: number; length?: number; spread?: number; flicker?: number}> = ({x, y, angle, length = 900, spread = 26, flicker = 1}) => {
	const half = (spread * Math.PI) / 180;
	const a = (angle * Math.PI) / 180;
	const p1 = [x + Math.cos(a - half) * length, y + Math.sin(a - half) * length];
	const p2 = [x + Math.cos(a + half) * length, y + Math.sin(a + half) * length];
	return (
		<svg width={W} height={H} style={{position: 'absolute', inset: 0, mixBlendMode: 'screen', opacity: flicker}}>
			<defs>
				<radialGradient id="beam" cx={x} cy={y} r={length} gradientUnits="userSpaceOnUse">
					<stop offset="0" stopColor={V2.torch} stopOpacity={0.55} />
					<stop offset="0.6" stopColor={V2.torch} stopOpacity={0.14} />
					<stop offset="1" stopColor={V2.torch} stopOpacity={0} />
				</radialGradient>
			</defs>
			<path d={`M${x},${y} L${p1[0]},${p1[1]} L${p2[0]},${p2[1]} Z`} fill="url(#beam)" />
			<circle cx={x} cy={y} r={34} fill={V2.torch} opacity={0.35} />
		</svg>
	);
};

/** Small time/place chip, top-centre (e.g. "23:47 · ทางเข้าป่า"). */
export const Chip: React.FC<{text: string}> = ({text}) => (
	<div style={{position: 'absolute', top: SAFE.top + 10, left: 0, width: W, display: 'flex', justifyContent: 'center'}}>
		<div style={{fontFamily: FONT_CAPTION, fontWeight: 600, fontSize: 34, color: V2.white, background: V2.chip, border: '2px solid rgba(255,255,255,0.35)', borderRadius: 999, padding: '6px 26px', letterSpacing: 1}}>{text}</div>
	</div>
);

/** Character intro: name + one-line trait, slides in at the left edge. */
export const IntroCard: React.FC<{name: string; trait: string; frame: number}> = ({name, trait, frame}) => {
	const {fps} = useVideoConfig();
	const s = spring({frame, fps, config: {damping: 14}});
	return (
		<div style={{position: 'absolute', top: SAFE.top + 120, left: SAFE.left, transform: `translateX(${(s - 1) * 400}px)`, opacity: s}}>
			<div style={{borderLeft: `8px solid ${V2.yellow}`, paddingLeft: 20}}>
				<div style={{fontFamily: FONT_CAPTION, fontWeight: 800, fontSize: 96, color: V2.white, lineHeight: 1}}>{name}</div>
				<div style={{fontFamily: FONT_CAPTION, fontWeight: 600, fontSize: 38, color: V2.yellow, marginTop: 6}}>{trait}</div>
			</div>
		</div>
	);
};

export type RuleState = {text: string; broken: boolean; brokenAge: number};

/** The rules as an in-world paper card. `big` = full reading view; otherwise a corner HUD. */
export const RulesCard: React.FC<{title: string; rules: RuleState[]; big: boolean; frame: number; revealed: number}> = ({title, rules, big, frame, revealed}) => {
	const {fps} = useVideoConfig();
	const s = spring({frame, fps, config: {damping: 15}});
	const scale = big ? 1 : 0.42;
	return (
		<div
			style={{
				position: 'absolute',
				top: big ? 420 : SAFE.top + 70,
				left: big ? 110 : SAFE.left - 10,
				width: 860,
				transform: `scale(${scale}) rotate(${big ? -2 : -3}deg) translateY(${big ? (1 - s) * 900 : 0}px)`,
				transformOrigin: 'top left',
				background: V2.paper,
				borderRadius: 18,
				boxShadow: '0 30px 60px rgba(0,0,0,0.55)',
				padding: '40px 48px',
				border: `3px solid ${V2.paperShade}`,
			}}
		>
			<div style={{fontFamily: FONT_CAPTION, fontWeight: 800, fontSize: 58, color: V2.ink, borderBottom: `4px solid ${V2.ink}`, paddingBottom: 12, marginBottom: 20}}>{title}</div>
			{rules.map((r, i) => {
				const show = i < revealed;
				const strike = r.broken ? interpolate(r.brokenAge, [0, 0.25], [0, 100], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) : 0;
				return (
					<div key={i} style={{display: 'flex', gap: 18, alignItems: 'baseline', opacity: show ? 1 : 0, marginBottom: 16, position: 'relative'}}>
						<div style={{fontFamily: FONT_CAPTION, fontWeight: 800, fontSize: 50, color: r.broken ? V2.red : V2.ink, minWidth: 40}}>{i + 1}.</div>
						<div style={{fontFamily: FONT_CAPTION, fontWeight: 600, fontSize: 48, color: r.broken ? V2.red : V2.ink, lineHeight: 1.3, position: 'relative'}}>
							{r.text}
							<div style={{position: 'absolute', left: 0, top: '52%', height: 6, width: `${strike}%`, background: V2.red, borderRadius: 3}} />
						</div>
					</div>
				);
			})}
		</div>
	);
};

/** Captions without a box; words wrapped in *stars* in the episode file are highlighted yellow. */
export const Captions2: React.FC<{cues: Cue[]; t: number}> = ({cues, t}) => {
	const cue = activeCue(cues, t);
	if (!cue) return null;
	const rise = interpolate(t - cue.start, [0, 0.14], [18, 0], {extrapolateRight: 'clamp'});
	const parts = cue.text.split(/(\*[^*]+\*)/g).filter(Boolean);
	return (
		<div style={{position: 'absolute', left: SAFE.left, width: SAFE.right - SAFE.left, top: CAPTION_TOP + 40, display: 'flex', justifyContent: 'center', transform: `translateY(${rise}px)`}}>
			<div style={{fontFamily: FONT_CAPTION, fontWeight: 800, fontSize: 66, lineHeight: 1.3, color: V2.white, textAlign: 'center', textShadow: '0 4px 18px rgba(0,0,0,0.9), 0 0 4px rgba(0,0,0,0.9)'}}>
				{parts.map((p, i) => (p.startsWith('*') ? <span key={i} style={{color: V2.yellow}}>{p.slice(1, -1)}</span> : <span key={i}>{p}</span>))}
			</div>
		</div>
	);
};

/** A/B decision card, v2 look: dark glass panels on the frozen frame. */
export const EndCard2: React.FC<{a: string; b: string; prompt?: string; footer?: string; frame: number}> = ({a, b, prompt, footer, frame}) => {
	const {fps} = useVideoConfig();
	const row = (tag: string, text: string, color: string, delay: number) => {
		const s = spring({frame: frame - delay, fps, config: {damping: 14}});
		return (
			<div style={{display: 'flex', alignItems: 'center', gap: 26, background: 'rgba(11,14,24,0.78)', border: `3px solid ${color}`, borderRadius: 28, padding: '24px 30px', transform: `translateY(${(1 - s) * 80}px)`, opacity: s}}>
				<div style={{flex: '0 0 auto', width: 104, height: 104, borderRadius: 22, background: color, color: V2.ink, fontFamily: FONT_CAPTION, fontWeight: 800, fontSize: 72, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{tag}</div>
				<div style={{fontFamily: FONT_CAPTION, fontWeight: 800, fontSize: 56, color: V2.white, lineHeight: 1.25}}>{text}</div>
			</div>
		);
	};
	return (
		<div style={{position: 'absolute', left: SAFE.left, width: SAFE.right - SAFE.left, top: 520, display: 'flex', flexDirection: 'column', gap: 34}}>
			<div style={{fontFamily: FONT_CAPTION, fontWeight: 800, fontSize: 80, color: V2.white, textAlign: 'center', textShadow: '0 6px 20px #000'}}>คุณจะทำยังไง?</div>
			{row('A', a, V2.yellow, 4)}
			{row('B', b, V2.red, 12)}
			{prompt ? <div style={{fontFamily: FONT_CAPTION, fontWeight: 800, fontSize: 54, color: V2.ink, background: V2.white, borderRadius: 999, padding: '14px 30px', textAlign: 'center', marginTop: 24}}>{prompt}</div> : null}
			{footer ? <div style={{fontFamily: FONT_CAPTION, fontWeight: 600, fontSize: 44, color: V2.yellow, textAlign: 'center'}}>{footer}</div> : null}
		</div>
	);
};
