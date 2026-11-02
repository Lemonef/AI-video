import React from 'react';
import {AbsoluteFill} from 'remotion';
import {GRAIN, H, W} from '../../lib/tokens';

/** Faint fixed-pattern noise above everything: dithers gradient banding through platform re-encodes. */
export const Grain: React.FC = () => (
	<AbsoluteFill style={{pointerEvents: 'none', mixBlendMode: 'overlay', opacity: GRAIN.opacity}}>
		<svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
			<filter id="grain">
				<feTurbulence type="fractalNoise" baseFrequency={GRAIN.frequency} numOctaves={2} seed={GRAIN.seed} stitchTiles="stitch" />
				<feColorMatrix type="saturate" values="0" />
			</filter>
			<rect width="100%" height="100%" filter="url(#grain)" />
		</svg>
	</AbsoluteFill>
);
