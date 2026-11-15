import type {SceneTiming} from '../types';

const strip = (s: string) => s.replace(/[^\u0E00-\u0E7FA-Za-z0-9]/g, '');

/**
 * Fraction of the line at which a cue fires. A `word` cue fires when the narrator starts that
 * word (Whisper/engine timings; Thai words may be split into syllables, so the match is made on
 * the joined letters). Without word timings, the word's letter position in the line is spread over
 * the clip's spoken part. Falls back to `at` when the word is not found.
 */
export const cueAt = (cue: {at?: number; word?: string}, timing: SceneTiming | undefined, lineSec: number): number => {
	if (!cue.word || !timing) return cue.at ?? 0;
	const measured = timing.cueTimes?.[cue.word];
	if (measured !== undefined) return measured / lineSec; // the pipeline found where the word starts
	if (!timing.words?.length) return byLetters(cue.word, cue.at, timing, lineSec);
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

// Estimate, not a measurement: Thai is read at a near-even letter rate, so a word that starts 80%
// into the line's letters starts ~80% into its spoken seconds.
const byLetters = (word: string, at: number | undefined, timing: SceneTiming, lineSec: number): number => {
	const line = strip(timing.say ?? '');
	const idx = line.indexOf(strip(word));
	if (idx < 0 || !timing.speech) return at ?? 0;
	const [from, to] = timing.speech;
	return (from + (to - from) * (idx / line.length)) / lineSec;
};
