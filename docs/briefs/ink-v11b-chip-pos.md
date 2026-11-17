---json
{"id": "ink-v11b-chip-pos", "type": "normal", "risk": "low", "repo": "D:/AI-video", "gates": ["python tools/tsc_in_worktree.py", "node --test tests/ink/v11b.test.mjs tests/ink/v11b-chip.test.mjs"], "protected": ["tests/**", "docs/**", "videos/**", "public/**", "package.json", "package-lock.json", "tsconfig.json", "engine/ink/parts/shots/**", "engine/ink/parts/shots_v10/**", "tools/ink/make_v10_shots.py", "engine/ink/parts/cards.tsx", "engine/ink/parts/icons.tsx", "engine/ink/parts/elements.tsx", "engine/ink/Root.tsx", "engine/ink/ink/**", "engine/ink/rig/**"], "context_files": ["engine/ink/parts/schema.ts", "engine/ink/parts/doodle.tsx", "engine/ink/compositions/InkParts.tsx", "tools/ink/make_v11b_shots.py", "tests/ink/v11b-chip.test.mjs", "tests/ink/v11b.test.mjs"]}
---
# Goal
In Video B (composition InkEp01V11B), the two "TOWERS SOLD" HUD chips (shots 12874 and 14370) sit at the
default top-left corner and cover the headline words of those shots. Add an optional per-shot chip
position so those two chips sit bottom-left instead. Every other chip (the v10 chips such as
"VICTOR LUSTIG") keeps the current top-left placement, and the v10 cut (InkEp01Full) renders exactly as
today. The protected contract is `tests/ink/v11b-chip.test.mjs`; read it first, it must pass unchanged.

# Files
- `engine/ink/parts/schema.ts`
- `engine/ink/parts/doodle.tsx`
- `engine/ink/compositions/InkParts.tsx`
- `tools/ink/make_v11b_shots.py`
- `engine/ink/parts/shots_v11b/p16.json` and `engine/ink/parts/shots_v11b/p19.json` (written by running the generator)

# Steps
1. `schema.ts`: add `chipPos?: 'tl' | 'bl'` to the `Shot` type, next to `chip`/`chipAt`. Absent = 'tl'.
2. `doodle.tsx`: `DoodleChip` takes an optional `pos?: 'tl' | 'bl'` prop (default 'tl'). 'tl' keeps today's
   style exactly (left 48, top 40). 'bl' uses the same left inset and anchors to the bottom edge with the
   same inset as the top (bottom = the top inset value). Name the inset once as a constant and use it for
   both, so they cannot drift. Update the comment above the component ("HUD chip top-left") to describe both.
3. `InkParts.tsx`: `BoiledChip` passes `shot.chipPos` through to `DoodleChip` as `pos`. Keep the slide-in
   from the left and the opacity fade as they are.
4. `make_v11b_shots.py`: in the "Add TOWERS SOLD HUD chips" block, set `s['chipPos'] = 'bl'` on both
   shots (12874 and 14370). No other shot gets the key.
5. Run `python tools/ink/make_v11b_shots.py`; commit the regenerated JSON (only p16.json and p19.json
   should change).

# Done when
- Both gates pass; `tests/ink/v11b-chip.test.mjs` and `tests/ink/v11b.test.mjs` unchanged and green.
- `python tools/ink/make_v11b_shots.py` exits 0 and re-running it gives no diff.
- v10 data, `make_v10_shots.py` and `cards.tsx` untouched; a shot with no `chipPos` renders its chip exactly as before.
- Work only inside the repo; touch only the files listed above.
