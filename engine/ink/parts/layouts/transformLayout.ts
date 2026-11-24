import {LABEL, SMALL, CHAR_WIDTH, CROSS_LABEL_GAP} from './tokens';
import type {TransformEl} from '../schema';

export const CARD_W = 1920;
export const CARD_H = 1080;
export const ICON_SIZE = 320;
export const A_X = CARD_W / 4;
export const B_X = CARD_W * 3 / 4;
export const ICON_Y = 460;

export const CROSS_FRAMES = 10;
export const POP_FRAMES = 8;
export const ARROW_DRAW = 10;
export const LABEL_FADE = 6;

export const ARROW_GAP = 24;
export const ARROW_BOW = 18;
export const HEAD_LEN = 28;
export const CAPTION_GAP = 18;

export function transformLayout(el: TransformEl) {
  if (!Number.isInteger(el.step) || el.step <= 0) throw new Error('step must be a positive integer');
  if (el.step < CROSS_FRAMES) throw new Error('step shorter than the cross');
  if (el.a.icon === el.b.icon) throw new Error('a and b must be different icons');
  if (el.label !== undefined && el.label.length * LABEL * CHAR_WIDTH > CARD_W) throw new Error('label wider than the card');

  const aAt = el.at;
  const crossAt = aAt + el.step;
  const crossEnd = crossAt + CROSS_FRAMES;
  const arrowAt = aAt + 2 * el.step;
  const arrowEnd = arrowAt + ARROW_DRAW;
  const bAt = arrowEnd;
  const aLabelAt = aAt + POP_FRAMES;
  const bLabelAt = bAt + POP_FRAMES;
  const labelAt = el.label !== undefined ? bLabelAt : null;
  const end = (labelAt ?? bLabelAt) + LABEL_FADE;

  const a = {x: A_X, y: ICON_Y, size: ICON_SIZE};
  const b = {x: B_X, y: ICON_Y, size: ICON_SIZE};

  const arrowX1 = A_X + ICON_SIZE / 2 + ARROW_GAP;
  const arrowX2 = B_X - ICON_SIZE / 2 - ARROW_GAP;
  const arrowY = ICON_Y;

  const midX = (arrowX1 + arrowX2) / 2;
  const midY = arrowY - ARROW_BOW;
  const arrowD = `M${arrowX1} ${arrowY} Q${midX} ${midY} ${arrowX2} ${arrowY}`;

  const headD = `M${arrowX2 - HEAD_LEN} ${arrowY - HEAD_LEN / 2} L${arrowX2} ${arrowY} L${arrowX2 - HEAD_LEN} ${arrowY + HEAD_LEN / 2}`;

  const slotLabelY = ICON_Y + ICON_SIZE / 2 + CROSS_LABEL_GAP + LABEL; // slot a gets crossed: its label clears the cross ends
  const labelX = CARD_W / 2;
  const labelY = slotLabelY + CAPTION_GAP + LABEL;

  return {
    aAt,
    crossAt,
    crossEnd,
    arrowAt,
    arrowEnd,
    bAt,
    aLabelAt,
    bLabelAt,
    labelAt,
    end,
    a,
    b,
    arrowX1,
    arrowX2,
    arrowY,
    arrowD,
    headD,
    slotLabelY,
    labelX,
    labelY,
  };
}