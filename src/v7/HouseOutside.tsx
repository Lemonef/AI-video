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
