---json
{"id": "ink-card-lib-2h3", "type": "creative", "risk": "low", "repo": "D:/AI-video", "gates": ["python tools/tsc_in_worktree.py", "node --test tests/ink/cardlib.test.mjs tests/ink/cardlib2a.test.mjs tests/ink/cardlib2b.test.mjs tests/ink/cardlib2c.test.mjs tests/ink/cardlib2d.test.mjs tests/ink/cardlib2e.test.mjs tests/ink/cardlib2f.test.mjs tests/ink/cardlib2g.test.mjs tests/ink/cardlib2h1.test.mjs tests/ink/cardlib2h1fix.test.mjs tests/ink/cardlib2h1fix2.test.mjs tests/ink/cardlib2h2.test.mjs tests/ink/cardlib2h3.test.mjs tests/ink/v11b.test.mjs"], "protected": ["tests/**", "docs/**", "videos/**", "public/**", "tools/**", "package.json", "package-lock.json", "tsconfig.json", "engine/ink/parts/shots/**", "engine/ink/parts/shots_v10/**", "engine/ink/parts/shots_v11b/**", "engine/ink/parts/cardlib/demo.json", "engine/ink/parts/doodle.tsx", "engine/ink/parts/cards.tsx", "engine/ink/parts/layouts/tokens.ts", "engine/ink/parts/layouts/doc.tsx", "engine/ink/parts/layouts/docLayout.ts", "engine/ink/parts/layouts/map.tsx", "engine/ink/parts/layouts/mapLayout.ts", "engine/ink/parts/layouts/transform.tsx", "engine/ink/parts/layouts/transformLayout.ts", "engine/ink/parts/layouts/scale.tsx", "engine/ink/parts/layouts/scaleLayout.ts", "engine/ink/parts/layouts/ring.tsx", "engine/ink/parts/layouts/ringLayout.ts", "engine/ink/compositions/**", "engine/ink/Root.tsx", "engine/ink/ink/**", "engine/ink/rig/**", "engine/ink/parts/schema.ts", "engine/ink/parts/elements.tsx", "engine/ink/parts/layouts/grid.tsx", "engine/ink/parts/layouts/gridLayout.ts", "engine/*.ts", "engine/Root.tsx", "engine/components/**", "engine/compositions/**", "engine/ink/parts/layouts/**", "engine/ink/parts/shots*", "_archive/**", "remotion.config.ts", ".gitignore"], "context_files": ["engine/ink/parts/icons.tsx", "engine/ink/parts/schema.ts", "engine/ink/parts/elements.tsx", "engine/ink/parts/cardlib/demo2.json", "tests/ink/cardlib2h3.test.mjs"], "plan_check": "docs/briefs/ink-card-lib-2h3.plancheck.md"}
---
# Goal
Add TWO new doodle icons, `arrow` (a straight arrow pointing right) and `bentarrow` (a crooked zigzag
arrow), and show them inside a real layout: a new demo2 split shot HONEST vs CROOKED (the "an honest
path vs a crooked one" beat). Same finish as batch 1's best icons (tower, hat, mask, crown): same outline
weight, chunky marker fill, one paper glint, fills the icon box, reads at a glance at 160 px.

# Files
- EDIT engine/ink/parts/icons.tsx - add | 'arrow' | 'bentarrow' to IconName right after 'chair', and
  TWO new cases ('arrow', then 'bentarrow'), each art + highlight + break, placed after the chair case and
  before default:. Every other line stays byte-identical (face, man and chair included; the shared
  wrapper <g>, base() and the switch too: no opacity, transform or conditional anywhere outside the two
  new cases - the test hashes the rest against main).
- EDIT engine/ink/parts/cardlib/demo2.json - APPEND one shot (index 14) and raise f1 from 1260 to
  1350. Shots 0-13 stay byte-identical and the top level keeps exactly part, f0, f1, shots.

Nothing else changes.

# Contract
`tests/ink/cardlib2h3.test.mjs` (with cardlib, cardlib2a..2h2 incl. 2h1fix2, v11b) must pass; never edit any test.
Read it first. Numbers it enforces:
- IconName keeps all 23 earlier names, adds arrow and bentarrow, no duplicates.
- Each new case: base() main fill, at least 2 `<path>` parts and 3 sub-paths (`M` moves), exactly one
  non-empty `highlight`, no rect/circle/ellipse, no transform=, no strokeWidth.
- Every `d` AND each highlight string use ONLY absolute M L Q C Z, with ONE explicit letter per segment
  followed by exactly its plain decimal numbers (M/L 2, Q 4, C 6, Z 0; -12 or 3.5, separated by spaces only, no commas;
  no '.5', exponents, run-ons or implicit repeats). Every sub-path of a non-"none" path ends with Z.
- All points (highlight included) inside -100..100. arrow spans at least 170 wide and 70..130 tall;
  bentarrow at least 150 wide and 150 tall.
- arrow: the rightmost point of its base() shape (the tip) sits within a quarter of that shape's height of
  its vertical middle.
- arrow head TAPERS: measure the body's vertical thickness on vertical slices x = tip - k. At tip-10 it is
  at most 0.3 of the widest slice found in tip-70..tip, at tip-30 at most 0.65, and that widest head slice is
  at least 1.5x the shaft slice at the body's x middle (target 88 head vs about 35 shaft; a blunt mallet fails).
- Each body (both icons) covers at least 0.2 of its own bounding box (no zero-area retraced outline).
- Each body is a SIMPLE closed contour: flattened, no two non-adjacent edges cross, touch or overlap (no
  retraced branch, spur, figure-8 or pinch point; the outline would draw it as an extra ink line).
- bentarrow: its highlight has at least 4 points, its y direction flips at least 2 times, every leg moves
  at least 30 in y, and every sampled highlight point lies inside the base() body. That body (each
  sub-path) covers at most 0.45 of its own bounding box (a bent band, not a block). Its highlight is
  straight segments only: `M x y` then `L x y` legs, no Q/C.
- bentarrow ends in a real ARROWHEAD: rotate the body so x runs along the highlight's LAST leg; the tip is the
  furthest point along it; the widest slice in tip-70..tip is at least 1.5x the band slice at tip-70 (target
  66 vs 34) and the slice at tip-10 at most 0.3 of that widest one.
- Each highlight (both icons) is ONE glint: exactly one sub-path (one M, no Z), drawn length at most 90
  (arrow) / 200 (bentarrow), every sampled point inside the body (nonzero) and at least STROKE/2 (5.625)
  from the body contour. It is a PAPER stroke over the body, so many strokes or a glint on the outline fail.
- Exactly ONE filled shape per new icon: the body, fill `{base(DOODLE.x)}` (x a palette key). Every other
  path is `fill="none"` (speed lines, ticks). No INK, PAPER or second colour fill.
- Spans (box above) are measured on the base() body only; every point of every path still sits in -100..100.
- Every fill="none" point lies OUTSIDE the body (SVG nonzero fill rule) and its distance to the body
  contour (closing edge included) minus STROKE (= LINE*200/160 = 11.25) is at least CLEAR (5.625), i.e.
  16.875 units of centre-line clearance, so the shared outline never merges a stroke into the body.
- The body `d` is exactly ONE sub-path: one M, one Z at the end (SVG sums winding across sub-paths, so a
  second sub-path could cancel or double the fill).
- Exactly 2 fill-none sub-paths per icon (counted across all fill="none" paths), each with drawn length
  in (0, 45], and any two of them at least STROKE + CLEAR (16.875) apart at their closest points, so the
  strokes never stack or merge into an ink patch.
- Bare paths only: each case is `art = <>` + paths + `</>;` then `highlight = '...';` then `break;`;
  each path is exactly `<path fill={..} d=".."/>` (house order, or d first), fill a brace expression of
  letters/dots/parens or "none"; no fillOpacity, opacity, style, groups or extra attributes.
- icons.tsx ASCII-only.

# House rules (read tower, hat, mask, crown, chair first and match them)
- `<path>` only, shared outline from the wrapping `<g>` (never set a stroke width).
- Hand-drawn: slightly uneven Q curves and corners, no ruler-perfect symmetry.

# arrow - fixture-checked target (these exact paths pass all 9 tests)
```
<path fill={base(DOODLE.blue)} d="M-88 -16 Q-40 -19 30 -16 L28 -44 L90 0 L28 44 L30 16 Q-40 19 -86 16 Q-92 0 -88 -16 Z"/>
<path fill="none" d="M-99 -40 Q-82 -42 -64 -40 M-99 40 Q-82 42 -64 40"/>
highlight = 'M-70 -9 Q-40 -11 -10 -10';
```
A fat blue shaft with a big triangular head, two speed lines behind the tail (above and below the shaft,
clear of it), a paper glint along the top of the shaft. Small hand-drawn changes are fine if every number above holds.

# bentarrow - fixture-checked target (these exact paths pass all 9 tests)
```
<path fill={base(DOODLE.yellow)} d="M-97 -61 L-39 37 L0 -18 L29 32 L14 41 L70 69 L74 7 L59 16 L4 -82 L-37 -25 L-67 -79 Z"/>
<path fill="none" d="M46 -96 Q58 -98 68 -94 M60 -72 Q72 -74 82 -70"/>
highlight = 'M-74 -58 L-38 0 L2 -42 L30 4';
```
A yellow lightning-style zigzag band (down, up, down) ending in an arrow head at the bottom right, two
little motion ticks in the empty top-right corner (clear of the band), a paper glint riding the band's
centre line in straight legs.

# demo2.json - append shot 14
`{"f0": 1260, "f1": 1350, "bg": {"card": true}, "els": [{"t": "split", "step": 12, "left": {"icon":
"arrow", "label": "HONEST"}, "right": {"icon": "bentarrow", "label": "CROOKED"}, "vs": "VS", "at": 1266}]}`
- the WHOLE shot is exactly this literal (no cam or other extra shot key; step 12, vs VS, one element), so both sides have entered long before frame 1300;
  match the multi-line formatting of the existing split shot (index 3). Top-level `f1` = 1350. Shot 13 is
a transform shot, so no layout repeats back to back.

# Done when
- All gates pass; every test file unchanged; `tsc` clean; icons.tsx ASCII-only.
- Only the files above changed; shots 0-13 of demo2.json byte-identical; face/man/chair untouched.
- Stills CardLibrary2 frames 1300 and 1340 (split, both icons in, labels shown): the left reads as a
  straight arrow and the right as a crooked zigzag arrow, both about icon size, nothing clipped or
  overlapping. Also judge them at the real 160 px icon size: a strong silhouette, the shared outline
  not merging any stroke into the body, same finish as the best batch-1 icons.
- No placeholder or "simple version". Work only inside the repo.
