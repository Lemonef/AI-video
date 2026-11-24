---json
{"id": "ink-ep02-plate-wire", "type": "creative", "risk": "high", "repo": "D:/AI-video", "gates": ["python tools/ink/ep02_full_shots.py --draft", "python -I tests/ink/ep02_lint_baseline.py", "python -I tests/ink/ep02_cardfix1_diffgate.py", "python -I tests/ink/ep02_cardfix2_check.py", "python -I tests/ink/ep02_plates_check.py", "python tools/tsc_in_worktree.py", "node --test --test-skip-pattern=icons.tsx.changes.ONLY.by.the.IconName tests/ink/cardlib.test.mjs tests/ink/cardlib2a.test.mjs tests/ink/cardlib2b.test.mjs tests/ink/cardlib2c.test.mjs tests/ink/cardlib2d.test.mjs tests/ink/cardlib2e.test.mjs tests/ink/cardlib2f.test.mjs tests/ink/cardlib2g.test.mjs tests/ink/cardlib2h1.test.mjs tests/ink/cardlib2h1fix.test.mjs tests/ink/cardlib2h1fix2.test.mjs tests/ink/cardlib2h2.test.mjs tests/ink/cardlib2h3.test.mjs tests/ink/directed.test.mjs tests/ink/ep02-context-card.test.mjs tests/ink/ep02-card-content.test.mjs tests/ink/ep02-meter.test.mjs tests/ink/inkshort.test.mjs tests/ink/rig.test.mjs tests/ink/v11b-chip.test.mjs tests/ink/v11b.test.mjs"], "protected": ["tests/**", "docs/**", "videos/**", "public/**", "package.json", "package-lock.json", "tsconfig.json", "engine/ink/Root.tsx", "engine/ink/parts/shots/**", "engine/ink/parts/shots_v*/**", "engine/ink/parts/shots_ep02min1/**", "engine/ink/parts/elements.tsx", "engine/ink/parts/icons.tsx", "engine/ink/parts/doodle.tsx", "engine/ink/ink/**", "engine/ink/rig/**", "tools/ink/make_ep02_min1_shots.py", "tools/ink/make_v10_shots.py", "tools/ink/make_v11b_shots.py", "engine/ink/parts/cards.tsx", "engine/ink/compositions/InkProof.tsx", "engine/ink/compositions/InkParts.tsx", "engine/ink/parts/schema.ts", "engine/ink/parts/layouts/**", "engine/ink/parts/meter.mjs", "tools/tsc_in_worktree.py"], "context_files": ["tests/ink/ep02_plates_check.py", "tests/ink/ep02_lint_baseline.py", "tests/ink/ep02_cardfix2_check.py", "tools/ink/ep02_full_shots.py", "tools/ink/make_ep02_min1_shots.py", "docs/briefs/ink-ep02-card-fix2-beats.md", "videos/pastly-life/02-blackbeard-ink/script/briefs/scenes_min1.py", "videos/pastly-life/02-blackbeard-ink/script/briefs/scenes_min2.py", "videos/pastly-life/02-blackbeard-ink/script/briefs/scenes_min3.py", "videos/pastly-life/02-blackbeard-ink/script/briefs/scenes_min4.py", "videos/pastly-life/02-blackbeard-ink/script/briefs/scenes_min5.py", "videos/pastly-life/02-blackbeard-ink/script/briefs/scenes_min6.py", "videos/pastly-life/02-blackbeard-ink/script/briefs/scenes_min7.py", "videos/pastly-life/02-blackbeard-ink/script/briefs/scenes_min8.py", "videos/pastly-life/02-blackbeard-ink/script/briefs/scenes_min9.py", "videos/pastly-life/02-blackbeard-ink/script/briefs/scenes_min10.py"], "seed_files": ["videos/pastly-life/02-blackbeard-ink/assets/full-hybrid/timeline.json"], "plan_check": "docs/briefs/ink-ep02-plate-wire.plan_check.md"}
---
# Goal
Minutes 2-11 of ep02 (beats b10-b87) still show the eleven old scene plates `s01`..`s11` over and over. Thirty-seven
fresh plates were specified for them, all thirty-seven on disk, one per story moment, in the same old graded style:
`videos/pastly-life/02-blackbeard-ink/assets/ink/scenes/m*.png`. Wire them in, so every minute shows its own
pictures. Minute 1 (b1-b9) keeps its old plates unchanged.

The protected gate `tests/ink/ep02_plates_check.py` plus the manual review in Done-when define done. Read the gate first. It reads the beat -> plate map
from the scene specs `videos/pastly-life/02-blackbeard-ink/script/briefs/scenes_min1.py` .. `scenes_min10.py`
(each scene's `id` is the plate file name, its `minute` string names the beats it was drawn for and how to shoot it).

Files you may change: `tools/ink/ep02_full_shots.py` and the generated `engine/ink/parts/shots_ep02full/full.json`
(regenerate with `python tools/ink/ep02_full_shots.py --draft`; never hand-edit it). Work only inside the repo.

# Steps
1. In `P`, for every beat a scene spec names: AT LEAST ONE of its plate shots uses that plate via
   `SC('<plate id>')` (add a named constant per plate next to `S01`..`S11`, e.g. `M8A = 'm8a_virginia_harbour'`).
   Its other plate shots may use another fitting plate of the same minute window, so step 8 holds (b55 has two
   consecutive plate shots; b80-b81 are three consecutive shots all mapped to `m9c`). Keep the beat's overlay
   words, chips, cards and shot count exactly as they are (`build()` asserts the builder count equals the
   timeline shot count). Only the background, the camera move and the overlay positions of step 2 change.
2. Camera and text side come from the spec's `minute` string: "slow pan" -> `PAN`, "push in" -> `PUSH`,
   "pull back" -> `PULL`; "text top right / on the left / top centre" -> move that shot's `O(...)` overlay words to
   that calm area of the plate (applies to every overlay text helper on that shot: `O`, `W`, `TG`, `ST`, `CW`), using the existing position constants (`R`, `L`, centre 960, y 240 etc.). No new
   bare numbers anywhere: every new zoom, origin or camera value is a named constant defined ONCE next to `SC`
   (e.g. `ORIGIN_UPPER = '50% 35%'`, `ZOOM_CLOSE = 1.1`) with a one-line comment saying what framing it gives, and
   shots use the name. A previous attempt failed review for pasting `origin='50% 35%'` and `PUSH(960,520,1.2)` as
   literals on ~80 shots. Scope: zoom factors and `SC` origin/scale values must be names; the x/y focus point of a
   `PUSH`/`PULL`/`PAN` is that shot's own framing and stays a number, as in the existing b1-b9 shots (do not touch
   b1-b9). This rule is checked in review (main session + audit), not by a gate. When one plate serves two beats (e.g. `m1a` for b10 and b12), give the second use a different framing
   (other `zoom`/`origin` on `SC`, or the other camera move) so it does not look like a repeat.
   Card-only beats (no plate shot today: b8, b15, b19, b25, b37, b49, b57, b75, b78; pinned in the gate as
   `CARD_ONLY`) keep their cards; the plate their spec names goes on a plate shot of a neighbouring beat in the
   same minute window (gate 1), except b19 (step 7). Every other mapped beat must show its own plate (gate 2).
3. Beats with a plate shot that no spec names (e.g. b14, b24, b74, b85): use a fresh plate from the SAME minute
   window (`start // MINUTE`) whose story fits the beat's voice line (`docs/briefs/ink-ep02-card-fix2-beats.md`),
   with a framing different from its other uses. Never an old `s*` plate (gate 3).
4. Beat b82 uses its own plate `m9d_hands_in_town` (now on disk). Mind step 8 around b80-b82 (`m9c` then `m9d`).
5. Beat b83 is the story callback to the party deck (gate 3 requires it): keep `SC(S01)` there and add it to `CALLBACKS` with the
   reason (`{'ink/scenes/s01_deck_party.png': 'b83 callback: back on the party deck'}`, key = the plate path
   `reuse_errors` sees).
6. A fresh plate whose own mapped beats sit in two minute windows (`m8c`: b75 window 8, b76 window 9; check
   `m1d`, `m2d`, `m6d`, `m7d`, `m10a` too; a single beat whose own shots span two windows also counts, e.g. `m1d`
   for b18) may go in `CALLBACKS` with the reason "drawn for bN and bM" or "bN spans two windows". No other
   plate goes in `CALLBACKS` (gate 4). Any other cross-window use is a reuse lint error: pick a same-window plate.
7. b19 is a map photo today; gate 1 needs every plate on screen inside its own minute window, so `m2a_blockade` either becomes b19's plate shot (keep
   the chip) or goes on another minute-2 plate shot where the story fits (the blockade line). Say which.
8. No two consecutive shots share a background (a previous attempt failed the lint on `m9c` twice in a row) (existing lint). Alternate plates inside a minute when needed.
9. Stale comments that name an old plate for a rewired beat get updated.

10. Fit is judged per beat, not per minute. A previous attempt was rejected because these plates did not fit
   their voice line; do not repeat them: b68 'OVER THE SIDE' (body thrown overboard) on `m8c_bound_on_deck` (prisoners,
   drawn for b75-b76, before anyone is captured); b43 'JOLT!' (the anchor cut) on `m5c_closing_gap` (drawn for b47);
   b14 'THE REAL ONE' on `m1b_gov_study`; b40 (fuses under his hat) on `m4c_ships_surrender`; b55's second shot
   'DECK LOOKS EMPTY' on `m6b_navy_hurting`. For every unmapped beat or second shot, read the voice line in
   `docs/briefs/ink-ep02-card-fix2-beats.md` and each same-window plate's `goal`/`action`, and pick the plate whose
   picture shows what the voice says at that moment; if none fits, pick the one that is least wrong (a calm
   establishing plate of the same place) and say so in the table.

# Done when
- All gates pass: `--draft` writes full.json; the lint baseline reports no new errors (the old plates' reuse
  errors should vanish); the diffgate, `ep02_cardfix2_check.py` and `ep02_plates_check.py` print OK; tsc is clean;
  every listed node test passes. `python tools/ink/ep02_full_shots.py` (without --draft) should now exit 0 or
  list only snapshot errors; paste its real output (not only the --draft log).
- The diff touches only the two allowed files.
- The reply includes a table: one row per plate shot in b10-b87 with f0, beat, plate, camera, overlay position,
  and for unmapped beats why that plate fits the voice line. The reviewer and the main session check fit against
  the spec `goal`/`action` of each plate and the beat's voice line; a plate that does not match its beat fails.
