import React from 'react';
import {C, FLOOR_Y, H, W} from '../lib/tokens';

type BgProps = {frame: number};

const Floor: React.FC<{color: string; line?: string}> = ({color, line}) => (
	<g>
		<rect x={0} y={FLOOR_Y} width={W} height={H - FLOOR_Y} fill={color} />
		{line ? <rect x={0} y={FLOOR_Y} width={W} height={10} fill={line} /> : null}
	</g>
);

const Bedroom: React.FC<BgProps> = () => (
	<g>
		<rect width={W} height={H} fill={C.wall} />
		{/* wallpaper dots */}
		{Array.from({length: 40}, (_, i) => (
			<circle key={i} cx={60 + (i % 8) * 140 + (Math.floor(i / 8) % 2) * 70} cy={260 + Math.floor(i / 8) * 190} r={9} fill={C.coral} opacity={0.18} />
		))}
		{/* window with sunrise */}
		<g transform="translate(600 360)">
			<rect width={360} height={420} rx={28} fill={C.sky} stroke={C.woodDark} strokeWidth={18} />
			<circle cx={180} cy={330} r={90} fill={C.sun} />
			<rect x={0} y={300} width={360} height={110} fill={C.skyDeep} opacity={0.5} />
			<path d="M180 0 V420 M0 210 H360" stroke={C.woodDark} strokeWidth={14} />
		</g>
		<Floor color={C.wood} line={C.woodDark} />
		{/* bed */}
		<g transform={`translate(40 ${FLOOR_Y - 230})`}>
			<rect x={0} y={60} width={420} height={170} rx={30} fill={C.lilac} />
			<rect x={-10} y={0} width={60} height={240} rx={20} fill={C.woodDark} />
			<rect x={70} y={30} width={150} height={70} rx={30} fill={C.white} />
			<rect x={150} y={70} width={270} height={90} rx={30} fill={C.lilacDark} />
		</g>
		{/* nightstand */}
		<rect x={760} y={FLOOR_Y - 190} width={200} height={190} rx={18} fill={C.woodDark} />
		<rect x={790} y={FLOOR_Y - 140} width={140} height={14} rx={7} fill={C.wood} />
	</g>
);

const Bts: React.FC<BgProps> = ({frame}) => {
	// City skyline slides past the windows to sell motion.
	const shift = (frame * 14) % 600;
	return (
		<g>
			<rect width={W} height={H} fill={C.wallCool} />
			<rect x={0} y={260} width={W} height={60} fill={C.tealDark} />
			{[60, 580].map((x) => (
				<g key={x}>
					<clipPath id={`win${x}`}>
						<rect x={x} y={380} width={440} height={360} rx={40} />
					</clipPath>
					<rect x={x} y={380} width={440} height={360} rx={40} fill={C.sky} />
					<g clipPath={`url(#win${x})`}>
						{Array.from({length: 8}, (_, i) => {
							const bx = x - shift + i * 150;
							const bh = 120 + ((i * 53) % 160);
							return <rect key={i} x={bx} y={740 - bh} width={110} height={bh} fill={i % 2 ? C.skyDeep : C.lilacDark} opacity={0.7} />;
						})}
					</g>
					<rect x={x} y={380} width={440} height={360} rx={40} fill="none" stroke={C.steelDark} strokeWidth={16} />
				</g>
			))}
			{/* handrail + poles */}
			<rect x={0} y={330} width={W} height={14} fill={C.steelDark} />
			{[300, 780].map((x) => (
				<rect key={x} x={x} y={330} width={18} height={FLOOR_Y - 330} fill={C.steelDark} />
			))}
			{/* bench */}
			<rect x={0} y={FLOOR_Y - 180} width={W} height={70} rx={20} fill={C.teal} />
			<rect x={0} y={FLOOR_Y - 110} width={W} height={110} fill={C.tealDark} />
			<Floor color={C.steel} line={C.steelDark} />
		</g>
	);
};

const Office: React.FC<BgProps> = () => (
	<g>
		<rect width={W} height={H} fill={C.mint} />
		{/* blinds */}
		<g transform="translate(90 330)">
			<rect width={420} height={440} rx={20} fill={C.sky} />
			{Array.from({length: 11}, (_, i) => (
				<rect key={i} x={0} y={i * 40} width={420} height={22} fill={C.white} opacity={0.75} />
			))}
		</g>
		{/* certificate + clock */}
		<rect x={640} y={360} width={240} height={170} rx={12} fill={C.white} stroke={C.sun} strokeWidth={14} />
		<circle cx={760} cy={650} r={70} fill={C.white} stroke={C.ink} strokeWidth={10} />
		<path d="M760 650 V600 M760 650 L795 670" stroke={C.ink} strokeWidth={8} strokeLinecap="round" />
		{/* plant */}
		<rect x={930} y={FLOOR_Y - 150} width={100} height={150} rx={16} fill={C.coral} />
		<ellipse cx={980} cy={FLOOR_Y - 210} rx={70} ry={90} fill={C.grass} />
		<Floor color={C.steel} line={C.steelDark} />
	</g>
);

const Closeup: React.FC<BgProps> = ({frame}) => {
	// Rotating sunburst for the freeze/decision moment.
	const rays = 18;
	return (
		<g>
			<rect width={W} height={H} fill={C.coral} />
			<g transform={`translate(${W / 2} ${H * 0.42}) rotate(${frame * 0.6})`}>
				{Array.from({length: rays}, (_, i) => (
					<path key={i} d="M0 0 L-120 -1600 L120 -1600 Z" fill={C.sun} opacity={0.35} transform={`rotate(${(i * 360) / rays})`} />
				))}
			</g>
		</g>
	);
};

const Card: React.FC<BgProps> = ({frame}) => (
	<g>
		<rect width={W} height={H} fill={C.cream} />
		{Array.from({length: 60}, (_, i) => (
			<circle
				key={i}
				cx={(i % 6) * 200 + 40}
				cy={((Math.floor(i / 6) * 210 + frame * 1.5) % (H + 200)) - 100}
				r={14}
				fill={i % 3 === 0 ? C.teal : i % 3 === 1 ? C.coral : C.sun}
				opacity={0.25}
			/>
		))}
	</g>
);

export const BACKGROUNDS: Record<string, React.FC<BgProps>> = {
	bedroom: Bedroom,
	bts: Bts,
	office: Office,
	closeup: Closeup,
	card: Card,
};
