---json
{"id": "ink-card-lib-2g", "type": "normal", "risk": "low", "repo": "D:/AI-video", "gates": ["python tools/tsc_in_worktree.py", "node --test tests/ink/cardlib.test.mjs tests/ink/cardlib2a.test.mjs tests/ink/cardlib2b.test.mjs tests/ink/cardlib2c.test.mjs tests/ink/cardlib2d.test.mjs tests/ink/cardlib2e.test.mjs tests/ink/cardlib2f.test.mjs tests/ink/cardlib2g.test.mjs tests/ink/v11b.test.mjs"], "protected": ["tests/**", "docs/**", "videos/**", "public/**", "tools/**", "package.json", "package-lock.json", "tsconfig.json", "engine/ink/parts/shots/**", "engine/ink/parts/shots_v10/**", "engine/ink/parts/shots_v11b/**", "engine/ink/parts/cardlib/demo.json", "engine/ink/parts/icons.tsx", "engine/ink/parts/doodle.tsx", "engine/ink/parts/cards.tsx", "engine/ink/parts/layouts/tokens.ts", "engine/ink/parts/layouts/doc.tsx", "engine/ink/parts/layouts/docLayout.ts", "engine/ink/parts/layouts/map.tsx", "engine/ink/parts/layouts/mapLayout.ts", "engine/ink/parts/layouts/transform.tsx", "engine/ink/parts/layouts/transformLayout.ts", "engine/ink/parts/layouts/scale.tsx", "engine/ink/parts/layouts/scaleLayout.ts", "engine/ink/parts/layouts/ring.tsx", "engine/ink/parts/layouts/ringLayout.ts", "engine/ink/compositions/**", "engine/ink/Root.tsx", "engine/ink/ink/**", "engine/ink/rig/**"], "context_files": ["engine/ink/parts/cards.tsx", "engine/ink/parts/elements.tsx", "engine/ink/parts/schema.ts", "engine/ink/parts/doodle.tsx", "engine/ink/parts/layouts/tokens.ts", "engine/ink/parts/layouts/ringLayout.ts", "engine/ink/parts/layouts/ring.tsx", "engine/ink/parts/cardlib/demo2.json", "tests/ink/cardlib2g.test.mjs"]}
---
# Goal
Add ONE new card layout, `grid` (one odd one out): a block of the same icon pops in cell by cell, one
cell holds a different icon, then a red hand-drawn circle rings that odd cell, then a caption. It is the
"one honest man among the masks" beat of the Eiffel ink video. One layout, its own files, the same
finish as batch 1's best cards and jobs 2d/2e/2f.

# Files
- NEW `engine/ink/parts/layouts/gridLayout.ts` - pure layout: validation, timing chain, positions,
  sizes. Imports only from ./tokens and types from ../schema. No React, no remotion.
- NEW `engine/ink/parts/layouts/grid.tsx` - the renderer.
- EDIT `engine/ink/parts/schema.ts` - add GridEl and add it to the El union.
- EDIT `engine/ink/parts/elements.tsx` - one grid case line and its import.
- EDIT `engine/ink/parts/cardlib/demo2.json` - APPEND one shot (index 11) and raise f1 by 90. The
  existing 11 shots stay byte-identical.

Nothing else changes.

# Contract
`tests/ink/cardlib2g.test.mjs` (with cardlib, cardlib2a..2f, v11b) must pass; never edit any test.
Read it first: it bundles gridLayout.ts with esbuild and calls it for real.

# schema.ts
`export type GridEl = {t: 'grid'; x: number; y: number; w: number; icon: IconName; cols: number; rows: number; odd: {index: number; icon: IconName}; at: number; step: number; label?: string};`

# gridLayout.ts
Named constants, one per meaning, each with a one-line comment; no bare numbers except 0, 1, 2:
- `CARD_W = 1920`, `CARD_H = 1080` (mirror ringLayout.ts), `GRID_FILL = 0.8` (icon size per pitch),
  `MAX_ICON = 200`, `COLS_MIN = 2`, `COLS_MAX = 6`, `ROWS_MIN = 1`, `ROWS_MAX = 4`.
- Exported `POP_FRAMES = 8` (mirrors cards.tsx, change together; the test checks it), exported
  `CIRCLE_FRAMES = 10`, `LABEL_FADE = 6` (mirrors cards.tsx).
- `CIRCLE_PAD` (red circle radius beyond the odd icon half-size), `LABEL_GAP`.

`export const gridLayout = (el: GridEl)` returns:
- `pitch = el.w / el.cols` (same pitch across and down), `size = min(pitch * GRID_FILL, MAX_ICON)`.
- `cells[i] = {x, y, size, icon, at}` for i in 0..cols*rows-1, row-major: `col = i % cols`,
  `row = floor(i / cols)`, `x = el.x + (col - (cols - 1) / 2) * pitch`,
  `y = el.y + (row - (rows - 1) / 2) * pitch`, `icon = el.odd.icon` when `i === el.odd.index` else
  `el.icon`, `at = el.at + i * el.step`.
- `circleX`, `circleY` = the odd cell's x, y; `circleAt = last cell at + POP_FRAMES`,
  `circleEnd = circleAt + CIRCLE_FRAMES`, `circleRx = circleRy = size / 2 + CIRCLE_PAD`.
- `labelAt` = `circleEnd` when `el.label` is set else `null`; `labelX = el.x`;
  `labelY = el.y + rows * pitch / 2 + LABEL_GAP + LABEL` (below the block).
- `end` = `labelAt + LABEL_FADE` when a label is set, else `circleEnd`.
Throws a descriptive Error when: `cols` is not an integer in 2..6, `rows` is not an integer in 1..4,
`odd.index` is not an integer in 0..cols*rows-1, `odd.icon === el.icon` (no odd one out), `w` is not
positive finite, `step` is not a positive integer, any cell box (x, y +- size/2) leaves the card, or
the caption is wider than the card (`label.length * LABEL * CHAR_WIDTH > CARD_W`) or below it.

# grid.tsx
- Frames: `useCurrentFrame()` is SHOT-LOCAL (every shot is a Sequence) but every layout time is an
  absolute card frame, so take `const f = useCurrentFrame() + shotF0;` once and compare `f` to layout
  times (job 2d shipped with an invisible arrow and labels from mixing the two).
- `export const GridElement: React.FC<Props<GridEl>>`; read EVERY number from `gridLayout(el)`; no
  layout arithmetic of its own; no bare numbers except 0, 1, 2.
- Font sizes: import `LABEL` from ./tokens (never redefine it).
- Icons: one `<IconElement el={{t: 'icon', x, y, size, name: cell.icon, at}} .../>` per cell (batch-1
  pop), exactly as ring.tsx does for its slots.
- Red circle: doodle.tsx `scribbleEllipse(circleRx, circleRy)` translated to (circleX, circleY), RED,
  drawn on with cards.tsx `Draw` circleAt..circleEnd, the same LINE stroke as every card.
- Caption: cards.tsx `Text` LABEL at (labelX, labelY), fading in from labelAt over LABEL_FADE; skip
  when null.
- No `filter` attribute (the caller boils every element), no `<rect>`, `<circle>`, `<ellipse>`, no clipPath.

# elements.tsx
`case 'grid': return <GridElement {...common} el={el}/>;` importing from `./layouts/grid`.
Mind the import-cycle rule: no top-level use of other modules' exports.

# demo2.json - append shot 11
`{"f0": 990, "f1": 1080, "bg": {"card": true}, "els": [{"t": "grid", "x": 960, "y": 440, "w": 880,
"icon": "mask", "cols": 4, "rows": 3, "odd": {"index": 6, "icon": "badge"}, "at": 996, "step": 4,
"label": "ONE HONEST MAN"}]}` (match the formatting/fields of the existing shots). `f1` = 1080. With
step 4 the animation ends at local frame ~74, inside the 84-frame budget (90 - TAIL 6).

# Done when
- All gates pass; every test file unchanged; `tsc` clean; touched files ASCII-only.
- Only the files above changed; shots 0-10 of demo2.json byte-identical.
- Stills CardLibrary2 frames 1020 (masks popping row by row), 1055 (all 12 in, red circle drawing on
  the badge), 1070 (caption in): a neat 4x3 block of masks, the badge in row 2 clearly different and
  circled in red, ONE HONEST MAN centred below, nothing overlaps or leaves the card.
- Same finish as batch 1's best cards (stroke weight, wobble, hand feel). No placeholder or "simple
  version". Work only inside the repo.
