// Card library job 2f contract (brief docs/briefs/ink-card-lib-2f.md): the `ring` layout (a circle of N,
// one outside), in its own files. Written by the planner BEFORE the build and protected. The pure layout
// module is bundled with esbuild and called for real, so throws, timings and geometry are checked by behaviour.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {buildSync} from 'esbuild';

const ROOT = new URL('../../', import.meta.url);
const read = (p) => readFileSync(new URL(p, ROOT), 'utf8');

// Single source for the contract numbers; the brief states the same values.
const SHOT = 90; // demo shot length
const ENTRY = 6; // ring enters at shot.f0 + ENTRY
const TAIL = 6; // every animation ends at least TAIL frames before its shot ends
const W = 1920, H = 1080; // card size
const DRAW = 10, CIRCLE = 10, POP = 8; // ring draw, red circle draw, icon pop (POP mirrors cards.tsx POP_FRAMES)
const FILL = 0.7, MAX_ICON = 160, ODD_R = 1.6; // spec sizing
const PREV_SHOTS = 10; // demo2 shots owned by jobs 2b..2e; 2f appends after them
const LAYOUT = 'engine/ink/parts/layouts/ringLayout.ts';
const VIEW = 'engine/ink/parts/layouts/ring.tsx';
const TOUCHED = [LAYOUT, VIEW, 'engine/ink/parts/schema.ts', 'engine/ink/parts/elements.tsx'];
const EPS = 1e-6;

let mod;
const load = async () => {
  if (mod) return mod;
  assert.ok(existsSync(new URL(LAYOUT, ROOT)), `${LAYOUT} missing`);
  const out = buildSync({entryPoints: [fileURLToPath(new URL(LAYOUT, ROOT))], bundle: true, format: 'esm', platform: 'node', write: false, logLevel: 'silent'});
  mod = await import(`data:text/javascript;base64,${Buffer.from(out.outputFiles[0].text).toString('base64')}`);
  return mod;
};
const base = (o = {}) => ({t: 'ring', x: 960, y: 470, r: 260, icon: 'hat', n: 8, at: 6, step: 4, odd: {angle: 30, label: 'OUTSIDER'}, label: 'ONE DOES NOT FIT', ...o});
const mainLayout = (s) => s.els.find((e) => e.t !== 'words');

test('2f: ringLayout is pure (no React, no remotion)', () => {
  const src = read(LAYOUT);
  assert.doesNotMatch(src, /from ['"](?:react|remotion)/);
  assert.doesNotMatch(src, /(?:^|[,\s])(?:LABEL|SMALL|CHAR_WIDTH)\s*=(?!=)/m, 'type tokens come from ./tokens');
});

test('2f: ringLayout throws on bad n, r, step, angle, overflow, label too wide', async () => {
  const {ringLayout} = await load();
  assert.equal(typeof ringLayout, 'function', 'ringLayout export missing');
  const bad = {
    'n below 3': {n: 2},
    'n above 12': {n: 13},
    'n fractional': {n: 7.5},
    'r zero': {r: 0},
    'r negative': {r: -50},
    'r infinite': {r: Infinity},
    'r NaN': {r: NaN},
    'step zero': {step: 0},
    'step fractional': {step: 2.5},
    'odd angle NaN': {odd: {angle: NaN}},
    'odd icon outside the card': {x: 1700},
    'label wider than the card': {label: 'W'.repeat(60)},
  };
  for (const [why, o] of Object.entries(bad)) assert.throws(() => ringLayout(base(o)), Error, why);
  for (const n of [3, 12]) assert.doesNotThrow(() => ringLayout(base({n})), `n ${n} allowed`);
  assert.doesNotThrow(() => ringLayout(base({label: undefined, odd: {angle: 30}})), 'labels optional');
});

test('2f: timing: ring draws, icons pop in turn, odd pops, red circle, label last', async () => {
  const {ringLayout, POP_FRAMES, CIRCLE_FRAMES} = await load();
  assert.equal(POP_FRAMES, POP);
  assert.equal(CIRCLE_FRAMES, CIRCLE);
  assert.match(read('engine/ink/parts/cards.tsx'), new RegExp(`POP_FRAMES = ${POP}\\b`), 'POP mirrors cards.tsx');
  const el = base();
  const L = ringLayout(el);
  assert.equal(L.drawAt, el.at);
  assert.equal(L.drawEnd, el.at + DRAW);
  assert.equal(L.icons.length, el.n);
  L.icons.forEach((ic, i) => assert.equal(ic.at, el.at + DRAW + i * el.step, `icon ${i} pop`));
  assert.equal(L.odd.at, el.at + DRAW + el.n * el.step, 'odd pops one step after the last ring icon');
  assert.equal(L.circleAt, L.odd.at + POP, 'red circle after the odd icon landed');
  assert.equal(L.circleEnd, L.circleAt + CIRCLE);
  assert.equal(L.oddLabelAt, L.odd.at + POP);
  assert.ok(L.labelAt >= L.circleEnd, 'label after the red circle');
  assert.ok(L.end > L.labelAt && L.end >= L.circleEnd, 'end covers the label fade');
  const bare = ringLayout(base({label: undefined}));
  assert.equal(bare.labelAt, null);
  assert.ok(bare.end >= bare.circleEnd && bare.end > bare.oddLabelAt, 'end covers the circle and odd label');
});

test('2f: geometry: n even on the ring from 12 o\'clock clockwise, odd outside at angle, all inside the card', async () => {
  const {ringLayout} = await load();
  for (const n of [4, 8, 12]) { // n 3 at angle 30 would land a ring icon under the odd one (not a contract case)
    const el = base({n});
    const L = ringLayout(el);
    const size = Math.min((2 * Math.PI * el.r / n) * FILL, MAX_ICON);
    assert.ok(Math.abs(L.size - size) < EPS, `n ${n} size`);
    L.icons.forEach((ic, i) => {
      assert.ok(Math.abs(Math.hypot(ic.x - el.x, ic.y - el.y) - el.r) < EPS, `n ${n} icon ${i} on the ring`);
      assert.equal(ic.size, L.size);
      const th = -Math.PI / 2 + (2 * Math.PI * i) / n;
      assert.ok(Math.abs(ic.x - (el.x + el.r * Math.cos(th))) < EPS && Math.abs(ic.y - (el.y + el.r * Math.sin(th))) < EPS, `n ${n} icon ${i} position (top start, clockwise)`);
    });
    assert.ok(Math.abs(L.icons[0].x - el.x) < EPS && L.icons[0].y < el.y, 'icon 0 at 12 o\'clock');
    assert.ok(L.icons[1].x > el.x, 'clockwise: icon 1 right of top');
    const oth = (el.odd.angle * Math.PI) / 180;
    assert.ok(Math.abs(L.odd.x - (el.x + el.r * ODD_R * Math.cos(oth))) < EPS, 'odd x');
    assert.ok(Math.abs(L.odd.y - (el.y + el.r * ODD_R * Math.sin(oth))) < EPS, 'odd y (0 = right, clockwise)');
    assert.equal(L.odd.size, L.size);
    assert.equal(L.odd.icon, el.icon, 'odd defaults to the ring icon');
    for (const ic of L.icons) assert.ok(Math.hypot(ic.x - L.odd.x, ic.y - L.odd.y) >= L.size, 'odd clear of every ring icon');
    for (const ic of [...L.icons, L.odd]) {
      assert.ok(ic.x - ic.size / 2 >= 0 && ic.x + ic.size / 2 <= W && ic.y - ic.size / 2 >= 0 && ic.y + ic.size / 2 <= H, 'icon inside the card');
    }
    assert.ok(L.circleRx >= L.size / 2 && L.circleRy >= L.size / 2, 'red circle surrounds the odd icon');
    assert.ok(L.oddLabelY > L.odd.y + L.size / 2 && L.oddLabelY < H, 'odd label under it');
    assert.ok(L.labelY > el.y + el.r + L.size / 2 && L.labelY < H, 'main label below the ring');
    assert.equal(L.labelX, el.x);
  }
  assert.equal(ringLayout(base({odd: {icon: 'crown', angle: 30}})).odd.icon, 'crown', 'odd icon override');
});

test('2f: ring wired as its own layout file, icons enter with the batch-1 pop', () => {
  const schema = read('engine/ink/parts/schema.ts');
  assert.match(schema, /export type RingEl\b/);
  assert.match(schema, /t:\s*'ring'/);
  assert.match(schema.match(/export type El\s*=([^;]+);/)[1], /\bRingEl\b/);
  const elements = read('engine/ink/parts/elements.tsx');
  assert.match(elements, /case 'ring': return <RingElement\b/);
  assert.match(elements, /from '\.\/layouts\/ring'/);
  const view = read(VIEW);
  assert.match(view, /export const RingElement\b/);
  assert.match(view, /\bringLayout\(/);
  assert.match(view, /<IconElement\b/, 'icons enter with the batch-1 icon pop');
  assert.match(view, /\bscribbleEllipse\(/, 'ring and red circle are hand-drawn scribble ellipses');
  assert.doesNotMatch(view, /<rect\b|<circle\b|<ellipse\b/, 'hand-drawn paths only');
  assert.doesNotMatch(view, /\bfilter=/, 'the caller boils every element; no own filter');
  assert.doesNotMatch(read('engine/ink/parts/cards.tsx'), /\bRingEl\b|\bringLayout\b/, 'ring stays out of cards.tsx');
});

test('2f: demo2 appends one ring shot after the scale; contiguous, no back-to-back', async () => {
  const {ringLayout} = await load();
  const p = JSON.parse(read('engine/ink/parts/cardlib/demo2.json'));
  assert.ok(p.shots.length >= PREV_SHOTS + 1, 'ring shot appended');
  assert.equal(p.f1, p.shots.length * SHOT);
  p.shots.forEach((s, i) => {
    assert.equal(s.f0, i * SHOT, `shot ${i} f0`);
    assert.equal(s.f1, (i + 1) * SHOT, `shot ${i} f1`);
    assert.deepEqual(s.bg, {card: true}, `shot ${i} bg`);
    if (i > 0) assert.notEqual(mainLayout(s).t, mainLayout(p.shots[i - 1]).t, `shots ${i - 1} and ${i} repeat a layout`);
  });
  const s = p.shots[PREV_SHOTS];
  const el = mainLayout(s);
  assert.equal(el.t, 'ring');
  assert.equal(el.icon, 'hat');
  assert.equal(el.n, 8);
  assert.equal(el.odd.angle, 30);
  assert.equal(el.odd.label, 'OUTSIDER');
  assert.equal(el.at, s.f0 + ENTRY);
  assert.ok(ringLayout(el).end <= s.f1 - TAIL, `ring still animating at local ${ringLayout(el).end - s.f0}`);
});

test('2f: touched sources are ASCII-only', () => {
  for (const f of TOUCHED) {
    const bad = [...read(f)].find((ch) => ch.charCodeAt(0) > 127);
    assert.equal(bad, undefined, `${f} has non-ASCII ${JSON.stringify(bad)}`);
  }
});
