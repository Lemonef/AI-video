import {cueAt} from '../lib/cueAt';
import {FPS, lineDuration, padBefore, sceneFrames} from '../lib/timing';
import type {Episode, Scene} from '../types';

// Synthetic files from scripts/pipeline/foley.py (+ v1/v2 pop/tick/whoosh by sfx.py), or, with
// mix.real, the recorded CC0 library from scripts/pipeline/freesound.py under the same names.
const REAL: Record<string, string> = {
	crickets: 'forest_night',
	wind: 'wind',
	rain: 'rain',
	drone: 'dark_drone',
	steps: 'steps_leaves',
	impact: 'hit',
	boom: 'boom',
	stinger: 'stinger',
	swish: 'whoosh',
	whoosh: 'whoosh',
	riser: 'riser',
	heartbeat: 'heartbeat',
	click: 'flashlight_click',
};
export const sfxFile = (name: string, real = false) => (real && REAL[name] ? `sfx/real/${REAL[name]}.mp3` : `sfx/${name}.wav`);

export const BED_FADE_SEC = 0.4; // bed level glides between scenes instead of jumping
export const DUCK_ATTACK_SEC = 0.08;
export const DUCK_RELEASE_SEC = 0.35;
// Character2 takes two steps per 1.2-second gait cycle.
export const STEP_EVERY_FRAMES = 18;

export type SceneSpan = {scene: Scene; from: number; frames: number; switchAt: number; fade: number; waits?: string[]};

export const sceneSpans = (ep: Episode): SceneSpan[] => {
	let from = 0;
	return ep.scenes.map((scene) => {
		const frames = sceneFrames(ep, scene);
		const lineSec = lineDuration(ep, scene);
		const switchAt = scene.bedsAt
			? from + Math.round((padBefore(ep, scene) + cueAt(scene.bedsAt, ep.timing?.[scene.id], lineSec) * lineSec) * FPS)
			: from - Math.round((scene.bedsLead ?? 0) * FPS); // J-cut: sound of the next scene arrives first
		const span = {scene, from, frames, switchAt, fade: (scene.bedsFade ?? BED_FADE_SEC) * FPS, waits: scene.bedsAt?.only};
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

/** Level of `bed` at an episode frame. Each scene's levels take over at its switch moment
 * (scene start, or a spoken word via bedsAt) and glide in over its fade. */
export const bedLevel = (spans: SceneSpan[], bed: string, frame: number): number => {
	const level = (i: number) => spans[i]?.scene.beds?.[bed] ?? 0;
	const at = (s: SceneSpan) => (!s.waits || s.waits.includes(bed) ? s.switchAt : s.from);
	const fade = (s: SceneSpan) => (!s.waits || s.waits.includes(bed) ? s.fade : BED_FADE_SEC * FPS);
	let i = spans.length - 1;
	while (i > 0 && frame < at(spans[i])) i--;
	if (i === 0 && frame < at(spans[0])) return level(0);
	const k = fade(spans[i]) > 0 ? Math.min(1, (frame - at(spans[i])) / fade(spans[i])) : 1;
	return i === 0 ? level(0) : level(i - 1) + (level(i) - level(i - 1)) * k;
};


export const HUSH_FLOOR = 0.04; // "silence" keeps a breath of air: true digital silence sounds like a glitch
const HUSH_EDGE_SEC = 0.12;

/** Episode-frame windows where every bed drops to HUSH_FLOOR (silence before a hit). */
export const hushWindows = (ep: Episode, spans: SceneSpan[]): Array<[number, number]> =>
	spans.flatMap(({scene, from}) => {
		if (!scene.hush) return [];
		const lineSec = lineDuration(ep, scene);
		const wordAt = from + (padBefore(ep, scene) + cueAt({word: scene.hush.word}, ep.timing?.[scene.id], lineSec) * lineSec) * FPS;
		const lead = (scene.hush.lead ?? 0.7) * FPS;
		return [[wordAt - lead, wordAt + (scene.hush.hold ?? 0.2) * FPS] as [number, number]];
	});

/** 1 normally, easing to HUSH_FLOOR inside a hush window. */
export const hushLevel = (windows: Array<[number, number]>, frame: number): number => {
	const edge = HUSH_EDGE_SEC * FPS;
	let v = 1;
	for (const [a, b] of windows) {
		if (frame < a - edge || frame > b + edge) continue;
		const inside = frame < a ? (frame - (a - edge)) / edge : frame > b ? 1 - (frame - b) / edge : 1;
		v = Math.min(v, 1 - (1 - HUSH_FLOOR) * Math.max(0, Math.min(1, inside)));
	}
	return v;
};
