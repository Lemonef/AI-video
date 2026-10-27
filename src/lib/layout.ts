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

// Bubble metrics (font 52 px, padding 38/26). Shared by sizing and rendering so the placed box is
// exactly the drawn one.
export const BUBBLE = {charW: 30, maxW: 620, padX: 88, lineH: 70, padY: 52, label: 50, tail: 56} as const; // padX = 2x38 padding + 2x6 border
// Thai vowels and tone marks stacked above/below a letter take no horizontal space.
const COMBINING = /[ัิ-ฺ็-๎]/g;
export const textAdvance = (s: string, charW: number) => s.replace(COMBINING, '').length * charW;

/**
 * Split text into lines that break ONLY at the spaces the script put between phrases. Browsers
 * break Thai at any dictionary word boundary ("แม่หาย|แล้ว"), which splits a phrase in two.
 */
export const phraseLines = (text: string, maxW: number, charW: number): string[] => {
	const lines: string[] = [];
	let cur = '';
	for (const word of text.split(/\s+/).filter(Boolean)) {
		const next = cur ? `${cur} ${word}` : word;
		if (cur && textAdvance(next, charW) > maxW) {
			lines.push(cur);
			cur = word;
		} else {
			cur = next;
		}
	}
	if (cur) lines.push(cur);
	return lines;
};

/** Rendered size of a Bubble: its phrase lines, padding, optional label and tail. */
export const bubbleSize = (text: string, label?: string, tail = true): {w: number; h: number; lines: string[]} => {
	const lines = phraseLines(text, BUBBLE.maxW - BUBBLE.padX, BUBBLE.charW);
	const w = Math.min(BUBBLE.maxW, Math.max(...lines.map((l) => textAdvance(l, BUBBLE.charW))) + BUBBLE.padX);
	return {w, h: lines.length * BUBBLE.lineH + BUBBLE.padY + (label ? BUBBLE.label : 0) + (tail ? BUBBLE.tail : 0), lines};
};
