// 9:16 Short composition contract (brief docs/briefs/ink-short-s01.md). Written by the planner BEFORE the
// build and protected. The Short re-plays ep01 V11B shots inside a 9:16 frame: hook header on top from frame 0,
// the 16:9 scene scaled to full width in the middle, word captions below, end card last.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const ROOT = new URL('../../', import.meta.url);
const read = (p) => readFileSync(new URL(p, ROOT), 'utf8');

test('root registers InkShortEp01S01 at 1080x1920 30fps with data-driven length', () => {
  const root = read('engine/ink/Root.tsx');
  const m = root.match(/<Composition id="InkShortEp01S01"[^>]*\/>/);
  assert.ok(m, 'composition registered');
  assert.match(m[0], /width=\{1080\}/);
  assert.match(m[0], /height=\{1920\}/);
  assert.match(m[0], /fps=\{30\}/);
  assert.doesNotMatch(m[0], /durationInFrames=\{\d+\}/, 'length must come from the short data, not a literal');
});

test('InkShort reuses the V11B parts and plays audio per clip', () => {
  const src = read('engine/ink/compositions/InkShort.tsx');
  assert.match(src, /InkParts/, 'renders the episode shots through InkParts');
  assert.match(src, /EP01_V11B_PARTS/, 'uses the v11B shot data');
  assert.match(src, /shorts\/ep01-s01\.json/, 'reads the generated short data');
  assert.match(src, /trimBefore|startFrom/, 'VO is cut per clip from the episode track');
  assert.match(src, /1920\s*\/\s*1080|STAGE_W|1080\s*\/\s*1920/, 'scene scale derived from stage size, not a literal');
});

test('generated data has hook, clips, words and end card', () => {
  const d = JSON.parse(read('engine/ink/parts/shorts/ep01-s01.json'));
  assert.equal(d.fps, 30);
  assert.ok(d.hook.length >= 2 && d.clips.length === 10 && d.words.length > 100);
  assert.equal(d.totalFrames, d.endCard.f1);
});
