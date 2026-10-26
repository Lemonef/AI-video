import React from 'react';

type P = {frame: number};

/** Tall thin silhouette between the trees; eyes catch the light only when `frame` says so. */
const Watcher: React.FC<P> = ({frame}) => {
	const sway = Math.sin(frame / 40) * 3;
	const eyes = 0.5 + 0.5 * Math.max(0, Math.sin(frame / 9));
	return (
		<g transform={`rotate(${sway})`} opacity={0.92}>
			<path d="M-40,0 L-28,-520 Q0,-600 28,-520 L40,0 Z" fill="#04060B" />
			<ellipse cx={0} cy={-560} rx={46} ry={60} fill="#04060B" />
			<path d="M-30,-470 L-120,-200 M30,-470 L120,-200" stroke="#04060B" strokeWidth={16} strokeLinecap="round" />
			<circle cx={-16} cy={-566} r={5} fill="#F4F1E0" opacity={eyes} />
			<circle cx={16} cy={-566} r={5} fill="#F4F1E0" opacity={eyes} />
		</g>
	);
};

const Stone: React.FC<P> = () => (
	<g>
		<ellipse cx={0} cy={0} rx={70} ry={40} fill="#2B3350" />
		<ellipse cx={-14} cy={-12} rx={40} ry={16} fill="#3A4466" />
	</g>
);

export const PROPS2: Record<string, React.FC<P>> = {
	watcher: Watcher,
	stone: Stone,
};
