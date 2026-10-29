import React from 'react';
import {H, W} from '../lib/tokens';
import type {EnvProps} from '../v2/Forest';
import {ContactShadow, Darkness, Glow, Shaft} from './light';
import {Character2} from '../v2/Character';
import {CAST2} from '../v2/cast';

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

/** A connected palm, four fingers and thumb; used by the lock and sleeve-grip actions. */
const GripHand: React.FC<{x: number; y: number; angle?: number; scale?: number; closed?: number}> = ({x,y,angle=0,scale=1,closed=1}) => {
    const open = 1 - closed;
    return <g transform={`translate(${x} ${y}) rotate(${angle}) scale(${scale})`}>
        <ellipse cx={0} cy={4} rx={27} ry={28} fill={CAST2.mum.skin} />
        {[-18,-6,6,18].map((dx,i) => <path key={dx} d={`M${dx},-7 L${dx},${-20-open*(21-Math.abs(i-1.5)*4)} q0,-7 6,-2`} stroke={CAST2.mum.skin} strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" fill="none" />)}
        <path d={`M-18,13 Q${-38-open*8},${-1-open*10} -23,${-14-open*10}`} stroke={CAST2.mum.skin} strokeWidth={14} strokeLinecap="round" fill="none" />
        {[-12,0,12].map(dx => <path key={dx} d={`M${dx},-9 l5,5`} stroke={CAST2.mum.skinShade} strokeWidth={2} strokeLinecap="round" />)}
        <path d="M-12,16 q13,6 24,-2" stroke={CAST2.mum.skinShade} strokeWidth={2} opacity={0.6} fill="none" />
    </g>;
};

/** The opening image: mum's hand has reached the old brass door bolt. */
const DoorLock: React.FC<EnvProps & {movement?: "open" | "shut"}> = ({frame, movement}) => {
	const tremble = Math.sin(frame * 0.25) * 0.7;
	const p = Math.min(1, Math.max(0, frame / 12));
	const slide = movement === "open" ? -95 * p : movement === "shut" ? -95 * (1 - p) : 0;
	return (
		<g>
			<rect width={W} height={H} fill={C.woodDark} />
			{Array.from({length: 9}, (_, i) => <line key={i} x1={120 + i * 115} y1={0} x2={120 + i * 115} y2={H} stroke={C.plank} strokeWidth={8} />)}
			<rect x={245} y={760} width={590} height={210} rx={24} fill="#241A15" opacity={0.75} />
			<rect x={300 + slide} y={820} width={430} height={78} rx={26} fill="#B98A43" />
			<rect x={680} y={780} width={90} height={160} rx={18} fill="#80602E" />
            <g transform={`translate(${tremble + slide} 0)`}>
                <path d="M0,1370 L145,1480 Q365,1215 560,1030 L640,945 Q663,910 636,889 Q609,870 580,897 L510,958 Q275,1130 0,1370 Z" fill={CAST2.mum.skin} />
                <path d="M0,1325 L145,1445 L225,1370 L80,1245 Z" fill={CAST2.mum.top} />
                <GripHand x={610} y={883} angle={-32} scale={2} />
            </g>
			<Darkness id="lock" color={C.night} opacity={0.74} lights={[{x: 620, y: 860, reach: 760}]} />
			<Glow id="lock-warm" x={650} y={780} r={650} color={C.warm} strength={0.65} />
		</g>
	);
};

export const InsertDoorLock: React.FC<EnvProps> = (props) => <DoorLock {...props} />;
export const InsertBoltOpen: React.FC<EnvProps> = (props) => <DoorLock {...props} movement="open" />;
export const InsertBoltShut: React.FC<EnvProps> = (props) => <DoorLock {...props} movement="shut" />;

/** Two separate portraits: one twin blinks, then the other. Never two mismatched eyes on one face. */
export const InsertDoubleEyes: React.FC<EnvProps> = ({frame}) => (
    <g>
        <defs>
            <clipPath id="eyes-left"><rect x={110} y={560} width={400} height={800} rx={24} /></clipPath>
            <clipPath id="eyes-right"><rect x={570} y={560} width={400} height={800} rx={24} /></clipPath>
        </defs>
        <rect width={W} height={H} fill={C.night} />
        {[{x: 310, id: 'left', offset: 80}, {x: 770, id: 'right', offset: 63}].map(({x,id,offset}) => (
            <g key={id} clipPath={`url(#eyes-${id})`}>
                <rect x={x - 200} y={560} width={400} height={800} fill={C.woodDark} />
                <g transform={`translate(${x} 2325) scale(1.8)`}>
                    <Character2 look={CAST2.jaab} pose="idle" expr="flat" turn={0} frame={frame + offset} noShadow />
                </g>
            </g>
        ))}
        <Darkness id="eyes" color={C.night} opacity={0.28} lights={[{x: 310, y: 920, reach: 450}, {x: 770, y: 920, reach: 450}]} />
    </g>
);

/** The deadline made visible: the porch bulb sputters toward darkness. */
export const InsertDyingBulb: React.FC<EnvProps> = ({frame}) => {
	const on = Math.floor(frame / 5) % 5 !== 2 && Math.floor(frame / 7) % 6 !== 4;
	return <g><rect width={W} height={H} fill={C.night} /><line x1={540} y1={0} x2={540} y2={680} stroke="#201711" strokeWidth={18} /><circle cx={540} cy={800} r={115} fill={on ? C.bulb : "#4C463C"} /><Glow id="dying" x={540} y={800} r={on ? 650 : 180} color={C.warm} strength={on ? 0.9 : 0.12} /><path d="M430,800 Q540,660 650,800" fill="none" stroke="#7A6848" strokeWidth={12} /></g>;
};

/** Close enough to see a connected embrace: mum's sleeves, forearms and hands wrap Jaab's teal hoodie. */
export const InsertHug: React.FC<EnvProps> = ({frame}) => {
    const squeeze = 3 * Math.sin(frame / 24);
    return <g>
        <rect width={W} height={H} fill="#3B2A22" />
        <Glow id="hug-lamp" x={840} y={360} r={900} color={C.warm} strength={0.55} />
        <path d="M180,1920 L160,1040 Q180,800 385,740 L700,740 Q920,810 940,1040 L950,1920 Z" fill={CAST2.jaab.top} />
        <path d="M400,760 L425,640 L655,640 L680,760 Q540,830 400,760" fill={CAST2.jaab.skin} />
        <ellipse cx={540} cy={555} rx={177} ry={205} fill={CAST2.jaab.hair} />
        <path d="M485,385 Q540,365 585,390" stroke={CAST2.jaab.hairHi} strokeWidth={12} fill="none" />
        <rect x={315} y={905} width={450} height={690} rx={95} fill={CAST2.jaab.accent ?? '#C7724D'} />
        <path d="M365,960 Q540,900 715,960" stroke="#9F5638" strokeWidth={14} fill="none" />
        <g transform={`translate(${squeeze} 0)`}>
            {/* Left sleeve continues into the forearm, with the hand lying flat on his back. */}
            <path d="M0,920 Q105,825 215,920 L350,1090 L225,1240 Q55,1150 0,1090 Z" fill={CAST2.mum.top} />
            <path d="M230,1080 Q440,985 620,1040 L720,1070 Q785,1090 760,1150 Q735,1185 680,1170 L570,1140 Q415,1120 295,1190 Z" fill={CAST2.mum.skin} />
            {[0,1,2,3].map(i => <path key={i} d={`M${665+i*22},1082 l38,30`} stroke={CAST2.mum.skinShade} strokeWidth={5} strokeLinecap="round" />)}
            {/* Opposite sleeve and forearm wrap the lower back from the other side. */}
            <path d="M1080,1150 Q945,1060 850,1170 L755,1320 L880,1450 Q1015,1370 1080,1300 Z" fill={CAST2.mum.top} />
            <path d="M850,1250 Q665,1190 495,1260 L400,1300 Q345,1325 375,1375 Q400,1408 450,1388 L535,1350 Q675,1300 795,1360 Z" fill={CAST2.mum.skin} />
            {[0,1,2,3].map(i => <path key={i} d={`M${405+i*20},1308 l-24,36`} stroke={CAST2.mum.skinShade} strokeWidth={5} strokeLinecap="round" />)}
        </g>
        {/* Jaab still holds the medicine below the embrace. */}
        <ellipse cx={270} cy={1530} rx={46} ry={62} fill={CAST2.jaab.skin} />
        <g transform="rotate(-12 270 1510)">
            <rect x={240} y={1420} width={85} height={150} rx={12} fill="#D9DFE3" />
            {[0,1,2].map(i => <ellipse key={i} cx={282} cy={1448 + i*44} rx={22} ry={12} fill="#9BA5AF" />)}
        </g>
        <Darkness id="hug" color={C.night} opacity={0.38} lights={[{x: 760, y: 900, reach: 1100}]} />
    </g>;
};

/** A clean lit doorway for the full-body final comparison; the sleeping mum stays out of view. */
export const HouseThreshold: React.FC<EnvProps> = ({frame}) => (
    <g>
        <rect width={W} height={H} fill="#31251F" />
        <rect x={100} y={460} width={880} height={930} fill="#85684C" />
        {Array.from({length: 9}, (_, i) => <line key={i} x1={120 + i*105} x2={120 + i*105} y1={460} y2={1390} stroke="#4F3A2D" strokeWidth={6} />)}
        <rect y={1390} width={W} height={530} fill="#4B382A" />
        {[1530,1650,1800].map(y => <line key={y} x1={0} x2={W} y1={y} y2={y} stroke="#2B201A" strokeWidth={6} />)}
        <rect x={870} y={560} width={120} height={830} fill="#080E19" />
        <line x1={620} x2={620} y1={0} y2={540} stroke="#201710" strokeWidth={8} />
        <circle cx={620} cy={550} r={24} fill={C.bulb} />
        <Darkness id="threshold" color={C.night} opacity={0.55} lights={[{x: 560,y: 1100,reach: 1000}]} />
        <Glow id="threshold-lamp" x={620} y={550} r={650} color={C.warm} strength={0.6 + Math.sin(frame / 30) * 0.015} />
    </g>
);

/** Reach -> close the fingers on the sleeve -> pull Jaab across the threshold into the room. */
export const InsertPull: React.FC<EnvProps> = (props) => {
    const seconds = props.frame / 30;
    const smooth = (v: number) => {const p = Math.max(0,Math.min(1,v)); return p*p*(3-2*p);};
    // The action is paced within the spoken line; progress comes from the episode timing.
    const progress = props.progress ?? Math.min(1, seconds / 5);
    const reach = smooth((progress - 0.06) / 0.26);
    const grip = smooth((progress - 0.30) / 0.10);
    const pull = smooth((progress - 0.43) / 0.47);
    const x = 400 + pull*400;
    const y = 1500 - pull*30;
    const scale = 0.74 - pull*0.18;
    const lean = Math.sin(pull * Math.PI) * 6;
    const rad = lean*Math.PI/180;
    // The grip target is on the upper sleeve, transformed by the same root as the entire rig.
    const local = {x:58.4*scale,y:-561.56*scale};
    const target = {x:x+local.x*Math.cos(rad)-local.y*Math.sin(rad),y:y+local.x*Math.sin(rad)+local.y*Math.cos(rad)};
    const wrist = {x:745+(target.x-745)*reach,y:1085+(target.y-1085)*reach};
    const shoulder = {x:735+pull*135,y:1020};
    // Two-bone arm: a real elbow replaces the long flat wedge from the earlier insert.
    const dx=wrist.x-shoulder.x,dy=wrist.y-shoulder.y;
    const distance=Math.max(80.01,Math.min(319.99,Math.hypot(dx,dy)));
    const direction=Math.atan2(dy,dx);
    const bend=Math.acos(Math.max(-1,Math.min(1,(120*120+distance*distance-200*200)/(2*120*distance))));
    const elbow={x:shoulder.x+120*Math.cos(direction-bend),y:shoulder.y+120*Math.sin(direction-bend)};
    const cuff={x:elbow.x+(wrist.x-elbow.x)*.73,y:elbow.y+(wrist.y-elbow.y)*.73};
    const handAngle=Math.atan2(elbow.y-wrist.y,elbow.x-wrist.x)*180/Math.PI-90;
    return <g>
        <rect width={W} height={H} fill="#30231C" />
        <rect x={80} y={460} width={920} height={1060} fill="#795B43" />
        {Array.from({length:9},(_,i)=><line key={i} x1={100+i*110} x2={100+i*110} y1={460} y2={1520} stroke="#493429" strokeWidth={6} />)}
        <rect x={680} y={510} width={300} height={1010} fill="#080E17" />
        <rect x={700} y={570} width={260} height={900} fill="#171A24" />
        <path d="M700,1470 H960 V1520 H680 Z" fill="#4D3728" />
        <rect y={1520} width={W} height={400} fill="#453024" />
        {[1600,1740,1900].map(yy=><line key={yy} x1={0} x2={W} y1={yy} y2={yy} stroke="#241A15" strokeWidth={6} />)}
        <line x1={620} x2={620} y1={0} y2={560} stroke="#201710" strokeWidth={8} />
        <circle cx={620} cy={570} r={22} fill={C.bulb} />
        <Glow id="pull-lamp" x={620} y={570} r={820} color={C.warm} strength={.5} />
        {/* Mum stays inside the dark doorway; only the shoulder and reaching arm emerge. */}
        <path d={`M${shoulder.x-35},970 Q${shoulder.x+45},900 ${shoulder.x+110},1010 L${shoulder.x+100},1360 H${shoulder.x-35} Z`} fill={CAST2.mum.topShade} opacity={.55} />
        {/* The sleeve passes BEHIND Jaab; the gripping palm stays in front of his upper arm. */}
        <path d={`M${shoulder.x},${shoulder.y} L${elbow.x},${elbow.y} L${cuff.x},${cuff.y}`} stroke={CAST2.mum.top} strokeWidth={58} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <g transform={`translate(${x} ${y}) rotate(${lean}) scale(${scale})`} style={{filter:`brightness(${1-pull*.35})`}}>
            <Character2 look={CAST2.jaab} pose="hold" expr="shock" turn={.15+reach*.4} frame={props.frame} />
            {/* Medicine stays attached to Jaab's other hand throughout the pull. */}
            <g transform="translate(-101 -509) rotate(-8)">
                <rect x={-22} y={-36} width={44} height={76} rx={6} fill="#D9DFE3" />
                {[0,1,2].map(i=><ellipse key={i} cx={0} cy={-22+i*23} rx={12} ry={7} fill="#9BA5AF" />)}
                <path d="M-25,16 q10,18 20,5" stroke={CAST2.jaab.skin} strokeWidth={13} strokeLinecap="round" fill="none" />
            </g>
        </g>
        <path d={`M${cuff.x},${cuff.y} L${wrist.x},${wrist.y}`} stroke={CAST2.mum.skin} strokeWidth={36} strokeLinecap="round" fill="none" />
        <GripHand x={wrist.x} y={wrist.y} angle={handAngle} scale={.9} closed={grip} />
        {/* The front jamb gives an unambiguous doorway for the body to cross. */}
        <rect x={970} y={500} width={26} height={1030} fill="#332218" />
        <Darkness id="pull-room" color={C.night} opacity={.32} lights={[{x:540,y:1080,reach:950}]} />
    </g>;
};
