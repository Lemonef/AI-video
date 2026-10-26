import React from 'react';
import {AbsoluteFill, Html5Audio, Sequence, staticFile} from 'remotion';
import {bedLevel, sceneSpans, sfxFile, speechEnvelope, speechMask} from '../../v2/sound';
import {SFX} from '../../lib/tokens';
import {sceneFrames} from '../../lib/timing';
import type {Episode as EpisodeT} from '../../types';
import {Scene} from '../Scene';
import {SceneV2} from '../SceneV2';

export type EpisodeProps = {episode: EpisodeT};

/** Lays the episode's scenes end to end; each scene owns its own audio and overlays. */
/** v3: each bed plays once across the whole episode (no restart at cuts), level set per scene, ducked under speech. */
const Beds: React.FC<{episode: EpisodeT}> = ({episode}) => {
	const mix = episode.mix;
	if (!mix) return null;
	const spans = sceneSpans(episode);
	const mask = speechMask(episode, spans);
	const duck = mix.duck ?? 0.45; // bed drops to this fraction while the narrator speaks
	const base = mix.bedVolume ?? 0.5;
	return (
		<>
			{mix.beds.map((bed) => (
				<Html5Audio
					key={bed}
					src={staticFile(sfxFile(bed))}
					loop
					volume={(f) => base * bedLevel(spans, bed, f) * (1 - (1 - duck) * speechEnvelope(mask, f))}
				/>
			))}
		</>
	);
};

export const Episode: React.FC<EpisodeProps> = ({episode}) => {
	let from = 0;
	return (
		<AbsoluteFill style={{background: '#000'}}>
			<Beds episode={episode} />
			{episode.scenes.map((s, i) => {
				const len = sceneFrames(episode, s);
				const at = from;
				from += len;
				return (
					<Sequence key={s.id} from={at} durationInFrames={len} name={s.id}>
						{episode.style === 'v2' || episode.style === 'v3' || episode.style === 'v4' ? <SceneV2 ep={episode} scene={s} index={i} /> : <Scene ep={episode} scene={s} />}
						{episode.mix ? null : <Html5Audio src={staticFile(SFX.whoosh)} volume={0.35} />}
					</Sequence>
				);
			})}
		</AbsoluteFill>
	);
};
