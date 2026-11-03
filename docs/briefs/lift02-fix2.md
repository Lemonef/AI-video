---json
{"id": "lift02-fix2", "type": "normal", "risk": "low", "repo": "D:/AI-video", "gates": ["python -m pytest -q -p no:cacheprovider tests/test_lift02_sets.py", "python scripts/tsc_in_worktree.py"], "protected": ["tests/**", "conftest.py", "**/conftest.py", "pytest.ini", "pyproject.toml", "setup.cfg", "scripts/**", "out/**", "public/**", "package.json", "package-lock.json", "episodes/**", "docs/**", "src/compositions/**", "src/v2/**", "src/types.ts", "tsconfig.json", "src/v5/**", "src/v7/light.tsx"], "context_files": ["src/v7/Lift.tsx", "docs/briefs/lift02-fix1.md"]}
---
# Goal

Fix round 2 on `LiftRing` and `LobbyPeak` in `src/v7/Lift.tsx`, found by reading draft-2 stills.
Edit ONLY those two set bodies. Frame 1080x1920; captions cover about y 1350-1700.

# 1. `LiftRing`: the hand floats, it is not attached to her

Draft 2: phone at (865,985) s 2.3 now reads, but the `Hand` at (865,1170) and the cream cuff rect
(827..903, 1238..1324) hang in the air beside her, not connected to her body. Her own arm hangs at
her side (her body is centred x 740, s .88).

Fix: replace the cuff rect with a FOREARM that joins her body.
- A cream (`#E7E1D6`) sleeve drawn as a thick rounded path (stroke width ~64, round caps, outline
  `#a9a196` via a slightly wider stroke underneath) from her elbow at about (838,1250) up to the
  wrist just under the hand at about (868,1188). The elbow end must overlap her torso's right edge so
  the arm visibly grows out of her body.
- Draw the sleeve BEFORE the `Hand` (hand on top), and AFTER the casts.
- The six cat-hair strokes go on this sleeve, along its length, pale grey `#dfd8cf`, `strokeWidth` 3.
- Everything else in `LiftRing` stays as it is (phone, text, glows, arcs, acting).

# 2. `LobbyPeak`: the coffee cup sits on cleaner2's face

Draft 2 at p<.55: the cup at (735,984) is drawn over the head of `cleaner2` (x 720..690, y 1300,
s .47) because the cup is drawn after the casts.

Fix:
- Cup starts on the counter top to the RIGHT of every head: about (850, 984), beside the guard
  (x 790..775), clear of cleaner2's head.
- It falls in front of the counter to about (845, 1236); move the splash ellipse and droplets to
  the new landing x.
- Keep drawing the cup after the casts so the fall is never hidden.

# Rules

- Compact JSX like the rest of the file; comments say why. No new text. New SVG ids need the
  `lift-<bg>-` prefix. Do not render.

# Done when

Both gates pass: `python -m pytest -q -p no:cacheprovider tests/test_lift02_sets.py` and
`python scripts/tsc_in_worktree.py`.
