import React from 'react';
import {AbsoluteFill} from 'remotion';
import {CAST2} from '../../v2/cast';
import {Character2} from '../../v2/Character';

const SIZE = 1080;

/** Profile picture: Jaab's head and shoulders on the night-forest gradient (TikTok crops to a circle). */
export const Avatar: React.FC = () => (
	<AbsoluteFill style={{background: 'radial-gradient(circle at 50% 38%, #2C426A 0%, #0E1830 55%, #060A16 100%)'}}>
		<svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
			<circle cx={SIZE * 0.72} cy={SIZE * 0.22} r={60} fill="#E9F2FF" opacity={0.9} />
			{/* head centred in the circle crop: feet far below the frame, scaled up */}
			<g transform={`translate(${SIZE / 2} ${SIZE * 1.72}) scale(1.6)`}>
				<Character2 look={CAST2.jaab} pose="idle" expr="sweat" turn={0.15} frame={20} />
			</g>
		</svg>
	</AbsoluteFill>
);
