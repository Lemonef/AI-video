// Card library job 2g contract (brief docs/briefs/ink-card-lib-2g.md): the `grid` layout (a block of the
// same icon with one odd cell circled in red), in its own files. Written by the planner BEFORE the build and
// protected. The pure layout module is bundled with esbuild and called for real, so throws, timings and
// geometry are checked by behaviour.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {buildSync} from 'esbuild';

const ROOT = new URL('../../', import.meta.url);
const read = (p) => readFileSync(new URL(p, ROOT), 'utf8');

// Single source for the contract numbers; the brief states the same values.
const SHOT = 90; // demo shot length
const ENTRY = 6; // grid enters at shot.f0 + ENTRY
const TAIL = 6; // every animation ends at least TAIL frames before its shot ends
const W = 1920, H = 1080; // card size
const CIRCLE = 10, POP = 8; // red circle draw, icon pop (POP mirrors cards.tsx POP_FRAMES)
const FILL = 0.8, MAX_ICON = 200; // spec sizing: size = min(pitch * FILL, MAX_ICON)
const PREV_SHOTS = 11; // demo2 shots owned by jobs 2b..2f; 2g appends after them
const LAYOUT = 'engine/ink/parts/layouts/gridLayout.ts';
const VIEW = 'engine/ink/parts/layouts/grid.tsx';
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
const base = (o = {}) => ({t: 'grid', x: 960, y: 440, w: 880, icon: 'mask', cols: 4, rows: 3, odd: {index: 6, icon: 'badge'}, at: 6, step: 4, label: 'ONE HONEST MAN', ...o});
const mainLayout = (s) => s.els.find((e) => e.t !== 'words');

test('2g: gridLayout is pure (no React, no remotion)', () => {
  const src = read(LAYOUT);
  assert.doesNotMatch(src, /from ['"](?:react|remotion)/);
  assert.doesNotMatch(src, /(?:^|[,\s])(?:LABEL|SMALL|CHAR_WIDTH)\s*=(?!=)/m, 'type tokens come from ./tokens');
});

test('2g: gridLayout throws on bad cols, rows, odd index, w, step, same odd icon, overflow, label too wide', async () => {
  const {gridLayout} = await load();
  assert.equal(typeof gridLayout, 'function', 'gridLayout export missing');
  const bad = {
    'cols below 2': {cols: 1},
    'cols above 6': {cols: 7},
    'cols fractional': {cols: 3.5},
    'rows below 1': {rows: 0},
    'rows above 4': {rows: 5},
    'rows fractional': {rows: 2.5},
    'odd index negative': {odd: {index: -1, icon: 'badge'}},
    'odd index past the last cell': {odd: {index: 12, icon: 'badge'}},
    'odd index fractional': {odd: {index: 2.5, icon: 'badge'}},
    'odd icon same as the grid icon': {odd: {index: 6, icon: 'mask'}},
    'w zero': {w: 0},
    'w NaN': {w: NaN},
    'step zero': {step: 0},
    'step fractional': {step: 2.5},
    'grid leaves the card': {x: 1700},
    'label wider than the card': {label: 'W'.repeat(60)},
  };
  for (const [why, o] of Object.entries(bad)) assert.throws(() => gridLayout(base(o)), Error, why);
  for (const [cols, rows] of [[2, 1], [6, 4]]) assert.doesNotThrow(() => gridLayout(base({cols, rows, w: 600, y: 480, odd: {index: 0, icon: 'badge'}})), `${cols}x${rows} allowed`);
  assert.doesNotThrow(() => gridLayout(base({label: undefined})), 'label optional');
});

test('2g: timing: cells pop row-major in turn, red circle after the last pop, label last', async () => {
  const {gridLayout, POP_FRAMES, CIRCLE_FRAMES} = await load();
  assert.equal(POP_FRAMES, POP);
  assert.equal(CIRCLE_FRAMES, CIRCLE);
  assert.match(read('engine/ink/parts/cards.tsx'), new RegExp(`POP_FRAMES = ${POP}\\b`), 'POP mirrors cards.tsx');
  const el = base();
  const L = gridLayout(el);
  assert.equal(L.cells.length, el.cols * el.rows);
  L.cells.forEach((c, i) => assert.equal(c.at, el.at + i * el.step, `cell ${i} pop`));
  const lastPop = el.at + (el.cols * el.rows - 1) * el.step;
  assert.equal(L.circleAt, lastPop + POP, 'red circle after the last icon landed');
  assert.equal(L.circleEnd, L.circleAt + CIRCLE);
  assert.equal(L.labelAt, L.circleEnd, 'label after the red circle');
  assert.ok(L.end > L.labelAt && L.end >= L.circleEnd, 'end covers the label fade');
  const bare = gridLayout(base({label: undefined}));
  assert.equal(bare.labelAt, null);
  assert.equal(bare.end, bare.circleEnd);
});

test('2g: geometry: block centred on x,y, square pitch w/cols, row-major, odd cell swapped and circled, all inside', async () => {
  const {gridLayout} = await load();
  for (const [cols, rows, w] of [[4, 3, 880], [2, 1, 600], [6, 4, 900], [3, 2, 1200]]) {
    const el = base({cols, rows, w, odd: {index: cols * rows - 1, icon: 'badge'}});
    const L = gridLayout(el);
    const pitch = w / cols;
    const size = Math.min(pitch * FILL, MAX_ICON);
    assert.ok(Math.abs(L.pitch - pitch) < EPS, `${cols}x${rows} pitch`);
    assert.ok(Math.abs(L.size - size) < EPS, `${cols}x${rows} size`);
    L.cells.forEach((c, i) => {
      const col = i % cols, row = Math.floor(i / cols);
      assert.ok(Math.abs(c.x - (el.x + (col - (cols - 1) / 2) * pitch)) < EPS, `${cols}x${rows} cell ${i} x`);
      assert.ok(Math.abs(c.y - (el.y + (row - (rows - 1) / 2) * pitch)) < EPS, `${cols}x${rows} cell ${i} y`);
      assert.equal(c.size, L.size);
      assert.equal(c.icon, i === el.odd.index ? el.odd.icon : el.icon, `${cols}x${rows} cell ${i} icon`);
      assert.ok(c.x - c.size / 2 >= 0 && c.x + c.size / 2 <= W && c.y - c.size / 2 >= 0 && c.y + c.size / 2 <= H, 'cell inside the card');
    });
    const odd = L.cells[el.odd.index];
    assert.equal(L.circleX, odd.x);
    assert.equal(L.circleY, odd.y);
    assert.ok(L.circleRx >= L.size / 2 && L.circleRy >= L.size / 2, 'red circle surrounds the odd icon');
    assert.equal(L.labelX, el.x);
    const blockBottom = el.y + (rows / 2) * pitch;
    assert.ok(L.labelY > blockBottom && L.labelY < H, 'label below the block, inside the card');
  }
  const L = gridLayout(base());
  for (const c of L.cells) for (const d of L.cells) if (c !== d) assert.ok(Math.hypot(c.x - d.x, c.y - d.y) >= L.size, 'no two icons overlap');
});

test('2g: grid wired as its own layout file, icons enter with the batch-1 pop', () => {
  const schema = read('engine/ink/parts/schema.ts');
  assert.match(schema, /export type GridEl\b/);
  assert.match(schema, /t:\s*'grid'/);
  assert.match(schema.match(/export type El\s*=([^;]+);/)[1], /\bGridEl\b/);
  const elements = read('engine/ink/parts/elements.tsx');
  assert.match(elements, /case 'grid': return <GridElement\b/);
  assert.match(elements, /from '\.\/layouts\/grid'/);
  const view = read(VIEW);
  assert.match(view, /export const GridElement\b/);
  assert.match(view, /\bgridLayout\(/);
  assert.match(view, /useCurrentFrame\(\)\s*\+\s*shotF0/, 'renderer compares absolute card frames');
  assert.match(view, /<IconElement\b/, 'icons enter with the batch-1 icon pop');
  assert.match(view, /\bscribbleEllipse\(/, 'red circle is a hand-drawn scribble ellipse');
  assert.doesNotMatch(view, /<rect\b|<circle\b|<ellipse\b/, 'hand-drawn paths only');
  assert.doesNotMatch(view, /\bfilter=/, 'the caller boils every element; no own filter');
  assert.doesNotMatch(read('engine/ink/parts/cards.tsx'), /\bGridEl\b|\bgridLayout\b/, 'grid stays out of cards.tsx');
});

test('2g: demo2 appends one grid shot after the ring; contiguous, no back-to-back', async () => {
  const {gridLayout} = await load();
  const p = JSON.parse(read('engine/ink/parts/cardlib/demo2.json'));
  assert.ok(p.shots.length >= PREV_SHOTS + 1, 'grid shot appended');
  assert.equal(p.f1, p.shots.length * SHOT);
  p.shots.forEach((s, i) => {
    assert.equal(s.f0, i * SHOT, `shot ${i} f0`);
    assert.equal(s.f1, (i + 1) * SHOT, `shot ${i} f1`);
    assert.deepEqual(s.bg, {card: true}, `shot ${i} bg`);
    if (i > 0) assert.notEqual(mainLayout(s).t, mainLayout(p.shots[i - 1]).t, `shots ${i - 1} and ${i} repeat a layout`);
  });
  const s = p.shots[PREV_SHOTS];
  const el = mainLayout(s);
  assert.equal(el.t, 'grid');
  assert.equal(el.icon, 'mask');
  assert.equal(el.cols, 4);
  assert.equal(el.rows, 3);
  assert.equal(el.odd.index, 6);
  assert.equal(el.label, 'ONE HONEST MAN');
  assert.equal(el.at, s.f0 + ENTRY);
  assert.ok(gridLayout(el).end <= s.f1 - TAIL, `grid still animating at local ${gridLayout(el).end - s.f0}`);
});

test('2g: touched sources are ASCII-only', () => {
  for (const f of TOUCHED) {
    const bad = [...read(f)].find((ch) => ch.charCodeAt(0) > 127);
    assert.equal(bad, undefined, `${f} has non-ASCII ${JSON.stringify(bad)}`);
  }
});
