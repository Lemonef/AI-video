import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile} from 'remotion';
import {Sprite, Scene, TitleCard, PAPER} from '../compositions/InkProof';
import timeline from '../../../videos/pastly-life/01-eiffel-ink/assets/ink60full/timeline_full.json';
import shots from '../../../videos/pastly-life/01-eiffel-ink/assets/ink60full/shots_full.json';

// Generic full-episode composition: every cut comes from tools/gen_full.py (script_full.md -> shots_full.json +
// timeline_full.json). No per-beat hand authoring; the shot LOOK per plate lives in PLATE_LOOK only.
// Same framing constants as ep1.tsx (feet line on the open foreground of the 1672x941 plates, H = figure height).
const FEET = 900;
const H = 640;
const SKY = {
  dusk: ['#f6d9a8', '#e8a96b'] as [string, string],
  grey: ['#cfdbe2', '#9fb3bf'] as [string, string],
  night: ['#2a3550', '#16203a'] as [string, string],
};
const GROUND = {dusk: '#b88c5a', grey: '#6b7c86', night: '#1d2640'};
// plate tag -> mood. New plates (Vienna, ship, ...) are added here when their PNG lands in public/ink60full/plates/.
const PLATE_LOOK: Record<string, keyof typeof SKY> = {
  paris_dusk: 'dusk', paris_grey: 'grey', paris_night: 'night',
  paris_tower_grey: 'grey', paris_tower_night: 'night', hotel_room_night: 'night',
};
const PLATE_DIR = 'ink60/plates'; // existing proof plates; new ones go in the same dir

type Shot = {k: 'scene'; plate: string; sprite: string; x: number} | {k: 'title'; lines: string[]; accent: string | null};
const SHOTS = shots as unknown as Record<string, Shot[]>;

export const INKFULL_FRAMES: number = timeline.totalFrames;

export const InkFull: React.FC = () => (
  <AbsoluteFill style={{background: PAPER}}>
    {timeline.beats.map((b) =>
      b.shots.map((s, i) => {
        const sh = SHOTS[b.id]?.[i];
        if (!sh) throw new Error(`no shot for ${b.id}[${i}]`);
        const look = PLATE_LOOK[(sh as {plate?: string}).plate ?? ''] ?? 'grey';
        return (
          <Sequence key={`${b.id}-${i}`} from={s.start} durationInFrames={s.dur}>
            {sh.k === 'title' ? (
              <TitleCard lines={sh.lines} accent={sh.accent ?? undefined} />
            ) : (
              <Scene len={s.dur} plate={`${PLATE_DIR}/${sh.plate}.png`} sky={SKY[look]} ground={GROUND[look]} zoom={i % 2 ? [1.05, 1.0] : [1.0, 1.05]}>
                <Sprite src={`ink60/cast/${sh.sprite}.png`} x={sh.x} y={FEET} h={H} />
              </Scene>
            )}
          </Sequence>
        );
      }),
    )}
    {/* master.wav lands in public/ink60full/ once ink_audio.py has run on beats_full.json */}
    {(timeline as {silent?: boolean}).silent ? null : <Audio src={staticFile('ink60full/master.wav')} />}
  </AbsoluteFill>
);
