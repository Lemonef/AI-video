import React from 'react';
import {Composition} from 'remotion';
import current from '../episodes/ep01.json';
import {Avatar} from './compositions/Avatar';
import {Cover} from './compositions/Cover';
import {CharPreview} from './compositions/CharPreview';
import {EnvPreview} from './compositions/EnvPreview';
import {Episode, type EpisodeProps} from './compositions/Episode';
import {H, W} from './lib/tokens';
import {FPS, totalFrames} from './lib/timing';
import type {Episode as EpisodeT} from './types';

// JSON imports get a structural type TS can't compare with Episode (optional keys differ per scene).
const CURRENT = current as unknown as EpisodeT;

// scripts/make.py passes the episode (with TTS timing) via --props.
// Studio previews the current episode (ep01 = v1) without audio, using estimated line lengths.
export const RemotionRoot: React.FC = () => (
	<>
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
		<Composition id="Cover" component={Cover} width={W} height={H} fps={FPS} durationInFrames={1} defaultProps={{episode: CURRENT}} />
		<Composition id="Avatar" component={Avatar} width={1080} height={1080} fps={FPS} durationInFrames={1} defaultProps={{bg: 'yellow' as const}} />
		<Composition id="CharPreview" component={CharPreview} width={W} height={H} fps={FPS} durationInFrames={FPS * 4} />
		<Composition id="EnvPreview" component={EnvPreview} width={W} height={H} fps={FPS} durationInFrames={FPS * 4} defaultProps={{bg: 'houseNight'}} />
	</>
);
