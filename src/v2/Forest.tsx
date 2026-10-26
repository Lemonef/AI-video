import React from 'react';
import {H, W} from '../lib/tokens';
import {GROUND_Y, V2} from './tokens';

export type EnvProps = {frame: number; scroll: number; fireflies: boolean; density: number};

// Deterministic pseudo-random so every render of a frame is identical.
const rnd = (i: number, salt = 1) => {
	const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
	return x - Math.floor(x);
};

const wrap = (x: number, span: number) => ((x % span) + span) % span;
// Just below the time chip (top-right); tall pines may cover part of it, which reads as depth.
const MOON_Y = 330;

const Pine: React.FC<{x: number; base: number; h: number; w: number; color: string}> = ({x, base, h, w, color}) => {
	const tiers = 4;
	return (
		<g fill={color}>
			<rect x={x - w * 0.06} y={base - h * 0.25} width={w * 0.12} height={h * 0.25} />
			{Array.from({length: tiers}, (_, i) => {
				const ty = base - h * 0.18 - i * h * 0.2;
				const tw = w * (1 - i * 0.2);
				return <path key={i} d={`M${x - tw / 2},${ty} L${x},${ty - h * 0.36} L${x + tw / 2},${ty} Z`} />;
			})}
		</g>
	);
};

/** A row of trees that scrolls at `speed` × camera; far rows move slower (parallax). */
const TreeRow: React.FC<{frame: number; scroll: number; speed: number; base: number; h: number; w: number; gap: number; color: string; salt: number; trunks?: boolean}> = ({
	frame,
	scroll,
	speed,
	base,
	h,
	w,
	gap,
	color,
	salt,
	trunks,
}) => {
	const span = W + gap * 2;
	const count = Math.ceil(span / gap) + 1;
	const offset = frame * scroll * speed;
	return (
		<g>
			{Array.from({length: count}, (_, i) => {
				const x = wrap(i * gap + rnd(i, salt) * gap * 0.6 - offset, span) - gap;
				const hh = h * (0.8 + rnd(i, salt + 2) * 0.4);
				return trunks ? (
					<g key={i}>
						<rect x={x - w / 2} y={-200} width={w} height={base + 200} fill={color} />
						<path d={`M${x - w / 2},${base} q-${w * 0.6},10 -${w * 0.9},18 h${w * 2.8} q-${w * 0.3},-8 -${w * 0.9},-18 z`} fill={color} />
					</g>
				) : (
					<Pine key={i} x={x} base={base} h={hh} w={w * (0.8 + rnd(i, salt + 3) * 0.4)} color={color} />
				);
			})}
		</g>
	);
};

const Sky: React.FC<{frame: number}> = ({frame}) => (
	<g>
		<defs>
			<linearGradient id="v2sky" x1="0" y1="0" x2="0" y2="1">
				<stop offset="0" stopColor={V2.sky0} />
				<stop offset="0.55" stopColor={V2.sky1} />
				<stop offset="1" stopColor={V2.sky2} />
			</linearGradient>
			<radialGradient id="v2moon">
				<stop offset="0" stopColor={V2.moonGlow} />
				<stop offset="1" stopColor="rgba(0,0,0,0)" />
			</radialGradient>
		</defs>
		<rect width={W} height={H} fill="url(#v2sky)" />
		{Array.from({length: 70}, (_, i) => (
			<circle key={i} cx={rnd(i, 9) * W} cy={rnd(i, 10) * 900} r={1 + rnd(i, 11) * 2.2} fill={V2.moon} opacity={0.25 + 0.5 * Math.abs(Math.sin(frame / 25 + i))} />
		))}
		<circle cx={820} cy={MOON_Y} r={260} fill="url(#v2moon)" />
		<circle cx={820} cy={MOON_Y} r={78} fill={V2.moon} />
		<circle cx={846} cy={MOON_Y - 12} r={14} fill="#DCD5BC" opacity={0.6} />
		<circle cx={800} cy={MOON_Y + 26} r={9} fill="#DCD5BC" opacity={0.5} />
	</g>
);

const Fog: React.FC<{frame: number; y: number; speed: number; opacity: number}> = ({frame, y, speed, opacity}) => (
	<g opacity={opacity} filter="url(#v2blur)">
		{[0, 1, 2].map((i) => (
			<ellipse key={i} cx={wrap(i * 520 + frame * speed, W + 600) - 300} cy={y + i * 14} rx={420} ry={60} fill={V2.fog} />
		))}
	</g>
);

const Fireflies: React.FC<{frame: number}> = ({frame}) => (
	<g>
		{Array.from({length: 22}, (_, i) => {
			const x = rnd(i, 21) * W + Math.sin(frame / 30 + i) * 30;
			const y = GROUND_Y - 780 + rnd(i, 22) * 600 + Math.cos(frame / 26 + i * 2) * 24;
			const on = 0.3 + 0.7 * Math.max(0, Math.sin(frame / 12 + i * 1.7));
			return (
				<g key={i} opacity={on}>
					<circle cx={x} cy={y} r={12} fill={V2.firefly} opacity={0.18} />
					<circle cx={x} cy={y} r={3.5} fill={V2.firefly} />
				</g>
			);
		})}
	</g>
);

const Defs = () => (
	<defs>
		<filter id="v2blur" x="-20%" y="-50%" width="140%" height="200%">
			<feGaussianBlur stdDeviation="22" />
		</filter>
		<filter id="v2near" x="-10%" y="-10%" width="120%" height="120%">
			<feGaussianBlur stdDeviation="6" />
		</filter>
	</defs>
);

/** Side-on forest path: sky, three parallax tree rows, fog, ground, near trunks out of focus. */
export const ForestPath: React.FC<EnvProps> = ({frame, scroll, fireflies, density}) => (
	<g>
		<Defs />
		<Sky frame={frame} />
		<TreeRow frame={frame} scroll={scroll} speed={0.15} base={GROUND_Y - 400} h={520} w={220} gap={150 / density} color={V2.far} salt={1} />
		<Fog frame={frame} y={GROUND_Y - 480} speed={0.6} opacity={0.9} />
		<TreeRow frame={frame} scroll={scroll} speed={0.4} base={GROUND_Y - 300} h={700} w={280} gap={230 / density} color={V2.mid} salt={2} />
		<rect x={0} y={GROUND_Y - 120} width={W} height={H} fill={V2.ground} />
		<path d={`M0,${GROUND_Y - 20} C300,${GROUND_Y - 50} 700,${GROUND_Y + 10} ${W},${GROUND_Y - 30} L${W},${GROUND_Y + 60} C700,${GROUND_Y + 80} 300,${GROUND_Y + 30} 0,${GROUND_Y + 60} Z`} fill={V2.path} />
		<TreeRow frame={frame} scroll={scroll} speed={0.75} base={GROUND_Y - 10} h={0} w={70} gap={420 / density} color={V2.near} salt={3} trunks />
		<Fog frame={frame} y={GROUND_Y - 40} speed={1.1} opacity={0.7} />
		{fireflies ? <Fireflies frame={frame} /> : null}
	</g>
);

/** Facing into the forest: a path narrowing into darkness, a wooden sign at the edge. */
export const ForestEdge: React.FC<EnvProps> = ({frame, density}) => (
	<g>
		<Defs />
		<Sky frame={frame} />
		<TreeRow frame={0} scroll={0} speed={0} base={GROUND_Y - 380} h={560} w={240} gap={140 / density} color={V2.far} salt={4} />
		<Fog frame={frame} y={GROUND_Y - 440} speed={0.5} opacity={1} />
		<TreeRow frame={0} scroll={0} speed={0} base={GROUND_Y - 260} h={760} w={300} gap={200 / density} color={V2.mid} salt={5} />
		<rect x={0} y={GROUND_Y - 100} width={W} height={H} fill={V2.ground} />
		<path d={`M${W / 2 - 40},${GROUND_Y - 110} L${W / 2 + 40},${GROUND_Y - 110} L${W / 2 + 330},${H} L${W / 2 - 330},${H} Z`} fill={V2.path} />
		<ellipse cx={W / 2} cy={GROUND_Y - 150} rx={120} ry={90} fill="#05070D" opacity={0.9} filter="url(#v2blur)" />
		{/* sign post */}
		<g transform={`translate(190 ${GROUND_Y + 40}) rotate(-4)`}>
			<rect x={-12} y={-300} width={24} height={300} fill="#4A3426" />
			<rect x={-130} y={-360} width={260} height={130} rx={10} fill="#6B4A33" />
			<rect x={-118} y={-348} width={236} height={106} rx={6} fill="#7E5A3F" />
			<text x={0} y={-300} textAnchor="middle" fontFamily="Kanit" fontWeight={800} fontSize={44} fill={V2.paper}>
				เขตป่า
			</text>
			<text x={0} y={-258} textAnchor="middle" fontFamily="Kanit" fontWeight={600} fontSize={28} fill={V2.paperShade}>
				อ่านกฎก่อนเข้า
			</text>
		</g>
		<TreeRow frame={0} scroll={0} speed={0} base={GROUND_Y + 220} h={0} w={90} gap={760 / density} color={V2.near} salt={6} trunks />
		<Fog frame={frame} y={GROUND_Y} speed={0.9} opacity={0.8} />
		<Fireflies frame={frame} />
	</g>
);

/** Almost-black backdrop with drifting fog, for close-ups and the freeze. */
export const Dark: React.FC<EnvProps> = ({frame}) => (
	<g>
		<Defs />
		<rect width={W} height={H} fill="#070A14" />
		<Fog frame={frame} y={600} speed={0.4} opacity={0.6} />
		<Fog frame={frame} y={1400} speed={-0.7} opacity={0.5} />
	</g>
);

export const ENVIRONMENTS: Record<string, React.FC<EnvProps>> = {
	forestPath: ForestPath,
	forestEdge: ForestEdge,
	dark: Dark,
};
