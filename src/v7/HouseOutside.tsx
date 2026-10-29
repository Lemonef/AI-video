import React from 'react';
import {H, W} from '../lib/tokens';
import type {EnvProps} from '../v2/Forest';
import {ContactShadow, Darkness, Glow, Shaft} from './light';

/**
 * Part 3's stage: the front of Jaab's wooden house at night. The porch bulb is the one light,
 * and it is what tells the real Jaab from the copy - the real one throws a shadow under it.
 * Inserts close on the porch boards: two pairs of feet, then mum's.
 */
const C = {
	sky: '#060A16',
	trees: '#0C1512',
	wood: '#6E5844',
	woodDark: '#4B3B2E',
	plank: '#3C2D22',
	roof: '#3A2A22',
	door: '#5A4130',
	window: '#2F5F93',
	bulb: '#FFE3A8',
	warm: '#FFB866',
	night: '#04070F',
	ground: '#1A1E18',
	shoe: '#E9E4DA',
	pants: '#2B3142',
	mumFoot: '#C9A383',
	sarong: '#6B3E5E',
};

const PORCH_Y = 1180; // the porch floor line, where the door and the visitors stand
const BULB = {x: 720, y: 640};

export const HouseOutside: React.FC<EnvProps> = ({frame}) => {
	const flicker = 0.94 + 0.06 * Math.sin(frame / 6) * Math.sin(frame / 11);
	return (
		<g>
			<rect width={W} height={H} fill={C.sky} />
			{/* the forest behind the house */}
			{Array.from({length: 14}, (_, i) => (
				<circle key={i} cx={(i * 97) % (W + 100)} cy={420 + (i % 4) * 30} r={130 + (i % 3) * 30} fill={C.trees} />
			))}
			{/* the house front: roof, wall, door, a window, the porch on posts */}
			<polygon points={`80,520 ${W - 80},520 ${W - 10},640 10,640`} fill={C.roof} />
			<rect x={120} y={640} width={W - 240} height={PORCH_Y - 640} fill={C.wood} />
			{Array.from({length: 9}, (_, i) => (
				<line key={i} x1={150 + i * 100} y1={640} x2={150 + i * 100} y2={PORCH_Y} stroke={C.plank} strokeWidth={5} />
			))}
			<rect x={440} y={760} width={200} height={PORCH_Y - 760} rx={6} fill={C.door} />
			<circle cx={610} cy={980} r={9} fill="#C9A86A" />
			{/* the window glows warm: mum's room, the lamp still on */}
			<rect x={200} y={760} width={170} height={150} rx={6} fill={C.warm} opacity={0.85} />
			<path d="M200,760 Q240,840 220,910 L200,910 Z" fill="#8A5A3C" opacity={0.8} />
			<path d="M370,760 Q330,840 350,910 L370,910 Z" fill="#8A5A3C" opacity={0.8} />
			<rect x={200} y={760} width={170} height={150} rx={6} fill="none" stroke={C.plank} strokeWidth={10} />
			{/* laundry under the eave */}
			<path d="M140,690 Q420,730 700,690" stroke="#2A2018" strokeWidth={3} fill="none" />
			{[220, 330, 470].map((x, i) => (
				<rect key={i} x={x} y={704 + (i % 2) * 6} width={70 + i * 10} height={90 - i * 10} rx={6} fill={['#7E5A6E', '#5D7A94', '#B08A57'][i]} />
			))}
			{/* the porch floor, sandals by the door, potted plants, steps down to the yard */}
			<rect x={60} y={PORCH_Y} width={W - 120} height={40} fill={C.woodDark} />
			{[0, 1].map((i) => (
				<g key={i}>
					<ellipse cx={680 + i * 70} cy={PORCH_Y - 6} rx={26} ry={9} fill="#3E6B8A" />
					<ellipse cx={706 + i * 70} cy={PORCH_Y - 4} rx={26} ry={9} fill="#3E6B8A" />
				</g>
			))}
			{[150, 860].map((x, i) => (
				<g key={x}>
					<path d={`M${x},${PORCH_Y} l20,-70 h60 l20,70 Z`} fill="#8C4B33" />
					{[-30, 0, 30].map((a, k) => (
						<path key={k} d={`M${x + 50},${PORCH_Y - 70} q${a},-80 ${a * 1.6 + (i ? -10 : 10)},-130`} stroke="#1F3A2A" strokeWidth={22} strokeLinecap="round" fill="none" />
					))}
				</g>
			))}
			{[0, 1, 2].map((i) => (
				<rect key={i} x={420 - i * 20} y={PORCH_Y + 40 + i * 70} width={240 + i * 40} height={30} fill={C.woodDark} />
			))}
			<rect x={0} y={PORCH_Y + 240} width={W} height={H - PORCH_Y - 240} fill={C.ground} />
			{[120, W - 140].map((x) => (
				<rect key={x} x={x} y={PORCH_Y + 40} width={30} height={200} fill={C.plank} />
			))}
			{/* a water jar by the steps */}
			<ellipse cx={810} cy={PORCH_Y + 330} rx={110} ry={120} fill="#4A2E22" />
			<ellipse cx={810} cy={PORCH_Y + 220} rx={80} ry={18} fill="#2A1A14" />
			{/* the spirit house in the yard, its small candle the only other warm light */}
			<rect x={136} y={PORCH_Y + 220} width={22} height={300} fill="#4A4436" />
			<rect x={80} y={PORCH_Y + 120} width={134} height={110} rx={6} fill="#6E5C3A" />
			<polygon points={`66,${PORCH_Y + 124} 147,${PORCH_Y + 40} 228,${PORCH_Y + 124}`} fill="#6E2A22" />
			<polygon points={`96,${PORCH_Y + 60} 147,${PORCH_Y + 6} 198,${PORCH_Y + 60}`} fill="#7A5E2A" />
			<rect x={136} y={PORCH_Y + 168} width={10} height={30} fill="#F2EFE6" />
			<circle cx={141} cy={PORCH_Y + 162} r={6} fill="#FFD27A" />
			{/* the porch bulb */}
			<line x1={BULB.x} y1={640} x2={BULB.x} y2={BULB.y - 20} stroke="#1A140F" strokeWidth={4} />
			<circle cx={BULB.x} cy={BULB.y} r={16} fill={C.bulb} />
			{/* the moon, cold, top left: warm porch against cold night */}
			<circle cx={180} cy={240} r={52} fill="#DCE6F5" />
			<Darkness
				id="ho"
				color={C.night}
				opacity={0.86}
				lights={[
					{x: BULB.x, y: BULB.y + 300, reach: 640 * flicker},
					{x: 285, y: 835, reach: 260},
					{x: 141, y: PORCH_Y + 162, reach: 110},
					{x: 180, y: 240, reach: 260},
				]}
			/>
			<Shaft id="ho-pool" points={[[BULB.x - 30, BULB.y], [BULB.x + 30, BULB.y], [BULB.x + 380, PORCH_Y + 40], [BULB.x - 380, PORCH_Y + 40]]} from={[BULB.x, BULB.y]} to={[BULB.x, PORCH_Y]} color={C.warm} opacity={0.25 * flicker} blur={20} />
			<Glow id="ho-bulb" x={BULB.x} y={BULB.y} r={420} color={C.warm} strength={flicker} />
			<Glow id="ho-window" x={285} y={835} r={260} color={C.warm} strength={0.6} />
			<Glow id="ho-candle" x={141} y={PORCH_Y + 162} r={90} color="#FFD27A" strength={0.45 * flicker} />
			<Glow id="ho-moon" x={180} y={240} r={300} color="#8FB0E8" strength={0.5} />
		</g>
	);
};

/** Feet on the porch boards under the bulb: the real Jaab's throw a shadow; the copy's do not. */
const Boards: React.FC<{frame: number}> = ({frame}) => {
	const flicker = 0.94 + 0.06 * Math.sin(frame / 6);
	return (
		<g>
			<rect width={W} height={H} fill={C.wood} />
			{Array.from({length: 10}, (_, i) => (
				<line key={i} x1={0} y1={180 + i * 180} x2={W} y2={170 + i * 180} stroke={C.plank} strokeWidth={8} />
			))}
			<Darkness id="boards" color={C.night} opacity={0.7} lights={[{x: 540, y: 600, reach: 1100 * flicker}]} />
		</g>
	);
};

const Feet: React.FC<{x: number; y: number; shadow: boolean; mum?: boolean}> = ({x, y, shadow, mum}) => (
	<g>
		{/* the bulb is up and to the left of the shot: shadows fall down and right */}
		{shadow ? <ContactShadow x={x + 110} y={y - 24} rx={170} ry={40} opacity={0.8} /> : null}
		{mum ? (
			<g>
				<rect x={x - 90} y={y - 420} width={180} height={360} rx={30} fill={C.sarong} />
				<ellipse cx={x - 40} cy={y - 40} rx={34} ry={60} fill={C.mumFoot} />
				<ellipse cx={x + 40} cy={y - 40} rx={34} ry={60} fill={C.mumFoot} />
			</g>
		) : (
			<g>
				<rect x={x - 70} y={y - 420} width={56} height={380} rx={20} fill={C.pants} />
				<rect x={x + 14} y={y - 420} width={56} height={380} rx={20} fill={C.pants} />
				<ellipse cx={x - 44} cy={y - 30} rx={50} ry={30} fill={C.shoe} />
				<ellipse cx={x + 44} cy={y - 30} rx={50} ry={30} fill={C.shoe} />
			</g>
		)}
	</g>
);

/** Two pairs of Jaab's feet side by side: only one throws a shadow. */
export const InsertFeetTwo: React.FC<EnvProps> = ({frame}) => (
	<g>
		<Boards frame={frame} />
		<Feet x={330} y={1300} shadow />
		<Feet x={750} y={1300} shadow={false} />
	</g>
);

/** The final twist: Jaab's feet throw a shadow; mum's, beside them, do not. */
export const InsertFeetMum: React.FC<EnvProps> = ({frame}) => (
	<g>
		<Boards frame={frame} />
		<Feet x={360} y={1300} shadow />
		<Feet x={740} y={1300} shadow={false} mum />
	</g>
);

/** The opening image: mum's hand has reached the old brass door bolt. */
export const InsertDoorLock: React.FC<EnvProps> = ({frame}) => {
	const tremble = Math.sin(frame * 0.7) * 3;
	return (
		<g>
			<rect width={W} height={H} fill={C.woodDark} />
			{Array.from({length: 9}, (_, i) => <line key={i} x1={120 + i * 115} y1={0} x2={120 + i * 115} y2={H} stroke={C.plank} strokeWidth={8} />)}
			<rect x={245} y={760} width={590} height={210} rx={24} fill="#241A15" opacity={0.75} />
			<rect x={300} y={820} width={430} height={78} rx={26} fill="#B98A43" />
			<rect x={680} y={780} width={90} height={160} rx={18} fill="#80602E" />
			<g transform={`translate(${tremble} 0)`}>
				<path d="M160,1260 C260,1080 370,920 535,870 C610,848 650,920 606,970 C550,1034 486,1042 420,1110 C358,1174 336,1300 280,1390 Z" fill={C.mumFoot} />
				<path d="M510,890 C548,812 590,770 628,786 C674,806 654,874 610,930 Z" fill={C.mumFoot} />
			</g>
			<Darkness id="lock" color={C.night} opacity={0.74} lights={[{x: 620, y: 860, reach: 760}]} />
			<Glow id="lock-warm" x={650} y={780} r={650} color={C.warm} strength={0.65} />
		</g>
	);
};

/** Uncanny facial insert: two matching eyes blink a fraction apart. */
export const InsertDoubleEyes: React.FC<EnvProps> = ({frame}) => {
	const leftClosed = frame % 70 > 55 && frame % 70 < 62;
	const rightClosed = (frame + 11) % 70 > 55 && (frame + 11) % 70 < 62;
	const eye = (x: number, closed: boolean) => (
		<g transform={`translate(${x} 950)`}>
			<ellipse rx={210} ry={closed ? 10 : 105} fill="#F4EEE3" />
			{closed ? null : <><circle r={58} fill="#251B18" /><circle cx={18} cy={-20} r={13} fill="#fff" /></>}
		</g>
	);
	return <g><rect width={W} height={H} fill="#211815" /><rect y={560} width={W} height={760} fill="#C9A383" />{eye(290, leftClosed)}{eye(790, rightClosed)}<Darkness id="eyes" color={C.night} opacity={0.58} lights={[{x: 290, y: 950, reach: 420}, {x: 790, y: 950, reach: 420}]} /></g>;
};

/** The deadline made visible: the porch bulb sputters toward darkness. */
export const InsertDyingBulb: React.FC<EnvProps> = ({frame}) => {
	const on = Math.floor(frame / 5) % 5 !== 2 && Math.floor(frame / 7) % 6 !== 4;
	return <g><rect width={W} height={H} fill={C.night} /><line x1={540} y1={0} x2={540} y2={680} stroke="#201711" strokeWidth={18} /><circle cx={540} cy={800} r={115} fill={on ? C.bulb : "#4C463C"} /><Glow id="dying" x={540} y={800} r={on ? 650 : 180} color={C.warm} strength={on ? 0.9 : 0.12} /><path d="M430,800 Q540,660 650,800" fill="none" stroke="#7A6848" strokeWidth={12} /></g>;
};

/** Cut-around hug: arms and a hand grip Jaab's back; no stiff standing rigs. */
export const InsertHug: React.FC<EnvProps> = ({frame}) => {
	const squeeze = 8 * Math.sin(frame / 12);
	return (
		<g>
			<rect width={W} height={H} fill="#3B2A22" />
			<Glow id="hug-lamp" x={840} y={360} r={900} color={C.warm} strength={0.65} />
			<path d="M150,1920 Q120,1120 360,650 Q540,480 735,690 Q930,1100 910,1920 Z" fill="#2B3142" />
			<path d={`M90,1320 Q300,1030 610,1120 Q760,1160 ${850 + squeeze},1330 Q850,1420 760,1420 Q610,1300 430,1350 Q260,1410 90,1530 Z`} fill={C.mumFoot} />
			<path d="M710,1050 Q830,970 920,1040 Q980,1110 900,1180 L770,1240 Q680,1160 710,1050 Z" fill={C.mumFoot} />
			{[0,1,2,3].map((i) => <path key={i} d={`M${760 + i * 34},1070 Q${790 + i * 28},990 ${820 + i * 30},1020`} stroke="#B78E72" strokeWidth={26} strokeLinecap="round" />)}
			<Darkness id="hug" color={C.night} opacity={0.48} lights={[{x: 820, y: 720, reach: 1050}]} />
		</g>
	);
};
