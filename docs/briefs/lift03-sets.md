---json
{"id": "lift03-sets", "type": "normal", "risk": "low", "repo": "D:/AI-video", "gates": ["python -m pytest -q -p no:cacheprovider tests/test_lift03_sets.py", "python scripts/tsc_in_worktree.py"], "protected": ["tests/**", "conftest.py", "**/conftest.py", "pytest.ini", "pyproject.toml", "setup.cfg", "scripts/**", "out/**", "public/**", "package.json", "package-lock.json", "episodes/**", "docs/**", "src/compositions/**", "src/v2/**", "src/types.ts", "tsconfig.json"], "context_files": ["src/v7/Lift.tsx", "src/v7/light.tsx", "src/v5/Forest.tsx", "src/v2/cast.ts", "src/v7/FloodEscape.tsx", "docs/lift03-beat-sheet.md", "tests/test_lift03_sets.py"]}
---
# Goal

Part 3 (finale) of the original Thai rom-com "Stuck in a lift with my ex" (`docs/lift03-beat-sheet.md`)
needs five new background sets. Parts 1-2 sets live in `src/v7/Lift.tsx`. Add the new five in the
same file and the same flat-vector style, reusing its shared pieces (`LiftInterior`, `Lobby`, `Cast`,
`Phone`, `CatPhone`, `Speaker`, `Mops`, `Chair`, `Hand`, `DeskPhone`, `SnackBag`, `Glow`, `Darkness`,
`label`, `mix`, `phase`). Each set is one `React.FC<EnvProps>` that draws the set AND its actors;
acting is driven by `progress` (p, 0..1 across the narration line), exactly like the existing sets.

Frame is 1080x1920 portrait. Captions sit at about y 1350-1700, so keep faces and key props above
y 1300.

# Files

Work only inside your current working directory (a throwaway worktree).

1. `src/v7/Lift.tsx`: add the five exported sets below (names are fixed by the contract test).
2. `src/v5/Forest.tsx`: import them and register them in the `ENV5` map, on the existing lift line.
3. `src/v7/light.tsx`: one `CAST_LIGHT` entry per new bg id, beside the other lift entries.

Change nothing else. Do not touch `tests/` (protected contract), `episodes/` or `src/v2/` (cast looks).

# Characters (looks already exist in `src/v2/cast.ts`, pass via `who`)

- default (no `who`): จ๊าบ, the lead.
- `fon`: แพรว, his ex. Cream blouse (`#E7E1D6`), long hair.
- `liftGuard`, `cleaner`, `cleaner2`, `runner` (night-shift worker): the lobby audience.

Poses: idle, wave, shock, yawn, armsCrossed, point, think, hold. Expressions: smile, sleepy,
shock, sweat, flat, angry, gross, talk. A back view = `turn` near ±1.

# The five sets

1. **`liftCatCall` (`LiftCatCall`)**: the reveal. She answers the video call and turns the screen to him.
   - `LiftInterior` lit 0, two-shot like `LiftRing`: จ๊าบ left (x 340), แพรว right (x 740), s .88,
     feet y 1510. Phone-lit: strong cool `Glow` (`#8fc4ff`) at the phone, `Darkness` elsewhere.
   - Foreground insert centre-right (about x 470-830, y 700-1220): `CatPhone` at about 3.6x,
     turned to face the camera (the screen faces him and us).
   - Screen = a generic pet-camera video call, no real app branding: a slightly fish-eye dark room,
     an orange tabby cat face filling most of the screen, a small red "LIVE" dot top-left (dot only,
     no word), a red battery "1%" top-right.
   - The cat's mouth opens wide over p .4-.65 (the "meow"), ears flick on a `frame` sine. Draw 2-3
     small sound arcs from the phone while the mouth is open.
   - Acting:
     - จ๊าบ: `sweat` at p<.4, `shock` p .4-.75 (leaning in, turn .3), then `flat` (stunned).
     - แพรว: `flat` at p<.6, then `smile` (small, embarrassed), turn -.3 toward him.

2. **`liftCafeKitten` (`LiftCafeKitten`)**: flashback, all is lost. Shown, not told.
   - Same flashback treatment as `LiftCafe` (sepia multiply + dark vignette), own ids.
   - p<.5, "first date": night street outside the cafe. Warm glass cafe door on the right (x 620-980,
     y 420-1240) with a small hanging sign, dark pavement, one street lamp. A tiny grey-white stray
     kitten sits by the door (about x 560, y 1180, ~90 px tall). จ๊าบ crouches toward it (x 360,
     s .6, `smile`), แพรว beside him (x 470, s .6, `smile`, turn .4).
   - p>=.5, "the gift": cut to a close shot of a pet carrier on a table (about x 200-880, y 700-1250),
     the grown cat's face behind the grille, a red ribbon bow on top, and a small card leaning on it
     with `label` text "ให้จ๊าบ ❤️". No people in this half.
   - The card and the bow are drawn after the treatment so they stay the brightest, warmest thing.

3. **`lobbyDoorsOpen` (`LobbyDoorsOpen`)**: the doors open on the whole lobby. They heard everything.
   - Camera inside the lift looking out. Lift interior frame (walls/floor) around a doorway
     (about x 200-880, y 300-1280). Lights are on: cool even light inside.
   - The doors part over p 0-.3 (two panels sliding apart, like `LiftDoors` in reverse).
   - Through the doorway: the warm lobby with the crowd standing in a row facing in, all frozen:
     `liftGuard` centre, `cleaner` and `cleaner2` either side, `runner` with `SnackBag`. Expr
     `shock` at p<.6, then `sweat`/`flat` (awkward). Scale ~.5 so they read as outside.
   - p>=.5: แพรว (back view, turn ~1, s .9) walks out from the foreground through the doors, y
     shrinking slightly as she goes (mix over p .5-1). The crowd shuffles apart for her (x offsets).
   - จ๊าบ stays foreground left edge (x 170, s .95, `flat`, turn .5 toward her).

4. **`liftDoorsStop` (`LiftDoorsStop`)**: the moral decision, a mirror of Part 1's `liftDoors`.
   - Same camera as `LiftDoors` but the lit lobby (warm, `#ffcf89` glow) is visible through the gap,
     with แพรว small and back-turned beyond it (x 560, s .4).
   - The doors close over p .1-.7 (copy the `close` maths shape from `LiftDoors`).
   - p>=.7: his arm shoots in from the lower left (a sleeve path like the arm in `LiftPanel`, his
     green top `#4a7159`) and his `Hand` grips the right door edge. The doors bounce back open a
     little (like the `-.16` bounce in `LiftDoors`).
   - จ๊าบ foreground left (x 230, y 1320, s .8): `sweat` before, `shock` then set jaw (`flat`) after.

5. **`lobbyExit` (`LobbyExit`)**: the answer, the cheer, and the final image.
   - `Lobby` wide, speaker active until p .8, then inactive.
   - Guard behind the counter (as in `LobbyHold`), pose `hold`, expr `talk` to the `DeskPhone`
     (receiver off-hook) at p<.5, then `smile`.
   - `cleaner`, `cleaner2`, `runner` at the left near the lift: pose `wave`, expr `smile`, small
     `frame`-sine bob (the cheer).
   - จ๊าบ and แพรว side by side, backs to camera (turn ~1), walk from centre foreground (x 520/620,
     s .75, y 1500) out of frame right-to-left over p .3-1, `walk` while moving, close together.
   - Final frames (p>.85): the couple are gone; the guard alone at the counter smiling at the
     dark speaker.

# Light entries (`CAST_LIGHT`)

- `liftCatCall`: same as `liftRing`.
- `liftCafeKitten`: same as `liftCafe`.
- `lobbyDoorsOpen`, `lobbyExit`: same as `lobbyGuard`.
- `liftDoorsStop`: same as `liftDoors`.

# Rules

- Lighting, as in Parts 1-2: paint lit colours, then `Darkness` where practicals don't reach, BEFORE
  actors. Every glow has a visible source. Faces never pure black. Rom-com, no horror look.
- Every gradient/clip/filter id is prefixed `lift-<bg>-` (SVG ids are document-global).
- No text except "ให้จ๊าบ ❤️", "1%" and the existing floor numbers.
- Compact one-line JSX like the existing sets is fine. Comment the why, not the what.
- No new dependencies. Do not try to render (no browser in the sandbox).
- If an API you need does not exist, STOP and report instead of editing protected files.

# Done when

Both gates pass: `python -m pytest -q -p no:cacheprovider tests/test_lift03_sets.py` and
`python scripts/tsc_in_worktree.py`.
