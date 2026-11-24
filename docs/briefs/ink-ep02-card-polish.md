---json
{"id": "ink-ep02-card-polish", "type": "creative", "risk": "high", "repo": "D:/AI-video", "gates": ["python tools/ink/ep02_full_shots.py --draft", "python -I tests/ink/ep02_lint_baseline.py", "python -I tests/ink/ep02_cardfix1_diffgate.py", "python -I tests/ink/ep02_cardfix2_check.py", "python -I tests/ink/ep02_plates_check.py", "node --test tests/ink/ep02_polish_check.test.mjs", "python tools/tsc_in_worktree.py", "node --test --test-skip-pattern=icons.tsx.changes.ONLY.by.the.IconName tests/ink/cardlib.test.mjs tests/ink/cardlib2a.test.mjs tests/ink/cardlib2b.test.mjs tests/ink/cardlib2c.test.mjs tests/ink/cardlib2d.test.mjs tests/ink/cardlib2e.test.mjs tests/ink/cardlib2f.test.mjs tests/ink/cardlib2g.test.mjs tests/ink/cardlib2h1.test.mjs tests/ink/cardlib2h1fix.test.mjs tests/ink/cardlib2h1fix2.test.mjs tests/ink/cardlib2h2.test.mjs tests/ink/cardlib2h3.test.mjs tests/ink/directed.test.mjs tests/ink/ep02-context-card.test.mjs tests/ink/ep02-card-content.test.mjs tests/ink/ep02-meter.test.mjs tests/ink/inkshort.test.mjs tests/ink/rig.test.mjs tests/ink/v11b-chip.test.mjs tests/ink/v11b.test.mjs"], "protected": ["tests/**", "docs/**", "videos/**", "public/**", "package.json", "package-lock.json", "tsconfig.json", "engine/ink/Root.tsx", "engine/ink/parts/shots/**", "engine/ink/parts/shots_v*/**", "engine/ink/parts/shots_ep02min1/**", "engine/ink/parts/elements.tsx", "engine/ink/parts/icons.tsx", "engine/ink/parts/doodle.tsx", "engine/ink/ink/**", "engine/ink/rig/**", "tools/ink/make_ep02_min1_shots.py", "tools/ink/make_v10_shots.py", "tools/ink/make_v11b_shots.py", "engine/ink/parts/cards.tsx", "engine/ink/compositions/InkProof.tsx", "engine/ink/compositions/InkParts.tsx", "engine/ink/parts/schema.ts", "engine/ink/parts/layouts/**", "engine/ink/parts/meter.mjs", "tools/tsc_in_worktree.py"], "context_files": ["tests/ink/ep02_polish_check.test.mjs", "tests/ink/ep02_plates_check.py", "tests/ink/ep02_lint_baseline.py", "tests/ink/ep02_cardfix2_check.py", "tools/ink/ep02_full_shots.py", "tools/ink/make_ep02_min1_shots.py", "engine/ink/parts/layouts/transformLayout.ts", "engine/ink/parts/layouts/mapLayout.ts", "engine/ink/parts/layouts/scaleLayout.ts", "engine/ink/parts/cards.tsx", "engine/ink/parts/elements.tsx", "docs/briefs/ink-ep02-card-fix2-beats.md"], "seed_files": ["videos/pastly-life/02-blackbeard-ink/assets/full-hybrid/timeline.json"], "plan_check": "docs/briefs/ink-ep02-card-polish.plan_check.md"}
---
# Goal
Polish the ep02 cards and overlay words, with no new pictures and no plate changes:
1. Every red circle / green tick on a card starts only once the label it marks is fully on screen, and
   finishes drawing at least `HOLD` (10) frames before the cut. Today 24 marks start 4 frames after the cut
   in, before their label has even appeared (the gate lists them).
2. Every card finishes inside its shot. The b1 hook card (f0 46, 45 frames) is too short for a transform: it
   becomes a split with the same two sides and the same circle on the right.
3. Overlay words never sit on a face or a head. Today the fixed top text slot (y 240, x `R` or 960) lands on
   heads on the plates where characters stand high in the frame (list in step 4).

The protected gate `tests/ink/ep02_polish_check.test.mjs` plus the review in Done-when define done. Read it
first: it pins each card shot's kind and marks, reads timing from the layout modules and cards.tsx, and
fails today with 27 findings. `tests/ink/ep02_plates_check.py` and `ep02_cardfix2_check.py` must keep
passing (every card keeps a mark; full-stage cards get no tag or stamp), so marks are retimed, never dropped.

Files you may change: `tools/ink/ep02_full_shots.py` and the generated `engine/ink/parts/shots_ep02full/full.json`
(regenerate with `python tools/ink/ep02_full_shots.py --draft`; never hand-edit it). Work only inside the repo.

# Steps
1. Mark timing at the source. `POINT` (ep02_full_shots.py) gives the mark the layout's `at`; that is the
   root cause. Make `POINT` compute the frame the marked label is fully visible and use it as the mark's
   `at`:
   - split: `at + i*step + POP_FRAMES + LABEL_FADE` (i = 0 left, 1 right; SplitElement in cards.tsx);
   - transform: `aLabelAt` / `bLabelAt` + `LABEL_FADE` (transformLayout.ts: bAt = at + 2*step + ARROW_DRAW,
     aLabelAt = at + POP_FRAMES, bLabelAt = bAt + POP_FRAMES);
   - scale: `labelEnd` (centre caption), else left/right label end (scaleLayout.ts);
   - map: `toPinAt + max(PIN_POP, PIN_LABEL_FADE)` (mapLayout.ts).
   Every frame count you need is a named constant defined ONCE in ep02_full_shots.py beside the existing
   `... # mirrors X in parts/...; change together` block, with that same comment style (for example
   `TF_POP, TF_FADE, TF_ARROW = 8, 6, 10  # mirrors POP_FRAMES/LABEL_FADE/ARROW_DRAW in parts/layouts/transformLayout.ts; change together`).
   Mark draw lengths (circle, tick) mirror `progress(f, 0, N)` in elements.tsx the same way, and
   `HOLD = 10` mirrors HOLD in tests/ink/ep02_polish_check.test.mjs. No bare frame numbers in POINT or
   the fitter.
2. Step fitter. Card shots pass a fixed authored step today (b54 `TF(... 22)`, b86 `TF(... 30)`,
   b47 `TF(... 26)`, etc.). Add one helper whose inputs are: the card kind (split / transform), the card's
   authored layout `at` (e.g. `t + 3` or `t + LEAD`, kept exactly as authored), the marked side and mark
   type (circle / tick), the shot start `t` and length `d` (builders are `lambda t, d:`), and the authored
   step. It returns the largest INTEGER step <= the authored step such that the card's real animation end
   + HOLD (for a split, include the optional versus-circle's extra draw frames, mirrored from cards.tsx)
   and the mark's `at + DRAW + HOLD` both land at or before the cut (`t + d`), never below the layout
   minimum (`CROSS_FRAMES` for transform, mirrored; 1 for split). Route every split / transform card POINT
   marks through that helper, so a card whose authored step already fits keeps it unchanged. Map and scale
   cards have a `dur`, not a `step`: do not refit them; only check that their timing and mark already fit
   (they do today) and fail loudly if not. Map readiness uses the destination pin (both current map calls
   point at `'to'`); say so in a comment. A fit simulation found only three steps change: f0 46 (becomes a
   split, step 14 -> 5), f0 11489 (transform 22 -> 10), f0 18090 (transform 30 -> 26). If a card cannot fit
   even at the minimum step, fail the build loudly (SystemExit naming the f0); do not clip.
3. b1 hook card (f0 46): `TF(('key','ALIVE NOW'),('chain','DEAD WITHIN A DAY'), t + LEAD, 14)` with
   `POINT(..., 'b')` becomes `SPL(('key','ALIVE NOW'),('chain','DEAD WITHIN A DAY'), t + LEAD, <fitted>)`
   with `POINT(..., 'right')`, cast unchanged. Same two sides, same circle on the right (gate pins
   `split circle@1440`). Apart from timing and this card, the only other b1-b9 changes are the step-4 / 4a
   overlay and sprite moves (f0 0 stamp, f0 153, f0 530, f0 1024, and b8 if a still shows it on a face).
4. Words off faces. For each shot below, move the overlay text (`O`, `W`, `CW`; also a `CS` cast sprite
   on a card when it sits under the words) to a calm area of that plate. Use the existing `L`, `R`,
   centre 960 and y 240. For a low text band over floor, deck or water, add ONE named constant next to
   the other position constants, for example `TEXT_LOW_Y = ...  # low text band over deck/floor/water, clear
   of the meter box`, derived from existing tokens (`STAGE_H`, `FLOOR`, etc.), not a bare number. Keep
   the words, colour and timing; size may shrink only to fit. The meter-clearance pass
   (make_ep02_min1_shots.py ~line 481) may push a line downward to clear the meter box: fine, but no line may end up
   back on a face. A card headline `CW` keeps the top of the card; on a card, move the `CS` sprite off
   the words instead (left or right third, `L` / `R`).

   | f0 | text | today | on | move to |
   |---|---|---|---|---|
   | 0 | ST 'LESS THAN A DAY TO LIVE' | 960, 380, rot -8, PUSH to (1300,480) | crew faces + BB; owner: "hard to read" | see step 4a |
   | 153 | CW 'ABOUT 20 MEN' | 960, y 298 (CW fixed y) | rigging + BB's hat behind the 3 crew sprites; owner: "sits on the background" | low band between/below the sprites' heads, or y clear above all heads on dark sky; sprites stay |
   | 530 | CW 'STRANGEST PART?' | top, CS bb_exp_deadpan 960 y 620 | words cross BB's hat and the governor's wig (S08 is a two-face close-up); sprite sits centred between the two faces | words to the low band (rail / lantern area); CS to a side third (`L` or `R`) and low enough that its head is clear of both plate faces and of the words |
   | 1024 | CW 'GUESTS FROM BATH' (S08 scene-plate shot, not a card: the headline stays where it is) | top, CS bath_farmer_stand 1320 | sprite head under words | CS lower / other third |
   | 2726 | W 'THE REAL ONE' | R, 240, size 110 | BB hat; CS bb_exp_grin | words to L or low band, sprite clear |
   | 4079 | O 'HOSTAGES' | R, 240 | BB's head | L, 240 (sky / rigging) |
   | 7308 | W 'STOPPED LAST NIGHT' | top | spyglass crewman's head | R, low band (water) |
   | 8338 | W 'FAKE FOLLOWERS' | 960 | CS bb_exp_smirk under it | sprite to a side third |
   | 8776 | W '3 PAIRS OF PISTOLS' | R, 240 | BB face, rigging heads | R, low band (deck) |
   | 10027 | W 'BEACH TRAFFIC' | top | CS crew_exp_deadpan face | sprite to a side third |
   | 10652 | O 'NO MERCY' | 960, 240 | BB's hat | R, 240 (sky over navy boat) |
   | 11424 | W 'THEY ARE HURTING' | R, 240 | BB on the ship | L or low band |
   | 11665 | W 'DECK LOOKS EMPTY' | top | CS crew_hide_barrel head | sprite clear of words |
   | 12301 | W 'NEVER TRUST A FREE WIN' | top | BB's head | R, low band (deck) |
   | 12583 | O 'HATCHES BURST' | top | BB's head | R, low band (deck) |
   | 13631 | W 'SWORD SNAPS' | L, 240 | near heads | check still; move if on a head |
   | 13756 | O 'NECK CUT' | R, 240 | navy head | check still; move if on a head |
   | 14125 | W 'CREWMATES GOING DOWN' | L | CS crew_exp_scared face | sprite clear |
   | 14656 | W 'OVER THE SIDE' | top | CS crew_exp_oh head | sprite clear |
   | 16458 | W 'DEAD BY NOON OR CHAINS' | top | standing prisoner's head | over the stone wall, or low band |
   | 17071 | W 'TWO WALK AWAY' | 960 | CS crew_exp_surprised face | sprite clear |
   | 17207 | W 'PARTY GUEST: FREED' | 960 | CS bath_gent_sly head | sprite clear |
   | 17430 | O "DON'T BE ON IT" | R, 240 | BB's head | L, 240 (sky) or low band |
   | 17692 | W 'WAITED 4 YEARS' | R, 240 | navy heads | L or low band |
   | 17880 | O 'NO PROMOTION' | R, 240 | officer's hat | L or low band |
   | 18022 | W 'PAID 4 YEARS LATE' | R, 240 | officer's head | L or low band |

   Also check b8 'GREAT LINE.' (W R, 230, size 90 over the BB portrait) and the f0 9333 'CUT THE ANCHOR'
   stamp (partly clipped); move only if they cover a face or clip.

   4a. Hook stamp (f0 0, frames 0-45, b1 shot 1, plate S01, `ST('LESS THAN A DAY TO LIVE', t + 10)`). The owner reviewed
   minute 1: the tilted red stamp at the centre crosses the crew's faces and BB, and is hard to read. Make it
   readable and off every face for its whole visible interval (the PUSH camera moves the plate under it):
   place it in the calm night sky band at the top (between the masts, left of the meter box) or in the low
   band over the dark deck, whichever a still shows is clear of faces at both the first and last visible
   frame. Reduce the tilt (a named constant such as `HOOK_STAMP_ROT`, small or 0) and keep the stamp's red
   style, words, timing AND size: `StampElement` hard-codes its font size and the stamp has no size
   parameter, so fit it by position and rotation only. If `ST` has no rot/x/y parameter for this, pass the
   existing ones (`x`, `y`, `rot` exist in `make_ep02_min1_shots.ST`). Every new value is a named constant
   derived from existing tokens (`STAGE_W`, `STAGE_H`, `FLOOR`, `L`, `R`, the meter box), no bare numbers.
   `CW` has no position parameter today; give it an optional `y` (default unchanged, so every other CW
   shot is identical) for the ABOUT 20 MEN and STRANGEST PART? moves.
   Find each shot by its text in `P`; f0 values are from the current full.json. Render half-scale stills
   (`npx remotion still engine/ink/index.ts InkEp02Full .tmp/polish/<name>.png --frame=<N> --scale=0.5
   --public-dir videos/pastly-life/02-blackbeard-ink/assets`) ONLY into the git-ignored `.tmp/polish/`
   directory (any other output path is an untracked file and fails the allowed-file gate) and look at each:
   for every moved overlay, frame `at + E` (its `at` plus the entrance length E of its element, read from
   elements.tsx: the frame the words / sprite are fully in) and frame `f1 - 10` (the words
   or sprite must stay off faces for the whole visible interval, cameras move); for each of the three
   re-stepped cards (f0 46, 11489, 18090), the frame its mark finishes drawing (`at + DRAW`), so the
   completed circle and the finished card are both visible. For f0 46 also look at the last frame
   (f1 - 1): the owner called the old b1 card "a big weird cut", so both sides and the circle must be fully
   drawn and settled there, not mid-animation. For the f0 0 stamp look at frames 12, 28 and 45.
   The fitter must receive the split's `vs` flag (versus-circle on/off) when computing the split end, so a
   split with `vs` set gets its extra draw frames counted. The protected gate does NOT count the
   versus-circle draw in a split's end, so a gate pass alone does not prove a `vs` split finishes in time;
   the fitter is what guarantees it.
5. Nothing else changes: same shots, same f0s (gate pins them), same plates, cameras, words, cards, colours.
   Plates untouched (`ep02_plates_check.py`). No new bare numbers anywhere (review checks).

# Done when
- All gates pass, including `node --test tests/ink/ep02_polish_check.test.mjs` (0 findings),
  `ep02_cardfix2_check.py`, `ep02_plates_check.py`, the lint baseline (no new errors), tsc and every listed
  node test. Paste the real output of `python tools/ink/ep02_full_shots.py` (without --draft) too.
- The diff touches only the two allowed files. Work only inside the repo.
- The gate pins card kind and mark type/x only, so also diff the new full.json against the old one: per
  shot, only mark `at`, card `step` (the three listed shots), the b1 card kind, the step-4 overlay /
  sprite positions and sizes, and the f0 0 stamp position / rotation may differ (stamp size stays). The b1 card at f0 46 may
  also change its circle y (655 -> 675, the split label anchor that POINT uses), its side keys (`a`/`b` ->
  `left`/`right`) and gain the default `vs` field. Otherwise card content, layout `at`, mark y/size, f0/f1, plates and cameras are
  unchanged. Paste a one-line summary of that diff (count of changed fields by kind).
- The reply includes: (a) a table per card shot with f0, kind, old step -> new step, old mark at -> new mark
  at; (b) a table per moved overlay with f0, text, old x/y -> new x/y (and any sprite move), and one line on
  what calm area it now sits on; (c) the new named constants with their mirror comments.
