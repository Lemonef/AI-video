import React from 'react';
import {spring, useVideoConfig} from 'remotion';
import {C} from '../../lib/tokens';
import {FONT_CAPTION} from '../../lib/fonts';
// Kanit, not Mali: Mali misplaces stacked Thai tone marks (จ๊ rendered with a floating ๗-like mark).
const FONT_BUBBLE = FONT_CAPTION;
import {bubbleSize} from '../../lib/layout';
import type {BubbleItem} from '../../types';

// HTML (not SVG) for Thai font shaping; line breaks come from phraseLines (spaces only), the same
// split bubbleSize used to place the box.
export const Bubble: React.FC<{item: BubbleItem; frame: number}> = ({item, frame}) => {
	const {fps} = useVideoConfig();
	const {w, lines} = bubbleSize(item.text, item.label);
	const pop = spring({frame, fps, config: {damping: 11, stiffness: 160}});
	const wob = item.kind === 'shout' ? Math.sin(frame / 2) * 2.5 : 0;
	const bg = item.kind === 'thought' ? C.white : item.kind === 'shout' ? C.sun : C.paper;
	const radius = item.kind === 'thought' ? 80 : item.kind === 'shout' ? 18 : 44;

	return (
		<div
			style={{
				position: 'absolute',
				left: item.x,
				top: item.y,
				transform: `translate(-50%, -100%) scale(${pop}) rotate(${wob}deg)`,
				transformOrigin: '50% 100%',
				width: w,
			}}
		>
			{item.label ? (
				<div
					style={{
						fontFamily: FONT_BUBBLE,
						fontWeight: 700,
						fontSize: 30,
						color: C.white,
						background: C.ink,
						borderRadius: 999,
						padding: '4px 18px',
						display: 'inline-block',
						marginBottom: 8,
					}}
				>
					{item.label}
				</div>
			) : null}
			<div
				style={{
					fontFamily: FONT_BUBBLE,
					fontWeight: 700,
					fontSize: 52,
					lineHeight: 1.35,
					color: C.ink,
					background: bg,
					border: `6px solid ${C.ink}`,
					borderRadius: radius,
					padding: '26px 38px',
					textAlign: 'center',
					boxShadow: `10px 10px 0 ${C.shadow}`,
				}}
			>
				{lines.map((line, i) => (
					<div key={i} style={{whiteSpace: 'nowrap'}}>
						{line}
					</div>
				))}
			</div>
			{item.kind === 'thought' ? (
				<div style={{position: 'relative', height: 70}}>
					<div style={{position: 'absolute', left: '42%', top: 10, width: 34, height: 34, borderRadius: 99, background: C.white, border: `5px solid ${C.ink}`}} />
					<div style={{position: 'absolute', left: '36%', top: 48, width: 20, height: 20, borderRadius: 99, background: C.white, border: `4px solid ${C.ink}`}} />
				</div>
			) : (
				<svg width="100%" height={56} viewBox="0 0 100 56" preserveAspectRatio="none" style={{display: 'block', marginTop: -6}}>
					<path
						d={item.tail === 'right' ? 'M58 0 L82 52 L72 0' : item.tail === 'left' ? 'M28 0 L18 52 L42 0' : 'M44 0 L50 52 L56 0'}
						fill={bg}
						stroke={C.ink}
						strokeWidth={3}
						vectorEffect="non-scaling-stroke"
					/>
				</svg>
			)}
		</div>
	);
};
