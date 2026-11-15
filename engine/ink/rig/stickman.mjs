import {TOKENS} from './tokens.mjs';

// Proportions as fractions of heightPx. Derivation: head centre = neck joint - NECK - headRadius
// (headRadius = headFrac/2); top of head = head centre - headRadius; so top-of-head to feet
// = headFrac + NECK + TORSO + THIGH + SHIN = 0.16 + 0.06 + 0.30 + 0.24 + 0.24 = 1.0 x heightPx
// (standing idle is within 3% of heightPx; the arms do not count toward height).
const NECK = 0.06;
const TORSO = 0.30;
const THIGH = 0.24;
const SHIN = 0.24;
const UPPER_ARM = 0.17;
const FOREARM = 0.15;

const DEG = Math.PI / 180;
const COLOR_RE = /^(#[0-9a-fA-F]{3,8}|[a-zA-Z]+)$/; // keeps the color attribute free of markup
const DECIMALS = 100; // coordinate rounding: 2 decimals, plenty for sub-pixel accuracy

// Forward kinematics step: angle 0 = down, positive = counter-clockwise on screen, y grows downward.
const step = (p, len, deg) => ({x: p.x + len * Math.sin(deg * DEG), y: p.y + len * Math.cos(deg * DEG)});

export function jointPositions(pose, heightPx) {
  const h = heightPx;
  const headR = (TOKENS.character.headFrac / 2) * h;
  // Fixed shared space: ground origin (0,0), hip stays at its rest position in every pose.
  const hip = {x: 0, y: -(THIGH + SHIN) * h};
  // Torso runs neck -> hip along the torso angle, so the neck is the hip stepped backwards.
  const neck = step(hip, -TORSO * h, pose.torso);
  // Head sits on the opposite side of the neck along the same axis.
  const head = step(neck, -(NECK * h + headR), pose.torso);
  const lElbow = step(neck, UPPER_ARM * h, pose.lShoulder);
  const lHand = step(lElbow, FOREARM * h, pose.lElbow);
  const rElbow = step(neck, UPPER_ARM * h, pose.rShoulder);
  const rHand = step(rElbow, FOREARM * h, pose.rElbow);
  const lKnee = step(hip, THIGH * h, pose.lHip);
  const lFoot = step(lKnee, SHIN * h, pose.lKnee);
  const rKnee = step(hip, THIGH * h, pose.rHip);
  const rFoot = step(rKnee, SHIN * h, pose.rKnee);
  return {head, neck, hip, lElbow, lHand, rElbow, rHand, lKnee, lFoot, rKnee, rFoot};
}

const n = (v) => Math.round(v * DECIMALS) / DECIMALS;

export function renderStickman(pose, {heightPx, x = 0, y = 0, color = TOKENS.palette.ink} = {}) {
  if (!COLOR_RE.test(color)) throw new Error(`invalid color: ${color}`);
  const tx = Number(x), ty = Number(y);
  if (!Number.isFinite(tx) || !Number.isFinite(ty)) throw new Error('x and y must be finite numbers');
  const j = jointPositions(pose, heightPx);
  const sw = TOKENS.line.weightFrac * heightPx;
  const attrs = `stroke="${color}" stroke-width="${sw}" stroke-linecap="round" fill="none"`;
  const line = (a, b) => `<line x1="${n(a.x)}" y1="${n(a.y)}" x2="${n(b.x)}" y2="${n(b.y)}" ${attrs}/>`;
  const r = (TOKENS.character.headFrac * heightPx) / 2;
  return [
    `<g transform="translate(${tx} ${ty})">`,
    `<circle cx="${n(j.head.x)}" cy="${n(j.head.y)}" r="${n(r)}" ${attrs}/>`,
    line(j.neck, j.hip),
    line(j.neck, j.lElbow), line(j.lElbow, j.lHand),
    line(j.neck, j.rElbow), line(j.rElbow, j.rHand),
    line(j.hip, j.lKnee), line(j.lKnee, j.lFoot),
    line(j.hip, j.rKnee), line(j.rKnee, j.rFoot),
    '</g>',
  ].join('');
}
