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
			<rect x={200} y={760} width={170} height={150} rx={6} fill={C.window} />
			<rect x={200} y={760} width={170} height={150} rx={6} fill="none" stroke={C.plank} strokeWidth={10} />
			{/* the porch floor and steps down to the yard */}
			<rect x={60} y={PORCH_Y} width={W - 120} height={40} fill={C.woodDark} />
			{[0, 1, 2].map((i) => (
				<rect key={i} x={420 - i * 20} y={PORCH_Y + 40 + i * 70} width={240 + i * 40} height={30} fill={C.woodDark} />
			))}
			<rect x={0} y={PORCH_Y + 240} width={W} height={H - PORCH_Y - 240} fill={C.ground} />
			{[120, W - 140].map((x) => (
				<rect key={x} x={x} y={PORCH_Y + 40} width={30} height={200} fill={C.plank} />
			))}
			{/* the porch bulb */}
			<line x1={BULB.x} y1={640} x2={BULB.x} y2={BULB.y - 20} stroke="#1A140F" strokeWidth={4} />
			<circle cx={BULB.x} cy={BULB.y} r={16} fill={C.bulb} />
			<Darkness id="ho" color={C.night} opacity={0.86} lights={[{x: BULB.x, y: BULB.y + 300, reach: 640 * flicker}]} />
			<Shaft id="ho-pool" points={[[BULB.x - 30, BULB.y], [BULB.x + 30, BULB.y], [BULB.x + 380, PORCH_Y + 40], [BULB.x - 380, PORCH_Y + 40]]} from={[BULB.x, BULB.y]} to={[BULB.x, PORCH_Y]} color={C.warm} opacity={0.25 * flicker} blur={20} />
			<Glow id="ho-bulb" x={BULB.x} y={BULB.y} r={420} color={C.warm} strength={flicker} />
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
