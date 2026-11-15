// 2D cut-out character card in the 3D world. Painted per frame on a Canvas2D texture:
// bean head, stick limbs in plum ink, simple Thai everyday look. Billboards to the camera on Y.
import React, { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { hash } from "./ease";

export const INK = "#241726"; // character ink (method: plum, not black)
const W = 512;
const H = 1024;
const FOOT_Y = 960; // canvas y where feet touch the floor
const HEAD_R = 92;

export type Face = "neutral" | "smile" | "shock" | "worried" | "sad" | "awe";
export type Arms = "down" | "phone" | "point" | "up" | "wave" | "hold" | "cheer";
export type Look = {
  skin: string;
  shirt: string;
  pants: string;
  hair: "short" | "bob" | "bun" | "cap" | "bald" | "long";
  hairColor?: string;
  capColor?: string;
  glasses?: boolean;
  height?: number; // world units, adult ~1.7
  vest?: string;
};
export type Pose = {
  face?: Face;
  arms?: Arms;
  walk?: number; // walk phase in cycles; undefined = standing
  facing?: 1 | -1;
  lookUp?: number; // 0..1
  talk?: boolean;
  squash?: number; // -1..1
};

type Ctx = CanvasRenderingContext2D;
const limb = (c: Ctx, pts: number[][], w: number) => {
  c.beginPath();
  c.moveTo(pts[0][0], pts[0][1]);
  for (const p of pts.slice(1)) c.lineTo(p[0], p[1]);
  c.lineWidth = w;
  c.lineCap = "round";
  c.lineJoin = "round";
  c.strokeStyle = INK;
  c.stroke();
};
const dot = (c: Ctx, x: number, y: number, r: number, fill: string) => {
  c.beginPath();
  c.arc(x, y, r, 0, Math.PI * 2);
  c.fillStyle = fill;
  c.fill();
  c.lineWidth = 8;
  c.strokeStyle = INK;
  c.stroke();
};

export const paintCard = (c: Ctx, look: Look, pose: Pose, frame: number, seed: number) => {
  c.clearRect(0, 0, W, H);
  c.save();
  if ((pose.facing ?? 1) < 0) {
    c.translate(W, 0);
    c.scale(-1, 1);
  }
  const walking = pose.walk !== undefined;
  const ph = (pose.walk ?? 0) * Math.PI * 2;
  const bob = walking ? -Math.abs(Math.sin(ph)) * 22 : Math.sin(frame / 22 + seed) * 3;
  const sq = pose.squash ?? 0;
  const cx = W / 2;
  const hipY = 640 + bob + sq * 25;
  const shY = 400 + bob + sq * 45;
  const headY = shY - HEAD_R - 10;

  // legs (keep feet on the floor line)
  const swing = walking ? Math.sin(ph) * 0.45 : 0;
  for (const s of [1, -1]) {
    const a = swing * s;
    const fx = cx + s * 22 + Math.sin(a) * 260;
    const fy = FOOT_Y - (walking ? Math.max(0, Math.sin(ph * s)) * 18 : 0);
    const kx = (cx + s * 18 + fx) / 2 + 8;
    const ky = (hipY + fy) / 2;
    limb(c, [[cx + s * 18, hipY], [kx, ky], [fx, fy]], 30);
    c.beginPath();
    c.ellipse(fx + 14, fy + 4, 26, 13, 0, 0, Math.PI * 2);
    c.fillStyle = INK;
    c.fill();
  }
  c.lineWidth = 8;
  c.strokeStyle = INK;
  c.beginPath();
  c.roundRect(cx - 52, hipY - 30, 104, 80, 22);
  c.fillStyle = look.pants;
  c.fill();
  c.stroke();

  c.beginPath();
  c.roundRect(cx - 62, shY - 10, 124, hipY - shY + 30, 40);
  c.fillStyle = look.shirt;
  c.fill();
  c.stroke();
  if (look.vest) {
    c.beginPath();
    c.roundRect(cx - 62, shY - 10, 124, (hipY - shY) * 0.8, 40);
    c.fillStyle = look.vest;
    c.fill();
    c.stroke();
  }

  const aSwing = walking ? -Math.sin(ph) * 0.6 : Math.sin(frame / 30 + seed) * 0.04;
  const rest = (sx: number, sy: number, s: number): number[][] => [[sx, sy], [sx - s * -4, sy + 120], [sx + s * 6, sy + 230]];
  const arm = (s: number) => {
    const sx = cx + s * 58;
    const sy = shY + 18;
    let pts: number[][];
    switch (pose.arms) {
      case "up":
        pts = [[sx, sy], [sx + s * 60, sy - 110], [sx + s * 70, sy - 230]];
        break;
      case "cheer":
        pts = [[sx, sy], [sx + s * 80, sy - 90], [sx + s * 60 + Math.sin(frame / 3 + s) * 12, sy - 210]];
        break;
      case "phone":
        pts = s > 0 ? [[sx, sy], [sx + 40, sy + 110], [sx - 10, sy + 50]] : rest(sx, sy, s);
        break;
      case "point":
        pts = s > 0 ? [[sx, sy], [sx + 115, sy - 30], [sx + 220, sy - 70]] : rest(sx, sy, s);
        break;
      case "wave":
        pts = s > 0 ? [[sx, sy], [sx + 90, sy - 60], [sx + 110 + Math.sin(frame / 4) * 30, sy - 180]] : rest(sx, sy, s);
        break;
      case "hold":
        pts = [[sx, sy], [sx + s * 30, sy + 110], [cx + 70, sy + 120]];
        break;
      default: {
        const a = aSwing * s;
        pts = [[sx, sy], [sx + s * 14 + Math.sin(a) * 115, sy + Math.cos(a) * 115], [sx + s * 10 + Math.sin(a * 1.3) * 230, sy + Math.cos(a) * 230]];
      }
    }
    limb(c, pts, 26);
    const hd = pts[pts.length - 1];
    dot(c, hd[0], hd[1], 17, look.skin);
    if (pose.arms === "phone" && s > 0) {
      c.fillStyle = "#2b2f3a";
      c.fillRect(hd[0] - 18, hd[1] - 50, 36, 60);
      c.fillStyle = "#9fe3ff";
      c.fillRect(hd[0] - 13, hd[1] - 44, 26, 44);
    }
  };
  arm(-1);

  limb(c, [[cx, shY], [cx, headY + HEAD_R - 10]], 26);
  c.save();
  c.translate(cx, headY);
  c.rotate(-(pose.lookUp ?? 0) * 0.3);
  const R = HEAD_R;
  c.beginPath();
  c.ellipse(0, 0, R * 0.86, R, 0, 0, Math.PI * 2);
  c.fillStyle = look.skin;
  c.fill();
  c.lineWidth = 9;
  c.strokeStyle = INK;
  c.stroke();

  c.fillStyle = look.hair === "cap" ? look.capColor ?? "#c43d3d" : look.hairColor ?? "#1d1620";
  c.beginPath();
  switch (look.hair) {
    case "short":
      c.ellipse(-R * 0.05, -R * 0.42, R * 0.9, R * 0.62, 0, Math.PI, Math.PI * 2);
      break;
    case "bob":
      c.ellipse(-R * 0.05, -R * 0.2, R * 0.96, R * 0.92, 0, Math.PI * 0.92, Math.PI * 2.02);
      c.rect(-R * 0.98, -R * 0.25, R * 0.42, R * 0.9);
      break;
    case "long":
      c.ellipse(-R * 0.05, -R * 0.2, R, R * 0.95, 0, Math.PI * 0.92, Math.PI * 2.02);
      c.rect(-R, -R * 0.25, R * 0.45, R * 1.6);
      break;
    case "bun":
      c.ellipse(-R * 0.05, -R * 0.42, R * 0.9, R * 0.62, 0, Math.PI, Math.PI * 2);
      c.moveTo(-R * 0.35 + R * 0.32, -R * 1.0);
      c.arc(-R * 0.35, -R * 1.0, R * 0.32, 0, Math.PI * 2);
      break;
    case "cap":
      c.ellipse(-R * 0.05, -R * 0.45, R * 0.92, R * 0.6, 0, Math.PI, Math.PI * 2);
      c.rect(R * 0.2, -R * 0.52, R * 0.9, R * 0.16);
      break;
    default:
      break;
  }
  c.fill();
  if (look.hair !== "bald") {
    c.lineWidth = 7;
    c.stroke();
  }

  const blinkPeriod = 15 + Math.floor(hash(seed) * 54); // blink every 0.5-2.3 s at 30 fps
  const blinking = (frame + seed * 7) % blinkPeriod < 3;
  const face = pose.face ?? "neutral";
  const big = face === "shock" || face === "awe";
  const eyeY = -R * 0.05;
  for (const ex of [R * 0.12, R * 0.5]) {
    if (blinking) {
      limb(c, [[ex - 10, eyeY], [ex + 10, eyeY]], 7);
    } else {
      const r = big ? 15 : 10;
      c.beginPath();
      c.arc(ex, eyeY, r, 0, Math.PI * 2);
      c.fillStyle = INK;
      c.fill();
      c.beginPath();
      c.arc(ex + 3, eyeY - 4, r * 0.35, 0, Math.PI * 2);
      c.fillStyle = "#fff";
      c.fill();
    }
    const by = eyeY - 30 - (big ? 12 : 0);
    const tilt = face === "worried" || face === "sad" ? (ex < R * 0.3 ? 8 : -8) : 0;
    limb(c, [[ex - 14, by + tilt], [ex + 14, by - tilt]], 6);
    if (look.glasses) {
      c.lineWidth = 6;
      c.strokeStyle = INK;
      c.beginPath();
      c.arc(ex, eyeY, 22, 0, Math.PI * 2);
      c.stroke();
    }
  }
  c.fillStyle = "rgba(230,110,110,0.35)";
  c.beginPath();
  c.ellipse(R * 0.62, R * 0.28, 16, 9, 0, 0, Math.PI * 2);
  c.fill();

  const mx = R * 0.34;
  const my = R * 0.42;
  const open = pose.talk ? 0.5 + 0.5 * Math.sin(frame * 1.1 + seed) : 0;
  c.strokeStyle = INK;
  c.fillStyle = "#5a2330";
  c.lineWidth = 7;
  c.beginPath();
  if (big) {
    c.ellipse(mx, my, 14, 20, 0, 0, Math.PI * 2);
    c.fill();
    c.stroke();
  } else if (open > 0.15) {
    c.ellipse(mx, my, 16, 4 + open * 12, 0, 0, Math.PI * 2);
    c.fill();
    c.stroke();
  } else if (face === "smile") {
    c.arc(mx, my - 10, 20, 0.15 * Math.PI, 0.85 * Math.PI);
    c.stroke();
  } else if (face === "sad" || face === "worried") {
    c.arc(mx, my + 14, 16, 1.2 * Math.PI, 1.8 * Math.PI);
    c.stroke();
  } else {
    c.moveTo(mx - 14, my);
    c.lineTo(mx + 14, my);
    c.stroke();
  }
  c.restore();
  arm(1); // near arm over the body
  c.restore();
};

export type CardProps = { look: Look; pose: Pose; position: [number, number, number]; frame: number; seed?: number };

export const Card: React.FC<CardProps> = ({ look, pose, position, frame, seed = 1 }) => {
  const { camera } = useThree();
  const group = useRef<THREE.Group>(null);
  const { canvas, tex } = useMemo(() => {
    const cv = document.createElement("canvas");
    cv.width = W;
    cv.height = H;
    const t = new THREE.CanvasTexture(cv);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    return { canvas: cv, tex: t };
  }, []);
  const h = look.height ?? 1.7;
  // canvas spans H px; the figure spans roughly head top (~200) to feet (FOOT_Y)
  const unit = h / (FOOT_Y - 190);
  const planeH = H * unit;
  const planeW = W * unit;
  paintCard(canvas.getContext("2d")!, look, pose, frame, seed);
  tex.needsUpdate = true;
  useLayoutEffect(() => {
    const g = group.current;
    if (!g) return;
    g.rotation.y = Math.atan2(camera.position.x - g.position.x, camera.position.z - g.position.z);
  });
  return (
    <group ref={group} position={position}>
      <mesh position={[0, planeH / 2 - (H - FOOT_Y - 4) * unit, 0]}>
        <planeGeometry args={[planeW, planeH]} />
        <meshBasicMaterial map={tex} transparent alphaTest={0.5} toneMapped={false} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.006, 0]}>
        <circleGeometry args={[h * 0.17, 24]} />
        <meshBasicMaterial color="#000" transparent opacity={0.28} depthWrite={false} />
      </mesh>
    </group>
  );
};
