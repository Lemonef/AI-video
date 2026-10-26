import type {Action, CastMember, Expr, Look, Pose} from '../types';

export type CastState = {pose: Pose; expr: Expr; look: Look; facing: 1 | -1; action: Action; framesSinceFlip: number; x: number; walking: boolean};

/**
 * Resolve a cast member at `p` (fraction of the narration line elapsed; may exceed 1 in the
 * pause after the line). Pure, so the scene component only renders what this returns.
 */
export const castState = (m: CastMember, p: number, lineSec: number, fps: number): CastState => {
	const keys = [...(m.keys ?? [])].sort((a, b) => a.at - b.at);
	const st = {pose: m.pose ?? 'idle', expr: m.expr ?? 'smile', look: m.look ?? 'center', facing: m.facing ?? 1, action: m.action ?? 'idle'} as Omit<
		CastState,
		'framesSinceFlip' | 'x' | 'walking'
	>;
	let flipAt: number | null = null;
	for (const k of keys) {
		if (k.at > p) break;
		if (k.facing !== undefined && k.facing !== st.facing) flipAt = k.at;
		if (k.pose) st.pose = k.pose;
		if (k.expr) st.expr = k.expr;
		if (k.look) st.look = k.look;
		if (k.facing !== undefined) st.facing = k.facing;
		if (k.action) st.action = k.action;
	}

	// A walk runs from p=0 to the first key that switches the action away from 'walk'.
	const walks = m.toX !== undefined && (m.action ?? 'idle') === 'walk';
	const walkEnd = walks ? keys.find((k) => k.action && k.action !== 'walk')?.at ?? 1 : 0;
	const walkP = walks && walkEnd > 0 ? Math.min(1, p / walkEnd) : 1;
	const x = walks ? m.x + (m.toX! - m.x) * walkP : m.x;

	return {
		...st,
		framesSinceFlip: flipAt === null ? Infinity : (p - flipAt) * lineSec * fps,
		x,
		walking: walks && p < walkEnd,
	};
};
