// Card library contract (brief docs/briefs/ink-card-lib-1.md). Written by the planner BEFORE the build
// and protected, so the builder cannot weaken it. Structural only: renders are reviewed from stills.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, existsSync} from 'node:fs';
import {join} from 'node:path';

const ROOT = new URL('../../', import.meta.url);
const read = (p) => readFileSync(new URL(p, ROOT), 'utf8');
const PUBLIC = 'videos/pastly-life/01-eiffel-ink/assets';

// Single source for the contract numbers; the brief states the same values.
const SHOT = 90;
const OVERVIEW_SHOTS = 10;
const ICONS = ['tower', 'hat', 'bill', 'coin', 'padlock', 'letter', 'mask', 'pin', 'ship', 'newspaper',
  'factory', 'badge', 'clock', 'scrap', 'key', 'suitcase', 'handcuffs', 'pen', 'hotel', 'crown'];
const NEW_TYPES = ['icon', 'count', 'split', 'hero', 'crossout', 'checklist', 'quote', 'bignum'];
const TOTAL = (OVERVIEW_SHOTS + ICONS.length) * SHOT;

const demo = () => JSON.parse(read('engine/ink/parts/cardlib/demo.json'));
const iconNamesUsed = (el) => {
  const out = [];
  if (el.t === 'icon' || el.t === 'hero' || el.t === 'crossout' || el.t === 'count') out.push(el.t === 'count' ? el.icon : (el.name ?? el.icon));
  if (el.t === 'split') out.push(el.left.icon, el.right.icon);
  return out;
};

// Batch 2 (ink-card-lib-2) grows the union; the exact count lives in cardlib2.test.mjs.
test('cardlib: IconName union contains the 20 batch-1 names', () => {
  const src = read('engine/ink/parts/icons.tsx');
  const m = src.match(/export type IconName\s*=([^;]+);/);
  assert.ok(m, 'export type IconName missing');
  const names = new Set([...m[1].matchAll(/'([a-z]+)'/g)].map((x) => x[1]));
  for (const n of ICONS) assert.ok(names.has(n), `IconName lost ${n}`);
});

test('cardlib: schema adds all 8 element types to El and elements.tsx routes each', () => {
  const schema = read('engine/ink/parts/schema.ts');
  const elements = read('engine/ink/parts/elements.tsx');
  const union = schema.match(/export type El\s*=([^;]+);/)[1];
  for (const t of NEW_TYPES) {
    assert.match(schema, new RegExp(`t:\\s*'${t}'`), `schema has no t:'${t}'`);
    assert.match(elements, new RegExp(`case '${t}'`), `elements.tsx has no case '${t}'`);
  }
  const unionCount = union.split('|').length;
  assert.ok(unionCount >= 17 + NEW_TYPES.length, `El union has ${unionCount} members`);
});

test('cardlib: demo is 30 contiguous half-open 90-frame card shots, f1 = 2700', () => {
  const p = demo();
  assert.equal(p.part, 'cardlib');
  assert.equal(p.f0, 0);
  assert.equal(p.f1, TOTAL);
  assert.equal(p.shots.length, OVERVIEW_SHOTS + ICONS.length);
  p.shots.forEach((s, i) => {
    assert.equal(s.f0, i * SHOT, `shot ${i} f0`);
    assert.equal(s.f1, (i + 1) * SHOT, `shot ${i} f1`);
    assert.deepEqual(s.bg, {card: true}, `shot ${i} bg`);
  });
});

test('cardlib: every new type used, every icon shown, every frame field inside its shot', () => {
  const p = demo();
  const types = new Set();
  const icons = new Set();
  p.shots.forEach((s, i) => {
    for (const el of s.els) {
      types.add(el.t);
      iconNamesUsed(el).forEach((n) => icons.add(n));
      for (const k of ['at', 'crossAt']) {
        if (el[k] === undefined) continue;
        assert.ok(Number.isInteger(el[k]) && el[k] >= s.f0 && el[k] < s.f1, `shot ${i} ${el.t}.${k}=${el[k]} outside [${s.f0},${s.f1})`);
      }
      for (const k of ['step', 'dur', 'n', 'size', 'w']) {
        if (el[k] === undefined) continue;
        assert.ok(Number.isFinite(el[k]) && el[k] > 0, `shot ${i} ${el.t}.${k} must be > 0`);
      }
    }
  });
  for (const t of NEW_TYPES) assert.ok(types.has(t), `demo never uses ${t}`);
  for (const n of ICONS) assert.ok(icons.has(n), `demo never shows icon ${n}`);
});

test('cardlib: shots 11-30 are one card per icon, in IconName order, at 160 and 360 px', () => {
  const p = demo();
  ICONS.forEach((name, k) => {
    const s = p.shots[OVERVIEW_SHOTS + k];
    const sizes = s.els.filter((e) => e.t === 'icon' && e.name === name).map((e) => e.size).sort((a, b) => a - b);
    assert.deepEqual(sizes, [160, 360], `icon card ${name} sizes`);
  });
});

test('cardlib: carry keeps icon identity and source geometry across the shot 4 -> 5 cut', () => {
  const p = demo();
  const a = p.shots[3].els.find((e) => e.t === 'hero');
  const b = p.shots[4].els.find((e) => e.t === 'hero');
  assert.ok(a && b, 'shots 4 and 5 need a hero');
  assert.equal(b.icon, a.icon, 'carry must keep the same icon');
  assert.deepEqual(b.from, [a.x, a.y, a.size], 'from = previous hero geometry');
  assert.notDeepEqual([b.x, b.y, b.size], [a.x, a.y, a.size], 'carry must actually move');
});

test('cardlib: sprite on the character card exists under the ink public dir', () => {
  const p = demo();
  const sprites = p.shots.flatMap((s) => s.els.filter((e) => e.t === 'sprite'));
  assert.ok(sprites.length >= 1, 'demo needs a character sprite');
  for (const s of sprites) assert.ok(existsSync(join(PUBLIC, s.src)), `missing sprite ${s.src}`);
});

test('cardlib: CardLibrary registered in Root with the demo length', () => {
  const root = read('engine/ink/Root.tsx');
  assert.match(root, /id="CardLibrary"/);
  assert.match(root, /CARD_LIBRARY_FRAMES/);
});
