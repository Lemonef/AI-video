import React from 'react';
import type {Expr, Pose} from '../types';
import {INK, LINE} from './tokens';

/**
 * v5 Jaab: chibi (~2.6 heads), one consistent outline weight, soft gradient shading, glossy eyes.
 * Same props contract as the v2 rig so the scene code drives both. Origin = between the feet.
 */
const HEAD_Y = -470;
const HEAD_RX = 150;
const HEAD_RY = 138;
const BODY_TOP = -330;
const HIP_Y = -150;
const SHOULDER_X = 92;
const ARM_LEN = 120;
const LEG_LEN = 120;

const POSES: Record<Pose, [number, number]> = {
	// [left, right] arm angle in degrees; 0 = hanging, + = swing toward the character's left side
	idle: [10, -10],
	wave: [10, -150],
	shock: [140, -140],
	yawn: [10, -165],
	armsCrossed: [-55, 55],
	point: [10, -85],
	think: [10, -130],
	hold: [-30, 30],
};
const TORCH_ARM = -70; // right arm forward, torch pointing ahead

export type Look5 = {skin: string; skinShade: string; hair: string; hoodie: string; hoodieShade: string; pants: string; shoe: string; bag: string; id: string};

type Props = {
	look: Look5;
	pose: Pose;
	expr: Expr;
	turn: number;
	frame: number;
	walking?: boolean;
	torch?: boolean;
	poseFrom?: Pose;
	poseBlend?: number;
	react?: number;
};

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const stroke = {stroke: INK, strokeWidth: LINE, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const};

const Defs: React.FC<{look: Look5}> = ({look}) => (
	<defs>
		<linearGradient id={`${look.id}-skin`} x1="0.2" y1="0" x2="0.8" y2="1">
			<stop offset="0" stopColor={look.skin} />
			<stop offset="1" stopColor={look.skinShade} />
		</linearGradient>
		<linearGradient id={`${look.id}-hood`} x1="0.15" y1="0" x2="0.85" y2="1">
			<stop offset="0" stopColor={look.hoodie} />
			<stop offset="1" stopColor={look.hoodieShade} />
		</linearGradient>
		<radialGradient id={`${look.id}-eye`} cx="0.4" cy="0.35" r="0.7">
			<stop offset="0" stopColor="#4A3A33" />
			<stop offset="1" stopColor="#140E0C" />
		</radialGradient>
	</defs>
);

const Eyes: React.FC<{expr: Expr; fx: number; frame: number; look: Look5}> = ({expr, fx, frame, look}) => {
	const y = HEAD_Y + 18;
	const blink = frame % 110 < 4 && expr !== 'shock';
	return (
		<g>
			{[-52, 52].map((dx) => {
				const cx = dx + fx;
				if (blink || expr === 'sleepy') return <path key={dx} d={`M${cx - 22},${y} q22,12 44,0`} fill="none" {...stroke} strokeWidth={LINE * 0.9} />;
				if (expr === 'smile') return <path key={dx} d={`M${cx - 22},${y + 6} q22,-24 44,0`} fill="none" {...stroke} strokeWidth={LINE * 0.9} />;
				const big = expr === 'shock';
				const rx = big ? 26 : 24;
				const ry = big ? 32 : 30;
				const pr = big ? 10 : 17; // shock: small pupils in wide whites
				return (
					<g key={dx}>
						<ellipse cx={cx} cy={y} rx={rx} ry={ry} fill={big ? '#FFFFFF' : `url(#${look.id}-eye)`} {...stroke} strokeWidth={LINE * 0.6} />
						{big ? <circle cx={cx} cy={y + 2} r={pr} fill="#1A1210" /> : null}
						<circle cx={cx - 7} cy={y - 10} r={big ? 4 : 8} fill="#FFFFFF" />
						<circle cx={cx + 9} cy={y + 9} r={big ? 2 : 3.5} fill="#FFFFFF" opacity={0.9} />
					</g>
				);
			})}
		</g>
	);
};

const Brows: React.FC<{expr: Expr; fx: number}> = ({expr, fx}) => {
	const y = HEAD_Y - 34 + (expr === 'shock' ? -16 : 0);
	const worried = expr === 'sweat' || expr === 'gross' || expr === 'flat';
	const innerDrop = worried ? -12 : expr === 'angry' ? 10 : 0; // worried: inner ends rise; angry: they drop
	return (
		<g fill="none" {...stroke} strokeWidth={LINE * 1.1}>
			{[-52, 52].map((dx) => {
				const cx = dx + fx;
				const s = Math.sign(dx); // outer end lies away from the face centre
				return <path key={dx} d={`M${cx + 24 * s},${y} Q${cx},${y - 8} ${cx - 24 * s},${y + innerDrop}`} />;
			})}
		</g>
	);
};

const Mouth: React.FC<{expr: Expr; fx: number; frame: number}> = ({expr, fx, frame}) => {
	const y = HEAD_Y + 82;
	if (expr === 'talk') {
		const open = 8 + Math.abs(Math.sin(frame / 2.4)) * 12;
		return <ellipse cx={fx} cy={y} rx={14} ry={open} fill="#7A2E34" {...stroke} strokeWidth={LINE * 0.6} />;
	}
	if (expr === 'shock') return <ellipse cx={fx} cy={y + 4} rx={13} ry={18} fill="#7A2E34" {...stroke} strokeWidth={LINE * 0.6} />;
	if (expr === 'smile') return <path d={`M${fx - 20},${y - 4} q20,18 40,0`} fill="none" {...stroke} strokeWidth={LINE * 0.7} />;
	if (expr === 'sweat' || expr === 'gross' || expr === 'flat') return <path d={`M${fx - 18},${y + 2} q9,-8 18,0 q9,8 18,0`} fill="none" {...stroke} strokeWidth={LINE * 0.7} />;
	return <path d={`M${fx - 12},${y} h24`} fill="none" {...stroke} strokeWidth={LINE * 0.7} />;
};

export const Character5: React.FC<Props> = ({look, pose, expr, turn, frame, walking, torch, poseFrom, poseBlend = 1, react = 0}) => {
	const to = POSES[pose];
	const from = POSES[poseFrom ?? pose];
	const swing = walking ? Math.sin(frame / 3.4) : 0;
	const la = lerp(from[0], to[0], poseBlend) + swing * 20;
	const ra = torch ? TORCH_ARM : lerp(from[1], to[1], poseBlend) - swing * 20;
	const bob = walking ? -Math.abs(Math.cos(frame / 3.4)) * 10 : 0;
	const breathe = Math.sin(frame / 18) * 3;
	const sway = walking ? 0 : Math.sin(frame / 45) * 1.2;
	const panic = expr === 'shock' || expr === 'sweat';
	const fx = turn * 30;
	const curl = (panic ? -10 + Math.sin(frame / 1.4) * 10 : 12 + Math.sin(frame / 22) * 4) - react * 260;

	const arm = (side: -1 | 1, angle: number, holding: boolean) => (
		<g transform={`translate(${side * SHOULDER_X} ${BODY_TOP + 40 + breathe}) rotate(${angle})`}>
			<path d={`M-22,0 L-18,${ARM_LEN} L18,${ARM_LEN} L22,0 Z`} fill={`url(#${look.id}-hood)`} {...stroke} />
			<circle cx={0} cy={ARM_LEN + 10} r={22} fill={`url(#${look.id}-skin)`} {...stroke} />
			{holding ? (
				<g transform={`translate(0 ${ARM_LEN + 10})`}>
					<rect x={-13} y={4} width={26} height={74} rx={8} fill="#2B3142" {...stroke} />
					<ellipse cx={0} cy={80} rx={18} ry={8} fill="#FFF3C4" {...stroke} strokeWidth={LINE * 0.6} />
				</g>
			) : null}
		</g>
	);
	const leg = (side: -1 | 1, angle: number) => (
		<g transform={`translate(${side * 40} ${HIP_Y}) rotate(${angle})`}>
			<path d={`M-26,0 L-24,${LEG_LEN} L24,${LEG_LEN} L26,0 Z`} fill={look.pants} {...stroke} />
			<path d={`M-34,${LEG_LEN - 6} q0,-14 18,-14 h30 q24,0 24,22 v8 h-72 z`} fill={look.shoe} {...stroke} />
		</g>
	);

	return (
		<g transform={`translate(0 ${bob}) scale(${1 + react * 0.5} ${1 - react}) rotate(${sway} 0 ${HIP_Y})`}>
			<Defs look={look} />
			<ellipse cx={0} cy={6 - bob} rx={120} ry={20} fill="rgba(0,0,0,0.35)" />
			{/* backpack behind */}
			<rect x={-118} y={BODY_TOP + 20} width={70} height={150} rx={26} fill={look.bag} {...stroke} transform={`rotate(${(walking ? Math.sin(frame / 3.4 - 0.8) * 5 : 0) + react * 30} -83 ${BODY_TOP + 20})`} />
			{arm(-1, la, false)}
			{leg(-1, swing * 18)}
			{leg(1, -swing * 18)}
			{/* hoodie body */}
			<g transform={`translate(0 ${breathe})`}>
				<path d={`M${-SHOULDER_X - 12},${BODY_TOP + 30} Q${-SHOULDER_X},${BODY_TOP - 6} -40,${BODY_TOP - 10} L40,${BODY_TOP - 10} Q${SHOULDER_X},${BODY_TOP - 6} ${SHOULDER_X + 12},${BODY_TOP + 30} L${SHOULDER_X - 4},${HIP_Y + 20} Q0,${HIP_Y + 34} ${-SHOULDER_X + 4},${HIP_Y + 20} Z`} fill={`url(#${look.id}-hood)`} {...stroke} />
				<path d={`M-50,${HIP_Y - 50} h100 l-10,54 h-80 z`} fill={look.hoodieShade} {...stroke} strokeWidth={LINE * 0.7} />
				<path d={`M-18,${BODY_TOP - 6} v70 M18,${BODY_TOP - 6} v70`} {...stroke} strokeWidth={LINE * 0.8} fill="none" />
				<path d={`M-58,${BODY_TOP - 8} q58,48 116,0`} fill="none" {...stroke} strokeWidth={LINE * 0.9} />
			</g>
			{arm(1, ra, !!torch)}
			{/* head */}
			<g transform={`rotate(${turn * 4} 0 ${HEAD_Y + 120}) translate(0 ${breathe * 0.6})`}>
				<ellipse cx={-HEAD_RX + 6 + fx * 0.3} cy={HEAD_Y + 26} rx={26} ry={32} fill={`url(#${look.id}-skin)`} {...stroke} />
				<ellipse cx={HEAD_RX - 6 + fx * 0.3} cy={HEAD_Y + 26} rx={26} ry={32} fill={`url(#${look.id}-skin)`} {...stroke} />
				<ellipse cx={0} cy={HEAD_Y} rx={HEAD_RX} ry={HEAD_RY} fill={`url(#${look.id}-skin)`} {...stroke} />
				<ellipse cx={-80 + fx * 0.6} cy={HEAD_Y + 62} rx={26} ry={15} fill="#F38C8C" opacity={0.55} />
				<ellipse cx={80 + fx * 0.6} cy={HEAD_Y + 62} rx={26} ry={15} fill="#F38C8C" opacity={0.55} />
				<Eyes expr={expr} fx={fx} frame={frame} look={look} />
				<Brows expr={expr} fx={fx} />
				<ellipse cx={fx} cy={HEAD_Y + 50} rx={9} ry={7} fill={look.skinShade} />
				<Mouth expr={expr} fx={fx} frame={frame} />
				{/* hair cap + fringe + the curl */}
				<path
					d={`M${-HEAD_RX - 8},${HEAD_Y + 10} C${-HEAD_RX - 10},${HEAD_Y - 120} ${-60},${HEAD_Y - HEAD_RY - 40} ${10},${HEAD_Y - HEAD_RY - 28} C${90},${HEAD_Y - HEAD_RY - 20} ${HEAD_RX + 20},${HEAD_Y - 90} ${HEAD_RX + 8},${HEAD_Y + 14}
					L${HEAD_RX - 22},${HEAD_Y - 48} Q${60 + fx},${HEAD_Y - 40} ${30 + fx},${HEAD_Y - 66} Q${0 + fx},${HEAD_Y - 36} ${-40 + fx},${HEAD_Y - 62} Q${-80 + fx},${HEAD_Y - 40} ${-HEAD_RX + 18},${HEAD_Y - 46} Z`}
					fill={look.hair}
					{...stroke}
				/>
				<path d={`M${-30 + fx},${HEAD_Y - HEAD_RY - 10} q40,-16 80,-6`} stroke="#3C4558" strokeWidth={10} fill="none" strokeLinecap="round" />
				<path d={`M8,${HEAD_Y - HEAD_RY - 26} q-6,-58 38,-70 q30,-6 26,22`} fill="none" stroke={INK} strokeWidth={LINE + 10} strokeLinecap="round" transform={`rotate(${curl} 8 ${HEAD_Y - HEAD_RY - 26})`} />
				<path d={`M8,${HEAD_Y - HEAD_RY - 26} q-6,-58 38,-70 q30,-6 26,22`} fill="none" stroke={look.hair} strokeWidth={10} strokeLinecap="round" transform={`rotate(${curl} 8 ${HEAD_Y - HEAD_RY - 26})`} />
				{panic ? <path d={`M${HEAD_RX - 26},${HEAD_Y - 50 + (frame % 36)} q-12,18 0,26 q12,-8 0,-26`} fill="#BFE3FF" {...stroke} strokeWidth={LINE * 0.5} /> : null}
			</g>
		</g>
	);
};

/** Lens position + direction for the scene's torch beam (matches TORCH_ARM). */
export const torchLens5 = (): {x: number; y: number; angle: number} => {
	const a = (TORCH_ARM * Math.PI) / 180;
	const reach = ARM_LEN + 10 + 80;
	return {x: SHOULDER_X - Math.sin(a) * reach, y: BODY_TOP + 40 + Math.cos(a) * reach, angle: 90 + TORCH_ARM};
};

