# ep02 explain cards: context cards (design)

Date: 2026-11-24. Trigger (owner, verbatim): "It only have white card and each white card only have like white
then something place on it then word done like cmon bro no design like nothing it should be explaining
according to context".

## Problem (measured on full.json, 186 shots)

- 92 of 186 shots are cards: `bg: {card: true}`, rendered as a flat PAPER fill + elements
  (engine/ink/compositions/InkParts.tsx, card branch). There is no vignette, no surface and no link to the scene the
  beat lives in.
- 17 cards are only `sprite + words`: a cast figure on blank paper with a caption.
- Icons are generic and partly anachronistic for 1718: a steamer `ship` with funnels, a `padlock`, a bowler
  `hat`/`man`, a `factory` and a `hotel`.
- Element mix on cards: sprite 23, words 20, split 10, transform 10, hero 7, crossout 6, bignum 5, quote 5, doc 5,
  count 4, bars 4, timeline/grid/flow/checklist 3 each, map 2, scale 2, ring 1.

## Design

1. **Context surface (engine).** A card bg may carry `under: <plate path>` and `wash: <0..1>`. The renderer draws
   that plate blurred and washed toward PAPER, then a hand-drawn sheet: a paper panel with uneven radii
   (HAND_RADIUS), a hard ink offset shadow (same recipe as DoodleMeter), a slight tilt and an inset of the card
   area. The elements draw on top of the sheet, then the Vignette.
   - Tokens are named constants derived from LINE and the stage size: blur radius (small), wash amount (~0.35),
     sheet inset (~12% of stage height), sheet opacity (~0.85, translucent so the scene reads through), sheet
     tilt (under 1.5 deg). The shadow offset reuses DoodleMeter's exported METER_SHADOW.
   - `card: true` without `under` keeps today's look, so the other compositions stay unchanged.
2. **Generator: every ep02 card gets its beat's world.** `under` is the plate of the nearest previous scene shot,
   or the next one when none comes before. Each card gets its own bg dict (the shared CARD dict is never mutated). One helper, no per-card literals. This ties each
   card to the place it explains.
3. **Sprite+words cards become on-scene shots.** These are the 17 cards with no diagram. The cast sprite and words
   move onto the beat's scene plate with halo words. They stop being cards.
4. **Period icons.** Add `sloop`, `chain`, `chest`, `cannon`, `barrel`, `pistol`, `cutlass`, `flag`, `scroll`,
   `lantern` and `anchor` to icons.tsx, in the same 200-unit box and stroke rules. Each anachronistic name used
   in ep02 is remapped to a period one:
   - ship -> sloop
   - padlock -> chain
   - hat/man -> cast sprite or flag
   - factory/hotel -> dropped, or replaced with chest or barrel to fit the beat
5. **Scale.** Split, hero and count layouts already sit near the centre. The sheet inset frames them, so their
   coordinates do not change. Icon size stays as it is in this build; a larger icon size (about 1.3x) is a
   later follow-up after the owner sees the stills (revised after the Codex brief review).

## Out of scope

- Element animation code.
- Meter and chip.
- Scene plates (the scene pipeline jobs own them).
- Other episodes' compositions.

## Verification

- Stills (sequential) of one card of each element type, plus 3 on-scene conversions. Read them.
- The lint in ep02_full_shots.py stays green, except the known reuse errors. Those are fixed by the m-scene
  rewire.
- tsc passes. Existing ink tests pass.
