import React from 'react';
import {FONT_CAPTION} from '../lib/fonts';
import {H, W} from '../lib/tokens';
import type {EnvProps} from '../v2/Forest';
import {ContactShadow, Darkness, Glow} from './light';

/**
 * Insert shots: one object filling the frame (a thermometer, a flashlight, the map). The
 * references cut to these every few beats; they change the picture and carry the facts
 * (39.8°, battery, distance) without a word of narration.
 */
const C = {
	wood: '#7A5236',
	woodDark: '#4E3322',
	grain: '#5E3E28',
	night: '#04070F',
	warm: '#FFB866',
	glass: '#E6ECF3',
	red: '#D64545',
	lcd: '#B8D8A8',
	lcdInk: '#1E2A1A',
	skin: '#C9A383',
	torch: '#2B2F38',
	torchRim: '#5A6272',
	beam: '#FFC27A',
	canopy: ['#16302A', '#1C3A32', '#22453A', '#12271F'],
	path: '#C9A777',
	house: '#E8C48A',
	clinic: '#F2F5F8',
	marker: '#FFD23F',
};

const rnd = (i: number, salt: number) => {
	const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
	return x - Math.floor(x);
};

/** Close-up: a digital thermometer on the bedside table, reading high. */
export const InsertThermometer: React.FC<EnvProps> = ({frame}) => {
	const flicker = 0.95 + 0.05 * Math.sin(frame / 7);
	return (
		<g>
			<rect width={W} height={H} fill={C.wood} />
			{Array.from({length: 9}, (_, i) => (
				<path key={i} d={`M0,${200 + i * 210} Q${W / 2},${170 + i * 210 + rnd(i, 1) * 60} ${W},${210 + i * 210}`} stroke={C.grain} strokeWidth={10} fill="none" opacity={0.6} />
			))}
			<ContactShadow x={560} y={1040} rx={420} ry={60} opacity={0.6} />
			<g transform="rotate(-18 540 960)">
				<rect x={150} y={900} width={780} height={130} rx={65} fill={C.glass} />
				<rect x={150} y={900} width={170} height={130} rx={65} fill={C.red} />
				<rect x={430} y={922} width={300} height={86} rx={14} fill={C.lcd} />
				<text x={580} y={992} textAnchor="middle" fontFamily={FONT_CAPTION} fontWeight={800} fontSize={74} fill={C.lcdInk}>
					39.8°
				</text>
				<circle cx={820} cy={965} r={22} fill="#C7CED8" />
			</g>
			<Darkness id="thermo" color={C.night} opacity={0.8} lights={[{x: 560, y: 900, reach: 900 * flicker}]} />
			<Glow id="thermo-bulb" x={760} y={120} r={700} color={C.warm} strength={0.8 * flicker} />
		</g>
	);
};

/** Close-up: the flashlight in his hand, its battery LEDs dying (one red, blinking). */
export const InsertTorch: React.FC<EnvProps> = ({frame}) => {
	const blink = Math.floor(frame / 9) % 2 === 0;
	const sputter = 0.75 + 0.25 * Math.abs(Math.sin(frame / 3.1) * Math.sin(frame / 5.3));
	return (
		<g>
			<rect width={W} height={H} fill="#0A1222" />
			{/* beam reaching into the dark */}
			<polygon points={`700,700 ${W + 300},200 ${W + 300},1500`} fill={C.beam} opacity={0.22 * sputter} style={{filter: 'blur(30px)'}} />
			<g transform="rotate(-24 540 960)">
				<rect x={160} y={880} width={560} height={170} rx={30} fill={C.torch} />
				<rect x={660} y={850} width={150} height={230} rx={26} fill={C.torchRim} />
				<ellipse cx={812} cy={965} rx={28} ry={110} fill="#FFE7B8" opacity={sputter} />
				{/* battery LEDs: three slots, one left */}
				{[0, 1, 2].map((i) => (
					<rect key={i} x={300 + i * 70} y={905} width={50} height={22} rx={6} fill={i === 0 ? (blink ? C.red : '#5A1E1E') : '#1A1D24'} />
				))}
				{/* hand */}
				<path d="M240,1040 Q260,1150 380,1170 Q520,1180 560,1060 Q540,1010 480,1000 Q400,1000 380,1030 Q330,990 240,1040 Z" fill={C.skin} />
			</g>
			<Glow id="torch-head" x={760} y={760} r={520} color={C.beam} strength={0.7 * sputter} />
		</g>
	);
};

/** Top-down map of the shortcut: forest canopy, the path from home to the clinic, and the marker. */
export const ForestMap: React.FC<EnvProps> = ({frame, progress = 0}) => {
	// the route as a smooth S-curve, home at the bottom, clinic at the top
	const route = 'M540,1640 C300,1450 820,1250 560,1020 C320,820 780,620 540,380';
	const pulse = 1 + 0.25 * Math.abs(Math.sin(frame / 8));
	const at = (t: number) => {
		// sample the two cubic segments
		const seg = t < 0.5 ? 0 : 1;
		const u = seg === 0 ? t * 2 : (t - 0.5) * 2;
		const P = seg === 0 ? [[540, 1640], [300, 1450], [820, 1250], [560, 1020]] : [[560, 1020], [320, 820], [780, 620], [540, 380]];
		const b = (k: number) => (1 - u) ** 3 * P[0][k] + 3 * (1 - u) ** 2 * u * P[1][k] + 3 * (1 - u) * u ** 2 * P[2][k] + u ** 3 * P[3][k];
		return {x: b(0), y: b(1)};
	};
	const m = at(Math.min(1, Math.max(0, progress)));
	return (
		<g>
			<rect width={W} height={H} fill="#0F2420" />
			{Array.from({length: 260}, (_, i) => (
				<circle key={i} cx={rnd(i, 21) * W} cy={rnd(i, 22) * H} r={40 + rnd(i, 23) * 70} fill={C.canopy[i % C.canopy.length]} />
			))}
			<path d={route} fill="none" stroke="#0B1A16" strokeWidth={70} strokeLinecap="round" />
			<path d={route} fill="none" stroke={C.path} strokeWidth={30} strokeLinecap="round" strokeDasharray="2 46" opacity={0.9} />
			{/* home (bottom) and the clinic with its cross (top) */}
			<rect x={490} y={1630} width={100} height={80} rx={8} fill={C.house} />
			<polygon points="480,1636 540,1586 600,1636" fill="#9C5A3C" />
			<rect x={480} y={290} width={120} height={90} rx={10} fill={C.clinic} />
			<rect x={530} y={305} width={20} height={60} fill={C.red} />
			<rect x={510} y={325} width={60} height={20} fill={C.red} />
			<circle cx={m.x} cy={m.y} r={34 * pulse} fill={C.marker} opacity={0.3} />
			<circle cx={m.x} cy={m.y} r={22} fill={C.marker} stroke="#000" strokeWidth={4} />
			<text x={m.x + 44} y={m.y + 14} fontFamily={FONT_CAPTION} fontWeight={800} fontSize={44} fill="#fff" stroke="#000" strokeWidth={6} paintOrder="stroke">
				จ๊าบ
			</text>
			<Darkness id="map" color={C.night} opacity={0.45} lights={[{x: m.x, y: m.y, reach: 700}]} />
		</g>
	);
};
