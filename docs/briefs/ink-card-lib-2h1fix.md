---json
{"id": "ink-card-lib-2h1fix", "type": "creative", "risk": "low", "repo": "D:/AI-video", "gates": ["python tools/tsc_in_worktree.py", "node --test tests/ink/cardlib.test.mjs tests/ink/cardlib2a.test.mjs tests/ink/cardlib2b.test.mjs tests/ink/cardlib2c.test.mjs tests/ink/cardlib2d.test.mjs tests/ink/cardlib2e.test.mjs tests/ink/cardlib2f.test.mjs tests/ink/cardlib2g.test.mjs tests/ink/cardlib2h1.test.mjs tests/ink/cardlib2h1fix.test.mjs tests/ink/v11b.test.mjs"], "protected": ["tests/**", "docs/**", "videos/**", "public/**", "tools/**", "package.json", "package-lock.json", "tsconfig.json", "engine/ink/parts/shots/**", "engine/ink/parts/shots_v10/**", "engine/ink/parts/shots_v11b/**", "engine/ink/parts/cardlib/demo.json", "engine/ink/parts/doodle.tsx", "engine/ink/parts/cards.tsx", "engine/ink/parts/layouts/tokens.ts", "engine/ink/parts/layouts/doc.tsx", "engine/ink/parts/layouts/docLayout.ts", "engine/ink/parts/layouts/map.tsx", "engine/ink/parts/layouts/mapLayout.ts", "engine/ink/parts/layouts/transform.tsx", "engine/ink/parts/layouts/transformLayout.ts", "engine/ink/parts/layouts/scale.tsx", "engine/ink/parts/layouts/scaleLayout.ts", "engine/ink/parts/layouts/ring.tsx", "engine/ink/parts/layouts/ringLayout.ts", "engine/ink/compositions/**", "engine/ink/Root.tsx", "engine/ink/ink/**", "engine/ink/rig/**", "engine/ink/parts/schema.ts", "engine/ink/parts/elements.tsx", "engine/ink/parts/layouts/grid.tsx", "engine/ink/parts/layouts/gridLayout.ts", "engine/ink/parts/layouts/ring.tsx", "engine/ink/parts/layouts/ringLayout.ts", "engine/ink/parts/cardlib/demo2.json"], "context_files": ["engine/ink/parts/icons.tsx", "engine/ink/parts/layouts/gridLayout.ts", "engine/ink/parts/cardlib/demo2.json", "tests/ink/cardlib2h1fix.test.mjs"], "plan_check": "docs/briefs/ink-card-lib-2h1fix.plancheck.md"}
---
# Goal
Redraw the two doodle icons `face` and `man` that job 2h1 added. Their code is wired correctly but the
art fails: both render at about a third of the icon box (tower, hat, mask, crown fill most of it), the
face reads as a monkey (big dark cap low on a narrow head), its mouth is an open filled path, the man's
hat sits over his face, and his arms and legs are open filled paths that render as thin slivers.
Same finish as batch 1's best icons: same outline weight, chunky marker fill, one paper glint, reads
clearly at 160 px.

# Files
- EDIT `engine/ink/parts/icons.tsx` - replace ONLY the bodies of the face case and the man case
  (their art and highlight lines). Every other line of the file stays byte-identical.

Nothing else changes.

# Contract
`tests/ink/cardlib2h1fix.test.mjs` (with cardlib, cardlib2a..2h1, v11b) must pass; never edit any
test. Read it first: it measures the coordinates of every path in the two cases.
Numbers it enforces: all points inside -100..100; face spans at least 150 wide and 160 tall; man
spans at least 90 wide and 175 tall; the skin head shape is at least 120 tall (face) and 40 tall
(man); at least 7 paths (face) and 9 paths (man); every path whose fill is not "none" ends with Z.
Lines (mouth, brows, hair parting, seams) are `<path fill="none" d=...>` strokes.

# House rules (read tower, hat, mask, crown first and match them)
- `<path>` only, shared outline from the wrapping `<g>` (never set a stroke width). Main fill through
  `base(...)`; small secondary fills may use DOODLE/INK/PAPER/RED directly.
- Hand-drawn: slightly uneven Q curves, no perfect symmetry.
- Exactly ONE `highlight = '<path>'`: a short upper-left paper glint on the head.

# face - a plain, honest HUMAN face, front view, fills the box
- Head: a tall egg oval in `base(DOODLE.skin)`, about x -62..62, y -80..78, jaw slightly narrower than
  the temples.
- Ears: one closed skin shape each side at eye height (about x +-60..+-80), each with a small inner
  curl stroke (fill none).
- Hair: `DOODLE.brown` (not INK - a black cap low on the head is what made it read as an ape), a
  short neat cut sitting ON TOP of the skull: from about y -96 down to about y -55 at the temples,
  with a side parting drawn as a fill-none stroke. The forehead (skin) shows clearly between hair
  and brows.
- Brows: two short fill-none strokes. Eyes: two small closed INK ovals about 10 units, at y about -15,
  x about +-24. Nose: a fill-none hook stroke. Mouth: a gentle closed-lip smile as ONE fill-none
  stroke about 40 units wide at y about 40. Calm and friendly, no teeth, no grin, no muzzle.

# man - a small standing man in a suit, front view, fills the box top to bottom
- Bowler hat on TOP of the head (INK dome from about y -90 + brim at about y -62), not covering the face.
- Head in `base(DOODLE.skin)`, about y -68..-22 (at least 44 tall; its top tucks under the brim), with two INK dot eyes visible below the brim.
- Suit body `base(DOODLE.grey)` about x -34..34, y -24..40; a RED tie down the chest; two buttons.
- Arms: closed grey sleeve shapes hanging at the sides (about 12 units wide), each ending in a small
  closed skin hand.
- Legs: two closed grey trouser shapes (about 16 units wide) from y 40 to about y 82, each with a
  closed INK shoe to about y 92. No open filled paths anywhere.
- Doodle proportions: head about a quarter of the height, not a stick man.

# Done when
- All gates pass; every test file unchanged; `tsc` clean; icons.tsx ASCII-only.
- Only the face and man case bodies changed.
- Stills CardLibrary2 frames 1070 (grid: the face in the odd cell circled in red, clearly a plain
  human face among masks, about the same size as the masks) and 1160 (scale: the man fills his
  slot like the hotel does, face visible under the hat): both read at a glance, nothing clipped.
- No placeholder or "simple version". Work only inside the repo.
