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
   overlay, sprite and stamp moves and the f0 443 `at` fix listed in the step-4 table.
4. Words off faces. The owner reviewed minute 1 and wrote "Be careful of overlap": overlay words and card
   sprites must never sit on a face, head, hat or wig, in ANY shot. A full sweep of all shots at each
   element's SETTLED frame (words: `min(at + (n_words-1)*4 + 20, f1 - 2)`, the frame the last word has
   finished entering; other elements: `min(at + 20, f1 - 2)`) found the shots in the table below. The f0
   values are the REAL shot starts in the current full.json (an earlier draft of this table used wrong
   f0s; ignore any older list). Find each shot by its f0 and text in `P`.

   Placement vocabulary (all from existing tokens, no bare numbers):
   - `TL` / `TC` / `TR`: y 240 at x `L` / 960 / `R` (sky, rigging, wall, houses). The meter box sits top
     right, so `TR` only where the meter-clearance pass does not push it onto a face.
   - low band: add ONE named constant next to the other position constants:
     `TEXT_LOW_Y = m1.STAGE_H - m1.SAFE - round(m1.CAP_H * LOW_SIZE)`, where `LOW_SIZE` is the largest
     words size placed on the band (a named constant or an existing size token; the clearance pass treats
     `CAP_H * size` as a line's half-height, so its bottom stays `SAFE` above the stage edge), with a mirror
     comment: `# low text band over deck/floor/water/street; derived from STAGE_H/SAFE/CAP_H in
     make_ep02_min1_shots.py; change together`.
     "LL low" / "LR low" / "low 960" = x `L` / `R` / 960 at `TEXT_LOW_Y`.
   - a sprite move: `CS` to x `L` or `R` (side third), and lower (bigger `y`, or smaller `h` if needed)
     so its head clears the words and every plate face.
   Keep the words, colour and timing (one exception, f0 443 below); size may shrink only to fit. The
   meter-clearance pass (make_ep02_min1_shots.py ~line 470-483) may push a line downward to clear the meter
   box: fine, but no line may end up back on a face, and it must not hit its "cannot clear the meter box"
   SystemExit. A card headline `CW` keeps the top of the card; on a card, move the `CS` sprite instead.
   `CW` has no position parameter today; give it an optional `y` (default unchanged, so every other CW shot
   is byte-identical) for the f0 153 and f0 495 moves.

   | f0 | text (element) | sits on today | move to |
   |---|---|---|---|
   | 0 | ST 'LESS THAN A DAY TO LIVE' | crew faces + BB, hard to read | see 4a |
   | 46 | b1 split card | owner: "big weird cut" | step 3 (split); must be fully settled before f1 |
   | 153 | CW 'ABOUT 20 MEN' | rigging + BB's hat behind the sprites | TL, or a y clear above all heads; sprites stay |
   | 443 | W 'STAY TO THE END' | timing: settles 488, shot ends 495 (< HOLD) | its `at` from `t + 13` to `t + LEAD` (the only timing change); position TL or low band if a still shows it on a head |
   | 495 | CW 'STRANGEST PART?' + CS bb_exp_deadpan | words on BB's hat + governor's wig; sprite between the faces | words to the low band; CS to a side third, low, head clear of both plate faces |
   | 978 | CW 'GUESTS FROM BATH' + CS sprites | sprite heads under the words | sprites lower / to the side thirds; headline stays |
   | 1416 | 'ME AND THE DEVIL' | BB's hat + sprite | TL / TC / low band, whichever a still shows clear |
   | 1492 | b8 'GREAT LINE.' | BB portrait | TL or LR low |
   | 1805 | stamp 'MOST FEARED' | gangplank figure | a clear corner, inside the frame |
   | 1954 | 'ROYAL PARDON' | BB's hat | clear area (TL / low band) |
   | 2242 | "HE DIDN'T STOP" | heads | clear area |
   | 2449 | tag 'NORTH CAROLINA' | hat | clear area |
   | 2607 | 'WHO COMES HERE' | hat | clear area |
   | 2686 | 'THE REAL ONE' | sprite + farmer's head | words to L or low band; sprite clear |
   | 2762 | 'NAMED AFTER HIM' | portrait hat | clear area |
   | 3367 | 'MOST FEARED ALIVE' | boat heads | clear area |
   | 4043 | O 'HOSTAGES' | BB's head | TL |
   | 4572 | 'FEWER MEN, FEWER SHARES' | heads | TC / R sky |
   | 5071 | 'ONE OF TWENTY' | heads | TL |
   | 5296 | 'LOOK CLOSER' | heads | TL or low band |
   | 5464 | tag 'FREE OR ENSLAVED' | heads | LR low |
   | 5632 | 'WHERE IS EVERYONE?' | heads | TL |
   | 5847 | 'NO WAGES' | heads | LR low |
   | 6027 | 'FAIRER THAN OFFICES' | heads | LL low |
   | 6236 | 'VOTED IN' | heads | LL low |
   | 6633 | 'NOBODY ON WATCH' | heads | TL |
   | 6863 | 'DAWN' / 'A SAIL' | heads | LR low |
   | 7272 | 'STOPPED LAST NIGHT' | spyglass crewman's head | R low (water) |
   | 7561 | 'NO LEGAL RIGHT' | heads | TL |
   | 7753 | '60 OF THEM' | navy heads | clear area |
   | 7998 | 'EDWARD TEACH' | heads | LR low |
   | 8302 | 'FAKE FOLLOWERS' + CS bb_exp_smirk | sprite under the words | sprite to LL, lower |
   | 8740 | '3 PAIRS OF PISTOLS' | BB's face, rigging heads | R low (deck) |
   | 8839 | 'LOOK TERRIFYING' | heads | LR low |
   | 9062 | 'NEVER KILLED ANYONE?' | heads | LR low |
   | 9299 | stamp 'CUT THE ANCHOR' | clipped by the frame edge | TC, fully inside the frame |
   | 9409 | 'JOLT!' | heads | TL |
   | 9915 | 'TRAFFIC JAM' | heads | TL or LR low |
   | 9991 | 'BEACH TRAFFIC' + CS crew_exp_deadpan | sprite face under the words | sprite to LR |
   | 10067 | 'GAP CLOSING' | heads | LR low |
   | 10304 | tag 'WHO ARE YOU?' | heads | LR low |
   | 10618 | O 'NO MERCY' | BB's hat | TR (sky over the navy boat) |
   | 10848 | stamp 'BROADSIDE' | heads | TL |
   | 11390 | 'THEY ARE HURTING' | BB on the ship | TL |
   | 11629 | 'DECK LOOKS EMPTY' + CS crew_hide_barrel | sprite head | TL / TC, sprite clear |
   | 12011 | stamp 'GRAPPLE!' | heads | TC |
   | 12267 | 'NEVER TRUST A FREE WIN' | BB's head | LR low (deck) |
   | 12551 | O 'HATCHES BURST' | BB's head | LR low (deck) |
   | 13141 | stamp 'BLOW THE SHIP UP' | heads / edge | LR, inside the frame, clear of the meter box |
   | 13455 | stamp 'BANG' | heads | TL |
   | 13722 | O 'NECK CUT' | navy officer's hat | low 960 |
   | 14089 | 'CREWMATES GOING DOWN' + CS crew_exp_scared | sprite face | sprite to the R third, lower |
   | 14411 | 'A FEW MINUTES' | navy head | low 960 |
   | 14624 | 'OVER THE SIDE' + CS crew_exp_oh | sprite head | sprite to the L third, lower |
   | 14681 | 'TO VIRGINIA' | heads | TL (over the houses) |
   | 14870 | "PICS OR IT DIDN'T HAPPEN" | BB engraving face / hat | R low |
   | 15061 | tag 'JUST A LEGEND' | heads | TL (houses) |
   | 16424 | 'DEAD BY NOON OR CHAINS' | standing prisoner's head (meter blocks top right) | R low |
   | 16703 | tag 'NO JURY' | judge's head | R low |
   | 17041 | 'TWO WALK AWAY' | CS crew_exp_surprised face | words to low 960 (street / steps); sprite unchanged |
   | 17173 | 'PARTY GUEST: FREED' | bath_gent_sly head + guard's head | low 960 |
   | 17245 | 'ISRAEL HANDS' | farmer's hat | LL low |
   | 17394 | O "DON'T BE ON IT" | BB's head | TL (sky / rigging) |
   | 17658 | 'WAITED 4 YEARS' | navy heads | LL low |
   | 17848 | O 'NO PROMOTION' | officer's hat | LL low |
   | 17988 | 'PAID 4 YEARS LATE' | officer's head | LL low |

   "clear area" means: pick TL / TC / TR / LL low / LR low / low 960 by looking at the still; the choice
   goes in the reply table. Table texts are search fragments: find the element whose text starts with or
   contains them (e.g. 'VOTED IN' = 'VOTED IN BY THE CREW', 'A SAIL' = 'A SAIL. THEN ANOTHER.', 'BROADSIDE' =
   'BROADSIDE!'); move the whole element. Every other shot was
   checked and is already clear: do not move it. Shots 4329 and 8399 were borderline: render their still
   and move only if the words touch a head (a move there counts as a step-4 move in Done-when).

   Bottom edge under the camera. `m1.fit_words` clamps only the TOP and sides against the camera states;
   a low-band line can leave the bottom of the screen when the plate zoom / camera scales it (Codex found
   f0 6863, 12267, 16424, 17041 at about screen y 1103 > 1080). `make_ep02_min1_shots.py` is protected, so
   add ONE pass in ep02_full_shots.py, run right after `fit_words(s)` and before `clear_meter(s)` (line ~809):
   `fit_words_bottom(shot)`, the mirror of fit_words' `lo_y`: for every words element
   `hi_y = min((m1.STAGE_H - m1.SAFE - by) / ay - m1.CAP_H * size for _, _, ay, by in m1._states(shot))`,
   `y = min(y, hi_y)`, logged into `fits` the same way. Comment: `# bottom-safe twin of m1.fit_words lo_y;
   change together`. It applies to every shot (a line already inside the frame is unchanged), so a
   low-band line stays on screen at every camera state; the still check then confirms it is still off faces.

   4a. Hook stamp (f0 0, frames 0-45, b1 shot 1, plate S01, `ST('LESS THAN A DAY TO LIVE', t + 10)`). The owner reviewed
   minute 1: the tilted red stamp at the centre crosses the crew's faces and BB, and is hard to read. Make it
   readable and off every face for its whole visible interval (the PUSH camera moves the plate under it):
   place it in the calm night sky band at the top (between the masts, left of the meter box) or in the low
   band over the dark deck, whichever a still shows is clear of faces at both the first and last visible
   frame. Reduce the tilt (a named constant such as `HOOK_STAMP_ROT`, small or 0) and keep the stamp's red
   style, words, timing AND size: `StampElement` hard-codes its font size and the stamp has no size
   parameter, so fit it by position and rotation only (`x`, `y`, `rot` exist in `make_ep02_min1_shots.ST`).
   The same applies to every stamp in the table: once SETTLED (StampElement's entrance `useIn(..., 10)` has
   finished, i.e. from `at + 10` at scale 1; the 2.2x slam-in frames before that may overflow, that is the
   intended stamp hit) its rotated box is at least `SAFE` from every screen edge at camera start and end
   (use `m1._states(shot)`), and clear of the meter box. Every new value is a named constant derived from existing
   tokens (`STAGE_W`, `STAGE_H`, `SAFE`, `FLOOR`, `L`, `R`, the meter box), no bare numbers.

   4b. Check. Render half-scale stills (`npx remotion still engine/ink/index.ts InkEp02Full
   .tmp/polish/<name>.png --frame=<N> --scale=0.5 --public-dir videos/pastly-life/02-blackbeard-ink/assets`)
   ONLY into the git-ignored `.tmp/polish/` directory (any other output path is an untracked file and fails
   the allowed-file gate) and look at each:
   - every moved overlay / sprite: its SETTLED frame (formula above) and frame `f1 - 10` (cameras move; the
     words or sprite must stay off faces for the whole visible interval);
   - each of the three re-stepped cards (f0 46, 11489, 18090): the frame its mark finishes drawing
     (`at + DRAW`), so the completed circle and the finished card are both visible. For f0 46 also the last
     frame (f1 - 1): both sides and the circle fully drawn and settled there, not mid-animation;
   - the f0 0 stamp: frames 12, 28 and 45;
   - f0 443: frame `at + 32` and f1 - 1 (all four words settled before the cut).
   Do not judge overlap at an entrance frame (words still sliding in look like they sit elsewhere).
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
  sprite / stamp positions, sizes and rotations (including 4329 / 8399 if moved, and any words y lowered by
  `fit_words_bottom`), the f0 443 words `at`, may differ (stamp size stays). The b1 card at f0 46 may
  also change its circle y (655 -> 675, the split label anchor that POINT uses), its side keys (`a`/`b` ->
  `left`/`right`) and gain the default `vs` field. Otherwise card content, layout `at`, mark y/size, f0/f1, plates and cameras are
  unchanged. Paste a one-line summary of that diff (count of changed fields by kind).
- The reply includes: (a) a table per card shot with f0, kind, old step -> new step, old mark at -> new mark
  at; (b) a table per moved overlay with f0, text, old x/y -> new x/y (and any sprite move), and one line on
  what calm area it now sits on; (c) the new named constants with their mirror comments.
