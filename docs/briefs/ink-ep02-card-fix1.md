---json
{"id": "ink-ep02-card-fix1", "type": "creative", "risk": "high", "repo": "D:/AI-video", "gates": ["python tools/ink/ep02_full_shots.py --draft", "python -I tests/ink/ep02_lint_baseline.py", "python -I tests/ink/ep02_cardfix1_diffgate.py", "python -I tests/ink/ep02_cardfix1_check.py", "python tools/tsc_in_worktree.py", "node --test --test-skip-pattern=icons.tsx.changes.ONLY.by.the.IconName tests/ink/cardlib.test.mjs tests/ink/cardlib2a.test.mjs tests/ink/cardlib2b.test.mjs tests/ink/cardlib2c.test.mjs tests/ink/cardlib2d.test.mjs tests/ink/cardlib2e.test.mjs tests/ink/cardlib2f.test.mjs tests/ink/cardlib2g.test.mjs tests/ink/cardlib2h1.test.mjs tests/ink/cardlib2h1fix.test.mjs tests/ink/cardlib2h1fix2.test.mjs tests/ink/cardlib2h2.test.mjs tests/ink/cardlib2h3.test.mjs tests/ink/directed.test.mjs tests/ink/ep02-context-card.test.mjs tests/ink/ep02-card-content.test.mjs tests/ink/ep02-meter.test.mjs tests/ink/inkshort.test.mjs tests/ink/rig.test.mjs tests/ink/v11b-chip.test.mjs tests/ink/v11b.test.mjs"], "protected": ["tests/**", "docs/**", "videos/**", "public/**", "package.json", "package-lock.json", "tsconfig.json", "engine/ink/Root.tsx", "engine/ink/parts/shots/**", "engine/ink/parts/shots_v*/**", "engine/ink/parts/shots_ep02min1/**", "engine/ink/parts/elements.tsx", "engine/ink/parts/icons.tsx", "engine/ink/parts/doodle.tsx", "engine/ink/ink/**", "engine/ink/rig/**", "tools/ink/make_ep02_min1_shots.py", "tools/ink/make_v10_shots.py", "tools/ink/make_v11b_shots.py", "engine/ink/parts/cards.tsx", "engine/ink/compositions/InkProof.tsx", "engine/ink/compositions/InkParts.tsx", "engine/ink/parts/schema.ts", "engine/ink/parts/layouts/**", "engine/ink/parts/meter.mjs", "tools/tsc_in_worktree.py"], "context_files": ["docs/briefs/ink-ep02-card-content.md", "tests/ink/ep02_cardfix1_check.py", "tests/ink/ep02_cardfix1_diffgate.py", "tests/ink/ep02-card-content.test.mjs", "tests/ink/ep02_lint_baseline.py", "tests/ink/ep02_frames_snapshot.json", "tools/ink/ep02_full_shots.py", "engine/ink/parts/elements.tsx", "engine/ink/parts/cards.tsx"], "seed_files": ["videos/pastly-life/02-blackbeard-ink/assets/full-hybrid/timeline.json"], "plan_check": "docs/briefs/ink-ep02-card-fix1.plan_check.md"}
---
# Goal
The card-content build (`docs/briefs/ink-ep02-card-content.md`, merged in 1fa0558) gave every ep02 card one
layout, a sprite and a fitted sheet. The planner's eye-check of rendered stills found three structural defects
in `tools/ink/ep02_full_shots.py` and a few content misses:
- (a) the text width model `len(text) * size * CHAR_WIDTH` (.55) under-measures the real font (Ink Free, drawn
  bold), so captions spill past their sheet;
- (b) `CARD_SHOT` appends an underline to EVERY card at `w=min(420, ...)` under the layout box, so doc, ring,
  timeline, flow and other cards show a line under nothing, and hero captions wider than 420 px get a stub;
- (c) name tags are hard-placed (`TG(name, ..., STAGE_W/2, STAGE_H*.2)` and per-card positions) and land on the
  hero caption (card f0 8542: tag "SMOKE + TERROR" sits on "SLOW FUSES UNDER HIS HAT").
The protected gate `tests/ink/ep02_cardfix1_check.py` defines done. Read it first; it measures text with the
real font file itself.

Files you may change: `tools/ink/ep02_full_shots.py` and the generated `engine/ink/parts/shots_ep02full/full.json`
(regenerate with `python tools/ink/ep02_full_shots.py --draft`; never hand-edit it). Work only inside the repo.

# Steps
1. **Real-font measure.** Add a module-level `text_width(text, size)` that measures `text.upper()` with PIL
   `ImageFont.truetype(FONT_FILE, round(size)).getlength(...)` times a named bold allowance. Constants, one line
   each with a derivation comment: `FONT_FILE = 'C:/Windows/Fonts/Inkfree.ttf'  # the face behind FONT = 'Ink
   Free' in compositions/InkProof.tsx; change together`, `BOLD_ALLOWANCE = <1.0..1.15>  # synthetic bold widens
   each glyph by its stroke`. Cache fonts per size. The gate requires `real <= text_width <= real * 1.20`.
   Replace the `textw` lambda in `content_box` (and every other width estimate in the file: quote wrapping,
   bignum fit, tags, words) with `text_width`. Keep `CHAR_WIDTH` only where it mirrors a renderer constant that
   is still used (e.g. `BIG_FIT` font sizing must still mirror `cards.tsx`); comment why.
2. **Named pads.** The literal pads in `content_box` (`20`, `30`, `140`, `100` in grid/ring/tick) become named
   constants beside the geometry they mirror, each with a "mirrors X in <file>; change together" comment.
3. **Underline only under a caption.** Remove the universal underline from `CARD_SHOT`. Add one only when the
   card's layout is `hero`, `bignum` or `count` AND that layout has a `label`: centred on the layout x, width =
   `text_width(label, LABEL)`, y inside the caption row (gate: exactly one per such card, width 100-120% of the real caption, y between `content_box(layout)[3] - LABEL -
   CAP_DESCENT` and `content_box(layout)[3] + UNDERLINE_HEIGHT`). No `min(420, ...)` cap. Cards that lose their
   underline must still carry another non-sprite mark (gate 6): give them a `tag` or `stamp` on the key fact,
   or for `doc` a `mark`/`stamp` on the document, chosen from the beat's words.
4. **Tags and stamps never on the caption.** One helper places every card `tag`/`stamp` (the `name=` tag in
   `CARD_SHOT` and the per-card ones in `P`): start from its intended position; if its `content_box` overlaps
   the caption box of a hero/bignum/count layout, move it above the layout's top edge (or to the side away from
   the sprite) by the overlap plus a named gap derived from `LABEL`. Clamp inside the stage. The sheet post-pass
   (`add_card_sheets`) still runs after, so the sheet grows to hold the moved mark.
5. **Text fits the sheet.** Every text span (hero/crossout/count/bignum/grid label, timeline left/right/bracket,
   tag, stamp, words) must sit horizontally inside `bg.sheet`, measured with the real font. With steps 1 and 4
   the existing sheet union does this; where a sheet is clamped by the stage, shorten the text instead.
6. **Short captions.** Every layout `label` and every card tag/stamp text is at most 6 words, matching what the
   voice says at that beat (read the beat words in the seed timeline). Known spill: the f0 5164 caption (4 words) overflows its sheet width; shorten it.
7. **Content the owner flagged.**
   - f0 8542 "SLOW FUSES UNDER HIS HAT": no `lantern` icon anywhere on the card. Show Blackbeard (a `bb_*`
     sprite, e.g. `ink/cast/bb_stand.png` or another `bb_` pose) with the fuse idea as the layout (e.g. a hero
     with a period icon that reads as smoke/fuse such as `cannon` or `barrel`, or a `bignum`/`count` of fuses),
     caption short.
   - f0 4659 (the sandbank beat): the flow must not say `LAYOFF` anywhere (items, labels, text). Say what
     happened in 1718 words from the voice line (e.g. ran aground, crew let go / marooned).
8. Keep everything else: one layout per card, sprite share >= 60%, no memo docs, timing (`f0`/`f1`) identical to
   the snapshot, >= 6 distinct sheet sizes, lint constants unchanged (`ONE_OBJECT_MIN`, `SPRITE_MAX`,
   `ICON_USES_MAX`, ...). If content trips a lint, change the content, never a constant. Do not touch
   renderer, schema, elements, icons, cards, other compositions or scene plates. Regenerate `full.json`.

# Done when
- All gates pass: `--draft` writes full.json, lint baseline reports no new errors, the diffgate passes,
  `tests/ink/ep02_cardfix1_check.py` prints OK, tsc clean, every listed node test passes (including
  `ep02-card-content.test.mjs` and `ep02-context-card.test.mjs`).
- The diff touches only the two allowed files.
- After merge the main session renders stills of the cards and eye-checks them; that review is not a gate.
- Report: per card (f0, layout, caption, underline yes/no, marks, tag moved yes/no), the BOLD_ALLOWANCE value
  and how it was chosen, and the 8542 / 4659 / 5164 before/after.
