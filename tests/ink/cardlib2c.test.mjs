// Card library job 2c contract (brief docs/briefs/ink-card-lib-2c.md): the `map` layout, in its own files.
// Written by the planner BEFORE the build and protected. The pure layout module is bundled with esbuild and
// called for real, so throws, timings and coast geometry are checked by behaviour, not by reading source text.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {buildSync} from 'esbuild';

const ROOT = new URL('../../', import.meta.url);
const read = (p) => readFileSync(new URL(p, ROOT), 'utf8');

// Single source for the contract numbers; the brief states the same values.
const SHOT = 90; // demo shot length
const ENTRY = 6; // map enters at shot.f0 + ENTRY
const TAIL = 6; // every map animation ends at least TAIL frames before its shot ends
const W = 1920, H = 1080; // card size
const PIN_BOX = 200, PIN_TIP_LOCAL = 89; // mirror of icons.tsx: icon art box 200 units, pin path tip at local y 89
const COVER = 0.6; // coast bbox must cover at least this share of the map area (both axes)
const EDGE = 0.25; // atlantic: America reaches the left EDGE share of the width, Europe the right one
const PREV_SHOTS = 5; // demo2 shots owned by job 2b; 2c appends after them
const LAYOUT = 'engine/ink/parts/layouts/mapLayout.ts';
const MAP = 'engine/ink/parts/layouts/map.tsx';
const TOUCHED = [LAYOUT, MAP, 'engine/ink/parts/schema.ts', 'engine/ink/parts/elements.tsx'];

let mod;
const load = async () => {
  if (mod) return mod;
  assert.ok(existsSync(new URL(LAYOUT, ROOT)), `${LAYOUT} missing`);
  const out = buildSync({entryPoints: [fileURLToPath(new URL(LAYOUT, ROOT))], bundle: true, format: 'esm', platform: 'node', write: false, logLevel: 'silent'});
  mod = await import(`data:text/javascript;base64,${Buffer.from(out.outputFiles[0].text).toString('base64')}`);
  return mod;
};
const base = (o = {}) => ({t: 'map', region: 'europe', from: {x: 800, y: 600, label: 'A'}, to: {x: 1100, y: 640, label: 'B'}, at: 6, dur: 30, label: 'GO', ...o});
const mainLayout = (s) => s.els.find((e) => e.t !== 'words');
// Ray-casting point-in-polygon; poly = [[x, y], ...] closed implicitly.
const inside = ([px, py], poly) => {
  let hit = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if ((yi > py) !== (yj > py) && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) hit = !hit;
  }
  return hit;
};
const onLand = (pt, region, COAST) => COAST[region].some((poly) => inside([pt.x, pt.y], poly));

test('2c: mapLayout is pure (no React, no remotion)', () => {
  const src = read(LAYOUT);
  assert.doesNotMatch(src, /from ['"](?:react|remotion)/);
  assert.doesNotMatch(src, /(?:^|[,\s])(?:LABEL|SMALL|CHAR_WIDTH)\s*=(?!=)/m, 'type tokens come from ./tokens');
});

test('2c: mapLayout throws on bad dur, same points, unknown region', async () => {
  const {mapLayout} = await load();
  assert.equal(typeof mapLayout, 'function', 'mapLayout export missing');
  const bad = {
    'dur zero': {dur: 0},
    'dur negative': {dur: -3},
    'dur fractional': {dur: 1.5},
    'dur NaN': {dur: NaN},
    'from == to': {to: {x: 800, y: 600, label: 'B'}},
    'unknown region': {region: 'asia'},
  };
  for (const [why, o] of Object.entries(bad)) assert.throws(() => mapLayout(base(o)), Error, why);
  assert.doesNotThrow(() => mapLayout(base({label: undefined})), 'label is optional');
});

test('2c: timing: coast, from-pin, route after ROUTE_LAG, to-pin on arrival, label last', async () => {
  const {mapLayout, COAST_DRAW, ROUTE_LAG} = await load();
  assert.equal(COAST_DRAW, 12);
  assert.equal(ROUTE_LAG, 4);
  const el = base();
  const L = mapLayout(el);
  assert.equal(L.coastEnd, el.at + COAST_DRAW);
  assert.equal(L.fromPinAt, L.coastEnd);
  assert.equal(L.routeAt, L.fromPinAt + ROUTE_LAG);
  assert.equal(L.routeEnd, L.routeAt + el.dur);
  assert.equal(L.toPinAt, L.routeEnd);
  assert.ok(L.labelAt > L.toPinAt, 'label fades in after the to-pin');
  assert.ok(L.end > L.labelAt && L.end > L.toPinAt, 'end covers the to-pin pop and the label fade');
  const bare = mapLayout(base({label: undefined}));
  assert.equal(bare.labelAt, null);
  assert.ok(bare.end > bare.toPinAt, 'end covers the to-pin pop');
});

test('2c: pin TIP sits on the point; route bows upward by ROUTE_BOW x distance', async () => {
  const {mapLayout, PIN_SIZE, PIN_TIP, ROUTE_BOW} = await load();
  assert.equal(PIN_SIZE, 120);
  assert.ok(Math.abs(PIN_TIP - PIN_TIP_LOCAL * PIN_SIZE / PIN_BOX) < 1e-9, 'PIN_TIP derives from the pin art tip and PIN_SIZE');
  assert.ok(ROUTE_BOW > 0 && ROUTE_BOW < 1);
  const el = base();
  const L = mapLayout(el);
  for (const k of ['from', 'to']) {
    assert.equal(L[`${k}Pin`].x, el[k].x, `${k} pin centre x`);
    assert.ok(Math.abs(L[`${k}Pin`].y + PIN_TIP - el[k].y) < 1e-9, `${k} pin tip on the point`);
  }
  const dist = Math.hypot(el.to.x - el.from.x, el.to.y - el.from.y);
  assert.ok(Math.abs(L.ctrl.x - (el.from.x + el.to.x) / 2) < 1e-9, 'control point centred');
  assert.ok(Math.abs(L.ctrl.y - ((el.from.y + el.to.y) / 2 - ROUTE_BOW * dist)) < 1e-9, 'control point bows up (smaller y)');
});

test('2c: coastlines: europe has Britain as its own island, atlantic spans both edges with 3 waves', async () => {
  const {COAST, MAP_TOP, mapLayout} = await load();
  assert.ok(MAP_TOP > 0 && MAP_TOP < H / 2, 'MAP_TOP = top label band height');
  for (const region of ['europe', 'atlantic']) {
    const polys = COAST[region];
    assert.ok(Array.isArray(polys) && polys.length >= 2, `${region} needs at least 2 land masses`);
    const pts = polys.flat();
    for (const poly of polys) assert.ok(poly.length >= 12, `${region} polygon too crude (${poly.length} points)`);
    for (const [x, y] of pts) assert.ok(x >= 0 && x <= W && y >= MAP_TOP && y <= H, `${region} point ${x},${y} outside the map area`);
    const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
    assert.ok(Math.max(...xs) - Math.min(...xs) >= COVER * W, `${region} coast too narrow`);
    assert.ok(Math.max(...ys) - Math.min(...ys) >= COVER * (H - MAP_TOP), `${region} coast too short`);
  }
  const atl = COAST.atlantic;
  assert.ok(atl.some((p) => Math.min(...p.map((q) => q[0])) <= EDGE * W), 'America on the left edge');
  assert.ok(atl.some((p) => Math.max(...p.map((q) => q[0])) >= (1 - EDGE) * W), 'Europe on the right edge');
  assert.equal(mapLayout(base({region: 'atlantic', from: {x: 1700, y: 600, label: 'A'}, to: {x: 200, y: 600, label: 'B'}})).waves.length, 3);
  assert.equal(mapLayout(base()).waves.length, 0);
});

test('2c: map wired as its own layout file', () => {
  const schema = read('engine/ink/parts/schema.ts');
  assert.match(schema, /export type MapEl\b/);
  assert.match(schema, /t:\s*'map'/);
  assert.match(schema.match(/export type El\s*=([^;]+);/)[1], /\bMapEl\b/);
  const elements = read('engine/ink/parts/elements.tsx');
  assert.match(elements, /case 'map': return <MapElement\b/);
  assert.match(elements, /from '\.\/layouts\/map'/);
  const map = read(MAP);
  assert.match(map, /export const MapElement\b/);
  assert.match(map, /\bmapLayout\(/);
  assert.match(map, /<mask\b/, 'route reveal via a mask, dashes never slide');
  assert.match(map, /['"]pin['"]/, 'pins use the pin icon');
  assert.doesNotMatch(map, /<rect\b/, 'hand-drawn paths only');
  assert.doesNotMatch(read('engine/ink/parts/cards.tsx'), /\bMapEl\b|\bmapLayout\b/, 'map stays out of cards.tsx');
});

test('2c: demo2 appends europe map, a batch-1 card, atlantic map; points on land; no back-to-back', async () => {
  const {mapLayout, COAST} = await load();
  const p = JSON.parse(read('engine/ink/parts/cardlib/demo2.json'));
  assert.equal(p.shots.length, PREV_SHOTS + 3);
  assert.equal(p.f1, p.shots.length * SHOT);
  p.shots.forEach((s, i) => {
    assert.equal(s.f0, i * SHOT, `shot ${i} f0`);
    assert.equal(s.f1, (i + 1) * SHOT, `shot ${i} f1`);
    assert.deepEqual(s.bg, {card: true}, `shot ${i} bg`);
    if (i > 0) assert.notEqual(mainLayout(s).t, mainLayout(p.shots[i - 1]).t, `shots ${i - 1} and ${i} repeat a layout`);
  });
  const [eu, mid, atl] = p.shots.slice(PREV_SHOTS).map(mainLayout);
  assert.equal(eu.t, 'map');
  assert.equal(atl.t, 'map');
  assert.ok(!['map', 'doc', 'split', 'words'].includes(mid.t), 'middle shot is another existing batch-1 layout');
  assert.equal(eu.region, 'europe');
  assert.equal(eu.label, 'VIENNA');
  assert.equal(atl.region, 'atlantic');
  assert.equal(atl.label, 'AMERICA');
  assert.ok(atl.from.x > atl.to.x, 'atlantic route goes from Europe (right) to America (left)');
  for (const [i, el] of [[PREV_SHOTS, eu], [PREV_SHOTS + 2, atl]]) {
    const s = p.shots[i];
    assert.equal(el.at, s.f0 + ENTRY, `shot ${i} map.at`);
    assert.ok(mapLayout(el).end <= s.f1 - TAIL, `shot ${i} map still animating at local ${mapLayout(el).end - s.f0}`);
    assert.ok(onLand(el.from, el.region, COAST), `shot ${i} from-point is in the sea`);
    assert.ok(onLand(el.to, el.region, COAST), `shot ${i} to-point is in the sea`);
  }
  for (const k of ['from', 'to']) assert.ok(inside([eu[k].x, eu[k].y], COAST.europe[0]), `europe ${k} must sit in the mainland (COAST.europe[0])`);
});

test('2c: touched sources are ASCII-only', () => {
  for (const f of TOUCHED) {
    const bad = [...read(f)].find((ch) => ch.charCodeAt(0) > 127);
    assert.equal(bad, undefined, `${f} has non-ASCII ${JSON.stringify(bad)}`);
  }
});
