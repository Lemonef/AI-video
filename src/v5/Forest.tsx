import React from 'react';
import {H, W} from '../lib/tokens';
import type {EnvProps} from '../v2/Forest';
import {ForestAhead, ForestClinic, ForestDark, ForestPath} from '../v7/ForestPath';
import {ForestMap, ForestMapChase, InsertFootprints, InsertPhone, InsertThermometer, InsertTorch} from '../v7/Inserts';
import {HouseOutside, InsertFeetMum, InsertFeetTwo} from '../v7/HouseOutside';
import {StoreDark, StoreInside, StoreOutside} from '../v7/Store';
import {CityMap, InsertShutter, InsertTV, StoreMap} from '../v7/StoreInserts';
import {HouseNight} from '../v7/House';
import {J5, VP} from './tokens';

/**
 * One-point-perspective night forest. Every tree sits at a depth z (1 = at the camera, larger =
 * farther); screen position and size scale by 1/z toward the vanishing point, and colour fades
 * into the haze with distance. Walking = the camera dollies forward (z shrinks over time).
 */
const SIDE = 820; // tree distance from the path centre at z = 1 (px)
const GROUND_DROP = 960; // ground y below the VP at z = 1
const TREE_H = 2600; // tree height at z = 1
const Z_NEAR = 0.7;
const Z_FAR = 9;
const ROWS = 14;
const DOLLY_PER_SCROLL = 0.006; // z per frame per unit of scene.scroll

const rnd = (i: number, salt: number) => {
	const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
	return x - Math.floor(x);
};

const mix = (a: string, b: string, t: number) => {
	const pa = [1, 3, 5].map((k) => parseInt(a.slice(k, k + 2), 16));
	const pb = [1, 3, 5].map((k) => parseInt(b.slice(k, k + 2), 16));
	return `rgb(${pa.map((v, i) => Math.round(v + (pb[i] - v) * t)).join(',')})`;
};

const Pine: React.FC<{x: number; base: number; h: number; w: number; trunk: string; leaf: string; seed: number}> = ({x, base, h, w, trunk, leaf, seed}) => {
	const tiers = 6;
	const crownTop = base - h;
	const crownBottom = base - h * 0.42; // trunk shows below the crown: tall-forest look
	return (
		<g>
			<rect x={x - w * 0.05} y={crownTop + h * 0.1} width={w * 0.1} height={base - crownTop - h * 0.1} fill={trunk} />
			{Array.from({length: tiers}, (_, i) => {
				const t = i / (tiers - 1);
				const ty = crownTop + (crownBottom - crownTop) * t;
				const tw = w * (0.25 + 0.75 * t) * (0.9 + rnd(seed + i, 3) * 0.2);
				const droop = h * 0.05;
				return <path key={i} d={`M${x},${ty - h * 0.09} Q${x - tw * 0.2},${ty} ${x - tw / 2},${ty + droop} Q${x},${ty + droop * 0.4} ${x + tw / 2},${ty + droop} Q${x + tw * 0.2},${ty} ${x},${ty - h * 0.09} Z`} fill={leaf} />;
			})}
		</g>
	);
};

export const ForestDepth: React.FC<EnvProps> = ({frame, scroll, fireflies}) => {
	const dolly = frame * scroll * DOLLY_PER_SCROLL;
	const span = Z_FAR - Z_NEAR;
	// Each row keeps its place in a repeating band of depth, so trees stream past forever.
	const trees = Array.from({length: ROWS * 2}, (_, k) => {
		const row = Math.floor(k / 2);
		const side = k % 2 ? 1 : -1;
		const z0 = Z_NEAR + (row / ROWS) * span + rnd(k, 1) * (span / ROWS) * 0.8;
		const z = Z_NEAR + ((((z0 - Z_NEAR - dolly) % span) + span) % span);
		return {z, side, k};
	}).sort((a, b) => b.z - a.z); // far first

	return (
		<g>
			<defs>
				<linearGradient id="v5sky" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0" stopColor={J5.skyTop} />
					<stop offset="0.6" stopColor={J5.skyMid} />
					<stop offset="1" stopColor={J5.skyLow} />
				</linearGradient>
				<radialGradient id="v5moon">
					<stop offset="0" stopColor={J5.moon} stopOpacity={0.35} />
					<stop offset="1" stopColor={J5.moon} stopOpacity={0} />
				</radialGradient>
				<linearGradient id="v5path" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0" stopColor={J5.pathFar} />
					<stop offset="1" stopColor={J5.pathNear} />
				</linearGradient>
				<radialGradient id="v5vp" cx="0.5" cy="0.5" r="0.5">
					<stop offset="0" stopColor={J5.haze} stopOpacity={0.55} />
					<stop offset="1" stopColor={J5.haze} stopOpacity={0} />
				</radialGradient>
				<linearGradient id="v5shaft" x1="0" y1="0" x2="1" y2="1">
					<stop offset="0" stopColor={J5.moonShaft} stopOpacity={0.16} />
					<stop offset="1" stopColor={J5.moonShaft} stopOpacity={0} />
				</linearGradient>
				<filter id="v5soft">
					<feGaussianBlur stdDeviation="18" />
				</filter>
			</defs>
			<rect width={W} height={H} fill="url(#v5sky)" />
			<circle cx={760} cy={380} r={240} fill="url(#v5moon)" />
			<circle cx={760} cy={380} r={62} fill={J5.moon} />
			{/* ground + path converging on the vanishing point */}
			<rect x={0} y={VP.y} width={W} height={H - VP.y} fill={J5.ground} />
			<path d={`M${VP.x - 14},${VP.y} L${VP.x + 14},${VP.y} L${VP.x + 420},${H} L${VP.x - 420},${H} Z`} fill="url(#v5path)" />
			{/* glow of haze where the path disappears */}
			<ellipse cx={VP.x} cy={VP.y - 40} rx={360} ry={280} fill="url(#v5vp)" />
			{trees.map(({z, side, k}) => {
				const s = 1 / z;
				const t = Math.min(1, (z - Z_NEAR) / (span * 0.75)); // 0 near … 1 far
				const x = VP.x + side * (SIDE + rnd(k, 2) * 260) * s;
				const base = VP.y + GROUND_DROP * s;
				return (
					<Pine
						key={k}
						x={x}
						base={base}
						h={TREE_H * s * (0.85 + rnd(k, 4) * 0.3)}
						w={760 * s}
						trunk={mix(J5.trunkNear, J5.trunkFar, t)}
						leaf={mix(J5.pineNear, J5.pineFar, t)}
						seed={k}
					/>
				);
			})}
			{/* moonlight shafts from upper right, gently breathing */}
			{[0, 1, 2].map((i) => (
				<path
					key={i}
					d={`M${820 + i * 90},0 L${900 + i * 90},0 L${380 + i * 120},${VP.y + 300} L${240 + i * 120},${VP.y + 300} Z`}
					fill="url(#v5shaft)"
					opacity={0.6 + 0.4 * Math.sin(frame / 60 + i * 2)}
				/>
			))}
			{/* low mist rolling across the path */}
			{[0, 1].map((i) => (
				<ellipse key={i} cx={((i * 600 + frame * (0.6 + i * 0.3)) % (W + 800)) - 400} cy={VP.y + 120 + i * 220} rx={520} ry={70} fill={J5.haze} opacity={0.18} filter="url(#v5soft)" />
			))}
			{fireflies
				? Array.from({length: 14}, (_, i) => {
						const x = rnd(i, 21) * W + Math.sin(frame / 30 + i) * 30;
						const y = VP.y - 200 + rnd(i, 22) * 700 + Math.cos(frame / 26 + i * 2) * 24;
						const on = 0.25 + 0.75 * Math.max(0, Math.sin(frame / 12 + i * 1.7));
						return (
							<g key={i} opacity={on}>
								<circle cx={x} cy={y} r={11} fill="#E9FF9A" opacity={0.2} />
								<circle cx={x} cy={y} r={3} fill="#E9FF9A" />
							</g>
						);
					})
				: null}
		</g>
	);
};

const MOON_SIDE = {x: 880, y: 420};
const GROUND_SIDE = 1480; // side-view ground line (matches v2 GROUND_Y so the v2 rig stands on it)
const wrap = (x: number, span: number) => ((x % span) + span) % span;

/** A parallax row of the v5 pines for the side-on walk; far rows hazier, slower, smaller. */
const PineRow: React.FC<{frame: number; scroll: number; speed: number; base: number; h: number; w: number; gap: number; t: number; salt: number}> = ({frame, scroll, speed, base, h, w, gap, t, salt}) => {
	const span = W + gap * 2;
	const count = Math.ceil(span / gap) + 1;
	const offset = frame * scroll * speed;
	return (
		<g>
			{Array.from({length: count}, (_, i) => {
				const x = wrap(i * gap + rnd(i, salt) * gap * 0.5 - offset, span) - gap;
				return <Pine key={i} x={x} base={base} h={h * (0.85 + rnd(i, salt + 1) * 0.3)} w={w} trunk={mix(J5.trunkNear, J5.trunkFar, t)} leaf={mix(J5.pineNear, J5.pineFar, t)} seed={i + salt * 50} />;
			})}
		</g>
	);
};

/** Side-on forest for walking left-to-right (the v2/v3 framing), drawn with the v5 art rules. */
export const ForestSide: React.FC<EnvProps> = ({frame, scroll, fireflies}) => (
	<g>
		<defs>
			<linearGradient id="v6sky" x1="0" y1="0" x2="0" y2="1">
				<stop offset="0" stopColor={J5.skyTop} />
				<stop offset="0.55" stopColor={J5.skyMid} />
				<stop offset="1" stopColor={J5.skyLow} />
			</linearGradient>
			<radialGradient id="v6moon">
				<stop offset="0" stopColor={J5.moon} stopOpacity={0.35} />
				<stop offset="1" stopColor={J5.moon} stopOpacity={0} />
			</radialGradient>
			<linearGradient id="v6ground" x1="0" y1="0" x2="0" y2="1">
				<stop offset="0" stopColor={J5.pathFar} />
				<stop offset="1" stopColor={J5.ground} />
			</linearGradient>
			<linearGradient id="v6shaft" x1="0" y1="0" x2="1" y2="1">
				<stop offset="0" stopColor={J5.moonShaft} stopOpacity={0.15} />
				<stop offset="1" stopColor={J5.moonShaft} stopOpacity={0} />
			</linearGradient>
			<linearGradient id="v6mist" x1="0" y1="0" x2="0" y2="1">
				<stop offset="0" stopColor={J5.haze} stopOpacity={0} />
				<stop offset="0.5" stopColor={J5.haze} stopOpacity={0.35} />
				<stop offset="1" stopColor={J5.haze} stopOpacity={0} />
			</linearGradient>
			<filter id="v6blur">
				<feGaussianBlur stdDeviation="24" />
			</filter>
		</defs>
		<rect width={W} height={H} fill="url(#v6sky)" />
		{/* moon right of the hook title's line length and below the time chip */}
		<circle cx={MOON_SIDE.x} cy={MOON_SIDE.y} r={260} fill="url(#v6moon)" />
		<circle cx={MOON_SIDE.x} cy={MOON_SIDE.y} r={66} fill={J5.moon} />
		<PineRow frame={frame} scroll={scroll} speed={0.12} base={GROUND_SIDE - 330} h={500} w={240} gap={150} t={1} salt={1} />
		<rect x={0} y={GROUND_SIDE - 520} width={W} height={300} fill="url(#v6mist)" />
		{/* mid row kept hazy and smaller so the character, not the trees, owns the frame */}
		<PineRow frame={frame} scroll={scroll} speed={0.35} base={GROUND_SIDE - 220} h={760} w={330} gap={240} t={0.78} salt={2} />
		{/* light shafts blurred: a hard polygon edge reads as a seam in the picture */}
		<g filter="url(#v6blur)">
			{[0, 1, 2].map((i) => (
				<path key={i} d={`M${640 + i * 110},0 L${720 + i * 110},0 L${260 + i * 140},${GROUND_SIDE} L${120 + i * 140},${GROUND_SIDE} Z`} fill="url(#v6shaft)" opacity={0.6 + 0.4 * Math.sin(frame / 60 + i * 2)} />
			))}
		</g>
		<rect x={0} y={GROUND_SIDE - 60} width={W} height={H - GROUND_SIDE + 60} fill="url(#v6ground)" />
		<rect x={0} y={GROUND_SIDE - 120} width={W} height={220} fill="url(#v6mist)" opacity={0.8} />
		{/* No near "foreground" trunks here: this layer renders BEHIND the cast, so they read as flat
		    dark bars cutting through the frame (and through Jaab), not as depth. */}
		{fireflies
			? Array.from({length: 16}, (_, i) => {
					const x = rnd(i, 31) * W + Math.sin(frame / 30 + i) * 30;
					const y = GROUND_SIDE - 750 + rnd(i, 32) * 650 + Math.cos(frame / 26 + i * 2) * 24;
					const on = 0.25 + 0.75 * Math.max(0, Math.sin(frame / 12 + i * 1.7));
					return (
						<g key={i} opacity={on}>
							<circle cx={x} cy={y} r={11} fill="#E9FF9A" opacity={0.2} />
							<circle cx={x} cy={y} r={3} fill="#E9FF9A" />
						</g>
					);
				})
			: null}
	</g>
);

export const ENV5: Record<string, React.FC<EnvProps>> = {
	forestDepth: ForestDepth,
	forestSide: ForestSide,
	houseNight: HouseNight,
	forestPath: ForestPath,
	forestClinic: ForestClinic,
	forestMap: ForestMap,
	insertThermometer: InsertThermometer,
	insertTorch: InsertTorch,
	forestDark: ForestDark,
	forestAhead: ForestAhead,
	forestMapChase: ForestMapChase,
	insertFootprints: InsertFootprints,
	insertPhone: InsertPhone,
	storeInside: StoreInside,
	storeDark: StoreDark,
	storeOutside: StoreOutside,
	insertTV: InsertTV,
	cityMap: CityMap,
	storeMap: StoreMap,
	insertShutter: InsertShutter,
	houseOutside: HouseOutside,
	insertFeetTwo: InsertFeetTwo,
	insertFeetMum: InsertFeetMum,
};
