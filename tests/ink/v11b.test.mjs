// Video B (v11B) contract (brief docs/briefs/ink-v11b-shots.md). Written by the planner BEFORE the build
// and protected, so the builder cannot weaken it. v11B = v10.2 timing kept frame-for-frame; only the
// listed card shots change layout, plus the TOWERS SOLD HUD chips. Renders are reviewed from stills.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, existsSync} from 'node:fs';

const ROOT = new URL('../../', import.meta.url);
const read = (p) => readFileSync(new URL(p, ROOT), 'utf8');
const json = (p) => JSON.parse(read(p));

// Single source for the contract numbers; the brief states the same values.
const PARTS = Array.from({length: 22}, (_, i) => `p${String(i + 3).padStart(2, '0')}`);
const TAIL = 6;                 // mirrors TAIL in tools/ink/make_v10_shots.py
const PHOTO_GAP_MAX = 3600;     // 2 min at 30 fps: no stretch longer than this without a photo
const PHOTO_USES_MAX = 2;       // one use + one callback
const TYPE_CAP = {flow: 2, bars: 1};
const TYPE_CAP_ANY = 4;
const LAYOUTS = ['flow', 'bars', 'timeline', 'count', 'split', 'hero', 'crossout', 'checklist', 'quote', 'bignum'];
// shot f0 -> the layout that shot must carry in v11B (and it must no longer carry flow/bars)
const SWAPS = {
  1986: 'count', 3240: 'count', 3507: 'checklist', 5006: 'hero', 5580: 'checklist', 6120: 'hero',
  7372: 'split', 8500: 'checklist', 8900: 'bignum', 9730: 'bignum', 12216: 'split', 12736: 'split',
  13106: 'crossout', 15140: 'crossout', 18674: 'quote', 18956: 'checklist', 19160: 'hero',
};
const CHIPS = {12874: 'TOWERS SOLD: 1', 14370: 'TOWERS SOLD: 2'};
// Zen review 2026-11-18 (docs/TODO.md): targeted fixes after watching v11B. Boundary moves per part
// (old [f0,f1] -> new list) and the shot f0s whose elements/bg may now differ from v10.
const REVIEW_BOUNDS = {
  p05: {'3298,3330': [[3298, 3361]], '3330,3448': [[3361, 3448]]},  // diplomat hold 32 -> 63 frames
  p20: {'15229,15372': [[15229, 15290], [15290, 15372]]},          // liner plate, then ink map card
};
const REVIEW_ELS = new Set([3240, 3298, 3361, 5006, 6120, 9186, 9520, 10866, 12736, 15229, 15290, 15372]);
const REVIEW_LAYOUT = {3240: null, 12736: null};  // swap layout replaced by a drawn picture

const v10 = (p) => json(`engine/ink/parts/shots_v10/${p}.json`);
const v11 = (p) => json(`engine/ink/parts/shots_v11b/${p}.json`);
const allShots = () => PARTS.flatMap((p) => v11(p).shots);
const layoutOf = (s) => s.els.map((e) => e.t).filter((t) => LAYOUTS.includes(t));
const photosOf = (s) => [s.bg.photo, ...s.els.filter((e) => e.t === 'photo').map((e) => e.src)].filter(Boolean);

test('v11b: every part exists with the v10 part and shot boundaries, contiguous', () => {
  for (const p of PARTS) {
    assert.ok(existsSync(new URL(`engine/ink/parts/shots_v11b/${p}.json`, ROOT)), `missing shots_v11b/${p}.json`);
    const a = v10(p), b = v11(p);
    assert.equal(b.f0, a.f0, `${p} f0`);
    assert.equal(b.f1, a.f1, `${p} f1`);
    const want = a.shots.flatMap((s) => REVIEW_BOUNDS[p]?.[`${s.f0},${s.f1}`] ?? [[s.f0, s.f1]]);
    assert.deepEqual(b.shots.map((s) => [s.f0, s.f1]), want, `${p} shot boundaries`);
    b.shots.forEach((s, i) => assert.equal(s.f0, i ? b.shots[i - 1].f1 : b.f0, `${p} shot ${i} not contiguous`));
  }
});

test('v11b: each swapped shot carries its new layout and drops flow/bars', () => {
  const byF0 = new Map(allShots().map((s) => [s.f0, s]));
  for (const [f0, t] of Object.entries(SWAPS)) {
    if (REVIEW_LAYOUT[f0] === null) continue;
    const s = byF0.get(Number(f0));
    assert.ok(s, `no shot at ${f0}`);
    const lay = layoutOf(s);
    assert.ok(lay.includes(t), `shot ${f0} needs a ${t}, has [${lay}]`);
    assert.ok(!lay.includes('flow') && !lay.includes('bars'), `shot ${f0} still has flow/bars`);
  }
});

test('v11b: shots outside the swap list keep their v10 elements', () => {
  for (const p of PARTS) {
    const a = new Map(v10(p).shots.map((s) => [s.f0, s])), b = v11(p).shots;
    b.forEach((s) => {
      if (SWAPS[s.f0] || REVIEW_ELS.has(s.f0)) return;
      assert.ok(a.has(s.f0), `${p} shot ${s.f0} not in v10 and not a review fix`);
      assert.deepEqual(s.els, a.get(s.f0).els, `${p} shot ${s.f0} els changed`);
      assert.deepEqual(s.bg, a.get(s.f0).bg, `${p} shot ${s.f0} bg changed`);
    });
  }
});

test('v11b: layout type caps (flow 2, bars 1, any other 4) and no same layout on back-to-back cards', () => {
  const shots = allShots();
  const n = {};
  for (const s of shots) for (const t of new Set(layoutOf(s))) n[t] = (n[t] ?? 0) + 1;
  for (const [t, c] of Object.entries(n)) assert.ok(c <= (TYPE_CAP[t] ?? TYPE_CAP_ANY), `${t} used ${c}x`);
  const cards = shots.filter((s) => s.bg.card);
  cards.forEach((s, i) => {
    if (!i) return;
    const shared = layoutOf(s).filter((t) => layoutOf(cards[i - 1]).includes(t));
    assert.deepEqual(shared, [], `cards ${cards[i - 1].f0} and ${s.f0} repeat layout ${shared}`);
  });
});

test('v11b: at most 2 card shots in a row', () => {
  let run = 0;
  for (const s of allShots()) {
    run = s.bg.card ? run + 1 : 0;
    assert.ok(run <= 2, `3 cards in a row ending ${s.f0}`);
  }
});

test('v11b: element timings sit inside their shot, before the tail', () => {
  for (const s of allShots()) {
    for (const e of s.els) {
      for (const k of ['at', 'crossAt']) {
        if (e[k] === undefined) continue;
        assert.ok(Number.isInteger(e[k]) && e[k] >= s.f0 && e[k] <= s.f1 - TAIL, `${s.f0} ${e.t}.${k}=${e[k]} outside [${s.f0},${s.f1 - TAIL}]`);
      }
    }
  }
});

test('v11b: photos spread (no 2-min gap) and used at most once plus one callback', () => {
  const uses = {};
  let last = v11(PARTS[0]).f0;
  for (const s of allShots()) {
    const ph = photosOf(s);
    ph.forEach((src) => { uses[src] = (uses[src] ?? 0) + 1; });
    if (ph.length) {
      assert.ok(s.f0 - last <= PHOTO_GAP_MAX, `photo gap ${last}->${s.f0}`);
      last = s.f0;
    }
  }
  for (const [src, c] of Object.entries(uses)) assert.ok(c <= PHOTO_USES_MAX, `${src} used ${c}x`);
});

test('v11b: TOWERS SOLD HUD chips', () => {
  const byF0 = new Map(allShots().map((s) => [s.f0, s]));
  for (const [f0, text] of Object.entries(CHIPS)) {
    const s = byF0.get(Number(f0));
    assert.ok(s, `no shot at ${f0}`);
    assert.equal(s.chip, text, `shot ${f0} chip`);
    assert.ok(Number.isInteger(s.chipAt) && s.chipAt >= s.f0 && s.chipAt <= s.f1 - TAIL, `shot ${f0} chipAt`);
  }
});

test('v11b: generator and composition wired', () => {
  assert.ok(existsSync(new URL('tools/ink/make_v11b_shots.py', ROOT)), 'tools/ink/make_v11b_shots.py missing');
  const parts = read('engine/ink/compositions/InkParts.tsx');
  assert.match(parts, /export const InkEp01V11B\b/);
  assert.match(parts, /export const INK_EP01_V11B_FRAMES\b/);
  assert.match(parts, /shots_v11b\/p24\.json/);
  const root = read('engine/ink/Root.tsx');
  assert.match(root, /id="InkEp01V11B"/);
  assert.match(root, /INK_EP01_V11B_FRAMES/);
});
