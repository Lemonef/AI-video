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

const CHASE_JAAB_AT = 0.86; // Jaab's place on the route when the double turns back
const CHASE_RUN = 0.7; // how far back toward home the double gets over the scene

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
export const ForestMap: React.FC<EnvProps & {chase?: boolean}> = ({frame, progress = 0, chase}) => {
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
	// chase: Jaab holds near the clinic while the double ('???') walks back toward home
	const m = at(chase ? CHASE_JAAB_AT : Math.min(1, Math.max(0, progress)));
	const d = at(Math.max(0, CHASE_JAAB_AT - CHASE_RUN * Math.min(1, Math.max(0, progress))));
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
			{chase ? (
				<g>
					<circle cx={d.x} cy={d.y} r={34 * pulse} fill={C.red} opacity={0.3} />
					<circle cx={d.x} cy={d.y} r={22} fill={C.red} stroke="#000" strokeWidth={4} />
					<text x={d.x - 44} y={d.y + 14} textAnchor="end" fontFamily={FONT_CAPTION} fontWeight={800} fontSize={44} fill="#fff" stroke="#000" strokeWidth={6} paintOrder="stroke">
						???
					</text>
				</g>
			) : null}
			<Darkness id="map" color={C.night} opacity={0.45} lights={[{x: m.x, y: m.y, reach: 700}]} />
		</g>
	);
};

/** The double heading home while Jaab stands near the clinic. */
export const ForestMapChase: React.FC<EnvProps> = (props) => <ForestMap {...props} chase />;

/** Close-up of the mud: his shoe prints, and bare footprints beside them that stop right behind him. */
export const InsertFootprints: React.FC<EnvProps> = ({frame, progress = 0}) => {
	const STEPS = 7;
	const shown = Math.ceil(progress * STEPS); // the bare prints appear one by one toward him
	const flicker = 0.92 + 0.08 * Math.sin(frame / 5);
	const shoe = (x: number, y: number, k: number) => (
		<g key={`s${k}`} transform={`translate(${x} ${y}) rotate(${k % 2 ? 6 : -6})`}>
			<ellipse rx={30} ry={62} fill="#2C2018" />
			{[0, 1, 2, 3].map((i) => (
				<line key={i} x1={-20} y1={-40 + i * 24} x2={20} y2={-40 + i * 24} stroke="#3E2E22" strokeWidth={6} />
			))}
		</g>
	);
	const bare = (x: number, y: number, k: number) => (
		<g key={`b${k}`} transform={`translate(${x} ${y}) rotate(${k % 2 ? 4 : -4})`}>
			<ellipse cy={10} rx={24} ry={48} fill="#22180F" />
			{[-18, -8, 2, 12, 20].map((tx, i) => (
				<circle key={i} cx={tx} cy={-48 + Math.abs(i - 1.5) * 4} r={i === 0 ? 9 : 7} fill="#22180F" />
			))}
		</g>
	);
	return (
		<g>
			<rect width={W} height={H} fill="#5A4433" />
			{Array.from({length: 40}, (_, i) => (
				<ellipse key={i} cx={(i * 263) % W} cy={(i * 457) % H} rx={60 + (i % 5) * 20} ry={18} fill="#4C392A" opacity={0.6} />
			))}
			{Array.from({length: STEPS}, (_, k) => shoe(k % 2 ? 470 : 380, 1700 - k * 220, k))}
			{Array.from({length: STEPS}, (_, k) => (STEPS - 1 - k < shown ? bare(k % 2 ? 690 : 610, 1640 - k * 220, k) : null))}
			<Darkness id="fprint" color={C.night} opacity={0.82} lights={[{x: 540, y: 1300, reach: 760 * flicker}]} />
		</g>
	);
};

/** Close-up of his phone ringing: grandma calling, 1% battery. */
export const InsertPhone: React.FC<EnvProps> = ({frame}) => {
	const buzz = Math.floor(frame / 3) % 4 < 2 ? Math.sin(frame * 2.1) * 6 : 0; // vibrates in bursts
	return (
		<g>
			<rect width={W} height={H} fill="#070B14" />
			<g transform={`translate(${540 + buzz} 980) rotate(-6)`}>
				<rect x={-250} y={-500} width={500} height={1000} rx={60} fill="#15181F" />
				<rect x={-226} y={-470} width={452} height={940} rx={44} fill="#0E2A22" />
				<text x={180} y={-420} textAnchor="end" fontFamily={FONT_CAPTION} fontWeight={800} fontSize={34} fill={C.red}>
					1%
				</text>
				<circle cy={-200} r={90} fill="#3A4A5A" />
				<text y={-170} textAnchor="middle" fontFamily={FONT_CAPTION} fontWeight={800} fontSize={88} fill="#E8EEF5">
					ย
				</text>
				<text y={-40} textAnchor="middle" fontFamily={FONT_CAPTION} fontWeight={800} fontSize={76} fill="#FFFFFF">
					ยาย
				</text>
				<text y={20} textAnchor="middle" fontFamily={FONT_CAPTION} fontWeight={600} fontSize={40} fill="#A9C3B8">
					กำลังโทรเข้า…
				</text>
				<circle cx={-120} cy={300} r={60} fill={C.red} />
				<circle cx={120} cy={300} r={60} fill="#3DBE6A" />
				<path d="M-210,520 Q-120,420 0,460 Q120,420 210,520 L210,620 L-210,620 Z" fill={C.skin} />
			</g>
			<Glow id="phone" x={540} y={900} r={700} color="#7FE0B8" strength={0.35} />
		</g>
	);
};
