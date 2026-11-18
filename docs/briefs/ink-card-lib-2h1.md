---json
{"id": "ink-card-lib-2h1", "type": "normal", "risk": "low", "repo": "D:/AI-video", "gates": ["python tools/tsc_in_worktree.py", "node --test tests/ink/cardlib.test.mjs tests/ink/cardlib2a.test.mjs tests/ink/cardlib2b.test.mjs tests/ink/cardlib2c.test.mjs tests/ink/cardlib2d.test.mjs tests/ink/cardlib2e.test.mjs tests/ink/cardlib2f.test.mjs tests/ink/cardlib2g.test.mjs tests/ink/cardlib2h1.test.mjs tests/ink/v11b.test.mjs"], "protected": ["tests/**", "docs/**", "videos/**", "public/**", "tools/**", "package.json", "package-lock.json", "tsconfig.json", "engine/ink/parts/shots/**", "engine/ink/parts/shots_v10/**", "engine/ink/parts/shots_v11b/**", "engine/ink/parts/cardlib/demo.json", "engine/ink/parts/doodle.tsx", "engine/ink/parts/cards.tsx", "engine/ink/parts/layouts/tokens.ts", "engine/ink/parts/layouts/doc.tsx", "engine/ink/parts/layouts/docLayout.ts", "engine/ink/parts/layouts/map.tsx", "engine/ink/parts/layouts/mapLayout.ts", "engine/ink/parts/layouts/transform.tsx", "engine/ink/parts/layouts/transformLayout.ts", "engine/ink/parts/layouts/scale.tsx", "engine/ink/parts/layouts/scaleLayout.ts", "engine/ink/parts/layouts/ring.tsx", "engine/ink/parts/layouts/ringLayout.ts", "engine/ink/compositions/**", "engine/ink/Root.tsx", "engine/ink/ink/**", "engine/ink/rig/**", "engine/ink/parts/schema.ts", "engine/ink/parts/elements.tsx", "engine/ink/parts/layouts/grid.tsx", "engine/ink/parts/layouts/gridLayout.ts", "engine/ink/parts/layouts/ring.tsx", "engine/ink/parts/layouts/ringLayout.ts"], "context_files": ["engine/ink/parts/icons.tsx", "engine/ink/parts/cards.tsx", "engine/ink/parts/layouts/scaleLayout.ts", "engine/ink/parts/layouts/gridLayout.ts", "engine/ink/parts/cardlib/demo2.json", "tests/ink/cardlib2h1.test.mjs"]}
---
# Goal
Add TWO new doodle icons to the shared icon set, `face` and `man`, and show each inside a real card
layout in demo2 (never on a bare icon test card). They are the "one honest man" and "the lone conman"
beats of the Eiffel ink video. Same finish as batch 1's best icons (tower, hat, mask, crown): same
outline weight, chunky marker fill, one paper glint, reads clearly at 160 px.

# Files
- EDIT `engine/ink/parts/icons.tsx` - add the two names face and man to the END of the IconName union and one
  `case` each in DoodleIcon's switch, placed after `crown` and before `default`. Nothing else in the
  file changes.
- EDIT `engine/ink/parts/cardlib/demo2.json` - in shot 11 change ONLY odd.icon from badge to
  face; APPEND one shot (index 12) and raise f1 to 1170. Shots 0-10 stay byte-identical.

Nothing else changes.

# Contract
`tests/ink/cardlib2h1.test.mjs` (with cardlib, cardlib2a..2g, v11b) must pass; never edit any test.
Read it first.

# icons.tsx - the house rules (read the existing cases first and match them)
- Art lives in the same 200x200 box centred on 0,0 (x and y in -100..100), drawn as `<path>` only
  (no rect/circle/ellipse), with the shared outline from the wrapping `<g>` (never set your own
  stroke width). Main fill goes through `base(...)` so the colour override works; small secondary
  fills may use DOODLE/INK/PAPER directly, as `hat` does.
- Shapes are hand-drawn: slightly uneven Q curves, no perfect symmetry, no geometric primitives.
- Exactly ONE `highlight = '<path>'` per icon: a short upper-left paper glint like the others
  (non-empty).
- `face`: plain honest front face, NO mask. Head oval in `base(DOODLE.skin)`, two ears on the sides,
  a neat INK hair cap over the top of the head, two dot eyes (small filled INK blobs drawn as paths),
  a small nose hook, a small straight closed-mouth smile. Friendly and calm, not a cartoon grin.
- `man`: small standing man in a suit, front view, arms at his sides, whole figure inside the box.
  Skin-coloured head, grey suit body `base(DOODLE.grey)` with two arms, two legs with small INK shoes,
  an INK bowler hat (dome + brim) on the head, a RED or INK tie down the chest and two small buttons.
  Proportions of a doodle figure (head about a quarter of the height), not a stick man.

# demo2.json
- Shot 11 (grid): `"odd": {"index": 6, "icon": "face"}` - everything else in that shot unchanged.
- Append shot 12, matching the formatting of the existing shots:
`{"f0": 1080, "f1": 1170, "bg": {"card": true}, "els": [{"t": "scale", "left": {"icon": "hotel",
"label": "HOTEL"}, "right": {"icon": "man", "label": "ONE MAN"}, "heavy": "right",
"label": "HE ACTED ALONE", "at": 1086, "dur": 20}]}`. `f1` = 1170.

# Done when
- All gates pass; every test file unchanged; `tsc` clean; touched files ASCII-only.
- Only the two files above changed; shots 0-10 of demo2.json byte-identical.
- Stills CardLibrary2 frames 1070 (grid: the face in the odd cell circled in red, clearly a plain
  face among masks) and 1160 (scale: the man heavier on the right pan, HOTEL light on the left):
  both icons read at a glance, outline weight and glint match tower/hat/mask, nothing clipped.
- No placeholder or "simple version". Work only inside the repo.
