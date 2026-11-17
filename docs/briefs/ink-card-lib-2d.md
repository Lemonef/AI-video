---json
{"id": "ink-card-lib-2d", "type": "normal", "risk": "low", "repo": "D:/AI-video", "gates": ["python tools/tsc_in_worktree.py", "node --test tests/ink/cardlib.test.mjs tests/ink/cardlib2a.test.mjs tests/ink/cardlib2b.test.mjs tests/ink/cardlib2c.test.mjs tests/ink/cardlib2d.test.mjs tests/ink/v11b.test.mjs"], "protected": ["tests/**", "docs/**", "videos/**", "public/**", "tools/**", "package.json", "package-lock.json", "tsconfig.json", "engine/ink/parts/shots/**", "engine/ink/parts/shots_v10/**", "engine/ink/parts/shots_v11b/**", "engine/ink/parts/cardlib/demo.json", "engine/ink/parts/icons.tsx", "engine/ink/parts/doodle.tsx", "engine/ink/parts/cards.tsx", "engine/ink/parts/layouts/tokens.ts", "engine/ink/parts/layouts/doc.tsx", "engine/ink/parts/layouts/docLayout.ts", "engine/ink/parts/layouts/map.tsx", "engine/ink/parts/layouts/mapLayout.ts", "engine/ink/compositions/**", "engine/ink/Root.tsx", "engine/ink/ink/**", "engine/ink/rig/**"], "context_files": ["engine/ink/parts/cards.tsx", "engine/ink/parts/elements.tsx", "engine/ink/parts/schema.ts", "engine/ink/parts/layouts/tokens.ts", "engine/ink/parts/layouts/mapLayout.ts", "engine/ink/parts/layouts/map.tsx", "engine/ink/parts/cardlib/demo2.json", "tests/ink/cardlib2d.test.mjs"]}
---
# Goal
Add ONE new card layout, `transform` ("A becomes B"): icon A pops in, a red cross strikes it out and
dims it, a thick hand-drawn ink arrow draws from A to B, icon B pops in, then a red caption. It is the
"the tower was sold for scrap" beat of the Eiffel ink video. One layout, its own files, the same finish
as batch 1's best cards (crossout, split, hero).

# Files
- NEW `engine/ink/parts/layouts/transformLayout.ts` - pure layout: validation, timing chain, positions,
  arrow paths. Imports only from ./tokens and types from ../schema. No React, no remotion.
- NEW `engine/ink/parts/layouts/transform.tsx` - the renderer.
- EDIT `engine/ink/parts/schema.ts` - add SlotIcon and TransformEl, add TransformEl to the El union.
- EDIT `engine/ink/parts/elements.tsx` - one transform case line and its import.
- EDIT `engine/ink/parts/cardlib/demo2.json` - APPEND one shot (index 8) and raise f1 by 90. The
  existing 8 shots stay byte-identical.

Nothing else changes.

# Contract
`tests/ink/cardlib2d.test.mjs` (with cardlib, cardlib2a, cardlib2b, cardlib2c, v11b) must pass; never
edit any test. Read it first: it bundles transformLayout.ts with esbuild and calls it for real.

# schema.ts
- `export type SlotIcon = {icon: IconName; label?: string; color?: Color};`
- `export type TransformEl = {t: 'transform'; a: SlotIcon; b: SlotIcon; label?: string; at: number; step: number};`

# transformLayout.ts
Named constants, one per meaning, each with a one-line comment; no bare numbers except 0, 1, 2:
- `CARD_W = 1920`, `CARD_H = 1080` (mirror mapLayout.ts), `ICON_SIZE = 320`, `A_X = 480` (= CARD_W / 4,
  derive it), `B_X = 1440` (= CARD_W * 3 / 4, derive it), `ICON_Y = 460`.
- Exported `CROSS_FRAMES = 10` and `POP_FRAMES = 8` - comment: mirror cards.tsx, change together (the
  test checks both). Exported `ARROW_DRAW = 10`. `LABEL_FADE = 6` (mirror cards.tsx).
- `ARROW_GAP` (clear space between an icon edge and the arrow ends), `ARROW_BOW` (shaft bow, a few px
  upward), `HEAD_LEN` (arrow-head barb length), `CAPTION_GAP` (main caption below the slot labels).

`export const transformLayout = (el: TransformEl)` returns:
- `aAt = el.at`, `crossAt = at + step`, `crossEnd = crossAt + CROSS_FRAMES`, `arrowAt = at + 2 * step`,
  `arrowEnd = arrowAt + ARROW_DRAW`, `bAt = arrowEnd`, `aLabelAt = aAt + POP_FRAMES`,
  `bLabelAt = bAt + POP_FRAMES`, `labelAt` = `bLabelAt` when `el.label` is set, else `null`,
  `end` = the last fade's end (`(labelAt ?? bLabelAt) + LABEL_FADE`).
- `a = {x: A_X, y: ICON_Y, size: ICON_SIZE}`, `b = {x: B_X, y: ICON_Y, size: ICON_SIZE}`.
- `arrowX1 = A_X + ICON_SIZE / 2 + ARROW_GAP`, `arrowX2 = B_X - ICON_SIZE / 2 - ARROW_GAP`, `arrowY = ICON_Y`.
- `arrowD` - the shaft: a gently bowed quadratic `M x1 y Q mid (y - ARROW_BOW) x2 y`.
  `headD` - two barbs from the tip (`M` ... `L` tip `L` ...), each HEAD_LEN long, angled back.
- `slotLabelY = ICON_Y + ICON_SIZE / 2 + LABEL` (the same place CrossoutElement puts its label),
  `labelX = CARD_W / 2`, `labelY = slotLabelY + CAPTION_GAP + LABEL`.
Throws a descriptive Error when: `step` is not a positive integer, `step < CROSS_FRAMES` (the arrow
would start before the cross finishes), `a.icon === b.icon`, or the caption is wider than the card
(`label.length * LABEL * CHAR_WIDTH > CARD_W`).

# transform.tsx
- `export const TransformElement: React.FC<Props<TransformEl>>`; read EVERY number from
  `transformLayout(el)`; no layout arithmetic of its own; no bare numbers except 0, 1, 2.
- A = the exact batch-1 crossout: `<CrossoutElement el={{t: 'crossout', x: a.x, y: a.y, size: a.size,
  icon: el.a.icon, label: el.a.label, at: aAt, crossAt}} .../>`. That gives the same pop, the same red
  bowed cross strokes, the same CROSS_DIM fade and the same label as batch 1. Do not redraw them.
- Arrow: cards.tsx `Draw` with `ink={INK}` on `arrowD` (progress arrowAt..arrowEnd), then `headD`
  drawing on in the last frames of the draw (or right after it). Same LINE stroke as every card.
- B: `<IconElement el={{t: 'icon', x: b.x, y: b.y, size: b.size, name: el.b.icon, color: el.b.color, at: bAt}} .../>`
  (batch-1 pop). B's label: cards.tsx `Text` at (b.x, slotLabelY), fading in from bLabelAt over LABEL_FADE.
- Caption: `Text` at (labelX, labelY), RED, fading in from labelAt; skip when labelAt is null.
- No `filter` attribute (the caller boils every element), no `<rect>`, no clipPath.

# elements.tsx
`case 'transform': return <TransformElement {...common} el={el}/>;` importing from `./layouts/transform`.
Mind the import-cycle rule: no top-level use of other modules' exports.

# demo2.json - append shot 8
`{"f0": 720, "f1": 810, "bg": {"card": true}, "els": [{"t": "transform", "a": {"icon": "tower",
"label": "TOWER"}, "b": {"icon": "scrap", "label": "SCRAP"}, "label": "SOLD FOR SCRAP", "at": 726,
"step": 18}]}` (match the formatting/fields of the existing shots; add a `words` element only if the
existing shots carry one). `f1` = 810. With step 18 the animation ends at local frame ~66, well inside
the 84-frame budget (90 - TAIL 6).

# Done when
- All gates pass; every test file unchanged; `tsc` clean; touched files ASCII-only.
- Only the files above changed; shots 0-7 of demo2.json byte-identical.
- Stills CardLibrary2 frames 745 (cross mid-draw on the dimmed tower), 775 (arrow complete, scrap
  popping), 800 (all labels + red caption): tower and scrap large and clear on either side, cross is
  the batch-1 red cross, arrow is a thick wobbly ink hand stroke that clears both icons, labels under
  each icon, caption centred below, nothing overlaps.
- Same finish as batch 1's best cards (stroke weight, wobble, hand feel). No placeholder or "simple
  version". Work only inside the repo.
