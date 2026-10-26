import type {Episode, Scene} from '../types';

export const FPS = 30;
export const DEFAULT_PAD_BEFORE = 0.25;
export const DEFAULT_PAD_AFTER = 0.5;
// Before TTS runs (Studio preview), estimate Thai speech at this many characters per second.
const EST_CHARS_PER_SEC = 13;

export const lineDuration = (ep: Episode, s: Scene) => ep.timing?.[s.id]?.duration ?? Math.max(1.5, s.say.length / EST_CHARS_PER_SEC);

export const sceneSeconds = (ep: Episode, s: Scene) =>
	(s.padBefore ?? DEFAULT_PAD_BEFORE) + lineDuration(ep, s) + (s.padAfter ?? DEFAULT_PAD_AFTER) + (s.countdown ?? 0);

export const sceneFrames = (ep: Episode, s: Scene) => Math.ceil(sceneSeconds(ep, s) * FPS);

export const totalFrames = (ep: Episode) => ep.scenes.reduce((n, s) => n + sceneFrames(ep, s), 0);
