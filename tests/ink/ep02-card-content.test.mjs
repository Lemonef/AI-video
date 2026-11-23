// ep02 card CONTENT contract (brief docs/briefs/ink-ep02-card-content.md). Written by the planner BEFORE the
// build and protected. Brief 1 gave every card its world (blurred plate + wash + sheet); the owner's complaint
// still stands for the content: "white then something place on it then word done ... no design ... it should be
// explaining according to context". So every card now carries ONE layout (one idea), at least one support
// element that is not plain words (a cast sprite for who the beat is about, or a stamp/tag/mark), no office
// memos, and a sheet sized to its content instead of one fixed inset panel.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const ROOT = new URL('../../', import.meta.url);
const read = (p) => readFileSync(new URL(p, ROOT), 'utf8');
const shots = JSON.parse(read('engine/ink/parts/shots_ep02full/full.json')).shots;
const snap = JSON.parse(read('tests/ink/ep02_frames_snapshot.json'));
const cards = shots.filter((s) => s.bg && s.bg.card === true);

const STAGE_W = 1920; // stage width, mirrors InkParts STAGE_W; change together
const STAGE_H = 1080; // stage height, mirrors InkParts STAGE_H; change together
const STAGE_AREA = STAGE_W * STAGE_H;
const INSET_K = 0.12; // mirrors SHEET_INSET = STAGE_H * 0.12 in InkParts.tsx; change together
const INSET_AREA = (STAGE_W - 2 * STAGE_H * INSET_K) * (STAGE_H - 2 * STAGE_H * INSET_K); // brief-1 fixed sheet
const COMPACT_MAX = 0.5; // a compact layout's sheet covers at most half the stage, so the scene reads around it
const SPRITE_SHARE_MIN = 0.6; // share of cards that show a cast member
const SHEET_SIZES_MIN = 6; // distinct sheet sizes: sheets follow content, not one template

const LAYOUTS = ['flow', 'bars', 'timeline', 'count', 'split', 'hero', 'crossout', 'checklist', 'quote', 'bignum',
  'doc', 'map', 'grid', 'ring', 'scale', 'transform'];
const FULL_STAGE = ['split', 'transform', 'scale', 'map']; // drawn across the whole stage, no x/y anchor
const SUPPORT = ['sprite', 'stamp', 'tag', 'circle', 'underline', 'tick', 'cross', 'redact'];

const layoutsOf = (c) => c.els.filter((e) => LAYOUTS.includes(e.t));
const inside = (px, py, [x, y, w, h]) => px >= x && px <= x + w && py >= y && py <= y + h;

test('card content: timing unchanged (same shot frames as the pre-build snapshot)', () => {
  assert.deepEqual(shots.map((s) => [s.f0, s.f1]), snap.frames);
});

test('card content: every card shows exactly one layout (one idea per card)', () => {
  assert.ok(cards.length > 0);
  for (const c of cards) {
    const n = layoutsOf(c).length;
    assert.equal(n, 1, `card @${c.f0} has ${n} layout elements`);
  }
});

test('card content: every card has a support element that is not plain words', () => {
  for (const c of cards) {
    assert.ok(c.els.some((e) => SUPPORT.includes(e.t)), `card @${c.f0} is layout + words only`);
  }
});

test('card content: most cards show who the beat is about (cast sprite)', () => {
  const withSprite = cards.filter((c) => c.els.some((e) => e.t === 'sprite')).length;
  assert.ok(withSprite >= Math.ceil(SPRITE_SHARE_MIN * cards.length),
    `${withSprite}/${cards.length} cards carry a cast sprite, need ${SPRITE_SHARE_MIN * 100}%`);
});

test('card content: no office memo documents in 1718', () => {
  for (const c of cards) for (const e of c.els) {
    if (e.t === 'doc') assert.notEqual(e.kind, 'memo', `card @${c.f0} doc "${e.title}" is a memo`);
  }
});

test('card content: every card has a content-fitted sheet inside the stage', () => {
  const sizes = new Set();
  for (const c of cards) {
    const sh = c.bg.sheet;
    assert.ok(Array.isArray(sh) && sh.length === 4 && sh.every(Number.isFinite), `card @${c.f0} has bg.sheet [x,y,w,h]`);
    const [x, y, w, h] = sh;
    assert.ok(w > 0 && h > 0 && x >= 0 && y >= 0 && x + w <= STAGE_W && y + h <= STAGE_H, `card @${c.f0} sheet inside stage`);
    const full = layoutsOf(c).some((e) => FULL_STAGE.includes(e.t));
    const cap = full ? INSET_AREA : COMPACT_MAX * STAGE_AREA;
    assert.ok(w * h <= cap + 1, `card @${c.f0} sheet ${Math.round(w)}x${Math.round(h)} too big (${full ? 'full-stage' : 'compact'} layout)`);
    for (const e of layoutsOf(c)) {
      if (Number.isFinite(e.x) && Number.isFinite(e.y)) {
        assert.ok(inside(e.x, e.y, sh), `card @${c.f0} ${e.t} anchor (${e.x},${e.y}) outside its sheet`);
      }
    }
    for (const e of c.els) {
      if (e.t === 'sprite') assert.ok(e.x >= 0 && e.x <= STAGE_W, `card @${c.f0} sprite x ${e.x} off stage`);
    }
    sizes.add(`${Math.round(w)}x${Math.round(h)}`);
  }
  assert.ok(sizes.size >= SHEET_SIZES_MIN, `only ${sizes.size} distinct sheet sizes`);
});

test('card content: renderer draws the sheet from bg.sheet and keeps the inset fallback', () => {
  const src = read('engine/ink/compositions/InkParts.tsx');
  assert.match(src, /bg\.sheet/, 'InkParts reads bg.sheet');
  assert.match(src, /SHEET_INSET/, 'SHEET_INSET fallback kept');
  const schema = read('engine/ink/parts/schema.ts');
  assert.match(schema.split('export type Background')[1].split(';')[0], /sheet\?:/, 'Background card variant has sheet?');
});
