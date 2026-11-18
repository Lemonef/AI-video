---json
{"id": "ink-card-lib-2h1fix2", "type": "creative", "risk": "low", "repo": "D:/AI-video", "gates": ["python tools/tsc_in_worktree.py", "node --test tests/ink/cardlib.test.mjs tests/ink/cardlib2a.test.mjs tests/ink/cardlib2b.test.mjs tests/ink/cardlib2c.test.mjs tests/ink/cardlib2d.test.mjs tests/ink/cardlib2e.test.mjs tests/ink/cardlib2f.test.mjs tests/ink/cardlib2g.test.mjs tests/ink/cardlib2h1.test.mjs tests/ink/cardlib2h1fix.test.mjs tests/ink/cardlib2h1fix2.test.mjs tests/ink/v11b.test.mjs"], "protected": ["tests/**", "docs/**", "videos/**", "public/**", "tools/**", "package.json", "package-lock.json", "tsconfig.json", "engine/ink/parts/shots/**", "engine/ink/parts/shots_v10/**", "engine/ink/parts/shots_v11b/**", "engine/ink/parts/cardlib/demo.json", "engine/ink/parts/doodle.tsx", "engine/ink/parts/cards.tsx", "engine/ink/parts/layouts/tokens.ts", "engine/ink/parts/layouts/doc.tsx", "engine/ink/parts/layouts/docLayout.ts", "engine/ink/parts/layouts/map.tsx", "engine/ink/parts/layouts/mapLayout.ts", "engine/ink/parts/layouts/transform.tsx", "engine/ink/parts/layouts/transformLayout.ts", "engine/ink/parts/layouts/scale.tsx", "engine/ink/parts/layouts/scaleLayout.ts", "engine/ink/parts/layouts/ring.tsx", "engine/ink/parts/layouts/ringLayout.ts", "engine/ink/compositions/**", "engine/ink/Root.tsx", "engine/ink/ink/**", "engine/ink/rig/**", "engine/ink/parts/schema.ts", "engine/ink/parts/elements.tsx", "engine/ink/parts/layouts/grid.tsx", "engine/ink/parts/layouts/gridLayout.ts", "engine/ink/parts/layouts/ring.tsx", "engine/ink/parts/layouts/ringLayout.ts", "engine/ink/parts/cardlib/demo2.json"], "context_files": ["engine/ink/parts/icons.tsx", "tests/ink/cardlib2h1fix.test.mjs", "tests/ink/cardlib2h1fix2.test.mjs"], "plan_check": "docs/briefs/ink-card-lib-2h1fix2.plancheck.md"}
---
# Goal
Redraw ONLY the `man` icon's head and face. Job 2h1-fix made his body, suit, bowler and size right, but
at card size his face reads as a black beard. Root cause: his skin head is about 49 x 45 units, and every
shape carries the shared icon outline, which is LINE (9 px) at any icon size, i.e. 9*200/160 = 11.25 icon
units at the 160 px card size (about 5.6 units of ink spill on EACH side of every shape). His 6-unit
eyes, nose and mouth packed into 20 units therefore merge into one ink blob. Fix: a bigger head, two TINY
eye fills (the outline itself turns them into dots), ONE smile stroke, no nose, and every gap measured
AFTER adding the outline.

# Files
- EDIT `engine/ink/parts/icons.tsx` - change ONLY the body of the man case (its art and highlight lines).
  The face case and every other line stay byte-identical.

Nothing else changes.

# Contract
`tests/ink/cardlib2h1fix2.test.mjs` plus every earlier card test (cardlib, 2a..2h1, 2h1fix, v11b) must
pass; never edit any test. Read both 2h1fix tests first: they measure every path's coordinates (Q/C
control points count). STROKE = 11.25 and CLEAR = STROKE/2 = 5.625 are the test's constants.
Numbers enforced (2h1fix2):
- Every `d` in the man case AND the man highlight string use ONLY absolute M L Q C Z (no lowercase/relative,
  no H/V/S/A/T); the highlight is a single-quoted string starting with M. Every number is a plain decimal
  (-12 or 3.5) separated by spaces only (no commas): no '.5', exponents or run-ons like -10-30. Every segment
  repeats its letter explicitly with exactly its numbers (M/L 2, Q 4, C 6, Z 0): no implicit repeats.
- Paint order: the head path comes BEFORE the eyes path and the smile path (SVG paints in source order).
  Keep the order of the man section below: dome, brim, head, eyes, smile, suit, legs, shoe.
- The man case is bare paths only: every element is a self-closing path with exactly a d attribute then a
  fill attribute (a brace expression or "none"), inside one fragment; no opacity, style, transform, group,
  extra attribute or conditional. Form: <path d="M.. Z" fill={INK}/> or <path d="M.. Q.." fill="none"/>,
  no space before the slash; the case is art = <> ...paths... </>; then the highlight line, then break;.
- All points inside -100..100; man spans at least 90 wide and 175 tall; EVERY sub-path (each M..)
  of every path whose fill is not "none" ends with Z (not only the last one).
- No PAPER fill anywhere in the man case (he has no paper part; a paper shape could only cover the face).
- Every fill is exactly one of `{INK}`, `{base(INK)}`, `{DOODLE.x}`, `{base(DOODLE.x)}` or `"none"` (x a
  palette key); no other expression. The head fill is exactly `{base(DOODLE.skin)}`.
- Head = the tallest `{base(DOODLE.skin)}` shape: at least 60 wide and 70 tall.
- Exactly 2 INK sub-paths lie fully inside the head's bounding box (the eyes); each is 2..6 wide AND
  2..6 tall; visible gap between them (right.x0 - left.x1 - STROKE) at least STROKE; same level; each eye
  keeps CLEAR from the head box sides and top after STROKE (min(x0 - head.x0, head.x1 - x1) - STROKE, y0 - head.y0 - STROKE).
- Every INK sub-path NOT fully inside the head box whose outlined x-range overlaps the eyes (hat dome,
  brim, suit) leaves CLEAR visible skin above the eye band (eyeTop - y1 - STROKE) if it starts above the
  eye bottom, else below it (y0 - eyeBottom - STROKE). So the brim must be wider than the head box and stay
  wholly above the eyes.
- Exactly 1 fill-none sub-path lies fully inside the head box (the smile), at least 16 wide; visible
  gap to the eyes (smile.y0 - eyeBottom - STROKE) and to the chin (head.y1 - smile.y1 - STROKE) each at
  least CLEAR. The smile sub-path is exactly `M x y Q cx cy x y` (one quadratic, nothing else), bending
  down: cy - max(y0, y1) is 2..12; side gaps to the head outline (x0 - head.x0 - STROKE, head.x1 - x1 -
  STROKE) each at least CLEAR. Its two ENDPOINTS are at least 16 apart in x and the control x lies strictly
  between them (a retraced line fails).
- No other INK or fill-none `<path>` (tie, buttons, ear, hair) may lie fully inside the head box.
- Eyes and smile sit inside the REAL head contour (the head path flattened, not its box): every sampled
  point of each eye and of the smile is inside the head shape, and its distance to the head contour minus
  STROKE is at least CLEAR.
- No other shape of ANY fill (INK, grey, skin, paper; the `highlight` string included; a same-geometry copy of
  an eye or the smile in another path counts as another shape) may contain an
  eye or smile point, and every other shape's contour stays at least STROKE + CLEAR (16.875 units) from
  every eye and smile point. So collar, tie, hat band and glint must all keep that distance from the face.
  "Contain" uses SVG's default nonzero fill rule (winding number), so a shape traced twice still counts as covering.
Still enforced from 2h1fix: at least 9 paths, base() main fill, one highlight, paths only, no strokeWidth.

# man - target coordinates (these satisfy every number above; hand-drawn Q curves are fine)
- Bowler: INK dome about x -27..27, y -99..-80. INK brim band about x -42..42, y -82..-72 (wider than
  the head, so not inside the head box; visible gap to the eyes -52+72-11.25 = 8.75). A DOODLE.grey hat
  band is fine.
- Head: closed `base(DOODLE.skin)` shape, use this contour (box x -38..38, y -84..-2, 76 x 82):
  `M-30 -80 Q0 -84 30 -80 Q38 -66 38 -44 Q36 -16 20 -6 Q0 -2 -20 -6 Q-36 -16 -38 -44 Q-38 -66 -30 -80 Z`
  (small hand-drawn wobble is fine if the face numbers below still hold). Its top tucks under the brim.
- Eyes: two closed INK fills about 4 x 4: left about x -18..-14, right x 14..18, both y -52..-48
  (visible gap 28 - 11.25 = 16.75; eye box side gap -18+38-11.25 = 8.75, box top gap -52+84-11.25 = 20.75). Do NOT make them bigger; the outline makes them read as dots.
- Smile: ONE fill-none stroke, e.g. `M-10 -30 Q0 -24 10 -30` (x -10..10, y -30..-24 with the control
  point). Gap to eyes -30+48-11.25 = 6.75, to chin -2+24-11.25 = 10.75, box side -10+38-11.25 = 16.75. No nose, moustache, beard, teeth.
- Body: keep the 2h1-fix suit, tie, buttons, arms, hands, legs and shoes, shifted down so the collar
  meets the chin (suit about y -2..46, legs to about y 86, shoes to about y 96). Everything closed. No
  collar, tie or suit point higher than y -4 (it must stay 16.875 from the smile, lowest smile y -24).
- Highlight: one short paper glint on the bowler DOME, e.g. `M-16 -93 Q-10 -96 -4 -96` (a glint on the
  face would crowd the eye). These exact coordinates (dome, brim, head, eyes, smile, suit from y -2,
  this glint) were checked to pass all 8 tests of cardlib2h1fix2.

# Done when
- All gates pass; every test file unchanged; `tsc` clean; icons.tsx ASCII-only.
- Only the man case body changed.
- Still CardLibrary2 frame 1160 (scale: hotel vs man): the man's face reads at a glance as a calm human
  face (two dots + a smile on skin) under the bowler, nothing clipped, no dark blob.
- No placeholder or "simple version". Work only inside the repo.
