// Poses are angle maps in DEGREES. 0 = pointing straight down, positive = counter-clockwise on screen
// (90 = right, 180 = up, -90 = left). All angles are absolute (not relative to the parent bone).
// Left limbs are on the screen-left (negative x) side of the figure.

const SPLAY = 3; // idle limb splay in degrees: avoids a rigid, mechanical stance

const pose = (torso, lShoulder, lElbow, rShoulder, rElbow, lHip, lKnee, rHip, rKnee) => ({
  torso, lShoulder, lElbow, rShoulder, rElbow, lHip, lKnee, rHip, rKnee,
});

export const POSES = {
  idle: pose(0, -8, -5, 8, 5, -SPLAY, -SPLAY, SPLAY, SPLAY),
  // Right arm horizontal, forearm continues the line (both 90).
  point: pose(0, -8, -5, 90, 90, -SPLAY, -SPLAY, SPLAY, SPLAY),
  // Right hand raised above the head centre.
  wave: pose(0, -8, -5, 135, 170, -SPLAY, -SPLAY, SPLAY, SPLAY),
  // Both upper arms out, forearms up.
  shrug: pose(0, -50, -150, 50, 150, -SPLAY, -SPLAY, SPLAY, SPLAY),
  // Walk cycle: legs and arms swing in opposition.
  walkA: pose(0, 25, 15, -25, -15, -25, -10, 20, 5),
  walkB: pose(0, -25, -15, 25, 15, 20, 5, -25, -10),
  sit: pose(0, -10, -20, 10, 20, -85, 0, 85, 0),
  lean: pose(12, -15, -10, 20, 15, -SPLAY, -SPLAY, SPLAY, SPLAY),
};

export function poseNames() {
  return Object.keys(POSES);
}

const clamp01 = (t) => Math.min(1, Math.max(0, t));

// Linear interpolation of every angle; t clamped to [0,1]; endpoints returned exactly.
export function lerpPose(a, b, t) {
  const u = clamp01(t);
  const out = {};
  for (const k of Object.keys(a)) out[k] = u === 0 ? a[k] : u === 1 ? b[k] : a[k] + (b[k] - a[k]) * u;
  return out;
}
