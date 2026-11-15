import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile} from 'remotion';
import {Sprite, Scene, TitleCard, CompareCard, LabelCard, INK, PAPER, ORANGE, LINE} from '../compositions/InkProof';
import timeline from '../../../videos/pastly-life/01-eiffel-ink/assets/ink60/timeline.json';

// Data-driven Ink episode: timeline.json (built by tools/hist_ep/ink_audio.py from the voice) owns every
// cut frame; SHOTS below owns what each cut shows. Slot order per beat must match beats.json `shots`.
// Route A rule (Zen 2026-11-15): static posed stickmen allowed, each scene varies hat/coat/scarf/mood so no two read as clones; never walk-cycle animation.

const SKY_DUSK: [string, string] = ['#f6d9a8', '#e8a96b'];
const SKY_GREY: [string, string] = ['#cfdbe2', '#9fb3bf'];
const SKY_NIGHT: [string, string] = ['#2a3550', '#16203a'];

// prop silhouettes (Newspaper, Suitcase, Door, Banknotes, ...) moved to ./props, shared with ep_directed.tsx

// ---------- cast: Codex GPT-image sprites cut from magenta sheets (tools/cut_sprites.py) ----------
// One locked character per sheet, varied pose per scene so no two shots read as clones. Numbers = pose index on the sheet.
const LUSTIG_SPR = (n: number) => `ink60/cast/lustig_${n}.png`;
const PARISIAN_SPR = (n: number) => `ink60/cast/parisian_${n}.png`;
const CLERK_SPR = (n: number) => `ink60/cast/clerk_${n}.png`;
// Feet line sits on the open foreground of the 1672x941 plates scaled to 1920x1080 (ground band ~y665-734, open floor below);
// H = full figure height in px. Change together with the plates if their framing changes.
const FEET = 900;
const H = 640;

// ---------- shot library: [beat id] -> one element per shot slot ----------
type ShotFn = (len: number) => React.ReactNode;
const SHOTS: Record<string, ShotFn[]> = {
  b1: [
    (len) => <Scene len={len} plate="ink60/plates/paris_dusk.png" sky={SKY_DUSK} ground="#b88c5a" zoom={[1.0, 1.05]} chip="PARIS 1925" caption="Paris, 1925.">
        <Sprite src={LUSTIG_SPR(1)} x={520} y={FEET} h={H} />
      </Scene>,
    () => <TitleCard lines={['Paris,', '1925.']} icon="tower" />,
    () => <TitleCard lines={['One man sold', 'the Eiffel Tower.']} />,
    () => <TitleCard lines={['Twice.']} accent="x" icon="coin" />,
  ],
  b2: [
    () => <TitleCard lines={['Victor', 'Lustig.']} accent="x" />,
    (len) => (
      <Scene len={len} plate="ink60/plates/paris_grey.png" sky={SKY_GREY} ground="#6b7c86" zoom={[1.05, 1.0]} chip="PARIS 1925" caption="A very good suit">
        <Sprite src={LUSTIG_SPR(2)} x={560} y={FEET} h={H} />
      </Scene>
    ),
    () => <CompareCard head="Victor Lustig" left="Bad conscience." right="Good suit." />,
  ],
  b3: [
    () => <LabelCard title="Repairs cost a fortune" a="Rust + repairs" b="Tons of iron" />,
    () => <TitleCard lines={['The city', 'complained.']} />,
    (len) => <Scene len={len} plate="ink60/plates/paris_tower_grey.png" sky={SKY_GREY} ground="#6b7c86" zoom={[1.0, 1.05]} chip="PARIS 1925" caption="Repairs, a fortune">
        <Sprite src={PARISIAN_SPR(1)} x={1050} y={FEET} h={H} flip />
      </Scene>,
  ],
  b4: [
    (len) => (
      <Scene len={len} plate="ink60/plates/paris_grey.png" sky={SKY_GREY} ground="#6b7c86" zoom={[1.0, 1.05]}>
        <Sprite src={PARISIAN_SPR(2)} x={760} y={FEET} h={H} />
      </Scene>
    ),
    () => <TitleCard lines={['He saw', 'an opening.']} accent="x" icon="flame" />,
  ],
  b5: [
    () => <TitleCard lines={['Forged', 'government papers.']} />,
    (len) => (
      <Scene len={len} plate="ink60/plates/paris_night.png" sky={SKY_NIGHT} ground="#1d2640" zoom={[1.05, 1.0]}>
        <Sprite src={LUSTIG_SPR(3)} x={420} y={FEET} h={H} />
        <Sprite src={CLERK_SPR(3)} x={1450} y={FEET} h={H} flip bob={2} />
      </Scene>
    ),
    () => <TitleCard lines={['Six scrap dealers.', 'One hotel room.']} icon="coin" accent="x" />,
  ],
  b6: [
    () => <CompareCard head="The tower?" left="Too costly." right="Sold for scrap." />,
    (len) => <Scene len={len} plate="ink60/plates/paris_tower_night.png" sky={SKY_NIGHT} ground="#1d2640" zoom={[1.0, 1.05]}>
        <Sprite src={LUSTIG_SPR(5)} x={520} y={FEET} h={H} />
      </Scene>,
    () => <TitleCard lines={['Sold', 'for scrap.']} accent="x" />,
  ],
  b7: [
    () => <TitleCard lines={['Andre', 'Poisson.']} />,
    () => <CompareCard head="Lustig's trick" left="Feel important." right="Then pay." />,
    (len) => (
      <Scene len={len} plate="ink60/plates/hotel_room_night.png" sky={SKY_NIGHT} ground="#1d2640" zoom={[1.05, 1.0]}>
        <Sprite src={CLERK_SPR(2)} x={1300} y={FEET} h={H} flip />
      </Scene>
    ),
  ],
  b8: [
    () => <TitleCard lines={['He paid.']} icon="coin" accent="x" />,
    (len) => (
      <Scene len={len} plate="ink60/plates/paris_grey.png" sky={SKY_GREY} ground="#6b7c86" zoom={[1.0, 1.05]}>
        <Sprite src={LUSTIG_SPR(4)} x={1400} y={FEET} h={H} flip />
      </Scene>
    ),
    () => <CompareCard head="The tower?" left="Never moved." right="He got paid." />,
  ],
  b9: [
    () => <TitleCard lines={['Too embarrassed', 'for the police.']} />,
    (len) => (
      <Scene len={len} plate="ink60/plates/paris_dusk.png" sky={SKY_DUSK} ground="#b88c5a" zoom={[1.05, 1.0]}>
        <Sprite src={LUSTIG_SPR(6)} x={1400} y={FEET} h={H} flip />
      </Scene>
    ),
    () => <TitleCard lines={['So Lustig', 'came back.']} accent="x" icon="tower" />,
  ],
};

export const INK60_FRAMES: number = timeline.totalFrames;
// Proof cut: first 3 beats (ends on a sentence boundary), look check before scaling to the full episode.
export const INK15_FRAMES: number = timeline.beats[2].start + timeline.beats[2].dur;

export const Ink60: React.FC = () => (
  <AbsoluteFill style={{background: PAPER}}>
    {timeline.beats.map((b) =>
      b.shots.map((s, i) => {
        const fn = SHOTS[b.id]?.[i];
        if (!fn) throw new Error(`no shot for ${b.id}[${i}]`);
        return (
          <Sequence key={`${b.id}-${i}`} from={s.start} durationInFrames={s.dur}>
            {fn(s.dur)}
          </Sequence>
        );
      }),
    )}
    <Audio src={staticFile('ink60/master.wav')} />
  </AbsoluteFill>
);

void ORANGE;
