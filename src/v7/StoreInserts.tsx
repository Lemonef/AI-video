import React from 'react';
import {FONT_CAPTION} from '../lib/fonts';
import {H, W} from '../lib/tokens';
import type {EnvProps} from '../v2/Forest';
import {Darkness, Glow} from './light';

/**
 * Insert shots for the store story. Each carries one fact without narration: the news, how far
 * it has spread, the store's weak point and only defence, the shutter coming down round by round.
 * `progress` (0..1 over the scene) drives the moving ones.
 */
const C = {
	night: '#04070F',
	red: '#D83A33',
	redDeep: '#7A1A1A',
	ink: '#0B0E18',
	paper: '#F2F4F8',
	screen: '#1A2A44',
	steel: '#8C949D',
	steelDark: '#5E666F',
	land: '#18212E',
	river: '#2C5D8F',
	road: '#2A3445',
	marker: '#FFD23F',
	floor: '#1C2433',
	aisle: '#3A4558',
	glass: '#7FD3FF',
};

const label = (x: number, y: number, text: string, color: string, size = 40, anchor: 'start' | 'middle' = 'middle') => (
	<text x={x} y={y} textAnchor={anchor} fontFamily={FONT_CAPTION} fontWeight={800} fontSize={size} fill={color} stroke={C.ink} strokeWidth={8} paintOrder="stroke">
		{text}
	</text>
);

/** The store TV cutting to breaking news. */
export const InsertTV: React.FC<EnvProps> = ({frame}) => {
	const pulse = 0.85 + 0.15 * Math.sin(frame / 4);
	const ticker = (frame * 6) % 1400;
	return (
		<g>
			<rect width={W} height={H} fill="#0A0D14" />
			<rect x={60} y={560} width={960} height={620} rx={26} fill="#11141B" />
			<rect x={90} y={590} width={900} height={560} rx={8} fill={C.screen} />
			{/* the studio: a map on the wall behind the anchor, red patches on it */}
			<rect x={540} y={640} width={420} height={300} rx={8} fill="#22344F" />
			{[0, 1, 2].map((i) => (
				<circle key={i} cx={640 + i * 110} cy={760 + (i % 2) * 60} r={36 + i * 6} fill={C.red} opacity={0.7 * pulse} />
			))}
			<circle cx={330} cy={760} r={78} fill="#C9A383" />
			<path d="M180,1150 Q330,880 480,1150 Z" fill="#2E3B55" />
			<rect x={90} y={960} width={900} height={100} fill={C.red} opacity={pulse} />
			{label(540, 1030, 'ข่าวด่วน · พบคนกัดคน หลายเขตทั่วกรุงเทพ', C.paper, 46)}
			<rect x={90} y={1060} width={900} height={60} fill={C.ink} />
			<g clipPath="inset(0)">
				<text x={990 - ticker} y={1102} fontFamily={FONT_CAPTION} fontWeight={600} fontSize={34} fill="#E8E8E8">
					งดออกจากบ้าน · ปิดประตูหน้าต่าง · อย่าเข้าใกล้ผู้ที่มีอาการ
				</text>
			</g>
			<Glow id="tv" x={540} y={870} r={760} color="#6F9BE0" strength={0.45} />
			<Darkness id="tv-room" color={C.night} opacity={0.6} lights={[{x: 540, y: 870, reach: 820}]} />
		</g>
	);
};

/** The outbreak spreading across the city: red patches grow with `progress`. */
export const CityMap: React.FC<EnvProps> = ({frame, progress = 0}) => {
	const blobs = [
		[300, 700, 1],
		[720, 560, 0.85],
		[620, 1150, 0.7],
		[260, 1300, 0.55],
		[860, 1000, 0.45],
		[420, 950, 0.35],
	] as const;
	const pulse = 1 + 0.05 * Math.sin(frame / 6);
	return (
		<g>
			<rect width={W} height={H} fill={C.land} />
			{Array.from({length: 12}, (_, i) => (
				<line key={`h${i}`} x1={0} y1={200 + i * 140} x2={W} y2={170 + i * 140} stroke={C.road} strokeWidth={6} />
			))}
			{Array.from({length: 8}, (_, i) => (
				<line key={`v${i}`} x1={80 + i * 140} y1={0} x2={110 + i * 140} y2={H} stroke={C.road} strokeWidth={6} />
			))}
			<path d="M420,0 C620,300 260,620 520,900 C760,1160 380,1420 600,1920" fill="none" stroke={C.river} strokeWidth={70} />
			{blobs.map(([x, y, start], i) => {
				const grow = Math.max(0, Math.min(1, (progress - (1 - start)) / 0.35 + 0.15));
				return <circle key={i} cx={x} cy={y} r={240 * grow * pulse} fill={C.red} opacity={0.55} style={{filter: 'blur(6px)'}} />;
			})}
			<circle cx={540} cy={1500} r={20} fill={C.marker} stroke={C.ink} strokeWidth={5} />
			{label(590, 1514, 'ร้านของจ๊าบ', C.paper, 40, 'start')}
			<Darkness id="city" color={C.night} opacity={0.35} lights={[{x: 540, y: 960, reach: 900}]} />
		</g>
	);
};

/** Top-down plan of the store: the weak point (glass) and the only defence (the shutter). */
export const StoreMap: React.FC<EnvProps> = ({frame}) => {
	const blink = Math.floor(frame / 10) % 2 === 0;
	return (
		<g>
			<rect width={W} height={H} fill="#0E141F" />
			<rect x={140} y={460} width={800} height={1000} rx={10} fill={C.floor} stroke="#55617A" strokeWidth={8} />
			{[0, 1, 2].map((i) => (
				<rect key={i} x={240 + i * 230} y={640} width={120} height={520} rx={8} fill={C.aisle} />
			))}
			<rect x={170} y={1240} width={260} height={120} rx={8} fill="#3E6B8A" />
			{label(300, 1316, 'เคาน์เตอร์', C.paper, 34)}
			<rect x={700} y={480} width={220} height={140} rx={6} fill="#26324A" />
			{label(810, 562, 'ห้องเก็บของ', C.paper, 32)}
			<rect x={890} y={640} width={44} height={110} fill="#8C5A3C" />
			{label(830, 800, 'ประตูหลัง', C.paper, 32)}
			{/* the glass front: the weak point */}
			<rect x={140} y={1444} width={800} height={22} fill={C.glass} opacity={blink ? 1 : 0.5} />
			{label(540, 1540, 'กระจกหน้าร้าน = จุดอ่อน', C.glass, 44)}
			{/* the shutter line: the only defence */}
			<line x1={140} y1={1480} x2={940} y2={1480} stroke={C.red} strokeWidth={10} strokeDasharray="26 18" />
			{label(540, 1620, 'ประตูเหล็กม้วน = ทางรอดเดียว', C.red, 44)}
			<circle cx={300} cy={1200} r={20} fill={C.marker} stroke={C.ink} strokeWidth={5} />
			{label(350, 1212, 'จ๊าบ', C.paper, 36, 'start')}
		</g>
	);
};

/** Cranking the shutter down by hand: it lowers with `progress`; a counter keeps the score. */
export const InsertShutter: React.FC<EnvProps> = ({frame, progress = 0}) => {
	const ROUNDS = 40;
	const round = Math.min(ROUNDS, Math.floor(progress * ROUNDS));
	const shutterY = 300 + progress * 1050; // the shutter's bottom edge
	const crank = frame * 14;
	return (
		<g>
			{/* outside, beyond the opening: the car park and shapes coming closer */}
			<rect width={W} height={H} fill="#10151F" />
			<rect y={1100} width={W} height={H - 1100} fill="#151B26" />
			{[200, 520, 820].map((x, i) => {
				const near = 0.6 + progress * 0.9 + i * 0.05;
				return (
					<g key={i} transform={`translate(${x} ${1300 + near * 120}) scale(${near})`} opacity={0.85}>
						<ellipse cx={0} cy={-260} rx={46} ry={54} fill="#2A3328" />
						<rect x={-44} y={-210} width={88} height={200} rx={30} fill="#232A22" />
						<rect x={-80} y={-200} width={36} height={130} rx={16} fill="#232A22" transform="rotate(-60 -62 -200)" />
						<rect x={44} y={-200} width={36} height={130} rx={16} fill="#232A22" transform="rotate(60 62 -200)" />
					</g>
				);
			})}
			{/* the shutter */}
			<rect x={0} y={0} width={W} height={shutterY} fill={C.steel} />
			{Array.from({length: Math.ceil(shutterY / 46)}, (_, i) => (
				<line key={i} x1={0} y1={shutterY - i * 46} x2={W} y2={shutterY - i * 46} stroke={C.steelDark} strokeWidth={10} />
			))}
			<rect x={0} y={shutterY - 24} width={W} height={24} fill="#4A5158" />
			{/* the crank, turning */}
			<g transform={`translate(900 ${Math.min(shutterY + 160, 1700)})`}>
				<circle r={60} fill="#3A4048" />
				<g transform={`rotate(${crank})`}>
					<rect x={-8} y={-110} width={16} height={110} fill="#C9CED6" />
					<circle cy={-110} r={18} fill="#E2574C" />
				</g>
			</g>
			<rect x={300} y={1720} width={480} height={110} rx={20} fill={C.ink} opacity={0.85} />
			{label(540, 1795, `รอบที่ ${round}/${ROUNDS}`, round >= ROUNDS ? '#6CBF6A' : C.paper, 64)}
			<Darkness id="shutter" color={C.night} opacity={0.55} lights={[{x: 540, y: 700, reach: 900}]} />
		</g>
	);
};
