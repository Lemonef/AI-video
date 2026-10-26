// Screen-space layout guard: keeps floating elements (speech bubbles) inside the safe frame and
// clear of the fixed UI. Pure, so placement is deterministic per frame.

export type Rect = {x: number; y: number; w: number; h: number};

const overlaps = (a: Rect, b: Rect) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;

const GAP = 12;

/**
 * Place a box whose bottom-centre wants to sit at (ax, ay): the free spot nearest to that anchor.
 * Candidates are the anchor itself plus positions just above / below / left / right of every
 * reserved rect, all clamped into `bounds`. Falls back to the least-overlapping candidate.
 */
export const placeBox = (ax: number, ay: number, w: number, h: number, bounds: Rect, reserved: Rect[]): Rect => {
	const clamp = (x: number, y: number): Rect => ({
		x: Math.min(Math.max(x, bounds.x), bounds.x + bounds.w - w),
		y: Math.min(Math.max(y, bounds.y), bounds.y + bounds.h - h),
		w,
		h,
	});
	const want = clamp(ax - w / 2, ay - h);
	const candidates: Rect[] = [want];
	for (const r of reserved) {
		candidates.push(
			clamp(want.x, r.y - h - GAP), // above
			clamp(want.x, r.y + r.h + GAP), // below
			clamp(r.x - w - GAP, want.y), // left
			clamp(r.x + r.w + GAP, want.y), // right
		);
	}
	const overlapArea = (c: Rect) =>
		reserved.reduce((sum, r) => sum + Math.max(0, Math.min(c.x + c.w, r.x + r.w) - Math.max(c.x, r.x)) * Math.max(0, Math.min(c.y + c.h, r.y + r.h) - Math.max(c.y, r.y)), 0);
	const dist = (c: Rect) => Math.hypot(c.x - want.x, c.y - want.y);
	const free = candidates.filter((c) => !reserved.some((r) => overlaps(c, r)));
	if (free.length) return free.reduce((best, c) => (dist(c) < dist(best) ? c : best));
	return candidates.reduce((best, c) => (overlapArea(c) < overlapArea(best) ? c : best));
};

/** Rough rendered size of a Bubble (font 52 px, padding 38/26, optional label, tail). */
export const bubbleSize = (text: string, label?: string): {w: number; h: number} => {
	const CHAR_W = 30; // average Thai glyph advance at the bubble font size
	const MAX_W = 620;
	const PAD_X = 76;
	const LINE_H = 70;
	const w = Math.min(MAX_W, text.length * CHAR_W + PAD_X);
	const lines = Math.ceil((text.length * CHAR_W + PAD_X) / MAX_W);
	return {w, h: lines * LINE_H + 52 + (label ? 50 : 0) + 56};
};
