import React from 'react';
import {AbsoluteFill, Html5Audio, Sequence, interpolate, spring, staticFile, useCurrentFrame} from 'remotion';
import {Bubble} from '../../components/Bubble';
import {Countdown} from '../../components/Countdown';
import {castState} from '../../lib/castState';
import {brokenFor, ruleBreaks} from '../../lib/rules';
import {H, SFX, W} from '../../lib/tokens';
import {FPS, lineDuration, padAfter, padBefore as padBeforeOf, sceneSeconds} from '../../lib/timing';
import type {Episode, Scene} from '../../types';
import {CAST2} from '../../v2/cast';
import {Character2, torchLens} from '../../v2/Character';
import {ENVIRONMENTS} from '../../v2/Forest';
import {PROPS2} from '../../v2/props';
import {Beam, Captions2, Chip, EndCard2, Film, IntroCard, RulesCard} from '../../v2/ui';

const FLIP_FRAMES = 6;
const FADE_FRAMES = 8;
const WHIP_FRAMES = 7;
const FREEZE_FILTER = 'saturate(0.25) brightness(0.8) contrast(1.1)';
const BACKDROP_FILTER = 'blur(10px) brightness(0.55)'; // behind full-screen cards (rules, end card)
const POSE_SPRING = {damping: 11, stiffness: 170}; // slight overshoot = arms settle, not snap
// Reaction impulse over frames since an expression change: anticipation squash, pop stretch, settle.
const REACT_FRAMES = [0, 3, 8, 14, 20];
const REACT_SHAPE = [0, 0.07, -0.05, 0.015, 0];
// Handheld drift: sum of slow incommensurate sines (smooth, never repeats visibly).
const HIT_SEC = 0.5; // a jolt dies out over this long
const HIT_PX = 26; // default jolt strength
const HANDHELD_PX = 5;
const HANDHELD_DEG = 0.25;
const handheld = (f: number) => ({
	x: (Math.sin(f / 37) + 0.6 * Math.sin(f / 23 + 1.3)) * HANDHELD_PX,
	y: (Math.sin(f / 41 + 2.1) + 0.6 * Math.sin(f / 29)) * HANDHELD_PX,
	r: Math.sin(f / 53 + 0.7) * HANDHELD_DEG,
});

export const SceneV2: React.FC<{ep: Episode; scene: Scene; index: number}> = ({ep, scene, index}) => {
	const frame = useCurrentFrame();
	const t = frame / FPS;
	const padBefore = padBeforeOf(ep, scene);
	const lineSec = lineDuration(ep, scene);
	const tLine = t - padBefore;
	const p = tLine / lineSec;
	const timing = ep.timing?.[scene.id];
	const Env = ENVIRONMENTS[scene.bg] ?? ENVIRONMENTS.dark;
	const isFreeze = scene.type === 'freeze';
	const isEnd = scene.type === 'endcard';
	const countdownStart = lineSec + padAfter(ep, scene);
	const atFrame = (at: number) => Math.round((padBefore + at * lineSec) * FPS);

	const cam = scene.camera ?? {};
	const zoom = interpolate(t, [0, sceneSeconds(ep, scene)], [cam.from ?? 1, cam.to ?? cam.from ?? 1]);
	const shake = (scene.shake ?? 0) * (isFreeze && tLine > lineSec ? 0 : 1);
	const hh = handheld(frame);
	// Jolts: fast oscillation under an exponential-ish decay from each hit moment.
	const jolt = (scene.hits ?? []).reduce((amp, h) => {
		const dt = tLine - h.at * lineSec;
		return dt < 0 || dt > HIT_SEC ? amp : amp + (h.strength ?? HIT_PX) * (1 - dt / HIT_SEC) ** 2;
	}, 0);
	const sx = hh.x + (shake ? Math.sin(frame * 1.9) * shake : 0) + Math.sin(frame * 3.1) * jolt;
	const sy = hh.y + (shake ? Math.cos(frame * 2.3) * shake : 0) + Math.cos(frame * 3.7) * jolt * 0.7;
	const enter =
		scene.transition === 'whip'
			? {transform: `translateX(${interpolate(frame, [0, WHIP_FRAMES], [W * 0.6, 0], {extrapolateRight: 'clamp'})}px)`, filter: `blur(${interpolate(frame, [0, WHIP_FRAMES], [40, 0], {extrapolateRight: 'clamp'})}px)`}
			: scene.transition === 'cut'
				? {}
				: {opacity: interpolate(frame, [0, FADE_FRAMES], [0, 1], {extrapolateRight: 'clamp'})};

	const breaks = ruleBreaks(ep);
	const rules = (ep.rules?.items ?? []).map((text, i) => {
		const age = brokenFor(breaks[i], index, p, lineSec);
		return {text, broken: age !== null, brokenAge: age ?? 0};
	});
	const revealed = scene.rulesView === 'big' && scene.reveal ? Math.min(rules.length, Math.floor(Math.max(0, p) * scene.reveal) + 1) : rules.length;

	const beams: React.ReactNode[] = [];
	const cast = (scene.cast ?? []).map((m, i) => {
		const look = CAST2[m.who];
		if (!look) return null;
		const st = castState(m, p, lineSec, FPS);
		const rot = st.action === 'wobble' ? Math.sin(frame / 6) * 4 : st.action === 'shake' ? Math.sin(frame * 2.2) * 2.5 : 0;
		const flip = st.framesSinceFlip < FLIP_FRAMES ? interpolate(st.framesSinceFlip, [0, FLIP_FRAMES / 2, FLIP_FRAMES], [-st.facing, 0, st.facing]) : st.facing;
		const s = m.scale ?? 1;
		const poseBlend = Number.isFinite(st.framesSincePose) ? spring({frame: Math.max(0, st.framesSincePose), fps: FPS, config: POSE_SPRING}) : 1;
		const react = Number.isFinite(st.framesSinceExpr) ? interpolate(st.framesSinceExpr, REACT_FRAMES, REACT_SHAPE, {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) : 0;
		if (m.torch) {
			const lens = torchLens();
			const flicker = 0.85 + 0.15 * Math.sin(frame * 0.9) * Math.sin(frame * 0.37);
			beams.push(
				<Beam key={`beam${i}`} x={st.x + lens.x * s * flip} y={m.y + lens.y * s} angle={st.facing > 0 ? lens.angle : 180 - lens.angle} flicker={flicker} />,
			);
		}
		return (
			<g key={i} transform={`translate(${st.x} ${m.y}) rotate(${rot}) scale(${s * flip} ${s})`}>
				<Character2 look={look} pose={st.pose} poseFrom={st.poseFrom} poseBlend={poseBlend} react={react} expr={st.expr} turn={st.turn} frame={frame + i * 17} walking={st.walking} torch={m.torch} />
			</g>
		);
	});

	return (
		<AbsoluteFill style={{overflow: 'hidden', background: '#000'}}>
			<AbsoluteFill style={{...enter}}>
				<AbsoluteFill
					style={{
						transform: `translate(${sx}px, ${sy}px) rotate(${hh.r}deg) scale(${zoom * 1.02})`, // 2% overscan hides the drift's edges
						transformOrigin: `${cam.x ?? W / 2}px ${cam.y ?? H / 2}px`,
						filter: isFreeze && tLine > lineSec ? FREEZE_FILTER : isEnd || scene.rulesView === 'big' ? BACKDROP_FILTER : undefined,
					}}
				>
					<svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute'}}>
						<Env frame={frame} scroll={scene.scroll ?? 0} fireflies={scene.fireflies ?? true} density={scene.density ?? 1} />
						{(scene.props ?? []).map((pr, i) => {
							const P = PROPS2[pr.type];
							if (!P || (pr.at !== undefined && p < pr.at)) return null;
							const fade = pr.at !== undefined ? interpolate((p - pr.at) * lineSec, [0, 0.6], [0, 1], {extrapolateRight: 'clamp'}) : 1;
							return (
								<g key={i} transform={`translate(${pr.x} ${pr.y}) scale(${pr.scale ?? 1})`} opacity={fade}>
									<P frame={frame} />
								</g>
							);
						})}
						{cast}
					</svg>
					{beams}
					{(scene.bubbles ?? []).map((b, i) => {
						const f = atFrame(b.at ?? 0);
						return frame >= f ? <Bubble key={i} item={b} frame={frame - f} /> : null;
					})}
				</AbsoluteFill>
				<Film frame={frame} vignette={isFreeze ? 0.92 : 0.75} />
			</AbsoluteFill>

			{scene.chip ? <Chip text={scene.chip} /> : null}
			{scene.intro && p >= (scene.intro.at ?? 0) ? <IntroCard name={scene.intro.name} trait={scene.intro.trait} frame={frame - atFrame(scene.intro.at ?? 0)} /> : null}
			{ep.rules && scene.rulesView ? <RulesCard title={ep.rules.title} rules={rules} big={scene.rulesView === 'big'} frame={frame} revealed={revealed} /> : null}
			{isEnd && scene.a && scene.b ? <EndCard2 a={scene.a} b={scene.b} prompt={scene.prompt} footer={scene.footer} frame={frame} /> : null}
			{isFreeze && scene.countdown ? <Countdown seconds={scene.countdown} t={tLine} start={countdownStart} /> : null}
			{timing && scene.showCaptions !== false ? <Captions2 cues={timing.cues} t={tLine} /> : null}

			{timing ? (
				<Sequence from={Math.round(padBefore * FPS)}>
					<Html5Audio src={staticFile(timing.audio)} />
				</Sequence>
			) : null}
			{(scene.bubbles ?? []).map((b, i) => (
				<Sequence key={`pop${i}`} from={atFrame(b.at ?? 0)} durationInFrames={FPS}>
					<Html5Audio src={staticFile(SFX.pop)} volume={0.35} />
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
