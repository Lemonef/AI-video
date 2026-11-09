// mood01 "ฟ้าตามอารมณ์": everyone's mood floats above them as weather; at a Friday Asok jam the
// clouds merge into one storm, and small kindnesses clear it. No main character: an ensemble.
// Timing master = the locked voice take (public/mood01/timing.json); shot cut points = episode json.
import React from "react";
import { AbsoluteFill, Html5Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import timing from "../../public/mood01/timing.json";
import ep from "../../episodes/mood01.json";
import { Card, Look, Pose } from "./engine/Card";
import { CamPose, Shot, solveCamera } from "./engine/camera";
import { clamp01, hash, lerp, lerp3, smoother, V3 } from "./engine/ease";
import { Car, Ground, Motorbike, PoleLine, Road, ShopRow, Sky, Stall, Tower, Umbrella, Viaduct } from "./engine/world";
import { Flood, Lightning, MoodCloud, RainField, SunShaft } from "./engine/weather";
import { BigTitle, Captions2 } from "../v2/ui";
import { sfxFile } from "../v2/sound";
import type { Cue } from "../types";

export const FPS = 30;
const TAIL_SEC = 2.6; // end-question hold after the last word
type SceneT = { id: string; start: number; dur: number; cues: Cue[] };
const T = timing as unknown as Record<string, { duration: number; cues: Cue[] }>;
const SCENES: SceneT[] = (() => {
  let s = 0;
  return ep.scenes.map((sc) => {
    const x = { id: sc.id, start: s, dur: T[sc.id].duration, cues: T[sc.id].cues };
    s += x.dur;
    return x;
  });
})();
const SC = Object.fromEntries(SCENES.map((s) => [s.id, s])) as Record<string, SceneT>;
const VOICE_END = SCENES[SCENES.length - 1].start + SCENES[SCENES.length - 1].dur;
export const MOOD01_FRAMES = Math.ceil((VOICE_END + TAIL_SEC) * FPS);
/** absolute seconds of a point inside a scene, by fraction or by seconds-into-scene */
const at = (id: string, sec: number) => SC[id].start + sec;
const ramp = (t: number, a: number, b: number) => smoother((t - a) / (b - a));

// ---------- story clock (absolute seconds, read off the voice cues) ----------
const EV = {
  setB: SC.jam.start,
  horn1: at("horn", 0.3),
  horn2: at("merge", 0.35),
  horn3: at("merge", 1.48),
  argue: at("merge", 2.3),
  flowA: at("merge", 4.6),
  flowB: at("storm", 1.2),
  strike: at("storm", 3.2),
  floodA: at("storm", 4.5),
  floodB: at("storm", 6.5),
  lookUp: at("realise", 0.3),
  engineOff: at("umbrella", 1.25),
  give: at("umbrella", 2.0),
  shaft1: at("light", 1.3),
  shaft2: at("light", 2.95),
  shaft3: at("light", 3.8),
  clear: at("clear", 0.1),
  clearDone: at("clear", 3.0),
  endCard: VOICE_END + 0.1,
};

// ---------- sky / light grade (keyframes in seconds) ----------
type Grade = { top: string; hor: string; sun: number; amb: number; fogFar: number };
const GRADE: Array<[number, Grade]> = [
  [0, { top: "#3e7fd2", hor: "#b8d0ec", sun: 2.6, amb: 1.0, fogFar: 260 }],
  [SC.secret.start + 3, { top: "#3e7fd2", hor: "#c4d6ec", sun: 2.6, amb: 1.0, fogFar: 260 }],
  [EV.setB, { top: "#4a78b8", hor: "#e6c6a0", sun: 2.2, amb: 0.95, fogFar: 240 }],
  [EV.horn2, { top: "#56657a", hor: "#b9ad9e", sun: 1.5, amb: 0.85, fogFar: 200 }],
  [EV.flowB, { top: "#2c323e", hor: "#646b78", sun: 0.6, amb: 0.85, fogFar: 130 }],
  [EV.shaft1, { top: "#2c323e", hor: "#646b78", sun: 0.6, amb: 0.85, fogFar: 130 }],
  [EV.clear, { top: "#3a4058", hor: "#9a7e72", sun: 0.9, amb: 0.75, fogFar: 160 }],
  [EV.clearDone, { top: "#3f4f8e", hor: "#f2994a", sun: 1.8, amb: 0.9, fogFar: 240 }],
];
const tmpA = new THREE.Color();
const tmpB = new THREE.Color();
const mixHex = (a: string, b: string, k: number) => "#" + tmpA.set(a).lerp(tmpB.set(b), k).getHexString();
const gradeAt = (t: number): Grade => {
  let i = 0;
  while (i < GRADE.length - 1 && GRADE[i + 1][0] <= t) i++;
  const [ta, a] = GRADE[i];
  const next = GRADE[Math.min(i + 1, GRADE.length - 1)];
  const k = next[0] === ta ? 0 : smoother((t - ta) / (next[0] - ta));
  const b = next[1];
  return { top: mixHex(a.top, b.top, k), hor: mixHex(a.hor, b.hor, k), sun: lerp(a.sun, b.sun, k), amb: lerp(a.amb, b.amb, k), fogFar: lerp(a.fogFar, b.fogFar, k) };
};

// ---------- cast (no lead: everyone gets one beat) ----------
const SKIN = ["#e9bd93", "#d8a47a", "#c78d63", "#f1cba3", "#b97f58"];
const look = (i: number, o: Partial<Look> = {}): Look => ({
  skin: SKIN[i % SKIN.length],
  shirt: ["#f2f2f0", "#9cc3e6", "#f2c94c", "#e2725b", "#6fb98f", "#c9a7e0", "#ffffff", "#7f8fa6"][i % 8],
  pants: ["#2f3a4a", "#4b4b52", "#6b5a45", "#1f2630"][i % 4],
  hair: (["short", "bob", "long", "short", "bun", "cap", "short", "bob"] as Look["hair"][])[i % 8],
  hairColor: "#1b1416",
  capColor: "#c0392b",
  height: 1.62 + hash(i * 9) * 0.16,
  ...o,
});

type Mood = "sun" | "cloud" | "dark" | "none";
type Walker = { id: number; x0: number; z: number; v: number; mood: Mood; face: Pose["face"]; arms?: Pose["arms"]; look: Look };
// soi set: sidewalks at z = -5 (north) and z = +5 (south); road z in [-3.5, 3.5]
const WALKERS: Walker[] = [
  { id: 0, x0: -3, z: -4.8, v: 0.9, mood: "sun", face: "smile", look: look(0, { shirt: "#f2c94c" }) }, // rules: sun guy
  { id: 1, x0: 4, z: -4.6, v: 0.55, mood: "cloud", face: "worried", arms: "phone", look: look(1, { hair: "bob", shirt: "#9cc3e6" }) }, // rules: no coffee yet
  { id: 2, x0: -9, z: 4.9, v: 0.8, mood: "cloud", face: "neutral", look: look(2) },
  { id: 3, x0: 12, z: 5.1, v: -0.7, mood: "sun", face: "smile", look: look(3, { hair: "long" }) },
  { id: 4, x0: -16, z: -5.1, v: 0.75, mood: "none", face: "neutral", look: look(4, { hair: "cap" }) },
  { id: 5, x0: 20, z: -4.9, v: -0.85, mood: "cloud", face: "worried", look: look(5) },
  { id: 6, x0: -22, z: 5.0, v: 0.9, mood: "sun", face: "smile", look: look(6, { hair: "bun" }) },
  { id: 7, x0: 26, z: 4.7, v: -0.6, mood: "dark", face: "sad", look: look(7) },
];
const AUNTIE = { pos: [10, 0, -5.9] as V3, look: look(3, { hair: "bun", shirt: "#e2725b", vest: "#f4efe6", height: 1.56 }) };
const BOSSED = { pos: [10.2, 0, -3.9] as V3, look: look(6, { shirt: "#ffffff", pants: "#1f2630", glasses: true }) };
const STALL_POS: V3 = [10, 0, -5.1];
const RAIN_TOWER = { pos: [-20, 0, 14] as V3, w: 14, d: 12, h: 38 };
const PAIR = [
  { pos: [-1.2, 0, -4.7] as V3, look: look(5, { hair: "long", shirt: "#c9a7e0" }) },
  { pos: [1.2, 0, -4.5] as V3, look: look(2, { shirt: "#6fb98f" }) },
];

// asok set: road X lanes z = +-2, +-6 (width 16); road Z lanes x = +-1.75, +-5.25; BTS viaduct beside road X at z=-13 (kept off the box so look-up shots see the storm)
const CARS: Array<{ pos: V3; rotY: number; seed: number; taxi: boolean }> = (() => {
  const out: Array<{ pos: V3; rotY: number; seed: number; taxi: boolean }> = [];
  let s = 1;
  for (const z of [-6, -2, 2, 6])
    for (let x = -54; x <= 54; x += 6.4) {
      if (Math.abs(x) < 9 && !(z === 2 && x > 0)) continue; // keep the box mostly open (one car stuck in it)
      const j = (hash(s * 3) - 0.5) * 1.2;
      out.push({ pos: [x + j, 0, z], rotY: z < 0 ? 0 : Math.PI, seed: s, taxi: hash(s * 11) > 0.72 });
      s++;
    }
  for (const x of [-5.25, -1.75, 1.75, 5.25])
    for (let z = -48; z <= 48; z += 6.4) {
      if (Math.abs(z) < 10) continue;
      out.push({ pos: [x, 0, z + (hash(s * 5) - 0.5)], rotY: x < 0 ? Math.PI / 2 : -Math.PI / 2, seed: s, taxi: hash(s * 11) > 0.72 });
      s++;
    }
  return out;
})();
// drivers whose clouds float over their cars (index into CARS-like positions on lanes near camera)
const JAM_CLOUDS: Array<{ pos: V3; seed: number; first?: boolean }> = [
  { pos: [-9.2, 4.0, -2], seed: 1, first: true },
  { pos: [-15.6, 4.4, -6], seed: 2 },
  { pos: [-22, 4.3, -2], seed: 3 },
  { pos: [13, 4.5, 2], seed: 4 },
  { pos: [19.4, 4.2, 6], seed: 5 },
  { pos: [-1.75, 4.4, -16], seed: 6 },
  { pos: [5.25, 4.3, 17], seed: 7 },
  { pos: [-32.8, 4.6, -6], seed: 8 },
  { pos: [26, 4.4, 2], seed: 9 },
  { pos: [-5.25, 4.2, 22], seed: 10 },
];
const STORM_CENTER: V3 = [0, 30, 0];
const ARGUERS = [
  { pos: [-6.4, 0, -2.6] as V3, look: look(0, { shirt: "#ffffff", glasses: true }) }, // the shouter
  { pos: [-4.6, 0, -2.3] as V3, look: look(7, { shirt: "#7f8fa6" }) },
  { pos: [-6.9, 0, 0.6] as V3, look: look(4, { hair: "cap" }) },
  { pos: [-4.1, 0, 1.0] as V3, look: look(1, { hair: "bob", shirt: "#e2725b" }) },
];
const WIN = { bike: [-3.4, 0, -6.6] as V3, pos: [-4.2, 0, -5.8] as V3, look: look(3, { vest: "#f07a1a", hair: "short", shirt: "#2f3a4a" }) };
const SHAFTS: Array<{ at: V3; t: number }> = [
  { at: [-6.0, 0, -3.0], t: EV.shaft1 }, // on the umbrella pair
  { at: [13, 0, 4], t: EV.shaft2 },
  { at: [-2, 0, -18], t: EV.shaft3 },
];

// ---------- shots: poses per scene, cut points from the episode json ----------
const P = (pos: V3, look: V3, fov: number): CamPose => ({ pos, look, fov });
type ShotDef = Omit<Shot, "start"> & { kickAt?: number[] };
const SHOTS: Record<string, ShotDef[]> = {
  hook: [
    { from: P([-20, 10, 12], [2, 3, -3], 52), to: P([-13, 6.5, 9], [2, 3.4, -3], 46), glide: 60, kickAt: [0.03] },
    { from: P([2.4, 0.9, 1.6], [0, 4.5, -6], 50), to: P([1.6, 0.8, 1.0], [0, 5, -6], 46), glide: 50 },
  ],
  morning: [
    { from: P([0, 1.6, 9], [0, 3, -10], 50), to: P([0, 7, 11], [-6, 12, -30], 48), glide: 40 },
    { from: P([7, 1.5, 1], [0, 1.6, -5], 36) },
  ],
  rules: [
    { from: P([-1.5, 1.5, 0.8], [-1.0, 2.0, -4.8], 42), to: P([-0.5, 1.4, 0.2], [-0.3, 2.1, -4.8], 36), glide: 40 },
    { from: P([7.5, 1.3, -0.5], [5.4, 2.0, -4.6], 36) },
    { from: P([1.5, 3.2, 7], [1.8, 2.2, -4.6], 50), to: P([2.2, 2.6, 5], [2.4, 2.2, -4.6], 46), glide: 40 },
  ],
  nohide: [
    { from: P([-14, 4, 5], [0, 2.6, -5], 50), to: P([-8, 3, 4], [4, 2.4, -5], 46), glide: 50 },
    { from: P([12.6, 1.7, -0.8], [10, 1.5, -5.6], 38) },
    { from: P([10.8, 1.55, -3.0], [10, 1.55, -5.9], 30), kickAt: [0.1] },
  ],
  forecast: [
    { from: P([0, 1.6, 4], [0, 2.4, -6], 46) },
    { from: P([-6, 1.6, -2], [-20, 18, 14], 52), to: P([-6, 1.4, -1], [-20, 26, 14], 50), glide: 50 },
    { from: P([-4, 9, -4], [-14, 0, 5], 50), to: P([-2, 8, -3], [-12, 0, 5], 46), glide: 50 },
  ],
  secret: [
    { from: P([0, 1.1, 2.5], [0, 2.4, -4.6], 44) },
    { from: P([0, 2.8, -1.2], [0, 3.2, -4.6], 34) },
  ],
  jam: [
    { from: P([-72, 24, 9], [0, 4, 0], 46), to: P([-56, 17, 8], [0, 4, 0], 44), glide: 60 },
    { from: P([-2, 1.4, -4.2], [-30, 1.2, -4], 40) },
  ],
  horn: [
    { from: P([-3, 2.2, 3], [-9.2, 2.6, -2], 50), kickAt: [0.3] },
    { from: P([-4.2, 2.4, 1.6], [-9.2, 4.0, -2], 44) },
  ],
  merge: [
    { from: P([-1, 2.2, 1.6], [-14, 2.8, -3], 46), kickAt: [0.35, 1.48] },
    { from: P([-5.5, 1.5, 1.8], [-5.5, 1.4, -2.5], 38) },
    { from: P([-30, 8, 18], [0, 14, 0], 50), to: P([-36, 10, 21], [0, 20, 0], 56), glide: 70 },
  ],
  storm: [
    { from: P([-24, 3, 14], [0, 22, 0], 60), to: P([-20, 2.5, 12], [0, 26, 0], 62), glide: 60 },
    { from: P([-14, 2.5, 11], [-6, 9, 1], 52), kickAt: [3.2] },
    { from: P([-3.4, 0.35, 0.6], [-6, 0.4, -2.4], 40) },
  ],
  realise: [
    { from: P([-2.6, 0.9, 1.4], [-6, 2.8, -2.2], 62) },
    { from: P([-1, 0.5, 6], [-6, 8, -3], 64), to: P([-1.5, 0.5, 6.5], [-5, 12, -3], 64), glide: 60 },
    { from: P([-9, 1.2, 10], [-2, 24, -4], 70), to: P([-9, 1.2, 10.8], [-2, 28, -4], 72), glide: 60 },
  ],
  umbrella: [
    { from: P([-1.4, 1.4, -8.4], [-4.2, 1.2, -5.8], 40) },
    { from: P([-1.2, 1.7, 0.8], [-5.6, 1.4, -3.2], 48) },
  ],
  light: [
    { from: P([1.5, 2.2, 4], [-6, 3, -3], 50) },
    { from: P([-30, 14, 21], [0, 2, -4], 56), to: P([-26, 12, 19], [0, 2, -4], 54), glide: 60 },
  ],
  clear: [
    { from: P([-14, 2.5, 11], [0, 18, 0], 62), to: P([-14, 3.5, 11], [0, 14, 0], 58), glide: 60 },
    { from: P([-24, 5, 20], [0, 4, 0], 50), to: P([-36, 26, 34], [0, 2, 0], 50), glide: 80 },
  ],
  end: [
    { from: P([-1.4, 1.9, 1.2], [-6, 1.6, -3.2], 50) },
    { from: P([0, 16, 26], [0, 3, 0], 50), to: P([0, 40, 70], [0, 5, 0], 50), glide: 120 },
  ],
};
const ALL_SHOTS: Shot[] = ep.scenes.flatMap((sc) => {
  const s = SC[sc.id];
  const defs = SHOTS[sc.id];
  return sc.shots.map((sh, i) => {
    const d = defs[Math.min(i, defs.length - 1)];
    const start = Math.round((s.start + sh.at * s.dur) * FPS);
    const { kickAt, ...rest } = d;
    return { ...rest, start, handheld: 0.02, kicks: (kickAt ?? []).map((k) => Math.round((s.start + k) * FPS)) };
  });
});

// ---------- rig ----------
const Rig: React.FC<{ frame: number }> = ({ frame }) => {
  const { camera } = useThree();
  const c = solveCamera(ALL_SHOTS, frame);
  const cam = camera as THREE.PerspectiveCamera;
  cam.position.set(...c.pos);
  cam.up.set(0, 1, 0);
  cam.lookAt(...c.look);
  cam.rotateZ(c.roll);
  cam.fov = c.fov;
  cam.near = 0.1;
  cam.far = 900;
  cam.updateProjectionMatrix();
  return null;
};

// ---------- set A: the soi ----------
const personalWeather = (mood: Mood, pos: V3, h: number, frame: number, seed: number, wet = 0) => {
  const head: V3 = [pos[0], h + 0.95, pos[2]];
  if (mood === "sun") return <SunShaft key={`s${seed}`} at={[pos[0], 0, pos[2]]} on={1} radius={0.7} height={24} />;
  if (mood === "none") return null;
  const dark = mood === "dark" ? 0.75 : 0.15;
  return (
    <group key={`c${seed}`}>
      <MoodCloud pos={head} size={0.55} dark={dark} seed={seed} frame={frame} />
      {mood === "dark" || wet > 0 ? <RainField center={[head[0], head[1] - 0.2, head[2]]} size={[0.9, h + 0.7, 0.6]} count={60} frame={frame} seed={seed} /> : null}
    </group>
  );
};

const SetA: React.FC<{ frame: number; t: number }> = ({ frame, t }) => {
  const meet = ramp(t, at("secret", 1.6), at("secret", 3.4));
  const rainTower = ramp(t, at("forecast", 2.8), at("forecast", 4.2));
  return (
    <group>
      <Ground color="#77736a" />
      <Road width={7} length={220} lanes={2} walk={3} />
      <ShopRow x0={-60} z={-6.5} bays={30} floors={4} seed={3} />
      <ShopRow x0={60} z={6.5} bays={17} floors={4} seed={7} rotY={Math.PI} />
      <ShopRow x0={-30} z={6.5} bays={8} floors={3} seed={11} rotY={Math.PI} />
      <PoleLine x0={-56} x1={56} z={-5.9} seed={2} />
      <PoleLine x0={-50} x1={56} z={5.9} seed={5} every={15} />
      <Tower pos={[-6, 0, -40]} w={20} d={16} h={70} seed={2} />
      <Tower pos={[22, 0, -52]} w={16} d={14} h={95} seed={4} glass="#7d93ad" />
      <Tower pos={[-40, 0, -60]} w={18} d={18} h={60} seed={6} glass="#8a9aa8" />
      <Tower pos={RAIN_TOWER.pos} w={RAIN_TOWER.w} d={RAIN_TOWER.d} h={RAIN_TOWER.h} seed={9} glass="#6b8299" />
      <Stall pos={STALL_POS} rotY={0} />
      {/* the office-sized storm over the rain tower */}
      <MoodCloud pos={[RAIN_TOWER.pos[0], RAIN_TOWER.h + 4, RAIN_TOWER.pos[2]]} size={11} dark={0.7} seed={21} frame={frame} stretch={1.15} />
      <RainField center={[RAIN_TOWER.pos[0], RAIN_TOWER.h + 2, RAIN_TOWER.pos[2]]} size={[RAIN_TOWER.w + 4, RAIN_TOWER.h + 2, RAIN_TOWER.d + 4]} count={1400} amount={0.35 + 0.65 * rainTower} frame={frame} seed={22} />
      {WALKERS.map((w) => {
        const x = w.x0 + w.v * t * 0.35;
        // forecast beat: walkers on the south side bend out around the rain tower's front
        const detour = w.z > 0 ? Math.exp(-(((x - RAIN_TOWER.pos[0]) / 8) ** 2)) * 1.6 : 0;
        const pos: V3 = [x, 0, w.z - detour];
        const h = w.look.height ?? 1.7;
        return (
          <group key={w.id}>
            <Card look={w.look} pose={{ face: w.face, arms: w.arms, walk: t * 1.4 * Math.abs(w.v) + w.id * 0.3, facing: w.v > 0 ? 1 : -1 }} position={pos} frame={frame} seed={w.id + 1} />
            {personalWeather(w.mood, pos, h, frame, w.id + 1)}
          </group>
        );
      })}
      {/* moo-ping auntie + the guy who just got yelled at by his boss */}
      <Card look={AUNTIE.look} pose={{ face: t > at("nohide", 3.6) ? "shock" : "smile", arms: "hold", talk: t > at("nohide", 3.6) }} position={AUNTIE.pos} frame={frame} seed={31} />
      <Card look={BOSSED.look} pose={{ face: "sad", arms: "down", facing: -1 }} position={BOSSED.pos} frame={frame} seed={32} />
      {personalWeather("dark", BOSSED.pos, BOSSED.look.height ?? 1.7, frame, 33)}
      {/* the secret: two strangers' clouds drift into each other */}
      {PAIR.map((p, i) => {
        const h = p.look.height ?? 1.7;
        const c: V3 = [lerp(p.pos[0], i === 0 ? -0.35 : 0.35, meet), h + 1.0 + meet * 0.6, p.pos[2]];
        return (
          <group key={i}>
            <Card look={p.look} pose={{ face: "neutral", arms: i === 0 ? "phone" : "down", lookUp: meet * 0.6 }} position={p.pos} frame={frame} seed={41 + i} />
            <MoodCloud pos={c} size={0.55 + meet * 0.2} dark={0.25} seed={43 + i} frame={frame} />
          </group>
        );
      })}
    </group>
  );
};

// ---------- set B: Asok at 18:00 ----------
const SetB: React.FC<{ frame: number; t: number }> = ({ frame, t }) => {
  const g1 = ramp(t, EV.horn1, EV.horn1 + 1.6); // first cloud swells
  const g23 = ramp(t, EV.horn2, EV.argue + 1.5); // the rest swell
  const flow = ramp(t, EV.flowA, EV.flowB); // all clouds pour into one
  const breakUp = ramp(t, EV.clear, EV.clearDone);
  const storm = clamp01(flow) * (1 - breakUp);
  const flood = lerp(0, 0.12, ramp(t, EV.floodA, EV.floodB)) * (1 - ramp(t, EV.clear, EV.clearDone + 3));
  const strikeLife = 1 - (t - EV.strike) / 0.35;
  const look = t > EV.lookUp && t < EV.clearDone ? clamp01((t - EV.lookUp) / 0.6) : 0;
  const lights = 0.5 + 0.5 * breakUp;
  const engineOn = t < EV.engineOff;
  const give = ramp(t, EV.give, EV.give + 1.6);
  const rainOn = storm > 0.3 ? storm : 0;
  const trainX = -140 + ((t - EV.setB) * 9) % 280;
  return (
    <group>
      <Ground color="#6c6860" />
      <Road width={16} length={240} lanes={4} walk={4} />
      <Road width={14} length={240} lanes={4} walk={4} rotY={Math.PI / 2} />
      <Viaduct x0={-140} x1={140} z={-13} y={11} train={trainX} />
      <Tower pos={[-34, 0, -30]} w={22} d={18} h={90} seed={12} />
      <Tower pos={[32, 0, -34]} w={18} d={20} h={120} seed={13} glass="#7a8fa8" />
      <Tower pos={[-30, 0, 32]} w={20} d={20} h={70} seed={14} glass="#8796a4" />
      <Tower pos={[34, 0, 30]} w={24} d={18} h={100} seed={15} glass="#6d8297" />
      <ShopRow x0={-120} z={-12.5} bays={20} floors={4} seed={17} />
      <ShopRow x0={120} z={12.5} bays={20} floors={4} seed={18} rotY={Math.PI} />
      <PoleLine x0={-110} x1={-16} z={-11} seed={8} />
      {CARS.map((c, i) => (
        <Car key={i} pos={c.pos} rotY={c.rotY} seed={c.seed} taxi={c.taxi} lights={lights} />
      ))}
      <Motorbike pos={WIN.bike} rotY={0} />
      {/* per-driver clouds -> one storm */}
      {JAM_CLOUDS.map((c, i) => {
        const grow = c.first ? g1 : g23 * (0.6 + hash(i) * 0.4);
        const size = (0.8 + grow * 1.4) * (1 - flow * 0.2);
        const toward = lerp3(c.pos, [STORM_CENTER[0] + (hash(i * 3) - 0.5) * 30, STORM_CENTER[1] - 4, STORM_CENTER[2] + (hash(i * 7) - 0.5) * 24], flow);
        if (flow >= 0.999) return null;
        return <MoodCloud key={i} pos={toward} size={size} dark={0.25 + grow * 0.4 + flow * 0.3} seed={c.seed + 50} frame={frame} />;
      })}
      {storm > 0.01 ? (
        <group>
          {Array.from({ length: 7 }, (_, k) => {
            const a = (k / 7) * Math.PI * 2;
            const r = k === 0 ? 0 : 15 * (1 + breakUp * 2.5);
            const p: V3 = [STORM_CENTER[0] + Math.cos(a) * r, STORM_CENTER[1] + (hash(k) - 0.5) * 3 + breakUp * 6, STORM_CENTER[2] + Math.sin(a) * r * 0.8];
            const size = (k === 0 ? 15 : 10) * (0.2 + 0.8 * storm) * (1 - breakUp * 0.5);
            return <MoodCloud key={k} pos={p} size={size} dark={0.85 - breakUp * 0.5} seed={70 + k} frame={frame} stretch={1.3} />;
          })}
        </group>
      ) : null}
      <RainField center={[-4, 24, 0]} size={[70, 24, 60]} count={5200} amount={rainOn} frame={frame} seed={5} />
      <Lightning top={[-3, 26, 1]} ground={[-6, 0, 1]} life={strikeLife > 0 && strikeLife <= 1 ? strikeLife : 0} seed={8} />
      <Flood level={flood} frame={frame} />
      {/* people out of their cars: arguing, then looking up */}
      {ARGUERS.map((a, i) => {
        const out = ramp(t, EV.argue + i * 0.25, EV.argue + i * 0.25 + 0.5);
        if (out <= 0) return null;
        const arguing = t < EV.lookUp;
        const pose: Pose = arguing
          ? { face: i % 2 ? "worried" : "shock", arms: i % 2 ? "up" : "point", talk: true, facing: i % 2 ? -1 : 1 }
          : { face: t > EV.shaft1 ? "smile" : "awe", arms: i === 0 && give > 0.5 ? "hold" : "down", lookUp: look };
        return <Card key={i} look={a.look} pose={pose} position={a.pos} frame={frame} seed={60 + i} />;
      })}
      <Card look={WIN.look} pose={{ face: t > EV.engineOff ? "smile" : "neutral", arms: t > EV.give ? "hold" : "down", lookUp: t > EV.lookUp && t < EV.engineOff ? look : 0, facing: 1 }} position={lerp3(WIN.pos, [-5.4, 0, -3.6], give)} frame={frame} seed={70} />
      {engineOn ? null : null}
      {/* the umbrella crosses from the win driver to the shouter */}
      {t > EV.give - 0.2 ? <Umbrella pos={lerp3([-4.4, 2.0, -5.6], [-6.1, 2.1, -3.0], give)} color="#2b6cb0" open={0.3 + 0.7 * give} tilt={0.15} /> : null}
      {SHAFTS.map((s, i) => (
        <SunShaft key={i} at={s.at} on={ramp(t, s.t, s.t + 0.8) * (1 - breakUp)} radius={2.8} height={40} />
      ))}
    </group>
  );
};

// ---------- 2D overlays ----------
const FORECAST_ROWS: Array<[string, string, string]> = [
  ["สีลม", "⛈", "หงุดหงิด 80%"],
  ["อารีย์", "☀️", "ชิล ทั้งวัน"],
  ["อโศก", "☁️", "ยังไม่ได้กินกาแฟ"],
  ["บางนา", "🌦", "เดี๋ยวดีเดี๋ยวร้าย"],
];
const PhoneApp: React.FC<{ t: number }> = ({ t }) => {
  const a = ramp(t, at("forecast", 0.1), at("forecast", 0.6));
  const out = ramp(t, at("forecast", 2.0), at("forecast", 2.3));
  const vis = a * (1 - out);
  if (vis <= 0) return null;
  const swap = ramp(t, at("forecast", 1.4), at("forecast", 1.9));
  return (
    <div style={{ position: "absolute", left: 270, top: 520, width: 540, height: 900, borderRadius: 64, background: "#11151d", border: "10px solid #2a2f3a", boxShadow: "0 30px 80px rgba(0,0,0,0.55)", transform: `translateY(${(1 - vis) * 260}px) rotate(${(1 - vis) * -6}deg)`, opacity: vis, padding: 44, boxSizing: "border-box", fontFamily: "Prompt, sans-serif", color: "#fff" }}>
      <div style={{ fontSize: 34, opacity: 0.7 }}>กรุงเทพฯ · 08:12</div>
      <div style={{ position: "relative", height: 78, marginTop: 10 }}>
        <div style={{ position: "absolute", fontSize: 58, fontWeight: 800, opacity: 1 - swap }}>พยากรณ์อากาศ</div>
        <div style={{ position: "absolute", fontSize: 58, fontWeight: 800, opacity: swap, color: "#ffd27a" }}>พยากรณ์อารมณ์</div>
      </div>
      {FORECAST_ROWS.map(([area, icon, mood], i) => {
        const r = ramp(t, at("forecast", 1.6 + i * 0.12), at("forecast", 1.9 + i * 0.12));
        return (
          <div key={area} style={{ display: "flex", alignItems: "center", gap: 22, marginTop: 34, padding: "22px 26px", borderRadius: 30, background: "rgba(255,255,255,0.08)", opacity: 0.25 + 0.75 * r }}>
            <div style={{ fontSize: 66 }}>{icon}</div>
            <div>
              <div style={{ fontSize: 40, fontWeight: 700 }}>{area}</div>
              <div style={{ fontSize: 32, color: "#b9c4d6" }}>{mood}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const EndQuestion: React.FC<{ t: number }> = ({ t }) => {
  const a = ramp(t, EV.endCard, EV.endCard + 0.5);
  if (a <= 0) return null;
  return (
    <div style={{ position: "absolute", left: 90, right: 90, top: 700, textAlign: "center", opacity: a, transform: `translateY(${(1 - a) * 40}px)`, fontFamily: "Prompt, sans-serif" }}>
      <div style={{ fontSize: 76, fontWeight: 800, color: "#fff", lineHeight: 1.3, textShadow: "0 6px 26px rgba(0,0,0,0.85)" }}>
        วันนี้เหนือหัวคุณ
        <br />
        <span style={{ color: "#ffd27a" }}>ฝนตก หรือแดดออก?</span>
      </div>
      <div style={{ marginTop: 40, fontSize: 44, fontWeight: 700, color: "#fff", opacity: 0.85 }}>เรื่องจ๊าบๆ</div>
    </div>
  );
};

// ---------- sound: one voice take + cue'd foley ----------
type Sfx = { at: number; sound: string; vol: number; len?: number };
const SFX: Sfx[] = [
  { at: 0.02, sound: "boom", vol: 0.55 },
  { at: SC.morning.start, sound: "whoosh", vol: 0.25 },
  { at: EV.setB, sound: "whoosh", vol: 0.3 },
  { at: EV.horn1, sound: "horn", vol: 0.5 },
  { at: EV.horn2, sound: "horn", vol: 0.45 },
  { at: EV.horn3, sound: "horn", vol: 0.45 },
  { at: EV.flowA - 1.0, sound: "riser", vol: 0.35 },
  { at: EV.flowB - 0.6, sound: "wind", vol: 0.35, len: 6 },
  { at: EV.flowB, sound: "rain", vol: 0.32, len: EV.clearDone - EV.flowB },
  { at: EV.strike, sound: "boom", vol: 0.8 },
  { at: EV.give + 0.4, sound: "swish", vol: 0.25 },
];
const sfxSrc = (s: string) => (s === "horn" ? "sfx/horn.wav" : sfxFile(s, true));
/** Resolved audio cue sheet (public-dir paths, seconds). Lets an external ffmpeg mix replicate the
 *  in-composition audio when Remotion's bundled ffprobe can't run (Smart App Control blocks it). */
export type AudioCue = { src: string; at: number; vol: number; len?: number };
export const MOOD01_AUDIO: AudioCue[] = [
  { src: "mood01/take.mp3", at: 0, vol: 1 },
  ...SFX.map((s) => ({ src: sfxSrc(s.sound), at: Math.round(s.at * FPS) / FPS, vol: s.vol, len: s.len ? Math.round(s.len * FPS) / FPS : undefined })),
];

/** `audio: false` drops every audio element so the renderer never probes assets (render muted, then mix
 *  MOOD01_AUDIO externally); Studio preview keeps the default `true`. */
export const Mood01: React.FC<{ audio?: boolean }> = ({ audio = true }) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const g = gradeAt(t);
  const setB = t >= EV.setB;
  const strike = clamp01(1 - (t - EV.strike) / 0.5) * (t >= EV.strike ? 1 : 0);
  const scene = SCENES.find((s) => t >= s.start && t < s.start + s.dur) ?? null;
  return (
    <AbsoluteFill style={{ backgroundColor: g.hor }}>
      <ThreeCanvas width={1080} height={1920} camera={{ fov: 45, position: [0, 2, 10] }} onCreated={({ gl }) => { gl.toneMapping = THREE.NeutralToneMapping; gl.toneMappingExposure = 1; }}>
        <Rig frame={frame} />
        <fog attach="fog" args={[g.hor, 30, g.fogFar]} />
        <Sky top={g.top} horizon={g.hor} />
        <hemisphereLight args={[g.top, "#6b6255", g.amb + strike * 3]} />
        <directionalLight position={[-30, 60, 40]} intensity={g.sun} color={setB ? mixHex("#ffe2b8", "#ffb070", ramp(t, EV.clear, EV.clearDone)) : "#fff6e6"} />
        {setB ? <SetB frame={frame} t={t} /> : <SetA frame={frame} t={t} />}
      </ThreeCanvas>
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "radial-gradient(ellipse 75% 60% at 50% 48%, rgba(0,0,0,0) 55%, rgba(12,8,20,0.42) 100%)" }} />
      {strike > 0 ? <div style={{ position: "absolute", inset: 0, background: "#eef3ff", opacity: strike * 0.55, mixBlendMode: "screen" }} /> : null}
      {t < SC.hook.dur ? <BigTitle text={"ถ้าอารมณ์\n*กลายเป็นฟ้า?*"} frame={frame} /> : null}
      <PhoneApp t={t} />
      {scene ? <Captions2 cues={scene.cues} t={t - scene.start} /> : null}
      <EndQuestion t={t} />
      {audio
        ? MOOD01_AUDIO.map((c, i) => (
            <Sequence key={i} from={Math.round(c.at * FPS)} durationInFrames={c.len ? Math.round(c.len * FPS) : undefined}>
              <Html5Audio src={staticFile(c.src)} volume={c.vol} />
            </Sequence>
          ))
        : null}
    </AbsoluteFill>
  );
};
