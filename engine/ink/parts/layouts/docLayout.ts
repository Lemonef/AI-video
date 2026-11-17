import {LABEL, SMALL, CHAR_WIDTH} from './tokens';
import type {DocEl} from '../schema';

export const TYPE_STEP = 1; // frames per title character
export const DOC_OUTLINE = 10; // outline draw frames
export const DOC_PAD = LABEL; // inner padding from paper edge
export const LINE_FADE = 6; // line text fade-in frames
export const MARK_DRAW = 8; // mark (circle/underline) draw frames
export const BAR_DRAW = 8; // redact bar draw frames
export const STAMP_DELAY = 6; // extra delay before stamp pop after last content
export const STAMP_POP = 8; // stamp pop entrance frames
export const STAMP_TILT = -12; // stamp tilt in degrees
export const TITLE_TOP = DOC_PAD + LABEL * 0.3; // title baseline from top edge
export const LINE_FIRST = TITLE_TOP + LABEL * 1.1; // first line baseline from top edge
export const LINE_GAP = SMALL * 1.3; // vertical gap between line baselines

export function docLayout(el: DocEl): {
  outlineEnd: number;
  titleEnd: number;
  lineAt: number[];
  markAt: number | null;
  stampAt: number | null;
  end: number;
  innerW: number;
  titleY: number;
  lineY: number[];
  sealX: number;
  sealY: number;
} {
  if (el.lines.length === 0) throw new Error('doc lines empty');
  if (!Number.isFinite(el.w) || el.w <= 0) throw new Error('doc w must be positive and finite');
  if (!Number.isFinite(el.h) || el.h <= 0) throw new Error('doc h must be positive and finite');

  const innerW = el.w - 2 * DOC_PAD;
  if (innerW <= 0 || innerW >= el.w) throw new Error('doc inner width invalid');

  for (const line of el.lines) {
    const lineW = line.length * SMALL * CHAR_WIDTH;
    if (lineW > innerW) throw new Error(`doc line too wide: ${line}`);
  }

  if (el.redact) {
    const seen = new Set<number>();
    for (const idx of el.redact) {
      if (!Number.isInteger(idx) || idx < 0 || idx >= el.lines.length) throw new Error('doc redact index out of range');
      if (seen.has(idx)) throw new Error('doc redact duplicate index');
      seen.add(idx);
    }
  }

  if (el.mark) {
    const {line, style} = el.mark;
    if (!Number.isInteger(line) || line < 0 || line >= el.lines.length) throw new Error('doc mark.line out of range');
    if (style !== 'circle' && style !== 'underline') throw new Error('doc mark.style must be circle or underline');
    if (el.redact?.includes(line)) throw new Error('doc mark on redacted line');
  }

  const outlineEnd = el.at + DOC_OUTLINE;
  const titleEnd = outlineEnd + el.title.length * TYPE_STEP;
  const lineAt = el.lines.map((_, i) => titleEnd + i * el.step);

  const lastLineAt = lineAt[lineAt.length - 1];
  const lastLineEnd = lastLineAt + LINE_FADE;

  let markAt: number | null = null;
  if (el.mark) {
    const markLineEnd = lineAt[el.mark.line] + LINE_FADE;
    markAt = markLineEnd + MARK_DRAW;
  }

  let redactEnd = 0;
  if (el.redact && el.redact.length > 0) {
    const lastRedactIdx = Math.max(...el.redact);
    redactEnd = lineAt[lastRedactIdx] + BAR_DRAW;
  }

  let stampAt: number | null = null;
  if (el.stamp) {
    const beforeStamp = Math.max(lastLineEnd, redactEnd, markAt ?? 0);
    stampAt = beforeStamp + STAMP_DELAY;
  }

  const end = Math.max(lastLineEnd, redactEnd, markAt ?? 0, (stampAt ?? 0) + STAMP_POP);

  const titleY = TITLE_TOP;
  const lineY = el.lines.map((_, i) => LINE_FIRST + i * LINE_GAP);
  const sealX = el.w - DOC_PAD - SMALL * 1.5;
  const sealY = el.h - DOC_PAD - SMALL * 1.5;

  return {
    outlineEnd,
    titleEnd,
    lineAt,
    markAt,
    stampAt,
    end,
    innerW,
    titleY,
    lineY,
    sealX,
    sealY,
  };
}