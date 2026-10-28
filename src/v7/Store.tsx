import React from 'react';
import {FONT_CAPTION} from '../lib/fonts';
import {H, W} from '../lib/tokens';
import type {EnvProps} from '../v2/Forest';
import {ContactShadow, Darkness, Glow, Shaft} from './light';

/**
 * The convenience store at closing time, in the v7 look: one-point perspective, simple blocks,
 * light doing the work. StoreInside has two lightings: the fluorescent tubes on, and the power
 * cut (only the green EXIT sign and the street lamp through the glass). StoreOutside is the lit
 * shop alone in a dark car park.
 */
const VP = {x: W / 2, y: 880};
const BACK = {left: 240, right: 840, top: 560, bottom: 1120};
const SHELF_TOP = 0.62; // shelves rise to this share of the wall height
const C = {
	ceiling: '#D9DED9',
	wallTrim: '#B7BEB8',
	floor: '#C9CCC4',
	tile: '#ADB1A8',
	shelf: '#E9ECE6',
	shelfEdge: '#9AA19A',
	products: ['#E2574C', '#F2B134', '#4BA3C3', '#6CBF6A', '#F07AA6', '#8D6CC8', '#F5F0E1'],
	tube: '#F6FFF9',
	night: '#05080F',
	nightSky: '#0B1426',
	carpark: '#151B26',
	line: '#E9E4D2',
	lamp: '#FFD9A0',
	exit: '#3DFF8C',
	counter: '#3E6B8A',
	counterTop: '#E7EAE6',
	cool: '#E8F6FF',
	glassHi: '#FFFFFF',
	city: '#B3262B',
};

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const pts = (p: Array<[number, number]>) => p.map((q) => q.join(',')).join(' ');
// where the ray from the vanishing point through (x, y0) crosses height y
const along = (x: number, y0: number, y: number) => VP.x + ((x - VP.x) * (y - VP.y)) / (y0 - VP.y);

/** A side wall of shelves: t = depth (0 back .. 1 front edge), h = height (0 floor .. 1 ceiling). */
const wallPoint = (side: -1 | 1, t: number, h: number): [number, number] => {
	const bx = side < 0 ? BACK.left : BACK.right;
	const fx = side < 0 ? -200 : W + 200;
	const x = lerp(bx, fx, t);
	const floorY = VP.y + ((x - VP.x) * (BACK.bottom - VP.y)) / (bx - VP.x);
	const ceilY = VP.y + ((x - VP.x) * (BACK.top - VP.y)) / (bx - VP.x);
	return [x, lerp(floorY, ceilY, h)];
};

const Shelves: React.FC<{side: -1 | 1}> = ({side}) => {
	const levels = [0.05, 0.22, 0.39, SHELF_TOP * 0.95];
	const q = (t0: number, t1: number, h0: number, h1: number) => pts([wallPoint(side, t0, h0), wallPoint(side, t1, h0), wallPoint(side, t1, h1), wallPoint(side, t0, h1)]);
	return (
		<g>
			<polygon points={q(0, 1, 0, SHELF_TOP)} fill={C.shelf} />
			{levels.slice(0, -1).map((h0, i) => {
				const h1 = levels[i + 1] - 0.03;
				return Array.from({length: 13}, (_, k) => {
					const t0 = k / 13 + 0.005;
					return <polygon key={`${i}-${k}`} points={q(t0, t0 + 1 / 13 - 0.012, h0 + 0.01, h0 + (h1 - h0) * (0.65 + ((k * 7 + i * 3) % 5) * 0.07))} fill={C.products[(k * 3 + i * 5) % C.products.length]} />;
				});
			})}
			{levels.map((h, i) => (
				<polygon key={i} points={q(0, 1, h - 0.008, h + 0.008)} fill={C.shelfEdge} />
			))}
		</g>
	);
};

/** What the glass front shows: the dark car park, a street lamp, a red glow over the city. */
const Outside: React.FC<{x: number; y: number; w: number; h: number; frame: number}> = ({x, y, w, h, frame}) => (
	<g>
		<defs>
			<linearGradient id="st-sky" x1="0" y1="0" x2="0" y2="1">
				<stop offset="0" stopColor={C.nightSky} />
				<stop offset="0.75" stopColor="#2A1620" />
				<stop offset="1" stopColor={C.carpark} />
			</linearGradient>
			<clipPath id="st-glass">
				<rect x={x} y={y} width={w} height={h} />
			</clipPath>
		</defs>
		<g clipPath="url(#st-glass)">
			<rect x={x} y={y} width={w} height={h} fill="url(#st-sky)" />
			<ellipse cx={x + w * 0.7} cy={y + h * 0.62} rx={w * 0.5} ry={h * 0.12} fill={C.city} opacity={0.35 + 0.05 * Math.sin(frame / 9)} style={{filter: 'blur(20px)'}} />
			<rect x={x} y={y + h * 0.66} width={w} height={h * 0.34} fill={C.carpark} />
			{[0.18, 0.42, 0.66, 0.9].map((u, i) => (
				<line key={i} x1={x + w * u} y1={y + h * 0.7} x2={x + w * (u - 0.08)} y2={y + h} stroke={C.line} strokeOpacity={0.35} strokeWidth={4} />
			))}
			<rect x={x + w * 0.22} y={y + h * 0.72} width={w * 0.2} height={h * 0.1} rx={18} fill="#0D1119" />
			<rect x={x + w * 0.6} y={y + h * 0.74} width={w * 0.22} height={h * 0.1} rx={18} fill="#0D1119" />
			<rect x={x + w * 0.08} y={y + h * 0.25} width={8} height={h * 0.5} fill="#1A1F2A" />
			<circle cx={x + w * 0.08 + 4} cy={y + h * 0.25} r={12} fill={C.lamp} />
			<Glow id="st-lamp" x={x + w * 0.08} y={y + h * 0.25} r={160} color={C.lamp} strength={0.7} />
		</g>
	</g>
);

const Room: React.FC<{frame: number}> = ({frame}) => {
	const ceilL = along(BACK.left, BACK.top, 0);
	const ceilR = along(BACK.right, BACK.top, 0);
	const floorL = along(BACK.left, BACK.bottom, H);
	const floorR = along(BACK.right, BACK.bottom, H);
	const cols = Array.from({length: 9}, (_, i) => lerp(BACK.left, BACK.right, i / 8));
	const rows = [1160, 1220, 1310, 1440, 1630, 1900];
	// ceiling plane point: u across (0 left .. 1 right), t depth (0 back .. 1 front)
	const ceil = (u: number, t: number): [number, number] => {
		const back: [number, number] = [lerp(BACK.left, BACK.right, u), BACK.top];
		const front: [number, number] = [lerp(ceilL, ceilR, u), 0];
		return [lerp(back[0], front[0], t), lerp(back[1], front[1], t)];
	};
	return (
		<g>
			<polygon points={pts([[BACK.left, BACK.top], [BACK.right, BACK.top], [ceilR, 0], [ceilL, 0]])} fill={C.ceiling} />
			{[0.25, 0.5, 0.75].map((u, i) => (
				<polygon key={i} points={pts([ceil(u - 0.03, 0.05), ceil(u + 0.03, 0.05), ceil(u + 0.04, 0.95), ceil(u - 0.04, 0.95)])} fill={C.tube} />
			))}
			<polygon points={pts([[BACK.left, BACK.bottom], [BACK.right, BACK.bottom], [floorR, H], [floorL, H]])} fill={C.floor} />
			{cols.map((x, i) => (
				<line key={`c${i}`} x1={x} y1={BACK.bottom} x2={along(x, BACK.bottom, H)} y2={H} stroke={C.tile} strokeWidth={3} />
			))}
			{rows.map((y, i) => (
				<line key={`r${i}`} x1={along(BACK.left, BACK.bottom, y)} y1={y} x2={along(BACK.right, BACK.bottom, y)} y2={y} stroke={C.tile} strokeWidth={3} />
			))}
			{/* the glass front at the far end, with its door */}
			<rect x={BACK.left} y={BACK.top} width={BACK.right - BACK.left} height={BACK.bottom - BACK.top} fill={C.wallTrim} />
			<Outside x={BACK.left + 16} y={BACK.top + 60} w={BACK.right - BACK.left - 32} h={BACK.bottom - BACK.top - 60} frame={frame} />
			<rect x={(BACK.left + BACK.right) / 2 - 6} y={BACK.top + 60} width={12} height={BACK.bottom - BACK.top - 60} fill={C.wallTrim} />
			<polygon points={pts([[BACK.left + 60, BACK.top + 80], [BACK.left + 120, BACK.top + 80], [BACK.left + 40, BACK.bottom], [BACK.left + 16, BACK.bottom]])} fill={C.glassHi} opacity={0.12} />
			<polygon points={pts([[BACK.right - 150, BACK.top + 80], [BACK.right - 110, BACK.top + 80], [BACK.right - 190, BACK.bottom], [BACK.right - 230, BACK.bottom]])} fill={C.glassHi} opacity={0.1} />
			{/* the rolled-up steel shutter above the glass */}
			<rect x={BACK.left} y={BACK.top} width={BACK.right - BACK.left} height={60} fill="#7D858E" />
			{[0, 1, 2, 3].map((i) => (
				<line key={i} x1={BACK.left} y1={BACK.top + 12 + i * 13} x2={BACK.right} y2={BACK.top + 12 + i * 13} stroke="#5B636C" strokeWidth={4} />
			))}
			{/* EXIT sign over the glass */}
			<rect x={BACK.left + 20} y={BACK.top - 70} width={120} height={50} rx={6} fill="#0E2A1A" />
			<text x={BACK.left + 80} y={BACK.top - 33} textAnchor="middle" fontFamily={FONT_CAPTION} fontWeight={800} fontSize={34} fill={C.exit}>
				EXIT
			</text>
			<Shelves side={-1} />
			<Shelves side={1} />
		</g>
	);
};

/** The checkout counter in the left foreground, register and all. */
const Counter: React.FC = () => (
	<g>
		<ContactShadow x={230} y={1900} rx={300} ry={40} />
		<polygon points={pts([[-20, 1520], [420, 1520], [470, 1640], [-20, 1640]])} fill={C.counterTop} />
		<polygon points={pts([[-20, 1640], [470, 1640], [470, 1960], [-20, 1960]])} fill={C.counter} />
		<rect x={90} y={1420} width={180} height={110} rx={12} fill="#2B2F38" />
		<rect x={108} y={1436} width={144} height={66} rx={6} fill="#7FD3A8" opacity={0.85} />
	</g>
);

export const StoreInside: React.FC<EnvProps & {dark?: boolean}> = ({frame, dark}) => {
	// the tubes buzz: a small irregular flicker, stronger once the power is failing
	const flicker = 0.97 + 0.03 * Math.sin(frame * 1.3) * Math.sin(frame * 0.7);
	return (
		<g>
			<Room frame={frame} />
			<Counter />
			{dark ? (
				<>
					<Darkness id="st-dark" color={C.night} opacity={0.92} lights={[{x: BACK.left + 80, y: BACK.top - 45, reach: 260}, {x: VP.x, y: 900, reach: 420}]} />
					<Glow id="st-exit" x={BACK.left + 80} y={BACK.top - 45} r={300} color={C.exit} strength={0.75} />
					<Shaft id="st-street" points={[[BACK.left + 80, BACK.bottom], [BACK.right - 80, BACK.bottom], [W + 100, H], [-100, H]]} from={[VP.x, BACK.bottom]} to={[VP.x, H]} color="#9DB8E6" opacity={0.22} blur={30} />
				</>
			) : (
				<>
					<Darkness id="st-lit" color={C.night} opacity={0.18} lights={[{x: VP.x, y: 700, reach: 1100}]} />
					<Glow id="st-tubes" x={VP.x} y={300} r={900} color={C.cool} strength={0.35 * flicker} />
				</>
			)}
		</g>
	);
};
export const StoreDark: React.FC<EnvProps> = (props) => <StoreInside {...props} dark />;

/** The shop alone in a dark car park: the only lit thing for blocks; a red glow over the city. */
export const StoreOutside: React.FC<EnvProps> = ({frame}) => {
	const sx = 170;
	const sw = W - 340;
	const sy = 720;
	const sh = 520;
	return (
		<g>
			<defs>
				<linearGradient id="so-sky" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0" stopColor="#04070F" />
					<stop offset="0.7" stopColor="#1B1220" />
					<stop offset="1" stopColor="#3A1418" />
				</linearGradient>
			</defs>
			<rect width={W} height={sy + sh} fill="url(#so-sky)" />
			<ellipse cx={W * 0.7} cy={sy + sh - 40} rx={700} ry={160} fill={C.city} opacity={0.4 + 0.06 * Math.sin(frame / 8)} style={{filter: 'blur(40px)'}} />
			{/* distant smoke columns */}
			{[0.15, 0.82].map((u, i) => (
				<ellipse key={i} cx={W * u} cy={sy + 80} rx={70} ry={320} fill="#2A2228" opacity={0.6} style={{filter: 'blur(18px)'}} />
			))}
			<rect y={sy + sh} width={W} height={H - sy - sh} fill={C.carpark} />
			{/* the shop: sign band, lit glass, shelves seen through it */}
			<rect x={sx - 30} y={sy - 120} width={sw + 60} height={120} fill="#E9ECE6" />
			<text x={W / 2} y={sy - 42} textAnchor="middle" fontFamily={FONT_CAPTION} fontWeight={800} fontSize={70} fill="#C23A31">
				MINI MART 24
			</text>
			<rect x={sx} y={sy} width={sw} height={sh} fill={C.cool} />
			{[0, 1, 2].map((i) => (
				<rect key={i} x={sx + 40 + i * (sw / 3)} y={sy + 120} width={sw / 3 - 80} height={sh - 160} fill={C.shelf} />
			))}
			{Array.from({length: 18}, (_, k) => (
				<rect key={k} x={sx + 60 + (k % 6) * ((sw - 120) / 6)} y={sy + 150 + Math.floor(k / 6) * 110} width={(sw - 120) / 6 - 20} height={60} fill={C.products[k % C.products.length]} />
			))}
			<rect x={W / 2 - 8} y={sy} width={16} height={sh} fill={C.wallTrim} />
			<rect x={sx} y={sy - 4} width={sw} height={30} fill="#7D858E" />
			{/* car park: bays in perspective, two parked cars, a lamp */}
			{[-2, -1, 0, 1, 2, 3].map((i) => (
				<line key={i} x1={W / 2 + i * 220} y1={sy + sh + 20} x2={W / 2 + i * 520} y2={H} stroke={C.line} strokeOpacity={0.45} strokeWidth={6} />
			))}
			<rect x={40} y={sy + sh + 120} width={300} height={130} rx={34} fill="#0C1018" />
			<rect x={760} y={sy + sh + 160} width={320} height={140} rx={36} fill="#0C1018" />
			<Darkness id="so" color={C.night} opacity={0.82} lights={[{x: W / 2, y: sy + sh * 0.6, reach: 760}]} />
			{/* the shop's light spilling onto the car park */}
			<Shaft id="so-spill" points={[[sx, sy + sh], [sx + sw, sy + sh], [W + 200, H], [-200, H]]} from={[W / 2, sy + sh]} to={[W / 2, H]} color={C.cool} opacity={0.3} blur={30} />
			<Glow id="so-glass" x={W / 2} y={sy + sh / 2} r={700} color={C.cool} strength={0.35} />
		</g>
	);
};
