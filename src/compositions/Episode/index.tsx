import React from 'react';
import {AbsoluteFill, Html5Audio, Sequence, staticFile} from 'remotion';
import {SFX} from '../../lib/tokens';
import {sceneFrames} from '../../lib/timing';
import type {Episode as EpisodeT} from '../../types';
import {Scene} from '../Scene';

export type EpisodeProps = {episode: EpisodeT};

/** Lays the episode's scenes end to end; each scene owns its own audio and overlays. */
export const Episode: React.FC<EpisodeProps> = ({episode}) => {
	let from = 0;
	return (
		<AbsoluteFill style={{background: '#000'}}>
			{episode.scenes.map((s) => {
				const len = sceneFrames(episode, s);
				const at = from;
				from += len;
				return (
					<Sequence key={s.id} from={at} durationInFrames={len} name={s.id}>
						<Scene ep={episode} scene={s} />
						<Html5Audio src={staticFile(SFX.whoosh)} volume={0.35} />
					</Sequence>
				);
			})}
		</AbsoluteFill>
	);
};
