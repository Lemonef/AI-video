import React from 'react';
import {spring, useVideoConfig} from 'remotion';
import {FONT_CAPTION} from '../../lib/fonts';
import {C, SAFE} from '../../lib/tokens';

const Choice: React.FC<{tag: string; text: string; color: string; frame: number; delay: number}> = ({tag, text, color, frame, delay}) => {
	const {fps, width} = useVideoConfig();
	const s = spring({frame: frame - delay, fps, config: {damping: 12}});
	const pulse = 1 + Math.sin((frame - delay) / 7) * 0.015;
	return (
		<div
			style={{
				display: 'flex',
				alignItems: 'center',
				gap: 28,
				background: C.white,
				border: `7px solid ${C.ink}`,
				borderRadius: 36,
				padding: '26px 34px',
				boxShadow: `12px 12px 0 ${C.ink}`,
				transform: `translateX(${(1 - s) * width}px) scale(${pulse})`,
			}}
		>
			<div style={{flex: '0 0 auto', width: 120, height: 120, borderRadius: 30, background: color, color: C.white, fontFamily: FONT_CAPTION, fontWeight: 800, fontSize: 86, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `6px solid ${C.ink}`}}>
				{tag}
			</div>
			<div style={{fontFamily: FONT_CAPTION, fontWeight: 800, fontSize: 64, color: C.ink, lineHeight: 1.25}}>{text}</div>
		</div>
	);
};

/** A/B decision card: the comment prompt that drives the next episode. */
export const EndCard: React.FC<{a: string; b: string; prompt?: string; footer?: string; frame: number}> = ({a, b, prompt, footer, frame}) => {
	const bob = Math.sin(frame / 6) * 12;
	return (
		<div style={{position: 'absolute', left: SAFE.left, width: SAFE.right - SAFE.left, top: SAFE.top + 60, display: 'flex', flexDirection: 'column', gap: 48}}>
			<div style={{fontFamily: FONT_CAPTION, fontWeight: 800, fontSize: 84, color: C.ink, textAlign: 'center'}}>คุณจะเลือกอะไร?</div>
			<Choice tag="A" text={a} color={C.coral} frame={frame} delay={6} />
			<Choice tag="B" text={b} color={C.teal} frame={frame} delay={14} />
			{prompt ? (
				<div style={{fontFamily: FONT_CAPTION, fontWeight: 800, fontSize: 62, color: C.white, background: C.ink, borderRadius: 999, padding: '18px 36px', textAlign: 'center', marginTop: 30, transform: `translateY(${bob}px)`}}>
					{prompt}
				</div>
			) : null}
			{footer ? <div style={{fontFamily: FONT_CAPTION, fontWeight: 600, fontSize: 52, color: C.coralDark, textAlign: 'center'}}>{footer}</div> : null}
		</div>
	);
};
