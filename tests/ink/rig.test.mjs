import test from 'node:test';
import assert from 'node:assert/strict';
import {TOKENS, characterHeightPx} from '../../engine/ink/rig/tokens.mjs';
import {POSES, poseNames, lerpPose} from '../../engine/ink/rig/pose.mjs';
import {jointPositions, renderStickman} from '../../engine/ink/rig/stickman.mjs';

const JOINTS = ['head', 'neck', 'hip', 'lElbow', 'lHand', 'rElbow', 'rHand', 'lKnee', 'lFoot', 'rKnee', 'rFoot'];

function hue(hex) {
  const n = parseInt(hex.slice(1), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => v / 255);
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
  if (d === 0) return -1; // grey: no hue
  let h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
  h *= 60;
  return h < 0 ? h + 360 : h;
}

test('tokens: frame is 1920x1080 and character height derives from the frame token', () => {
  assert.equal(TOKENS.frame.w, 1920);
  assert.equal(TOKENS.frame.h, 1080);
  assert.equal(characterHeightPx(), Math.round(TOKENS.frame.h * TOKENS.character.heightFrac));
  assert.ok(TOKENS.character.heightFrac > 0.1 && TOKENS.character.heightFrac < 0.6);
});

test('tokens: palette has hex colours and never red together with yellow', () => {
  const hues = Object.values(TOKENS.palette).map(hue).filter((h) => h >= 0);
  assert.ok(Object.values(TOKENS.palette).every((c) => /^#[0-9a-fA-F]{6}$/.test(c)));
  const red = hues.some((h) => h < 15 || h > 345);
  const yellow = hues.some((h) => h >= 45 && h <= 65);
  assert.ok(!(red && yellow), 'palette must not hold red and yellow together');
});

test('poses: at least 6 named poses including idle, point, wave, shrug, walkA, walkB', () => {
  for (const n of ['idle', 'point', 'wave', 'shrug', 'walkA', 'walkB']) assert.ok(poseNames().includes(n), n);
  assert.ok(poseNames().length >= 6);
});

test('poses: every pose defines the same angle keys', () => {
  const keys = Object.keys(POSES.idle).sort();
  for (const n of poseNames()) assert.deepEqual(Object.keys(POSES[n]).sort(), keys, n);
});

test('lerpPose: t=0 and t=1 give the endpoints, t=0.5 the midpoint', () => {
  const a = POSES.idle, b = POSES.wave;
  assert.deepEqual(lerpPose(a, b, 0), a);
  assert.deepEqual(lerpPose(a, b, 1), b);
  const m = lerpPose(a, b, 0.5);
  for (const k of Object.keys(a)) assert.ok(Math.abs(m[k] - (a[k] + b[k]) / 2) < 1e-9, k);
});

test('lerpPose: t is clamped to [0,1]', () => {
  assert.deepEqual(lerpPose(POSES.idle, POSES.wave, -3), POSES.idle);
  assert.deepEqual(lerpPose(POSES.idle, POSES.wave, 9), POSES.wave);
});

test('jointPositions: returns every joint with finite numbers', () => {
  const j = jointPositions(POSES.idle, 400);
  for (const k of JOINTS) {
    assert.ok(Number.isFinite(j[k].x) && Number.isFinite(j[k].y), k);
  }
});

test('jointPositions: idle stands upright, feet at the ground (y=0), head about heightPx above', () => {
  const h = 400;
  const j = jointPositions(POSES.idle, h);
  assert.ok(Math.abs(j.lFoot.y) < 1 && Math.abs(j.rFoot.y) < 1, 'feet on ground line y=0');
  const top = j.head.y; // head centre; y grows downward so head is negative
  assert.ok(top < j.neck.y && j.neck.y < j.hip.y && j.hip.y < j.lFoot.y + 1);
  const total = j.lFoot.y - (j.head.y - 0.5 * TOKENS.character.headFrac * h);
  assert.ok(Math.abs(total - h) / h < 0.03, `total height ${total} vs ${h}`);
});

test('jointPositions: scales linearly with heightPx', () => {
  const a = jointPositions(POSES.point, 200), b = jointPositions(POSES.point, 400);
  for (const k of JOINTS) {
    assert.ok(Math.abs(b[k].x - 2 * a[k].x) < 1e-6 && Math.abs(b[k].y - 2 * a[k].y) < 1e-6, k);
  }
});

test('jointPositions: bone lengths stay constant across poses (rigid limbs)', () => {
  const d = (p, q) => Math.hypot(p.x - q.x, p.y - q.y);
  const ref = jointPositions(POSES.idle, 400);
  for (const n of poseNames()) {
    const j = jointPositions(POSES[n], 400);
    assert.ok(Math.abs(d(j.neck, j.hip) - d(ref.neck, ref.hip)) < 1e-6, `${n} torso`);
    assert.ok(Math.abs(d(j.rElbow, j.rHand) - d(ref.rElbow, ref.rHand)) < 1e-6, `${n} forearm`);
    assert.ok(Math.abs(d(j.lKnee, j.lFoot) - d(ref.lKnee, ref.lFoot)) < 1e-6, `${n} shin`);
  }
});

test('wave pose raises the right hand above the head centre', () => {
  const j = jointPositions(POSES.wave, 400);
  assert.ok(j.rHand.y < j.head.y);
});

test('renderStickman: SVG group with head circle, limb lines, token stroke width, translate', () => {
  const s = renderStickman(POSES.idle, {heightPx: 400, x: 300, y: 900});
  assert.ok(s.startsWith('<g') && s.endsWith('</g>'));
  assert.ok(s.includes('<circle'));
  assert.ok((s.match(/<line|<path|<polyline/g) || []).length >= 5);
  assert.ok(s.includes(`stroke-width="${TOKENS.line.weightFrac * 400}"`) || s.includes(`stroke-width="${Math.round(TOKENS.line.weightFrac * 400)}"`));
  assert.ok(s.includes('translate(300') && s.includes('900'));
});

test('renderStickman: deterministic and no script/event attributes', () => {
  const a = renderStickman(POSES.point, {heightPx: 300, x: 0, y: 0});
  const b = renderStickman(POSES.point, {heightPx: 300, x: 0, y: 0});
  assert.equal(a, b);
  assert.ok(!/<script|\bon\w+=/i.test(a));
});
