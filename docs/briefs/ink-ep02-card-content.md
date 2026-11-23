---json
{"id": "ink-ep02-card-content", "type": "creative", "risk": "high", "repo": "D:/AI-video", "gates": ["python tools/ink/ep02_full_shots.py --draft", "python -I tests/ink/ep02_lint_baseline.py", "python -I tests/ink/ep02_cardcontent_diffgate.py", "python tools/tsc_in_worktree.py", "node --test --test-skip-pattern=icons.tsx.changes.ONLY.by.the.IconName tests/ink/cardlib.test.mjs tests/ink/cardlib2a.test.mjs tests/ink/cardlib2b.test.mjs tests/ink/cardlib2c.test.mjs tests/ink/cardlib2d.test.mjs tests/ink/cardlib2e.test.mjs tests/ink/cardlib2f.test.mjs tests/ink/cardlib2g.test.mjs tests/ink/cardlib2h1.test.mjs tests/ink/cardlib2h1fix.test.mjs tests/ink/cardlib2h1fix2.test.mjs tests/ink/cardlib2h2.test.mjs tests/ink/cardlib2h3.test.mjs tests/ink/directed.test.mjs tests/ink/ep02-context-card.test.mjs tests/ink/ep02-card-content.test.mjs tests/ink/ep02-meter.test.mjs tests/ink/inkshort.test.mjs tests/ink/rig.test.mjs tests/ink/v11b-chip.test.mjs tests/ink/v11b.test.mjs"], "protected": ["tests/**", "docs/**", "videos/**", "public/**", "package.json", "package-lock.json", "tsconfig.json", "engine/ink/Root.tsx", "engine/ink/parts/shots/**", "engine/ink/parts/shots_v*/**", "engine/ink/parts/shots_ep02min1/**", "engine/ink/parts/elements.tsx", "engine/ink/parts/icons.tsx", "engine/ink/parts/doodle.tsx", "engine/ink/ink/**", "engine/ink/rig/**", "tools/ink/make_ep02_min1_shots.py", "tools/ink/make_v10_shots.py", "tools/ink/make_v11b_shots.py", "engine/ink/parts/cards.tsx", "engine/ink/compositions/InkProof.tsx", "engine/ink/parts/layouts/**", "engine/ink/parts/meter.mjs", "tools/tsc_in_worktree.py"], "context_files": ["docs/briefs/ink-ep02-context-cards.md", "tests/ink/ep02-card-content.test.mjs", "tests/ink/ep02-context-card.test.mjs", "tests/ink/ep02_lint_baseline.py", "tests/ink/ep02_cardcontent_diffgate.py", "tests/ink/ep02_frames_snapshot.json", "tools/ink/ep02_full_shots.py", "engine/ink/compositions/InkParts.tsx", "engine/ink/parts/schema.ts", "engine/ink/parts/elements.tsx", "engine/ink/parts/icons.tsx"], "seed_files": ["videos/pastly-life/02-blackbeard-ink/assets/full-hybrid/timeline.json"], "plan_check": "docs/briefs/ink-ep02-card-content.plan_check.md"}
---
# Goal
Brief 1 (`docs/briefs/ink-ep02-context-cards.md`, merged) put every ep02 explain card on its beat's world
(blurred plate + wash + translucent sheet). The owner's complaint is still open for the CONTENT: "It only have
white card and each white card only have like white then something place on it then word done like cmon bro
no design like nothing it should be explaining according to context". Today many cards are one icon + one
caption, two cards have no layout at all, some show office memos (not 1718), and every sheet is the same big
inset panel whatever sits on it.

Make every ep02 card explain its beat: ONE layout that carries the idea of what the voice says at that moment,
the right person for the beat as a cast sprite (most cards), a support mark (stamp/tag/circle/underline/tick/
cross/redact) that points at the key fact, and a sheet sized to the content it holds.
The protected contract test `tests/ink/ep02-card-content.test.mjs` defines done. Read it first.

Files you may change: `engine/ink/compositions/InkParts.tsx`, `engine/ink/parts/schema.ts`,
`tools/ink/ep02_full_shots.py`, and the generated `engine/ink/parts/shots_ep02full/full.json` (regenerate with
`python tools/ink/ep02_full_shots.py --draft`; never hand-edit it). Work only inside the repo.

# Steps
1. **Schema** (`schema.ts`, `export type Background`): the card variant gains one optional field:
   `{card: true; under?: string; wash?: number; sheet?: [number, number, number, number]}` (x, y, w, h in stage
   px). No other type changes.
2. **Renderer** (`InkParts.tsx`, the context-card sheet from brief 1): when `bg.sheet` is set, the sheet panel is
   positioned/sized from it (left/top/width/height); otherwise keep today's `SHEET_INSET` panel exactly. Same
   PAPER fill, `SHEET_ALPHA`, border, radius, shadow and tilt as now. Elements still draw unrotated at their own
   stage coordinates. Keep `SHEET_INSET` (fallback, the test checks it). No new literals: any new value is a
   named one-line `const TOK = <expr>; // derivation` derived from `LINE` or the stage size.
3. **Generator content** (`tools/ink/ep02_full_shots.py`, the `P` source content, not a hidden post-pass):
   read each card beat's words in the seed timeline (`seed_files`) and rewrite each card so that:
   - it has exactly ONE layout element (`flow, bars, timeline, count, split, hero, crossout, checklist, quote,
     bignum, doc, map, grid, ring, scale, transform`). The two cards with no layout (f0 276 and 1116, today
     sprite + mark + words) get one that fits their words. A card with two layouts keeps the one that carries
     the voice line and loses the other.
   - the layout shows the beat's key fact as its biggest item (the number, the name, the before/after), with
     words matching what the voice says, short (caption ≤ 6 words where the layout allows).
   - it carries at least one SUPPORT element (`sprite, stamp, tag, circle, underline, tick, cross, redact`);
     place marks on the key fact, not in a corner.
   - at least 60% of cards carry a cast `sprite` of the person the beat is about: `bb_*` for Blackbeard,
     `crew_*` for his sailors / the navy sailors, `bath_*` for the party guests / townsfolk. There is NO sprite
     for Governor Spotswood or Lt. Maynard: for those beats use a `tag` or `stamp` with the name, never another
     character's sprite. A sprite sits beside the layout (not covering its key fact) with x inside the stage.
   - no `doc` with `kind: 'memo'` (office memo is not 1718). Replace with `kind: 'certificate'` (a proclamation,
     pardon, or reward notice) or `'card'`, or with another layout, whichever matches the beat. Known memo cards:
     f0 6540 "SHIP RULES" (pirate articles: use a certificate titled as articles, or a checklist) and f0 15540
     "A LETTER" (the letter found on Blackbeard: certificate or quote).
   - content fixes the owner will notice: f0 3075 count of sloops "PAID FROM HIS OWN BUDGET" must show the money
     (chest icon or a bignum of the cost) next to the sloops; f0 5164 count of flags "EACH = 2 MEN" must count
     men (crew sprites or a count of crew), not flags; f0 7465 doc "LT. ROBERT MAYNARD" becomes a tag/stamp
     name callout on the navy beat; f0 8542 hero flag "SLOW FUSES UNDER HIS HAT" must show Blackbeard (bb_
     sprite) with the fuse idea, not a flag; f0 12843 hero key "THE POWDER ROOM" must show powder (barrel icon),
     not a key.
   - period icons only (the brief-1 set: sloop, chain, chest, cannon, barrel, pistol, cutlass, flag, scroll,
     lantern, anchor, plus existing non-modern ones); `BANNED_ICONS` stays as is.
4. **Generator sheet** (`ep02_full_shots.py`): one helper computes `bg['sheet'] = [x, y, w, h]` per card from
   its content: the union of the layout's box and the support marks' boxes (not sprites standing beside it),
   padded by a named margin derived from an existing size constant, clamped inside the stage. Per-layout box
   sizes come from named constants next to the layout geometry they mirror (each with a "mirrors X in <file>;
   change together" comment), never per-card literals. Full-stage layouts (`split, transform, scale, map`) get
   the brief-1 inset panel box (`STAGE_H * 0.12` inset, mirroring `SHEET_INSET`). The test requires: sheet
   inside the stage, compact-layout sheet ≤ 50% of stage area, full-stage ≤ the inset area, each layout's x/y
   anchor inside its sheet, ≥ 6 distinct sheet sizes across cards. Run it as a post-pass in `build()` next to
   the brief-1 `under` pass (it reads final content; it does not change content).
5. **Lint** (`ep02_full_shots.py`): the one-object lint counts cards with exactly one non-TEXT element. A sprite
   beside a layout is now normal, so redefine `one_obj` to count non-TEXT, non-sprite elements == 1. Do NOT
   change `ONE_OBJECT_MIN`, `SPRITE_MAX`, `ICON_USES_MAX` or any other lint constant. `SPRITE_MAX` is per
   sprite src per minute: spread different poses of the same character (there are several `bb_*`, `crew_*`,
   `bath_*` files) so no single src exceeds it. All other lints stay as strict as now;
   `python -I tests/ink/ep02_lint_baseline.py` defines the allowed pending errors and any other error fails. If
   content trips a lint, change the content, never a constant.
6. Shot timing must not change (every shot keeps `f0`/`f1`; the test compares with the snapshot). Do not change
   element animation, meter, chip, `elements.tsx`, `icons.tsx`, other compositions, or scene plates.
   Regenerate `full.json` with `--draft`.

# Done when
- All gates pass: `--draft` writes full.json, the lint baseline reports no new errors, the diffgate passes, tsc
  clean, and every listed node test passes, including `tests/ink/ep02-card-content.test.mjs` and the brief-1
  test `tests/ink/ep02-context-card.test.mjs`.
- The diff touches only the allowed files.
- After merge the main session renders stills of many cards and eye-checks them; that review is not a gate.
- Report: a per-card table (f0, beat words, old content -> new layout + support + sprite), the sheet sizes, and
  the counts (cards, with sprite, memo docs before/after).
