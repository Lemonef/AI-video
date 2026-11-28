import {scribbleFit, scribbleHalfHeight, scribbleHalfWidth} from '../doodle';
import {LABEL, SMALL, CHAR_WIDTH} from './tokens';
import type {DocEl} from '../schema';

// Every position below lives in the paper-centred frame: origin at the paper centre, before rotation.
// x grows right, y grows down, the paper spans -w/2..w/2 by -h/2..h/2.
export const TYPE_STEP = 1; // frames per title character
export const DOC_OUTLINE = 10; // outline draw frames
export const DOC_PAD = LABEL; // inner padding from paper edge
export const LINE_FADE = 6; // line text fade-in frames
export const MARK_DRAW = 8; // mark (circle/underline) draw frames
export const BAR_DRAW = 8; // redact bar draw frames
export const STAMP_DELAY = 6; // extra delay before stamp pop after last content
export const STAMP_POP = 8; // stamp pop entrance frames
export const STAMP_TILT = -12; // stamp tilt in degrees

const BASELINE_K = 0.7; // title baseline below its cap top, in LABEL heights
const LINE_FIRST_K = 1; // first line baseline below the title baseline, in LABEL heights
const LINE_GAP_K = 1.15; // line pitch, in SMALL heights
export const TITLE_TOP = DOC_PAD + LABEL * BASELINE_K; // title baseline from the paper top edge
export const LINE_FIRST = TITLE_TOP + LABEL * LINE_FIRST_K; // first line baseline from the paper top edge
export const LINE_GAP = SMALL * LINE_GAP_K; // vertical gap between line baselines

// One hand stroke weight token: the same 9 px line cards.tsx draws every card stroke with (LINE).
export const STROKE = 9;

export const MEMO_BAND = LABEL * 0.95; // letterhead band height
export const MEMO_TEXT_K = 0.72; // MEMO baseline inside the band, in band heights
export const MEMO_TEXT_SIZE = LABEL * 0.6; // MEMO letter size
export const MEMO_DRAW = 10; // memo band fade-in frames
export const MEMO_TEXT_DELAY = 10; // MEMO letter delay after the band starts
export const RULE_GAP_K = 0.4; // card rule below the title baseline, in LABEL heights
export const RULE_DRAW = 8; // card rule draw frames

export const CERT_INSET = LABEL * 0.6; // inner certificate border inset
export const CERT_DELAY = 4; // inner border delay after the outline
export const CERT_DRAW = 12; // inner border draw frames
export const SEAL_R = SMALL * 0.9; // certificate seal radius
export const SEAL_DELAY = 8; // seal delay after the outline
export const SEAL_DRAW = 8; // seal draw frames
export const RIBBON_LEN = SMALL * 0.8; // ribbon tail length below the seal
export const RIBBON_DELAY = 10; // ribbon delay after the outline
export const RIBBON_DRAW = 8; // ribbon draw frames
const RIBBON_SPREAD_K = 0.4; // ribbon start spread from the seal centre, in seal radii
const RIBBON_START_K = 0.5; // ribbon start below the seal centre, in seal radii
const RIBBON_END_K = 0.9; // ribbon end spread from the seal centre, in seal radii

export const BAR_H = SMALL * 0.8; // redact bar thickness
const BAR_RAISE_K = 0.35; // bar centre above the line baseline, in SMALL heights

export const SHADOW_OFFSET = 8; // paper shadow offset, px right/down
export const SHADOW_OPACITY = 0.15; // paper shadow opacity

export const STAMP_PAD = LABEL * 0.8; // padding around the stamp text
export const STAMP_H = LABEL * 1.4; // stamp box height
export const STAMP_GAP = STROKE * 2; // gap between the stamp's double border
export const STAMP_TEXT_DROP = LABEL * 0.35; // stamp text baseline below the box centre
const STAMP_Y_K = 0.25; // stamp centre as a fraction of paper height: the middle of the lower half

const MARK_RY_K = 0.9; // smallest mark circle half height, in SMALL heights (scribbleFit grows it to enclose the text)
const UNDER_DROP_K = 0.35; // underline below the line baseline, in SMALL heights
const UNDER_PAD_K = 0.3; // underline run past the line text, in SMALL heights
const GLYPH_CAP_K = 0.75; // cap height above the baseline, in SMALL heights (ring must clear the next line's caps)
const GLYPH_DESC_K = 0.25; // descender below the baseline, in SMALL heights (ring must clear the line above)
const MARK_CLEAR_K = 0.1; // air between the ring and any text (its own line and neighbours), in SMALL heights
const MARK_RAISE_K = (GLYPH_CAP_K - GLYPH_DESC_K) / 2; // ring centre above the baseline = middle of the glyph box

// Hand wobble: sin/cos of the point index, never Math.random, so every frame and every render match.
export const EDGE_SEGS = 8; // points sampled per paper edge (>= 6 keeps the corners clearly uneven)
export const WOBBLE = 3; // max edge wobble amplitude, px
const JAG_A = 0.6, JAG_B = 0.4; // two harmonics of the hand wobble; they sum to 1
const SEED_RIGHT = 1, SEED_BOTTOM = 2, SEED_LEFT = 3; // per-edge seed offsets
const SEED_STAMP_INNER = 1; // inner stamp box seed offset
const SEED_RIBBON_RIGHT = 1; // right ribbon seed offset

const jag = (i: number, seed: number) => WOBBLE * (JAG_A * Math.sin(i * JAG_A + seed) + JAG_B * Math.cos(i * JAG_B + seed));

const handRect = (cx: number, cy: number, w: number, h: number, seed: number) => {
  const hw = w / 2, hh = h / 2;
  const pts: string[] = [];
  for (let i = 0; i <= EDGE_SEGS; i += 1) pts.push(`${(cx - hw + w * i / EDGE_SEGS).toFixed(1)} ${(cy - hh + jag(i, seed)).toFixed(1)}`);
  for (let i = 0; i <= EDGE_SEGS; i += 1) pts.push(`${(cx + hw + jag(i, seed + SEED_RIGHT)).toFixed(1)} ${(cy - hh + h * i / EDGE_SEGS).toFixed(1)}`);
  for (let i = 0; i <= EDGE_SEGS; i += 1) pts.push(`${(cx + hw - w * i / EDGE_SEGS).toFixed(1)} ${(cy + hh + jag(i, seed + SEED_BOTTOM)).toFixed(1)}`);
  for (let i = 0; i <= EDGE_SEGS; i += 1) pts.push(`${(cx - hw + jag(i, seed + SEED_LEFT)).toFixed(1)} ${(cy + hh - h * i / EDGE_SEGS).toFixed(1)}`);
  return `M${pts.join(' L')}Z`;
};

// Closed hand-drawn rectangle centred on (0,0), one uneven point run per edge.
export const paperPath = (w: number, h: number, seed = 0) => handRect(0, 0, w, h, seed);

// Filled hand-wobbled bar from x 0 to w, height h, centred on y 0.
export const barPath = (w: number, h: number, seed = 0) => handRect(w / 2, 0, w, h, seed);

// Filled hand-drawn letterhead band spanning -w/2..w/2, from y 0 down to y h.
export const bandPath = (w: number, h: number, seed = 0) => handRect(0, h / 2, w, h, seed);

// Double stamp box: outer at w x h, inner inset by STAMP_GAP.
export const stampBoxes = (w: number, h: number, seed = 0) => ({
  outer: paperPath(w, h, seed),
  inner: paperPath(w - 2 * STAMP_GAP, h - 2 * STAMP_GAP, seed + SEED_STAMP_INNER),
});

// Gently bowed hand stroke.
export const wobbleLine = (x1: number, y1: number, x2: number, y2: number, seed = 0) => {
  const mx = (x1 + x2) / 2 + Math.cos(seed) * WOBBLE;
  const my = (y1 + y2) / 2 + Math.sin(seed) * WOBBLE;
  return `M${x1} ${y1} Q${mx} ${my} ${x2} ${y2}`;
};

// Two short ribbon tails hanging down-left and down-right from under the seal.
export const sealRibbons = (x: number, y: number, r: number, len: number, seed = 0) => ({
  left: wobbleLine(x - r * RIBBON_SPREAD_K, y + r * RIBBON_START_K, x - r * RIBBON_END_K, y + len, seed),
  right: wobbleLine(x + r * RIBBON_SPREAD_K, y + r * RIBBON_START_K, x + r * RIBBON_END_K, y + len, seed + SEED_RIBBON_RIGHT),
});

export type DocLayout = {
  outlineEnd: number;
  titleEnd: number;
  lineAt: number[];
  markAt: number | null;
  stampAt: number | null;
  end: number;
  innerW: number;
  titleX: number;
  titleY: number;
  ruleY: number;
  lineX: number;
  lineY: number[];
  lineW: number[];
  barY: number[];
  bandTop: number;
  bandH: number;
  bandW: number;
  memoY: number;
  sealX: number;
  sealY: number;
  certW: number;
  certH: number;
  stampX: number;
  stampY: number;
  stampW: number;
  stampH: number;
  stampTextY: number;
  markX: number | null;
  markY: number | null;
  markRx: number | null;
  markTilt: number | null;
  markRy: number | null;
  underlineX1: number | null;
  underlineX2: number | null;
  underlineY: number | null;
};

export function docLayout(el: DocEl): DocLayout {
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

  const top = -el.h / 2;
  const halfH = el.h / 2;
  const titleX = -el.w / 2 + DOC_PAD;
  const lineX = titleX;
  // A memo title sits below the letterhead band; every other kind starts at the top padding.
  const contentTop = el.kind === 'memo' ? top + STROKE + MEMO_BAND : top;
  const titleY = contentTop + TITLE_TOP;
  const lineW = el.lines.map((line) => line.length * SMALL * CHAR_WIDTH);
  // A circled line gets room above and below so the ring (true drawn extent) never crosses a neighbouring line.
  const circled = el.mark?.style === 'circle' ? el.mark.line : -1;
  // Ring radii: the circled line's glyph box (plus air) sits fully inside the drawn, tilted, wobbling stroke.
  // Its width is capped at the paper room either side of the line's centre (minus the paper's stroke).
  const ringRoom = circled >= 0 ? el.w / 2 - STROKE - Math.abs(lineX + lineW[circled] / 2) : 0;
  const ring = circled >= 0 ? scribbleFit(lineW[circled] / 2 + SMALL * MARK_CLEAR_K,
    SMALL * ((GLYPH_CAP_K + GLYPH_DESC_K) / 2 + MARK_CLEAR_K), SMALL * MARK_RY_K, ringRoom) : null;
  const ringHalf = ring ? scribbleHalfHeight(ring.rx, ring.ry, ring.tilt) : 0;
  const ringPadAbove = circled > 0 ? Math.max(0, ringHalf + SMALL * (MARK_RAISE_K + GLYPH_DESC_K + MARK_CLEAR_K) - LINE_GAP) : 0;
  const ringPadBelow = circled >= 0 && circled < el.lines.length - 1
    ? Math.max(0, ringHalf - SMALL * MARK_RAISE_K + SMALL * (GLYPH_CAP_K + MARK_CLEAR_K) - LINE_GAP) : 0;
  const lineY = el.lines.map((_, i) => contentTop + LINE_FIRST + i * LINE_GAP
    + (circled >= 0 && i >= circled ? ringPadAbove : 0) + (circled >= 0 && i > circled ? ringPadBelow : 0));
  const barY = lineY.map((y) => y - SMALL * BAR_RAISE_K);
  const ruleY = titleY + LABEL * RULE_GAP_K;
  const bandTop = top + STROKE;
  const bandH = MEMO_BAND;
  const bandW = el.w - 2 * STROKE;
  const memoY = bandTop + bandH * MEMO_TEXT_K;
  const certW = el.w - 2 * CERT_INSET;
  const certH = el.h - 2 * CERT_INSET;
  const sealX = el.w / 2 - CERT_INSET - SEAL_R;
  const sealY = el.h / 2 - CERT_INSET - SEAL_R;
  const stampW = (el.stamp?.length ?? 0) * LABEL * CHAR_WIDTH + STAMP_PAD;
  const stampH = STAMP_H;
  const stampX = 0;
  const stampY = el.h * STAMP_Y_K;
  const stampTextY = STAMP_TEXT_DROP;

  const lastBaseline = lineY[lineY.length - 1];
  if (lastBaseline + SMALL > halfH) throw new Error(`doc too short for its lines: h ${el.h} cannot fit ${el.lines.length} lines`);

  if (el.stamp) {
    if (stampW > el.w - 2 * STROKE) throw new Error(`doc too narrow for the stamp: w ${el.w} cannot fit ${el.stamp}`);
    if (stampY + stampH / 2 > halfH || stampY - stampH / 2 < -halfH) throw new Error(`doc too short for the stamp: h ${el.h}`);
  }

  let markX: number | null = null;
  let markY: number | null = null;
  let markRx: number | null = null;
  let markRy: number | null = null;
  let markTilt: number | null = null;
  let underlineX1: number | null = null;
  let underlineX2: number | null = null;
  let underlineY: number | null = null;
  if (el.mark) {
    const idx = el.mark.line;
    markX = lineX + lineW[idx] / 2;
    markY = lineY[idx] - SMALL * MARK_RAISE_K;
    markRx = ring ? ring.rx : null;
    markRy = ring ? ring.ry : null;
    markTilt = ring ? ring.tilt : null;
    if (ring && markX !== null && (Math.abs(markX) + scribbleHalfWidth(ring.rx, ring.ry, ring.tilt) > el.w / 2 + STROKE
      || markY + ringHalf > halfH)) throw new Error(`doc ring leaves the paper: line ${idx} of ${el.lines[idx]} (x ${Math.round(Math.abs(markX) + scribbleHalfWidth(ring.rx, ring.ry, ring.tilt))} vs ${Math.round(el.w / 2 + STROKE)}, y ${Math.round(markY + ringHalf)} vs ${Math.round(halfH)})`);
    underlineX1 = markX - lineW[idx] / 2 - SMALL * UNDER_PAD_K;
    underlineX2 = markX + lineW[idx] / 2 + SMALL * UNDER_PAD_K;
    underlineY = lineY[idx] + SMALL * UNDER_DROP_K;
  }

  return {
    outlineEnd,
    titleEnd,
    lineAt,
    markAt,
    stampAt,
    end,
    innerW,
    titleX,
    titleY,
    ruleY,
    lineX,
    lineY,
    lineW,
    barY,
    bandTop,
    bandH,
    bandW,
    memoY,
    sealX,
    sealY,
    certW,
    certH,
    stampX,
    stampY,
    stampW,
    stampH,
    stampTextY,
    markX,
    markY,
    markRx,
    markTilt,
    markRy,
    underlineX1,
    underlineX2,
    underlineY,
  };
}
