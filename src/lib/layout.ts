// Screen-space layout guard: keeps floating elements (speech bubbles) inside the safe frame and
// clear of the fixed UI. Pure, so placement is deterministic per frame.

export type Rect = {x: number; y: number; w: number; h: number};

const overlaps = (a: Rect, b: Rect) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;

/**
 * Place a box whose bottom-centre wants to sit at (ax, ay). Clamp it into `bounds`, then step it
 * down below (or, failing that, up above) any reserved rect it overlaps.
 */
export const placeBox = (ax: number, ay: number, w: number, h: number, bounds: Rect, reserved: Rect[]): Rect => {
	const clampX = (x: number) => Math.min(Math.max(x, bounds.x), bounds.x + bounds.w - w);
	const clampY = (y: number) => Math.min(Math.max(y, bounds.y), bounds.y + bounds.h - h);
	let box: Rect = {x: clampX(ax - w / 2), y: clampY(ay - h), w, h};
	for (let pass = 0; pass < reserved.length + 1; pass++) {
		const hit = reserved.find((r) => overlaps(box, r));
		if (!hit) return box;
		const below = clampY(hit.y + hit.h + 12);
		const above = clampY(hit.y - h - 12);
		const tryBelow = {...box, y: below};
		box = !overlaps(tryBelow, hit) && !reserved.some((r) => r !== hit && overlaps(tryBelow, r)) ? tryBelow : {...box, y: above};
	}
	return box;
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
