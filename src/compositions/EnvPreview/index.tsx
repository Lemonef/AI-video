import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {H, W} from '../../lib/tokens';
import {ENV5} from '../../v5/Forest';

/** One background on its own, for judging a new environment before it goes into an episode. */
export const EnvPreview: React.FC<{bg: string; progress?: number}> = ({bg, progress}) => {
	const frame = useCurrentFrame();
	const Env = ENV5[bg];
	return (
		<AbsoluteFill style={{background: '#000'}}>
			<svg width={W} height={H}>{Env ? <Env frame={frame} scroll={0} fireflies={false} density={1} progress={progress} /> : null}</svg>
		</AbsoluteFill>
	);
};
