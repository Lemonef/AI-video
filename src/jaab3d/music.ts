export type MusicEvent = {at: number; action: "swell" | "drop" | "out"};
export type MusicMix = {name: string; volume_lufs: number; duck_db: number; events: MusicEvent[]};

const clamp = (n: number) => Math.max(0, Math.min(1, n));
const db = (n: number) => Math.pow(10, n / 20);

/** Gain curve shared by jaab3d music beds: smooth voice ducking plus story-event automation. */
export const musicEnvelope = (mix: MusicMix, t: number, speaking: boolean, duration: number): number => {
  const events = [...mix.events].sort((a, b) => a.at - b.at);
  let level = 1;
  for (const event of events) {
    if (t < event.at) break;
    if (event.action === "swell") level = 1.28;
    if (event.action === "drop") level = 0.62;
    if (event.action === "out") level = Math.min(level, clamp(1 - (t - event.at) / 1.25));
  }
  const endFade = clamp((duration - t) / 1.0);
  return level * (speaking ? db(-mix.duck_db) : 1) * endFade;
};
