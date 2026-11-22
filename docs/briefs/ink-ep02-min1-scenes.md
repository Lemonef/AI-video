---json
{"id": "ink-ep02-min1-scenes", "type": "normal", "risk": "low", "repo": "D:/AI-video", "gates": ["python tools/ink/make_ep02_min1_shots.py", "python tools/tsc_in_worktree.py", "node --test tests/ink/ep02-meter.test.mjs tests/ink/v11b-chip.test.mjs tests/ink/v11b.test.mjs"], "protected": ["tests/**", "docs/**", "videos/**", "public/**", "package.json", "package-lock.json", "tsconfig.json", "engine/ink/parts/shots/**", "engine/ink/parts/shots_v*/**", "engine/ink/parts/*.ts", "engine/ink/parts/*.tsx", "engine/ink/parts/*.mjs", "engine/ink/compositions/**", "engine/ink/Root.tsx", "engine/ink/ink/**", "engine/ink/rig/**", "tools/ink/make_v10_shots.py", "tools/ink/make_v11b_shots.py"], "context_files": ["tools/ink/make_ep02_min1_shots.py", "tools/ink/make_v11b_shots.py", "engine/ink/compositions/InkParts.tsx", "engine/ink/parts/schema.ts", "videos/pastly-life/02-blackbeard-ink/script/set-bible.md"]}
---
# Goal
ep02 minute 1 (`tools/ink/make_ep02_min1_shots.py`, two cuts: `hybrid` and `straight`) still uses the
3 old plates in `assets/ink/plates/` with pasted sprites. Eleven finished scene paintings and two
public-domain photos now exist. Swap every plate shot onto its scene or photo, drop the sprites on those
shots (characters are painted into the scenes), move the words/tags so they sit clear of the painted
figures, and give every non-card shot a survival-odds meter value. Card shots stay exactly as they are.
Only `tools/ink/make_ep02_min1_shots.py` changes. All its existing lints must stay green (fix the
content, never loosen a lint constant).

# Assets (paths relative to `ASSETS = videos/pastly-life/02-blackbeard-ink/assets`)
All scenes are 1672x941; `objectFit: cover` maps them to the 1920x1080 stage at scale 1.148, so the
stage coords below are already in stage px.
| Key | File | What is painted where (stage px) |
|---|---|---|
| s01 | ink/scenes/s01_deck_party.png | Blackbeard on a crate right ~(1300,500); crew drinking left ~(500,650) |
| s02 | ink/scenes/s02_inlet_lookout.png | sloop ~(960,470); two crew pointing right ~(1480,700) |
| s03 | ink/scenes/s03_deck_work.png | hands hauling rope + scrub brush, fills frame |
| s04 | ink/scenes/s04_hold_cower.png | two crew small left-centre ~(520,760); ladder right |
| s05 | ink/scenes/s05_rail_thinking.png | crewman silhouette centre vs moon ~(960,520) |
| s06 | ink/scenes/s06_bb_calm.png | Blackbeard left-centre on a barrel ~(760,560); 2 crew small right |
| s07 | ink/scenes/s07_guests_toast.png | small sloop centre-left ~(880,700) on wide water, tiny toasting figures |
| s08 | ink/scenes/s08_rail_whisper.png | two faces fill frame, Blackbeard right half ~(1250,480) |
| s09 | ink/scenes/s09_hold_carry.png | top-down; cocoa sacks ~(440,664); cotton bales ~(840,904) and ~(1320,264); crew + crate centre |
| s10 | ink/scenes/s10_bb_hips.png | Blackbeard from behind, left ~(560,520), spyglass raised; deck runs right |
| map | ink/photos/moseley_map_1733.jpg | 1733 map of North Carolina coast (3840x3040) |
| bb | ink/photos/bb_engraving_1724.jpg | 1724 engraving of Blackbeard, portrait (1920x3251), face in upper third |

`s11_inlet_spyglass.png` is NOT used in minute 1 (it shows the two sails of the 3:50 beat; using it
here spoils the turn). Do not reference it.

# Steps
1. Helpers, next to `PL`:
   - `SC(name, zoom=(1.0, 1.08), origin=None)`: like `PL` but for `ink/scenes/{name}.png`; asserts the
     file exists; returns `{'plate': 'ink/scenes/{name}.png', 'zoom': [...]}` (+ `origin` when given).
     Scenes render through the existing plate path of the renderer.
   - `PH(name, pos='50% 35%', push=(1.0, 1.08))`: port of `make_v11b_shots.py:40`, but for
     `ink/photos/{name}`; asserts the file exists; returns `{'photo': 'ink/photos/{name}', 'push': [...],
     'pos': pos}`.
   - Name constants for the eleven keys above (e.g. `S01 = 's01_deck_party'`) instead of string literals
     at each call site. Keep `DECK/HOLD/INLET` and `PL` only if still used; delete them if not.
2. `bg_key` returns `bg.get('plate') or bg.get('photo') or 'card'` (same as `make_v11b_shots.py:602`),
   and `framing()` returns `'photo'` for a photo background (port the branch from
   `make_v11b_shots.py:630`). Update the module docstring line that says ep02 has no photos.
3. Background swap, matched by the shot's CURRENT content (works for both cuts; frame starts stay as
   they are, they come from the timeline):
   | Current shot (plate + elements) | New bg | Camera | Words / tags (keep text, move to) |
   |---|---|---|---|
   | DECK, crew_sit_drink + bb_raise_tankard (b1, f0) | s01 | PUSH on Blackbeard (1300,480,1.22), as now | none |
   | INLET, crew_point + "BLACKBEARD'S SHIP" | s02 | PUSH on sloop (960,470,1.3) | TG at sloop (960, 330) |
   | DECK, crew_scrub/haul/scared (b2 work) | s03 | PAN as now | none |
   | HOLD, crew_cower + 'ONLY 2 KINDS' | s04 | zoom (1.0,1.1) as now | O at x=R, y=260 (crew are left) |
   | DECK, crew_thinking + 'STAY TO THE END' | s05 | PULL centred (960,520) | W at x=R, y=220 |
   | (straight only) INLET, bb_arms_crossed + 'TONIGHT' | s02 | PAN | W at x=L, y=240 |
   | DECK, bb_sit_barrel + 'NOT WORRIED' | s06 | PAN as now, drop origin 70% 60% | W at x=R, y=240 (BB is left) |
   | INLET, crew_lantern + chip OCRACOKE | photo `map`, pos '50% 50%', push (1.0,1.12) | none | chip unchanged |
   | INLET, crew_spyglass (b5 pan) | s07 | PAN(400,1300) as now | none |
   | DECK, crew_sit_drink + bb_drink + crew_laugh (b6 party) | s01, origin '30% 60%' | PUSH on crew (500,620) | none |
   | DECK, bath_merchant_toast + bb_laugh (b6 toast) | s07 | PUSH on figures (880,700,1.35) | none |
   | DECK, bath_gent_whisper + bb_lean_rail (b7) | s08 | PUSH as now | none |
   | DECK, bb_whisper (b7 tight) | s08 | PUSH 1.35 on (1250,480) | none |
   | HOLD, bb_shrug + 'GREAT LINE.'/'TERRIBLE PLAN' (hybrid b8) | photo `bb`, pos '50% 20%' | none | words at x=R side, as now if already right; else x=R |
   | (straight only) INLET, bb_dig + 'TREASURE' + X | photo `bb`, pos '50% 20%' | none | 'TREASURE' + its X at x=R |
   | HOLD, crew_carry_crate + COCOA/COTTON | s09 | as now | TG COCOA at (440,560), COTTON at (840,800) |
   | DECK, bb_hands_hips + ST 'MOST FEARED' (b10) | s10 | slow PUSH on (560,520) | ST at x=R, y=260 |
   Remove every `SP(...)` sprite from these shots. Card shots are untouched. If a "now" camera in the
   table conflicts with a lint, keep the lint green by adjusting that shot's camera, and say so in the
   report.
4. Meter on every non-card shot, label `'SURVIVAL ODDS'` (the lint needs a non-empty label). Value per
   beat, with `from` = the previous meter value so the bar eases between shots (the first meter shot
   has no `from`):
   | Beat | value |
   |---|---|
   | b1-b3 (hook, up to STAY TO THE END) | 12 |
   | b4 TONIGHT / NOT WORRIED | 35 |
   | b5 inlet (map, s07 pan) | 45 |
   | b6 party + toast | 60 |
   | b7 whisper (both shots) | 55 |
   | b8 GREAT LINE / TREASURE | 50 |
   | b9 COCOA/COTTON | 50 |
   | b10 MOST FEARED | 45 |
   Put the table in one named dict (beat -> value) and have the shot builders read it; no literal values
   at call sites.
5. Run `python tools/ink/make_ep02_min1_shots.py`; it must print `OK hybrid` and `OK straight` and exit
   0. Lints that may now bite: `FRAMINGS_MIN` (sprites are gone, so `framing()` may return `'object'`
   less often; the photo branch adds `'photo'`), no same background twice in a row (`bg_key` now
   distinguishes scenes and photos), `fit_sprites` (no sprites left on scene shots). Fix content, not
   constants.

# Done when
- All three gates pass; tests and `make_v11b_shots.py` unchanged.
- No shot in either cut references `ink/plates/` or `s11_inlet_spyglass`; every non-card shot has
  `meter.label == 'SURVIVAL ODDS'`; no `sprite` element remains on a scene or photo shot.
- Commit `tools/ink/make_ep02_min1_shots.py` plus the two JSON files it regenerates
  (`engine/ink/parts/shots_ep02min1/hybrid.json`, `straight.json`). Nothing else changes. Work only
  inside the repo.
