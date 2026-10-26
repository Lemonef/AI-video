import React from 'react';
import {Composition} from 'remotion';
import current from '../episodes/ep02.json';
import {Episode, type EpisodeProps} from './compositions/Episode';
import {H, W} from './lib/tokens';
import {FPS, totalFrames} from './lib/timing';
import type {Episode as EpisodeT} from './types';

// JSON imports get a structural type TS can't compare with Episode (optional keys differ per scene).
const CURRENT = current as unknown as EpisodeT;

// scripts/make.py passes the episode (with TTS timing) via --props.
// Studio previews the current episode (ep02 = v1) without audio, using estimated line lengths.
export const RemotionRoot: React.FC = () => (
	<Composition
		id="Episode"
		component={Episode}
		width={W}
		height={H}
		fps={FPS}
		durationInFrames={totalFrames(CURRENT)}
		defaultProps={{episode: CURRENT} satisfies EpisodeProps}
		calculateMetadata={({props}) => ({durationInFrames: totalFrames(props.episode)})}
	/>
);
