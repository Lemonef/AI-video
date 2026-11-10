import React, {useLayoutEffect} from "react";
import { AbsoluteFill, Html5Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import {useThree} from "@react-three/fiber";
import * as THREE from "three";
import episode from "../../episodes/nolie01.json";
import { Captions2 } from "../v2/ui";
import { Card, Look, Pose } from "./engine/Card";
import { solveCamera, Shot } from "./engine/camera";
import { RainField } from "./engine/weather";
import { Ground, Road, ShopRow, Sky, Stall } from "./engine/world";
import { musicEnvelope, MusicMix } from "./music";

export const FPS = 30;
type Cue = {start: number; end: number; text: string};
type Timing = Record<string, {duration: number; cues: Cue[]}>;
type Props = {episode?: typeof episode & {timing?: Timing}; audio?: boolean};
type Span = {id: string; start: number; duration: number; cues: Cue[]};
const fallbackTiming: Timing = Object.fromEntries(episode.scenes.map((s) => [s.id, {duration: 0, cues: []}]));

export const nolieSpans = (timing: Timing): Span[] => {
  let start = 0;
  return episode.scenes.map((scene) => {
    const duration = timing[scene.id]?.duration ?? 0;
    const span = {id: scene.id, start, duration, cues: timing[scene.id]?.cues ?? []};
    start += duration;
    return span;
  });
};
export const nolieFrames = (timing: Timing) => {
  const spans = nolieSpans(timing); const last = spans[spans.length - 1];
  return Math.max(1, Math.ceil(((last?.start ?? 0) + (last?.duration ?? 0) + 2) * FPS));
};

const YOU: Look = {skin: "#d79068", shirt: "#316ea6", pants: "#27313d", hair: "cap", capColor: "#f0b23d"};
const NID: Look = {skin: "#d79068", shirt: "#ef8f9c", pants: "#45345a", hair: "bob", height: 1.25};
const PLOY: Look = {skin: "#b97855", shirt: "#f1c94d", pants: "#4c617e", hair: "short", height: 1.12};
const poses: Record<string, Pose> = {
  hook: {face: "shock", arms: "up", talk: true}, market: {face: "worried", arms: "point", talk: true},
  cost: {face: "sad", arms: "down"}, rule: {face: "shock", arms: "phone", talk: true},
  heart: {face: "sad", arms: "hold"}, crisis: {face: "worried", arms: "point", talk: true},
  choice: {face: "worried", arms: "phone"}, action: {face: "awe", arms: "point", walk: 0},
  payoff: {face: "smile", arms: "hold"}, resolution: {face: "smile", arms: "wave", talk: true},
};
const angle = (from: Shot["from"], to?: Shot["to"]): Shot[] => [{start: 0, from, to, glide: 30, creep: 0.002, handheld: 0.012}];
const angles: Record<string, Shot[]> = {
  hook: angle({pos: [0, 3.2, 10], look: [0, 1.5, 0], fov: 42}, {pos: [0, 2.5, 6], look: [0, 1.6, 0], fov: 48}),
  market: angle({pos: [-5, 2.6, 9], look: [0, 1.4, 0], fov: 45}, {pos: [-2, 2.3, 6], look: [0, 1.5, 0], fov: 50}),
  cost: angle({pos: [5, 2.4, 10], look: [0, 1.4, 0], fov: 44}, {pos: [2, 2.2, 7], look: [0, 1.4, 0], fov: 48}),
  rule: angle({pos: [0, 2, 6], look: [0, 1.5, 0], fov: 50}), heart: angle({pos: [2, 2, 6], look: [0, 1.2, 0], fov: 52}),
  crisis: angle({pos: [-4, 3, 10], look: [0, 1.1, 0], fov: 46}, {pos: [-1, 2.1, 5.5], look: [0, 1.1, 0], fov: 55}),
  choice: angle({pos: [0, 1.8, 4.6], look: [0, 1.15, 0], fov: 56}), action: angle({pos: [0, 8, 11], look: [0, 0, 0], fov: 48}),
  payoff: angle({pos: [0, 2.3, 6], look: [0, 1.1, 0], fov: 50}), resolution: angle({pos: [0, 2.4, 7], look: [0, 1.2, 0], fov: 48}),
  marketWide: angle({pos: [-7, 3.8, 12], look: [0, 1.2, 0], fov: 39}), marketClose: angle({pos: [-1.8, 2.1, 4.8], look: [0, 1.3, 0], fov: 57}),
  costWide: angle({pos: [7, 3.4, 12], look: [0.5, 1.25, 0], fov: 40}), costOverShoulder: angle({pos: [2.8, 2.15, 5.3], look: [0, 1.35, 0], fov: 55}),
  ruleWide: angle({pos: [-4.8, 3.3, 9], look: [0, 1.35, 0], fov: 43}), ruleClose: angle({pos: [0.8, 1.9, 4.1], look: [0, 1.45, 0], fov: 60}),
  heartWide: angle({pos: [-5.5, 3.1, 9.5], look: [0.7, 1.05, 0], fov: 44}), heartOverShoulder: angle({pos: [-1.2, 1.75, 4.2], look: [1.65, 1.05, -0.8], fov: 58}),
  crisisWide: angle({pos: [-7, 4.5, 13], look: [0, 1, 0], fov: 40}), crisisClose: angle({pos: [1.7, 1.9, 4.5], look: [1.9, 1.05, -0.8], fov: 58}),
  choiceWide: angle({pos: [-5.2, 3.1, 9], look: [0.8, 1.05, 0], fov: 44}), choiceOverShoulder: angle({pos: [-1.1, 1.75, 4], look: [1.8, 1.05, -0.8], fov: 60}),
  actionWide: angle({pos: [-7, 7, 12], look: [0, 0.7, 0], fov: 42}), actionClose: angle({pos: [-2, 2.1, 5.2], look: [0.6, 1.15, 0], fov: 55}),
  payoffWide: angle({pos: [-5.5, 3.5, 10], look: [0.8, 1, 0], fov: 42}), payoffClose: angle({pos: [1.4, 1.85, 4.3], look: [1.6, 1.05, -0.8], fov: 59}),
  resolutionWide: angle({pos: [-6.5, 3.6, 11], look: [0.7, 1.1, 0], fov: 42}), resolutionOverShoulder: angle({pos: [-1.2, 1.9, 4.4], look: [1.8, 1.05, -0.8], fov: 58}), resolutionClose: angle({pos: [1.1, 1.85, 4], look: [1.8, 1.1, -0.8], fov: 62}),
};
const angleNames: Record<string, string[]> = {
  hook: ["hook"], market: ["market", "marketWide", "marketClose"], cost: ["cost", "costWide", "costOverShoulder"],
  rule: ["rule", "ruleWide", "ruleClose"], heart: ["heart", "heartWide", "heartOverShoulder"], crisis: ["crisis", "crisisWide", "crisisClose"],
  choice: ["choice", "choiceWide", "choiceOverShoulder"], action: ["action", "actionWide", "actionClose"], payoff: ["payoff", "payoffWide", "payoffClose"],
  resolution: ["resolution", "resolutionWide", "resolutionOverShoulder", "resolutionClose"],
};

const CameraRig: React.FC<{pose: ReturnType<typeof solveCamera>}> = ({pose}) => {
  const {camera} = useThree();
  useLayoutEffect(() => { const perspective = camera as THREE.PerspectiveCamera; perspective.position.set(...pose.pos); perspective.fov = pose.fov; perspective.rotation.z = pose.roll; perspective.lookAt(...pose.look); perspective.updateProjectionMatrix(); }, [camera, pose]);
  return null;
};

const World: React.FC<{id: string; local: number; duration: number; frame: number}> = ({id, local, duration, frame}) => {
  const rainy = ["crisis", "choice", "action", "payoff"].includes(id);
  const marks = episode.scenes.find((scene) => scene.id === id)?.shots?.map((shot) => shot.at).sort((a, b) => a - b) ?? [0];
  const shotIndex = Math.max(0, marks.filter((at) => at <= local).length - 1);
  const shotStart = marks[shotIndex] ?? 0;
  const angleName = angleNames[id]?.[shotIndex] ?? angleNames[id]?.[0] ?? "hook";
  const camera = solveCamera(angles[angleName] ?? angles.hook, Math.round((local - shotStart) * duration * FPS));
  const kid = id === "heart" ? NID : PLOY;
  return <ThreeCanvas width={1080} height={1920} camera={{position: camera.pos, fov: camera.fov}} onCreated={({gl}) => { gl.toneMapping = THREE.NeutralToneMapping; }}>
    <CameraRig pose={camera} />
    <group><Sky top={rainy ? "#202b42" : "#7ca7d5"} horizon={rainy ? "#6a7184" : "#d7c5a6"} /><hemisphereLight args={["#b7cae8", "#514338", 1.1]} /><directionalLight position={[-10, 14, 8]} intensity={rainy ? 0.9 : 2.2} color={rainy ? "#9bc6ff" : "#ffe0ad"} />
      <Ground /><Road z={0} width={18} length={44} lanes={2} /><ShopRow x0={-12} z={-5} bays={6} floors={2} seed={12} /><ShopRow x0={12} z={5} bays={6} floors={2} seed={13} rotY={Math.PI} /><Stall pos={[-2, 0, -1]} />
      <Card look={YOU} pose={poses[id] ?? poses.hook} position={[0, 0, 0]} frame={frame} seed={1} /><Card look={kid} pose={{face: rainy ? "worried" : "smile", arms: id === "payoff" ? "hold" : "down"}} position={[2, 0, -0.8]} frame={frame} seed={2} />
      {rainy ? <RainField center={[0, 12, 0]} size={[28, 18, 30]} count={1800} amount={0.78} frame={frame} seed={19} /> : null}
    </group></ThreeCanvas>;
};

export const Nolie01: React.FC<Props> = ({episode: input, audio = true}) => {
  const frame = useCurrentFrame(); const t = frame / FPS; const timing = input?.timing ?? fallbackTiming; const spans = nolieSpans(timing);
  const current = spans.find((span) => t >= span.start && t < span.start + span.duration) ?? spans[spans.length - 1]!;
  const local = Math.max(0, Math.min(1, (t - current.start) / Math.max(current.duration, 0.01)));
  const last = spans[spans.length - 1]!; const voiceEnd = last.start + last.duration; const mix = episode.mix.music as unknown as MusicMix;
  return <AbsoluteFill style={{background: "#101827"}}><World id={current.id} local={local} duration={current.duration} frame={frame} />
    {t < 2.6 ? <div style={{position:"absolute",top:240,left:70,right:70,textAlign:"center",fontFamily:"Prompt, sans-serif",fontWeight:900,fontSize:76,lineHeight:1.12,color:"#fff",textShadow:"0 6px 20px #000"}}>ทั้งกรุงเทพ<br /><span style={{color:"#ffd35c"}}>โกหกไม่ได้?</span></div> : null}
    <div style={{position:"absolute",top:105,left:55,padding:"12px 22px",borderRadius:999,background:"rgba(8,14,26,.72)",color:"#fff",fontFamily:"Prompt, sans-serif",fontWeight:700,fontSize:30}}>{current.id === "rule" ? "กฎ: โกหกได้ 1 ครั้ง" : "เรื่องจ้าบ"}</div>
    <Captions2 cues={current.cues} t={Math.max(0, t - current.start)} />
    {audio ? <><Html5Audio src={staticFile("nolie01/take.mp3")} /><Html5Audio loop src={staticFile(`music/${mix.name}.mp3`)} volume={musicEnvelope(mix, t, t < voiceEnd, voiceEnd + 2)} />
      {(episode.scenes.find((scene) => scene.id === current.id)?.sfx ?? []).map((cue) => <Sequence key={`${current.id}-${cue.sound}-${cue.at}`} from={Math.round((current.start + cue.at * current.duration) * FPS)}><Html5Audio src={staticFile(`sfx/real/${cue.sound}.mp3`)} volume={cue.volume ?? 0.5} /></Sequence>)}</> : null}
  </AbsoluteFill>;
};
