// Two-bone inverse kinematics for 2D character rigs (screen space, y down).
//
// Rigs key only the end effectors (hand, foot) and derive elbows/knees here,
// so limbs keep a constant length between keys and contacts land where the
// key says. Interpolating joint positions directly shortens the limb midway
// between two keys; that is the rubber-limb look this module removes.

export type Pt = [number, number];

const dist = (a: Pt, b: Pt) => Math.hypot(b[0]-a[0], b[1]-a[1]);

/** Bone lengths measured from one reference pose, so every rig derives its
 * proportions from its own drawing rather than from typed constants. */
export const boneLengths = (root: Pt, joint: Pt, end: Pt) =>
  ({upper: dist(root, joint), lower: dist(joint, end)});

/** Which side a reference pose bends to: +1 or -1 (sign of the 2D cross product
 * of root->end and root->joint). Straight poses report +1. */
export const bendSide = (root: Pt, joint: Pt, end: Pt): 1 | -1 =>
  (end[0]-root[0])*(joint[1]-root[1]) - (end[1]-root[1])*(joint[0]-root[0]) < 0 ? -1 : 1;

/**
 * Place the middle joint of a two-bone chain so the end reaches `target`.
 * Out of reach: the chain straightens toward the target and `end` stops short.
 * Too close (|upper-lower| > distance): the chain folds fully and `end` stops
 * at the minimum reach. `bend` picks the side the joint bends to.
 */
export const solveTwoBone = (root: Pt, target: Pt, upper: number, lower: number, bend: 1 | -1) => {
  const dx = target[0]-root[0], dy = target[1]-root[1];
  const raw = Math.hypot(dx, dy);
  const d = Math.min(upper+lower, Math.max(Math.abs(upper-lower), raw));
  // A target on the root has no direction; keep the chain pointing straight down.
  const base = raw > 0 ? Math.atan2(dy, dx) : Math.PI/2;
  const cos = d > 0 ? (upper*upper + d*d - lower*lower)/(2*upper*d) : 1;
  const angle = base + bend*Math.acos(Math.max(-1, Math.min(1, cos)));
  const joint: Pt = [root[0] + upper*Math.cos(angle), root[1] + upper*Math.sin(angle)];
  const end: Pt = [root[0] + d*Math.cos(base), root[1] + d*Math.sin(base)];
  return {joint, end, reached: Math.abs(d - raw) < 1e-9};
};
