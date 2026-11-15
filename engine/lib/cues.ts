import type {Cue} from '../types';

/** The caption chunk on screen at `t` seconds into the line, or null between/after chunks. */
export const activeCue = (cues: Cue[], t: number): Cue | null => cues.find((c) => t >= c.start && t < c.end) ?? null;
