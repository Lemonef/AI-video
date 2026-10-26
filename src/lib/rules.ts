import type {Episode} from '../types';

export type RuleBreak = {scene: number; at: number};

/** First break of each rule across the episode (rules stay broken once broken). Pure. */
export const ruleBreaks = (ep: Episode): Array<RuleBreak | null> => {
	const n = ep.rules?.items.length ?? 0;
	const out: Array<RuleBreak | null> = Array.from({length: n}, () => null);
	ep.scenes.forEach((s, si) =>
		(s.breaks ?? []).forEach((b) => {
			const i = b.rule - 1;
			if (i >= 0 && i < n && out[i] === null) out[i] = {scene: si, at: b.at};
		}),
	);
	return out;
};

/** Is rule `b` broken at progress `p` of scene `si`? Returns seconds since the break, or null. */
export const brokenFor = (b: RuleBreak | null, si: number, p: number, lineSec: number): number | null => {
	if (!b || si < b.scene) return null;
	if (si > b.scene) return Infinity;
	return p >= b.at ? (p - b.at) * lineSec : null;
};
