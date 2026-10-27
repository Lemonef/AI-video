import React from 'react';
import {H, W} from '../lib/tokens';
import type {EnvProps} from '../v2/Forest';
import {ContactShadow, Darkness, Glow, Shaft} from './light';

/**
 * Inside a Thai wooden house at night, one-point perspective. Painted in lit colours; the
 * Darkness layer then leaves only what the hanging bulb reaches, and moonlight falls in
 * through the louvred window as a shaft. Simple blocks, light does the work.
 */
const VP = {x: W / 2, y: 900};
const BACK = {left: 230, right: 850, top: 430, bottom: 1150};
const BULB = {x: 640, y: 560};
const C = {
	back: '#6E5844',
	side: '#4F4135',
	ceiling: '#33291F',
	floor: '#5C4636',
	plank: '#3C2D22',
	moonWin: '#2F5F93',
	louvre: '#173250',
	sheet: '#9497B0',
	blanket: '#5A5E86',
	pillow: '#CAC7D8',
	net: '#D7E6FF',
	table: '#5A3E28',
	tableTop: '#8A6040',
	night: '#050A16',
	warm: '#FFB866',
	moon: '#86B6FF',
};

// Where a ray from the vanishing point through (x, y0) crosses height y (perspective lines).
const along = (x: number, y0: number, y: number) => VP.x + ((x - VP.x) * (y - VP.y)) / (y0 - VP.y);
// Left-wall ceiling and floor lines, as functions of x (the wall recedes toward BACK.left).
const ceilAt = (x: number) => BACK.top + ((x - BACK.left) * (BACK.top - 0)) / (BACK.left - along(BACK.left, BACK.top, 0));
const floorAt = (x: number) => BACK.bottom + ((BACK.left - x) * (H - BACK.bottom)) / (BACK.left - along(BACK.left, BACK.bottom, H));
const pts = (p: Array<[number, number]>) => p.map((q) => q.join(',')).join(' ');

const Room: React.FC = () => {
	const ceilL = along(BACK.left, BACK.top, 0);
	const ceilR = along(BACK.right, BACK.top, 0);
	const floorL = along(BACK.left, BACK.bottom, H);
	const floorR = along(BACK.right, BACK.bottom, H);
	const planks = Array.from({length: 11}, (_, i) => BACK.left + ((BACK.right - BACK.left) * i) / 10);
	const studs = [205, 160, 100, 25];
	return (
		<g>
			<polygon points={pts([[BACK.left, BACK.top], [BACK.right, BACK.top], [ceilR, 0], [ceilL, 0]])} fill={C.ceiling} />
			<polygon points={pts([[-900, -100], [BACK.left, BACK.top], [BACK.left, BACK.bottom], [-900, 2200]])} fill={C.side} />
			<polygon points={pts([[1980, -100], [BACK.right, BACK.top], [BACK.right, BACK.bottom], [1980, 2200]])} fill={C.side} />
			<rect x={BACK.left} y={BACK.top} width={BACK.right - BACK.left} height={BACK.bottom - BACK.top} fill={C.back} />
			{planks.map((x, i) => (
				<line key={`w${i}`} x1={x} y1={BACK.top} x2={x} y2={BACK.bottom} stroke={C.plank} strokeWidth={3} />
			))}
			{studs.map((x, i) => (
				<line key={`s${i}`} x1={x} y1={ceilAt(x)} x2={x} y2={floorAt(x)} stroke={C.plank} strokeWidth={4 + i * 2} />
			))}
			<polygon points={pts([[BACK.left, BACK.bottom], [BACK.right, BACK.bottom], [floorR, H], [floorL, H]])} fill={C.floor} />
			{planks.map((x, i) => (
				<line key={`f${i}`} x1={x} y1={BACK.bottom} x2={along(x, BACK.bottom, H)} y2={H} stroke={C.plank} strokeWidth={4} />
			))}
		</g>
	);
};

const WINDOW = {x0: 60, x1: 180, top: 0.25, bottom: 0.55};
const windowCorners = (): Array<[number, number]> => {
	const y = (x: number, f: number) => ceilAt(x) + (floorAt(x) - ceilAt(x)) * f;
	return [
		[WINDOW.x0, y(WINDOW.x0, WINDOW.top)],
		[WINDOW.x1, y(WINDOW.x1, WINDOW.top)],
		[WINDOW.x1, y(WINDOW.x1, WINDOW.bottom)],
		[WINDOW.x0, y(WINDOW.x0, WINDOW.bottom)],
	];
};

const Window: React.FC = () => {
	const [a, b, c, d] = windowCorners();
	const louvres = Array.from({length: 7}, (_, i) => (i + 1) / 8);
	return (
		<g>
			<polygon points={pts([a, b, c, d])} fill={C.moonWin} />
			{louvres.map((t, i) => (
				<line key={i} x1={a[0]} y1={a[1] + (d[1] - a[1]) * t} x2={b[0]} y2={b[1] + (c[1] - b[1]) * t} stroke={C.louvre} strokeWidth={9} />
			))}
			<polygon points={pts([a, b, c, d])} fill="none" stroke={C.plank} strokeWidth={10} />
		</g>
	);
};

const Bed: React.FC = () => (
	<g>
		<ContactShadow x={460} y={1560} rx={290} ry={40} />
		<polygon points={pts([[220, 1520], [700, 1520], [700, 1562], [220, 1562]])} fill="#5F6178" />
		<polygon points={pts([[300, 1290], [640, 1290], [700, 1520], [220, 1520]])} fill={C.sheet} />
		<path d="M300,1300 L410,1296 Q425,1330 400,1362 L280,1368 Q270,1330 300,1300 Z" fill={C.pillow} />
		{/* mum asleep with a fever: head on the pillow, damp cloth on her forehead, body under the blanket */}
		<circle cx={352} cy={1318} r={36} fill="#C9A383" />
		<path d="M318,1306 Q330,1272 362,1276 Q392,1282 390,1312 Q372,1296 350,1300 Q332,1302 318,1306 Z" fill="#2A1E1A" />
		<circle cx={312} cy={1296} r={14} fill="#2A1E1A" />
		<rect x={334} y={1296} width={44} height={12} rx={5} fill="#E8E2D4" />
		<path d="M384,1350 Q470,1290 600,1316 Q660,1330 690,1420 L700,1520 L330,1525 Q340,1420 384,1350 Z" fill={C.blanket} />
		<path d="M420,1340 Q520,1300 620,1330" fill="none" stroke="#000" strokeOpacity={0.18} strokeWidth={6} />
		{/* mosquito net: a draped box over the bed (one big triangle reads as a light beam) */}
		<path d="M250,1010 L690,1010 L712,1520 L208,1520 Z" fill={C.net} opacity={0.07} />
		<path d="M250,1010 Q300,1060 340,1010 Q400,1065 460,1010 Q520,1065 580,1010 Q640,1060 690,1010" fill="none" stroke={C.net} strokeOpacity={0.35} strokeWidth={3} />
		<line x1={250} y1={1010} x2={208} y2={1520} stroke={C.net} strokeOpacity={0.25} strokeWidth={2} />
		<line x1={690} y1={1010} x2={712} y2={1520} stroke={C.net} strokeOpacity={0.25} strokeWidth={2} />
		{/* bowl of water with a folded cloth by the pillow: someone is nursing a fever */}
		<ellipse cx={205} cy={1395} rx={58} ry={20} fill="#8FA3B8" />
		<ellipse cx={205} cy={1390} rx={46} ry={13} fill="#5D7A94" />
		<rect x={170} y={1372} width={52} height={12} rx={5} fill="#E8E2D4" />
	</g>
);

/** Lived-in details on the back and right walls: shelf, jars, clothes on a nail, calendar, door. */
const Props: React.FC = () => (
	<g>
		<rect x={300} y={700} width={200} height={14} fill={C.plank} />
		<rect x={318} y={652} width={34} height={48} rx={6} fill="#7B8E6A" />
		<rect x={362} y={668} width={26} height={32} rx={5} fill="#B08A57" />
		<rect x={398} y={640} width={22} height={60} rx={4} fill="#5D6F8A" />
		<rect x={432} y={662} width={46} height={38} rx={8} fill="#9C6A4A" />
		<circle cx={760} cy={640} r={6} fill="#2A2018" />
		<path d="M732,646 L790,646 L800,820 L722,820 Z" fill="#7E5A6E" />
		<rect x={540} y={800} width={74} height={96} fill="#D9CFBE" />
		<rect x={540} y={800} width={74} height={22} fill="#B84A3E" />
		{/* doorway on the right wall, open to the dark outside */}
		<polygon points={pts([[930, 330], [1050, 210], [1050, 1500], [930, 1240]])} fill="#0B1222" />
		<polygon points={pts([[930, 330], [1050, 210], [1050, 1500], [930, 1240]])} fill="none" stroke={C.plank} strokeWidth={12} />
	</g>
);

const Table: React.FC = () => (
	<g>
		<ContactShadow x={820} y={1800} rx={260} ry={45} />
		<rect x={640} y={1740} width={22} height={90} fill={C.table} />
		<rect x={975} y={1740} width={22} height={90} fill={C.table} />
		<polygon points={pts([[640, 1640], [980, 1640], [1040, 1760], [600, 1760]])} fill={C.tableTop} />
		<polygon points={pts([[600, 1760], [1040, 1760], [1040, 1784], [600, 1784]])} fill={C.table} />
		{/* thermometer and an empty medicine strip */}
		<rect x={690} y={1690} width={150} height={14} rx={7} fill="#E9EEF5" transform="rotate(-14 765 1697)" />
		<rect x={690} y={1690} width={36} height={14} rx={7} fill="#D64545" transform="rotate(-14 765 1697)" />
		<rect x={870} y={1665} width={120} height={56} rx={10} fill="#B9C1CC" transform="rotate(8 930 1693)" />
		{[0, 1, 2].map((i) => (
			<circle key={i} cx={895 + i * 34} cy={1693} r={11} fill="#7C8592" transform="rotate(8 930 1693)" />
		))}
	</g>
);

const Bulb: React.FC = () => (
	<g>
		<line x1={BULB.x} y1={300} x2={BULB.x} y2={BULB.y - 22} stroke="#1A140F" strokeWidth={4} />
		<rect x={BULB.x - 10} y={BULB.y - 26} width={20} height={14} fill="#2A2018" />
		<circle cx={BULB.x} cy={BULB.y} r={17} fill="#FFE3A8" />
	</g>
);

export const HouseNight: React.FC<EnvProps> = ({frame}) => {
	const flicker = 0.94 + 0.06 * Math.sin(frame / 7) * Math.sin(frame / 13);
	const [, winTop, winBottom] = windowCorners();
	return (
		<g>
			<Room />
			<Window />
			<Props />
			<Bed />
			<Table />
			<Bulb />
			{/* a second, small reach keeps the table (the story's props) readable in the foreground */}
			<Darkness id="house" color={C.night} opacity={0.88} lights={[{x: BULB.x, y: BULB.y + 160, reach: 820 * flicker}, {x: 820, y: 1700, reach: 380}]} />
			<Shaft
				id="moon"
				points={[winTop, winBottom, [560, 1830], [300, 1560]]}
				from={[winTop[0], winTop[1]]}
				to={[520, 1700]}
				color={C.moon}
				opacity={0.42}
			/>
			<Glow id="bulb" x={BULB.x} y={BULB.y} r={560} color={C.warm} strength={flicker} />
		</g>
	);
};
