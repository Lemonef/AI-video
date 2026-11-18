import {LABEL, SMALL, CHAR_WIDTH} from './tokens';
import type {GridEl} from '../schema';

export const CARD_W = 1920; // card stage width in px
export const CARD_H = 1080; // card stage height in px
export const GRID_FILL = 0.8; // icon size per pitch
export const MAX_ICON = 200; // maximum icon size in px
export const COLS_MIN = 2; // minimum columns
export const COLS_MAX = 6; // maximum columns
export const ROWS_MIN = 1; // minimum rows
export const ROWS_MAX = 4; // maximum rows

export const POP_FRAMES = 8; // mirrors cards.tsx, change together
export const CIRCLE_FRAMES = 10; // red circle draw duration in frames
export const LABEL_FADE = 6; // label fade duration in frames, mirrors cards.tsx

export const CIRCLE_PAD = 20; // red circle radius beyond the odd icon half-size in px
export const LABEL_GAP = 30; // clearance below grid icons for caption in px

export const gridLayout = (el: GridEl) => {
  if (!Number.isInteger(el.cols) || el.cols < COLS_MIN || el.cols > COLS_MAX) {
    throw new Error(`cols must be an integer between ${COLS_MIN} and ${COLS_MAX}`);
  }
  if (!Number.isInteger(el.rows) || el.rows < ROWS_MIN || el.rows > ROWS_MAX) {
    throw new Error(`rows must be an integer between ${ROWS_MIN} and ${ROWS_MAX}`);
  }
  if (!Number.isInteger(el.odd.index) || el.odd.index < 0 || el.odd.index >= el.cols * el.rows) {
    throw new Error('odd.index must be an integer in 0..cols*rows-1');
  }
  if (el.odd.icon === el.icon) {
    throw new Error('odd.icon must differ from the grid icon');
  }
  if (typeof el.w !== 'number' || !Number.isFinite(el.w) || el.w <= 0) {
    throw new Error('w must be a positive finite number');
  }
  if (!Number.isInteger(el.step) || el.step <= 0) {
    throw new Error('step must be a positive integer');
  }

  const pitch = el.w / el.cols;
  const size = Math.min(pitch * GRID_FILL, MAX_ICON);
  const half = size / 2;

  const cells: Array<{x: number; y: number; size: number; icon: string; at: number}> = [];
  for (let i = 0; i < el.cols * el.rows; i++) {
    const col = i % el.cols;
    const row = Math.floor(i / el.cols);
    const x = el.x + (col - (el.cols - 1) / 2) * pitch;
    const y = el.y + (row - (el.rows - 1) / 2) * pitch;
    const icon = i === el.odd.index ? el.odd.icon : el.icon;
    const at = el.at + i * el.step;
    cells.push({x, y, size, icon, at});
  }

  for (const c of cells) {
    if (c.x - half < 0 || c.x + half > CARD_W || c.y - half < 0 || c.y + half > CARD_H) {
      throw new Error('cell box leaves the card');
    }
  }

  const oddCell = cells[el.odd.index];
  const circleX = oddCell.x;
  const circleY = oddCell.y;
  const lastPop = el.at + (el.cols * el.rows - 1) * el.step;
  const circleAt = lastPop + POP_FRAMES;
  const circleEnd = circleAt + CIRCLE_FRAMES;
  const circleRx = size / 2 + CIRCLE_PAD;
  const circleRy = size / 2 + CIRCLE_PAD;

  let labelAt: number | null = null;
  let labelX: number | null = null;
  let labelY: number | null = null;
  if (el.label !== undefined) {
    if (el.label.length * LABEL * CHAR_WIDTH > CARD_W) {
      throw new Error('label wider than the card');
    }
    labelAt = circleEnd;
    labelX = el.x;
    const blockBottom = el.y + (el.rows / 2) * pitch;
    labelY = blockBottom + LABEL_GAP + LABEL;
    if (labelY + LABEL > CARD_H) {
      throw new Error('label below the card');
    }
  }

  const end = labelAt !== null ? labelAt + LABEL_FADE : circleEnd;

  return {
    pitch,
    size,
    cells,
    circleX,
    circleY,
    circleAt,
    circleEnd,
    circleRx,
    circleRy,
    labelAt,
    labelX,
    labelY,
    end,
  };
};