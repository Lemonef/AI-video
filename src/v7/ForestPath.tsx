import React from 'react';
import {H, W} from '../lib/tokens';
import type {EnvProps} from '../v2/Forest';
import {Darkness, Glow, Shaft} from './light';

/**
 * A dirt path straight into a Thai forest at night, one-point perspective. Trees sit at depth z
 * (1 = beside the camera, larger = farther): position and size scale by 1/z toward the vanishing
 * point and colour sinks into the fog. Walking dollies the camera forward (z shrinks), so trees
 * stream past. Light: the flashlight cone on the path, cold moonlight everywhere else.
 */
const VP = {x: W / 2, y: 820};
const PATH_HALF = 260; // half the path width at z = 1
const ROW_OFFSET = 70; // how far beyond the path edge a tree row starts, at z = 1 (near rows must land in frame)
const GROUND_DROP = 1100; // ground below the VP at z = 1
const Z_NEAR = 0.8;
const Z_FAR = 10;
const ROWS = 12;
const DOLLY_PER_SCROLL = 0.006;
const C = {
	skyTop: '#060B1A',
	skyLow: '#16274A',
	ground: '#141A22',
	path: '#3A3226',
	pathEdge: '#2A241C',
	trunkNear: '#211C17',
	trunkFar: '#38507A',
	leafNear: '#13221D',
	leafFar: '#35507E',
	rim: '#9DB8E6',
	grass: '#0E1612',
	fog: '#5C7AA8',
	moon: '#DCE6F5',
	moonGlow: '#8FB0E8',
	torch: '#FFC27A',
	night: '#03060E',
};

const rnd = (i: number, salt: number) => {
	const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
	return x - Math.floor(x);
};
const mix = (a: string, b: string, t: number) => {
	const pa = [1, 3, 5].map((k) => parseInt(a.slice(k, k + 2), 16));
	const pb = [1, 3, 5].map((k) => parseInt(b.slice(k, k + 2), 16));
	return `rgb(${pa.map((v, i) => Math.round(v + (pb[i] - v) * t)).join(',')})`;
};
// 0 near .. 1 far, eased so most of the fade happens in the middle distance
const fade = (z: number) => Math.min(1, Math.pow((z - Z_NEAR) / (Z_FAR - Z_NEAR), 0.55));

/**
 * One tree: a trunk and a canopy of overlapping leaf masses. The side facing the moon (right)
 * gets a thin rim of cold light: that edge is what separates dark trees from a dark night.
 */
const Tree: React.FC<{x: number; base: number; s: number; seed: number; trunk: string; leaf: string; rim: number}> = ({x, base, s, seed, trunk, leaf, rim}) => {
	const h = 1300 * s * (0.85 + rnd(seed, 2) * 0.35);
	const w = 80 * s;
	const top = base - h;
	const blobs = Array.from({length: 5}, (_, i) => ({
		cx: x + (rnd(seed + i, 4) - 0.5) * 300 * s,
		cy: top + rnd(seed + i, 5) * 220 * s,
		r: (120 + rnd(seed + i, 6) * 90) * s,
	}));
	return (
		<g>
			<path d={`M${x - w / 2},${base} L${x - w * 0.32},${top + 120 * s} L${x + w * 0.32},${top + 120 * s} L${x + w / 2},${base} Z`} fill={trunk} />
			<path d={`M${x + w * 0.3},${base} L${x + w * 0.2},${top + 120 * s} L${x + w * 0.32},${top + 120 * s} L${x + w / 2},${base} Z`} fill={C.rim} opacity={rim} />
			{blobs.map((b, i) => (
				<g key={i}>
					<circle cx={b.cx} cy={b.cy} r={b.r} fill={leaf} />
					<path d={`M${b.cx + b.r * 0.2},${b.cy - b.r * 0.98} A${b.r},${b.r} 0 0 1 ${b.cx + b.r * 0.98},${b.cy - b.r * 0.2}`} fill="none" stroke={C.rim} strokeOpacity={rim} strokeWidth={Math.max(2, 10 * s)} />
				</g>
			))}
		</g>
	);
};

/** The far forest as layered bumpy silhouettes, so the trees never end at a hard horizon line. */
const Treeline: React.FC<{y: number; amp: number; color: string; seed: number}> = ({y, amp, color, seed}) => {
	// round crowns of uneven height (pointed bumps read as spires, not trees)
	// many small crowns read as forest; few big ones read as clouds
	const step = amp * 0.32;
	return (
		<g fill={color}>
			{Array.from({length: Math.ceil(W / step) + 2}, (_, i) => {
				const r = amp * (0.22 + rnd(seed + i, 11) * 0.16);
				const lift = amp * rnd(seed + i, 14) * 0.55;
				return <circle key={i} cx={i * step - step / 2} cy={y - lift} r={r} />;
			})}
			{/* body down to the horizon only: deeper would leave a hard edge across the ground */}
			<rect x={0} y={y - amp * 0.3} width={W} height={amp * 0.3 + 4} />
		</g>
	);
};

/** Undergrowth mound between the trunks: fills the gaps at ground level. */
const Bush: React.FC<{x: number; y: number; s: number; color: string; seed: number}> = ({x, y, s, color, seed}) => (
	<g fill={color}>
		{Array.from({length: 4}, (_, i) => (
			<circle key={i} cx={x + (i - 1.5) * 70 * s} cy={y - (40 + rnd(seed + i, 12) * 50) * s} r={(70 + rnd(seed + i, 13) * 40) * s} />
		))}
	</g>
);

/** Grass tufts along the path edges: they give the ground scale and texture. */
const Tuft: React.FC<{x: number; y: number; s: number; color: string}> = ({x, y, s, color}) => (
	<path d={`M${x - 40 * s},${y} L${x - 22 * s},${y - 70 * s} L${x - 8 * s},${y - 10 * s} L${x + 4 * s},${y - 95 * s} L${x + 16 * s},${y - 12 * s} L${x + 34 * s},${y - 60 * s} L${x + 44 * s},${y} Z`} fill={color} />
);

/** Bamboo clump: thin tall stalks leaning out, a few leaf slivers. */
const Bamboo: React.FC<{x: number; base: number; s: number; seed: number; color: string}> = ({x, base, s, seed, color}) => (
	<g stroke={color} strokeLinecap="round">
		{Array.from({length: 6}, (_, i) => {
			const lean = (rnd(seed + i, 7) - 0.5) * 300 * s;
			const h = 1300 * s * (0.7 + rnd(seed + i, 8) * 0.5);
			const bx = x + (i - 2.5) * 16 * s;
			return <path key={i} d={`M${bx},${base} Q${bx + lean * 0.3},${base - h * 0.6} ${bx + lean},${base - h}`} fill="none" strokeWidth={Math.max(2, 14 * s)} />;
		})}
	</g>
);

/** Big banana leaves in the near foreground, framing the shot. */
const BananaLeaf: React.FC<{x: number; y: number; angle: number; size: number; color: string}> = ({x, y, angle, size, color}) => (
	<g transform={`translate(${x} ${y}) rotate(${angle}) scale(${size})`}>
		<path d="M0,0 Q120,-60 300,-30 Q420,-10 520,40 Q400,90 280,80 Q120,70 0,0 Z" fill={color} />
		<path d="M0,0 Q260,10 520,40" fill="none" stroke="#000" strokeOpacity={0.35} strokeWidth={6} />
	</g>
);

export const ForestPath: React.FC<EnvProps> = ({frame, scroll}) => {
	const dolly = frame * scroll * DOLLY_PER_SCROLL;
	const span = Z_FAR - Z_NEAR;
	const items = Array.from({length: ROWS * 2}, (_, k) => {
		const row = Math.floor(k / 2);
		const side = k % 2 ? 1 : -1;
		const z0 = Z_NEAR + (row / ROWS) * span + rnd(k, 1) * (span / ROWS) * 0.8;
		const z = Z_NEAR + ((((z0 - Z_NEAR - dolly) % span) + span) % span);
		return {z, side, k, kind: rnd(k, 9) < 0.3 ? 'bamboo' : 'tree'};
	}).sort((a, b) => b.z - a.z); // far first

	const pathL = (y: number) => VP.x - PATH_HALF * ((y - VP.y) / GROUND_DROP);
	const pathR = (y: number) => VP.x + PATH_HALF * ((y - VP.y) / GROUND_DROP);
	const flicker = 0.95 + 0.05 * Math.sin(frame / 5) * Math.sin(frame / 11);

	return (
		<g>
			<defs>
				<linearGradient id="fp-sky" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0" stopColor={C.skyTop} />
					<stop offset="1" stopColor={C.skyLow} />
				</linearGradient>
				<linearGradient id="fp-ground" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0" stopColor={mix(C.leafNear, C.leafFar, 0.7)} />
					<stop offset="0.25" stopColor={C.ground} />
				</linearGradient>
				<radialGradient id="fp-fog">
					<stop offset="0" stopColor={C.fog} stopOpacity={0.28} />
					<stop offset="1" stopColor={C.fog} stopOpacity={0} />
				</radialGradient>
			</defs>
			<rect width={W} height={VP.y + 40} fill="url(#fp-sky)" />
			<circle cx={760} cy={300} r={58} fill={C.moon} />
			<rect y={VP.y} width={W} height={H - VP.y} fill="url(#fp-ground)" />
			{/* the far forest as a tall wall: the eye should never find where the trees end */}
			<Treeline y={VP.y + 6} amp={340} color={mix(C.leafFar, C.skyLow, 0.35)} seed={1} />
			<Treeline y={VP.y + 6} amp={200} color={mix(C.leafNear, C.leafFar, 0.7)} seed={2} />
			<polygon points={`${VP.x - 6},${VP.y} ${VP.x + 6},${VP.y} ${pathR(H)},${H} ${pathL(H)},${H}`} fill={C.path} />
			<polygon points={`${VP.x - 6},${VP.y} ${pathL(H) + 60},${H} ${pathL(H)},${H}`} fill={C.pathEdge} />
			<polygon points={`${VP.x + 6},${VP.y} ${pathR(H) - 60},${H} ${pathR(H)},${H}`} fill={C.pathEdge} />
			{items.map(({z, side, k, kind}) => {
				const s = 1 / z;
				const t = fade(z);
				const x = VP.x + side * (PATH_HALF + ROW_OFFSET + rnd(k, 3) * 200) * s;
				const base = VP.y + GROUND_DROP * s;
				// soft fog pools between rows (wide blurred ellipses, never hard bands)
				const fog = <ellipse cx={VP.x} cy={base - 120 * s} rx={W} ry={260 * s + 40} fill="url(#fp-fog)" />;
				return (
					<g key={k}>
						{kind === 'bamboo' ? (
							<Bamboo x={x} base={base} s={s} seed={k} color={mix(C.trunkNear, C.trunkFar, t)} />
						) : (
							<Tree x={x} base={base} s={s} seed={k} trunk={mix(C.trunkNear, C.trunkFar, t)} leaf={mix(C.leafNear, C.leafFar, t)} rim={side > 0 ? 0.15 : 0.45} />
						)}
						<Bush x={x + side * 180 * s} y={base} s={s} color={mix(C.leafNear, C.leafFar, Math.min(1, t + 0.1))} seed={k} />
						<Tuft x={side > 0 ? pathR(base) + 30 * s : pathL(base) - 30 * s} y={base} s={s * 1.4} color={C.grass} />
						{k % 3 === 0 ? fog : null}
					</g>
				);
			})}
			<BananaLeaf x={-80} y={1800} angle={-35} size={1.1} color={C.leafNear} />
			<BananaLeaf x={1160} y={1760} angle={215} size={1.0} color={C.leafNear} />
			<Darkness id="fp" color={C.night} opacity={0.62} lights={[{x: VP.x, y: 1480, reach: 700 * flicker}, {x: 760, y: 300, reach: 520}]} />
			<Glow id="fp-moon" x={760} y={300} r={420} color={C.moonGlow} strength={0.7} />
			<Shaft id="fp-torch" points={[[470, H], [610, H], [760, 1050], [320, 1050]]} from={[540, H]} to={[540, 1050]} color={C.torch} opacity={0.38 * flicker} blur={24} />
		</g>
	);
};
