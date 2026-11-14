import type {Episode, Scene} from '../types';

export const FPS = 30;
// Per-line voicing (edge) has no breath between clips, so silence is added around each line.
// A whole take (gemini) already contains the narrator's own pauses, so nothing is added.
const PAD_BEFORE = {line: 0.25, take: 0};
const PAD_AFTER = {line: 0.5, take: 0};
// Before TTS runs (Studio preview), estimate Thai speech at this many characters per second.
const EST_CHARS_PER_SEC = 13;

const mode = (ep: Episode) => (ep.take ? 'take' : 'line');

export const padBefore = (ep: Episode, s: Scene) => s.padBefore ?? PAD_BEFORE[mode(ep)];
export const padAfter = (ep: Episode, s: Scene) => s.padAfter ?? PAD_AFTER[mode(ep)];

export const lineDuration = (ep: Episode, s: Scene) => ep.timing?.[s.id]?.duration ?? Math.max(1.5, s.say.length / EST_CHARS_PER_SEC);

// A countdown overlaid on the line (countdownAt) costs no time; one after the line extends the scene.
export const sceneSeconds = (ep: Episode, s: Scene) =>
	padBefore(ep, s) + lineDuration(ep, s) + padAfter(ep, s) + (s.countdownAt === undefined ? s.countdown ?? 0 : 0);

export const sceneFrames = (ep: Episode, s: Scene) => Math.ceil(sceneSeconds(ep, s) * FPS);

export const totalFrames = (ep: Episode) => ep.scenes.reduce((n, s) => n + sceneFrames(ep, s), 0);
