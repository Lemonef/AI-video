// World kit: gradient sky dome, Bangkok street pieces built from boxes + Canvas2D painted fronts.
// Sizes are metres; a card adult is 1.7. Everything is deterministic (seeded hash, no Math.random).
import React, { useMemo } from "react";
import * as THREE from "three";
import { hash, V3 } from "./ease";

// ---------- sky ----------
const SKY_RADIUS = 600;
const skyVert = `varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`;
const skyFrag = `uniform vec3 top; uniform vec3 horizon; uniform vec3 ground; varying vec3 vDir;
void main(){ float h = vDir.y; vec3 c = h > 0.0 ? mix(horizon, top, pow(smoothstep(0.0, 0.55, h), 0.8)) : mix(horizon, ground, smoothstep(0.0, 0.08, -h));
gl_FragColor = vec4(c, 1.0);
#include <colorspace_fragment>
}`; // preprocessor directives must start their own line

export const Sky: React.FC<{ top: string; horizon: string }> = ({ top, horizon }) => {
  const uniforms = useMemo(() => ({ top: { value: new THREE.Color() }, horizon: { value: new THREE.Color() }, ground: { value: new THREE.Color() } }), []);
  uniforms.top.value.set(top);
  uniforms.horizon.value.set(horizon);
  uniforms.ground.value.set(horizon).multiplyScalar(0.8);
  return (
    <mesh renderOrder={-1}>
      <sphereGeometry args={[SKY_RADIUS, 32, 16]} />
      <shaderMaterial side={THREE.BackSide} depthWrite={false} uniforms={uniforms} vertexShader={skyVert} fragmentShader={skyFrag} fog={false} />
    </mesh>
  );
};

// ---------- canvas painted textures ----------
const makeTex = (w: number, h: number, paint: (c: CanvasRenderingContext2D) => void, repeat?: [number, number]) => {
  const cv = document.createElement("canvas");
  cv.width = w;
  cv.height = h;
  paint(cv.getContext("2d")!);
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  if (repeat) {
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(repeat[0], repeat[1]);
  }
  return t;
};

const SHOP_COLS = ["#e9d9b8", "#d9e3d6", "#f0c9a8", "#cfd8e6", "#ecd28c", "#e6b9b1", "#d6cbb9"];
const SIGN_COLS = ["#c8372d", "#1f6fb8", "#e8a21b", "#2a8a57", "#7a3e9d", "#d4552b"];
const BAY_PX = 256;
const FLOOR_PX = 160;

/** One shophouse bay (ตึกแถว): shutter or open shop, signboard, upper windows with AC units and grime. */
const paintBay = (c: CanvasRenderingContext2D, x: number, floors: number, seed: number) => {
  const H = floors * FLOOR_PX;
  c.fillStyle = SHOP_COLS[Math.floor(hash(seed) * SHOP_COLS.length)];
  c.fillRect(x, 0, BAY_PX, H);
  for (let f = 1; f < floors; f++) {
    const y = H - (f + 1) * FLOOR_PX;
    // window band
    c.fillStyle = "#3a4656";
    c.fillRect(x + 28, y + 34, BAY_PX - 56, 78);
    c.fillStyle = "rgba(170,200,225,0.55)";
    for (let k = 0; k < 4; k++) c.fillRect(x + 34 + k * 49, y + 40, 41, 66);
    c.fillStyle = "rgba(0,0,0,0.25)";
    c.fillRect(x + 22, y + 112, BAY_PX - 44, 8); // sill shadow
    if (hash(seed * 7 + f) > 0.45) {
      c.fillStyle = "#e9ecea"; // AC unit
      c.fillRect(x + 150 + hash(seed + f) * 40, y + 118, 52, 30);
      c.fillStyle = "#9aa3a0";
      c.beginPath();
      c.arc(x + 176 + hash(seed + f) * 40, y + 133, 10, 0, Math.PI * 2);
      c.fill();
    }
  }
  // grime streaks
  const g = c.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, "rgba(60,50,40,0.18)");
  g.addColorStop(0.5, "rgba(60,50,40,0)");
  c.fillStyle = g;
  c.fillRect(x, 0, BAY_PX, H);
  // ground floor
  const gy = H - FLOOR_PX;
  if (hash(seed * 3) > 0.35) {
    c.fillStyle = "#2c2a2a";
    c.fillRect(x + 12, gy + 46, BAY_PX - 24, FLOOR_PX - 46);
    c.fillStyle = "rgba(255,214,150,0.85)";
    c.fillRect(x + 20, gy + 54, BAY_PX - 40, 30); // lit shop interior strip
    c.fillStyle = "#6b5a4a";
    c.fillRect(x + 30, gy + 100, BAY_PX - 60, 60);
  } else {
    c.fillStyle = "#a9adb0"; // roller shutter
    c.fillRect(x + 12, gy + 46, BAY_PX - 24, FLOOR_PX - 46);
    c.fillStyle = "rgba(0,0,0,0.12)";
    for (let k = gy + 50; k < H; k += 9) c.fillRect(x + 12, k, BAY_PX - 24, 3);
  }
  c.fillStyle = SIGN_COLS[Math.floor(hash(seed * 11) * SIGN_COLS.length)];
  c.fillRect(x + 6, gy + 6, BAY_PX - 12, 36);
  c.fillStyle = "rgba(255,255,255,0.9)";
  for (let k = 0; k < 5; k++) c.fillRect(x + 40 + k * 36, gy + 18, 22 + hash(seed + k) * 8, 10); // sign glyph blocks
  c.fillStyle = "rgba(0,0,0,0.35)";
  c.fillRect(x, 0, 6, H); // party wall line
};

export const BAY_M = 4;
const FLOOR_M = 3.1;

/** A row of shophouses facing +z, left edge at x0. */
export const ShopRow: React.FC<{ x0: number; z: number; bays: number; floors?: number; seed?: number; rotY?: number }> = ({ x0, z, bays, floors = 4, seed = 1, rotY = 0 }) => {
  const tex = useMemo(() => makeTex(BAY_PX * bays, FLOOR_PX * floors, (c) => {
    for (let b = 0; b < bays; b++) paintBay(c, b * BAY_PX, floors, seed * 97 + b);
  }), [bays, floors, seed]);
  const w = bays * BAY_M;
  const h = floors * FLOOR_M;
  const depth = 12;
  return (
    <group position={[x0, 0, z]} rotation={[0, rotY, 0]}>
      <mesh position={[w / 2, h / 2, -depth / 2]}>
        <boxGeometry args={[w, h, depth]} />
        <meshLambertMaterial attach="material-0" color="#bdb3a3" />
        <meshLambertMaterial attach="material-1" color="#bdb3a3" />
        <meshLambertMaterial attach="material-2" color="#8f877c" />
        <meshLambertMaterial attach="material-3" color="#8f877c" />
        <meshLambertMaterial attach="material-4" map={tex} />
        <meshLambertMaterial attach="material-5" color="#9d9488" />
      </mesh>
      {/* awning */}
      <mesh position={[w / 2, FLOOR_M * 0.95, 0.7]} rotation={[0.25, 0, 0]}>
        <boxGeometry args={[w, 0.06, 1.5]} />
        <meshLambertMaterial color="#5f6b6e" />
      </mesh>
    </group>
  );
};

const paintTower = (c: CanvasRenderingContext2D, cols: number, rows: number, seed: number, glass: string) => {
  c.fillStyle = glass;
  c.fillRect(0, 0, cols * 32, rows * 40);
  for (let r = 0; r < rows; r++)
    for (let k = 0; k < cols; k++) {
      const lit = hash(seed * 13 + r * 31 + k) > 0.6;
      c.fillStyle = lit ? "rgba(255,226,170,0.75)" : "rgba(20,35,55,0.55)";
      c.fillRect(k * 32 + 3, r * 40 + 4, 26, 30);
    }
};

/** Glass office tower; `front` faces +z. */
export const Tower: React.FC<{ pos: V3; w: number; d: number; h: number; seed?: number; glass?: string }> = ({ pos, w, d, h, seed = 1, glass = "#6f8aa3" }) => {
  const cols = Math.round(w / 1.6);
  const rows = Math.round(h / 3.4);
  const tex = useMemo(() => makeTex(cols * 32, rows * 40, (c) => paintTower(c, cols, rows, seed, glass)), [cols, rows, seed, glass]);
  const side = useMemo(() => makeTex(Math.round(d / 1.6) * 32, rows * 40, (c) => paintTower(c, Math.round(d / 1.6), rows, seed + 5, glass)), [d, rows, seed, glass]);
  return (
    <mesh position={[pos[0], pos[1] + h / 2, pos[2]]}>
      <boxGeometry args={[w, h, d]} />
      <meshLambertMaterial attach="material-0" map={side} />
      <meshLambertMaterial attach="material-1" map={side} />
      <meshLambertMaterial attach="material-2" color="#7c8794" />
      <meshLambertMaterial attach="material-3" color="#7c8794" />
      <meshLambertMaterial attach="material-4" map={tex} />
      <meshLambertMaterial attach="material-5" map={tex} />
    </mesh>
  );
};

// ---------- ground ----------
const roadTex = (lanes: number) =>
  makeTex(512, 512, (c) => {
    c.fillStyle = "#545a5e";
    c.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 2600; i++) {
      c.fillStyle = `rgba(${hash(i) > 0.5 ? "255,255,255" : "0,0,0"},0.05)`;
      c.fillRect(hash(i * 3) * 512, hash(i * 7) * 512, 3, 3);
    }
    c.fillStyle = "rgba(240,240,230,0.85)";
    for (let l = 1; l < lanes; l++) for (let x = 0; x < 512; x += 128) c.fillRect(x, (l * 512) / lanes - 4, 64, 8);
  });

/** Road strip along x centred on z, plus kerbs + sidewalks either side. */
export const Road: React.FC<{ z?: number; x?: number; width: number; length: number; lanes: number; rotY?: number; walk?: number }> = ({ z = 0, x = 0, width, length, lanes, rotY = 0, walk = 3 }) => {
  const tex = useMemo(() => {
    const t = roadTex(lanes);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(length / width, 1);
    return t;
  }, [lanes, length, width]);
  return (
    <group position={[x, 0, z]} rotation={[0, rotY, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <planeGeometry args={[length, width]} />
        <meshLambertMaterial map={tex} />
      </mesh>
      {[1, -1].map((s) => (
        <group key={s}>
          <mesh position={[0, 0.08, s * (width / 2 + walk / 2)]}>
            <boxGeometry args={[length, 0.16, walk]} />
            <meshLambertMaterial color="#b9b2a6" />
          </mesh>
          <mesh position={[0, 0.1, s * (width / 2 + 0.08)]}>
            <boxGeometry args={[length, 0.2, 0.16]} />
            <meshLambertMaterial color={s > 0 ? "#d9d4c4" : "#d9d4c4"} />
          </mesh>
        </group>
      ))}
    </group>
  );
};

export const Ground: React.FC<{ color?: string }> = ({ color = "#6f6a60" }) => (
  <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
    <planeGeometry args={[1200, 1200]} />
    <meshLambertMaterial color={color} />
  </mesh>
);

// ---------- poles + wires (the Bangkok wire tangle) ----------
const sag = (a: THREE.Vector3, b: THREE.Vector3, drop: number) => {
  const mid = a.clone().lerp(b, 0.5);
  mid.y -= drop;
  return new THREE.QuadraticBezierCurve3(a, mid, b);
};

export const PoleLine: React.FC<{ x0: number; x1: number; z: number; every?: number; seed?: number }> = ({ x0, x1, z, every = 14, seed = 3 }) => {
  const poles = useMemo(() => {
    const p: number[] = [];
    for (let x = x0; x <= x1; x += every) p.push(x);
    return p;
  }, [x0, x1, every]);
  const wires = useMemo(() => {
    const geos: THREE.TubeGeometry[] = [];
    for (let i = 0; i < poles.length - 1; i++)
      for (let k = 0; k < 6; k++) {
        const y = 6.6 + k * 0.22;
        const dz = (hash(seed + k) - 0.5) * 0.5;
        const a = new THREE.Vector3(poles[i], y, z + dz);
        const b = new THREE.Vector3(poles[i + 1], y + (hash(seed + i + k) - 0.5) * 0.3, z + dz);
        geos.push(new THREE.TubeGeometry(sag(a, b, 0.5 + hash(seed * 9 + i * 6 + k) * 0.9), 16, 0.025 + k * 0.004, 4, false));
      }
    return geos;
  }, [poles, z, seed]);
  return (
    <group>
      {poles.map((x) => (
        <group key={x} position={[x, 0, z]}>
          <mesh position={[0, 4, 0]}>
            <cylinderGeometry args={[0.13, 0.18, 8, 8]} />
            <meshLambertMaterial color="#9a978f" />
          </mesh>
          <mesh position={[0, 7.4, 0]}>
            <boxGeometry args={[0.12, 0.12, 1.6]} />
            <meshLambertMaterial color="#6d6a63" />
          </mesh>
          <mesh position={[0.25, 6.2, 0.3]}>
            <cylinderGeometry args={[0.28, 0.28, 0.7, 10]} />
            <meshLambertMaterial color="#8c918e" />
          </mesh>
        </group>
      ))}
      {wires.map((g, i) => (
        <mesh key={i} geometry={g}>
          <meshBasicMaterial color="#1d1a1c" />
        </mesh>
      ))}
    </group>
  );
};

// ---------- BTS viaduct ----------
export const Viaduct: React.FC<{ x0: number; x1: number; z?: number; y?: number; train?: number }> = ({ x0, x1, z = 0, y = 10, train }) => {
  const len = x1 - x0;
  const piers: number[] = [];
  for (let x = x0 + 10; x < x1; x += 26) piers.push(x);
  return (
    <group>
      <mesh position={[x0 + len / 2, y, z]}>
        <boxGeometry args={[len, 1.4, 9]} />
        <meshLambertMaterial color="#c9c4b8" />
      </mesh>
      <mesh position={[x0 + len / 2, y + 0.9, z + 4.4]}>
        <boxGeometry args={[len, 0.5, 0.2]} />
        <meshLambertMaterial color="#b0aa9d" />
      </mesh>
      {piers.map((x) => (
        <group key={x} position={[x, 0, z]}>
          <mesh position={[0, y / 2 - 0.5, 0]}>
            <boxGeometry args={[1.6, y - 1, 1.6]} />
            <meshLambertMaterial color="#bdb7aa" />
          </mesh>
          <mesh position={[0, y - 1.1, 0]}>
            <boxGeometry args={[2.2, 0.8, 8]} />
            <meshLambertMaterial color="#b3ad9f" />
          </mesh>
        </group>
      ))}
      {train !== undefined ? (
        <group position={[train, y + 2.4, z - 1.6]}>
          {[0, 1, 2, 3].map((k) => (
            <group key={k} position={[k * 20.5, 0, 0]}>
              <mesh>
                <boxGeometry args={[20, 3.2, 3.1]} />
                <meshLambertMaterial color="#e9ecef" />
              </mesh>
              <mesh position={[0, 0.4, 1.56]}>
                <boxGeometry args={[18, 1.2, 0.02]} />
                <meshLambertMaterial color="#2d3c4c" />
              </mesh>
              <mesh position={[0, -1.1, 1.57]}>
                <boxGeometry args={[20, 0.35, 0.02]} />
                <meshLambertMaterial color="#1b6e3a" />
              </mesh>
            </group>
          ))}
        </group>
      ) : null}
    </group>
  );
};

// ---------- vehicles ----------
const CAR_COLS = ["#e7e7e7", "#2f3640", "#c0392b", "#8e9aa6", "#f1c40f", "#e85d9b", "#3a7bd5", "#f0f0ee"];

/** Rounded-ish car from boxes; facing +x. `kind` taxi = pink or green/yellow Bangkok taxi. */
export const Car: React.FC<{ pos: V3; rotY?: number; seed?: number; color?: string; taxi?: boolean; lights?: number }> = ({ pos, rotY = 0, seed = 1, color, taxi, lights = 0 }) => {
  const body = color ?? (taxi ? (hash(seed) > 0.5 ? "#ec5f9c" : "#2fb35c") : CAR_COLS[Math.floor(hash(seed * 5) * CAR_COLS.length)]);
  const L = 4.3, Wd = 1.8;
  return (
    <group position={pos} rotation={[0, rotY, 0]}>
      <mesh position={[0, 0.62, 0]}>
        <boxGeometry args={[L, 0.75, Wd]} />
        <meshLambertMaterial color={body} />
      </mesh>
      <mesh position={[-0.25, 1.25, 0]}>
        <boxGeometry args={[2.3, 0.6, Wd * 0.92]} />
        <meshLambertMaterial color={taxi && hash(seed) <= 0.5 ? "#f2d33b" : body} />
      </mesh>
      <mesh position={[-0.25, 1.26, 0]}>
        <boxGeometry args={[2.38, 0.42, Wd * 0.94]} />
        <meshLambertMaterial color="#26313c" />
      </mesh>
      {taxi ? (
        <mesh position={[-0.25, 1.65, 0]}>
          <boxGeometry args={[0.7, 0.18, 0.35]} />
          <meshBasicMaterial color="#fff6c8" />
        </mesh>
      ) : null}
      {[[-1.35, 1], [1.35, 1], [-1.35, -1], [1.35, -1]].map(([x, s], i) => (
        <mesh key={i} position={[x, 0.33, s * (Wd / 2)]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.33, 0.33, 0.24, 14]} />
          <meshLambertMaterial color="#1c1c1e" />
        </mesh>
      ))}
      {/* brake lights glow in the jam (bloom picks them up) */}
      {[0.6, -0.6].map((z) => (
        <mesh key={z} position={[-L / 2 - 0.01, 0.75, z]}>
          <boxGeometry args={[0.04, 0.16, 0.36]} />
          <meshBasicMaterial color={new THREE.Color("#ff2a1a").multiplyScalar(1 + lights * 3)} toneMapped={false} />
        </mesh>
      ))}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 0]}>
        <planeGeometry args={[L * 1.05, Wd * 1.2]} />
        <meshBasicMaterial color="#000" transparent opacity={0.3} depthWrite={false} />
      </mesh>
    </group>
  );
};

export const Motorbike: React.FC<{ pos: V3; rotY?: number }> = ({ pos, rotY = 0 }) => (
  <group position={pos} rotation={[0, rotY, 0]}>
    {[-0.62, 0.62].map((x) => (
      <mesh key={x} position={[x, 0.3, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.26, 0.07, 8, 18]} />
        <meshLambertMaterial color="#1b1b1b" />
      </mesh>
    ))}
    <mesh position={[0, 0.62, 0]}>
      <boxGeometry args={[1.1, 0.3, 0.32]} />
      <meshLambertMaterial color="#c4302b" />
    </mesh>
    <mesh position={[-0.15, 0.82, 0]}>
      <boxGeometry args={[0.7, 0.12, 0.3]} />
      <meshLambertMaterial color="#222" />
    </mesh>
    <mesh position={[0.6, 0.9, 0]} rotation={[0, 0, -0.35]}>
      <boxGeometry args={[0.08, 0.6, 0.08]} />
      <meshLambertMaterial color="#555" />
    </mesh>
    <mesh position={[0.68, 1.18, 0]}>
      <boxGeometry args={[0.06, 0.06, 0.7]} />
      <meshLambertMaterial color="#333" />
    </mesh>
  </group>
);

// ---------- street props ----------
/** Moo ping cart: table, grill with ember glow, umbrella. */
export const Stall: React.FC<{ pos: V3; rotY?: number }> = ({ pos, rotY = 0 }) => (
  <group position={pos} rotation={[0, rotY, 0]}>
    <mesh position={[0, 0.45, 0]}>
      <boxGeometry args={[1.6, 0.9, 0.8]} />
      <meshLambertMaterial color="#3d6fa8" />
    </mesh>
    <mesh position={[0, 0.94, 0]}>
      <boxGeometry args={[1.4, 0.08, 0.6]} />
      <meshLambertMaterial color="#555" />
    </mesh>
    <mesh position={[0, 0.99, 0]}>
      <boxGeometry args={[1.3, 0.02, 0.5]} />
      <meshBasicMaterial color={new THREE.Color("#ff7a2a").multiplyScalar(1.6)} toneMapped={false} />
    </mesh>
    {[-0.45, -0.15, 0.15, 0.45].map((x) => (
      <mesh key={x} position={[x, 1.03, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.035, 0.035, 0.5, 6]} />
        <meshLambertMaterial color="#8a4a22" />
      </mesh>
    ))}
    <mesh position={[0.6, 1.4, -0.2]}>
      <cylinderGeometry args={[0.03, 0.03, 2.8, 6]} />
      <meshLambertMaterial color="#777" />
    </mesh>
    <mesh position={[0.6, 2.75, -0.2]}>
      <coneGeometry args={[1.5, 0.6, 12, 1, true]} />
      <meshLambertMaterial color="#e2483d" side={THREE.DoubleSide} />
    </mesh>
  </group>
);

export const Umbrella: React.FC<{ pos: V3; color?: string; open?: number; tilt?: number }> = ({ pos, color = "#2b6cb0", open = 1, tilt = 0 }) => (
  <group position={pos} rotation={[0, 0, tilt]}>
    <mesh position={[0, -0.4, 0]}>
      <cylinderGeometry args={[0.015, 0.015, 0.9, 6]} />
      <meshLambertMaterial color="#333" />
    </mesh>
    <mesh scale={[0.3 + open * 0.7, 1, 0.3 + open * 0.7]}>
      <coneGeometry args={[0.6, 0.28, 10, 1, true]} />
      <meshLambertMaterial color={color} side={THREE.DoubleSide} />
    </mesh>
  </group>
);
