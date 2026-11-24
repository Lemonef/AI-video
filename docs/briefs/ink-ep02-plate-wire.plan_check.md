# Plan check: ink-ep02-plate-wire

Reviewers: Codex gpt-5.6-sol (OpenAI, read-only) x3 rounds; free legs via multi_ai_check.py (round 1).

- Round 1 FAIL: step 1 vs consecutive-background lint; card-only plates had no window rule; b83 callback not
  required; missing assets silently dropped obligations. All fixed (gate 0-4, brief steps 1/5/6/7).
- Round 2 FAIL: gate 2 skipped mapped beats with no plate background (`if bid in used`). Fixed: CARD_ONLY pinned
  from the pre-rewire full.json (6ecc0d4); gate 2b checks referenced plates exist; b83 CALLBACKS reason checked;
  brief says gate plus manual review define done and states the card-only rule.
- Round 3 PASS, MUST-FIX none. Nit: plate count off by one (37 specified, 36 on disk) -> fixed in brief line 5.
- Free legs: regex concern on comma lists checked, not an issue (every spec parses).

brief-sha256: ad9e714706c1692d9f7a449ed7d6f7b4c6e4257ec3862fb82e94fe6eb049024a
VERDICT: PASS
