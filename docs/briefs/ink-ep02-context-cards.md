---json
{"id": "ink-ep02-context-cards", "type": "creative", "risk": "high", "repo": "D:/AI-video", "gates": ["python tools/ink/ep02_full_shots.py --draft", "python -I tests/ink/ep02_lint_baseline.py", "python -I tests/ink/ep02_cards_diffgate.py", "python tools/tsc_in_worktree.py", "node --test tests/ink/cardlib.test.mjs tests/ink/cardlib2a.test.mjs tests/ink/cardlib2b.test.mjs tests/ink/cardlib2c.test.mjs tests/ink/cardlib2d.test.mjs tests/ink/cardlib2e.test.mjs tests/ink/cardlib2f.test.mjs tests/ink/cardlib2g.test.mjs tests/ink/cardlib2h1.test.mjs tests/ink/cardlib2h1fix.test.mjs tests/ink/cardlib2h1fix2.test.mjs tests/ink/cardlib2h2.test.mjs tests/ink/cardlib2h3.test.mjs tests/ink/directed.test.mjs tests/ink/ep02-context-card.test.mjs tests/ink/ep02-meter.test.mjs tests/ink/inkshort.test.mjs tests/ink/rig.test.mjs tests/ink/v11b-chip.test.mjs tests/ink/v11b.test.mjs"], "protected": ["tests/**", "docs/**", "videos/**", "public/**", "package.json", "package-lock.json", "tsconfig.json", "engine/ink/Root.tsx", "engine/ink/parts/shots/**", "engine/ink/parts/shots_v*/**", "engine/ink/parts/shots_ep02min1/**", "engine/ink/parts/elements.tsx", "engine/ink/ink/**", "engine/ink/rig/**", "tools/ink/make_ep02_min1_shots.py", "tools/ink/make_v10_shots.py", "tools/ink/make_v11b_shots.py", "engine/ink/parts/cards.tsx", "engine/ink/compositions/InkProof.tsx", "engine/ink/parts/layouts/**", "engine/ink/parts/meter.mjs", "tools/tsc_in_worktree.py"], "context_files": ["docs/specs/2026-11-24-ep02-context-cards-design.md", "tests/ink/ep02-context-card.test.mjs", "tests/ink/ep02_lint_baseline.py", "tests/ink/ep02_cards_diffgate.py", "tests/ink/ep02_frames_snapshot.json", "tools/ink/ep02_full_shots.py", "tools/ink/make_ep02_min1_shots.py", "engine/ink/compositions/InkParts.tsx", "engine/ink/parts/schema.ts", "engine/ink/parts/icons.tsx", "engine/ink/parts/doodle.tsx", "engine/ink/parts/elements.tsx"], "seed_files": ["videos/pastly-life/02-blackbeard-ink/assets/full-hybrid/timeline.json"]}
---
# Goal
The owner rejected the ep02 explain cards: "It only have white card and each white card only have like white
then something place on it then word done like cmon bro no design like nothing it should be explaining
according to context". Implement the design in `docs/specs/2026-11-24-ep02-context-cards-design.md` so every
ep02 card sits on its beat's world (blurred, lightly washed scene plate + a translucent hand-drawn paper sheet + vignette), the
sprite+words-only cards become on-scene shots, and no card uses a modern (non-1718) icon.
The protected contract test `tests/ink/ep02-context-card.test.mjs` defines done. Read it first.

Files you may change: `engine/ink/compositions/InkParts.tsx`, `engine/ink/parts/schema.ts`,
`engine/ink/parts/icons.tsx`, `engine/ink/parts/doodle.tsx` (exports only, see step 1),
`tools/ink/ep02_full_shots.py`, and the generated `engine/ink/parts/shots_ep02full/full.json`
(regenerate it with `python tools/ink/ep02_full_shots.py --draft`; never hand-edit it). Work only inside the repo.

# Steps
1. **Schema** (`schema.ts:43`): the card variant becomes `{card: true; under?: string; wash?: number}`.
   No other type changes.
2. **Renderer** (`InkParts.tsx`, card branch near line 147 and the return at line 151):
   - When `bg.under` is set, draw in this order: the plate (`<Img src={staticFile(bg.under)}>`, `objectFit:
     cover`, full stage) with `filter: blur(${CARD_BLUR}px)`, then a PAPER-coloured wash layer at opacity
     `bg.wash ?? CARD_WASH`, then the sheet: a PAPER panel at opacity `SHEET_ALPHA` (translucent, so the scene
     still reads through it), inset from the stage edges by `SHEET_INSET`, `borderRadius: HAND_RADIUS`, a hard
     ink offset shadow (`${METER_SHADOW}px ${METER_SHADOW}px 0 ${INK}`), a `LINE`-wide ink border, and a slight
     tilt `SHEET_TILT` deg. `<Elements shot={shot}/>` draws on top, unrotated, at the same stage coordinates as
     today (the sheet frames them; element coordinates must not move).
   - `doodle.tsx`: change only `const METER_SHADOW` to `export const METER_SHADOW` (same value); import it in
     InkParts from `'../parts/doodle'`. Do not copy the number.
   - When `bg.under` is not set, keep today's flat PAPER card exactly (other compositions unchanged).
   - Vignette: replace `{!('card' in bg) && <Vignette/>}` with `{(!('card' in bg) || bg.under) && <Vignette/>}`
     on one line, so context cards get the vignette and legacy flat cards stay exactly as they are.
   - New tokens are named constants at the top of the card section, each `const TOK = <expr>; // derivation`
     on one line, derived from `LINE` or the stage size, no bare literals elsewhere:
     `CARD_BLUR` (px, small: the plate must stay recognisable), `CARD_WASH` (0..1, ~0.35),
     `SHEET_INSET` (px, ~12% of stage height, so a wide band of the scene shows around the sheet),
     `SHEET_ALPHA` (0..1, ~0.85), `SHEET_TILT` (deg, under 1.5).
3. **Period icons** (`icons.tsx`): add `sloop`, `chain`, `chest`, `cannon`, `barrel`, `pistol`, `cutlass`,
   `flag`, `scroll`, `lantern`, `anchor` to the `IconName` union and as `case '<name>':` entries in the same
   ±100 unit box, same stroke weight, same `DOODLE` palette and `highlight` convention as the existing icons.
   Period-true 1718 shapes: sloop = single mast, gaff sail, no funnel; flag = black flag with a skull-and-bones
   silhouette kept simple; chest = wooden treasure chest with iron straps; cannon = black iron barrel on a
   wooden carriage; cutlass = curved short sword; pistol = flintlock; scroll = rolled parchment; lantern =
   ship's lantern; anchor = fisherman's anchor; chain = 3-4 heavy iron links; barrel = wooden barrel with hoops.
   Keep the old icons in the file (other episodes use them). Icon size scaling (the spec's 1.3x idea) is OUT
   of scope: do not change any icon or element size.
4. **Generator** (`tools/ink/ep02_full_shots.py`):
   - Remap modern icons in ep02 card content (both `icon` keys and `{'t': 'icon', 'name': ...}` elements):
     `ship` -> `sloop`, `padlock` -> `chain`, `hat` -> `flag` (or the cast sprite where the beat is about a
     person), `hotel`/`factory`/`man` -> a period icon or cast sprite that fits the beat wording, `suitcase`
     -> `barrel` or `chest`. Read each beat's text in the timeline to pick. Add the modern names to
     `BANNED_ICONS` so the lint stops them coming back.
   - **Never mutate the shared `CARD` dict** (all cards reference the same object). Give each card its own
     dict: `shot['bg'] = {'card': True, 'under': plate}`.
   - Add one `under` post-pass in `build()`, right after `add_meters(shots, tl)` and before the lint loop:
     for each card shot, `under` = the `plate` of the nearest previous shot with a `plate` bg; if none before,
     the nearest next one. One helper, no per-card literals. Photo bgs do not count (the test requires
     `ink/scenes/*.png`). The contract test checks `under` is the nearest previous or next plate.
   - Cards whose elements are only `sprite` and/or `words` (the 17 f0s in
     `tests/ink/ep02_frames_snapshot.json` `sprite_words_cards`) become on-scene shots: replace `CARD` with a
     scene plate from the same minute's plate set that fits the beat words AND differs from both the previous
     and the next shot's background (else the "same background as previous shot" lint fires), as
     `{'plate': path, 'zoom': [1.0, 1.06]}` via the existing `SC`-style helper or an equivalent dict. Keep the
     sprite, the words and the timing. Do this in the `P` content (the source), not as a hidden post-pass,
     so the lint loop sees the real shot types.
   - Shot timing must not change: every shot keeps its `f0`/`f1` (the test compares with the snapshot).
   - All lints must stay as strict as now. `python -I tests/ink/ep02_lint_baseline.py` defines the allowed
     pending errors (`reuse:` for 11 named plates / 2 named photos, `minN: K split/transform` for min7/min9);
     any other lint error is a failure. If a conversion trips a lint, fix the content (pick another plate,
     or reorder), never loosen a lint constant.
   - Regenerate `full.json` with `--draft`.
5. Do not change element animation, meter, chip, `elements.tsx`, other compositions, or scene plates.

# Done when
- All gates pass: `--draft` writes full.json, the lint baseline reports no new errors, tsc clean, and every
  listed node test passes, including `tests/ink/ep02-context-card.test.mjs`.
- The diff touches only the allowed files (`tests/ink/ep02_cards_diffgate.py`).
- After merge the main session renders stills of several cards and eye-checks them; that review is not a gate.
- Report: the token values and their derivations, the icon remap per beat (beat id, old -> new), the list of
  converted sprite+words cards (beat id, plate used), and the card count before and after.
