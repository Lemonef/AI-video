import React from 'react';
import {AbsoluteFill} from 'remotion';
import type {Expr, Pose} from '../../types';
import {CAST2} from '../../v2/cast';
import {Character2} from '../../v2/Character';

const SIZE = 1080;

export type AvatarProps = {
	variant: 'sun' | 'mint' | 'book';
};

// Brand avatar: genre-neutral (horror, comedy and shop videos all sit under it), so it is bright
// and friendly; the teal hoodie stays the recognisable accent at thumbnail size.
const LOOKS: Record<AvatarProps['variant'], {bg: string; ring: string; pose: Pose; expr: Expr}> = {
	sun: {bg: 'radial-gradient(circle at 50% 40%, #FFE08A 0%, #FFC94A 60%, #F5A524 100%)', ring: '#FFF4D0', pose: 'wave', expr: 'smile'},
	mint: {bg: 'radial-gradient(circle at 50% 40%, #FFF6E8 0%, #FFE3C2 65%, #F7C99A 100%)', ring: '#FFFFFF', pose: 'idle', expr: 'smile'},
	book: {bg: 'radial-gradient(circle at 50% 40%, #CFE8FF 0%, #9ED0F7 60%, #6FB3E8 100%)', ring: '#EAF5FF', pose: 'hold', expr: 'smile'},
};

const Book: React.FC = () => (
	<g transform="translate(-95 -640)">
		<rect x={0} y={0} width={190} height={130} rx={10} fill="#E5484D" stroke="#151826" strokeWidth={6} />
		<rect x={92} y={0} width={6} height={130} fill="#151826" />
		<rect x={18} y={22} width={60} height={10} rx={5} fill="#FFE3C2" />
		<rect x={112} y={22} width={60} height={10} rx={5} fill="#FFE3C2" />
	</g>
);

export const Avatar: React.FC<AvatarProps> = ({variant}) => {
	const look = LOOKS[variant];
	return (
		<AbsoluteFill style={{background: look.bg}}>
			<svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
				{/* soft sunburst behind the head: friendly, reads at 100 px */}
				{Array.from({length: 16}, (_, i) => (
					<path key={i} d={`M540,560 L${540 + Math.cos((i * Math.PI) / 8) * 900},${560 + Math.sin((i * Math.PI) / 8) * 900} L${540 + Math.cos((i * Math.PI) / 8 + 0.12) * 900},${560 + Math.sin((i * Math.PI) / 8 + 0.12) * 900} Z`} fill={look.ring} opacity={0.18} />
				))}
				{/* face fills the circle crop: profile pictures show at ~100 px */}
				<g transform={`translate(${SIZE / 2} ${SIZE * 1.78}) scale(1.75)`}>
					<Character2 look={CAST2.jaab} pose={look.pose} expr={look.expr} turn={0.1} frame={20} />
					{variant === 'book' ? <Book /> : null}
				</g>
			</svg>
		</AbsoluteFill>
	);
};
