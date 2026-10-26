import React from 'react';
import {Composition} from 'remotion';
import ep01 from '../episodes/ep01.json';
import {Episode, type EpisodeProps} from './compositions/Episode';
import {H, W} from './lib/tokens';
import {FPS, totalFrames} from './lib/timing';
import type {Episode as EpisodeT} from './types';

// scripts/make.py passes the episode (with TTS timing) via --props.
// Studio falls back to ep01 without audio, using estimated line lengths.
export const RemotionRoot: React.FC = () => (
	<Composition
		id="Episode"
		component={Episode}
		width={W}
		height={H}
		fps={FPS}
		durationInFrames={totalFrames(ep01 as EpisodeT)}
		defaultProps={{episode: ep01 as EpisodeT} satisfies EpisodeProps}
		calculateMetadata={({props}) => ({durationInFrames: totalFrames(props.episode)})}
	/>
);
