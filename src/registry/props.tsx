import React from 'react';
import {C} from '../lib/tokens';

type P = {frame: number};

const Alarm: React.FC<P> = ({frame}) => {
	const ring = Math.sin(frame * 1.6) * 10;
	return (
		<g transform={`rotate(${ring})`}>
			<circle cx={-38} cy={-110} r={22} fill={C.coral} />
			<circle cx={38} cy={-110} r={22} fill={C.coral} />
			<circle cx={0} cy={-60} r={62} fill={C.coral} />
			<circle cx={0} cy={-60} r={46} fill={C.white} />
			<path d="M0 -60 V-92 M0 -60 L22 -48" stroke={C.ink} strokeWidth={7} strokeLinecap="round" />
			<path d="M-40 0 l14 -14 M40 0 l-14 -14" stroke={C.ink} strokeWidth={8} strokeLinecap="round" />
			{frame % 10 < 6 ? (
				<g stroke={C.ink} strokeWidth={6} strokeLinecap="round">
					<path d="M-90 -120 l-26 -16 M-96 -70 h-30 M90 -120 l26 -16 M96 -70 h30" />
				</g>
			) : null}
		</g>
	);
};

const Durian: React.FC<P> = ({frame}) => (
	<g>
		{/* open foam box */}
		<rect x={-90} y={-60} width={180} height={60} rx={8} fill={C.white} stroke={C.steelDark} strokeWidth={4} />
		<ellipse cx={0} cy={-62} rx={70} ry={34} fill={C.durian} />
		{Array.from({length: 6}, (_, i) => (
			<path key={i} d={`M${-60 + i * 24},-70 l10,-18 l10,18`} fill={C.durianDark} />
		))}
		{/* stink waves */}
		{[-40, 0, 40].map((x, i) => (
			<path
				key={x}
				d={`M${x},-110 q-18,-30 0,-60 q18,-30 0,-60`}
				stroke={C.durianDark}
				strokeWidth={8}
				fill="none"
				strokeLinecap="round"
				opacity={0.55 + 0.4 * Math.sin(frame / 6 + i)}
				transform={`translate(${Math.sin(frame / 8 + i) * 10} ${-((frame * 2 + i * 30) % 50)})`}
			/>
		))}
	</g>
);

const Desk: React.FC<P> = () => (
	<g>
		<rect x={-260} y={-210} width={520} height={40} rx={14} fill={C.woodDark} />
		<rect x={-240} y={-170} width={60} height={170} fill={C.woodDark} />
		<rect x={180} y={-170} width={60} height={170} fill={C.woodDark} />
		<rect x={-200} y={-260} width={120} height={50} rx={6} fill={C.white} stroke={C.steelDark} strokeWidth={4} transform="rotate(-6 -140 -235)" />
		<rect x={90} y={-300} width={110} height={90} rx={10} fill={C.ink} />
	</g>
);

const Paper: React.FC<P> = () => (
	<g>
		<rect x={-50} y={-130} width={100} height={130} rx={8} fill={C.white} stroke={C.ink} strokeWidth={5} />
		<path d="M-30 -100 h60 M-30 -76 h60 M-30 -52 h40" stroke={C.steelDark} strokeWidth={6} strokeLinecap="round" />
	</g>
);

const Cat: React.FC<P> = ({frame}) => (
	<g transform={`translate(0 ${Math.sin(frame / 10) * 4})`}>
		<ellipse cx={0} cy={-60} rx={80} ry={60} fill={C.sun} />
		<circle cx={50} cy={-130} r={52} fill={C.sun} />
		<path d="M14 -170 l10 -40 l26 30 M70 -176 l22 -36 l10 40" fill={C.sun} />
		<circle cx={34} cy={-130} r={7} fill={C.ink} />
		<circle cx={68} cy={-130} r={7} fill={C.ink} />
		<path d={`M-80 -70 q-50 ${-40 + Math.sin(frame / 6) * 20} -20 -90`} stroke={C.sun} strokeWidth={18} fill="none" strokeLinecap="round" />
	</g>
);

export const PROPS: Record<string, React.FC<P>> = {
	alarm: Alarm,
	durian: Durian,
	desk: Desk,
	paper: Paper,
	cat: Cat,
};
