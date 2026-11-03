---json
{"id": "lift02-fix1", "type": "normal", "risk": "low", "repo": "D:/AI-video", "gates": ["python -m pytest -q -p no:cacheprovider tests/test_lift02_sets.py", "python scripts/tsc_in_worktree.py"], "protected": ["tests/**", "conftest.py", "**/conftest.py", "pytest.ini", "pyproject.toml", "setup.cfg", "scripts/**", "out/**", "public/**", "package.json", "package-lock.json", "episodes/**", "docs/**", "src/compositions/**", "src/v2/**", "src/types.ts", "tsconfig.json", "src/v5/**", "src/v7/light.tsx"], "context_files": ["src/v7/Lift.tsx", "docs/briefs/lift02-sets.md"]}
---
# Goal

Fix round 1 on two Part 2 sets in `src/v7/Lift.tsx`, found by reading rendered stills of the draft.
Edit ONLY the bodies of `LiftRing` and `LobbyPeak`. Change nothing else in the file or the repo.

Frame is 1080x1920. Captions cover about y 1350-1700.

# 1. `LiftRing`: the phone must read as HELD, and the cat hair must be visible

Seen in the draft: the 2.6x `CatPhone` sits at (730,1075), dead centre on แพรว's torso, so it looks
pasted onto her body. The `Hand` is drawn before the phone and hides behind it. The six cat-hair
strokes at about (800..816, 1230..1282) sit under the phone and cannot be seen.

Fix:
- Move the phone to her right-hand side (viewer's right), about `px=865, py=985`, scale 2.3. It may
  overlap her arm, but it must NOT cover her face (her face is around x 690-790, y 760-900).
- Draw the `Hand` AFTER the phone so the fingers wrap the BOTTOM edge of the case (fingers over the
  case's bottom ~15% only, never over the screen text). Add a short cream sleeve (`#E7E1D6`) cuff
  just below the hand so the hand clearly belongs to her.
- Move the hair strokes onto that visible sleeve cuff, below the phone, outside the phone's
  bounding box. Keep them pale grey (`#dfd8cf`), 6 strokes, unlabelled, and make them slightly
  thicker (`strokeWidth` 3) so they survive 540 px wide phone screens.
- Recentre both `Glow`s on the new phone position. Ring arcs: move them to the phone's LEFT edge,
  so they pulse into the space between the two characters.
- The call-screen text ("ที่รัก ❤️", "กำลังโทร…", red "2%") must stay fully visible.

# 2. `LobbyPeak`: the guard, chair and coffee cup are off the right edge

The outer transform is `translate(-95 -125) scale(1.16)`, so screen x = 1.16*x - 95. Anything with
x > ~930 is at or past the right edge. In the draft the guard (x 862..846) is cut in half, the chair
(x 950) is cut, and the coffee cup (x 970..992) never appears, although the narration says the
guard spills his coffee.

Fix:
- Guard: `x` from 790 to 775 (lean). Chair: x 870.
- Coffee cup: starts ON the counter top near the guard (about x 735, y 984) and falls in FRONT of
  the counter to the floor (end about x 760, y 1236) over the same `drop` phase. The splash ellipse
  and droplets move to the landing point.
- The cup and the splash must not be hidden behind any cast member: draw them after the casts.
- Keep cleaners, runner, snack bag and the gasp acting unchanged.

# Rules

- Same style as the rest of the file: compact JSX, comments say why, not what.
- No new SVG ids without the `lift-<bg>-` prefix. No new text.
- Do not try to render (no browser in the sandbox).

# Done when

Both gates pass: `python -m pytest -q -p no:cacheprovider tests/test_lift02_sets.py` and
`python scripts/tsc_in_worktree.py`.
