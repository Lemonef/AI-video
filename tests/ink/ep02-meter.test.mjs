// ep02 HUD survival-odds meter contract (brief docs/briefs/ink-ep02-meter.md). Written by the planner BEFORE
// the build and protected. A shot may carry meter {label, value, from?} (0-100); a boiled hand-drawn bar sits
// top-right (the chip owns top-left, the watermark bottom-right) and eases from `from` to `value` as the shot
// opens. At or below METER_DANGER the bar inks red. Older cuts (v10, v11b) never gain a meter.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {METER_MAX, METER_DANGER, METER_TWEEN, meterAt, meterTone} from '../../engine/ink/parts/meter.mjs';

const ROOT = new URL('../../', import.meta.url);
const read = (p) => readFileSync(new URL(p, ROOT), 'utf8');
const PARTS = Array.from({length: 22}, (_, i) => `p${String(i + 3).padStart(2, '0')}`);
const shots = (dir) => PARTS.flatMap((p) => JSON.parse(read(`engine/ink/parts/${dir}/${p}.json`)).shots);

test('meter: constants are sane and come from one place', () => {
  assert.equal(METER_MAX, 100);
  assert.ok(METER_DANGER > 0 && METER_DANGER < METER_MAX / 2, 'danger threshold sits in the low half');
  assert.ok(Number.isInteger(METER_TWEEN) && METER_TWEEN > 0, 'tween length is whole frames');
});

test('meter: meterAt eases from `from` to `value` over METER_TWEEN frames', () => {
  assert.equal(meterAt({value: 30, from: 80}, 0), 80, 'starts at from');
  assert.equal(meterAt({value: 30, from: 80}, METER_TWEEN), 30, 'lands on value');
  assert.equal(meterAt({value: 30, from: 80}, METER_TWEEN * 5), 30, 'holds after the tween');
  const mid = meterAt({value: 30, from: 80}, Math.floor(METER_TWEEN / 2));
  assert.ok(mid < 80 && mid > 30, `mid-tween ${mid} lies between from and value`);
  assert.equal(meterAt({value: 42}, 0), 42, 'no from = no motion');
  assert.equal(meterAt({value: 42}, -10), 42, 'negative frame clamps');
});

test('meter: meterAt clamps to 0..METER_MAX', () => {
  assert.equal(meterAt({value: 140}, METER_TWEEN), METER_MAX);
  assert.equal(meterAt({value: -5}, METER_TWEEN), 0);
  assert.equal(meterAt({value: 50, from: 999}, 0), METER_MAX);
});

test('meter: meterTone turns red at or below the danger line', () => {
  assert.equal(meterTone(METER_DANGER), 'red');
  assert.equal(meterTone(0), 'red');
  assert.equal(meterTone(METER_DANGER + 1), 'ink');
  assert.equal(meterTone(METER_MAX), 'ink');
});

test('meter: schema, component and render are wired', () => {
  assert.match(read('engine/ink/parts/schema.ts'), /meter\?:\s*\{\s*label:\s*string;\s*value:\s*number;\s*from\?:\s*number\s*;?\s*\}/);
  const doodle = read('engine/ink/parts/doodle.tsx');
  assert.match(doodle, /export const DoodleMeter\b/, 'doodle.tsx exports DoodleMeter');
  assert.match(doodle, /DoodleMeter[\s\S]*\bright\b/, 'DoodleMeter anchors to the right edge');
  assert.match(doodle, /from '\.\/meter\.mjs'/, 'DoodleMeter takes its math from meter.mjs');
  const parts = read('engine/ink/compositions/InkParts.tsx');
  assert.match(parts, /shot\.meter/, 'InkParts renders shot.meter');
  assert.match(parts, /BoiledMeter[\s\S]*useBoil\(\)/, 'meter is boiled like the chip');
  assert.match(read('tools/ink/make_ep02_min1_shots.py'), /def S\([^)]*\bmeter=None/, 'S() accepts meter');
});

test('meter: older cuts never carry a meter', () => {
  for (const dir of ['shots_v10', 'shots_v11b']) {
    for (const s of shots(dir)) assert.equal(s.meter, undefined, `${dir} shot ${s.f0} gained a meter`);
  }
});
