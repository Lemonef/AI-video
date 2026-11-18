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
export const ROUTE_SAMPLES = 24; // quadratic route sample count for label collision

export const EU_LON0 = 10; // centre longitude, deg
export const EU_X0 = CARD_W / 2; // centre x in card px
export const EU_PX_LON = 27; // px per degree longitude
export const EU_LAT0 = 58; // reference latitude, deg
export const EU_Y0 = 160; // px at EU_LAT0
export const EU_PX_LAT = 40; // px per degree latitude
export const EU_LAT_MAX = 58.4; // northern cut so every y >= MAP_TOP; change together with MAP_TOP

export const project = (lon: number, lat: number): [number, number] => [
  Math.round(EU_X0 + (lon - EU_LON0) * EU_PX_LON),
  Math.round(EU_Y0 + (EU_LAT0 - Math.min(lat, EU_LAT_MAX)) * EU_PX_LAT),
];

export const EU_LONLAT: [number, number][][] = [
  // Mainland Europe
  [
    // Iberia
    [-5.6, 36.0], [-6.3, 36.5], [-7.0, 37.2], [-9.0, 37.0], [-8.9, 38.0],
    [-9.5, 38.7], [-8.7, 41.2], [-9.3, 42.9], [-8.4, 43.4], [-5.7, 43.6], [-3.8, 43.5],
    [-2.0, 43.3],
    // France west
    [-1.2, 45.0], [-1.2, 46.2], [-2.2, 47.2], [-4.8, 48.4], [-3.0, 48.8], [-2.0, 48.6],
    [-1.6, 49.7], [-0.3, 49.3], [0.1, 49.5], [1.1, 49.9], [1.9, 51.0],
    // North Sea + Denmark
    [2.9, 51.2], [4.1, 51.9], [4.8, 53.0], [6.8, 53.4], [8.7, 53.9], [8.4, 55.5],
    [8.6, 57.1], [10.6, 57.7], [10.2, 56.2], [10.1, 54.4],
    // Baltic
    [10.9, 54.0], [12.1, 54.2], [14.3, 53.9], [15.6, 54.2], [18.6, 54.4], [21.1, 55.7], [21.0, 56.5],
    [24.1, 57.0], [24.5, 58.4],
    // North cut and east edge (off-card side)
    [45.5, 58.4], [45.5, 35.0],
    // Turkey south + west
    [36.0, 35.0], [36.0, 36.6], [34.6, 36.8], [32.8, 36.0], [30.7, 36.9], [29.1, 36.6],
    [27.4, 37.0], [26.7, 38.4], [26.7, 39.3], [26.4, 40.0],
    // Bosporus in, Black Sea round, Bosporus out
    [28.0, 40.4], [29.1, 41.1], [29.6, 41.2], [35.1, 42.0], [36.3, 41.3], [39.7, 41.0], [41.6, 41.6],
    [39.7, 43.6], [37.8, 44.7], [36.6, 45.3], [34.0, 44.4], [33.5, 44.6], [32.6, 45.4], [32.0, 46.4],
    [30.7, 46.5], [29.7, 45.2], [28.6, 44.2], [27.9, 43.2], [27.5, 42.5], [29.0, 41.25],
    // Greece
    [26.0, 40.7], [22.9, 40.6], [22.9, 39.4], [23.7, 38.0], [23.2, 36.5],
    [22.5, 36.4], [21.3, 37.6], [20.7, 38.8],
    // Adriatic east
    [19.4, 40.4], [19.4, 41.3], [19.0, 42.1], [18.1, 42.6], [16.4, 43.5], [15.2, 44.1],
    [14.4, 45.3], [13.7, 45.6],
    // Italy boot
    [12.3, 45.4], [12.3, 44.4], [13.5, 43.6], [14.2, 42.5], [16.2, 41.9],
    [16.9, 41.1], [18.0, 40.6], [18.4, 39.8], [17.2, 40.4], [17.1, 39.1], [15.6, 38.0],
    [15.9, 38.7], [14.3, 40.8], [12.2, 41.8], [10.5, 42.9], [10.3, 43.6], [9.8, 44.1], [8.9, 44.4],
    // Riviera + Spain east, back to Gibraltar
    [7.3, 43.7], [5.9, 43.1], [5.3, 43.3], [4.6, 43.4],
    [3.9, 43.5], [3.0, 42.7], [2.2, 41.4], [1.2, 41.1], [0.9, 40.7], [-0.3, 39.5], [0.2, 38.7],
    [-0.5, 38.3], [-1.0, 37.6], [-2.5, 36.8], [-4.4, 36.7],
  ],
  // Great Britain
  [
    [-5.7, 50.1], [-5.2, 50.0], [-4.1, 50.3], [-2.5, 50.6], [-1.3, 50.8], [-0.1, 50.8], [1.4, 51.1],
    [0.9, 51.5], [1.75, 52.5], [1.0, 52.95], [0.3, 52.9], [0.1, 53.6], [-0.6, 54.5], [-1.4, 55.0],
    [-2.0, 55.8], [-2.6, 56.0], [-2.1, 57.1], [-2.0, 57.7], [-3.1, 58.4], [-5.0, 58.4], [-5.2, 57.9], [-5.7, 57.3],
    [-5.8, 56.5], [-5.6, 55.3], [-4.9, 54.7], [-3.5, 54.9], [-3.5, 54.4], [-3.0, 53.4], [-4.5, 53.4],
    [-4.7, 52.8], [-4.1, 52.4], [-5.2, 51.7], [-4.0, 51.6], [-3.0, 51.5], [-4.2, 51.2], [-5.0, 50.6],
  ],
  // Southern Norway + Sweden
  [
    [5.6, 58.4], [7.0, 58.0], [8.6, 58.3], [10.0, 58.4], [11.4, 58.4], [11.9, 57.7], [12.8, 56.6], [13.0, 55.6],
    [14.2, 55.4], [14.6, 56.1], [16.0, 56.2], [16.4, 56.7], [16.6, 57.8], [16.9, 58.4],
  ],
];

// Hand-drawn closed coastlines in card pixels (1920x1080); every point y lies below MAP_TOP.
export const COAST: Record<'europe' | 'atlantic', [number, number][][]> = {
  europe: EU_LONLAT.map((poly) => poly.map(([lon, lat]) => project(lon, lat))),
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
export type PinLabel = {x: number; y: number; anchor: 'start' | 'middle'};
export type Box = {x0: number; y0: number; x1: number; y1: number};

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

// One short two-crest wave stroke.
const wavePath = (x: number, y: number): string =>
  `M${x - WAVE_HALF} ${y} q${WAVE_QUARTER} ${-WAVE_AMP} ${WAVE_HALF} 0 q${WAVE_QUARTER} ${WAVE_AMP} ${WAVE_HALF} 0`;

const wavePaths = (): string[] =>
  Array.from({length: WAVE_COUNT}, (_, i) => wavePath(WAVE_X0 + i * WAVE_DX, WAVE_Y + (i % 2) * WAVE_DY));

// Ray-casting point-in-polygon; poly closed implicitly.
export const insidePoly = ([px, py]: [number, number], poly: [number, number][]): boolean => {
  let hit = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if ((yi > py) !== (yj > py) && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) hit = !hit;
  }
  return hit;
};

// Label box estimate: text.length * SMALL * CHAR_WIDTH wide and SMALL tall above baseline y.
export const labelBox = (text: string, x: number, y: number, anchor: 'start' | 'middle'): Box => {
  const w = text.length * SMALL * CHAR_WIDTH;
  const x0 = anchor === 'middle' ? x - w / 2 : x;
  const x1 = anchor === 'middle' ? x + w / 2 : x + w;
  const y0 = y - SMALL;
  const y1 = y;
  return {x0, y0, x1, y1};
};

const growBox = (b: Box): Box => ({
  x0: b.x0 - PIN_LABEL_GAP,
  y0: b.y0 - PIN_LABEL_GAP,
  x1: b.x1 + PIN_LABEL_GAP,
  y1: b.y1 + PIN_LABEL_GAP,
});

const quadPt = (p0: {x: number; y: number}, p1: {x: number; y: number}, p2: {x: number; y: number}, t: number): Point => {
  const u = 1 - t;
  return [
    u * u * p0.x + 2 * u * t * p1.x + t * t * p2.x,
    u * u * p0.y + 2 * u * t * p1.y + t * t * p2.y,
  ];
};

const pointInBox = ([px, py]: Point, b: Box): boolean =>
  px > b.x0 && px < b.x1 && py > b.y0 && py < b.y1;

const boxesOverlap = (a: Box, b: Box): boolean =>
  !(a.x1 <= b.x0 || a.x0 >= b.x1 || a.y1 <= b.y0 || a.y0 >= b.y1);

const PIN_HALF = PIN_SIZE / 2; // half pin icon size
const PIN_LABEL_OFFSET = PIN_HALF + PIN_LABEL_GAP; // pin centre to beside-icon label baseline x

// Place pin label trying candidates in priority order, keeping first clear candidate.
const placePinLabel = (
  text: string,
  pt: {x: number; y: number},
  other: {x: number; y: number},
  routeSamples: Point[],
  polys: [number, number][][],
): PinLabel => {
  const w = text.length * SMALL * CHAR_WIDTH;
  const awayIsRight = pt.x >= other.x;
  const pinIcon = {x: pt.x, y: pt.y - PIN_TIP};
  const otherPinIcon = {x: other.x, y: other.y - PIN_TIP};
  const otherIconBox: Box = {
    x0: otherPinIcon.x - PIN_HALF,
    x1: otherPinIcon.x + PIN_HALF,
    y0: otherPinIcon.y - PIN_HALF,
    y1: otherPinIcon.y + PIN_HALF,
  };

  // 1. below the point, centred (anchor middle), baseline = point.y + PIN_LABEL_GAP + SMALL;
  // 2. below, on the side AWAY from the other pin, always anchor 'start': x = point.x when away is right, x = point.x - box width when away is left
  // 3. beside the pin icon on the side away from the other pin, baseline at the icon centre;
  // 4. above the pin icon, centred.
  const candidates: PinLabel[] = [
    {x: pt.x, y: pt.y + PIN_LABEL_GAP + SMALL, anchor: 'middle'},
    {x: awayIsRight ? pt.x : pt.x - w, y: pt.y + PIN_LABEL_GAP + SMALL, anchor: 'start'},
    {x: awayIsRight ? pinIcon.x + PIN_LABEL_OFFSET : pinIcon.x - PIN_LABEL_OFFSET - w, y: pinIcon.y, anchor: 'start'},
    {x: pinIcon.x, y: pinIcon.y - PIN_HALF - PIN_LABEL_GAP, anchor: 'middle'},
  ];

  const tested = candidates.map((cand) => {
    const b = labelBox(text, cand.x, cand.y, cand.anchor);
    const gb = growBox(b);
    const insideCard =
      b.x0 >= CARD_MARGIN &&
      b.x1 <= CARD_W - CARD_MARGIN &&
      b.y0 >= MAP_TOP &&
      b.y1 <= CARD_H - CARD_MARGIN &&
      gb.x0 >= 0 &&
      gb.x1 <= CARD_W &&
      gb.y1 <= CARD_H;
    const clearRoute = !routeSamples.some((p) => pointInBox(p, gb));
    const clearOther = !boxesOverlap(gb, otherIconBox);
    const corners: Point[] = [
      [b.x0, b.y0],
      [b.x1, b.y0],
      [b.x1, b.y1],
      [b.x0, b.y1],
    ];
    const onLand = corners.every((p) => polys.some((poly) => insidePoly(p, poly)));
    return {
      cand,
      all: insideCard && clearRoute && clearOther && onLand,
      noLand: insideCard && clearRoute && clearOther,
      insideCard,
    };
  });

  const passAll = tested.find((t) => t.all);
  if (passAll) return passAll.cand;

  const passNoLand = tested.find((t) => t.noLand);
  if (passNoLand) return passNoLand.cand;

  const passInside = tested.find((t) => t.insideCard);
  if (passInside) return passInside.cand;

  return candidates[0];
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

  const routeSamples: Point[] = [];
  for (let i = 1; i <= ROUTE_SAMPLES; i++) {
    const t = i / (ROUTE_SAMPLES + 1);
    routeSamples.push(quadPt(el.from, ctrl, el.to, t));
  }

  const regionPolys = COAST[el.region];

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
    coast: regionPolys.map(coastPath),
    waves: el.region === 'atlantic' ? wavePaths() : [],
    fromLabel: placePinLabel(el.from.label, el.from, el.to, routeSamples, regionPolys),
    toLabel: placePinLabel(el.to.label, el.to, el.from, routeSamples, regionPolys),
    bandLabel: {x: CARD_W / 2, y: BAND_BASELINE, anchor: 'middle'},
  };
}
