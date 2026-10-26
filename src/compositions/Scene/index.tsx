import React from 'react';
import {AbsoluteFill, Html5Audio, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {Bubble} from '../../components/Bubble';
import {Captions} from '../../components/Captions';
import {Character} from '../../components/Character';
import {Countdown} from '../../components/Countdown';
import {EndCard} from '../../components/EndCard';
import {TitleCard} from '../../components/TitleCard';
import {castState} from '../../lib/castState';
import {H, SFX, W} from '../../lib/tokens';
import {DEFAULT_PAD_BEFORE, FPS, lineDuration, sceneSeconds} from '../../lib/timing';
import {BACKGROUNDS} from '../../registry/backgrounds';
import {CAST} from '../../registry/cast';
import {PROPS} from '../../registry/props';
import type {Episode, Scene as SceneT} from '../../types';

const FLIP_FRAMES = 6; // a facing change squashes through 0 over this many frames
const FREEZE_FILTER = 'saturate(0.35) contrast(1.05)';

export const Scene: React.FC<{ep: Episode; scene: SceneT}> = ({ep, scene}) => {
	const frame = useCurrentFrame();
	const t = frame / FPS;
	const padBefore = scene.padBefore ?? DEFAULT_PAD_BEFORE;
	const lineSec = lineDuration(ep, scene);
	const tLine = t - padBefore;
	// Not clamped above 1: keys and bubbles with at > 1 land in the pause after the line.
	const p = Math.max(0, tLine / lineSec);
	const timing = ep.timing?.[scene.id];
	const Bg = BACKGROUNDS[scene.bg] ?? BACKGROUNDS.card;
	const isFreeze = scene.type === 'freeze';
	const countdownStart = lineSec + (scene.padAfter ?? 0);
	const atFrame = (at: number) => Math.round((padBefore + at * lineSec) * FPS);

	const cam = scene.camera ?? {};
	const zoom = interpolate(t, [0, sceneSeconds(ep, scene)], [cam.from ?? 1, cam.to ?? cam.from ?? 1]);

	return (
		<AbsoluteFill style={{overflow: 'hidden'}}>
			<AbsoluteFill
				style={{
					transform: `scale(${zoom})`,
					transformOrigin: `${cam.x ?? W / 2}px ${cam.y ?? H / 2}px`,
					filter: isFreeze && tLine > lineSec ? FREEZE_FILTER : undefined,
				}}
			>
				<svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute'}}>
					<Bg frame={frame} />
					{(scene.props ?? []).map((pr, i) => {
						const P = PROPS[pr.type];
						if (!P || (pr.at !== undefined && p < pr.at)) return null;
						return (
							<g key={i} transform={`translate(${pr.x} ${pr.y}) scale(${pr.scale ?? 1})`}>
								<P frame={frame} />
							</g>
						);
					})}
					{(scene.cast ?? []).map((m, i) => {
						const look = CAST[m.who];
						if (!look) return null;
						const st = castState(m, p, lineSec, FPS);
						const bob = st.walking ? -Math.abs(Math.sin(frame / 3.2)) * 14 : st.action === 'bounce' ? -Math.abs(Math.sin(frame / 5)) * 30 : 0;
						const rot = st.action === 'wobble' ? Math.sin(frame / 6) * 5 : st.action === 'shake' ? Math.sin(frame * 2.2) * 3 : 0;
						const flip =
							st.framesSinceFlip < FLIP_FRAMES ? interpolate(st.framesSinceFlip, [0, FLIP_FRAMES / 2, FLIP_FRAMES], [-st.facing, 0, st.facing]) : st.facing;
						const s = m.scale ?? 1;
						return (
							<g key={i} transform={`translate(${st.x} ${m.y + bob}) rotate(${rot}) scale(${s * flip} ${s})`}>
								{/* offset each member's idle phase so a crowd doesn't breathe in sync */}
								<Character look={look} pose={st.pose} expr={st.expr} gaze={st.look} frame={frame + i * 17} walking={st.walking} />
							</g>
						);
					})}
				</svg>
				{(scene.bubbles ?? []).map((b, i) => {
					const f = atFrame(b.at ?? 0);
					return frame >= f ? <Bubble key={i} item={b} frame={frame - f} /> : null;
				})}
			</AbsoluteFill>

			{scene.title ? <TitleCard text={scene.title} frame={frame} /> : null}
			{scene.type === 'endcard' && scene.a && scene.b ? <EndCard a={scene.a} b={scene.b} prompt={scene.prompt} footer={scene.footer} frame={frame} /> : null}
			{isFreeze && scene.countdown ? <Countdown seconds={scene.countdown} t={tLine} start={countdownStart} /> : null}
			{timing && scene.showCaptions !== false ? <Captions cues={timing.cues} t={tLine} /> : null}

			{timing ? (
				<Sequence from={Math.round(padBefore * FPS)}>
					<Html5Audio src={staticFile(timing.audio)} />
				</Sequence>
			) : null}
			{(scene.bubbles ?? []).map((b, i) => (
				<Sequence key={`pop${i}`} from={atFrame(b.at ?? 0)} durationInFrames={FPS}>
					<Html5Audio src={staticFile(SFX.pop)} volume={0.5} />
				</Sequence>
			))}
			{isFreeze && scene.countdown
				? Array.from({length: scene.countdown}, (_, i) => (
						<Sequence key={`tick${i}`} from={Math.round((padBefore + countdownStart + i) * FPS)} durationInFrames={FPS}>
							<Html5Audio src={staticFile(SFX.tick)} volume={0.6} />
						</Sequence>
					))
				: null}
		</AbsoluteFill>
	);
};
