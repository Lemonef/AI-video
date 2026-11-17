---json
{"id": "ink-card-lib-2e", "type": "normal", "risk": "low", "repo": "D:/AI-video", "gates": ["python tools/tsc_in_worktree.py", "node --test tests/ink/cardlib.test.mjs tests/ink/cardlib2a.test.mjs tests/ink/cardlib2b.test.mjs tests/ink/cardlib2c.test.mjs tests/ink/cardlib2d.test.mjs tests/ink/cardlib2e.test.mjs tests/ink/v11b.test.mjs"], "protected": ["tests/**", "docs/**", "videos/**", "public/**", "tools/**", "package.json", "package-lock.json", "tsconfig.json", "engine/ink/parts/shots/**", "engine/ink/parts/shots_v10/**", "engine/ink/parts/shots_v11b/**", "engine/ink/parts/cardlib/demo.json", "engine/ink/parts/icons.tsx", "engine/ink/parts/doodle.tsx", "engine/ink/parts/cards.tsx", "engine/ink/parts/layouts/tokens.ts", "engine/ink/parts/layouts/doc.tsx", "engine/ink/parts/layouts/docLayout.ts", "engine/ink/parts/layouts/map.tsx", "engine/ink/parts/layouts/mapLayout.ts", "engine/ink/parts/layouts/transform.tsx", "engine/ink/parts/layouts/transformLayout.ts", "engine/ink/compositions/**", "engine/ink/Root.tsx", "engine/ink/ink/**", "engine/ink/rig/**"], "context_files": ["engine/ink/parts/cards.tsx", "engine/ink/parts/elements.tsx", "engine/ink/parts/schema.ts", "engine/ink/parts/doodle.tsx", "engine/ink/parts/layouts/tokens.ts", "engine/ink/parts/layouts/transformLayout.ts", "engine/ink/parts/layouts/transform.tsx", "engine/ink/parts/cardlib/demo2.json", "tests/ink/cardlib2e.test.mjs"]}
---
# Goal
Add ONE new card layout, `scale` (a balance scale; the heavier side drops): a hand-drawn scale draws on,
an icon pops onto each pan, then the beam tips toward the heavy side, then a red caption. It is the
"he bribed his way past the officials" beat of the Eiffel ink video. One layout, its own files, the same
finish as batch 1's best cards (crossout, split, hero) and job 2d's transform.

# Files
- NEW `engine/ink/parts/layouts/scaleLayout.ts` - pure layout: validation, timing chain, angle curve,
  geometry for any beam angle, the fixed paths. Imports only from ./tokens and types from ../schema.
  No React, no remotion.
- NEW `engine/ink/parts/layouts/scale.tsx` - the renderer.
- EDIT `engine/ink/parts/schema.ts` - add ScaleEl and add it to the El union (reuse the existing SlotIcon).
- EDIT `engine/ink/parts/elements.tsx` - one scale case line and its import.
- EDIT `engine/ink/parts/cardlib/demo2.json` - APPEND one shot (index 9) and raise f1 by 90. The
  existing 9 shots stay byte-identical.

Nothing else changes.

# Contract
`tests/ink/cardlib2e.test.mjs` (with cardlib, cardlib2a, cardlib2b, cardlib2c, cardlib2d, v11b) must
pass; never edit any test. Read it first: it bundles scaleLayout.ts with esbuild and calls it for real.

# schema.ts
`export type ScaleEl = {t: 'scale'; left: SlotIcon; right: SlotIcon; heavy: 'left' | 'right'; label?: string; at: number; dur: number};`

# scaleLayout.ts
Named constants, one per meaning, each with a one-line comment; no bare numbers except 0, 1, 2:
- `CARD_W = 1920`, `CARD_H = 1080` (mirror transformLayout.ts), `CX = CARD_W / 2`, `ICON_SIZE = 220`.
- Exported `SCALE_TILT = 12` (degrees). Exported `POP_FRAMES = 8` - comment: mirrors cards.tsx, change
  together (the test checks it). `LABEL_FADE = 6` (mirror cards.tsx).
- `DRAW_FRAMES = 10`, `LEFT_POP = 10`, `RIGHT_POP = 18`, `TILT_START = 30` (offsets from `at`).
- Geometry: `PIVOT_Y = 280`, `BEAM_HALF = 420` (pivot to beam end), `PAN_DROP = 240` (beam end to pan
  rim, vertical, constant), `PAN_HALF` (pan half width, wider than ICON_SIZE / 2), `PAN_DEPTH` (shallow
  bowl depth), `BASE_Y = 800` (foot of the post), `BASE_HALF` (base half width), `LABEL_GAP`.

`export const scaleLayout = (el: ScaleEl)` returns:
- Timing: `drawAt = at`, `drawEnd = at + DRAW_FRAMES`, `leftAt = at + LEFT_POP`, `rightAt = at + RIGHT_POP`,
  `tiltAt = at + TILT_START`, `tiltEnd = tiltAt + dur`, `leftLabelAt = leftAt + POP_FRAMES`,
  `rightLabelAt = rightAt + POP_FRAMES`, `labelAt` = `tiltEnd` when `el.label` is set else `null`,
  `end` = max of `tiltEnd` and the last label fade end (`(labelAt ?? rightLabelAt) + LABEL_FADE`).
- `angleAt(frame)` - degrees: 0 up to `tiltAt`, a smooth ease-in-out (e.g. `(1 - cos(pi * t)) / 2`, t
  clamped 0..1) to `sign * SCALE_TILT` at `tiltEnd`, held after. `sign = +1` for heavy right, `-1` for
  heavy left (SVG rotate: positive = clockwise = right end drops). Monotonic.
- `arms(deg)` - all moving geometry at that beam angle: `pivot {x: CX, y: PIVOT_Y}`, `left`/`right` beam
  ends (rotated about the pivot, length fixed), `leftPan`/`rightPan` = `{x: end.x, y: end.y + PAN_DROP}`
  (pans translate, never rotate), `leftChainD`/`rightChainD` (a V of two chain lines from the beam end
  to the pan rim corners), `leftPanD`/`rightPanD` (the bowl), `leftIcon`/`rightIcon` =
  `{x: pan.x, y: pan.y - ICON_SIZE / 2, size: ICON_SIZE}` (bottom resting on the pan rim),
  `leftLabel`/`rightLabel` = `{x: pan.x, y: pan.y + PAN_DEPTH + SMALL}`.
- Fixed paths: `baseD` (wobbly hand-drawn base mound at BASE_Y), `postD` (upright post CX from BASE_Y up
  to the pivot), `beamD` (the level beam, drawn from `CX - BEAM_HALF` to `CX + BEAM_HALF` at PIVOT_Y; the
  renderer rotates it about the pivot).
- `labelX = CARD_W / 2`, `labelY = BASE_Y + LABEL_GAP + LABEL` (below every pan label at any tilt).
Throws a descriptive Error when: `dur` is not a positive integer, `heavy` is neither 'left' nor
'right', `left.icon === right.icon`, or the caption is wider than the card
(`label.length * LABEL * CHAR_WIDTH > CARD_W`).

# scale.tsx
- Frames: `useCurrentFrame()` is SHOT-LOCAL (every shot is a Sequence) but every layout time is an
  absolute card frame, so take `const f = useCurrentFrame() + shotF0;` once and compare `f` to layout
  times (job 2d shipped with an invisible arrow and labels from mixing the two).
- `export const ScaleElement: React.FC<Props<ScaleEl>>`; read EVERY number from `scaleLayout(el)`; no
  layout arithmetic of its own; no bare numbers except 0, 1, 2.
- Frame structure drawn on with cards.tsx `Draw` (progress drawAt..drawEnd), the same LINE stroke and
  INK outline as every card: base + post filled `DOODLE.brown`, beam filled `DOODLE.brown` inside a
  `<g transform={rotate(angle, pivot.x, pivot.y)}>`, a small INK pivot dot.
- Chains + pans from `arms(angleAt(frame))` every frame; pans filled `DOODLE.grey`, INK outline.
- Icons: `<IconElement el={{t: 'icon', x, y, size, name: el.left.icon, color: el.left.color, at: leftAt}} .../>`
  (and right with rightAt), positioned from the current `arms(...)` so they ride the pans (batch-1 pop).
- Pan labels: cards.tsx `Text` SMALL at leftLabel/rightLabel, fading in from leftLabelAt/rightLabelAt
  over LABEL_FADE. Caption: `Text` at (labelX, labelY), RED, fading in from labelAt; skip when null.
- No `filter` attribute (the caller boils every element), no `<rect>`, no clipPath.

# elements.tsx
`case 'scale': return <ScaleElement {...common} el={el}/>;` importing from `./layouts/scale`.
Mind the import-cycle rule: no top-level use of other modules' exports.

# demo2.json - append shot 9
`{"f0": 810, "f1": 900, "bg": {"card": true}, "els": [{"t": "scale", "left": {"icon": "bill",
"label": "BRIBE"}, "right": {"icon": "badge", "label": "DUTY"}, "heavy": "left", "label": "MONEY WINS",
"at": 816, "dur": 20}]}` (match the formatting/fields of the existing shots; add a `words` element only
if the existing shots carry one). `f1` = 900. With dur 20 the animation ends at local frame ~62, well
inside the 84-frame budget (90 - TAIL 6).

# Done when
- All gates pass; every test file unchanged; `tsc` clean; touched files ASCII-only.
- Only the files above changed; shots 0-8 of demo2.json byte-identical.
- Stills CardLibrary2 frames 830 (scale drawn, bill landed, badge popping), 850 (mid tilt), 875 (full
  tilt left, both labels, red caption): a clear hand-drawn balance scale, bill and badge large on their
  pans, left pan visibly lower, pans upright, chains taut, nothing overlaps, caption centred below.
- Same finish as batch 1's best cards (stroke weight, wobble, hand feel). No placeholder or "simple
  version". Work only inside the repo.
