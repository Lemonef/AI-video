// Card library job 2e contract (brief docs/briefs/ink-card-lib-2e.md): the `scale` layout (balance scale, the
// heavier side drops), in its own files. Written by the planner BEFORE the build and protected. The pure layout
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
const ENTRY = 6; // scale enters at shot.f0 + ENTRY
const TAIL = 6; // every animation ends at least TAIL frames before its shot ends
const W = 1920, H = 1080; // card size
const CX = W / 2; // scale centred on the card
const ICON = 220; // pan icon size
const DRAW = 10, LEFT_POP = 10, RIGHT_POP = 18, TILT_START = 30; // entrance offsets from `at`
const TILT = 12; // final beam tilt, degrees
const POP = 8; // icon pop (mirrors cards.tsx POP_FRAMES)
const PREV_SHOTS = 9; // demo2 shots owned by jobs 2b + 2c + 2d; 2e appends after them
const LAYOUT = 'engine/ink/parts/layouts/scaleLayout.ts';
const VIEW = 'engine/ink/parts/layouts/scale.tsx';
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
const base = (o = {}) => ({t: 'scale', left: {icon: 'bill', label: 'BRIBE'}, right: {icon: 'badge', label: 'DUTY'}, heavy: 'left', label: 'MONEY WINS', at: 6, dur: 20, ...o});
const mainLayout = (s) => s.els.find((e) => e.t !== 'words');
const box = (c) => ({x0: c.x - c.size / 2, x1: c.x + c.size / 2, y0: c.y - c.size / 2, y1: c.y + c.size / 2});

test('2e: scaleLayout is pure (no React, no remotion)', () => {
  const src = read(LAYOUT);
  assert.doesNotMatch(src, /from ['"](?:react|remotion)/);
  assert.doesNotMatch(src, /(?:^|[,\s])(?:LABEL|SMALL|CHAR_WIDTH)\s*=(?!=)/m, 'type tokens come from ./tokens');
});

test('2e: scaleLayout throws on bad dur, bad heavy, same icon, label too wide', async () => {
  const {scaleLayout} = await load();
  assert.equal(typeof scaleLayout, 'function', 'scaleLayout export missing');
  const bad = {
    'dur zero': {dur: 0},
    'dur negative': {dur: -3},
    'dur fractional': {dur: 2.5},
    'dur NaN': {dur: NaN},
    'heavy not left/right': {heavy: 'up'},
    'left and right same icon': {right: {icon: 'bill', label: 'X'}},
    'label wider than the card': {label: 'W'.repeat(60)},
  };
  for (const [why, o] of Object.entries(bad)) assert.throws(() => scaleLayout(base(o)), Error, why);
  assert.doesNotThrow(() => scaleLayout(base({label: undefined})), 'label is optional');
  assert.doesNotThrow(() => scaleLayout(base({left: {icon: 'bill'}, right: {icon: 'badge'}})), 'pan labels are optional');
});

test('2e: timing: draw at at, left pop +10, right pop +18, tilt from +30 over dur, label last', async () => {
  const {scaleLayout, SCALE_TILT, POP_FRAMES} = await load();
  assert.equal(SCALE_TILT, TILT);
  assert.equal(POP_FRAMES, POP);
  assert.match(read('engine/ink/parts/cards.tsx'), new RegExp(`POP_FRAMES = ${POP}\\b`), 'POP mirrors cards.tsx');
  const el = base();
  const L = scaleLayout(el);
  assert.equal(L.drawAt, el.at);
  assert.equal(L.drawEnd, el.at + DRAW);
  assert.equal(L.leftAt, el.at + LEFT_POP);
  assert.equal(L.rightAt, el.at + RIGHT_POP);
  assert.equal(L.tiltAt, el.at + TILT_START);
  assert.equal(L.tiltEnd, L.tiltAt + el.dur);
  assert.ok(L.tiltAt >= L.rightAt + POP, 'tilt starts after both icons have landed');
  assert.equal(L.leftLabelAt, L.leftAt + POP);
  assert.equal(L.rightLabelAt, L.rightAt + POP);
  assert.ok(L.labelAt >= L.tiltEnd, 'label after the tilt');
  assert.ok(L.end > L.labelAt && L.end >= L.tiltEnd, 'end covers the label fade');
  const bare = scaleLayout(base({label: undefined}));
  assert.equal(bare.labelAt, null);
  assert.ok(bare.end >= bare.tiltEnd && bare.end > bare.rightLabelAt, 'end covers the tilt and the pan labels');
});

test('2e: angle: level until the tilt, eases monotonically to SCALE_TILT toward the heavy side', async () => {
  const {scaleLayout} = await load();
  for (const heavy of ['left', 'right']) {
    const L = scaleLayout(base({heavy}));
    const sign = heavy === 'right' ? 1 : -1; // SVG rotate: positive = clockwise = right end down
    assert.equal(L.angleAt(L.at ?? 6), 0, 'level at entry');
    assert.equal(L.angleAt(L.tiltAt), 0, 'level at tilt start');
    assert.ok(Math.abs(L.angleAt(L.tiltEnd) - sign * TILT) < EPS, `${heavy}: full tilt at tiltEnd`);
    assert.ok(Math.abs(L.angleAt(L.tiltEnd + 40) - sign * TILT) < EPS, `${heavy}: holds after tiltEnd`);
    let prev = 0;
    for (let f = L.tiltAt; f <= L.tiltEnd; f++) {
      const a = L.angleAt(f) * sign;
      assert.ok(a >= prev - EPS, `${heavy}: monotonic at ${f}`);
      prev = a;
    }
    const mid = Math.abs(L.angleAt((L.tiltAt + L.tiltEnd) / 2));
    assert.ok(mid > 0 && mid < TILT, 'smooth, not a jump');
  }
});

test('2e: geometry: beam rotates on the pivot, pans hang upright, icons sit on pans, all inside the card', async () => {
  const {scaleLayout} = await load();
  const L = scaleLayout(base());
  const lvl = L.arms(0);
  assert.equal(lvl.pivot.x, CX, 'pivot centred');
  assert.ok(Math.abs(lvl.left.y - lvl.pivot.y) < EPS && Math.abs(lvl.right.y - lvl.pivot.y) < EPS, 'level beam');
  assert.ok(Math.abs((CX - lvl.left.x) - (lvl.right.x - CX)) < EPS, 'beam symmetric');
  const beam = lvl.right.x - lvl.left.x;
  for (const deg of [-TILT, 0, TILT]) {
    const A = L.arms(deg);
    assert.ok(Math.abs(Math.hypot(A.right.x - A.left.x, A.right.y - A.left.y) - beam) < EPS, `beam length fixed at ${deg}`);
    assert.deepEqual(A.pivot, lvl.pivot, 'pivot does not move');
    if (deg > 0) assert.ok(A.right.y > A.left.y, 'positive angle drops the right end');
    if (deg < 0) assert.ok(A.left.y > A.right.y, 'negative angle drops the left end');
    for (const side of ['left', 'right']) {
      const end = A[side], pan = A[`${side}Pan`], ic = A[`${side}Icon`], lab = A[`${side}Label`];
      assert.equal(pan.x, end.x, `${side} pan under its beam end`);
      assert.ok(Math.abs((pan.y - end.y) - (lvl[`${side}Pan`].y - lvl[side].y)) < EPS, `${side} pan hangs a fixed drop (upright, never rotates)`);
      assert.match(A[`${side}ChainD`], /^M/, `${side} chain path`);
      assert.equal(ic.size, ICON);
      assert.equal(ic.x, pan.x, `${side} icon centred on its pan`);
      const b = box(ic);
      assert.ok(b.y1 <= pan.y + EPS && b.y1 >= pan.y - ICON / 4, `${side} icon rests on its pan`);
      assert.ok(b.x0 >= 0 && b.x1 <= W && b.y0 >= 0, `${side} icon inside the card at ${deg}`);
      assert.ok(lab.y > pan.y, `${side} label under its pan`);
      assert.ok(lab.y < H, `${side} label inside the card`);
    }
    assert.ok(box(A.leftIcon).x1 < CX && box(A.rightIcon).x0 > CX, 'icons clear of the post');
  }
  for (const k of ['baseD', 'postD', 'beamD']) assert.match(L[k], /^M/, `${k} path`);
  const low = Math.max(L.arms(TILT).leftLabel.y, L.arms(TILT).rightLabel.y, L.arms(-TILT).leftLabel.y, L.arms(-TILT).rightLabel.y);
  assert.ok(L.labelY > low, 'main label below every pan label');
  assert.ok(L.labelY < H, 'main label inside the card');
  assert.equal(L.labelX, W / 2, 'main label centred');
});

test('2e: scale wired as its own layout file, icons enter with the batch-1 pop', () => {
  const schema = read('engine/ink/parts/schema.ts');
  assert.match(schema, /export type ScaleEl\b/);
  assert.match(schema, /t:\s*'scale'/);
  assert.match(schema.match(/export type El\s*=([^;]+);/)[1], /\bScaleEl\b/);
  const elements = read('engine/ink/parts/elements.tsx');
  assert.match(elements, /case 'scale': return <ScaleElement\b/);
  assert.match(elements, /from '\.\/layouts\/scale'/);
  const view = read(VIEW);
  assert.match(view, /export const ScaleElement\b/);
  assert.match(view, /\bscaleLayout\(/);
  assert.match(view, /<IconElement\b/, 'pan icons enter with the batch-1 icon pop');
  assert.match(view, /\bDOODLE\.brown\b/, 'post/beam fill');
  assert.match(view, /\bDOODLE\.grey\b/, 'pan fill');
  assert.doesNotMatch(view, /<rect\b/, 'hand-drawn paths only');
  assert.doesNotMatch(view, /\bfilter=/, 'the caller boils every element; no own filter');
  assert.doesNotMatch(read('engine/ink/parts/cards.tsx'), /\bScaleEl\b|\bscaleLayout\b/, 'scale stays out of cards.tsx');
});

test('2e: demo2 appends one scale shot after the transform; contiguous, no back-to-back', async () => {
  const {scaleLayout} = await load();
  const p = JSON.parse(read('engine/ink/parts/cardlib/demo2.json'));
  assert.ok(p.shots.length >= PREV_SHOTS + 1, 'scale shot appended');
  assert.equal(p.f1, p.shots.length * SHOT);
  p.shots.forEach((s, i) => {
    assert.equal(s.f0, i * SHOT, `shot ${i} f0`);
    assert.equal(s.f1, (i + 1) * SHOT, `shot ${i} f1`);
    assert.deepEqual(s.bg, {card: true}, `shot ${i} bg`);
    if (i > 0) assert.notEqual(mainLayout(s).t, mainLayout(p.shots[i - 1]).t, `shots ${i - 1} and ${i} repeat a layout`);
  });
  const s = p.shots[PREV_SHOTS];
  const el = mainLayout(s);
  assert.equal(el.t, 'scale');
  assert.equal(el.left.icon, 'bill');
  assert.equal(el.left.label, 'BRIBE');
  assert.equal(el.right.icon, 'badge');
  assert.equal(el.right.label, 'DUTY');
  assert.equal(el.heavy, 'left');
  assert.equal(el.label, 'MONEY WINS');
  assert.equal(el.at, s.f0 + ENTRY);
  assert.ok(scaleLayout(el).end <= s.f1 - TAIL, `scale still animating at local ${scaleLayout(el).end - s.f0}`);
});

test('2e: touched sources are ASCII-only', () => {
  for (const f of TOUCHED) {
    const bad = [...read(f)].find((ch) => ch.charCodeAt(0) > 127);
    assert.equal(bad, undefined, `${f} has non-ASCII ${JSON.stringify(bad)}`);
  }
});
