---json
{"id": "ink-card-lib-2c-fix", "type": "normal", "risk": "low", "repo": "D:/AI-video", "gates": ["python tools/tsc_in_worktree.py", "node --test tests/ink/cardlib.test.mjs tests/ink/cardlib2a.test.mjs tests/ink/cardlib2b.test.mjs tests/ink/cardlib2c.test.mjs tests/ink/v11b.test.mjs"], "protected": ["tests/**", "docs/**", "videos/**", "public/**", "tools/**", "package.json", "package-lock.json", "tsconfig.json", "engine/ink/parts/shots/**", "engine/ink/parts/shots_v10/**", "engine/ink/parts/shots_v11b/**", "engine/ink/parts/cardlib/demo.json", "engine/ink/parts/icons.tsx", "engine/ink/parts/doodle.tsx", "engine/ink/parts/cards.tsx", "engine/ink/parts/schema.ts", "engine/ink/parts/elements.tsx", "engine/ink/parts/layouts/tokens.ts", "engine/ink/parts/layouts/doc.tsx", "engine/ink/parts/layouts/docLayout.ts", "engine/ink/compositions/**", "engine/ink/Root.tsx", "engine/ink/ink/**", "engine/ink/rig/**"], "context_files": ["engine/ink/parts/layouts/mapLayout.ts", "engine/ink/parts/layouts/map.tsx", "engine/ink/parts/layouts/tokens.ts", "engine/ink/parts/cardlib/demo2.json", "engine/ink/parts/schema.ts", "tests/ink/cardlib2c.test.mjs"]}
---
# Goal
Fix the `map` card (job 2c) so the Europe map reads as Europe at a glance and the pin labels never sit
on the route or in the sea. Timing, schema and the atlantic map are right; keep them.

Rendered stills of demo2 (CardLibrary2 frames 530, 710) show:
1. The europe coast is a hand-typed pixel blob: no recognisable Iberia, Italy, Britain or Baltic.
2. The pin labels are placed at a fixed offset right of the pin (`pinLabel` in mapLayout.ts), so they
   land ON the red route and, near a coast, out in the sea.
3. The Paris point sits on the coast line instead of inland.

# Root causes (verified by the planner - fix these, not the symptoms)
1. COAST.europe is typed pixel guesses, not geography. Replace it with REAL longitude/latitude points
   projected by one named pure function, so the shape is right by construction and Paris/Vienna land
   where they really are.
2. `pinLabel` places by a fixed offset and never looks at the route or the land. It must measure:
   try candidate positions in order and keep the first whose box is clear.

# Files
- EDIT `engine/ink/parts/layouts/mapLayout.ts` - the europe coast, the projection, the label placement.
- EDIT `engine/ink/parts/cardlib/demo2.json` - only the europe map shot's from/to x/y (labels,
  timing and every other shot unchanged).

Nothing else changes. The map renderer (map.tsx) already passes label x / y / anchor straight to
`Text`, so it needs no edit: leave it untouched. Keep every existing export name of mapLayout.ts and every timing value it returns.
You may ADD exports and ADD fields.

# Contract
`tests/ink/cardlib2c.test.mjs` (with cardlib, cardlib2a, cardlib2b, v11b) stays green; never edit any
test. It checks: >= 12 points per polygon, >= 2 polygons per region, every point inside x 0..1920 and
y MAP_TOP..1080, each region spans >= 60% width and map height, demo points on land, the europe demo
points inside `COAST.europe[0]`, ASCII only. The test's base points (800,600) and (1100,640) must also
stay inland in COAST.europe[0] with the new coast (they project to central France and Slovenia - they do).

# mapLayout.ts - the projection (named, pure, exported)
- `EU_LON0 = 10` (centre longitude, deg), `EU_X0 = 960` (= CARD_W / 2, derive it), `EU_PX_LON = 27`
  (px per degree longitude), `EU_LAT0 = 58` (reference latitude), `EU_Y0 = 160` (px at EU_LAT0),
  `EU_PX_LAT = 40` (px per degree latitude), `EU_LAT_MAX = 58.4` (northern cut so every y >= MAP_TOP;
  comment: change together with MAP_TOP). Each with a one-line comment.
- `export const project = (lon: number, lat: number): [number, number]` returns
  `[EU_X0 + (lon - EU_LON0) * EU_PX_LON, EU_Y0 + (EU_LAT0 - Math.min(lat, EU_LAT_MAX)) * EU_PX_LAT]`,
  rounded to whole px.
- `EU_LONLAT: [number, number][][]` - the europe polygons as [lon, lat] pairs (data, not layout
  numbers: one comment above each block naming the coast it traces). `COAST.europe =
  EU_LONLAT.map((poly) => poly.map(([lon, lat]) => project(lon, lat)))`. COAST.atlantic unchanged.

## EU_LONLAT[0] - mainland, in this order (closed; use these points, add more if you like)
Iberia: (-5.6,36.0) Gibraltar, (-6.3,36.5), (-7.0,37.2), (-9.0,37.0) Cape St Vincent, (-8.9,38.0),
(-9.5,38.7) Lisbon, (-8.7,41.2) Porto, (-9.3,42.9) Finisterre, (-8.4,43.4), (-5.7,43.6), (-3.8,43.5),
(-2.0,43.3).
France west: (-1.2,45.0), (-1.2,46.2), (-2.2,47.2) Loire, (-4.8,48.4) Brest, (-3.0,48.8), (-2.0,48.6),
(-1.6,49.7) Cotentin, (-0.3,49.3), (0.1,49.5) Le Havre, (1.1,49.9), (1.9,51.0) Calais.
North Sea + Denmark: (2.9,51.2), (4.1,51.9), (4.8,53.0), (6.8,53.4), (8.7,53.9), (8.4,55.5),
(8.6,57.1), (10.6,57.7) Skagen, (10.2,56.2), (10.1,54.4) Kiel.
Baltic: (10.9,54.0), (12.1,54.2), (14.3,53.9), (15.6,54.2), (18.6,54.4) Gdansk, (21.1,55.7), (21.0,56.5),
(24.1,57.0) Riga, (24.5,58.4).
North cut and east edge (off-card side): (45.5,58.4), (45.5,35.0) - the right edge of the card.
Turkey south + west: (36.0,35.0), (36.0,36.6), (34.6,36.8), (32.8,36.0), (30.7,36.9), (29.1,36.6),
(27.4,37.0), (26.7,38.4), (26.7,39.3), (26.4,40.0).
Bosporus in, Black Sea round, Bosporus out (so the Black Sea is open water cut in through the strait):
(28.0,40.4), (29.1,41.1), (29.6,41.2), (35.1,42.0) Sinop, (36.3,41.3), (39.7,41.0) Trabzon, (41.6,41.6),
(39.7,43.6), (37.8,44.7), (36.6,45.3), (34.0,44.4) Crimea south, (33.5,44.6), (32.6,45.4), (32.0,46.4),
(30.7,46.5) Odesa, (29.7,45.2) Danube, (28.6,44.2), (27.9,43.2), (27.5,42.5), (29.0,41.25).
Greece: (26.0,40.7), (22.9,40.6) Thessaloniki, (22.9,39.4), (23.7,38.0) Athens, (23.2,36.5),
(22.5,36.4), (21.3,37.6), (20.7,38.8).
Adriatic east: (19.4,40.4), (19.4,41.3), (19.0,42.1), (18.1,42.6), (16.4,43.5), (15.2,44.1),
(14.4,45.3), (13.7,45.6) Trieste.
Italy boot: (12.3,45.4) Venice, (12.3,44.4), (13.5,43.6) Ancona, (14.2,42.5), (16.2,41.9) Gargano,
(16.9,41.1), (18.0,40.6), (18.4,39.8) heel, (17.2,40.4) Taranto, (17.1,39.1), (15.6,38.0) toe,
(15.9,38.7), (14.3,40.8) Naples, (12.2,41.8) Rome, (10.5,42.9), (10.3,43.6), (9.8,44.1), (8.9,44.4) Genoa.
Riviera + Spain east, back to Gibraltar: (7.3,43.7) Nice, (5.9,43.1), (5.3,43.3), (4.6,43.4),
(3.9,43.5), (3.0,42.7), (2.2,41.4) Barcelona, (1.2,41.1), (0.9,40.7), (-0.3,39.5) Valencia, (0.2,38.7),
(-0.5,38.3), (-1.0,37.6), (-2.5,36.8), (-4.4,36.7) Malaga.

## EU_LONLAT[1] - Great Britain (its own island)
(-5.7,50.1) Land's End, (-5.2,50.0), (-4.1,50.3), (-2.5,50.6), (-1.3,50.8), (-0.1,50.8), (1.4,51.1) Dover,
(0.9,51.5), (1.75,52.5), (1.0,52.95), (0.3,52.9) Wash, (0.1,53.6), (-0.6,54.5), (-1.4,55.0),
(-2.0,55.8), (-2.6,56.0), (-2.1,57.1), (-2.0,57.7), (-3.1,58.4), (-5.0,58.4), (-5.2,57.9), (-5.7,57.3),
(-5.8,56.5), (-5.6,55.3), (-4.9,54.7), (-3.5,54.9), (-3.5,54.4), (-3.0,53.4), (-4.5,53.4) Anglesey,
(-4.7,52.8), (-4.1,52.4), (-5.2,51.7), (-4.0,51.6), (-3.0,51.5), (-4.2,51.2), (-5.0,50.6).

## EU_LONLAT[2] - southern Norway + Sweden (cut at EU_LAT_MAX)
(5.6,58.4), (7.0,58.0), (8.6,58.3), (10.0,58.4), (11.4,58.4), (11.9,57.7), (12.8,56.6), (13.0,55.6),
(14.2,55.4), (14.6,56.1), (16.0,56.2), (16.4,56.7), (16.6,57.8), (16.9,58.4).

Ireland is optional (a fourth polygon) - add it only if it stays clean.

# mapLayout.ts - pin label placement (self-measuring, deterministic)
- Export a pure `insidePoly([x, y], poly)` (ray casting) and use it; export the label box estimate
  `labelBox(text, x, y, anchor)` -> {x0, y0, x1, y1} from `text.length * SMALL * CHAR_WIDTH` wide and
  SMALL tall above the baseline.
- Candidates, tried in this order for each pin (point = the pin TIP = the map point):
  1. below the point, centred (anchor middle), baseline = point.y + PIN_LABEL_GAP + SMALL;
  2. below, on the side AWAY from the other pin, always anchor 'start': x = point.x when away is
     right, x = point.x - box width when away is left (cards.tsx `Text` is protected and accepts only
     'start' | 'middle', so never emit 'end' anywhere);
  3. beside the pin icon on the side away from the other pin, baseline at the icon centre;
  4. above the pin icon, centred.
  Keep the first candidate whose box (grown by PIN_LABEL_GAP on every side) is: inside the card with
  CARD_MARGIN, below MAP_TOP; clear of the route (sample `ROUTE_SAMPLES` (named, e.g. 24) points of the
  quadratic from->ctrl->to; none inside the grown box); clear of the OTHER pin's icon box; and with all
  four corners on land (`insidePoly` against any polygon of the region). If none passes all tests, take
  the first that passes everything except the land test; if none passes that, the first inside the card.
- `fromLabel` / `toLabel` keep the shape {x, y, anchor: 'start' | 'middle'} map.tsx already reads.

# demo2.json
Europe map shot only: `from` = project(2.35, 48.85) (Paris, ~[754, 526]), `to` = project(16.37, 48.21)
(Vienna, ~[1132, 552]) - write the rounded numbers. Labels "PARIS"/"VIENNA", band label "VIENNA", `at`,
`dur` unchanged. The atlantic shot and every other shot byte-identical.

# Done when
- All gates pass; every test file unchanged; `tsc` clean; touched files ASCII-only.
- Only the files above changed; no bare layout numbers outside the named constants and the EU_LONLAT
  data block.
- Stills at CardLibrary2 frames 530 and 710: Iberia, France with Brittany, Britain, Denmark, the Baltic,
  Italy's boot, Greece and the Black Sea recognisable; PARIS and VIENNA pins inland, labels off the red
  route and on land; band label clear of the coast.
- Same finish as batch 1's best cards (stroke weight, wobble, hand feel). No placeholder or "simple
  version". Work only inside the repo.
