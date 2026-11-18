# Plan check: ink-short-s01

brief-sha256: 2ef2e11be1ed5acca0a08a631ecb2bd167d5fdd78b94e212c12e6676e37f8f65

## Reviewers
- Codex (gpt-6.1-sol, read-only): VERDICT FIX, 9 points. All checked against the real data.
  1-4, 6-9 fixed in the brief/spec/tests: story setup beats b51/b52 + trigger beat b58 added (13 beats, 68.4 s);
  clip len stretched to the last word's f1 (b01, b02, b35, b58 overran 1-3 frames); caption grouping moved into
  make_short.py with a contract test; ORANGE already exported (edit dropped, InkProof protected); explicit
  1920x1080 stage wrapper; end-card lines fitted one by one; tests require trimBefore, forbid startFrom/endAt.
  5 (scene under the Shorts button column) kept as a planner decision, checked on stills after merge.
- Free legs (multi_ai_check: GLM, MiniMax, Qwen/Groq, Nemotron, Gemini; Mistral 429, Cohere timeout):
  reviewed the pre-fix brief. Negative nested Sequence from and Audio trimBefore confirmed valid by GLM.
  Gemini 3 (hook header behaviour at the end card) applied: hook visible for 0 <= frame < endCard.f0.
  Gemini 1, 4, 5 already covered (word bounds now in captions test, fit helper named, inkshort test is in context_files).
- Reference implementation of make_short.py (scratch, not given to builder) passes all data contract tests.

VERDICT: PASS
