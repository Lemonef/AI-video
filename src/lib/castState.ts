import type {Action, CastMember, Expr, Look, Pose} from '../types';

const TURN_FRAMES = 8; // head turns ease over this many frames instead of snapping

export type CastState = {
	pose: Pose;
	expr: Expr;
	look: Look;
	facing: 1 | -1;
	action: Action;
	turn: number;
	framesSinceFlip: number;
	x: number;
	y: number;
	scale: number;
	back: boolean;
	walking: boolean;
	poseFrom: Pose; // previous pose, for eased transitions
	framesSincePose: number; // Infinity = never changed
	framesSinceExpr: number; // drives the reaction squash (anticipation + overshoot)
};

/**
 * Resolve a cast member at `p` (fraction of the narration line elapsed; negative before the line
 * starts, > 1 in the pause after it). Pure, so the scene component only renders what this returns.
 */
export const castState = (m: CastMember, p: number, lineSec: number, fps: number): CastState => {
	const keys = [...(m.keys ?? [])].sort((a, b) => a.at - b.at);
	const st = {pose: m.pose ?? 'idle', expr: m.expr ?? 'smile', look: m.look ?? 'center', facing: m.facing ?? 1, action: m.action ?? 'idle', turn: m.turn ?? 0, back: m.back ?? false} as Omit<
		CastState,
		'framesSinceFlip' | 'x' | 'y' | 'scale' | 'walking' | 'poseFrom' | 'framesSincePose' | 'framesSinceExpr'
	> & {pose: Pose; expr: Expr};
	let flipAt: number | null = null;
	let poseFrom: Pose = st.pose;
	let poseAt: number | null = null;
	let exprAt: number | null = null;
	let turnFrom = st.turn;
	let turnAt: number | null = null;
	for (const k of keys) {
		if (k.at > p) break;
		if (k.facing !== undefined && k.facing !== st.facing) flipAt = k.at;
		if (k.pose && k.pose !== st.pose) {
			poseFrom = st.pose;
			poseAt = k.at;
			st.pose = k.pose;
		}
		if (k.expr && k.expr !== st.expr) {
			exprAt = k.at;
			st.expr = k.expr;
		}
		if (k.look) st.look = k.look;
		if (k.facing !== undefined) st.facing = k.facing;
		if (k.action) st.action = k.action;
		if (k.back !== undefined && k.back !== st.back) flipAt = k.at; // turning round reads as the same squash-through-profile flip
		if (k.back !== undefined) st.back = k.back;
		if (k.turn !== undefined && k.turn !== st.turn) {
			turnFrom = st.turn;
			turnAt = k.at;
			st.turn = k.turn;
		}
	}

	// The walk runs from where 'walk' starts (base action or a key) to the next key that switches it off.
	let walkStart: number | null = (m.action ?? 'idle') === 'walk' ? 0 : null;
	let walkEnd = 1;
	for (const k of keys) {
		if (!k.action) continue;
		if (walkStart === null && k.action === 'walk') walkStart = k.at;
		else if (walkStart !== null && k.action !== 'walk' && k.at > walkStart) {
			walkEnd = k.at;
			break;
		}
	}
	const walks = (m.toX !== undefined || m.toY !== undefined || m.toScale !== undefined) && walkStart !== null;
	const walkP = walks && walkEnd > walkStart! ? Math.min(1, Math.max(0, (p - walkStart!) / (walkEnd - walkStart!))) : 0;
	// Walking into depth at a steady pace: distance (1/scale) changes linearly, so on screen he
	// slows and shrinks as he recedes. Position on screen is affine in scale under perspective.
	const s0 = m.scale ?? 1;
	const s1 = m.toScale ?? s0;
	const scale = s1 === s0 ? s0 : 1 / (1 / s0 + (1 / s1 - 1 / s0) * walkP);
	const along = s1 === s0 ? walkP : (scale - s0) / (s1 - s0);
	const x = walks ? m.x + ((m.toX ?? m.x) - m.x) * along : m.x;
	const y = walks ? m.y + ((m.toY ?? m.y) - m.y) * along : m.y;

	if (turnAt !== null) {
		const f = Math.min(1, ((p - turnAt) * lineSec * fps) / TURN_FRAMES);
		const eased = f * f * (3 - 2 * f); // smoothstep
		st.turn = turnFrom + (st.turn - turnFrom) * eased;
	}

	const since = (at: number | null) => (at === null ? Infinity : (p - at) * lineSec * fps);
	return {
		...st,
		poseFrom,
		framesSincePose: since(poseAt),
		framesSinceExpr: since(exprAt),
		framesSinceFlip: since(flipAt),
		x,
		y,
		scale,
		// walking in place counts too: on a receding path the world moves, he does not (no toX)
		walking: walkStart !== null && p >= walkStart && p < walkEnd,
	};
};
