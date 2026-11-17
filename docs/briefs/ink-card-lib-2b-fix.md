---json
{"id": "ink-card-lib-2b-fix", "type": "normal", "risk": "low", "repo": "D:/AI-video", "gates": ["python tools/tsc_in_worktree.py", "node --test tests/ink/cardlib.test.mjs tests/ink/cardlib2a.test.mjs tests/ink/cardlib2b.test.mjs tests/ink/v11b.test.mjs"], "protected": ["tests/**", "docs/**", "videos/**", "public/**", "tools/**", "package.json", "package-lock.json", "tsconfig.json", "engine/ink/parts/shots/**", "engine/ink/parts/shots_v10/**", "engine/ink/parts/shots_v11b/**", "engine/ink/parts/cardlib/**", "engine/ink/parts/icons.tsx", "engine/ink/parts/doodle.tsx", "engine/ink/parts/cards.tsx", "engine/ink/parts/schema.ts", "engine/ink/parts/elements.tsx", "engine/ink/parts/layouts/tokens.ts", "engine/ink/compositions/**", "engine/ink/Root.tsx", "engine/ink/ink/**", "engine/ink/rig/**"], "context_files": ["engine/ink/parts/layouts/doc.tsx", "engine/ink/parts/layouts/docLayout.ts", "engine/ink/parts/layouts/tokens.ts", "engine/ink/parts/cards.tsx", "engine/ink/parts/doodle.tsx", "engine/ink/compositions/InkParts.tsx", "engine/ink/parts/cardlib/demo2.json", "engine/ink/parts/schema.ts", "tests/ink/cardlib2b.test.mjs"]}
---
# Goal
Fix the `doc` card layout (job 2b) so it renders correctly and matches batch 1's best cards. The
timing/validation logic and the demo are right; the RENDERING is broken. Rendered stills of demo2
(CardLibrary2 frames 80, 260, 440) show: only the right and bottom paper edges, title and lines cut
off on the left, the memo band and lines missing, the certificate seal hanging off the paper corner.

# Root causes (verified by the planner - fix these, not the symptoms)
1. CLIP: doc.tsx sets `filter="url(#ink-boil-0)"` on its own `translate(x y)` group. The ink-boil
   filters (doodle.tsx) use `filterUnits="userSpaceOnUse"` with a stage region x/y from -100, which is
   read in the group's LOCAL coordinates, so everything left of local -100 / above local -100 (screen
   x < 860, y < 440 for a doc at 960,540) is clipped away. The caller (InkParts.tsx `Elements`)
   already boils every element, so the doc's own filter is also a double boil. Remove it; doc.tsx
   applies no filter at all.
2. FRAME MISMATCH: the paper path is centred on (0,0) (spans -w/2..w/2, -h/2..h/2) but docLayout's
   `titleY`, `lineY`, `sealX`, `sealY` are measured from the paper's TOP-LEFT corner, and doc.tsx mixes
   both frames. Every position docLayout returns must be in ONE frame: the paper-centred frame
   (origin = paper centre, before rotation).

# Files
- EDIT `engine/ink/parts/layouts/docLayout.ts` - positions and the pure hand-wobble path helpers.
- EDIT `engine/ink/parts/layouts/doc.tsx` - the renderer.

Nothing else changes. Keep every existing export name of docLayout.ts (the test imports them) and
keep the timing values the function returns exactly as they are now (outlineEnd, titleEnd, lineAt,
markAt, stampAt, end, innerW). You may ADD exports and ADD fields to the returned object.

# Contract
`tests/ink/cardlib2b.test.mjs` (with cardlib, cardlib2a, v11b) stays green; never edit any test.

# docLayout.ts - add (paper-centred frame, all positions)
- Named constants, one per meaning, each with a comment, no bare numbers except 0, 1, 2; derive type
  sizes from LABEL / SMALL and stroke sizes from a stroke token: e.g. `MEMO_BAND` (letterhead band
  height), `CERT_INSET` (inner border inset), `SEAL_R`, `RIBBON_LEN`, `BAR_H` (redact bar thickness,
  about SMALL * 0.8), `SHADOW_OFFSET`, `STAMP_PAD`, `EDGE_SEGS` (points per paper edge, >= 6),
  `WOBBLE` (edge wobble amplitude in px, a few px).
- Returned positions: `titleX`, `titleY` (title baseline: top-left inside the padding; for `memo`
  below the band), `ruleY` (card rule under the title), `lineX`, `lineY[i]` (baselines under the
  title, all inside the paper), `bandTop`/`bandH` (memo), `sealX`/`sealY` (certificate seal centre,
  bottom-right INSIDE the inner border), `stampX`/`stampY` (stamp centre, over the LOWER half of the
  paper, horizontally centred), `stampW`/`stampH` (stamp box from the stamp text width + STAMP_PAD).
  Every line baseline + SMALL must stay above the paper's bottom edge; the stamp box must sit inside
  the paper. Throw a descriptive Error if a doc is too short for its lines (h too small).
- Pure, deterministic path helpers (no Math.random), exported: `paperPath(w, h, seed)` - a closed
  hand-drawn rectangle centred on (0,0) built from EDGE_SEGS points per edge with sin/cos-of-index
  offsets of up to WOBBLE px perpendicular to the edge, slightly uneven corners (never 4 straight
  lines); `barPath(w, h, seed)` - a filled hand-wobbled bar from x 0 to w, height h, centred on y 0;
  `wobbleLine(x1, y1, x2, y2, seed)` - a gently bowed hand stroke. Use them for every shape.

# doc.tsx - rendering
- No `filter` attribute anywhere; no `<rect>`; no `clipPath`; no layout arithmetic of its own (read
  every position from docLayout); no bare numbers except 0, 1, 2.
- Group: `translate(el.x el.y) rotate(rot)`.
- Shadow: `paperPath` filled INK at low opacity (named), offset SHADOW_OFFSET right/down, fades in
  with the paper.
- Paper: `paperPath` FILLED (PAPER; faint `DOODLE.cream` for certificate), no stroke on the fill path,
  fill opacity follows the outline progress; then the INK outline via cards.tsx `Draw` on the same
  path so it visibly DRAWS ON over DOC_OUTLINE frames from the local start. Never also render a
  fully-stroked copy of the outline (that hides the draw-on).
- card: thin INK `wobbleLine` rule at `ruleY` drawing on after the outline.
- memo: SOLID INK letterhead band (filled hand path spanning the paper width at the top, inside the
  outline), fading in after the outline; the word `MEMO` in PAPER colour centred in it.
- certificate: double hand border (`paperPath` at the paper size and at the CERT_INSET size, both
  drawn on); RED seal at sealX/sealY: `scribbleEllipse` circle of radius SEAL_R plus TWO ribbon tails
  (two short RED wobble strokes hanging down-left and down-right from under the seal), all inside the
  paper.
- Title: LABEL, `title.slice(0, n)` typed one character per TYPE_STEP from outlineEnd, at
  titleX/titleY, anchor start, not clipped (a long title runs past the right edge on purpose).
- Lines: SMALL at lineX/lineY[i], fade in at lineAt[i].
- Redact: a FILLED INK `barPath` (thickness BAR_H, roughly the line's text width) revealed left to
  right over BAR_DRAW frames from lineAt[i] (grow the bar's width with progress); text never shown.
- Mark: RED; circle = `scribbleEllipse` around the line (centred on the line's text centre, not the
  paper centre), underline = bowed `wobbleLine` under the line; draws on from markAt.
- Stamp: RED double box (two `paperPath` outlines, outer stampW x stampH, inner inset by a named
  gap) with the stamp text at LABEL in RED, at stampX/stampY, rotated STAMP_TILT, entering with the
  cards.tsx `pop` scale from stampAt; drawn last, on top.
- Stroke weight is cards.tsx `Draw` (LINE) everywhere, the same as batch 1.

# Done when
- All gates pass; every test file unchanged; `tsc` clean.
- Only the two files above changed; ASCII-only; no filter, rect, clipPath or bare layout numbers in
  doc.tsx.
- For the three demo docs (x 960, y 540) every element is inside the paper except the deliberately
  overflowing shot-1 title: all four paper edges visible and wobbly, title, lines, band, bars, seal and
  stamp all inside.
- The doc must match batch 1's best cards in finish: same stroke weight, wobble and hand feel. No
  placeholder or "simple version". Work only inside the repo.
