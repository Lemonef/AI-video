---json
{"id": "ink-ep02-card-fix2", "type": "creative", "risk": "high", "repo": "D:/AI-video", "gates": ["python tools/ink/ep02_full_shots.py --draft", "python -I tests/ink/ep02_lint_baseline.py", "python -I tests/ink/ep02_cardfix1_diffgate.py", "python -I tests/ink/ep02_cardfix2_check.py", "python tools/tsc_in_worktree.py", "node --test --test-skip-pattern=icons.tsx.changes.ONLY.by.the.IconName tests/ink/cardlib.test.mjs tests/ink/cardlib2a.test.mjs tests/ink/cardlib2b.test.mjs tests/ink/cardlib2c.test.mjs tests/ink/cardlib2d.test.mjs tests/ink/cardlib2e.test.mjs tests/ink/cardlib2f.test.mjs tests/ink/cardlib2g.test.mjs tests/ink/cardlib2h1.test.mjs tests/ink/cardlib2h1fix.test.mjs tests/ink/cardlib2h1fix2.test.mjs tests/ink/cardlib2h2.test.mjs tests/ink/cardlib2h3.test.mjs tests/ink/directed.test.mjs tests/ink/ep02-context-card.test.mjs tests/ink/ep02-card-content.test.mjs tests/ink/ep02-meter.test.mjs tests/ink/inkshort.test.mjs tests/ink/rig.test.mjs tests/ink/v11b-chip.test.mjs tests/ink/v11b.test.mjs"], "protected": ["tests/**", "docs/**", "videos/**", "public/**", "package.json", "package-lock.json", "tsconfig.json", "engine/ink/Root.tsx", "engine/ink/parts/shots/**", "engine/ink/parts/shots_v*/**", "engine/ink/parts/shots_ep02min1/**", "engine/ink/parts/elements.tsx", "engine/ink/parts/icons.tsx", "engine/ink/parts/doodle.tsx", "engine/ink/ink/**", "engine/ink/rig/**", "tools/ink/make_ep02_min1_shots.py", "tools/ink/make_v10_shots.py", "tools/ink/make_v11b_shots.py", "engine/ink/parts/cards.tsx", "engine/ink/compositions/InkProof.tsx", "engine/ink/compositions/InkParts.tsx", "engine/ink/parts/schema.ts", "engine/ink/parts/layouts/**", "engine/ink/parts/meter.mjs", "tools/tsc_in_worktree.py"], "context_files": ["docs/briefs/ink-ep02-card-fix1.md", "docs/briefs/ink-ep02-card-fix2-beats.md", "tests/ink/ep02_cardfix2_check.py", "tests/ink/ep02_cardfix1_diffgate.py", "tests/ink/ep02-card-content.test.mjs", "tests/ink/ep02_lint_baseline.py", "tests/ink/ep02_frames_snapshot.json", "tools/ink/ep02_full_shots.py", "engine/ink/parts/elements.tsx", "engine/ink/parts/cards.tsx"], "seed_files": ["videos/pastly-life/02-blackbeard-ink/assets/full-hybrid/timeline.json"], "plan_check": "docs/briefs/ink-ep02-card-fix2.plan_check.md"}
---
# Goal
Do everything `docs/briefs/ink-ep02-card-fix1.md` asks (steps 1-8 there, read it in full), plus the four
points two independent audits of the fix-1 builds found. The owner's words: cards must "explain according to
context", not "a white card, something placed on it, then words".

The protected gate `tests/ink/ep02_cardfix2_check.py` defines done. Checks 1-7 are fix 1's, unchanged; checks
8-11 are new. Read it first.

Files you may change: `tools/ink/ep02_full_shots.py` and the generated `engine/ink/parts/shots_ep02full/full.json`
(regenerate with `python tools/ink/ep02_full_shots.py --draft`; never hand-edit it). Work only inside the repo.

# What the voice says
`docs/briefs/ink-ep02-card-fix2-beats.md` lists the voice line of all 88 beats (`b1`..`b88`, the keys of `P`).
Use it. Each mark must come from that beat's own line.

# Steps (on top of fix 1)
9. **Marks add a fact.** Every `tag`/`stamp` on a card says something the card does not already show. It is
   not the layout's caption, item, row, quote or label again (gate 8a). It is not the words of the plate shot
   just before the card (gate 8b). No mark text is used on two cards (gate 8c). Pick the fact from the beat's
   voice line: a number, a name, a consequence, a twist. Example: on a checklist of NO GOLD rows, do not tag
   `GOLD`; tag what the line adds (e.g. `ALL OF IT SPENT`).
10. **Authored per card, in `P`.** Write each card's mark inside its own `P` lambda, next to the layout it
   supports. No lookup table keyed by beat (`CARD_FACTS` or any rename), no `if beat_id == ...` branches, no
   pass in `build()` that appends marks after `P` runs (gate 10 checks the name; the review checks the rest).
   `CARD_SHOT` may still place and move marks (fix 1 step 4) but never invent their text.
11. **Marks clear of the whole layout.** For every non-full-stage layout, a tag/stamp `content_box` must not
   overlap the layout's `content_box`, not only its caption (gate 9). Use the one placement helper from fix 1
   step 4: move the mark above or beside the layout by the overlap plus the named gap. The sheet post-pass then
   grows to hold it.
12. **Full-stage cards point, not tag.** `split`, `transform`, `scale` and `map` fill the inset panel, so no
   free-floating text can be proven clear of them. On those cards use no `tag`/`stamp`. Put one `circle`
   (or `tick`/`cross`) around the label the beat is about, placed from the generator's existing label
   geometry (`SPLIT_LABEL_Y`, `TRANSFORM_LABEL_Y`, `SCALE_LABEL_Y`, the side x it already uses; no new magic
   numbers) (gate 11).
13. If a card cannot get a good mark from its beat line without breaking a lint, change the card's content
   (layout, caption) instead of a constant, and say so in the report.

# Done when
- All gates pass: `--draft` writes full.json, the lint baseline reports no new errors, the diffgate passes,
  `tests/ink/ep02_cardfix2_check.py` prints OK, tsc is clean, and every listed node test passes.
- The diff touches only the two allowed files.
- The reply includes a report (not only code comments): one row per card with f0, beat, layout, caption,
  underline yes/no, each mark's text and the beat words it came from, and whether the mark was moved. Also
  give BOLD_ALLOWANCE and how it was chosen, and the 8542 / 4659 / 5164 before/after.
- After the merge the main session renders stills of the cards and eye-checks them. That review is not a gate.
