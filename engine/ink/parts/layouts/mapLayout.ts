import {LABEL, SMALL, CHAR_WIDTH} from './tokens';
import type {MapEl} from '../schema';

export const CARD_W = 1920; // card width in stage px
export const CARD_H = 1080; // card height in stage px
export const COAST_DRAW = 12; // coast outline draw frames
export const ROUTE_LAG = 4; // frames from from-pin pop to route start
export const PIN_SIZE = 120; // pin icon box size in px
export const PIN_BOX = 200; // pin art box in icons.tsx; change together with the pin path
export const PIN_TIP_LOCAL = 89; // pin path tip local y inside PIN_BOX; change together with the pin path in icons.tsx
export const PIN_TIP = PIN_TIP_LOCAL * PIN_SIZE / PIN_BOX; // px from icon centre down to the tip
export const ROUTE_BOW = 0.25; // quadratic bow as a share of the point-to-point distance (bows up)
export const MAP_TOP = LABEL * 2; // height of the top label band
export const PIN_POP = 7; // from/to pin pop entrance frames
export const PIN_FADE = 4; // pin icon opacity frames
export const PIN_LABEL_FADE = 6; // pin label fade frames
export const PIN_LABEL_GAP = SMALL * 0.4; // clear space from the pin edge to its label
export const LABEL_FADE = 7; // band label fade frames
export const LABEL_GAP = 4; // clear frames between the to-pin pop and the band label
export const CARD_MARGIN = SMALL * 0.5; // keep text this far inside the card edge
export const BAND_BASELINE = MAP_TOP / 2 + LABEL * 0.35; // band label baseline (centred in the band)

const PIN_LABEL_OFFSET = PIN_SIZE / 2 + PIN_LABEL_GAP; // pin centre to its label baseline x
const PIN_LABEL_BASELINE = SMALL * 0.35; // label baseline below the pin centre

// Hand wobble: deterministic index-driven drift, never Math.random, so the same coast renders every frame.
const WOBBLE_X_AMP = 2.2; // coast x drift px
const WOBBLE_Y_AMP = 1.6; // coast y drift px
const WOBBLE_X_FREQ = 2.7; // coast x drift frequency
const WOBBLE_Y_FREQ = 1.3; // coast y drift frequency
const WOBBLE_X_PHASE = 0.6; // coast x drift phase
const WOBBLE_Y_PHASE = 0.3; // coast y drift phase

// Wave strokes in the open sea (atlantic only).
const WAVE_COUNT = 3; // short strokes across the ocean
const WAVE_W = 110; // wave stroke width px
const WAVE_HALF = WAVE_W / 2; // half a wave
const WAVE_QUARTER = WAVE_W / 4; // one wave crest
const WAVE_AMP = 12; // wave crest height px
const WAVE_X0 = CARD_W * 0.33; // first wave x
const WAVE_DX = CARD_W * 0.09; // wave spacing x
const WAVE_Y = MAP_TOP + (CARD_H - MAP_TOP) * 0.42; // first wave y
const WAVE_DY = (CARD_H - MAP_TOP) * 0.06; // alternating wave y bump

// Hand-drawn closed coastlines in card pixels (1920x1080); every point y lies below MAP_TOP.
// europe: mainland first (COAST.europe[0]) then Great Britain as its own island.
export const COAST: Record<'europe' | 'atlantic', [number, number][][]> = {
  europe: [
    [
      [430, 880], [400, 820], [418, 740], [470, 690], [560, 665], [625, 640],
      [648, 552], [712, 590], [790, 555], [860, 520], [905, 470], [950, 495],
      [1000, 455], [1055, 420], [1090, 360], [1110, 245], [1180, 205], [1300, 220],
      [1420, 285], [1500, 360], [1435, 430], [1375, 470], [1400, 545], [1480, 545],
      [1570, 585], [1620, 665], [1560, 735], [1510, 800], [1465, 870], [1390, 885],
      [1330, 830], [1295, 760], [1230, 730], [1210, 790], [1225, 880], [1190, 950],
      [1120, 930], [1085, 845], [1050, 780], [1000, 720], [930, 700], [860, 705],
      [800, 730], [760, 800], [710, 850], [640, 900], [540, 905],
    ],
    [
      [700, 535], [735, 505], [748, 455], [770, 430], [760, 390], [790, 355],
      [812, 340], [828, 372], [815, 415], [838, 450], [818, 495], [790, 530], [740, 552],
    ],
  ],
  atlantic: [
    [
      [0, 220], [80, 240], [150, 300], [210, 360], [260, 430], [300, 500],
      [285, 560], [335, 620], [310, 690], [385, 760], [420, 840], [470, 920],
      [500, 1000], [0, 1000],
    ],
    [
      [1450, 880], [1430, 800], [1460, 720], [1500, 660], [1520, 590], [1560, 560],
      [1580, 480], [1540, 420], [1560, 350], [1620, 320], [1700, 340], [1800, 380],
      [1920, 360], [1920, 1000], [1500, 1000], [1470, 940],
    ],
  ],
};

type Point = [number, number];
type PinLabel = {x: number; y: number; anchor: 'start' | 'middle'};

const mid = (a: Point, b: Point): Point => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];

// Smooth closed hand-drawn outline: drift each vertex, then join the vertex midpoints with quadratics
// through the drifted vertices (a Catmull-style loop) so the coast reads as a wobbling ink stroke.
const coastPath = (poly: [number, number][]): string => {
  const pts = poly.map((p, i): Point => [
    p[0] + Math.sin(i * WOBBLE_X_FREQ + WOBBLE_X_PHASE) * WOBBLE_X_AMP,
    p[1] + Math.cos(i * WOBBLE_Y_FREQ + WOBBLE_Y_PHASE) * WOBBLE_Y_AMP,
  ]);
  const first = mid(pts[pts.length - 1], pts[0]);
  let d = `M${first[0].toFixed(1)} ${first[1].toFixed(1)}`;
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i];
    const m = mid(a, pts[(i + 1) % pts.length]);
    d += ` Q${a[0].toFixed(1)} ${a[1].toFixed(1)} ${m[0].toFixed(1)} ${m[1].toFixed(1)}`;
  }
  return `${d}Z`;
};

// One short two-crest wave stroke.
const wavePath = (x: number, y: number): string =>
  `M${x - WAVE_HALF} ${y} q${WAVE_QUARTER} ${-WAVE_AMP} ${WAVE_HALF} 0 q${WAVE_QUARTER} ${WAVE_AMP} ${WAVE_HALF} 0`;

const wavePaths = (): string[] =>
  Array.from({length: WAVE_COUNT}, (_, i) => wavePath(WAVE_X0 + i * WAVE_DX, WAVE_Y + (i % 2) * WAVE_DY));

const labelWidth = (text: string): number => text.length * SMALL * CHAR_WIDTH;

// SMALL label beside a pin, kept inside the card (left-aligned, so the width estimate shifts it left at the edge).
const pinLabel = (text: string, pin: {x: number; y: number}): PinLabel => {
  const w = labelWidth(text);
  let x = pin.x + PIN_LABEL_OFFSET;
  if (x + w > CARD_W - CARD_MARGIN) x = pin.x - PIN_LABEL_OFFSET - w;
  x = Math.min(CARD_W - CARD_MARGIN - w, Math.max(CARD_MARGIN, x));
  const y = Math.min(CARD_H - CARD_MARGIN, Math.max(MAP_TOP + CARD_MARGIN, pin.y + PIN_LABEL_BASELINE));
  return {x, y, anchor: 'start'};
};

export type MapGeometry = {
  coastEnd: number; // coast outline finished (absolute frames)
  fromPinAt: number; // from-pin pops
  routeAt: number; // route reveal starts
  routeEnd: number; // route reveal ends
  toPinAt: number; // to-pin pops on arrival
  labelAt: number | null; // band label fades in (null without el.label)
  end: number; // every animation finished
  fromPin: {x: number; y: number}; // from pin icon centre
  toPin: {x: number; y: number}; // to pin icon centre
  ctrl: {x: number; y: number}; // quadratic route control point
  routeD: string; // route SVG path
  coast: string[]; // region coastlines as wobbly closed SVG paths
  waves: string[]; // open-sea wave strokes (atlantic only)
  fromLabel: PinLabel; // from pin SMALL label
  toLabel: PinLabel; // to pin SMALL label
  bandLabel: PinLabel; // band label in the top band
};

export function mapLayout(el: MapEl): MapGeometry {
  if (!Number.isInteger(el.dur) || el.dur <= 0) throw new Error('map dur must be a positive integer');
  if (el.from.x === el.to.x && el.from.y === el.to.y) throw new Error('map from and to must be different points');
  if (!(el.region in COAST)) throw new Error(`map region unknown: ${el.region}`);

  const coastEnd = el.at + COAST_DRAW;
  const fromPinAt = coastEnd;
  const routeAt = fromPinAt + ROUTE_LAG;
  const routeEnd = routeAt + el.dur;
  const toPinAt = routeEnd;

  const labelAt = el.label ? toPinAt + PIN_POP + LABEL_GAP : null;
  const end = labelAt !== null
    ? Math.max(labelAt + LABEL_FADE, toPinAt + PIN_LABEL_FADE)
    : Math.max(toPinAt + PIN_POP, toPinAt + PIN_LABEL_FADE);

  const fromPin = {x: el.from.x, y: el.from.y - PIN_TIP};
  const toPin = {x: el.to.x, y: el.to.y - PIN_TIP};

  const dx = el.to.x - el.from.x;
  const dy = el.to.y - el.from.y;
  const distance = Math.hypot(dx, dy);
  const ctrl = {
    x: (el.from.x + el.to.x) / 2,
    y: (el.from.y + el.to.y) / 2 - ROUTE_BOW * distance,
  };
  const routeD = `M${el.from.x} ${el.from.y} Q${ctrl.x} ${ctrl.y} ${el.to.x} ${el.to.y}`;

  return {
    coastEnd,
    fromPinAt,
    routeAt,
    routeEnd,
    toPinAt,
    labelAt,
    end,
    fromPin,
    toPin,
    ctrl,
    routeD,
    coast: COAST[el.region].map(coastPath),
    waves: el.region === 'atlantic' ? wavePaths() : [],
    fromLabel: pinLabel(el.from.label, fromPin),
    toLabel: pinLabel(el.to.label, toPin),
    bandLabel: {x: CARD_W / 2, y: BAND_BASELINE, anchor: 'middle'},
  };
}
