---json
{"id": "ink-v11b-card-geometry", "type": "normal", "risk": "low", "repo": "D:/AI-video", "gates": ["python tools/tsc_in_worktree.py", "node --test tests/ink/cardlib.test.mjs tests/ink/v11b.test.mjs"], "protected": ["tests/**", "docs/**", "videos/**", "public/**", "package.json", "package-lock.json", "tsconfig.json", "engine/ink/parts/shots/**", "engine/ink/parts/shots_v10/**", "engine/ink/parts/shots_v11b/**", "tools/**", "engine/ink/parts/icons.tsx", "engine/ink/parts/elements.tsx", "engine/ink/parts/schema.ts", "engine/ink/parts/doodle.tsx", "engine/ink/compositions/**", "engine/ink/Root.tsx", "engine/ink/ink/**", "engine/ink/rig/**"], "context_files": ["engine/ink/parts/cards.tsx", "engine/ink/parts/schema.ts", "tests/ink/cardlib.test.mjs"]}
---
# Goal
Three card layouts in `engine/ink/parts/cards.tsx` draw into their own labels or into the shot's headline.
They were found on full-resolution stills of Video B (InkEp01V11B):
- **bignum** (shot 8900): the label is placed a fixed `LABEL * BIG_LABEL_GAP` below the number's baseline,
  but the underline sits at `size * UNDERLINE_Y`. At the default 260 px number, the underline cuts through
  the label text ("AFTERNOON") and the label nearly touches the digit.
- **split** (shots 7372, 12736): the divider starts at `DIVIDER_TOP = 160` and slices through the headline
  words above the layout (headlines sit at y 160 to 220).
- **hero with burst** (shot 6120): the lowest rays end inside the label ("HE HAD THE IDEA").

Fix the geometry so each part is derived from the layout it must clear, not from a fixed number. Only
`cards.tsx` changes. These layouts are used only by v11B and the card-library demo, so the v10 cut is not
affected.

# Files
- `engine/ink/parts/cards.tsx`

# Steps
1. **bignum label:** measure the label from the underline, not from the number baseline:
   label y = `el.y + size * UNDERLINE_Y + LABEL * BIG_LABEL_GAP`, where `size` is the number's computed
   font size (the same `size` already used for the underline). Keep `BIG_LABEL_GAP = 1.5`; update its
   comment to say it is the gap below the underline in label heights.
2. **split divider:** derive the divider ends from the split layout:
   `DIVIDER_TOP = SPLIT_Y - SPLIT_SIZE / 2` (the top of the icon row),
   `DIVIDER_BOTTOM = 2 * CY - DIVIDER_TOP` (symmetric about the vs circle at CY), and
   `DIVIDER_CONTROL_Y = (DIVIDER_TOP + CY - VS_RADIUS) / 2` (midpoint of the upper segment). Define them
   after the constants they use. The divider path code itself stays as is.
3. **burst rays:** keep the rays out of the lower sector where the label sits. Add one named constant
   `BURST_DROP = 0.1` (how far, in units of pi, the outermost rays may dip below horizontal on each side),
   and derive `BURST_START = 1 - BURST_DROP` and `BURST_SWEEP = 1 + 2 * BURST_DROP`, so the rays fan over
   the top half from just below the left side to just below the right side. `BURST_COUNT`, `BURST_INNER`,
   `BURST_OUTER` and `BURST_DRAW` stay. Keep the comment explaining that the label sector stays clear.
4. No other layout, constant or behaviour changes.

# Done when
- Both gates pass; every test file unchanged.
- `cards.tsx` has no new bare numbers except `BURST_DROP`, and each derived constant reads from the
  constants above it.
- Work only inside the repo; touch only `engine/ink/parts/cards.tsx`.
