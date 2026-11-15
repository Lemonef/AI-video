import test from 'node:test';
import assert from 'node:assert/strict';
import {TOKENS, characterHeightPx} from '../../engine/ink/rig/tokens.mjs';
import {POSES} from '../../engine/ink/rig/pose.mjs';
import {FPS, buildTimeline, frameToBeat, totalFrames} from '../../engine/ink/comp/timeline.mjs';
import {CAPTION, captionSafeBox, chunkCaptions, activeChunk} from '../../engine/ink/comp/captions.mjs';
import {planSeam, poseDistance, SEAM} from '../../engine/ink/comp/seam.mjs';
import {GROUND_FRAC, groundY, renderPlate} from '../../engine/ink/comp/plate.mjs';
import {composeScene} from '../../engine/ink/comp/scene.mjs';

const locked = {fps: 30, beats: [{id: 'b1', start: 0, end: 3.0}, {id: 'b2', start: 3.0, end: 7.5}]};

test('timeline: FPS is 30 and beats become contiguous frame ranges', () => {
  assert.equal(FPS, 30);
  const t = buildTimeline(locked);
  assert.deepEqual(t.map((b) => [b.id, b.startFrame, b.endFrame]), [['b1', 0, 90], ['b2', 90, 225]]);
  assert.equal(totalFrames(t), 225);
});

test('timeline: rounding never leaves gaps (cumulative, not per-beat)', () => {
  const l = {fps: 30, beats: [{id: 'a', start: 0, end: 1.011}, {id: 'b', start: 1.011, end: 2.022}, {id: 'c', start: 2.022, end: 3.033}]};
  const t = buildTimeline(l);
  for (let i = 1; i < t.length; i++) assert.equal(t[i].startFrame, t[i - 1].endFrame);
  assert.equal(totalFrames(t), Math.round(3.033 * 30));
});

test('timeline: rejects wrong fps, non-finite times and end <= start', () => {
  assert.throws(() => buildTimeline({fps: 24, beats: locked.beats}));
  assert.throws(() => buildTimeline({fps: 30, beats: [{id: 'x', start: 0, end: NaN}]}));
  assert.throws(() => buildTimeline({fps: 30, beats: [{id: 'x', start: 2, end: 2}]}));
});

test('timeline: frameToBeat finds the beat, null outside', () => {
  const t = buildTimeline(locked);
  assert.equal(frameToBeat(t, 0).id, 'b1');
  assert.equal(frameToBeat(t, 89).id, 'b1');
  assert.equal(frameToBeat(t, 90).id, 'b2');
  assert.equal(frameToBeat(t, 225), null);
  assert.equal(frameToBeat(t, -1), null);
});

const words = [];
{
  const text = 'On the morning of the eruption the baker lit his oven before dawn. Smoke rose over the forum and the street woke slowly. By noon nobody guessed what the mountain was about to do.'.split(' ');
  text.forEach((w, i) => words.push({w, start: i * 0.4, end: i * 0.4 + 0.35}));
}

test('captions: safe box = 5% side margin, bottom edge above the lowest 12%', () => {
  const b = captionSafeBox();
  assert.equal(b.x, Math.round(TOKENS.frame.w * CAPTION.sideMarginFrac));
  assert.equal(b.x + b.w, TOKENS.frame.w - b.x);
  assert.ok(b.y + b.h <= TOKENS.frame.h * (1 - CAPTION.bottomZoneFrac) + 0.5);
  assert.ok(b.h > 0 && b.y > 0);
});

test('captions: max 2 lines of max 42 chars, order and words preserved', () => {
  const chunks = chunkCaptions(words);
  assert.ok(chunks.length >= 3);
  for (const c of chunks) {
    assert.ok(c.lines.length >= 1 && c.lines.length <= CAPTION.maxLines);
    for (const l of c.lines) assert.ok(l.length <= CAPTION.maxCharsPerLine, l);
    assert.equal(c.text, c.lines.join(' '));
  }
  assert.equal(chunks.map((c) => c.text).join(' '), words.map((w) => w.w).join(' '));
});

test('captions: chunk times follow the words, chronological, sentence end closes a chunk', () => {
  const chunks = chunkCaptions(words);
  for (let i = 0; i < chunks.length; i++) {
    assert.ok(chunks[i].end > chunks[i].start);
    if (i) assert.ok(chunks[i].start >= chunks[i - 1].end);
  }
  assert.equal(chunks[0].start, words[0].start);
  assert.equal(chunks[chunks.length - 1].end, words[words.length - 1].end);
  for (const c of chunks.slice(0, -1)) {
    const ends = /[.!?]$/.test(c.text);
    const next = chunks[chunks.indexOf(c) + 1];
    if (/^[A-Z]/.test(next.text) && /[.!?]$/.test(c.text) === false) {
      // a chunk may only continue past a sentence end if it did not contain one
      assert.ok(!/[.!?]\s/.test(c.text), c.text);
    }
    assert.ok(ends || c.text.length > 0);
  }
});

test('captions: activeChunk returns the chunk covering t, null in a gap', () => {
  const chunks = chunkCaptions(words);
  assert.equal(activeChunk(chunks, chunks[1].start + 0.01), chunks[1]);
  assert.equal(activeChunk(chunks, -1), null);
  assert.equal(activeChunk(chunks, 9999), null);
});

test('seam: matching pose -> match strategy with that pose, no crossfade ever', () => {
  const s = planSeam({clipLastPose: POSES.wave});
  assert.equal(s.strategy, 'match');
  assert.equal(s.pose, 'wave');
  assert.equal(s.holdSec, 0);
  assert.equal(poseDistance(POSES.wave, POSES.wave), 0);
});

test('seam: far pose -> hold last frame 0.5 s + 0.2 s dip; no clip pose -> hard cut', () => {
  const far = Object.fromEntries(Object.keys(POSES.idle).map((k) => [k, 170]));
  const s = planSeam({clipLastPose: far});
  assert.equal(s.strategy, 'hold-push');
  assert.equal(s.holdSec, SEAM.holdSec);
  assert.equal(s.dipSec, SEAM.dipSec);
  assert.equal(SEAM.holdSec, 0.5);
  assert.equal(SEAM.dipSec, 0.2);
  const h = planSeam({clipLastPose: null});
  assert.equal(h.strategy, 'hard-cut');
  for (const x of [s, h, planSeam({clipLastPose: POSES.idle})]) assert.notEqual(x.strategy, 'crossfade');
});

test('plate: ground line from a token, svg parses as a plate with paper colour', () => {
  assert.ok(GROUND_FRAC > 0.5 && GROUND_FRAC < 0.9);
  assert.equal(groundY(), Math.round(TOKENS.frame.h * GROUND_FRAC));
  const p = renderPlate();
  assert.ok(p.includes(TOKENS.palette.paper));
  assert.ok(!/<script|\bon\w+=/i.test(p));
});

test('scene: full 1920x1080 svg, stickman feet on the ground, caption above the bottom zone and escaped', () => {
  const chunk = {text: 'Tom & Jerry <b>', lines: ['Tom & Jerry <b>'], start: 0, end: 1};
  const s = composeScene({pose: POSES.point, x: 600, caption: chunk});
  assert.ok(s.startsWith('<svg') && s.endsWith('</svg>'));
  assert.ok(s.includes(`viewBox="0 0 ${TOKENS.frame.w} ${TOKENS.frame.h}"`));
  assert.ok(s.includes(`translate(600 ${groundY()})`));
  assert.ok(s.includes('Tom &amp; Jerry &lt;b&gt;'));
  assert.ok(!s.includes('<b>'));
  assert.ok(groundY() < captionSafeBox().y, 'ground line above the caption box');
  assert.ok(characterHeightPx() < groundY());
  assert.ok(!/<script|\bon\w+=/i.test(s));
  const none = composeScene({pose: POSES.idle, x: 600, caption: null});
  assert.ok(!none.includes('<text'));
});
