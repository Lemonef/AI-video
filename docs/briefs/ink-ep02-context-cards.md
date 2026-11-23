---json
{"id": "ink-ep02-context-cards", "type": "creative", "risk": "high", "repo": "D:/AI-video", "gates": ["python tools/ink/ep02_full_shots.py --draft", "python -I tests/ink/ep02_lint_baseline.py", "python tools/tsc_in_worktree.py", "node --test tests/ink/cardlib.test.mjs tests/ink/cardlib2a.test.mjs tests/ink/cardlib2b.test.mjs tests/ink/cardlib2c.test.mjs tests/ink/cardlib2d.test.mjs tests/ink/cardlib2e.test.mjs tests/ink/cardlib2f.test.mjs tests/ink/cardlib2g.test.mjs tests/ink/cardlib2h1.test.mjs tests/ink/cardlib2h1fix.test.mjs tests/ink/cardlib2h1fix2.test.mjs tests/ink/cardlib2h2.test.mjs tests/ink/cardlib2h3.test.mjs tests/ink/directed.test.mjs tests/ink/ep02-context-card.test.mjs tests/ink/ep02-meter.test.mjs tests/ink/inkshort.test.mjs tests/ink/rig.test.mjs tests/ink/v11b-chip.test.mjs tests/ink/v11b.test.mjs"], "protected": ["tests/**", "docs/**", "videos/**", "public/**", "package.json", "package-lock.json", "tsconfig.json", "engine/ink/Root.tsx", "engine/ink/parts/shots/**", "engine/ink/parts/shots_v*/**", "engine/ink/parts/shots_ep02min1/**", "engine/ink/parts/elements.tsx", "engine/ink/ink/**", "engine/ink/rig/**", "tools/ink/make_ep02_min1_shots.py", "tools/ink/make_v10_shots.py", "tools/ink/make_v11b_shots.py"], "context_files": ["docs/specs/2026-11-24-ep02-context-cards-design.md", "tests/ink/ep02-context-card.test.mjs", "tests/ink/ep02_lint_baseline.py", "tools/ink/ep02_full_shots.py", "tools/ink/make_ep02_min1_shots.py", "engine/ink/compositions/InkParts.tsx", "engine/ink/parts/schema.ts", "engine/ink/parts/icons.tsx", "engine/ink/parts/doodle.tsx", "engine/ink/parts/elements.tsx"], "seed_files": ["videos/pastly-life/02-blackbeard-ink/assets/full-hybrid/timeline.json"]}
---
# Goal
The owner rejected the ep02 explain cards: "It only have white card and each white card only have like white
then something place on it then word done like cmon bro no design like nothing it should be explaining
according to context". Implement the design in `docs/specs/2026-11-24-ep02-context-cards-design.md` so every
ep02 card sits on its beat's world (blurred, washed scene plate + a hand-drawn paper sheet + vignette), the
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
     cover`, full stage) with a CSS blur, then a PAPER-coloured wash layer at opacity `bg.wash ?? CARD_WASH`,
     then the sheet: a PAPER panel inset from the stage edges by `SHEET_INSET`, `borderRadius: HAND_RADIUS`,
     a hard ink offset shadow (`${s}px ${s}px 0 ${INK}`, same recipe as the meter: export `METER_SHADOW` from
     `doodle.tsx` and reuse it, do not copy the number), a `LINE`-wide ink border, and a slight tilt
     `SHEET_TILT` deg. `<Elements shot={shot}/>` draws on top, unrotated, at the same stage coordinates as
     today (the sheet frames them; element coordinates must not move).
   - When `bg.under` is not set, keep today's flat PAPER card exactly (other compositions unchanged).
   - The Vignette now draws on every shot, cards included: remove the `!('card' in bg) &&` guard.
   - New tokens are named constants at the top of the card section, each derived from `LINE` or the stage
     size with a one-line comment: `CARD_BLUR` (px), `CARD_WASH` (0..1, the plate must stay recognisable,
     target ~0.55), `SHEET_INSET` (px, ~6% of stage height), `SHEET_TILT` (deg, under 1.5). No bare literals.
3. **Period icons** (`icons.tsx`): add `sloop`, `chain`, `chest`, `cannon`, `barrel`, `pistol`, `cutlass`,
   `flag`, `scroll`, `lantern`, `anchor` to the `IconName` union and as `case` entries in the same ±100 unit
   box, same stroke weight, same `DOODLE` palette and `highlight` convention as the existing icons. Period-true
   1718 shapes: sloop = single mast, gaff sail, no funnel; flag = black flag with a skull-and-bones silhouette
   kept simple; chest = wooden treasure chest with iron straps; cannon = black iron barrel on a wooden carriage;
   cutlass = curved short sword; pistol = flintlock; scroll = rolled parchment; lantern = ship's lantern;
   anchor = fisherman's anchor; chain = 3-4 heavy iron links; barrel = wooden barrel with hoops.
   Keep the old icons in the file (other episodes use them).
4. **Generator** (`tools/ink/ep02_full_shots.py`):
   - Remap modern icons in ep02 card content: `ship` -> `sloop`, `padlock` -> `chain`, `hat` -> `flag` (or the
     cast sprite where the beat is about a person), `hotel`/`factory` -> `chest` or `barrel` to fit the beat
     wording, `suitcase` used as cargo -> `barrel` or `chest`. Read each beat's text in the timeline to pick.
     Add the modern names to `BANNED_ICONS` so the lint stops them coming back.
   - Add one `under` post-pass in `build()`, right after `add_meters(shots, tl)` and before the lint loop: for
     each card shot, `bg['under']` = the plate path of the nearest non-card shot with a `plate` bg in the same
     beat; if the beat has none, the previous plate shot; if none before, the next one. One helper, no
     per-card literals. Photo bgs do not count (the test requires `ink/scenes/*.png`).
   - Cards whose elements are only `sprite` and/or `words` become on-scene shots: replace `CARD` with the
     beat's scene plate (same helper as above, as `{'plate': path, 'zoom': [1.0, 1.06]}` via the existing
     `SC`-style helper or an equivalent dict), keep the sprite and the words. Do this in the `P` content (the
     source), not as a hidden post-pass, so the lint loop sees the real shot types.
   - All lints must stay as strict as now. `python -I tests/ink/ep02_lint_baseline.py` defines the allowed
     pending errors (`reuse:` and `minN: K split/transform cards outside`); any other lint error is a failure.
     If a conversion triggers "same background as previous shot" or similar, fix the content (pick another
     plate in the beat, or reorder), never loosen a lint constant.
   - Regenerate `full.json` with `--draft`.
5. Do not change element animation, meter, chip, `elements.tsx`, other compositions, or scene plates.

# Done when
- All gates pass: `--draft` writes full.json, the lint baseline reports no new errors, tsc clean, and every
  listed node test passes, including `tests/ink/ep02-context-card.test.mjs`.
- The diff touches only the allowed files.
- Report: the token values and their derivations, the icon remap per beat (beat id, old -> new), the list of
  converted sprite+words cards (beat id, plate used), and the card count before and after.
