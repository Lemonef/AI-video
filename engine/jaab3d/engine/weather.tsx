// Weather kit: mood clouds (puff clusters), rain streaks, sun shafts, lightning bolt, flood water.
// Deterministic per frame (hash noise only) so Remotion can render frames in any order.
import React, { useMemo } from "react";
import * as THREE from "three";
import { hash, lerp, smoothNoise, V3 } from "./ease";

const CLOUD_WHITE = new THREE.Color("#f4f6fa");
const CLOUD_DARK = new THREE.Color("#3b4250");
const PUFFS = 9;

/** A puff-cluster cloud. `size` = radius in m, `dark` 0..1 tints white -> storm grey. */
export const MoodCloud: React.FC<{ pos: V3; size: number; dark?: number; seed?: number; frame: number; stretch?: number }> = ({ pos, size, dark = 0, seed = 1, frame, stretch = 1 }) => {
  const color = useMemo(() => new THREE.Color(), []);
  color.copy(CLOUD_WHITE).lerp(CLOUD_DARK, dark);
  const bob = smoothNoise(frame / 50, seed) * size * 0.06;
  return (
    <group position={[pos[0], pos[1] + bob, pos[2]]} scale={[size * stretch, size * 0.62, size * 0.8]}>
      {Array.from({ length: PUFFS }, (_, i) => {
        const a = (i / PUFFS) * Math.PI * 2 + hash(seed + i);
        const r = i === 0 ? 0 : 0.45 + hash(seed * 3 + i) * 0.35;
        const s = i === 0 ? 0.75 : 0.42 + hash(seed * 5 + i) * 0.3;
        const breathe = 1 + smoothNoise(frame / 35 + i, seed + i) * 0.04;
        return (
          <mesh key={i} position={[Math.cos(a) * r, (hash(seed * 7 + i) - 0.35) * 0.35, Math.sin(a) * r * 0.6]} scale={s * breathe}>
            <sphereGeometry args={[1, 18, 12]} />
            <meshLambertMaterial color={color} emissive={color} emissiveIntensity={0.25 * (1 - dark) + 0.45 * dark} />
          </mesh>
        );
      })}
    </group>
  );
};

const STREAK = 0.55; // rain streak length (m)
const FALL = 0.45; // m per frame (~13.5 m/s)

/** Rain streaks inside a box under a cloud. `amount` 0..1 scales the drop count. */
export const RainField: React.FC<{ center: V3; size: [number, number, number]; count: number; amount?: number; frame: number; seed?: number; color?: string }> = ({ center, size, count, amount = 1, frame, seed = 1, color = "#c9d6e6" }) => {
  const geo = useMemo(() => new THREE.BufferGeometry(), []);
  const n = Math.round(count * amount);
  const pts = new Float32Array(n * 6);
  for (let i = 0; i < n; i++) {
    const x = center[0] + (hash(seed + i * 3) - 0.5) * size[0];
    const z = center[2] + (hash(seed + i * 5) - 0.5) * size[2];
    const y0 = hash(seed + i * 7) * size[1];
    const y = center[1] - ((y0 + frame * FALL) % size[1]);
    pts.set([x, y, z, x - 0.04, y - STREAK, z], i * 6);
  }
  geo.setAttribute("position", new THREE.BufferAttribute(pts, 3));
  if (n === 0) return null;
  return (
    <lineSegments geometry={geo} frustumCulled={false}>
      <lineBasicMaterial color={color} transparent opacity={0.55} />
    </lineSegments>
  );
};

/** Warm light shaft from the sky onto a ground point, plus a glow pool. `on` 0..1. */
export const SunShaft: React.FC<{ at: V3; on: number; radius?: number; height?: number }> = ({ at, on, radius = 1.6, height = 30 }) => {
  if (on <= 0.001) return null;
  const warm = new THREE.Color("#ffd27a");
  return (
    <group position={at}>
      <mesh position={[0, height / 2, 0]}>
        <cylinderGeometry args={[radius * 1.8, radius, height, 24, 1, true]} />
        <meshBasicMaterial color={warm} transparent opacity={0.22 * on} side={THREE.DoubleSide} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </mesh>
      <mesh position={[0, height / 2, 0]}>
        <cylinderGeometry args={[radius * 0.9, radius * 0.5, height, 24, 1, true]} />
        <meshBasicMaterial color={warm} transparent opacity={0.25 * on} side={THREE.DoubleSide} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <circleGeometry args={[radius * 1.3, 32]} />
        <meshBasicMaterial color={warm.clone().multiplyScalar(1.3)} transparent opacity={0.5 * on} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </mesh>
    </group>
  );
};

/** Jagged bolt from `top` to `ground`, HDR white so bloom flares it. Visible while `life` > 0. */
export const Lightning: React.FC<{ top: V3; ground: V3; life: number; seed?: number }> = ({ top, ground, life, seed = 1 }) => {
  const geo = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    const SEG = 14;
    for (let i = 0; i <= SEG; i++) {
      const t = i / SEG;
      const jitter = i === 0 || i === SEG ? 0 : (hash(seed + i) - 0.5) * 3.2;
      pts.push(new THREE.Vector3(lerp(top[0], ground[0], t) + jitter, lerp(top[1], ground[1], t), lerp(top[2], ground[2], t) + (hash(seed * 3 + i) - 0.5) * 1.2));
    }
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, false, "catmullrom", 0.1), 64, 0.16, 6, false);
  }, [top, ground, seed]);
  if (life <= 0) return null;
  return (
    <mesh geometry={geo}>
      <meshBasicMaterial color={new THREE.Color("#e8f0ff").multiplyScalar(2 + life * 6)} toneMapped={false} />
    </mesh>
  );
};

/** Flood water: a dull reflective sheet at `level` m with slow ripples (vertex-animated per frame). */
export const Flood: React.FC<{ level: number; size?: number; frame: number }> = ({ level, size = 160, frame }) => {
  const geo = useMemo(() => new THREE.PlaneGeometry(size, size, 48, 48), [size]);
  const pos = geo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    pos.setZ(i, Math.sin(x * 0.7 + frame * 0.12) * 0.015 + Math.cos(y * 0.9 + frame * 0.09) * 0.015);
  }
  pos.needsUpdate = true;
  geo.computeVertexNormals();
  if (level <= 0.005) return null;
  return (
    <mesh geometry={geo} rotation={[-Math.PI / 2, 0, 0]} position={[0, level, 0]}>
      <meshStandardMaterial color="#5d6f7a" roughness={0.15} metalness={0.4} transparent opacity={0.78} />
    </mesh>
  );
};
