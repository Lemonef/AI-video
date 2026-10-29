import test from 'node:test';
import assert from 'node:assert/strict';
import {walkCycle} from '../src/lib/walkCycle.ts';

test('depth walk keeps hips attached and a stance foot planted through the cycle', () => {
  for (let frame = 0; frame < 72; frame++) {
    const g = walkCycle(frame);
    for (const [leg, x] of [[g.left, -34], [g.right, 34]]) {
      assert.equal(leg.hipX, x);
      assert.equal(leg.hipY, -390);
      assert.ok(Math.abs(leg.kneeX - x) <= 3, 'no sideways kicking');
      assert.ok(Math.abs(leg.ankleX - x) <= 4);
      if (leg.lift === 0) assert.ok(Math.abs(leg.ankleY + g.bob + 25) < 1e-9, 'stance foot must stay on the floor while the pelvis bobs');
    }
    assert.ok(g.left.lift < 1e-8 || g.right.lift < 1e-8, 'one foot stays planted');
  }
});

test('footfalls repeat every eighteen frames, matching the audio cadence', () => {
  for (const frame of [0, 18, 36, 54]) {
    const g = walkCycle(frame);
    assert.ok(g.left.lift < 1e-8 && g.right.lift < 1e-8);
  }
});
