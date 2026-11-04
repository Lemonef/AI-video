---json
{"id": "lift03-fix1", "type": "normal", "risk": "low", "repo": "D:/AI-video", "gates": ["python -m pytest -q -p no:cacheprovider tests/test_lift03_fix1.py tests/test_lift03_sets.py tests/test_lift02_sets.py", "python scripts/tsc_in_worktree.py"], "protected": ["tests/**", "conftest.py", "**/conftest.py", "pytest.ini", "pyproject.toml", "setup.cfg", "scripts/**", "out/**", "public/**", "package.json", "package-lock.json", "episodes/**", "docs/**", "src/compositions/**", "src/v2/cast.ts", "src/v2/ui.tsx", "src/v2/Forest.tsx", "src/types.ts", "tsconfig.json"], "context_files": ["src/v7/Lift.tsx", "src/v7/light.tsx", "src/v5/Forest.tsx", "src/v7/FloodEscape.tsx", "src/v2/Character.tsx", "docs/lift03-beat-sheet.md", "tests/test_lift03_fix1.py"]}
---
# Goal

Owner review of lift-ex Part 3 (`docs/lift03-beat-sheet.md`) found four visual faults. Fix them in
the existing flat-vector style. Frame 1080x1920; keep faces and key props above y 1300.

# Fixes

1. **Hand helper (`src/v2/Character.tsx`).** Add and export `handAt(pose, side)` returning the hand
   point `{x, y}` in the character's local (unscaled) coordinates for a named pose and `'l' | 'r'`,
   using the SAME maths and constants as `<Limb>` and `torchLens()` (shoulder position, `UPPER_ARM`,
   `FOREARM`, the pose's `[shoulder, elbow]` angles). Change nothing else in that file. In
   `src/v7/Lift.tsx` add a small wrapper that maps it through an `Actor`'s `x`, `y`, `s` (and the
   mirror that `turn` < 0 applies, if the Actor flips) so a prop can be placed in a hand.

2. **No crossed arms.** The `armsCrossed` pose reads as a weird X on the chest. In `LiftAwkward`,
   `LiftBicker` and `LiftDoorsStop` use `idle` (or `hold` where a phone is held) instead. Do not
   edit the pose table.

3. **Phone in her hand, not on her chest.** In `LiftAwkward` (and anywhere else in the lift sets
   where แพรว holds the `Phone` while in `hold` pose) place the `Phone` with `handAt` at her right hand,
   scaled so it reads as a phone in a hand (about .55-.7 of its current size), slightly overlapping
   the fingers. It must not cover her torso.

4. **His own arm stops the doors (`LiftDoorsStop`).** Remove the separate sleeve path (`#4a7159`)
   and the free-floating `Hand`. Instead, from p .62, จ๊าบ steps toward the closing gap (x mix from
   his place to just left of the door edge over p .62-.72), pose `point` toward the doors (turn so
   the pointing arm reaches right), and a `Hand` is drawn at `handAt('point','r')` gripping the door
   edge. The doors bounce back open (keep the existing bounce). Before p .62 he stands still,
   `sweat`. After the grip, expr `flat` (set jaw).

5. **Climax set `lobbyGesture` (`LobbyGesture`).** NEW, wide lobby (`Lobby`), the moment he asks
   her in front of everyone:
   - จ๊าบ at the open lift on the left (the lift doors in `Lobby` are at about x 70-400), standing
     in the doorway (x ~235, s ~.55), pose `point` reaching toward her, expr `talk` at p<.6, then
     `sweat`.
   - แพรว centre-right (x ~700, s ~.6), BACK to camera and to him (`back`), stopped, not walking.
     At p>.7 she turns a little toward him (turn about -.3, still mostly away).
   - The crowd frozen between them, lower and smaller (guard behind the counter as in `LobbyHold`,
     `cleaner`, `cleaner2`, `runner` with `SnackBag` in a loose row about y 1260, s ~.45), all
     `shock`, heads turned toward him; mops leaning (`Mops p={1}`).
   - A soft warm spot `Glow` on him (the doorway light) so he is the brightest figure.
   - Register in `ENV5` and add `CAST_LIGHT` `lobbyGesture` same as `lobbyGuard`.

# Rules

- Lighting as the other lift sets: lit colours, `Darkness` before actors, every glow has a source.
- SVG ids prefixed `lift-<bg>-`. No new text in frame. No new dependencies. Do not render.
- Do not edit tests, episodes, the cast looks (`src/v2/cast.ts`) or the pose table.
- If an API you need does not exist, STOP and report instead of editing protected files.

# Done when

Both gates pass: the pytest gate in the header and `python scripts/tsc_in_worktree.py`.
