---json
{"id": "ink-card-lib-2b", "type": "normal", "risk": "low", "repo": "D:/AI-video", "gates": ["python tools/tsc_in_worktree.py", "node --test tests/ink/cardlib.test.mjs tests/ink/cardlib2a.test.mjs tests/ink/cardlib2b.test.mjs tests/ink/v11b.test.mjs"], "protected": ["tests/**", "docs/**", "videos/**", "public/**", "tools/**", "package.json", "package-lock.json", "tsconfig.json", "engine/ink/parts/shots/**", "engine/ink/parts/shots_v10/**", "engine/ink/parts/shots_v11b/**", "engine/ink/parts/cardlib/demo.json", "engine/ink/parts/icons.tsx", "engine/ink/parts/doodle.tsx", "engine/ink/compositions/InkProof.tsx", "engine/ink/compositions/InkParts.tsx", "engine/ink/compositions/CardLibrary.tsx", "engine/ink/ink/**", "engine/ink/rig/**"], "context_files": ["engine/ink/parts/cards.tsx", "engine/ink/parts/schema.ts", "engine/ink/parts/elements.tsx", "engine/ink/parts/doodle.tsx", "engine/ink/parts/icons.tsx", "engine/ink/compositions/CardLibrary.tsx", "engine/ink/Root.tsx", "engine/ink/parts/cardlib/demo.json", "tests/ink/cardlib2b.test.mjs", "tests/ink/cardlib2a.test.mjs"]}
---
# Goal
Card library job 2b: ONE new card layout, `doc` (a hand-drawn paper document), in its own files under
`engine/ink/parts/layouts/`, plus a second demo composition `CardLibrary2` that shows it. Later jobs
(2c-2g) add one layout each to the same folder and the same demo, so build the pattern cleanly.

Look target (same as batch 1): white paper card, ONE idea per card, hand lettering, thick INK outline,
flat colour fills, one RED accent, slightly wobbly lines (never ruler-perfect), lots of empty paper.

# Files
- NEW `engine/ink/parts/layouts/tokens.ts` - the type tokens, moved out of cards.tsx so every layout
  shares one source: `export const LABEL = 70;` (card label px), `export const SMALL = LABEL * 0.7;`,
  `export const CHAR_WIDTH = 0.55;` (hand lettering width estimate, per px of font size). Pure TS, no imports.
- EDIT `engine/ink/parts/cards.tsx` - delete its own LABEL / SMALL / CHAR_WIDTH declarations and import
  them from `./layouts/tokens`. Add `export` to the existing helpers `progress`, `delay`, `smooth`, `pop`,
  `Text`, `Draw` (no other change to them). Nothing doc-related goes in cards.tsx.
- NEW `engine/ink/parts/layouts/docLayout.ts` - PURE geometry, timing and validation for `doc`. Imports
  only `./tokens` and `import type` from `../schema`. No React, no remotion (the test bundles and calls it).
- NEW `engine/ink/parts/layouts/doc.tsx` - `export const DocElement` renderer. Imports `docLayout`, the
  cards.tsx helpers, `scribbleEllipse` from `../doodle`, colours from `../../compositions/InkProof`,
  `DOODLE` from `../icons`.
- EDIT `engine/ink/parts/schema.ts` - ADDITIVE: `export type DocEl` (shape below) and `DocEl` in the
  `El` union.
- EDIT `engine/ink/parts/elements.tsx` - ADDITIVE: `import {DocElement} from './layouts/doc';` and one
  line in the Element switch: `case 'doc': return <DocElement {...common} el={el}/>;` (same pattern as the
  existing card cases).
- NEW `engine/ink/parts/cardlib/demo2.json` - one Part, `part: "cardlib2"` (shots below).
- NEW `engine/ink/compositions/CardLibrary2.tsx` - copy of CardLibrary.tsx's pattern playing demo2.json;
  exports `CardLibrary2` and `CARD_LIBRARY2_FRAMES = part.f1`.
- EDIT `engine/ink/Root.tsx` - register `<Composition id="CardLibrary2" component={CardLibrary2}
  width={1920} height={1080} fps={30} durationInFrames={CARD_LIBRARY2_FRAMES}/>` next to CardLibrary.
- `tests/ink/cardlib2b.test.mjs` is the PROTECTED contract (with cardlib, cardlib2a, v11b). Make it pass;
  never edit any test.

# The `doc` element
`DocEl = {t: 'doc'; x: number; y: number; w: number; h: number; kind: 'card' | 'memo' | 'certificate';
title: string; lines: string[]; at: number; step: number; rot?: number;
mark?: {line: number; style: 'circle' | 'underline'}; redact?: number[]; stamp?: string}`

`at` is an ABSOLUTE timeline frame; `step` is a DURATION. In the renderer, local start =
`delay(el, shotF0)` exactly like the batch-1 card elements; docLayout works in the same absolute frames
as `el.at` (the renderer subtracts shotF0 the same way the other cards do).

## docLayout(el) - pure, returns geometry + absolute frames, throws a descriptive Error on bad input
Exported constants (named once, with a comment each): `TYPE_STEP = 1` (frames per title character),
`DOC_OUTLINE = 10` (outline draw frames), plus every other padding / gap / draw-time number you need
(e.g. `DOC_PAD`, `LINE_FADE`, `MARK_DRAW`, `BAR_DRAW`, `STAMP_DELAY`). One constant per meaning; derive
from LABEL / SMALL where the meaning is a type size. No bare numbers except 0, 1, 2.

Return object (all frames absolute):
- `outlineEnd = el.at + DOC_OUTLINE`
- `titleEnd = outlineEnd + el.title.length * TYPE_STEP`
- `lineAt[i] = titleEnd + i * el.step` (every line, redacted or not)
- `markAt`: frame the mark starts drawing, after `lineAt[mark.line]` has faded in; `null` without a mark.
- `stampAt`: frame the stamp pops, after the last line, the last redact bar and the mark have finished;
  `null` without a stamp.
- `end`: the frame by which every animation of this doc has finished (covers last line fade, last redact
  bar draw, mark draw, stamp pop - whichever is last).
- `innerW = w - 2 * DOC_PAD` (`0 < innerW < w`), plus any positions the renderer needs (title
  baseline, line baselines, seal position...) so doc.tsx holds no layout arithmetic of its own.

Throws when: `lines` is empty; `w` or `h` is not a positive finite number; any line is wider than the
inner width (`line.length * SMALL * CHAR_WIDTH > innerW`); a `redact` index is out of range, negative or
duplicated; `mark.line` is out of range or is a redacted line. The TITLE never throws: it is not
wrapped and not clipped - a title longer than the paper keeps typing past the right edge (this is the
joke of beat b25).

## Rendering (doc.tsx)
- Paper: wobbly-cornered sheet centred on x,y, w x h, PAPER fill (a faint `DOODLE.cream` tint allowed for
  `certificate` only), INK outline drawn on over DOC_OUTLINE frames from `at` (`Draw` / pathLength
  dash), rotated `rot` degrees (default 0) about its centre, plus a small offset shadow stroke on the
  right and bottom edges. Hand-drawn paths only - no `<rect>` anywhere in doc.tsx.
- Kind details: `card` - one thin hand rule under the title; `memo` - a solid INK letterhead band
  across the top with the word `MEMO` in PAPER inside it; `certificate` - a double hand-drawn border
  inset from the edge + a small RED seal circle (scribbleEllipse) with a two-tail ribbon at the
  bottom-right inside the paper.
- Title: LABEL size, top-left inside the paper, types on one character per TYPE_STEP from outlineEnd
  (render `title.slice(0, n)`). Not clipped (no clipPath).
- Lines: SMALL size, left-aligned under the title, each fades in at `lineAt[i]`.
- Redact: each listed line is drawn as a thick INK bar (hand-wobbled path, roughly the line's text
  width) that draws left to right from `lineAt[i]`; its text is never shown.
- Mark: RED - `circle` = `scribbleEllipse` around the line; `underline` = a slightly bowed stroke under
  it. Draws on from `markAt`.
- Stamp: RED double box (two hand paths) with the stamp text at LABEL size, tilted -12 degrees (named
  constant), over the lower half of the paper; uses `pop` from `stampAt`. Drawn last (on top).
- All text through cards.tsx `Text` (uppercases, FONT, weight 700).

# demo2.json - shots of exactly 90 frames, contiguous from 0, `bg: {card: true}`
Five shots, so the same layout never appears twice in a row (test checks the first non-`words` element
of each shot). Each shot may have one short `words` headline. Every animation ends at least 6 frames
before its shot ends; doc `at` = shot f0 + 6.
1. `doc` card: title "DEPUTY DIRECTOR GENERAL OF POSTS AND TELEGRAPHS" (overflows the paper), lines
   "MINISTRY OF POSTS", "PARIS 1925", w 900, h 420, rot -3.
2. an existing batch-1 `hero` layout using an existing icon (e.g. `tower`) with a short label.
3. `doc` memo: 4 short lines, `redact: [1, 2]`, `stamp: "CONFIDENTIAL"`, short title (e.g. "TOWER SCRAP SALE").
4. an existing batch-1 `split` layout with two existing icons.
5. `doc` certificate: title "DEATH CERTIFICATE", 3 lines including "APPRENTICE SALESMAN",
   `mark: {line: <index of that line>, style: "circle"}`.
Copy the hero/split field shapes from `engine/ink/parts/cardlib/demo.json` (read-only reference).

# Done when
- All gates pass; every test file unchanged; `tsc` clean.
- Touched files ASCII-only; doc.tsx has no `<rect>` and no bare layout numbers.
- The doc must match batch 1's best cards in finish: same stroke weight, wobble and hand feel. No
  placeholder or "simple version".
- Work only inside the repo; touch only the files listed above.
