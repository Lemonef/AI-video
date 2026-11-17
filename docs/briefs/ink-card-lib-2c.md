---json
{"id": "ink-card-lib-2c", "type": "normal", "risk": "low", "repo": "D:/AI-video", "gates": ["python tools/tsc_in_worktree.py", "node --test tests/ink/cardlib.test.mjs tests/ink/cardlib2a.test.mjs tests/ink/cardlib2b.test.mjs tests/ink/cardlib2c.test.mjs tests/ink/v11b.test.mjs"], "protected": ["tests/**", "docs/**", "videos/**", "public/**", "tools/**", "package.json", "package-lock.json", "tsconfig.json", "engine/ink/parts/shots/**", "engine/ink/parts/shots_v10/**", "engine/ink/parts/shots_v11b/**", "engine/ink/parts/cardlib/demo.json", "engine/ink/parts/icons.tsx", "engine/ink/parts/doodle.tsx", "engine/ink/parts/cards.tsx", "engine/ink/parts/layouts/tokens.ts", "engine/ink/parts/layouts/doc.tsx", "engine/ink/parts/layouts/docLayout.ts", "engine/ink/compositions/InkProof.tsx", "engine/ink/compositions/InkParts.tsx", "engine/ink/compositions/CardLibrary.tsx", "engine/ink/compositions/CardLibrary2.tsx", "engine/ink/Root.tsx", "engine/ink/ink/**", "engine/ink/rig/**"], "context_files": ["engine/ink/parts/layouts/tokens.ts", "engine/ink/parts/layouts/docLayout.ts", "engine/ink/parts/layouts/doc.tsx", "engine/ink/parts/cards.tsx", "engine/ink/parts/schema.ts", "engine/ink/parts/elements.tsx", "engine/ink/parts/doodle.tsx", "engine/ink/parts/icons.tsx", "engine/ink/parts/cardlib/demo.json", "engine/ink/parts/cardlib/demo2.json", "tests/ink/cardlib2c.test.mjs", "tests/ink/cardlib2b.test.mjs"]}
---
# Goal
Card library job 2c: ONE new card layout, `map` (a hand-drawn doodle map with a route between two pins),
in its own files under `engine/ink/parts/layouts/`, following exactly the pattern job 2b set with `doc`
(pure layout module + renderer + one schema member + one elements.tsx case + shots appended to demo2).

Look target (same as batch 1 and the doc card): white paper card, ONE idea per card, hand lettering,
thick INK outline, flat colour fills, one RED accent, slightly wobbly lines (never ruler-perfect), lots of
empty paper. The coast must read as the real place at a glance (a viewer should say "that's Europe").

# Files
- NEW `engine/ink/parts/layouts/mapLayout.ts` - PURE geometry, timing and validation for map. Imports
  only `./tokens` and import type from `../schema`. No React, no remotion (the test bundles and calls it).
- NEW `engine/ink/parts/layouts/map.tsx` - export const MapElement renderer. Imports mapLayout, the
  cards.tsx helpers (progress, delay, smooth, pop, Text, Draw), DoodleIcon and DOODLE from `../icons`,
  colours from `../../compositions/InkProof`.
- EDIT `engine/ink/parts/schema.ts` - ADDITIVE: export type MapEl (shape below) and MapEl in the El union.
- EDIT `engine/ink/parts/elements.tsx` - ADDITIVE: import {MapElement} from './layouts/map'; and one
  line in the Element switch: case 'map': return <MapElement {...common} el={el}/>; (same as the doc case).
- EDIT `engine/ink/parts/cardlib/demo2.json` - APPEND three shots after the existing five (keep the five
  exactly as they are) and set f1 to the new length.
- `tests/ink/cardlib2c.test.mjs` is the PROTECTED contract (with cardlib, cardlib2a, cardlib2b, v11b).
  Make it pass; never edit any test. CardLibrary2.tsx and Root.tsx already read demo2.json and its f1;
  do not touch them.

# The `map` element
`MapEl = {t: 'map'; region: 'europe' | 'atlantic'; from: {x: number; y: number; label: string};
to: {x: number; y: number; label: string}; at: number; dur: number; label?: string}`

`at` is an ABSOLUTE timeline frame, `dur` a DURATION; local start in the renderer = `delay(el, shotF0)`
exactly like doc. mapLayout works in the same absolute frames as `el.at`.

## mapLayout.ts - exports
Named constants, one per meaning, each with a comment; no bare numbers except 0, 1, 2:
- `COAST_DRAW = 12` (coast outline draw frames), `ROUTE_LAG = 4` (frames from from-pin pop to route start),
  `PIN_SIZE = 120`, `PIN_TIP` = the pin art's tip offset below the icon centre: in icons.tsx the pin path tip
  is at local y 89 in the 200-unit art box, so `PIN_TIP = PIN_TIP_LOCAL * PIN_SIZE / PIN_BOX` with those two
  named (comment: change together with the pin path in icons.tsx). `ROUTE_BOW` (0..1, e.g. 0.25),
  `MAP_TOP` = height of the top label band (derive from LABEL), plus every pop / fade / gap you need
  (e.g. `PIN_POP`, `LABEL_FADE`, `LABEL_GAP`).
- `COAST: Record<'europe' | 'atlantic', [number, number][][]>` - hand-drawn closed coastline polygons in
  card pixels (1920x1080), every point inside x 0..1920, y MAP_TOP..1080. At least 12 points per polygon
  (more where the shape needs it - a recognisable coast, not a blob), at least 2 polygons per region, and
  each region's points together span at least 60% of the width and 60% of the map height.
  - europe: one mainland polygon with the Iberian peninsula, the Brittany bump, the Italian boot and the
    Denmark/Scandinavia hint top-right; Great Britain as its own island polygon (Ireland optional).
    The mainland is the FIRST polygon (`COAST.europe[0]`); Paris and Vienna must sit inside it (tested).
  - atlantic: North America's east coast as a polygon touching the left edge (min x <= 480), Europe's west
    coast (Iberia, France, Britain hint) as a polygon touching the right edge (max x >= 1440), open sea between.
- `mapLayout(el)` - throws a descriptive Error when `dur` is not a positive integer, `from` equals `to`
  (same x and y) or `region` is not a COAST key. Returns (all frames absolute):
  - `coastEnd = el.at + COAST_DRAW`; `fromPinAt = coastEnd`; `routeAt = fromPinAt + ROUTE_LAG`;
    `routeEnd = routeAt + el.dur`; `toPinAt = routeEnd`;
  - `labelAt` (> toPinAt, after the to-pin pop) or `null` without `el.label`;
  - `end` - every animation finished (to-pin pop, pin label fades, label fade);
  - `fromPin`, `toPin` = icon centres `{x: point.x, y: point.y - PIN_TIP}` so the TIP lands on the point;
  - `ctrl` = quadratic control point `{x: midX, y: midY - ROUTE_BOW * distance}` (bows UP on screen);
  - `routeD` = the SVG path string `M from Q ctrl to`;
  - `coast` = the region's polygons as wobbly closed SVG path strings (hand wobble applied here or in a
    pure helper, deterministic - no Math.random);
  - `waves` = 3 short wave-stroke path strings in the open sea for atlantic, `[]` for europe;
  - pin label positions (SMALL, beside each pin, kept inside the card) and the band label position
    (centred in the top band), so map.tsx holds no layout arithmetic of its own.

## Rendering (map.tsx)
- Land: each coast path filled `DOODLE.cream`, INK outline at the batch-1 stroke weight, outline drawn on
  over COAST_DRAW frames from `at` (Draw / pathLength dash); fill fades in with it. Sea = the white card.
- Waves (atlantic): thin INK wave strokes drawn on with the coast.
- Pins: `DoodleIcon name="pin"` at PIN_SIZE, translated to fromPin / toPin, `pop` from fromPinAt / toPinAt;
  each label (SMALL, via cards.tsx Text) fades in with its pin.
- Route: RED dashed stroke along `routeD`, revealed from `from` to `to` over `dur` frames from `routeAt`
  through an SVG `<mask>` whose solid white stroke along the same path grows (pathLength dash) - the red
  dashes themselves never move. Drawn under the pins.
- Label: `el.label` at LABEL size centred in the top band, fades in from `labelAt`.
- Hand-drawn paths only - no `<rect>` anywhere in map.tsx.

# demo2.json - append three 90-frame shots (indexes 5, 6, 7), `bg: {card: true}`, contiguous
5. `map` europe: from Paris (label "PARIS") to Vienna (label "VIENNA"), `label: "VIENNA"`, `at = f0 + 6`.
6. an existing batch-1 layout that is neither `split` nor `map` nor `doc` (e.g. `count` or `checklist`),
   copying its field shape from `engine/ink/parts/cardlib/demo.json` (read-only reference), with existing
   icons.
7. `map` atlantic: from a point on Europe's west coast (right, e.g. label "LE HAVRE") to a point on the
   American coast (left, label "NEW YORK"), `label: "AMERICA"`, `at = f0 + 6`.
Both map points must lie inside their region's land polygons (the test checks point-in-polygon), at
least ~20 px inland from the coastline, never on it (a boundary point is ambiguous for the check).
Timing budget: entry 6 + COAST_DRAW 12 + ROUTE_LAG 4 + dur + pin pop + label fade must end by local
frame 84; `dur: 30` with pops/fades of about 6-8 frames fits.

Import cycle note (same as doc): elements -> map -> cards -> elements. Keep every use of imported values
inside functions/components; no top-level calls or constants computed from another module's exports
(mapLayout.ts imports only tokens.ts, which imports nothing, so its top-level constants are fine).

# Done when
- All gates pass; every test file unchanged; `tsc` clean.
- Touched files ASCII-only; map.tsx has no `<rect>` and no bare layout numbers.
- The map must match batch 1's best cards and the doc card in finish: same stroke weight, wobble and hand
  feel; the europe coast recognisable as Europe. No placeholder or "simple version".
- Work only inside the repo; touch only the files listed above.
