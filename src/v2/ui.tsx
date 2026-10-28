import React from 'react';
import {interpolate, spring, useVideoConfig} from 'remotion';
import {FONT_CAPTION} from '../lib/fonts';
import {activeCue} from '../lib/cues';
import {fitText} from '@remotion/layout-utils';
import {CAPTION_TOP, H, SAFE, W} from '../lib/tokens';
import type {Cue} from '../types';
import {V2} from './tokens';

// Centred text spans symmetric margins: the stricter side (the button rail) sets the width.
const SAFE_WIDTH = W - 2 * Math.max(SAFE.left, W - SAFE.right);
const STAT_MAX_PX = 230;

/**
 * Thai text that may wrap ONLY at the spaces between phrases. Browsers otherwise break Thai at any
 * dictionary word boundary and split a phrase across lines ("แม่หาย|แล้ว").
 */
export const phrases = (s: string): React.ReactNode[] =>
	s.split(/(\s+)/).map((t, i) => (/^\s+$/.test(t) ? t : <span key={i} style={{whiteSpace: 'nowrap'}}>{t}</span>));

/** Film finish: animated grain + vignette. Sits on top of everything except text. */
export const Film: React.FC<{frame: number; vignette?: number; grain?: boolean}> = ({frame, vignette = 0.75, grain = true}) => (
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
		{/* animated grain: off for uploads, TikTok's re-encode spends its bits on the noise and blocks everything else */}
		{grain ? <rect width={W} height={H} filter="url(#grain)" /> : null}
	</svg>
);

/** Volumetric torch beam from (x, y) toward `angle` degrees (0 = right). Additive look via screen blend. */
export const Beam: React.FC<{x: number; y: number; angle: number; length?: number; spread?: number; flicker?: number; dust?: number; frame?: number}> = ({x, y, angle, length = 900, spread = 26, flicker = 1, dust = 0, frame = 0}) => {
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
			{Array.from({length: dust}, (_, i) => {
				// each mote sits at a fixed spot in the cone (distance d, offset k) and drifts slowly
				const d = (((i * 0.6180339) % 1) * 0.85 + 0.08) * length;
				const k = (((i * 0.4142135) % 1) * 2 - 1) * Math.tan(half) * 0.9;
				const drift = Math.sin(frame / 40 + i) * 14;
				const px = x + Math.cos(a) * d - Math.sin(a) * d * k + drift;
				const py = y + Math.sin(a) * d + Math.cos(a) * d * k + Math.cos(frame / 33 + i * 2) * 10 - ((frame * 0.6 + i * 37) % 60);
				const tw = 0.35 + 0.65 * Math.abs(Math.sin(frame / 18 + i));
				return <circle key={i} cx={px} cy={py} r={1.6 + (i % 3)} fill="#FFF3D6" opacity={tw * (1 - d / length)} />;
			})}
		</svg>
	);
};

/** Small time/place chip, top-right: the rules HUD owns the top-left (e.g. "23:47 · ทางเข้าป่า"). */
export const Chip: React.FC<{text: string}> = ({text}) => (
	<div style={{position: 'absolute', top: SAFE.top + 10, left: SAFE.left, width: SAFE.right - SAFE.left, display: 'flex', justifyContent: 'flex-end'}}>
		<div style={{fontFamily: FONT_CAPTION, fontWeight: 600, fontSize: 34, color: V2.white, background: V2.chip, border: '2px solid rgba(255,255,255,0.35)', borderRadius: 999, padding: '6px 26px', letterSpacing: 1}}>{text}</div>
	</div>
);

/** Character intro: name + one-line trait, slides in at the left edge. */
export const IntroCard: React.FC<{name: string; trait: string; frame: number; top?: number}> = ({name, trait, frame, top}) => {
	const {fps} = useVideoConfig();
	const s = spring({frame, fps, config: {damping: 14}});
	return (
		<div style={{position: 'absolute', top: top ?? SAFE.top + 120, left: SAFE.left, transform: `translateX(${(s - 1) * 400}px)`, opacity: s}}>
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
	// keyed by cue: each caption is a NEW element. Editing one element's text in place left a stale
	// glyph of the old caption (its blurred shadow) on screen for a few frames in headless renders.
	return (
		<div key={`${cue.start}`} style={{position: 'absolute', left: SAFE.left, width: SAFE.right - SAFE.left, top: CAPTION_TOP + 40, display: 'flex', justifyContent: 'center', transform: `translateY(${rise}px)`}}>
			{/* outline + a tight shadow: an 18px blurred shadow left stale glyphs when the text changed */}
			<div style={{fontFamily: FONT_CAPTION, fontWeight: 800, fontSize: 66, lineHeight: 1.3, color: V2.white, textAlign: 'center', WebkitTextStroke: '8px rgba(0,0,0,0.85)', paintOrder: 'stroke fill', textShadow: '0 3px 6px rgba(0,0,0,0.8)'}}>
				{parts.map((p, i) => (p.startsWith('*') ? <span key={i} style={{color: V2.yellow}}>{phrases(p.slice(1, -1))}</span> : <span key={i}>{phrases(p)}</span>))}
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
				<div style={{fontFamily: FONT_CAPTION, fontWeight: 800, fontSize: 56, color: V2.white, lineHeight: 1.25}}>{phrases(text)}</div>
			</div>
		);
	};
	return (
		<div style={{position: 'absolute', left: SAFE.left, width: SAFE.right - SAFE.left, top: 580, display: 'flex', flexDirection: 'column', gap: 34}}>
			<div style={{fontFamily: FONT_CAPTION, fontWeight: 800, fontSize: 80, color: V2.white, textAlign: 'center', textShadow: '0 6px 20px #000'}}>คุณจะทำยังไง?</div>
			{row('A', a, V2.yellow, 4)}
			{row('B', b, V2.red, 12)}
			{prompt ? <div style={{fontFamily: FONT_CAPTION, fontWeight: 800, fontSize: 54, color: V2.ink, background: V2.white, borderRadius: 999, padding: '14px 30px', textAlign: 'center', marginTop: 24}}>{prompt}</div> : null}
			{footer ? <div style={{fontFamily: FONT_CAPTION, fontWeight: 600, fontSize: 44, color: V2.yellow, textAlign: 'center'}}>{footer}</div> : null}
		</div>
	);
};

/** Big number beat ("3 ข้อ", "300 เมตร"): huge accent value, small label above. */
export const StatCard: React.FC<{value: string; label: string; frame: number}> = ({value, label, frame}) => {
	const {fps} = useVideoConfig();
	const s = spring({frame, fps, config: {damping: 13, stiffness: 140}});
	// Big, but never wider than what a tall phone actually shows.
	const fit = fitText({text: value, withinWidth: SAFE_WIDTH, fontFamily: FONT_CAPTION, fontWeight: 800});
	const size = Math.min(STAT_MAX_PX, fit.fontSize);
	return (
		<div style={{position: 'absolute', top: 640, left: 0, width: W, textAlign: 'center', opacity: s, transform: `scale(${0.85 + 0.15 * s})`}}>
			<div style={{fontFamily: FONT_CAPTION, fontWeight: 600, fontSize: 40, letterSpacing: 8, color: 'rgba(255,255,255,0.75)'}}>{label}</div>
			<div style={{fontFamily: FONT_CAPTION, fontWeight: 800, fontSize: size, lineHeight: 1.05, whiteSpace: 'nowrap', color: V2.red, textShadow: '0 10px 40px rgba(0,0,0,0.8)'}}>{value}</div>
		</div>
	);
};

/** Pip-style end card: each option is pinned by a leader line to the place in the scene it leads to. */
export const ChoiceMap: React.FC<{
	a: string;
	b: string;
	at: {a: {x: number; y: number}; b: {x: number; y: number}};
	title?: string;
	prompt?: string;
	footer?: string;
	frame: number;
}> = ({a, b, at, title, prompt, footer, frame}) => {
	const {fps} = useVideoConfig();
	// Layout below the countdown ring (SAFE.top + 60 … +360): title, then options, then the prompt.
	const TITLE_Y = 600;
	const LABEL_Y = 860;
	const PROMPT_Y = 1390; // below the pinned targets so no leader line crosses it
	const opt = (tag: string, text: string, color: string, target: {x: number; y: number}, labelX: number, delay: number) => {
		const s = spring({frame: frame - delay, fps, config: {damping: 15}});
		const draw = interpolate(frame - delay, [0, 12], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
		const ex = labelX + 30;
		const ey = LABEL_Y + 30;
		// Text and targets stay out of TikTok's button rail (SAFE.right): long options wrap instead.
		const textX = labelX + 74;
		const textW = (labelX < W / 2 ? W / 2 - 10 : SAFE.right) - textX;
		const p = {x: Math.min(Math.max(target.x, SAFE.left), SAFE.right), y: target.y};
		return (
			<g opacity={s}>
				<line x1={ex} y1={ey} x2={ex + (p.x - ex) * draw} y2={ey + (p.y - ey) * draw} stroke={color} strokeWidth={4} />
				<circle cx={p.x} cy={p.y} r={10 * draw} fill={color} />
				<circle cx={ex} cy={LABEL_Y} r={30} fill={color} />
				<text x={ex} y={LABEL_Y + 13} textAnchor="middle" fontFamily={FONT_CAPTION} fontWeight={800} fontSize={40} fill={V2.ink}>
					{tag}
				</text>
				<foreignObject x={textX} y={LABEL_Y - 34} width={textW} height={160}>
					<div style={{fontFamily: FONT_CAPTION, fontWeight: 800, fontSize: 44, lineHeight: 1.2, color: V2.white, textShadow: '0 4px 14px #000'}}>{phrases(text)}</div>
				</foreignObject>
			</g>
		);
	};
	return (
		<>
			<div style={{position: 'absolute', top: TITLE_Y, width: W, textAlign: 'center'}}>
				{title ? <div style={{fontFamily: FONT_CAPTION, fontWeight: 600, fontSize: 34, letterSpacing: 6, color: 'rgba(255,255,255,0.7)'}}>{title}</div> : null}
				<div style={{fontFamily: FONT_CAPTION, fontWeight: 800, fontSize: 78, color: V2.white}}>
					<span style={{color: V2.yellow}}>คุณ</span>เป็นคนเลือก
				</div>
			</div>
			<svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
				{/* each label sits on the same side as its target, so the leader lines never cross */}
				{opt('A', a, V2.yellow, at.a, at.a.x <= at.b.x ? SAFE.left : W / 2 + 10, 4)}
				{opt('B', b, V2.red, at.b, at.a.x <= at.b.x ? W / 2 + 10 : SAFE.left, 12)}
			</svg>
			<div style={{position: 'absolute', top: PROMPT_Y, width: W, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16}}>
				{prompt ? <div style={{fontFamily: FONT_CAPTION, fontWeight: 800, fontSize: 52, color: V2.ink, background: V2.white, borderRadius: 999, padding: '12px 34px'}}>{prompt}</div> : null}
				{footer ? <div style={{fontFamily: FONT_CAPTION, fontWeight: 600, fontSize: 40, color: V2.yellow}}>{footer}</div> : null}
			</div>
		</>
	);
};

/** Diagonal rain streaks in two depths (far: thin + slow, near: thick + fast). */
export const Rain: React.FC<{frame: number}> = ({frame}) => (
	<svg width={W} height={H} style={{position: 'absolute', inset: 0, pointerEvents: 'none'}}>
		{Array.from({length: 140}, (_, i) => {
			const near = i % 4 === 0;
			const speed = near ? 70 : 42;
			const len = near ? 90 : 50;
			const x0 = ((i * 97.3) % (W + 300)) - 150;
			const y = ((i * 211.7 + frame * speed) % (H + 200)) - 100;
			const x = x0 + y * 0.18;
			return <line key={i} x1={x} y1={y} x2={x + len * 0.18} y2={y + len} stroke="#BFD3F2" strokeWidth={near ? 2.4 : 1.2} opacity={near ? 0.35 : 0.22} />;
		})}
	</svg>
);

const MONO = "'Courier New', monospace";

/** v4 HUD: tiny monospace stakes line, rules as ①②③ that turn red and strike when broken. */
export const RulesMini: React.FC<{rules: RuleState[]; chip?: string}> = ({rules, chip}) => (
	<div style={{position: 'absolute', top: SAFE.top + 20, left: SAFE.left, fontFamily: MONO, color: 'rgba(255,255,255,0.8)'}}>
		<div style={{display: 'flex', gap: 12, alignItems: 'center'}}>
			<span style={{fontFamily: FONT_CAPTION, fontWeight: 600, fontSize: 30, letterSpacing: 2}}>กฎ</span>
			{rules.map((r, i) => (
				<span
					key={i}
					style={{
						width: 40,
						height: 40,
						borderRadius: 99,
						border: `3px solid ${r.broken ? V2.red : 'rgba(255,255,255,0.8)'}`,
						color: r.broken ? V2.red : V2.white,
						display: 'inline-flex',
						alignItems: 'center',
						justifyContent: 'center',
						fontFamily: FONT_CAPTION,
						fontWeight: 800,
						fontSize: 24,
						position: 'relative',
					}}
				>
					{i + 1}
					{r.broken ? <span style={{position: 'absolute', width: 52, height: 4, background: V2.red, transform: `rotate(-45deg) scaleX(${Math.min(1, r.brokenAge / 0.25)})`}} /> : null}
				</span>
			))}
		</div>
		{chip ? <div style={{fontSize: 24, letterSpacing: 3, marginTop: 10, color: 'rgba(255,255,255,0.6)'}}>{chip}</div> : null}
	</div>
);

/** v4 hook title: two big lines top-left, *starred* words in the accent colour. */
export const BigTitle: React.FC<{text: string; frame: number}> = ({text, frame}) => {
	const {fps} = useVideoConfig();
	const s = spring({frame, fps, config: {damping: 16}});
	return (
		<div style={{position: 'absolute', top: SAFE.top + 120, left: SAFE.left, right: W - SAFE.right, opacity: s, transform: `translateY(${(1 - s) * 30}px)`}}>
			{text.split('\n').map((line, i) => (
				<div key={i} style={{fontFamily: FONT_CAPTION, fontWeight: 800, fontSize: 92, lineHeight: 1.1, color: V2.white, textShadow: '0 6px 30px rgba(0,0,0,0.9)'}}>
					{line.split(/(\*[^*]+\*)/g).filter(Boolean).map((p, j) => (p.startsWith('*') ? <span key={j} style={{color: V2.yellow}}>{phrases(p.slice(1, -1))}</span> : <span key={j}>{phrases(p)}</span>))}
				</div>
			))}
		</div>
	);
};

/** Out-of-focus foreground specks drifting past the lens (depth cue). */
export const Bokeh: React.FC<{frame: number}> = ({frame}) => (
	<svg width={W} height={H} style={{position: 'absolute', inset: 0, pointerEvents: 'none', mixBlendMode: 'screen'}}>
		<defs>
			<filter id="bokehBlur">
				<feGaussianBlur stdDeviation="14" />
			</filter>
		</defs>
		{Array.from({length: 9}, (_, i) => {
			const x = ((i * 271.3 + frame * (0.3 + (i % 3) * 0.2)) % (W + 300)) - 150;
			const y = 200 + ((i * 523.7) % (H - 400)) + Math.sin(frame / 50 + i) * 30;
			return <circle key={i} cx={x} cy={y} r={30 + (i % 4) * 22} fill="#9FB6D9" opacity={0.08 + (i % 3) * 0.04} filter="url(#bokehBlur)" />;
		})}
	</svg>
);

/** Warm pool where the torch beam meets the ground. */
export const LightPool: React.FC<{x: number; y: number; flicker: number}> = ({x, y, flicker}) => (
	<svg width={W} height={H} style={{position: 'absolute', inset: 0, pointerEvents: 'none', mixBlendMode: 'screen', opacity: flicker}}>
		<defs>
			<radialGradient id="pool">
				<stop offset="0" stopColor={V2.torch} stopOpacity={0.45} />
				<stop offset="1" stopColor={V2.torch} stopOpacity={0} />
			</radialGradient>
		</defs>
		<ellipse cx={x} cy={y} rx={260} ry={60} fill="url(#pool)" />
	</svg>
);

/** "ตอน 1/3" in the opening scene: part-2+ viewers need to know where they are (growth playbook). */
export const PartBadge: React.FC<{part: number; total?: number}> = ({part, total}) => (
	<div style={{position: 'absolute', top: SAFE.top + 30, left: SAFE.left}}>
		<span style={{fontFamily: FONT_CAPTION, fontWeight: 800, fontSize: 42, color: V2.ink, background: V2.yellow, borderRadius: 14, padding: '4px 18px'}}>
			ตอน {part}
			{total ? `/${total}` : ''}
		</span>
	</div>
);
