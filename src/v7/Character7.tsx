import React from 'react';
import type {Expr} from '../types';

/**
 * Jaab, v7: the simple look of the references (round head, dot eyes, limbs as single thick
 * strokes with round caps - no joints to look broken). Same identity as before: the hair curl,
 * the teal hoodie, the yellow lanyard, the backpack. Built to be seen from the front, the side
 * and the back, so the camera can go anywhere. Local origin = between the feet; up is -y.
 */
export type View7 = 'front' | 'side' | 'back';
export type Look7 = {skin: string; skinShade: string; hair: string; top: string; topShade: string; pants: string; shoe: string; lanyard?: boolean; bag?: string};

export const JAAB7: Look7 = {skin: '#F0C9A4', skinShade: '#D9AE87', hair: '#1F1A1E', top: '#2E9C8C', topShade: '#237A6E', pants: '#2B3142', shoe: '#E9E4DA', lanyard: true, bag: '#B2553E'};

// proportions (px at scale 1): a big head on a short body reads as the references' style
const HEAD_R = 118;
const HEAD_Y = -560;
const SHOULDER_Y = -395;
const HIP_Y = -185;
const LIMB = 34; // stroke width of arms and legs
export const FACE_BOX7 = {cy: HEAD_Y, half: HEAD_R + 30};

type Props = {look: Look7; view: View7; expr: Expr; frame: number; walking?: boolean; torch?: boolean; facing?: 1 | -1; react?: number; noShadow?: boolean};

const Face: React.FC<{expr: Expr; side: boolean; frame: number}> = ({expr, side, frame}) => {
	const blink = frame % 97 < 4; // an occasional blink keeps them alive
	const eyeY = HEAD_Y + 6;
	const eyes = side ? [44] : [-40, 40];
	const shock = expr === 'shock';
	const brow = shock ? -16 : expr === 'angry' ? 10 : expr === 'sweat' ? -8 : 0; // raised = scared
	return (
		<g>
			{eyes.map((x, i) =>
				blink ? (
					<line key={i} x1={x - 12} y1={eyeY} x2={x + 12} y2={eyeY} stroke="#1A1A1A" strokeWidth={6} strokeLinecap="round" />
				) : (
					<g key={i}>
						<circle cx={x} cy={eyeY} r={shock ? 15 : 12} fill="#1A1A1A" />
						<circle cx={x + 4} cy={eyeY - 5} r={4} fill="#FFFFFF" />
					</g>
				),
			)}
			{eyes.map((x, i) => (
				<line key={`b${i}`} x1={x - 16} y1={eyeY - 34 + (x < 0 ? -brow : brow) * 0.3} x2={x + 16} y2={eyeY - 34 + (x < 0 ? brow : -brow) * 0.3 + (shock ? -8 : 0)} stroke="#1A1A1A" strokeWidth={7} strokeLinecap="round" />
			))}
			{shock ? (
				<ellipse cx={side ? 52 : 0} cy={HEAD_Y + 60} rx={14} ry={20} fill="#3A1A1A" />
			) : expr === 'smile' || expr === 'talk' ? (
				<path d={`M${side ? 34 : -22},${HEAD_Y + 52} Q${side ? 52 : 0},${HEAD_Y + 72} ${side ? 70 : 22},${HEAD_Y + 52}`} stroke="#3A1A1A" strokeWidth={6} fill="none" strokeLinecap="round" />
			) : (
				<line x1={side ? 40 : -14} y1={HEAD_Y + 58} x2={side ? 64 : 14} y2={HEAD_Y + 58 + (expr === 'sweat' ? 4 : 0)} stroke="#3A1A1A" strokeWidth={6} strokeLinecap="round" />
			)}
			{expr === 'sweat' || shock ? <path d={`M${side ? -60 : 86},${HEAD_Y - 40} q10,22 0,30 q-10,-8 0,-30`} fill="#9FD3F0" /> : null}
		</g>
	);
};

const Hair: React.FC<{look: Look7; view: View7; curl: number}> = ({look, view, curl}) => {
	const top = HEAD_Y - HEAD_R;
	return (
		<g fill={look.hair}>
			{view === 'back' ? (
				<circle cx={0} cy={HEAD_Y - 6} r={HEAD_R + 4} />
			) : (
				<path d={`M${-HEAD_R - 4},${HEAD_Y - 6} C${-HEAD_R},${top - 30} ${HEAD_R},${top - 30} ${HEAD_R + 4},${HEAD_Y - 6} C${HEAD_R * 0.6},${HEAD_Y - 54} ${-HEAD_R * 0.2},${HEAD_Y - 40} ${-HEAD_R - 4},${HEAD_Y - 6} Z`} />
			)}
			{/* the signature curl */}
			<path d={`M6,${top + 4} q-6,-56 38,-66`} stroke={look.hair} strokeWidth={14} strokeLinecap="round" fill="none" transform={`rotate(${curl} 6 ${top + 4})`} />
		</g>
	);
};

export const Character7: React.FC<Props> = ({look, view, expr, frame, walking, torch, facing = 1, react = 0, noShadow}) => {
	const side = view === 'side';
	const back = view === 'back';
	const step = walking ? Math.sin(frame / 3.4) : 0;
	const bob = walking ? -Math.abs(Math.cos(frame / 3.4)) * 10 : Math.sin(frame / 20) * 2;
	const curl = expr === 'shock' ? -28 : Math.sin(frame / 15) * 4; // springs up in a panic
	// legs: one stroke each from hip to foot; walking swings the feet (side) or lifts them (front/back)
	const leg = (dx: number, phase: number) => {
		const fx = side ? dx * 0.3 + phase * 46 : dx * 1.1;
		const lift = side ? Math.max(0, -phase) * 18 : Math.max(0, phase) * 20;
		const footY = -16 - lift;
		const kneeX = side ? (dx * 0.3 + fx) / 2 + Math.abs(phase) * 14 : dx;
		return (
			<g key={dx}>
				<path d={`M${dx * 0.8},${HIP_Y} Q${kneeX},${(HIP_Y + footY) / 2} ${fx},${footY}`} stroke={look.pants} strokeWidth={LIMB + 6} strokeLinecap="round" fill="none" />
				<ellipse cx={fx + (side ? 12 : 0)} cy={footY + 6} rx={side ? 34 : 26} ry={14} fill={look.shoe} />
			</g>
		);
	};
	// arms: a single curve from shoulder to hand; the torch arm points forward
	const arm = (sx: number, swing: number, forward: boolean) => {
		const hx = forward ? sx + (side ? 170 : 150) : sx + swing * 30 + (sx < 0 ? -18 : 18);
		const hy = forward ? SHOULDER_Y + 70 : HIP_Y - 10;
		const mx = forward ? sx + 70 : sx + (sx < 0 ? -26 : 26);
		const my = forward ? SHOULDER_Y + 60 : (SHOULDER_Y + HIP_Y) / 2;
		return (
			<g key={sx}>
				<path d={`M${sx},${SHOULDER_Y + 16} Q${mx},${my} ${hx},${hy}`} stroke={look.top} strokeWidth={LIMB} strokeLinecap="round" fill="none" />
				{forward && torch ? (
					<g transform={`translate(${hx} ${hy})`}>
						<rect x={-6} y={-14} width={58} height={28} rx={8} fill="#3A3F52" />
						<rect x={46} y={-18} width={18} height={36} rx={5} fill="#C9CED8" />
					</g>
				) : null}
				<circle cx={hx} cy={hy} r={20} fill={look.skin} />
			</g>
		);
	};
	const torsoW = side ? 120 : 170;
	return (
		<g transform={`scale(${facing} 1) translate(0 ${bob}) scale(${1 + react * 0.12} ${1 - react})`}>
			{noShadow ? null : <ellipse cx={0} cy={-bob} rx={side ? 90 : 110} ry={18} fill="rgba(0,0,0,0.35)" />}
			{/* back arm and backpack behind the body */}
			{side ? arm(-10, -step, false) : null}
			{look.bag && !back ? <rect x={side ? -torsoW / 2 - 40 : -torsoW / 2 - 18} y={SHOULDER_Y + 10} width={side ? 60 : 30} height={170} rx={20} fill={look.bag} /> : null}
			{leg(-30, step)}
			{leg(30, -step)}
			{/* torso: the hoodie as one rounded block, cel shadow on one side */}
			<rect x={-torsoW / 2} y={SHOULDER_Y} width={torsoW} height={HIP_Y - SHOULDER_Y + 20} rx={44} fill={look.top} />
			<rect x={torsoW / 2 - 40} y={SHOULDER_Y + 16} width={34} height={HIP_Y - SHOULDER_Y - 10} rx={16} fill={look.topShade} opacity={0.7} />
			{back && look.bag ? <rect x={-70} y={SHOULDER_Y + 20} width={140} height={170} rx={34} fill={look.bag} /> : null}
			{look.lanyard && !back ? (
				<g>
					<path d={`M${side ? 10 : -34},${SHOULDER_Y + 6} L${side ? 30 : 0},${SHOULDER_Y + 96} L${side ? 40 : 34},${SHOULDER_Y + 6}`} stroke="#E9B83A" strokeWidth={7} fill="none" />
					<rect x={side ? 16 : -16} y={SHOULDER_Y + 92} width={30} height={40} rx={5} fill="#F2EFE6" />
				</g>
			) : null}
			{side ? arm(20, step, !!torch) : (
				<>
					{arm(-torsoW / 2 + 12, -step, false)}
					{arm(torsoW / 2 - 12, step, !!torch)}
				</>
			)}
			{/* head */}
			<rect x={-20} y={HEAD_Y + HEAD_R - 20} width={40} height={40} fill={look.skinShade} />
			<circle cx={side ? 8 : 0} cy={HEAD_Y} r={HEAD_R} fill={look.skin} />
			{side ? <circle cx={HEAD_R - 2} cy={HEAD_Y + 20} r={14} fill={look.skin} /> : null}
			{back ? null : <Face expr={expr} side={side} frame={frame} />}
			<Hair look={look} view={view} curl={curl} />
		</g>
	);
};
