import type {SceneTiming} from '../types';

const strip = (s: string) => s.replace(/[^\u0E00-\u0E7FA-Za-z0-9]/g, '');

/**
 * Fraction of the line at which a cue fires. A `word` cue fires when the narrator starts that
 * word (Whisper/engine timings; Thai words may be split into syllables, so the match is made on
 * the joined letters). Falls back to `at` when the word is not found.
 */
export const cueAt = (cue: {at?: number; word?: string}, timing: SceneTiming | undefined, lineSec: number): number => {
	if (!cue.word || !timing?.words?.length) return cue.at ?? 0;
	const target = strip(cue.word);
	const words = timing.words;
	let joined = '';
	const starts: number[] = [];
	for (const w of words) {
		starts.push(joined.length);
		joined += strip(w.text);
	}
	const idx = joined.indexOf(target);
	if (idx < 0) return cue.at ?? 0;
	let k = 0;
	while (k + 1 < starts.length && starts[k + 1] <= idx) k++;
	return words[k].start / lineSec;
};
