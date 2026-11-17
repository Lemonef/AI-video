// v11B HUD chip position contract (brief docs/briefs/ink-v11b-chip-pos.md). Written by the planner BEFORE
// the build and protected. The TOWERS SOLD chips covered their shot's headline at the default top-left, so
// those two shots carry chipPos 'bl' (bottom-left). Every other chip, and all v10 data, keep the default.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const ROOT = new URL('../../', import.meta.url);
const read = (p) => readFileSync(new URL(p, ROOT), 'utf8');
const PARTS = Array.from({length: 22}, (_, i) => `p${String(i + 3).padStart(2, '0')}`);
const BOTTOM_LEFT = {12874: 'bl', 14370: 'bl'};
const shots = (dir) => PARTS.flatMap((p) => JSON.parse(read(`engine/ink/parts/${dir}/${p}.json`)).shots);

test('chip: TOWERS SOLD shots sit bottom-left, no other shot sets chipPos', () => {
  for (const s of shots('shots_v11b')) {
    if (BOTTOM_LEFT[s.f0]) assert.equal(s.chipPos, BOTTOM_LEFT[s.f0], `shot ${s.f0} chipPos`);
    else assert.equal(s.chipPos, undefined, `shot ${s.f0} must not set chipPos`);
  }
  for (const s of shots('shots_v10')) assert.equal(s.chipPos, undefined, `v10 shot ${s.f0} gained chipPos`);
});

test('chip: schema and chip component support the position', () => {
  assert.match(read('engine/ink/parts/schema.ts'), /chipPos\?:\s*'tl'\s*\|\s*'bl'/);
  const doodle = read('engine/ink/parts/doodle.tsx');
  assert.match(doodle, /DoodleChip[\s\S]*\bpos\b/, 'DoodleChip takes a pos prop');
  assert.match(doodle, /\bbottom\b/, 'DoodleChip can anchor to the bottom edge');
  assert.match(read('engine/ink/compositions/InkParts.tsx'), /chipPos/, 'InkParts passes shot.chipPos through');
});
