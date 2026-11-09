// Camera rig: shots are hard cuts; inside a shot the camera glides from -> to with
// smootherstep, then creeps in on the hold; impact kicks shake + roll and flip sign.
import { lerp, lerp3, smoother, smoothNoise, V3 } from "./ease";

export type CamPose = { pos: V3; look: V3; fov: number };
export type Shot = {
  start: number; // frame the shot cuts in
  from: CamPose;
  to?: CamPose; // omit = locked pose (still creeps)
  glide?: number; // frames for from -> to (method: 18-40)
  creep?: number; // fraction of fov lost per frame on the hold (method: 0.0015-0.0035)
  kicks?: number[]; // absolute frames of impact kicks
  roll?: number; // kick roll in degrees (method: 4-5)
  handheld?: number; // low-frequency drift amplitude in world units
};

export const KICK_FRAMES = 7; // method: kick flips sign over 7 frames
export const DEFAULT_GLIDE = 30;
export const DEFAULT_CREEP = 0.0022;
export const MAX_CREEP = 0.22; // never creep more than 22% of fov in one hold

export const shotAt = (shots: Shot[], f: number) => {
  let s = shots[0];
  for (const x of shots) if (x.start <= f) s = x;
  return s;
};

export const solveCamera = (shots: Shot[], f: number) => {
  const s = shotAt(shots, f);
  const local = f - s.start;
  const glide = s.glide ?? DEFAULT_GLIDE;
  const to = s.to ?? s.from;
  const t = smoother(local / glide);
  const pos = lerp3(s.from.pos, to.pos, t);
  const look = lerp3(s.from.look, to.look, t);
  let fov = lerp(s.from.fov, to.fov, t);
  const hold = Math.max(0, local - (s.to ? glide : 0));
  fov *= 1 - Math.min(MAX_CREEP, hold * (s.creep ?? DEFAULT_CREEP));

  let roll = 0;
  const shake: V3 = [0, 0, 0];
  for (const k of s.kicks ?? []) {
    const d = f - k;
    if (d < 0 || d >= KICK_FRAMES) continue;
    const env = 1 - d / KICK_FRAMES;
    const sign = d % 2 === 0 ? 1 : -1;
    roll += sign * env * ((s.roll ?? 4.5) * Math.PI) / 180;
    shake[1] += sign * env * 0.04;
  }
  const h = s.handheld ?? 0.015;
  shake[0] += smoothNoise(f / 40, 1) * h;
  shake[1] += smoothNoise(f / 47, 2) * h;
  return { pos: [pos[0] + shake[0], pos[1] + shake[1], pos[2]] as V3, look, fov, roll, shot: s };
};
