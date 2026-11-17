// Card library job 2a contract (brief docs/briefs/ink-card-lib-2a.md): the 9 batch-1 carry-in fixes only.
// Written by the planner BEFORE the build and protected. Structural only; the planner re-reads stills after merge.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const ROOT = new URL('../../', import.meta.url);
const read = (p) => readFileSync(new URL(p, ROOT), 'utf8');
const CROSS_MARK = ['CROSS_MARK_INSET_X', 'CROSS_MARK_INSET_Y', 'CROSS_MARK_SPAN_X', 'CROSS_MARK_SPAN_Y'];
const iconCase = (src, name) => {
  const m = src.match(new RegExp(`case '${name}':([\\s\\S]*?)(?=case '|default:)`));
  assert.ok(m, `icons.tsx has no case '${name}'`);
  return m[1];
};
// The checklist mark expression: `const mark = row.mark === 'tick' ? <tick> : <cross>;`
const markParts = (src) => {
  const m = src.match(/const mark = row\.mark === 'tick' \?([\s\S]*?) :([\s\S]*?);\r?\n/);
  assert.ok(m, 'checklist mark expression not found (keep the tick ? : shape)');
  return {tick: m[1], cross: m[2]};
};

test('2a fix 1: EASE_POWER split into POP_EASE and COUNT_EASE', () => {
  const src = read('engine/ink/parts/cards.tsx');
  assert.doesNotMatch(src, /\bEASE_POWER\b/);
  assert.match(src, /\bPOP_EASE\s*=/);
  assert.match(src, /\bCOUNT_EASE\s*=/);
});

test('2a fix 2: tick and X marks use only their own constants', () => {
  const src = read('engine/ink/parts/cards.tsx');
  const {tick, cross} = markParts(src);
  for (const n of CROSS_MARK) assert.match(src, new RegExp(`\\b${n}\\s*=`), `${n} missing`);
  assert.doesNotMatch(tick, /CROSS_/, 'tick path uses a cross constant');
  assert.doesNotMatch(cross, /TICK_|MARK_LEFT/, 'X path uses a tick constant');
  assert.doesNotMatch(cross, /BOX\s*\/\s*2/, 'X span must be a named constant, not BOX / 2');
});

test('2a fix 3: divider control points named, lower one its own constant', () => {
  const src = read('engine/ink/parts/cards.tsx');
  assert.doesNotMatch(src, /\bDIVIDER_CONTROL_Y\b/);
  const line = src.split('\n').find((l) => /\bDIVIDER_CTRL_Y\s*=/.test(l));
  assert.ok(line && /bezier|control/i.test(line), 'DIVIDER_CTRL_Y needs its control-point comment');
  assert.match(src, /\bDIVIDER_LOWER_CTRL_Y\s*=/);
  assert.doesNotMatch(src, /Q\$\{CX - DIVIDER_BOW\} \$\{DIVIDER_BOTTOM\}/, 'lower stroke still uses DIVIDER_BOTTOM as control');
});

test('2a fix 5: CROSS_NATIVE_END change-together comment', () => {
  const line = read('engine/ink/parts/cards.tsx').split('\n').find((l) => /CROSS_NATIVE_END\s*=/.test(l));
  assert.ok(line && /change together/i.test(line));
});

test('2a fix 6+7: colour override through base(), wobbly windows', () => {
  const src = read('engine/ink/parts/icons.tsx');
  assert.doesNotMatch(iconCase(src, 'tower'), /fill=\{DOODLE\.brown\}/);
  assert.doesNotMatch(iconCase(src, 'crown'), /fill=\{DOODLE\.yellow\}/);
  for (const n of ['factory', 'hotel']) assert.doesNotMatch(iconCase(src, n), /<rect\b/, `${n} windows must be wobbly paths`);
});

test('2a fix 8: hero label gap is a named constant used by HeroElement', () => {
  const src = read('engine/ink/parts/cards.tsx');
  assert.match(src, /\bHERO_LABEL_GAP\s*=/);
  const hero = src.match(/export const HeroElement[\s\S]*?\r?\n};?\r?\n/);
  assert.ok(hero && /HERO_LABEL_GAP/.test(hero[0]), 'HeroElement must use HERO_LABEL_GAP');
});

test('2a fix 9: no unused UPPERCASE top-level constants in cards.tsx', () => {
  const src = read('engine/ink/parts/cards.tsx');
  const names = [];
  for (const line of src.split('\n')) {
    if (!/^(?:export\s+)?const\s+/.test(line)) continue;
    for (const d of line.replace(/^(?:export\s+)?const\s+/, '').split(/,(?![^(]*\))/)) {
      const n = d.trim().match(/^([A-Z][A-Z0-9_]*)\s*=/);
      if (n) names.push(n[1]);
    }
  }
  assert.ok(names.length > 0);
  for (const n of names) assert.ok(src.match(new RegExp(`\\b${n}\\b`, 'g') || []).length >= 2, `${n} unused`);
});

test('2a: touched sources are ASCII-only', () => {
  for (const f of ['engine/ink/parts/cards.tsx', 'engine/ink/parts/icons.tsx']) {
    const bad = [...read(f)].find((ch) => ch.charCodeAt(0) > 127);
    assert.equal(bad, undefined, `${f} has non-ASCII ${JSON.stringify(bad)}`);
  }
});
