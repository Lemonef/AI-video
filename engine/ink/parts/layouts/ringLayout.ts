import {LABEL, SMALL, CHAR_WIDTH} from './tokens';
import type {RingEl} from '../schema';

export const CARD_W = 1920; // card stage width in px
export const CARD_H = 1080; // card stage height in px
export const RING_FILL = 0.7; // fraction of slot arc allocated to icon size
export const MAX_ICON = 160; // maximum icon size in px
export const ODD_RADIUS = 1.6; // distance of odd icon from centre in r
export const N_MIN = 3; // minimum number of icons on the ring
export const N_MAX = 12; // maximum number of icons on the ring

export const POP_FRAMES = 8; // mirrors cards.tsx, change together
export const CIRCLE_FRAMES = 10; // red circle draw duration in frames
export const DRAW_FRAMES = 10; // ring draw duration in frames
export const LABEL_FADE = 6; // label fade duration in frames, mirrors cards.tsx

export const CIRCLE_PAD = 20; // red circle radius beyond odd icon half-size in px
export const LABEL_GAP = 30; // clearance below ring icons for caption in px

export const DEG_IN_HALF_CIRCLE = 180; // degrees in half a circle
export const DEG_TO_RAD = Math.PI / DEG_IN_HALF_CIRCLE; // conversion factor from degrees to radians

export const ringLayout = (el: RingEl) => {
  if (!Number.isInteger(el.n) || el.n < N_MIN || el.n > N_MAX) {
    throw new Error(`n must be an integer between ${N_MIN} and ${N_MAX}`);
  }
  if (typeof el.r !== 'number' || !Number.isFinite(el.r) || el.r <= 0) {
    throw new Error('r must be a positive finite number');
  }
  if (!Number.isInteger(el.step) || el.step <= 0) {
    throw new Error('step must be a positive integer');
  }
  if (typeof el.odd?.angle !== 'number' || !Number.isFinite(el.odd.angle)) {
    throw new Error('odd angle must be a finite number');
  }
  if (el.label !== undefined && el.label.length * LABEL * CHAR_WIDTH > CARD_W) {
    throw new Error('label wider than the card');
  }

  const drawAt = el.at;
  const drawEnd = drawAt + DRAW_FRAMES;
  const size = Math.min(((2 * Math.PI * el.r) / el.n) * RING_FILL, MAX_ICON);

  const icons: Array<{x: number; y: number; size: number; at: number}> = [];
  for (let i = 0; i < el.n; i++) {
    const angle = -Math.PI / 2 + (2 * Math.PI * i) / el.n;
    const x = el.x + el.r * Math.cos(angle);
    const y = el.y + el.r * Math.sin(angle);
    const at = drawEnd + i * el.step;
    icons.push({x, y, size, at});
  }

  const oddRad = el.odd.angle * DEG_TO_RAD;
  const odd = {
    icon: el.odd.icon ?? el.icon,
    x: el.x + el.r * ODD_RADIUS * Math.cos(oddRad),
    y: el.y + el.r * ODD_RADIUS * Math.sin(oddRad),
    size,
    at: drawEnd + el.n * el.step,
  };

  const half = size / 2;
  for (const ic of [...icons, odd]) {
    if (ic.x - half < 0 || ic.x + half > CARD_W || ic.y - half < 0 || ic.y + half > CARD_H) {
      throw new Error('icon box leaves the card');
    }
  }

  const circleAt = odd.at + POP_FRAMES;
  const circleEnd = circleAt + CIRCLE_FRAMES;
  const circleRx = size / 2 + CIRCLE_PAD;
  const circleRy = size / 2 + CIRCLE_PAD;
  const oddLabelAt = odd.at + POP_FRAMES;
  const oddLabelY = odd.y + circleRy + SMALL; // under the red circle, not just the icon
  const labelAt = el.label !== undefined ? circleEnd : null;
  const labelX = el.x;
  const labelY = el.y + el.r + size / 2 + LABEL_GAP + LABEL;
  const lastLabelFade = (labelAt ?? oddLabelAt) + LABEL_FADE;
  const end = Math.max(circleEnd, lastLabelFade);

  return {
    ringX: el.x,
    ringY: el.y,
    ringR: el.r,
    drawAt,
    drawEnd,
    size,
    icons,
    odd,
    circleAt,
    circleEnd,
    circleRx,
    circleRy,
    oddLabelAt,
    oddLabelY,
    labelAt,
    labelX,
    labelY,
    end,
  };
};
