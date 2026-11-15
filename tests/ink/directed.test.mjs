import test from 'node:test';
import assert from 'node:assert/strict';
import {splitBeat, shotWindows, planEpisode, camAt, actorAt, WALK} from '../../engine/ink/ink/directed_plan.mjs';

test('directed: splitBeat keeps the beat total exact, last shot takes the remainder', () => {
  assert.deepEqual(splitBeat(177, [2, 1, 1]), [89, 44, 44]);
  assert.deepEqual(splitBeat(100, [1, 1, 1]), [33, 33, 34]);
  for (const ws of [[1], [5, 1], [1, 1, 1, 1, 1], [0, -1, NaN]]) assert.equal(splitBeat(91, ws).reduce((a, b) => a + b), 91);
  assert.ok(splitBeat(3, [100, 1, 1]).every((d) => d >= 1));
  assert.throws(() => splitBeat(2, [1, 1, 1]));
});

test('directed: timeline per-shot cuts win when counts match, else split by w', () => {
  const beat = {id: 'b', start: 100, dur: 90, shots: [{start: 100, dur: 40}, {start: 140, dur: 50}]};
  assert.deepEqual(shotWindows(beat, [{}, {}]), [{start: 100, dur: 40}, {start: 140, dur: 50}]);
  assert.deepEqual(shotWindows(beat, [{w: 2}, {w: 1}, {w: 0}]).map((w) => [w.start, w.dur]), [[100, 45], [145, 23], [168, 22]]);
});

test('directed: plan covers up to the last directed beat, gaps become missing shots', () => {
  const tl = {beats: [{id: 'a', start: 0, dur: 30, shots: [{start: 0, dur: 30}]}, {id: 'b', start: 30, dur: 30, shots: []}, {id: 'c', start: 60, dur: 30, shots: [{start: 60, dur: 30}]}, {id: 'd', start: 90, dur: 30, shots: []}]};
  const p = planEpisode(tl, {a: [{k: 'title'}], c: [{k: 'title'}], zz: [{k: 'title'}]});
  assert.equal(p.durationInFrames, 90);
  assert.deepEqual(p.shots.map((s) => [s.beat, s.shot.k]), [['a', 'title'], ['b', 'missing'], ['c', 'title']]);
  assert.deepEqual(p.unknown, ['zz']);
  assert.deepEqual(planEpisode(tl, {a: [{k: 'title'}], needed_plates: [{id: 'x'}], needed_poses: []}).unknown, []);
});

test('directed: pans never expose the plate edge (|tx| <= overscan margin)', () => {
  const W = 1920;
  for (const move of ['pan_l', 'pan_r', 'drift']) {
    for (let f = 0; f <= 60; f += 5) {
      const c = camAt({move, amt: 0.1}, f, 60, W);
      assert.ok(Math.abs(c.tx) <= ((c.s - 1) * W) / 2 + 1e-9, `${move} f${f}`);
    }
  }
  assert.equal(camAt({move: 'push', amt: 0.1}, 60, 60, W).s, 1.1);
  assert.equal(camAt({move: 'pull', amt: 0.1}, 60, 60, W).s, 1);
});

test('directed: walk travels from offset to rest with a bounded bob; pop hidden before at', () => {
  const a = {x: 600, enter: {how: 'walk', from: -400, at: 0, dur: 30}};
  assert.equal(actorAt(a, 0).x, 200);
  assert.equal(actorAt(a, 30).x, 600);
  for (let f = 0; f <= 30; f++) assert.ok(actorAt(a, f).lift <= 0 && actorAt(a, f).lift >= -WALK.bobPx);
  assert.equal(actorAt({x: 1, enter: {how: 'pop', at: 5}}, 4).visible, false);
  assert.equal(actorAt({x: 1, enter: {how: 'pop', at: 5}}, 5).visible, true);
});

test('directed: focus cam centres the focus point, zooms to target, never exposes an edge', () => {
  const W = 1920, H = 1080;
  const end = camAt({move: 'push', focus: {x: 0.5, y: 0.5}, zoom: 2.2}, 60, 60, W, H);
  assert.ok(Math.abs(end.s - 2.2) < 1e-9);
  for (const focus of [{x: 0, y: 0}, {x: 1, y: 1}, {x: 0.3, y: 0.7}, {x: 0.5, y: 0.5}]) {
    for (let f = 0; f <= 60; f += 6) {
      const c = camAt({move: 'push', focus, zoom: 2.4}, f, 60, W, H);
      assert.ok(c.tx <= (c.s - 1) * W * 0.5 + 1e-9 && c.tx >= -(c.s - 1) * W * 0.5 - 1e-9, `tx ${f}`);
      assert.ok(c.ty <= (c.s - 1) * H * 0.6 + 1e-9 && c.ty >= -(c.s - 1) * H * 0.4 - 1e-9, `ty ${f}`);
    }
  }
  assert.equal(camAt({move: 'pull', focus: {x: 0.5, y: 0.5}, zoom: 2}, 60, 60, W, H).s, 1);
});
