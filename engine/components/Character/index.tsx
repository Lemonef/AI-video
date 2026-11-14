import React from 'react';
import {C} from '../../lib/tokens';
import type {Look as CastLook} from '../../registry/cast';
import type {Expr, Look, Pose} from '../../types';

// Body geometry (origin = between the feet, y grows downward). Everything else derives from these.
const HIP_Y = -150;
const SHOULDER_Y = -300;
const SHOULDER_X = 78;
const ARM_LEN = 150;
const HEAD_Y = -435;
const HEAD_R = 118;

// Arm angles in degrees, [left, right]; 0 = hanging down, + = clockwise (left arm swings outward).
const POSE_ARMS: Record<Pose, [number, number]> = {
	idle: [12, -12],
	wave: [12, -150],
	shock: [150, -150],
	yawn: [14, -168],
	armsCrossed: [-62, 62],
	point: [12, -92],
	think: [12, -135],
	hold: [-28, 28],
};

type Props = {
	look: CastLook;
	pose: Pose;
	expr: Expr;
	gaze: Look;
	frame: number; // local frame, drives idle motion
	walking?: boolean;
	talking?: boolean;
};

const Eyes: React.FC<{expr: Expr; gaze: Look; frame: number}> = ({expr, gaze, frame}) => {
	const dx = gaze === 'left' ? -16 : gaze === 'right' ? 16 : 0;
	const blink = frame % 96 < 4; // quick blink every ~3s
	const ex = 42;
	const ey = HEAD_Y + 8;
	if (expr === 'sleepy' || blink) {
		return (
			<g stroke={C.ink} strokeWidth={8} strokeLinecap="round" fill="none">
				<path d={`M${-ex - 14 + dx},${ey} q14,8 28,0`} />
				<path d={`M${ex - 14 + dx},${ey} q14,8 28,0`} />
			</g>
		);
	}
	if (expr === 'shock') {
		return (
			<g>
				{[-ex, ex].map((x) => (
					<g key={x}>
						<circle cx={x} cy={ey} r={24} fill={C.white} stroke={C.ink} strokeWidth={5} />
						<circle cx={x + dx * 0.6} cy={ey} r={8} fill={C.ink} />
					</g>
				))}
			</g>
		);
	}
	if (expr === 'angry') {
		return (
			<g>
				<circle cx={-ex + dx} cy={ey + 4} r={11} fill={C.ink} />
				<circle cx={ex + dx} cy={ey + 4} r={11} fill={C.ink} />
				<path d={`M${-ex - 22},${ey - 30} l40,14 M${ex + 22},${ey - 30} l-40,14`} stroke={C.ink} strokeWidth={8} strokeLinecap="round" />
			</g>
		);
	}
	if (expr === 'gross') {
		return (
			<g stroke={C.ink} strokeWidth={8} strokeLinecap="round" fill="none">
				<path d={`M${-ex - 14},${ey - 8} l28,8 l-28,8`} />
				<path d={`M${ex + 14},${ey - 8} l-28,8 l28,8`} />
			</g>
		);
	}
	return (
		<g fill={C.ink}>
			<circle cx={-ex + dx} cy={ey} r={12} />
			<circle cx={ex + dx} cy={ey} r={12} />
		</g>
	);
};

const Mouth: React.FC<{expr: Expr; frame: number; talking?: boolean}> = ({expr, frame, talking}) => {
	const my = HEAD_Y + 58;
	const common = {stroke: C.ink, strokeWidth: 7, strokeLinecap: 'round' as const, fill: 'none'};
	if (talking || expr === 'talk') {
		const open = 6 + Math.abs(Math.sin(frame / 2.6)) * 16;
		return <ellipse cx={0} cy={my} rx={18} ry={open} fill={C.coralDark} stroke={C.ink} strokeWidth={5} />;
	}
	switch (expr) {
		case 'shock':
			return <ellipse cx={0} cy={my + 6} rx={20} ry={26} fill={C.coralDark} stroke={C.ink} strokeWidth={5} />;
		case 'sleepy':
			return <ellipse cx={0} cy={my + 4} rx={16} ry={10 + Math.abs(Math.sin(frame / 18)) * 12} fill={C.coralDark} stroke={C.ink} strokeWidth={5} />;
		case 'sweat':
			return <path d={`M-26,${my + 6} q13,-12 26,0 q13,12 26,0`} {...common} />;
		case 'flat':
		case 'angry':
			return <path d={`M-24,${my + 4} h48`} {...common} />;
		case 'gross':
			return <path d={`M-26,${my + 10} q26,-22 52,0`} {...common} />;
		default:
			return <path d={`M-26,${my - 4} q26,26 52,0`} {...common} />;
	}
};

const HairShape: React.FC<{look: CastLook; frame: number; panic: boolean}> = ({look, frame, panic}) => {
	const c = look.hairColor;
	const top = HEAD_Y - HEAD_R;
	switch (look.hair) {
		case 'mochi': {
			// Signature curl: springs upright and jitters when Mochi panics.
			const curl = panic ? -6 + Math.sin(frame / 1.5) * 8 : 18 + Math.sin(frame / 20) * 4;
			return (
				<g fill={c}>
					<path d={`M${-HEAD_R},${HEAD_Y - 6} a${HEAD_R},${HEAD_R} 0 0 1 ${HEAD_R * 2},0 q-40,-34 -96,-22 q-40,-30 -80,4 q-30,0 -60,18 z`} />
					<path
						d={`M4,${top + 6} q-6,-46 30,-58`}
						stroke={c}
						strokeWidth={13}
						strokeLinecap="round"
						fill="none"
						transform={`rotate(${curl} 4 ${top + 6})`}
					/>
				</g>
			);
		}
		case 'bob':
			return <path fill={c} d={`M${-HEAD_R - 14},${HEAD_Y + 70} v-80 a${HEAD_R + 14},${HEAD_R + 14} 0 0 1 ${(HEAD_R + 14) * 2},0 v80 h-40 v-70 q-90,-40 -${HEAD_R * 2 - 52},-6 v76 z`} />;
		case 'curly':
			return (
				<g fill={c}>
					{Array.from({length: 9}, (_, i) => {
						const a = Math.PI * (1.05 + (i / 8) * 0.9);
						return <circle key={i} cx={Math.cos(a) * (HEAD_R + 4)} cy={HEAD_Y + Math.sin(a) * (HEAD_R + 4)} r={38} />;
					})}
				</g>
			);
		case 'spiky':
			return <path fill={c} d={`M${-HEAD_R},${HEAD_Y - 10} l20,-90 l30,40 l30,-70 l30,50 l36,-62 l26,58 l34,-44 l10,70 a${HEAD_R},${HEAD_R} 0 0 0 -${HEAD_R * 2 - 4},48 z`} />;
		case 'bun':
			return (
				<g fill={c}>
					<circle cx={0} cy={top - 22} r={44} />
					<path d={`M${-HEAD_R},${HEAD_Y - 4} a${HEAD_R},${HEAD_R} 0 0 1 ${HEAD_R * 2},0 q-${HEAD_R},-40 -${HEAD_R * 2},0 z`} />
				</g>
			);
		case 'cap':
			return (
				<g>
					<path fill={c} d={`M${-HEAD_R + 6},${HEAD_Y - 24} a${HEAD_R - 6},${HEAD_R - 6} 0 0 1 ${(HEAD_R - 6) * 2},0 z`} />
					<rect x={HEAD_R - 30} y={HEAD_Y - 34} width={90} height={20} rx={10} fill={c} />
				</g>
			);
		case 'bald':
		default:
			// Bald on top, two side tufts + a shine.
			return (
				<g>
					<ellipse cx={-HEAD_R + 8} cy={HEAD_Y - 10} rx={22} ry={36} fill={c} />
					<ellipse cx={HEAD_R - 8} cy={HEAD_Y - 10} rx={22} ry={36} fill={c} />
					<ellipse cx={-34} cy={top + 34} rx={30} ry={12} fill={C.white} opacity={0.45} />
				</g>
			);
	}
};

const Arm: React.FC<{side: -1 | 1; angle: number; color: string; skin: string}> = ({side, angle, color, skin}) => {
	const sx = side * SHOULDER_X;
	return (
		<g transform={`rotate(${angle} ${sx} ${SHOULDER_Y})`}>
			<rect x={sx - 19} y={SHOULDER_Y - 12} width={38} height={ARM_LEN} rx={19} fill={color} />
			<circle cx={sx} cy={SHOULDER_Y + ARM_LEN} r={22} fill={skin} />
		</g>
	);
};

export const Character: React.FC<Props> = ({look, pose, expr, gaze, frame, walking, talking}) => {
	const [la, ra] = POSE_ARMS[pose];
	const wiggle = pose === 'wave' ? Math.sin(frame / 3) * 18 : pose === 'shock' ? Math.sin(frame / 2) * 6 : Math.sin(frame / 22) * 3;
	const swing = walking ? Math.sin(frame / 3.2) * 24 : 0;
	const breathe = Math.sin(frame / 16) * 4;
	const panic = expr === 'shock' || expr === 'sweat';
	const headScale = look.headScale ?? 1;
	const extras = new Set(look.extras ?? []);

	return (
		<g>
			<ellipse cx={0} cy={6} rx={120} ry={22} fill={C.shadow} />
			{/* legs */}
			<g fill={look.pants}>
				<rect x={-56} y={HIP_Y} width={42} height={-HIP_Y} rx={20} transform={`rotate(${swing} -35 ${HIP_Y})`} />
				<rect x={14} y={HIP_Y} width={42} height={-HIP_Y} rx={20} transform={`rotate(${-swing} 35 ${HIP_Y})`} />
			</g>
			<g transform={`translate(0 ${breathe})`}>
				<Arm side={-1} angle={la + (walking ? -swing : 0) + wiggle * 0.3} color={look.shirt} skin={look.skin} />
				{/* body */}
				<rect x={-92} y={SHOULDER_Y - 36} width={184} height={HIP_Y + 22 - (SHOULDER_Y - 36)} rx={64} fill={look.shirt} />
				{extras.has('apron') ? <rect x={-60} y={-250} width={120} height={110} rx={20} fill={C.white} opacity={0.9} /> : null}
				{extras.has('tie') ? <path d={`M0,${SHOULDER_Y - 30} l-16,26 l16,120 l16,-120 z`} fill={C.coral} /> : null}
				{extras.has('lanyard') ? (
					<g>
						<path d={`M-40,${SHOULDER_Y - 34} L0,${SHOULDER_Y + 40} L40,${SHOULDER_Y - 34}`} stroke={C.sun} strokeWidth={8} fill="none" />
						<rect x={-24} y={SHOULDER_Y + 36} width={48} height={60} rx={8} fill={C.white} stroke={C.ink} strokeWidth={4} />
						<rect x={-14} y={SHOULDER_Y + 48} width={28} height={14} rx={4} fill={C.coral} />
					</g>
				) : null}
				{/* arms crossed sit in front of the body; otherwise the right arm also goes behind the head */}
				<Arm side={1} angle={ra + (walking ? swing : 0) + wiggle} color={look.shirt} skin={look.skin} />
				{/* head */}
				<g transform={`translate(0 ${HEAD_Y}) scale(${headScale}) translate(0 ${-HEAD_Y})`}>
					<circle cx={0} cy={HEAD_Y} r={HEAD_R} fill={look.skin} />
					{extras.has('earring') ? <circle cx={-HEAD_R + 6} cy={HEAD_Y + 40} r={10} fill={C.sun} /> : null}
					<HairShape look={look} frame={frame} panic={panic} />
					<ellipse cx={-70} cy={HEAD_Y + 44} rx={22} ry={13} fill={C.blush} opacity={0.75} />
					<ellipse cx={70} cy={HEAD_Y + 44} rx={22} ry={13} fill={C.blush} opacity={0.75} />
					<Eyes expr={expr} gaze={gaze} frame={frame} />
					{extras.has('glasses') ? (
						<g stroke={C.ink} strokeWidth={6} fill="none">
							<circle cx={-42} cy={HEAD_Y + 8} r={30} />
							<circle cx={42} cy={HEAD_Y + 8} r={30} />
							<path d={`M-12,${HEAD_Y + 8} h24`} />
						</g>
					) : null}
					{extras.has('mustache') ? <path d={`M-40,${HEAD_Y + 46} q20,-20 40,-4 q20,-16 40,4 q-20,14 -40,2 q-20,12 -40,-2 z`} fill={C.hairDark} /> : null}
					<Mouth expr={expr} frame={frame} talking={talking} />
					{expr === 'sweat' ? (
						<path d={`M${HEAD_R - 10},${HEAD_Y - 40 + (frame % 30)} q-14,22 0,30 q14,-8 0,-30`} fill={C.sky} stroke={C.skyDeep} strokeWidth={3} />
					) : null}
				</g>
			</g>
		</g>
	);
};
