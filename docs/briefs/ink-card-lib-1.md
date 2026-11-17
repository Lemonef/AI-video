---json
{"id": "ink-card-lib-1", "type": "creative", "risk": "high", "repo": "D:/AI-video", "gates": ["python tools/tsc_in_worktree.py", "npm run ink:test"], "protected": ["tools/**", "docs/**", "videos/**", "public/**", "tests/**", "package.json", "package-lock.json", "tsconfig.json", "engine/ink/parts/shots/**", "engine/ink/ink/**", "engine/ink/rig/**", "engine/ink/parts/doodle.tsx", "engine/ink/compositions/InkProof.tsx", "engine/ink/compositions/InkParts.tsx"], "context_files": ["engine/ink/parts/schema.ts", "engine/ink/parts/elements.tsx", "engine/ink/parts/doodle.tsx", "engine/ink/compositions/InkParts.tsx", "engine/ink/compositions/InkProof.tsx", "engine/ink/Root.tsx", "tests/ink/cardlib.test.mjs"], "plan_check": "docs/briefs/ink-card-lib-1.plan_check.md"}
---
# Goal
Add a shared library of hand-drawn explain-card pieces to the Ink shot engine: 20 coloured doodle icons, 8 card elements, and a "carry" move so one card's icon glides on into the next card (connecting cards). Add a `CardLibrary` composition that demos every piece, so the look can be judged from stills. Two later videos (A and B) use these pieces from shot JSON, so every piece must be a reusable element driven only by its JSON fields.

Look target (the reference channel's explain cards): white paper, ONE idea per card, 1-4 words of hand lettering, the icon IS the idea, flat colour fills inside a thick ink outline, one red/orange accent, everything slightly wobbly (never ruler-perfect), lots of empty paper.

# Files
- NEW `engine/ink/parts/icons.tsx` - the icon set, IconName, DOODLE, DoodleIcon.
- NEW `engine/ink/parts/cards.tsx` - one component per new element.
- NEW `engine/ink/parts/cardlib/demo.json` - the demo shot list (one Part).
- NEW `engine/ink/compositions/CardLibrary.tsx` - plays demo.json with the existing InkParts player, exports CardLibrary + CARD_LIBRARY_FRAMES.
- EDIT `engine/ink/parts/schema.ts` - ADDITIVE: the 8 new element types, added to the El union.
- EDIT `engine/ink/parts/elements.tsx` - ADDITIVE: import the new components, one case per new type in Element. Existing components unchanged.
- EDIT `engine/ink/Root.tsx` - register Composition id CardLibrary, 1920x1080, 30 fps, durationInFrames={CARD_LIBRARY_FRAMES} (keep the one-line JSX style).
- tests/ink/cardlib.test.mjs already exists and is PROTECTED: it is the contract for this brief. Make it pass; never edit it.
- Do not touch anything else. Work only inside the repo.

# Shared rules
- Frame fields: `at` and `crossAt` are ABSOLUTE timeline frames, like existing elements. `step` and `dur` are frame DURATIONS and are never reduced by shotF0. Inside a shot, element i starts locally at `(at - shotF0) + i * step` (the existing BarsEl/FlowEl pattern in elements.tsx). Optional `at` defaults to shotF0. Reuse the existing `delay`/`progress` helpers (export them from elements.tsx only additively if cards.tsx needs them, or re-declare locally).
- Every new element is SVG-type (drawn inside the existing per-element `<svg>` + boil filter in InkParts.Elements). Text is SVG `<text>` with `fontFamily={FONT}`, `fontWeight 700`, uppercase, INK. No new HTML-type routing, so InkParts.tsx is NOT edited (it is protected).
- Colours: existing `Color` names map through the existing `color()` helper. Icon fills use a new `DOODLE` palette object in icons.tsx, the only new hex literals allowed, each with a one-line comment: `{yellow: '#E8C15A', blue: '#7FA6C9', skin: '#E9C3A0', brown: '#9A6B47', grey: '#A7A9A6', cream: '#F1E6CC'}` (muted marker tones chosen to sit with ORANGE/RED/GREEN/TEAL in InkProof.tsx). Fills named green/red/orange/teal in the icon spec use the existing colour constants, not new hex. Any `color` field on icon/count/split side/hero overrides the icon's base fill; on bignum it colours the number. Labels stay INK.
- Sizes: `LABEL = 70` is the single source size token of cards.tsx, typed once with the comment `// card label px (brief spec)`; `SMALL = LABEL * 0.7`. Every other layout/timing number this brief states for cards.tsx code (220 max count icon, 260 bignum font, 1680 fit width, 360/480/1440 split geometry, 640 sprite height, frame counts like 6/8/10/14) is a named constant typed ONCE near the top of cards.tsx with a comment naming its meaning; the card centre (960/540) is `CX = W / 2`, `CY = H / 2` derived from `W = 1920`, `H = 1080` constants, never typed as 960/540. Per-shot values written in demo.json (sizes, positions, `at`, `dur`, `step`, `value`) are data, not code, and stay plain JSON numbers. One constant per meaning: never reuse a constant because its value happens to match (no fade length as a delay, no easing exponent as a width), and never disguise a number as a fraction of an unrelated token (no `LABEL * (96 / 7)`). No bare numbers in JSX except 0/1/2 and the 200-unit icon box.
- Hand feel: every outline uses `strokeLinecap/strokeLinejoin round`; no perfect rectangles (paths with small corner wobble, or the existing `HAND_RADIUS` idea); boxes/lines that "draw on" use `pathLength={1}` + dash offset like the existing TickElement.
- Validation: unknown icon name -> throw an Error naming it. Invalid numeric input (listed per element) -> throw a descriptive Error.
- Timing budget: in the demo every animation finishes by shot-local frame 65, leaving frames 66-89 settled for stills.
- **SAME EFFORT ON EVERY PIECE (owner's top rule).** Equal finish and recognisability across all 20 icons and all 8 elements: same stroke weight, same controlled wobble, same highlight treatment, same care over spacing. Geometric complexity may differ naturally (a coin is simpler than a factory), finish may not. No generic silhouette reused with a different label, no placeholder, no "simple version for now". Videos A and B both use this library, so the bar is the same for both.

# Icons (`icons.tsx`)
- `export type IconName` = exactly these 20 string literals, written as a single `'a' | 'b' | ...` union: `tower, hat, bill, coin, padlock, letter, mask, pin, ship, newspaper, factory, badge, clock, scrap, key, suitcase, handcuffs, pen, hotel, crown`.
- Each icon is drawn in a 200x200 box centred on (0,0) (coords -100..100): flat fill shapes + INK outline with `strokeWidth = LINE * 200 / size` so the rendered outline stays LINE px at any size, plus ONE small PAPER highlight stroke on the upper-left of the main fill. Must read clearly as the object at 160 px.
- Per-icon spec (silhouette / required inner details / default fill). Every listed detail is required:
  - `tower` - filled Eiffel silhouette (flared legs, arch between legs, 2 platform bands, tapering spire) / lattice hint: 3-4 short cross strokes per section / brown. Do not reuse the line-art `Tower`.
  - `hat` - bowler: round crown + curled brim / ribbon band / INK fill, grey band.
  - `bill` - banknote, slightly curled corner / oval portrait frame in the middle + corner number marks / green.
  - `coin` - thick disc seen at a slight angle (visible rim edge) / embossed franc sign or star + rim dots / yellow.
  - `padlock` - body + shackle / keyhole (circle + slot) / grey body, INK shackle.
  - `letter` - envelope with V flap / wax seal on the flap / cream, red seal.
  - `mask` - domino eye mask with two ties / white eye holes / INK fill.
  - `pin` - map pin (teardrop) / white inner circle / red.
  - `ship` - ocean liner side view: hull, 2 funnels, waterline / portholes row + funnel bands / grey hull, orange funnels.
  - `newspaper` - folded paper, slight curl / masthead bar + 2 headline lines + text-line block + small picture box / cream.
  - `factory` - sawtooth roof + 1 tall chimney with smoke puff / 2-3 windows / brown walls, grey smoke.
  - `badge` - police star badge / centre circle with 2 small stripes / yellow.
  - `clock` - round wall clock / 12-3-6-9 tick marks + 2 hands / cream face, INK rim.
  - `scrap` - pile of 4-6 bent girders and rivets / visible bolt holes on the beams / grey.
  - `key` - old skeleton key: ring bow, shaft, bit teeth / hole in the bow / yellow.
  - `suitcase` - case with handle + 2 straps / travel sticker on one side / brown, cream sticker.
  - `handcuffs` - two linked cuffs / chain links + keyhole dot on each cuff / grey.
  - `pen` - fountain pen at a 30-degree tilt / nib split line + clip / INK body, yellow nib.
  - `hotel` - tall building front with awning and flag / window grid + door / cream walls, red awning.
  - `crown` - 5-point crown / jewel dots on the band + ball tips / yellow, red jewels.
- `export const DOODLE` (palette above) and `export const DoodleIcon: React.FC<{name: IconName; size: number; fill?: string}>` renders the icon scaled so the 200 box = `size` px, centred on the current origin.

# New elements (schema.ts + cards.tsx)
- `icon {t:'icon', name: IconName, x, y, size, color?: Color, rot?: number, at?, from?: [number, number, number]}`. Without `from`: pop scale 0.6 -> 1.08 -> 1 over 8 frames (eased up 5 frames, settle 3), opacity 0->1 over 4 frames, at `at`. This pop is THE entrance for every icon in every element (count, split, hero, crossout, quote marks excepted). With `from: [x, y, size]`: visible from shot-local frame 0 at the `from` geometry, holds until `at`, glides (ease in-out, 14 frames from `at`) to its rest x/y/size, then holds. `rot` (degrees) is the same at both ends. This is the connecting-card move: the next card's icon starts exactly where the previous card left it.
- `count {t:'count', x, y, w, icon: IconName, n, at, step, label?: string, color?: Color}`. Require integer n in 1..16 and finite w > 0, else throw. n <= 8: one row; else two rows of ceil(n/2) and floor(n/2). columns = ceil(n/rows), size = min(w/columns*0.8, 220), horizontal pitch = w/columns, vertical pitch = size + LABEL. Each row centred horizontally, the whole icon block centred on x,y. Icon i pops (as `icon`) at `at + i*step`. Label baseline = block bottom + LABEL; it fades in over 6 frames starting 12 frames after the last icon's entry.
- `split {t:'split', at, step, left: Side, right: Side, vs?: string}`, `Side = {icon: IconName, label: string, color?: Color}`. Full-card side-by-side: a wobbly vertical divider at x 960 draws top->bottom over 10 frames from `at`; left icon (size 360) centred at x 480, y 460, label under it; right side at x 1440, entering `step` frames after the left; each side's icon uses the icon pop, its label fades in over 6 frames right after. Optional `vs` text (LABEL) inside a hand-drawn circle on the divider centre: circle draws on over 8 frames starting when the right icon's pop ends, text pops with it; the divider breaks behind the circle.
- `hero {t:'hero', x, y, icon: IconName, size, label, at, color?: Color, burst?: boolean, from?: [number, number, number]}`. One big icon with its label (LABEL) below at y + size/2 + LABEL. `burst` adds 8 short radiating doodle strokes that draw on over 8 frames after the pop. `from` works exactly as on `icon` (the label fades in after the glide ends).
- `crossout {t:'crossout', x, y, icon: IconName, size, label?: string, at, crossAt}`. Icon pops at `at`; at `crossAt` a RED scribbled X (same bowed, overshooting strokes as the existing CrossElement, sized to the icon) draws on over 10 frames, while the icon fades to 0.45 opacity over the same 10 frames. Label (if any) below.
- `checklist {t:'checklist', x, y, w, at, step, rows: {text: string, mark: 'tick' | 'cross' | 'none'}[]}`. x,y centres the whole row block. Row pitch = LABEL*1.6, box size = LABEL*0.8 at the block's left edge (x - w/2), text starts LABEL*1.2 right of that edge. Throw if a row's text (estimated chars * LABEL * 0.55) exceeds the remaining width. Row i appears at `at + i*step` (box draws on over 8 frames, text fades in over 6); its mark (GREEN tick or RED X, hand-drawn) draws in the box 8 frames later.
- `quote {t:'quote', x, y, w, text, who?: string, at}`. Two big ORANGE hand-drawn quote marks (height LABEL*2; open top-left of the block drawing on over 8 frames at `at`, close bottom-right drawing on after the last line). Text uppercased, then greedy word-wrapped at estimated width chars * LABEL * 0.55 <= w; throw on a single word wider than w. Line height LABEL*1.2, block centred on x,y. Lines pop in (icon pop curve) one by one 8 frames apart, the first at `at + 6`. `who` in SMALL with a leading dash, one line-height below the block, after the last line.
- `bignum {t:'bignum', x, y, value: number, prefix?: string, suffix?: string, label, at, dur, color?: Color}`. Require a non-negative safe integer value and a positive integer dur, else throw. Count 0->value over `dur` frames with ease-out, showing `Math.round(v).toLocaleString('en-US')` between prefix and suffix. Font size 260, reduced (estimated width chars * size * 0.55) so the full string fits in 1680 px. Then an ORANGE scribble underline draws under it over 10 frames; label (LABEL) below.

# Demo (`cardlib/demo.json` + CardLibrary.tsx)
- One Part `{part: 'cardlib', f0: 0, f1: 2700, shots: [...]}`: 30 contiguous half-open shots `[90*i, 90*(i+1))`, i = 0..29, each on `{card: true}`. Entry timestamps = shot.f0 + 6 unless stated.
- Shots 1-10 (overview/layouts):
  1. 5x4 grid of all 20 icons via `icon` elements, size 150, staggered 2 frames apart, each with its name as a small `words` label (size SMALL) under it.
  2. `count` 5 bills, step 8, label "5 BUYERS".
  3. `split` hat vs mask, step 12, labels "COUNT" / "CON MAN", vs "VS".
  4. `hero` tower at (960, 440), size 420, label "FOR SALE", burst true.
  5. `hero` tower with `from: [960, 440, 420]`, rest (560, 440), size 300, label "SAME TOWER", at = shot.f0 + 6 (glide frames 366-380). Plus an `icon` padlock at (1360, 440), size 240, popping at shot.f0 + 26: the carried tower meets the next idea.
  6. `crossout` tower, label "SCRAP", crossAt = shot.f0 + 36.
  7. `checklist` 3 rows (tick, tick, cross), step 14: "BIG", "FAMOUS", "FOR SALE?".
  8. `quote` 2-line text with who, e.g. "THE TOWER IS FOR SALE" / who "VICTOR LUSTIG".
  9. `bignum` 70000, suffix " FRANCS", label "THE PRICE", dur 36.
  10. Character card: `sprite` src `ink60/cast/lustig_handing_money.png` (faces right, hands held out; no flip; y = the sprite's feet: SpriteElement draws the image bottom-centred on (x, y), so y is the floor line, h 640) at the left, reaching toward an `icon` letter (size 300) on the right.
- Shots 11-30: one card per icon in `IconName` order; each shows that icon twice via `icon` elements, size 160 (left) and size 360 (right), plus its name as a `words` label.
- `CARD_LIBRARY_FRAMES` = the Part's `f1` read from the JSON. Import JSON with the same `as unknown as Part` boundary cast used in InkParts.tsx. No audio. Rendering/preview uses entry `engine/ink/index.ts` with `--public-dir videos/pastly-life/01-eiffel-ink/assets` (supplies the sprite and the watermark), as in the `ink:studio` script.

# Steps
1. Read schema.ts, elements.tsx, doodle.tsx, InkParts.tsx (Elements + ShotPlayer), InkProof.tsx exports, tests/ink/cardlib.test.mjs.
2. Write icons.tsx (all 20 to the per-icon spec), cards.tsx, the schema additions, the Element cases, demo.json, CardLibrary.tsx, the Root.tsx line.
3. Run both gates (`python tools/tsc_in_worktree.py`, `npm run ink:test`) and fix every failure in your files.

# Done when
- Both gates exit 0: `python tools/tsc_in_worktree.py` and `npm run ink:test` (includes the protected tests/ink/cardlib.test.mjs).
- All 20 icons drawn to the per-icon spec and all 8 element types implemented, no stub or placeholder; demo.json uses every one of them.
- Diffs to schema.ts, elements.tsx and Root.tsx are additive only; InkParts.tsx, InkProof.tsx, doodle.tsx and tests are untouched; no `any`.
- Work only inside the repo.
- Known traps from earlier attempts' audits (each one failed it): (a) source files are ASCII-only text; write the quote dash as the escape —, never a pasted character that can turn into U+FFFD; (b) the Sizes rule above: LABEL typed once, brief numbers as named single-meaning constants, no fake fractions, no value-reuse across meanings; (c) SMALL = LABEL * 0.7 as an expression; (d) the newspaper masthead is a SOLID band across the top filled INK (a dark band that reads at 160 px), with the paper body in cream; (e) `crossout` draws its X with the exact strokes of the existing CrossElement (export a shared helper from elements.tsx additively, or render CrossElement itself): same stroke width, same bow direction on both strokes; (f) equal finish on detail-heavy icons: tower has lattice X-bracing on every leg section and a clear round arch between the legs; handcuffs have a chain of at least 3 separate interlocked oval links; bill's curled corner is a visible folded triangle in a darker shade.
- (Planner checks after merge, not the builder: stills of every card at settled frame 80, carry frames 360/373/380, start/mid/end of each animation, reviewed for stroke weight, wobble, lettering, spacing, clipping.)
