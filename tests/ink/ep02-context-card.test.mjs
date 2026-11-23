// ep02 context-card contract (spec docs/specs/2026-11-24-ep02-context-cards-design.md). Written by the planner
// BEFORE the build and protected. The owner rejected the plain white cards ("white then something place on it
// then word done ... it should be explaining according to context"). Every ep02 card now sits on its beat's
// world: bg {card: true, under: <scene plate>}, which the engine draws blurred and washed behind a hand-drawn
// sheet. Sprite+words-only cards are gone (they became on-scene shots), and no 1718 card uses a modern icon.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, existsSync} from 'node:fs';

const ROOT = new URL('../../', import.meta.url);
const read = (p) => readFileSync(new URL(p, ROOT), 'utf8');
const ASSETS = 'videos/pastly-life/02-blackbeard-ink/assets/';
const shots = JSON.parse(read('engine/ink/parts/shots_ep02full/full.json')).shots;
const cards = shots.filter((s) => s.bg && s.bg.card === true);
const MODERN = ['ship', 'padlock', 'hat', 'man', 'factory', 'hotel'];
const PERIOD = ['sloop', 'chain', 'chest', 'cannon', 'barrel', 'pistol', 'cutlass', 'flag', 'scroll', 'lantern', 'anchor'];

const icons = (node, out = []) => {
  if (Array.isArray(node)) node.forEach((n) => icons(n, out));
  else if (node && typeof node === 'object') {
    for (const [k, v] of Object.entries(node)) {
      if (k === 'icon' && typeof v === 'string') out.push(v);
      else icons(v, out);
    }
  }
  return out;
};

test('context card: every ep02 card carries an existing scene plate under it', () => {
  assert.ok(cards.length > 0, 'ep02 still has cards');
  for (const c of cards) {
    assert.equal(typeof c.bg.under, 'string', `card @${c.f0} has bg.under`);
    assert.match(c.bg.under, /^ink\/scenes\/.+\.png$/, `card @${c.f0} under is a scene plate`);
    assert.ok(existsSync(new URL(ASSETS + c.bg.under, ROOT)), `card @${c.f0} plate ${c.bg.under} exists`);
  }
});

test('context card: no card is only a sprite and words', () => {
  for (const c of cards) {
    const kinds = new Set(c.els.map((e) => e.t));
    const onlySpriteWords = [...kinds].every((k) => k === 'sprite' || k === 'words');
    assert.ok(!onlySpriteWords, `card @${c.f0} is sprite+words only (${[...kinds]}); make it an on-scene shot`);
  }
});

test('context card: ep02 cards use no modern icons', () => {
  for (const c of cards) for (const name of icons(c.els)) {
    assert.ok(!MODERN.includes(name), `card @${c.f0} uses modern icon "${name}"`);
  }
});

test('context card: the period icon set exists in icons.tsx', () => {
  const src = read('engine/ink/parts/icons.tsx');
  for (const name of PERIOD) assert.match(src, new RegExp(`['"]?${name}['"]?\\s*:`), `icons.tsx draws "${name}"`);
});

test('context card: engine draws the under-plate, sheet and vignette for cards', () => {
  const src = read('engine/ink/compositions/InkParts.tsx');
  assert.match(src, /under/, 'InkParts reads bg.under');
  assert.doesNotMatch(src, /!\('card' in bg\) && <Vignette\/>/, 'cards are no longer excluded from the vignette');
});
