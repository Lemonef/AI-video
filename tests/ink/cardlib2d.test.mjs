// Card library job 2d contract (brief docs/briefs/ink-card-lib-2d.md): the `transform` layout (A becomes B),
// in its own files. Written by the planner BEFORE the build and protected. The pure layout module is bundled
// with esbuild and called for real, so throws, timings and geometry are checked by behaviour.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {buildSync} from 'esbuild';

const ROOT = new URL('../../', import.meta.url);
const read = (p) => readFileSync(new URL(p, ROOT), 'utf8');

// Single source for the contract numbers; the brief states the same values.
const SHOT = 90; // demo shot length
const ENTRY = 6; // transform enters at shot.f0 + ENTRY
const TAIL = 6; // every animation ends at least TAIL frames before its shot ends
const W = 1920, H = 1080; // card size
const ICON = 320, A_X = 480, B_X = 1440, ICON_Y = 460; // spec positions and size
const CROSS = 10, ARROW = 10, POP = 8; // cross draw, arrow draw, icon pop (POP mirrors cards.tsx POP_FRAMES)
const PREV_SHOTS = 8; // demo2 shots owned by jobs 2b + 2c; 2d appends after them
const LAYOUT = 'engine/ink/parts/layouts/transformLayout.ts';
const VIEW = 'engine/ink/parts/layouts/transform.tsx';
const TOUCHED = [LAYOUT, VIEW, 'engine/ink/parts/schema.ts', 'engine/ink/parts/elements.tsx'];

let mod;
const load = async () => {
  if (mod) return mod;
  assert.ok(existsSync(new URL(LAYOUT, ROOT)), `${LAYOUT} missing`);
  const out = buildSync({entryPoints: [fileURLToPath(new URL(LAYOUT, ROOT))], bundle: true, format: 'esm', platform: 'node', write: false, logLevel: 'silent'});
  mod = await import(`data:text/javascript;base64,${Buffer.from(out.outputFiles[0].text).toString('base64')}`);
  return mod;
};
const base = (o = {}) => ({t: 'transform', a: {icon: 'tower', label: 'TOWER'}, b: {icon: 'scrap', label: 'SCRAP'}, label: 'SOLD', at: 6, step: 16, ...o});
const mainLayout = (s) => s.els.find((e) => e.t !== 'words');

test('2d: transformLayout is pure (no React, no remotion)', () => {
  const src = read(LAYOUT);
  assert.doesNotMatch(src, /from ['"](?:react|remotion)/);
  assert.doesNotMatch(src, /(?:^|[,\s])(?:LABEL|SMALL|CHAR_WIDTH)\s*=(?!=)/m, 'type tokens come from ./tokens');
});

test('2d: transformLayout throws on bad step, same icon, label too wide', async () => {
  const {transformLayout} = await load();
  assert.equal(typeof transformLayout, 'function', 'transformLayout export missing');
  const bad = {
    'step zero': {step: 0},
    'step negative': {step: -4},
    'step fractional': {step: 12.5},
    'step NaN': {step: NaN},
    'step shorter than the cross': {step: CROSS - 1},
    'a and b same icon': {b: {icon: 'tower', label: 'X'}},
    'label wider than the card': {label: 'W'.repeat(60)},
  };
  for (const [why, o] of Object.entries(bad)) assert.throws(() => transformLayout(base(o)), Error, why);
  assert.doesNotThrow(() => transformLayout(base({label: undefined})), 'label is optional');
  assert.doesNotThrow(() => transformLayout(base({a: {icon: 'tower'}, b: {icon: 'scrap'}})), 'slot labels are optional');
});

test('2d: timing: A pops, cross at +step, arrow at +2*step, B on arrow end, label last', async () => {
  const {transformLayout, CROSS_FRAMES, ARROW_DRAW, POP_FRAMES} = await load();
  assert.equal(CROSS_FRAMES, CROSS);
  assert.equal(ARROW_DRAW, ARROW);
  assert.equal(POP_FRAMES, POP);
  assert.match(read('engine/ink/parts/cards.tsx'), new RegExp(`POP_FRAMES = ${POP}\\b`), 'POP mirrors cards.tsx');
  assert.match(read('engine/ink/parts/cards.tsx'), new RegExp(`CROSS_FRAMES = ${CROSS}\\b`), 'CROSS mirrors cards.tsx');
  const el = base();
  const L = transformLayout(el);
  assert.equal(L.aAt, el.at);
  assert.equal(L.crossAt, el.at + el.step);
  assert.equal(L.crossEnd, L.crossAt + CROSS);
  assert.equal(L.arrowAt, el.at + 2 * el.step);
  assert.ok(L.arrowAt >= L.crossEnd, 'arrow starts after the cross is done');
  assert.equal(L.arrowEnd, L.arrowAt + ARROW);
  assert.equal(L.bAt, L.arrowEnd);
  assert.equal(L.aLabelAt, L.aAt + POP);
  assert.equal(L.bLabelAt, L.bAt + POP);
  assert.ok(L.labelAt >= L.bLabelAt, 'label after B has landed');
  assert.ok(L.end > L.labelAt && L.end > L.bLabelAt, 'end covers the label fades');
  const bare = transformLayout(base({label: undefined}));
  assert.equal(bare.labelAt, null);
  assert.ok(bare.end > bare.bLabelAt, 'end covers the B label fade');
});

test('2d: geometry: A left, B right, arrow between the icons, labels stacked inside the card', async () => {
  const {transformLayout} = await load();
  const L = transformLayout(base());
  assert.deepEqual(L.a, {x: A_X, y: ICON_Y, size: ICON});
  assert.deepEqual(L.b, {x: B_X, y: ICON_Y, size: ICON});
  assert.ok(L.arrowX1 > A_X + ICON / 2, 'arrow starts right of A');
  assert.ok(L.arrowX2 < B_X - ICON / 2, 'arrow ends left of B');
  assert.ok(L.arrowX2 - L.arrowX1 >= ICON / 2, 'arrow long enough to read');
  assert.match(L.arrowD, /^M/, 'arrow shaft path');
  assert.match(L.headD, /^M/, 'arrow head path');
  assert.ok(L.slotLabelY > ICON_Y + ICON / 2, 'slot labels under the icons');
  assert.ok(L.labelY > L.slotLabelY, 'main label below the slot labels');
  assert.ok(L.labelY < H, 'main label inside the card');
  assert.equal(L.labelX, W / 2, 'main label centred');
});

test('2d: transform wired as its own layout file, A reuses the batch-1 crossout', () => {
  const schema = read('engine/ink/parts/schema.ts');
  assert.match(schema, /export type SlotIcon\b/);
  assert.match(schema, /export type TransformEl\b/);
  assert.match(schema, /t:\s*'transform'/);
  assert.match(schema.match(/export type El\s*=([^;]+);/)[1], /\bTransformEl\b/);
  const elements = read('engine/ink/parts/elements.tsx');
  assert.match(elements, /case 'transform': return <TransformElement\b/);
  assert.match(elements, /from '\.\/layouts\/transform'/);
  const view = read(VIEW);
  assert.match(view, /export const TransformElement\b/);
  assert.match(view, /\btransformLayout\(/);
  assert.match(view, /<CrossoutElement\b/, 'A + red cross + dim = the exact batch-1 crossout');
  assert.match(view, /<IconElement\b/, 'B enters with the batch-1 icon pop');
  assert.doesNotMatch(view, /<rect\b/, 'hand-drawn paths only');
  assert.doesNotMatch(view, /\bfilter=/, 'the caller boils every element; no own filter');
  assert.doesNotMatch(read('engine/ink/parts/cards.tsx'), /\bTransformEl\b|\btransformLayout\b/, 'transform stays out of cards.tsx');
});

test('2d: demo2 appends one transform shot after the maps; contiguous, no back-to-back', async () => {
  const {transformLayout} = await load();
  const p = JSON.parse(read('engine/ink/parts/cardlib/demo2.json'));
  assert.ok(p.shots.length >= PREV_SHOTS + 1, 'transform shot appended');
  assert.equal(p.f1, p.shots.length * SHOT);
  p.shots.forEach((s, i) => {
    assert.equal(s.f0, i * SHOT, `shot ${i} f0`);
    assert.equal(s.f1, (i + 1) * SHOT, `shot ${i} f1`);
    assert.deepEqual(s.bg, {card: true}, `shot ${i} bg`);
    if (i > 0) assert.notEqual(mainLayout(s).t, mainLayout(p.shots[i - 1]).t, `shots ${i - 1} and ${i} repeat a layout`);
  });
  const s = p.shots[PREV_SHOTS];
  const el = mainLayout(s);
  assert.equal(el.t, 'transform');
  assert.equal(el.a.icon, 'tower');
  assert.equal(el.a.label, 'TOWER');
  assert.equal(el.b.icon, 'scrap');
  assert.equal(el.b.label, 'SCRAP');
  assert.equal(el.label, 'SOLD FOR SCRAP');
  assert.equal(el.at, s.f0 + ENTRY);
  assert.ok(transformLayout(el).end <= s.f1 - TAIL, `transform still animating at local ${transformLayout(el).end - s.f0}`);
});

test('2d: touched sources are ASCII-only', () => {
  for (const f of TOUCHED) {
    const bad = [...read(f)].find((ch) => ch.charCodeAt(0) > 127);
    assert.equal(bad, undefined, `${f} has non-ASCII ${JSON.stringify(bad)}`);
  }
});
