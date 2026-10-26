import type {Episode, Scene} from '../types';
import {FPS, padBefore, sceneFrames} from '../lib/timing';

// Files written by scripts/pipeline/foley.py (+ the v1/v2 pop/tick/whoosh by sfx.py).
export const sfxFile = (name: string) => `sfx/${name}.wav`;

export const BED_FADE_SEC = 0.4; // bed level glides between scenes instead of jumping
export const DUCK_ATTACK_SEC = 0.08;
export const DUCK_RELEASE_SEC = 0.35;
// Character2's walk swings with sin(frame / 3.4): period 2π·3.4 frames, two footfalls per period.
export const STEP_EVERY_FRAMES = Math.round(Math.PI * 3.4);

export type SceneSpan = {scene: Scene; from: number; frames: number};

export const sceneSpans = (ep: Episode): SceneSpan[] => {
	let from = 0;
	return ep.scenes.map((scene) => {
		const frames = sceneFrames(ep, scene);
		const span = {scene, from, frames};
		from += frames;
		return span;
	});
};

/** Episode frames during which the narrator is speaking (from Whisper/engine word timings). */
export const speechMask = (ep: Episode, spans: SceneSpan[]): Array<[number, number]> =>
	spans.flatMap(({scene, from}) => {
		const words = ep.timing?.[scene.id]?.words ?? [];
		const lead = padBefore(ep, scene);
		return words.map((w): [number, number] => [from + (lead + w.start) * FPS, from + (lead + w.end) * FPS]);
	});

/** 1 while speaking, easing to 0 between words: attack fast, release slow (a sidechain compressor's shape). */
export const speechEnvelope = (mask: Array<[number, number]>, frame: number): number => {
	let v = 0;
	for (const [a, b] of mask) {
		if (frame >= a - DUCK_ATTACK_SEC * FPS && frame <= b + DUCK_RELEASE_SEC * FPS) {
			const rise = Math.min(1, (frame - (a - DUCK_ATTACK_SEC * FPS)) / (DUCK_ATTACK_SEC * FPS));
			const fall = frame <= b ? 1 : 1 - (frame - b) / (DUCK_RELEASE_SEC * FPS);
			v = Math.max(v, Math.min(rise, fall));
		}
	}
	return v;
};

/** Level of `bed` at an episode frame, gliding over BED_FADE_SEC after each scene boundary. */
export const bedLevel = (spans: SceneSpan[], bed: string, frame: number): number => {
	const i = Math.max(0, spans.findIndex((s) => frame >= s.from && frame < s.from + s.frames));
	const cur = spans[i]?.scene.beds?.[bed] ?? 0;
	if (i === 0) return cur;
	const prev = spans[i - 1].scene.beds?.[bed] ?? 0;
	const k = Math.min(1, (frame - spans[i].from) / (BED_FADE_SEC * FPS));
	return prev + (cur - prev) * k;
};

