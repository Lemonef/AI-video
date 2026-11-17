---json
{"id": "ink-card-lib-2a", "type": "normal", "risk": "low", "repo": "D:/AI-video", "gates": ["python tools/tsc_in_worktree.py", "node --test tests/ink/cardlib.test.mjs tests/ink/cardlib2a.test.mjs tests/ink/v11b.test.mjs"], "protected": ["tests/**", "docs/**", "videos/**", "public/**", "tools/**", "package.json", "package-lock.json", "tsconfig.json", "engine/ink/parts/shots/**", "engine/ink/parts/shots_v10/**", "engine/ink/parts/shots_v11b/**", "engine/ink/parts/cardlib/**", "engine/ink/parts/elements.tsx", "engine/ink/parts/schema.ts", "engine/ink/parts/doodle.tsx", "engine/ink/compositions/**", "engine/ink/Root.tsx", "engine/ink/ink/**", "engine/ink/rig/**"], "context_files": ["engine/ink/parts/cards.tsx", "engine/ink/parts/icons.tsx", "engine/ink/parts/elements.tsx", "tests/ink/cardlib2a.test.mjs", "tests/ink/cardlib.test.mjs"]}
---
# Goal
Card library job 2a: apply the 9 batch-1 carry-in fixes to `engine/ink/parts/cards.tsx` and
`engine/ink/parts/icons.tsx`. Nothing else: no new icons, no new layouts, no demo changes. The protected
contract is `tests/ink/cardlib2a.test.mjs`; read it first, it must pass unchanged.

# Files
- `engine/ink/parts/cards.tsx`
- `engine/ink/parts/icons.tsx`

# Steps (each fix is required)
1. **Easing:** `EASE_POWER` is shared by the icon pop and the bignum count. Replace it with `POP_EASE`
   (pop rise exponent) and `COUNT_EASE` (bignum ease-out exponent), both keeping today's value so motion
   is unchanged. `EASE_POWER` must no longer exist.
2. **Checklist marks:** keep the expression shape `const mark = row.mark === 'tick' ? <tick> : <cross>;`.
   The tick path uses only `TICK_*` constants plus `MARK_LEFT`. The X path uses only its own constants
   `CROSS_MARK_INSET_X`, `CROSS_MARK_INSET_Y`, `CROSS_MARK_SPAN_X`, `CROSS_MARK_SPAN_Y` (the current
   `BOX / 2` span becomes `CROSS_MARK_SPAN_Y`, a named fraction of BOX). Same drawn shape as today. Remove
   the old `CROSS_INSET_X`, `CROSS_INSET_Y` and `CROSS_SPAN`.
3. **Split divider:** rename `DIVIDER_CONTROL_Y` to `DIVIDER_CTRL_Y`; its declaration line carries a
   comment saying it is the Bezier control point y of the upper divider stroke. The lower stroke gets
   its own control constant `DIVIDER_LOWER_CTRL_Y` (mirror of the upper one about CY, derived, not a bare
   number), used instead of `DIVIDER_BOTTOM` as the control point of the lower `Q` segment.
4. **Quote marks:** each rendered quote mark's bounding box is really `QUOTE_HEIGHT` (= LABEL * 2) tall
   at settle. Check the path coordinates plus any scale applied, and derive the path from `QUOTE_HEIGHT`
   so the two cannot drift. Keep the hook-shape x/y controls as separate named constants.
5. **`CROSS_NATIVE_END`:** the comment on its declaration line says it mirrors the native draw length of
   CrossElement in elements.tsx and that the two change together (the line must contain the words
   `change together`).
6. **Colour override:** on `tower` every main-body fill (legs, platform bands) goes through `base()`, so
   a `color` override recolours the whole tower; on `crown` the points and ball tips go through `base()`
   (jewels stay RED). The tower case contains no `fill={DOODLE.brown}` and the crown case no
   `fill={DOODLE.yellow}`. Default colours (no override) stay as today.
7. **Wobble:** `factory` and `hotel` windows are hand-drawn wobbly quads (paths with small corner drift,
   from named constants), never `<rect>` or perfect squares.
8. **Hero label:** in the card-library demo shot 4 (tower hero, size 420, label FOR SALE) the label
   overlaps the tower base. In `HeroElement`, add a named constant `HERO_LABEL_GAP` and place the label
   so its cap top sits at least `LABEL * 0.3` below the icon artwork's lowest point, for every icon and
   size (derive from the hero size, not from this one shot).
9. **No unused constants:** every UPPERCASE top-level `const` in cards.tsx is referenced at least once
   beyond its declaration. Delete any that are not.

Files stay ASCII-only. No new bare numbers except the few new named constants above, each with a comment.

# Done when
- Both gates pass; every test file unchanged.
- Only `engine/ink/parts/cards.tsx` and `engine/ink/parts/icons.tsx` change.
- Work only inside the repo.
- (Planner checks after merge, not the builder: stills of card-library demo shots 4, 7, 8 and the
  factory/hotel/tower/crown icon cards, plus a quote card, re-read for fixes 4, 6, 7, 8.)
