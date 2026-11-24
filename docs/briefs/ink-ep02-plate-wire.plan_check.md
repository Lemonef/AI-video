# Plan check: ink-ep02-plate-wire

Reviewers: Codex gpt-5.6-sol (OpenAI, read-only) x3 rounds; free legs via multi_ai_check.py (round 1).

- Round 1 FAIL: step 1 vs consecutive-background lint; card-only plates had no window rule; b83 callback not
  required; missing assets silently dropped obligations. All fixed (gate 0-4, brief steps 1/5/6/7).
- Round 2 FAIL: gate 2 skipped mapped beats with no plate background (`if bid in used`). Fixed: CARD_ONLY pinned
  from the pre-rewire full.json (6ecc0d4); gate 2b checks referenced plates exist; b83 CALLBACKS reason checked;
  brief says gate plus manual review define done and states the card-only rule.
- Round 3 PASS, MUST-FIX none. Nit: plate count off by one (37 specified, 36 on disk) -> fixed in brief line 5.
- Free legs: regex concern on comma lists checked, not an issue (every spec parses).
- Round 4 (m9d on disk, MISSING_OK empty, step 4 wires b82 to m9d, named-constant rule, step 10 misfits, real
  non-draft output): Codex out of quota until 17:46, so the different-company check ran on the free legs
  (multi_ai_check.py --skip-codex, brief + gate + diff inline). PASS: OmniRoute best-coding, OpenRouter Nemotron,
  Cohere (its MISSING_OK nit is wrong, the set is empty). FAIL: Gemini 2.5 Flash, sole must-fix "named-constant
  rule not gated". Resolved: the rule as worded clashed with the existing per-shot PUSH/PAN x/y numbers, so step 2
  now scopes it to zoom factors and SC origin/scale values, and states it is a review item (main session + audit),
  not a gate. Step-10 misfit list checked by the main session against the scene specs: each plate's own beats differ
  from the misfit beat (m8c b75-76, m5c b46-47, m1b b11/b13, m4c b41, m6b b53-54). Groq 413, Mistral 429.

brief-sha256: 86404ce5d06937ca67395cea1806ebcfc73afd55524300fb6553511f3fa7028f
VERDICT: PASS
