// ep02 context-card contract (spec docs/specs/2026-11-24-ep02-context-cards-design.md). Written by the planner
// BEFORE the build and protected. The owner rejected the plain white cards ("white then something place on it
// then word done ... it should be explaining according to context"). Every ep02 card now sits on its beat's
// world: bg {card: true, under: <scene plate>}, which the engine draws blurred and washed behind a hand-drawn
// sheet. Sprite+words-only cards are gone (they became on-scene shots), and no 1718 card uses a modern icon.
// Revised after the Codex brief review (FAIL): neighbour-plate rule, timing snapshot, layer order, name+icon keys.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, existsSync} from 'node:fs';

const ROOT = new URL('../../', import.meta.url);
const read = (p) => readFileSync(new URL(p, ROOT), 'utf8');
const ASSETS = 'videos/pastly-life/02-blackbeard-ink/assets/';
const shots = JSON.parse(read('engine/ink/parts/shots_ep02full/full.json')).shots;
const snap = JSON.parse(read('tests/ink/ep02_frames_snapshot.json'));
const cards = shots.filter((s) => s.bg && s.bg.card === true);
const MODERN = ['ship', 'padlock', 'hat', 'man', 'factory', 'hotel', 'suitcase'];
const PERIOD = ['sloop', 'chain', 'chest', 'cannon', 'barrel', 'pistol', 'cutlass', 'flag', 'scroll', 'lantern', 'anchor'];

// Icon names live under `icon` (hero/split pairs) or `name` (IconEl); walk both.
const icons = (node, out = []) => {
  if (Array.isArray(node)) node.forEach((n) => icons(n, out));
  else if (node && typeof node === 'object') {
    if (node.t === 'icon' && typeof node.name === 'string') out.push(node.name);
    for (const [k, v] of Object.entries(node)) {
      if (k === 'icon' && typeof v === 'string') out.push(v);
      else icons(v, out);
    }
  }
  return out;
};
const platesNear = (i) => {
  const near = [];
  for (const step of [-1, 1]) {
    for (let j = i + step; j >= 0 && j < shots.length; j += step) {
      if (shots[j].bg.plate) { near.push(shots[j].bg.plate); break; }
    }
  }
  return near;
};

test('context card: timing unchanged (same shot frames as the pre-build snapshot)', () => {
  assert.deepEqual(shots.map((s) => [s.f0, s.f1]), snap.frames);
});

test('context card: every card carries an existing scene plate from a neighbouring shot', () => {
  assert.ok(cards.length > 0, 'ep02 still has cards');
  shots.forEach((s, i) => {
    if (s.bg.card !== true) return;
    assert.equal(typeof s.bg.under, 'string', `card @${s.f0} has bg.under`);
    assert.match(s.bg.under, /^ink\/scenes\/.+\.png$/, `card @${s.f0} under is a scene plate`);
    assert.ok(existsSync(new URL(ASSETS + s.bg.under, ROOT)), `card @${s.f0} plate ${s.bg.under} exists`);
    assert.ok(platesNear(i).includes(s.bg.under), `card @${s.f0} under ${s.bg.under} is the nearest previous or next plate`);
  });
  const distinct = new Set(cards.map((c) => c.bg.under));
  assert.ok(distinct.size >= 8, `cards use ${distinct.size} distinct plates (shared bg dict mutated?)`);
});

test('context card: the listed sprite+words cards became on-scene plate shots', () => {
  for (const f0 of snap.sprite_words_cards) {
    const s = shots.find((x) => x.f0 === f0);
    assert.ok(s && typeof s.bg.plate === 'string', `shot @${f0} is now on a scene plate`);
    assert.ok(s.els.some((e) => e.t === 'sprite'), `shot @${f0} keeps its sprite`);
  }
  for (const c of cards) {
    const kinds = new Set(c.els.map((e) => e.t));
    assert.ok(![...kinds].every((k) => k === 'sprite' || k === 'words'), `card @${c.f0} is sprite+words only`);
  }
});

test('context card: ep02 cards use no modern icons', () => {
  for (const c of cards) for (const name of icons(c.els)) {
    assert.ok(!MODERN.includes(name), `card @${c.f0} uses modern icon "${name}"`);
  }
});

test('context card: the period icon set exists in icons.tsx', () => {
  const src = read('engine/ink/parts/icons.tsx');
  for (const name of PERIOD) {
    assert.match(src, new RegExp(`case '${name}':`), `icons.tsx draws "${name}"`);
    assert.match(src.split('export type IconName')[1].split(';')[0], new RegExp(`'${name}'`), `IconName has "${name}"`);
  }
});

test('context card: engine draws plate, wash, sheet in order and keeps legacy cards flat', () => {
  const src = read('engine/ink/compositions/InkParts.tsx');
  for (const tok of ['CARD_BLUR', 'CARD_WASH', 'SHEET_INSET', 'SHEET_TILT', 'SHEET_ALPHA']) {
    assert.match(src, new RegExp(`const ${tok} = [^\\n;]+;[ \\t]*//`), `${tok} is a named token with a one-line derivation comment`);
  }
  assert.match(src, /import \{[^}]*METER_SHADOW[^}]*\} from '\.\.\/parts\/doodle'/, 'METER_SHADOW reused from doodle.tsx');
  const plate = src.indexOf('staticFile(bg.under)');
  const wash = src.indexOf('CARD_WASH', plate);
  const sheet = src.indexOf('SHEET_INSET', wash);
  assert.ok(plate > 0 && wash > plate && sheet > wash, 'under-plate, then wash, then sheet');
  assert.match(src.slice(plate - 400, plate + 200), /blur\(/, 'under-plate is blurred');
  assert.doesNotMatch(src, /!\('card' in bg\) && <Vignette\/>/, 'old vignette guard replaced');
  const vig = src.split('\n').find((l) => l.includes('<Vignette/>')) ?? '';
  assert.match(vig, /under/, 'vignette condition is under-aware (context cards get it, legacy flat cards do not)');
});

test('context card: doodle exports METER_SHADOW and the meter still uses it', () => {
  const src = read('engine/ink/parts/doodle.tsx');
  assert.match(src, /export const METER_SHADOW = Math\.round\(LINE \* 0\.9\)/);
  assert.match(src, /boxShadow: `\$\{METER_SHADOW\}px \$\{METER_SHADOW\}px 0 \$\{ink\}`/);
});
