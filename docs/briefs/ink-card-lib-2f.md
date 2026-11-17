---json
{"id": "ink-card-lib-2f", "type": "normal", "risk": "low", "repo": "D:/AI-video", "gates": ["python tools/tsc_in_worktree.py", "node --test tests/ink/cardlib.test.mjs tests/ink/cardlib2a.test.mjs tests/ink/cardlib2b.test.mjs tests/ink/cardlib2c.test.mjs tests/ink/cardlib2d.test.mjs tests/ink/cardlib2e.test.mjs tests/ink/cardlib2f.test.mjs tests/ink/v11b.test.mjs"], "protected": ["tests/**", "docs/**", "videos/**", "public/**", "tools/**", "package.json", "package-lock.json", "tsconfig.json", "engine/ink/parts/shots/**", "engine/ink/parts/shots_v10/**", "engine/ink/parts/shots_v11b/**", "engine/ink/parts/cardlib/demo.json", "engine/ink/parts/icons.tsx", "engine/ink/parts/doodle.tsx", "engine/ink/parts/cards.tsx", "engine/ink/parts/layouts/tokens.ts", "engine/ink/parts/layouts/doc.tsx", "engine/ink/parts/layouts/docLayout.ts", "engine/ink/parts/layouts/map.tsx", "engine/ink/parts/layouts/mapLayout.ts", "engine/ink/parts/layouts/transform.tsx", "engine/ink/parts/layouts/transformLayout.ts", "engine/ink/parts/layouts/scale.tsx", "engine/ink/parts/layouts/scaleLayout.ts", "engine/ink/compositions/**", "engine/ink/Root.tsx", "engine/ink/ink/**", "engine/ink/rig/**"], "context_files": ["engine/ink/parts/cards.tsx", "engine/ink/parts/elements.tsx", "engine/ink/parts/schema.ts", "engine/ink/parts/doodle.tsx", "engine/ink/parts/layouts/tokens.ts", "engine/ink/parts/layouts/scaleLayout.ts", "engine/ink/parts/layouts/scale.tsx", "engine/ink/parts/cardlib/demo2.json", "tests/ink/cardlib2f.test.mjs"]}
---
# Goal
Add ONE new card layout, `ring` (a circle of N, one outside): a hand-drawn ink ring draws on, N copies
of an icon pop in turn around it, then one more pops outside the ring and a red hand-drawn circle rings
it, then a caption. It is the "the outsider among the officials" beat of the Eiffel ink video. One
layout, its own files, the same finish as batch 1's best cards and jobs 2d/2e.

# Files
- NEW `engine/ink/parts/layouts/ringLayout.ts` - pure layout: validation, timing chain, positions,
  sizes. Imports only from ./tokens and types from ../schema. No React, no remotion.
- NEW `engine/ink/parts/layouts/ring.tsx` - the renderer.
- EDIT `engine/ink/parts/schema.ts` - add RingEl and add it to the El union.
- EDIT `engine/ink/parts/elements.tsx` - one ring case line and its import.
- EDIT `engine/ink/parts/cardlib/demo2.json` - APPEND one shot (index 10) and raise f1 by 90. The
  existing 10 shots stay byte-identical.

Nothing else changes.

# Contract
`tests/ink/cardlib2f.test.mjs` (with cardlib, cardlib2a..2e, v11b) must pass; never edit any test.
Read it first: it bundles ringLayout.ts with esbuild and calls it for real.

# schema.ts
`export type RingEl = {t: 'ring'; x: number; y: number; r: number; icon: IconName; n: number; at: number; step: number; odd: {icon?: IconName; angle: number; label?: string}; label?: string};`

# ringLayout.ts
Named constants, one per meaning, each with a one-line comment; no bare numbers except 0, 1, 2:
- `CARD_W = 1920`, `CARD_H = 1080` (mirror scaleLayout.ts), `RING_FILL = 0.7`, `MAX_ICON = 160`,
  `ODD_RADIUS = 1.6` (odd distance from centre, in r), `N_MIN = 3`, `N_MAX = 12`.
- Exported `POP_FRAMES = 8` (mirrors cards.tsx, change together; the test checks it), exported
  `CIRCLE_FRAMES = 10`, `DRAW_FRAMES = 10`, `LABEL_FADE = 6` (mirror cards.tsx).
- `CIRCLE_PAD` (red circle radius beyond the odd icon half-size), `LABEL_GAP`.

`export const ringLayout = (el: RingEl)` returns:
- `drawAt = at`, `drawEnd = at + DRAW_FRAMES`, `size = min(2 * PI * r / n * RING_FILL, MAX_ICON)`.
- `icons[i] = {x, y, size, at}` for i in 0..n-1: angle `-PI / 2 + 2 * PI * i / n` (12 o'clock start,
  clockwise in SVG y-down), `x = el.x + r cos`, `y = el.y + r sin`, `at = drawEnd + i * step`.
- `odd = {icon: el.odd.icon ?? el.icon, x, y, size, at}`: angle `el.odd.angle` degrees (0 = right,
  clockwise), distance `r * ODD_RADIUS`, `at = drawEnd + n * step`.
- `circleAt = odd.at + POP_FRAMES`, `circleEnd = circleAt + CIRCLE_FRAMES`, `circleRx = circleRy =
  size / 2 + CIRCLE_PAD`, `oddLabelAt = odd.at + POP_FRAMES`, `oddLabelY = odd.y + size / 2 + SMALL`,
  `labelAt` = `circleEnd` when `el.label` is set else `null`, `labelX = el.x`,
  `labelY = el.y + r + size / 2 + LABEL_GAP + LABEL`, `end` = max of `circleEnd` and the last label fade
  end (`(labelAt ?? oddLabelAt) + LABEL_FADE`).
Throws a descriptive Error when: `n` is not an integer in 3..12, `r` is not positive finite, `step` is
not a positive integer, `odd.angle` is not finite, any icon box (ring or odd) leaves the card, or the
caption is wider than the card (`label.length * LABEL * CHAR_WIDTH > CARD_W`).

# ring.tsx
- `export const RingElement: React.FC<Props<RingEl>>`; read EVERY number from `ringLayout(el)`; no
  layout arithmetic of its own; no bare numbers except 0, 1, 2.
- Ring: doodle.tsx `scribbleEllipse(r, r)` translated to (x, y), drawn on with cards.tsx `Draw`
  (progress drawAt..drawEnd), INK, the same LINE stroke as every card.
- Icons: one `<IconElement el={{t: 'icon', x, y, size, name: el.icon, at}} .../>` per ring slot, and
  the odd one the same way with `odd.icon` (batch-1 pop).
- Red circle: `scribbleEllipse(circleRx, circleRy)` at the odd icon, RED, `Draw` circleAt..circleEnd.
- Odd label: cards.tsx `Text` SMALL at (odd.x, oddLabelY), fading in from oddLabelAt over LABEL_FADE.
  Caption: `Text` LABEL at (labelX, labelY), fading in from labelAt; skip when null.
- No `filter` attribute (the caller boils every element), no `<rect>`, `<circle>`, `<ellipse>`, no clipPath.

# elements.tsx
`case 'ring': return <RingElement {...common} el={el}/>;` importing from `./layouts/ring`.
Mind the import-cycle rule: no top-level use of other modules' exports.

# demo2.json - append shot 10
`{"f0": 900, "f1": 990, "bg": {"card": true}, "els": [{"t": "ring", "x": 960, "y": 470, "r": 260,
"icon": "hat", "n": 8, "at": 906, "step": 4, "odd": {"angle": 30, "label": "OUTSIDER"},
"label": "ONE DOES NOT FIT"}]}` (match the formatting/fields of the existing shots). `f1` = 990. With
step 4 the animation ends at local frame ~72, inside the 84-frame budget (90 - TAIL 6).

# Done when
- All gates pass; every test file unchanged; `tsc` clean; touched files ASCII-only.
- Only the files above changed; shots 0-9 of demo2.json byte-identical.
- Stills CardLibrary2 frames 930 (ring drawn, hats popping round it), 960 (odd hat outside, red circle
  drawing), 980 (all labels): a wobbly hand-drawn ring, 8 hats evenly spaced, the odd hat clearly
  outside lower right circled in red, OUTSIDER under it, caption centred below, nothing overlaps.
- Same finish as batch 1's best cards (stroke weight, wobble, hand feel). No placeholder or "simple
  version". Work only inside the repo.
