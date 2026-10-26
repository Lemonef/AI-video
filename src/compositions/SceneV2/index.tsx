import React from 'react';
import {AbsoluteFill, Html5Audio, Sequence, interpolate, spring, staticFile, useCurrentFrame} from 'remotion';
import {Bubble} from '../../components/Bubble';
import {Countdown} from '../../components/Countdown';
import {castState} from '../../lib/castState';
import {bubbleSize, placeBox, type Rect} from '../../lib/layout';
import {cueAt} from '../../lib/cueAt';
import {brokenFor, ruleBreaks} from '../../lib/rules';
import {CAPTION_TOP, H, SAFE, SFX, W} from '../../lib/tokens';
import {FPS, lineDuration, padAfter, padBefore as padBeforeOf, sceneSeconds} from '../../lib/timing';
import type {Episode, Scene} from '../../types';
import {CAST2} from '../../v2/cast';
import {Character2, torchLens} from '../../v2/Character';
import {ENVIRONMENTS} from '../../v2/Forest';
import {CAST5} from '../../v5/cast';
import {Character5, torchLens5} from '../../v5/Character';
import {ENV5} from '../../v5/Forest';
import {PROPS2} from '../../v2/props';
import {STEP_EVERY_FRAMES, sfxFile} from '../../v2/sound';
import {Beam, BigTitle, Bokeh, Captions2, ChoiceMap, Chip, EndCard2, Film, IntroCard, LightPool, Rain, RulesCard, RulesMini, StatCard} from '../../v2/ui';

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
const V3_GRADE = 'saturate(0.82) contrast(1.08)'; // v3: cooler, moodier; the torch stays the only warm accent
const V3_DUST = 26;
const V4_WORLD_GRADE = 'saturate(0.5) brightness(0.8) contrast(1.15)'; // near-monochrome night; light sources stay bright (drawn after)
const HALO_OPACITY = 0.55; // soft fog-light behind each figure so a dark silhouette always reads
const TINT_FADE_SEC = 0.35;
const INTRO_BELOW_TITLE = 580; // v4 hook: the two-line big title ends ≈ SAFE.top + 120 + 2 × 101; the name card sits under it
const POOL_REACH = 0.85; // the beam's ground pool sits this far along the beam's floor hit
const OVERSCAN = 1.02; // 2% overscan hides the drift's edges
const SCREEN: Rect = {x: SAFE.left, y: SAFE.top, w: SAFE.right - SAFE.left, h: SAFE.bottom - SAFE.top};
const SHOT_PUSH = 1.04; // each cut keeps creeping in, so a held shot never feels static
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
	const isFreeze = scene.type === 'freeze';
	const isEnd = scene.type === 'endcard';
	const v5 = ep.style === 'v5';
	const v6 = ep.style === 'v6';
	const v4 = ep.style === 'v4';
	const v3 = ep.style === 'v3' || v4 || v5 || v6; // later styles include every v3 feature
	const Env = (v5 || v6 ? ENV5[scene.bg] : undefined) ?? ENVIRONMENTS[scene.bg] ?? ENVIRONMENTS.dark;
	const countdownStart = scene.countdownAt === undefined ? lineSec + padAfter(ep, scene) : scene.countdownAt * lineSec;
	const atFrame = (at: number) => Math.round((padBefore + at * lineSec) * FPS);
	const at = (cue: {at?: number; word?: string}) => cueAt(cue, timing, lineSec);

	const shot = [...(scene.shots ?? [])].reverse().find((s) => p >= at(s));
	const cam = shot ? {from: shot.zoom, to: shot.zoom * SHOT_PUSH, x: shot.x, y: shot.y} : scene.camera ?? {};
	const camStart = shot ? padBefore + at(shot) * lineSec : 0;
	const zoom = interpolate(t, [camStart, sceneSeconds(ep, scene)], [cam.from ?? 1, cam.to ?? cam.from ?? 1], {extrapolateLeft: 'clamp'});
	const shake = (scene.shake ?? 0) * (isFreeze && tLine > lineSec ? 0 : 1);
	const hh = ep.handheld ?? !v6 ? handheld(frame) : {x: 0, y: 0, r: 0};
	// Jolts: fast oscillation under an exponential-ish decay from each hit moment.
	const jolt = (scene.hits ?? []).reduce((amp, h) => {
		const dt = tLine - at(h) * lineSec;
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

	const reserved: Rect[] = [
		{x: SAFE.left, y: CAPTION_TOP + 20, w: SAFE.right - SAFE.left, h: 190}, // captions band
		...(scene.chip && !v4 ? [{x: SAFE.right - 440, y: SAFE.top, w: 440, h: 80}] : []),
		...(scene.rulesView === 'hud' && !v4 ? [{x: SAFE.left - 20, y: SAFE.top + 50, w: 430, h: 270}] : []), // card is scaled 0.42 and tilted: generous margin
		...(scene.rulesView === 'hud' && v4 ? [{x: SAFE.left, y: SAFE.top, w: 320, h: 120}] : []),
		...((v4 || v6) && scene.title ? [{x: SAFE.left, y: SAFE.top + 110, w: SAFE.right - SAFE.left, h: 250}] : []),
		...(scene.intro ? [{x: SAFE.left, y: (v4 || v6) && scene.title ? INTRO_BELOW_TITLE : SAFE.top + 120, w: 620, h: 170}] : []),
		...(scene.countdown ? [{x: W / 2 - 170, y: SAFE.top + 40, w: 340, h: 340}] : []),
	];
	const breaks = ruleBreaks(ep);
	const rules = (ep.rules?.items ?? []).map((text, i) => {
		const age = brokenFor(breaks[i], index, p, lineSec);
		return {text, broken: age !== null, brokenAge: age ?? 0};
	});
	const revealed = scene.rulesView === 'big' && scene.reveal ? Math.min(rules.length, Math.floor(Math.max(0, p) * scene.reveal) + 1) : rules.length;

	const beams: React.ReactNode[] = [];
	const pools: React.ReactNode[] = [];
	const cast = (scene.cast ?? []).map((m, i) => {
		const look5 = v5 ? CAST5[m.who] : undefined;
		const look = CAST2[m.who];
		if (!look && !look5) return null;
		const st = castState(m, p, lineSec, FPS);
		const rot = st.action === 'wobble' ? Math.sin(frame / 6) * 4 : st.action === 'shake' ? Math.sin(frame * 2.2) * 2.5 : 0;
		const flip = st.framesSinceFlip < FLIP_FRAMES ? interpolate(st.framesSinceFlip, [0, FLIP_FRAMES / 2, FLIP_FRAMES], [-st.facing, 0, st.facing]) : st.facing;
		const s = m.scale ?? 1;
		const poseBlend = Number.isFinite(st.framesSincePose) ? spring({frame: Math.max(0, st.framesSincePose), fps: FPS, config: POSE_SPRING}) : 1;
		const react = Number.isFinite(st.framesSinceExpr) ? interpolate(st.framesSinceExpr, REACT_FRAMES, REACT_SHAPE, {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) : 0;
		if (m.torch) {
			const lens = look5 ? torchLens5() : torchLens();
			if (v4) {
				const ly = m.y + lens.y * s;
				const rad = ((st.facing > 0 ? lens.angle : 180 - lens.angle) * Math.PI) / 180;
				const reach = Math.sin(rad) > 0.05 ? ((m.y - ly) / Math.sin(rad)) * POOL_REACH : 600;
				pools.push(<LightPool key={`pool${i}`} x={st.x + lens.x * s * flip + Math.cos(rad) * reach} y={m.y - 10} flicker={0.9} />);
			}
			const flicker = 0.85 + 0.15 * Math.sin(frame * 0.9) * Math.sin(frame * 0.37);
			beams.push(
				<Beam key={`beam${i}`} x={st.x + lens.x * s * flip} y={m.y + lens.y * s} angle={st.facing > 0 ? lens.angle : 180 - lens.angle} flicker={flicker} dust={v3 ? V3_DUST : 0} frame={frame} />,
			);
		}
		return (
			<g key={i} transform={`translate(${st.x} ${m.y}) rotate(${rot}) scale(${s * flip} ${s})`}>
				{look5 ? (
					<Character5 look={look5} pose={st.pose} poseFrom={st.poseFrom} poseBlend={poseBlend} react={react} expr={st.expr} turn={st.turn} frame={frame + i * 17} walking={st.walking} torch={m.torch} />
				) : (
					<Character2 look={look!} pose={st.pose} poseFrom={st.poseFrom} poseBlend={poseBlend} react={react} expr={st.expr} turn={st.turn} frame={frame + i * 17} walking={st.walking} torch={m.torch} />
				)}
			</g>
		);
	});

	return (
		<AbsoluteFill style={{overflow: 'hidden', background: '#000'}}>
			<AbsoluteFill style={{...enter}}>
				<AbsoluteFill
					style={{
						transform: `translate(${sx}px, ${sy}px) rotate(${hh.r}deg) scale(${zoom * OVERSCAN})`,
						transformOrigin: `${cam.x ?? W / 2}px ${cam.y ?? H / 2}px`,
						filter: [isFreeze && tLine > lineSec ? FREEZE_FILTER : isEnd || scene.rulesView === 'big' ? BACKDROP_FILTER : '', v3 ? V3_GRADE : ''].join(' ').trim() || undefined,
					}}
				>
					<svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', filter: v4 ? V4_WORLD_GRADE : v6 ? scene.grade : undefined}}>
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
						{v4
							? (scene.cast ?? []).map((m, i) => (
									<ellipse key={`halo${i}`} cx={castState(m, p, lineSec, FPS).x} cy={m.y - 480 * (m.scale ?? 1)} rx={330 * (m.scale ?? 1)} ry={560 * (m.scale ?? 1)} fill="url(#halo)" opacity={HALO_OPACITY} />
								))
							: null}
						{v4
							? (scene.props ?? [])
									.filter((pr) => pr.type === 'watcher' && (pr.at === undefined || p >= pr.at))
									.map((pr, i) => <ellipse key={`phalo${i}`} cx={pr.x} cy={pr.y - 320 * (pr.scale ?? 1)} rx={220} ry={460} fill="url(#halo)" opacity={HALO_OPACITY * 0.8} />)
							: null}
						{v4 ? (
							<defs>
								<radialGradient id="halo">
									<stop offset="0" stopColor="#6F86B3" stopOpacity={0.9} />
									<stop offset="1" stopColor="#6F86B3" stopOpacity={0} />
								</radialGradient>
							</defs>
						) : null}
						{cast}
					</svg>
					{pools}
					{beams}
				</AbsoluteFill>
				{v3 && scene.rain ? <Rain frame={frame} /> : null}
				{v4 ? <Bokeh frame={frame} /> : null}
				<Film frame={frame} vignette={isFreeze ? 0.92 : 0.75} />
				{(v4 || v6) && scene.tint ? (
					<AbsoluteFill
						style={{
							background: scene.tint.color,
							mixBlendMode: 'multiply',
							opacity: (scene.tint.strength ?? 0.75) * interpolate(tLine - (scene.tint.at ?? 0) * lineSec, [0, TINT_FADE_SEC], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
						}}
					/>
				) : null}
				{v4 && scene.blackout && tLine >= scene.blackout.at * lineSec && tLine < scene.blackout.at * lineSec + scene.blackout.sec ? <AbsoluteFill style={{background: '#000'}} /> : null}
			</AbsoluteFill>

			{scene.chip && !v4 ? <Chip text={scene.chip} /> : null}
			{(v4 || v6) && scene.title ? <BigTitle text={scene.title} frame={frame} /> : null}
			{scene.intro && p >= (scene.intro.at ?? 0) ? <IntroCard name={scene.intro.name} trait={scene.intro.trait} frame={frame - atFrame(scene.intro.at ?? 0)} top={(v4 || v6) && scene.title ? INTRO_BELOW_TITLE : undefined} /> : null}
			{ep.rules && scene.rulesView && !(v4 && scene.rulesView === 'hud') ? <RulesCard title={ep.rules.title} rules={rules} big={scene.rulesView === 'big'} frame={frame} revealed={revealed} /> : null}
			{v4 && ep.rules && scene.rulesView === 'hud' ? <RulesMini rules={rules} chip={scene.chip} /> : null}
			{scene.stat && p >= (scene.stat.at ?? 0) ? <StatCard value={scene.stat.value} label={scene.stat.label} frame={frame - atFrame(scene.stat.at ?? 0)} /> : null}
			{isEnd && scene.a && scene.b ? (
				scene.choices ? (
					<ChoiceMap a={scene.a} b={scene.b} at={scene.choices} title={ep.title} prompt={scene.prompt} footer={scene.footer} frame={frame} />
				) : (
					<EndCard2 a={scene.a} b={scene.b} prompt={scene.prompt} footer={scene.footer} frame={frame} />
				)
			) : null}
			{scene.countdown ? <Countdown seconds={scene.countdown} t={tLine} start={countdownStart} /> : null}
			{timing && scene.showCaptions !== false ? <Captions2 cues={timing.cues} t={tLine} /> : null}
			{(scene.bubbles ?? []).map((b, i) => {
				const f = atFrame(at(b));
				if (frame < f) return null;
				// project the world anchor through the camera, then keep the bubble on screen and off the UI
				const z = zoom * OVERSCAN;
				const ox = cam.x ?? W / 2;
				const oy = cam.y ?? H / 2;
				const size = bubbleSize(b.text, b.label);
				const box = placeBox(ox + (b.x - ox) * z + sx, oy + (b.y - oy) * z + sy, size.w, size.h, SCREEN, reserved);
				return <Bubble key={i} item={{...b, x: box.x + box.w / 2, y: box.y + box.h}} frame={frame - f} />;
			})}

			{timing ? (
				<Sequence from={Math.round(padBefore * FPS)}>
					<Html5Audio src={staticFile(timing.audio)} />
				</Sequence>
			) : null}
			{(scene.bubbles ?? []).map((b, i) => (
				<Sequence key={`pop${i}`} from={atFrame(at(b))} durationInFrames={FPS}>
					<Html5Audio src={staticFile(SFX.pop)} volume={0.35} />
				</Sequence>
			))}
			{ep.mix ? <Foley scene={scene} real={!!ep.mix.real} atFrame={(c) => atFrame(at(c))} totalFrames={Math.ceil(sceneSeconds(ep, scene) * FPS)} /> : null}
			{scene.countdown
				? Array.from({length: scene.countdown}, (_, i) => (
						<Sequence key={`tick${i}`} from={Math.round((padBefore + countdownStart + i) * FPS)} durationInFrames={FPS}>
							<Html5Audio src={staticFile(SFX.tick)} volume={0.6} />
						</Sequence>
					))
				: null}
		</AbsoluteFill>
	);
};

const HIT_VOLUME_PER_PX = 1 / 30; // impact loudness follows the jolt strength
const HIT_SOUND_MIN = 20; // weaker jolts stay silent: not every bump deserves a sound
const ONE_SHOT_FRAMES = FPS * 3;

/** v3 sound cues: authored `sfx`, plus automatic impacts on hits, footsteps while walking, swishes on cuts. */
const Foley: React.FC<{scene: Scene; real: boolean; atFrame: (cue: {at?: number; word?: string}) => number; totalFrames: number}> = ({scene, real, atFrame, totalFrames}) => {
	const cues: Array<{from: number; sound: string; volume: number; rate?: number}> = [];
	(scene.sfx ?? []).forEach((c) => cues.push({from: atFrame(c), sound: c.sound, volume: c.volume ?? 0.8, rate: c.rate}));
	(scene.hits ?? []).forEach((h) => {
		const strength = h.strength ?? 26;
		const sound = h.sound ?? (strength >= HIT_SOUND_MIN ? 'impact' : '');
		if (sound) cues.push({from: atFrame(h), sound, volume: Math.min(1, strength * HIT_VOLUME_PER_PX)});
	});
	// Cuts are silent (as in film) unless a shot names its sound.
	(scene.shots ?? []).forEach((s) => {
		if (s.sound) cues.push({from: atFrame(s), sound: s.sound, volume: 0.45});
	});
	if (scene.transition === 'whip') cues.push({from: 0, sound: 'swish', volume: 0.5});
	// recorded footsteps come in as a bed (`steps`); synthetic ones are placed per footfall
	const walker = real ? undefined : (scene.cast ?? []).find((m) => m.action === 'walk');
	if (walker) {
		// walking lasts until a key switches it off (same rule as castState)
		const stop = (walker.keys ?? []).find((k) => k.action && k.action !== 'walk');
		const end = stop ? atFrame(stop) : totalFrames;
		for (let f = Math.max(0, atFrame({at: 0})); f < end; f += STEP_EVERY_FRAMES) cues.push({from: f, sound: 'step', volume: 0.32});
	}
	return (
		<>
			{cues.map((c, i) => (
				<Sequence key={`fx${i}`} from={Math.max(0, c.from)} durationInFrames={ONE_SHOT_FRAMES}>
					<Html5Audio src={staticFile(sfxFile(c.sound, real))} volume={c.volume} playbackRate={c.rate ?? 1} />
				</Sequence>
			))}
		</>
	);
};
