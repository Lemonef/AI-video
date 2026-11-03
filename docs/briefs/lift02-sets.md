---json
{"id": "lift02-sets", "type": "normal", "risk": "low", "repo": "D:/AI-video", "gates": ["python -m pytest -q -p no:cacheprovider tests/test_lift02_sets.py", "python scripts/tsc_in_worktree.py"], "protected": ["tests/**", "conftest.py", "**/conftest.py", "pytest.ini", "pyproject.toml", "setup.cfg", "scripts/**", "out/**", "public/**", "package.json", "package-lock.json", "episodes/**", "docs/**", "src/compositions/**", "src/v2/**", "src/types.ts", "tsconfig.json"], "context_files": ["src/v7/Lift.tsx", "src/v7/light.tsx", "src/v5/Forest.tsx", "src/v2/cast.ts", "src/v7/FloodEscape.tsx", "docs/lift02-beat-sheet.md", "tests/test_lift02_sets.py"]}
---
# Goal

Part 2 of the original Thai rom-com "Stuck in a lift with my ex" (`docs/lift02-beat-sheet.md`)
needs four new background sets. Part 1's ten sets live in `src/v7/Lift.tsx`. Add the new four in
the same file and the same flat-vector style, reusing its shared pieces (`LiftInterior`, `Lobby`,
`Cast`, `Phone`, `Speaker`, `Mops`, `Chair`, `Hand`, `Glow`, `Darkness`, `label`, `mix`, `phase`).
Each set is one `React.FC<EnvProps>` that draws the set AND its actors; acting is driven by
`progress` (p, 0..1 across the narration line), exactly like the existing lift sets.

Frame is 1080x1920 portrait. Captions sit at about y 1350-1700, so keep faces and key props above
y 1300.

# Files

Work only inside your current working directory (a throwaway worktree).

1. `src/v7/Lift.tsx`: add the four exported sets below (names are fixed by the contract test).
2. `src/v5/Forest.tsx`: register them in the `ENV5` map, on the existing lift line.
3. `src/v7/light.tsx`: one `CAST_LIGHT` entry per new bg id, beside the other lift entries.

Change nothing else. Do not touch `tests/` (protected contract) or `src/v2/` (cast looks).

# Characters (looks already exist in `src/v2/cast.ts`, pass via `who`)

- default (no `who`): จ๊าบ, the lead.
- `fon`: แพรว, his ex. Cream blouse (`#E7E1D6`), long hair.
- `liftGuard`, `cleaner`, `cleaner2`: the lobby audience from Part 1.
- `runner`: reused as the new night-shift worker (blue top). No new look.

Poses: idle, wave, shock, yawn, armsCrossed, point, think, hold. Expressions: smile, sleepy,
shock, sweat, flat, angry, gross, talk.

# The four sets

1. **`lobbyHold` (`LobbyHold`)**: the guard puts the rescue technician on hold.
   - `Lobby` wide, speaker active, `liftGuard` behind the counter as in `LobbyGuard` (p>.4 state).
   - NEW small desk-phone prop on the counter, left of the speaker (about x 470-560, y 960-1000).
   - p<.45: the phone rings. The receiver hops a few px on a `frame`-driven sine. Draw 3 ring arcs.
     The guard is `talk`, turned toward the phone.
   - p>=.45: the receiver lies off-hook on the counter beside the base. A small amber "hold" LED
     blinks on the base (`frame%20<10`). The guard turns to the speaker (turn -.55), pose `hold`,
     expr `smile`, leaning in.
   - Do not draw a receiver in his hand: Actor hand positions are not exposed.

2. **`liftCafe` (`LiftCafe`)**: flashback, eight months ago, at a cafe.
   - Own warm interior, not `LiftInterior`: back wall `#b58c63`, a counter with a menu board far
     right, and a round wooden table in the foreground filling about x 140-940, y 900-1250.
   - On the table: two coffee cups, and her phone lying face-up at the centre, about 3x the size of
     `Phone`. The case is soft pink (`#e9a3b6`) with two small cat-ear triangles on its top edge.
     The screen glows and shows `label` text "ที่รัก ❤️" plus a small notification bar.
   - จ๊าบ seated at the left behind the table (x ~300, s ~.7, turn .5 toward the phone). Expr
     `flat`, then `sweat` at p>.5.
   - แพรว small in the background at the counter (x ~860, s ~.38), back mostly turned
     (turn -.9), ordering.
   - Flashback treatment over the whole set: a sepia multiply rect plus a soft dark vignette.
     The phone screen glow is drawn after the treatment so it stays the brightest thing in frame.

3. **`liftRing` (`LiftRing`)**: her phone rings in the dark lift.
   - `LiftInterior` with lit 0, two-shot like `LiftQuestion`: จ๊าบ left (x 340), แพรว right (x 740),
     both s .88, feet at y 1510.
   - The phone is the key light: a strong cool `Glow` (`#8fc4ff`, about r 520) centred on the phone,
     drawn so both faces read blue on the phone side.
   - Foreground insert (lower right, about x 560-900, y 760-1260): her hand and cream sleeve (as
     `Hand`, rotated to grip from below) holding the phone at ~2.6x `Phone` size.
     - Pink cat-ear case, same as in `liftCafe`.
     - Call screen: `label` "ที่รัก ❤️" large, "กำลังโทร…" under it, and a red battery "2%" top
       right.
     - 5-6 short pale-grey hair strokes on the sleeve: the cat-hair clue. They must be visible but
       never labelled.
   - The phone vibrates: translate x by `Math.sin(frame*2.2)*4`. Ring arcs pulse from it.
   - Acting:
     - จ๊าบ: `shock` at p<.35, then `sweat`, turned toward the phone.
     - แพรว: `shock` at p<.2, then `flat`, looking down at the phone (turn -.3).

4. **`lobbyPeak` (`LobbyPeak`)**: the lobby audience peaks.
   - Same framing as `LobbyCrowd` (copy its outer transform). Mops already leaning (`Mops p={1}`).
   - The chair is placed by the speaker with the guard sitting near it. Both cleaners stand beside
     the speaker.
   - `runner` (night-shift worker) walks in from the left: x mix(-60, 300) over p 0-.35, `walk`
     while moving. Carries a NEW snack-bag prop (white plastic bag with a chip packet poking out)
     drawn at his side.
   - p>=.55, the gasp: everyone `shock`, leaning toward the speaker.
   - The guard's coffee cup (NEW prop on the counter edge) falls to the floor over p .55-.7 with a
     small brown splash at landing.
   - Earlier: guard `smile`, cleaners `talk`/`smile`, worker `idle`.

# Light entries (`CAST_LIGHT`)

- `lobbyHold`, `lobbyPeak`: same as `lobbyGuard`.
- `liftCafe`: warm, `{brightness:.9,saturate:.8,rim:'rgba(255,200,140,.45)',dx:4,dy:-3}`.
- `liftRing`: phone-lit, `{brightness:.8,saturate:.8,rim:'rgba(140,190,255,.55)',dx:4,dy:-2}`.

# Rules

- Lighting, as in Part 1: paint lit colours, then `Darkness` where practicals don't reach, BEFORE
  actors. Every glow has a visible source. Faces never pure black. Rom-com, no horror look.
- Every gradient/clip/filter id is prefixed `lift-<bg>-` (SVG ids are document-global).
- No text except "ที่รัก ❤️", "กำลังโทร…", "2%" and the existing floor numbers.
- Compact one-line JSX like the existing sets is fine. Comment the why, not the what.
- No new dependencies. Do not try to render (no browser in the sandbox).
- If an API you need does not exist, STOP and report instead of editing protected files.

# Done when

Both gates pass: `python -m pytest -q -p no:cacheprovider tests/test_lift02_sets.py` and
`python scripts/tsc_in_worktree.py`.
