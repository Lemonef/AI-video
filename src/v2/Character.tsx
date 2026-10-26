import React from 'react';
import type {Expr, Pose} from '../types';
import {V2} from './tokens';

/**
 * v2 rig: ~4.5 heads tall, two-segment limbs, cel shading (lit front + shadow side), moonlight rim,
 * 3/4 head turn. Origin = between the feet; y grows downward. All geometry derives from these.
 */
const HIP_Y = -390;
const THIGH = 190;
const SHIN = 175;
const SHOULDER_Y = -625;
const SHOULDER_X = 88;
const UPPER_ARM = 140;
const FOREARM = 130;
const NECK_Y = -650;
const HEAD_Y = -775;
const HEAD_R = 98;
const LIMB_W = 40;
// Torch grip: upper arm forward, elbow bent up a little. torchLens() derives the beam origin from this.
const TORCH_ARM: [number, number] = [-58, -24];
const TORCH_LEN = 74; // grip to lens along the forearm

export type Look2 = {
	skin: string;
	skinShade: string;
	hair: string;
	hairHi: string;
	top: string;
	topShade: string;
	pants: string;
	pantsShade: string;
	style: 'mochi' | 'long' | 'short';
	bag?: boolean;
	lanyard?: boolean;
};

// [shoulder, elbow] degrees per arm; 0 = hanging, + = swing toward the character's front-left.
type ArmPose = [number, number];
const POSES: Record<Pose, {l: ArmPose; r: ArmPose; torch?: boolean}> = {
	idle: {l: [6, 4], r: [-6, -4]},
	wave: {l: [6, 4], r: [-150, -30]},
	shock: {l: [130, 70], r: [-130, -70]},
	yawn: {l: [6, 4], r: [-165, -20]},
	armsCrossed: {l: [-40, -95], r: [40, 95]},
	point: {l: [6, 4], r: [-85, -5]},
	think: {l: [6, 4], r: [-40, -130]},
	hold: {l: [-25, -70], r: [25, 70]},
};

type Props = {
	look: Look2;
	pose: Pose;
	expr: Expr;
	turn: number; // -1 (3/4 left) … 0 (front) … 1 (3/4 right)
	frame: number;
	walking?: boolean;
	torch?: boolean; // holding a flashlight in the right hand, beam drawn by the scene
};

const Limb: React.FC<{x: number; y: number; a1: number; a2: number; l1: number; l2: number; color: string; shade: string; end?: React.ReactNode}> = ({x, y, a1, a2, l1, l2, color, shade, end}) => (
	<g transform={`translate(${x} ${y}) rotate(${a1})`}>
		<line x1={0} y1={0} x2={0} y2={l1} stroke={color} strokeWidth={LIMB_W} strokeLinecap="round" />
		<line x1={LIMB_W * 0.22} y1={6} x2={LIMB_W * 0.22} y2={l1 - 6} stroke={shade} strokeWidth={LIMB_W * 0.45} strokeLinecap="round" opacity={0.7} />
		<g transform={`translate(0 ${l1}) rotate(${a2})`}>
			<line x1={0} y1={0} x2={0} y2={l2} stroke={color} strokeWidth={LIMB_W - 4} strokeLinecap="round" />
			<line x1={LIMB_W * 0.2} y1={6} x2={LIMB_W * 0.2} y2={l2 - 8} stroke={shade} strokeWidth={LIMB_W * 0.4} strokeLinecap="round" opacity={0.7} />
			{end ? <g transform={`translate(0 ${l2})`}>{end}</g> : null}
		</g>
	</g>
);

const Face: React.FC<{look: Look2; expr: Expr; turn: number; frame: number}> = ({look, expr, turn, frame}) => {
	const fx = turn * 34; // features slide toward the turned side
	const blink = frame % 110 < 4 && expr !== 'shock';
	const eyeY = HEAD_Y + 6;
	const scared = expr === 'shock';
	const worried = expr === 'sweat' || expr === 'gross';
	const irisR = scared ? 6 : 10;
	const eyes = [-36, 36].map((dx) => {
		// the eye on the far side of a turn is foreshortened
		const far = Math.sign(dx) === -Math.sign(turn) && turn !== 0;
		const sx = far ? 1 - Math.abs(turn) * 0.3 : 1;
		const cx = dx * (1 - Math.abs(turn) * 0.25) + fx;
		const gaze = turn * 5;
		if (blink || expr === 'sleepy') {
			return <path key={dx} d={`M${cx - 16},${eyeY + 2} q16,10 32,0`} stroke={V2.ink} strokeWidth={6} fill="none" strokeLinecap="round" />;
		}
		return (
			<g key={dx} transform={`translate(${cx} ${eyeY}) scale(${sx} 1)`}>
				<ellipse rx={18} ry={scared ? 24 : 21} fill={V2.eyeWhite} />
				<circle cx={gaze} cy={scared ? 0 : 3} r={irisR} fill={V2.iris} />
				<circle cx={gaze + 3} cy={scared ? -3 : -1} r={3.2} fill={V2.white} />
				<path d={`M-19,-6 q19,-${scared ? 26 : 22} 38,0`} stroke={V2.ink} strokeWidth={5} fill="none" strokeLinecap="round" />
			</g>
		);
	});
	const browLift = scared ? -16 : worried ? -8 : 0;
	const browTilt = worried || scared ? 8 : expr === 'angry' ? -10 : 0;
	const mouthY = HEAD_Y + 58;
	const talkOpen = expr === 'talk' ? 6 + Math.abs(Math.sin(frame / 2.4)) * 12 : 0;
	const mouth =
		expr === 'talk' ? (
			<ellipse cx={fx} cy={mouthY} rx={13} ry={talkOpen} fill="#5A2630" />
		) : scared ? (
			<ellipse cx={fx} cy={mouthY + 4} rx={12} ry={18} fill="#5A2630" />
		) : worried ? (
			<path d={`M${fx - 18},${mouthY + 6} q9,-8 18,0 q9,8 18,0`} stroke={V2.ink} strokeWidth={5} fill="none" strokeLinecap="round" />
		) : expr === 'smile' ? (
			<path d={`M${fx - 18},${mouthY - 2} q18,16 36,0`} stroke={V2.ink} strokeWidth={5} fill="none" strokeLinecap="round" />
		) : (
			<path d={`M${fx - 14},${mouthY + 2} h28`} stroke={V2.ink} strokeWidth={5} strokeLinecap="round" />
		);
	return (
		<g>
			{eyes}
			{[-36, 36].map((dx) => (
				<path
					key={`b${dx}`}
					d={`M${dx * (1 - Math.abs(turn) * 0.25) + fx - 16},${eyeY - 34 + browLift} l32,0`}
					stroke={look.hair}
					strokeWidth={7}
					strokeLinecap="round"
					transform={`rotate(${Math.sign(dx) * browTilt} ${dx + fx} ${eyeY - 34 + browLift})`}
				/>
			))}
			<path d={`M${fx + turn * 8},${HEAD_Y + 18} q${4 + turn * 6},14 -2,22`} stroke={look.skinShade} strokeWidth={5} fill="none" strokeLinecap="round" />
			<ellipse cx={-56 + fx * 0.6} cy={HEAD_Y + 40} rx={18} ry={10} fill={V2.blush} />
			<ellipse cx={56 + fx * 0.6} cy={HEAD_Y + 40} rx={18} ry={10} fill={V2.blush} />
			{mouth}
			{worried || scared ? <path d={`M${HEAD_R - 18},${HEAD_Y - 30 + (frame % 36)} q-10,16 0,22 q10,-6 0,-22`} fill="#BFE3FF" opacity={0.9} /> : null}
		</g>
	);
};

const Hair: React.FC<{look: Look2; turn: number; frame: number; panic: boolean}> = ({look, turn, frame, panic}) => {
	const top = HEAD_Y - HEAD_R;
	const sx = turn * 10;
	if (look.style === 'long') {
		return (
			<g fill={look.hair}>
				<path d={`M${-HEAD_R - 6},${HEAD_Y + 120} V${HEAD_Y} a${HEAD_R + 6},${HEAD_R + 6} 0 0 1 ${2 * (HEAD_R + 6)},0 V${HEAD_Y + 120} h-30 V${HEAD_Y + 10} q-${HEAD_R},-70 -${2 * HEAD_R - 60},0 V${HEAD_Y + 120} z`} />
			</g>
		);
	}
	// Mochi: tousled fringe + the signature curl that springs up when panicking.
	const curl = panic ? -8 + Math.sin(frame / 1.4) * 10 : 14 + Math.sin(frame / 22) * 4;
	return (
		<g>
			<path
				fill={look.hair}
				d={`M${-HEAD_R - 4},${HEAD_Y + 14} C${-HEAD_R - 10},${HEAD_Y - 80} ${-40},${top - 24} ${10},${top - 18} C${70},${top - 14} ${HEAD_R + 14},${HEAD_Y - 60} ${HEAD_R + 4},${HEAD_Y + 18}
				L${HEAD_R - 10},${HEAD_Y - 22} L${60 + sx},${HEAD_Y - 40} L${40 + sx},${HEAD_Y - 18} L${10 + sx},${HEAD_Y - 46} L${-14 + sx},${HEAD_Y - 20} L${-44 + sx},${HEAD_Y - 44} L${-62 + sx},${HEAD_Y - 18} L${-HEAD_R + 8},${HEAD_Y - 26} Z`}
			/>
			<path d={`M${-30 + sx},${top + 4} q30,-14 60,-4`} stroke={look.hairHi} strokeWidth={8} fill="none" strokeLinecap="round" />
			{look.style === 'mochi' ? (
				<path d={`M${6},${top - 14} q-4,-50 34,-62`} stroke={look.hair} strokeWidth={13} strokeLinecap="round" fill="none" transform={`rotate(${curl} 6 ${top - 14})`} />
			) : null}
		</g>
	);
};

export const Character2: React.FC<Props> = ({look, pose, expr, turn, frame, walking, torch}) => {
	const p = POSES[pose];
	const swing = walking ? Math.sin(frame / 3.4) : 0;
	const breathe = Math.sin(frame / 18) * 3;
	const bob = walking ? -Math.abs(Math.cos(frame / 3.4)) * 10 : 0;
	const panic = expr === 'shock' || expr === 'sweat';
	// Holding a torch overrides the right arm: forward and slightly down, steady while walking.
	const rArm: ArmPose = torch ? TORCH_ARM : [p.r[0] - swing * 22, p.r[1] - (walking ? 10 : 0)];
	const lArm: ArmPose = [p.l[0] + swing * 22, p.l[1] + (walking ? 10 : 0)];
	const thighL = swing * 24;
	const thighR = -swing * 24;
	// The back-swinging leg bends at the knee.
	const kneeL = walking ? Math.max(0, -swing) * 38 : 0;
	const kneeR = walking ? Math.max(0, swing) * 38 : 0;
	const shoe = <ellipse cx={8} cy={4} rx={30} ry={16} fill={V2.shoe} />;
	const hand = <circle r={19} fill={look.skin} />;
	const torchHand = (
		<g>
			<rect x={-14} y={-6} width={28} height={70} rx={8} fill="#3A3F52" />
			<rect x={-18} y={52} width={36} height={22} rx={6} fill="#C9CED8" />
			<ellipse cx={0} cy={74} rx={16} ry={6} fill={V2.torch} />
			<circle r={19} fill={look.skin} />
		</g>
	);

	return (
		<g transform={`translate(0 ${bob})`}>
			<ellipse cx={0} cy={bob * -1 + 4} rx={110} ry={20} fill="rgba(0,0,0,0.35)" />
			{/* back arm + bag sit behind the body */}
			<Limb x={-SHOULDER_X} y={SHOULDER_Y + breathe} a1={lArm[0]} a2={lArm[1]} l1={UPPER_ARM} l2={FOREARM} color={look.top} shade={look.topShade} end={hand} />
			{look.bag ? <rect x={-112} y={SHOULDER_Y + 10} width={60} height={200} rx={24} fill={V2.bag} /> : null}
			{/* legs */}
			<Limb x={-34} y={HIP_Y} a1={thighL} a2={kneeL} l1={THIGH} l2={SHIN} color={look.pants} shade={look.pantsShade} end={shoe} />
			<Limb x={34} y={HIP_Y} a1={thighR} a2={kneeR} l1={THIGH} l2={SHIN} color={look.pants} shade={look.pantsShade} end={shoe} />
			{/* torso: hoodie with cel shadow on the right, pocket, hood */}
			<g transform={`translate(0 ${breathe})`}>
				<path d={`M${-SHOULDER_X - 14},${SHOULDER_Y + 8} Q0,${SHOULDER_Y - 26} ${SHOULDER_X + 14},${SHOULDER_Y + 8} L${78},${HIP_Y + 18} Q0,${HIP_Y + 40} ${-78},${HIP_Y + 18} Z`} fill={look.top} />
				<path d={`M${30},${SHOULDER_Y - 6} Q${SHOULDER_X + 14},${SHOULDER_Y + 2} ${SHOULDER_X + 14},${SHOULDER_Y + 8} L${78},${HIP_Y + 18} Q${40},${HIP_Y + 34} ${22},${HIP_Y + 34} Z`} fill={look.topShade} />
				<path d={`M${-56},${HIP_Y - 70} h112 l-14,64 h-84 z`} fill={look.topShade} opacity={0.55} />
				<path d={`M${-60},${SHOULDER_Y - 4} q60,44 120,0`} stroke={look.topShade} strokeWidth={14} fill="none" strokeLinecap="round" />
				{look.bag ? (
					<g stroke={V2.bagShade} strokeWidth={12} strokeLinecap="round">
						<path d={`M${-60},${SHOULDER_Y + 4} l-6,150`} />
						<path d={`M${60},${SHOULDER_Y + 4} l6,150`} />
					</g>
				) : null}
				{look.lanyard ? (
					<g>
						<path d={`M-30,${SHOULDER_Y - 2} L0,${SHOULDER_Y + 90} L30,${SHOULDER_Y - 2}`} stroke={V2.lanyard} strokeWidth={6} fill="none" />
						<rect x={-20} y={SHOULDER_Y + 86} width={40} height={52} rx={6} fill={V2.paper} />
					</g>
				) : null}
				{/* moonlight rim on the left contour */}
				<path d={`M${-SHOULDER_X - 12},${SHOULDER_Y + 14} L${-78},${HIP_Y + 14}`} stroke={V2.rim} strokeWidth={5} strokeLinecap="round" opacity={0.6} />
				{/* neck + head */}
				<rect x={-22} y={NECK_Y - 30} width={44} height={50} fill={look.skinShade} />
				<g transform={`rotate(${turn * 4} 0 ${HEAD_Y + 60})`}>
					<ellipse cx={-HEAD_R + 4 + turn * 10} cy={HEAD_Y + 10} rx={16} ry={24} fill={look.skinShade} />
					<ellipse cx={HEAD_R - 4 + turn * 10} cy={HEAD_Y + 10} rx={16} ry={24} fill={look.skinShade} />
					<ellipse cx={0} cy={HEAD_Y} rx={HEAD_R} ry={HEAD_R * 1.05} fill={look.skin} />
					<path d={`M${HEAD_R * 0.35},${HEAD_Y - HEAD_R * 0.95} A${HEAD_R},${HEAD_R * 1.05} 0 0 1 ${HEAD_R * 0.35},${HEAD_Y + HEAD_R * 0.95} Q${HEAD_R * 0.75},${HEAD_Y} ${HEAD_R * 0.35},${HEAD_Y - HEAD_R * 0.95} Z`} fill={look.skinShade} opacity={0.35} />
					<path d={`M${-HEAD_R + 2},${HEAD_Y - 30} A${HEAD_R},${HEAD_R * 1.05} 0 0 0 ${-HEAD_R * 0.6},${HEAD_Y + HEAD_R * 0.85}`} stroke={V2.rim} strokeWidth={5} fill="none" opacity={0.7} />
					<Face look={look} expr={expr} turn={turn} frame={frame} />
					<Hair look={look} turn={turn} frame={frame} panic={panic} />
				</g>
			</g>
			{/* front arm last so it overlaps the body */}
			<Limb x={SHOULDER_X} y={SHOULDER_Y + breathe} a1={rArm[0]} a2={rArm[1]} l1={UPPER_ARM} l2={FOREARM} color={look.top} shade={look.topShade} end={torch ? torchHand : hand} />
		</g>
	);
};

/** Where the torch lens sits relative to the feet, and the forearm's direction, for the scene's beam. */
export const torchLens = (): {x: number; y: number; angle: number} => {
	// Same rotation maths as <Limb>: rotate(a) turns the hanging vector (0, 1) into (-sin a, cos a).
	const a1 = (TORCH_ARM[0] * Math.PI) / 180;
	const a2 = ((TORCH_ARM[0] + TORCH_ARM[1]) * Math.PI) / 180;
	const ex = SHOULDER_X - Math.sin(a1) * UPPER_ARM;
	const ey = SHOULDER_Y + Math.cos(a1) * UPPER_ARM;
	const reach = FOREARM + TORCH_LEN;
	return {x: ex - Math.sin(a2) * reach, y: ey + Math.cos(a2) * reach, angle: 90 + TORCH_ARM[0] + TORCH_ARM[1]};
};
