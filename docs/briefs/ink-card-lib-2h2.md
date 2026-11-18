---json
{"id": "ink-card-lib-2h2", "type": "creative", "risk": "low", "repo": "D:/AI-video", "gates": ["python tools/tsc_in_worktree.py", "node --test tests/ink/cardlib.test.mjs tests/ink/cardlib2a.test.mjs tests/ink/cardlib2b.test.mjs tests/ink/cardlib2c.test.mjs tests/ink/cardlib2d.test.mjs tests/ink/cardlib2e.test.mjs tests/ink/cardlib2f.test.mjs tests/ink/cardlib2g.test.mjs tests/ink/cardlib2h1.test.mjs tests/ink/cardlib2h1fix.test.mjs tests/ink/cardlib2h2.test.mjs tests/ink/v11b.test.mjs"], "protected": ["tests/**", "docs/**", "videos/**", "public/**", "tools/**", "package.json", "package-lock.json", "tsconfig.json", "engine/ink/parts/shots/**", "engine/ink/parts/shots_v10/**", "engine/ink/parts/shots_v11b/**", "engine/ink/parts/cardlib/demo.json", "engine/ink/parts/doodle.tsx", "engine/ink/parts/cards.tsx", "engine/ink/parts/layouts/tokens.ts", "engine/ink/parts/layouts/doc.tsx", "engine/ink/parts/layouts/docLayout.ts", "engine/ink/parts/layouts/map.tsx", "engine/ink/parts/layouts/mapLayout.ts", "engine/ink/parts/layouts/transform.tsx", "engine/ink/parts/layouts/transformLayout.ts", "engine/ink/parts/layouts/scale.tsx", "engine/ink/parts/layouts/scaleLayout.ts", "engine/ink/parts/layouts/ring.tsx", "engine/ink/parts/layouts/ringLayout.ts", "engine/ink/compositions/**", "engine/ink/Root.tsx", "engine/ink/ink/**", "engine/ink/rig/**", "engine/ink/parts/schema.ts", "engine/ink/parts/elements.tsx", "engine/ink/parts/layouts/grid.tsx", "engine/ink/parts/layouts/gridLayout.ts", "engine/ink/parts/layouts/ring.tsx", "engine/ink/parts/layouts/ringLayout.ts"], "context_files": ["engine/ink/parts/icons.tsx", "engine/ink/parts/schema.ts", "engine/ink/parts/layouts/transformLayout.ts", "engine/ink/parts/cardlib/demo2.json", "tests/ink/cardlib2h2.test.mjs"], "plan_check": "docs/briefs/ink-card-lib-2h2.plancheck.md"}
---
# Goal
Add ONE new doodle icon, `chair`, and show it inside a real layout: a new demo2 transform shot
(TOWER becomes A SEAT, the "they sold pieces of the tower as souvenirs" beat). Same finish as batch
1's best icons (tower, hat, mask, crown): same outline weight, chunky marker fill, one paper glint,
fills the icon box, reads at a glance at 160 px.

# Files
- EDIT `engine/ink/parts/icons.tsx` - add `'chair'` to `IconName` and ONE new `case 'chair':` (art +
  highlight + break) placed before `default:`. Every other line stays byte-identical (the face and man
  cases from job 2h1-fix included).
- EDIT `engine/ink/parts/cardlib/demo2.json` - APPEND one shot (index 13) and raise `f1` from 1170 to
  1260. Shots 0-12 stay byte-identical.

Nothing else changes.

# Contract
`tests/ink/cardlib2h2.test.mjs` (with cardlib, cardlib2a..2h1fix, v11b) must pass; never edit any test.
Read it first. Numbers it enforces: chair has at least 3 `<path>` parts and at least 7 sub-paths
(`M` moves); all points inside -100..100; spans at least 120 wide and 170 tall; every `d` uses ONLY absolute
M L Q C Z commands (no lowercase/relative, no H/V/S/A/T; the highlight is measured too) and the chair case has no `transform=`;
every sub-path (each `M`) of a path whose fill is not "none" ends with Z; main fill through `base(...)`; one non-empty `highlight`; no rect/circle/
ellipse; icons.tsx ASCII-only.

# House rules (read tower, hat, mask, crown first and match them)
- `<path>` only, shared outline from the wrapping `<g>` (never set a stroke width). Main fill through
  `base(DOODLE.brown)`; small secondary fills may use DOODLE/INK/PAPER directly.
- Hand-drawn: slightly uneven Q curves and corners, no ruler-perfect symmetry.
- Exactly ONE `highlight = '<path>'`: a short paper glint on the top rail of the backrest.

# chair - a plain wooden kitchen chair, three-quarter view, fills the box
- Backrest: two upright back posts rising from the seat's back edge to about y -92, joined at the top
  by a curved top rail; TWO horizontal slats between the posts below it. All closed brown shapes.
- Seat: a closed brown parallelogram/trapezoid in perspective at about y 0..22, about x -62..62,
  its front edge lower and wider than its back edge; a slightly darker front edge band (closed shape)
  gives it thickness.
- Legs: FOUR closed brown legs from under the seat to the floor. The two front legs are longer and
  reach about y 92; the two back legs are shorter (they stand further away) and reach about y 70.
  About 10-12 units wide each, slightly tapered. One thin cross stretcher between the front legs.
- Wood grain: one or two fill-none strokes along the seat.
- Whole chair spans about x -64..64 and y -92..92. Sturdy and friendly, not a stick drawing.

# demo2.json - append shot 13
`{"f0": 1170, "f1": 1260, "bg": {"card": true}, "els": [{"t": "transform", "a": {"icon": "tower",
"label": "TOWER"}, "b": {"icon": "chair", "label": "CHAIR"}, "label": "A SEAT", "at": 1176,
"step": 18}]}` - match the multi-line formatting of the existing transform shot (index 8). Top-level
`f1` = 1260. Shot 12 is a scale shot, so no layout repeats back to back.

# Done when
- All gates pass; every test file unchanged; `tsc` clean; icons.tsx ASCII-only.
- Only the files above changed; shots 0-12 of demo2.json byte-identical; face/man untouched.
- Stills CardLibrary2 frames 1200 (tower in) and 1240 (the chair in, label shown): the chair clearly
  reads as a wooden chair, about the size of the tower, nothing clipped or overlapping.
- No placeholder or "simple version". Work only inside the repo.
