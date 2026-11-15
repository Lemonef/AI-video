// Pure planning + motion math for the directed Ink episode (src/ink/ep_directed.tsx). No React, no Remotion,
// so tests/directed.test.mjs runs it under plain `node --test`.

// ---------- timing ----------
// Split a beat's frames over its shots by relative weight w (default 1). Every shot but the last is rounded;
// the last takes the remainder so the beat's total is exact and cuts never drift from the voice.
export const splitBeat = (dur, weights) => {
  if (!Number.isInteger(dur) || dur < weights.length) throw new Error(`beat dur ${dur} cannot hold ${weights.length} shots`);
  const ws = weights.map((w) => (Number.isFinite(w) && w > 0 ? w : 1));
  const total = ws.reduce((a, b) => a + b, 0);
  const out = [];
  let used = 0;
  ws.forEach((w, i) => {
    const left = ws.length - i - 1; // frames to reserve so each later shot keeps at least 1
    const d = i === ws.length - 1 ? dur - used : Math.min(Math.max(1, Math.round((dur * w) / total)), dur - used - left);
    out.push(d);
    used += d;
  });
  return out;
};

// Timeline beat ({id,start,dur,shots:[{start,dur}]}) + directed shot list -> [{start,dur}] per directed shot.
// The timeline's own per-shot cuts win when their count matches (they come from the voice); otherwise split by w.
export const shotWindows = (beat, directed) => {
  const ts = beat.shots;
  if (Array.isArray(ts) && ts.length === directed.length) return ts.map((s) => ({start: s.start, dur: s.dur}));
  let at = beat.start;
  return splitBeat(beat.dur, directed.map((d) => d.w ?? 1)).map((dur) => {
    const w = {start: at, dur};
    at += dur;
    return w;
  });
};

// Whole plan: only beats inside the directed file's span render; a timeline beat in that span with no
// directed entry becomes a {k:'missing'} shot so a gap is visible instead of silent paper.
// Top-level keys of a directed file that are director requests, not beats (docs/directed-spec.md).
export const NON_BEAT_KEYS = new Set(['needed_plates', 'needed_poses']);

export const planEpisode = (timeline, directed) => {
  const ids = new Set(Object.keys(directed).filter((k) => Array.isArray(directed[k]) && !NON_BEAT_KEYS.has(k)));
  const order = timeline.beats.map((b) => b.id);
  const idx = order.map((id, i) => (ids.has(id) ? i : -1)).filter((i) => i >= 0);
  if (!idx.length) return {shots: [], durationInFrames: 0, unknown: [...ids]};
  const last = idx[idx.length - 1];
  const shots = [];
  for (let i = 0; i <= last; i++) {
    const b = timeline.beats[i];
    const list = directed[b.id];
    if (!Array.isArray(list)) {
      shots.push({beat: b.id, i: 0, start: b.start, dur: b.dur, shot: {k: 'missing'}});
      continue;
    }
    shotWindows(b, list).forEach((w, j) => shots.push({beat: b.id, i: j, ...w, shot: list[j]}));
  }
  const end = timeline.beats[last];
  return {shots, durationInFrames: end.start + end.dur, unknown: [...ids].filter((id) => !order.includes(id))};
};

// ---------- motion ----------
// Smoothstep-style ease (cubic in-out) on a clamped 0..1 progress.
export const clamp01 = (t) => Math.min(1, Math.max(0, t));
export const easeInOut = (t) => {
  const x = clamp01(t);
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
};

export const CAM = {
  defaultAmt: 0.06, // zoom delta / pan fraction when a shot gives no amt (matches the proof's 1.0 -> 1.05 push)
  driftSway: 0.25, // drift lateral travel as a fraction of amt (slow wander, not a pan)
};

// Camera state at frame f of a shot of length len: {s: scale, tx, ty: px translate}. Pans over-scale by amt so the
// translate range +-amt*W/2 never exposes the plate edge (scale 1+amt adds exactly amt*W/2 margin per side).
export const camAt = (cam, f, len, W) => {
  const move = cam?.move ?? 'hold';
  const amt = Number.isFinite(cam?.amt) ? cam.amt : CAM.defaultAmt;
  const t = easeInOut(f / Math.max(1, len));
  const half = (amt * W) / 2;
  switch (move) {
    case 'push': return {s: 1 + amt * t, tx: 0, ty: 0};
    case 'pull': return {s: 1 + amt * (1 - t), tx: 0, ty: 0};
    case 'pan_l': return {s: 1 + amt, tx: -half + 2 * half * t, ty: 0}; // camera moves left -> world slides right
    case 'pan_r': return {s: 1 + amt, tx: half - 2 * half * t, ty: 0};
    case 'drift': {
      const sway = half * CAM.driftSway;
      return {s: 1 + amt, tx: -sway + 2 * sway * t, ty: Math.sin((f / Math.max(1, len)) * Math.PI) * -sway * 0.5};
    }
    default: return {s: 1, tx: 0, ty: 0};
  }
};

export const WALK = {
  stridePx: 140, // feet travel per step; step count = distance / stride so long walks take more steps
  bobPx: 10, // peak lift per step (subtle: ~1.5% of the 640px figure)
};

// One travel leg: x from x0 to x1 over [at, at+dur]. walk adds a |sin| step-bob while moving.
const leg = (f, x0, x1, at, dur, walk) => {
  const p = clamp01((f - at) / Math.max(1, dur));
  const x = x0 + (x1 - x0) * easeInOut(p);
  const steps = Math.max(1, Math.round(Math.abs(x1 - x0) / WALK.stridePx));
  const moving = p > 0 && p < 1;
  const lift = walk && moving ? -Math.abs(Math.sin(p * steps * Math.PI)) * WALK.bobPx : 0;
  return {x, lift, moving};
};

// Actor position at frame f: {x, lift, visible, popAt}. enter.from is an x OFFSET from the rest x.
export const actorAt = (a, f) => {
  const en = a.enter ?? {how: 'none'};
  const how = en.how ?? 'none';
  const at = en.at ?? 0;
  const dur = en.dur ?? 18;
  let x = a.x;
  let lift = 0;
  if (how === 'walk' || how === 'slide') {
    const l = leg(f, a.x + (en.from ?? 0), a.x, at, dur, how === 'walk');
    x = l.x;
    lift = l.lift;
  }
  const mv = a.move;
  if (mv && Number.isFinite(mv.to) && f >= (mv.at ?? 0)) {
    const l = leg(f, a.x, mv.to, mv.at ?? 0, mv.dur ?? 30, true);
    x = l.x;
    lift = l.lift;
  }
  return {x, lift, visible: how !== 'pop' || f >= at, popAt: how === 'pop' ? at : null};
};

// Shake offset (deterministic, decays to 0 over durFrames).
export const SHAKE = {durFrames: 14, ampPx: 18};
export const shakeAt = (f) => {
  if (f >= SHAKE.durFrames) return {x: 0, y: 0};
  const k = (1 - f / SHAKE.durFrames) * SHAKE.ampPx;
  return {x: Math.sin(f * 2.7) * k, y: Math.cos(f * 3.9) * k * 0.6};
};
