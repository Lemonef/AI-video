Plan check: ink-card-lib-1
Reviewer: Codex gpt-6.1-sol (read-only) - VERDICT FIX, 9 defects found, all applied to the brief (timing semantics, protected InkParts.tsx, test in context_files, per-icon spec, element geometry + validation throws, demo carry geometry, done-when).
Free legs (multi_ai_check --skip-codex): minimax, codestral, qwen, nemotron, gemini answered (glm timeout, mistral 429, cohere timeout). Leftovers applied: DOODLE hex values, accent fills use existing colour constants, pop overshoot 1.08, explicit durations for split/vs/crossout/checklist/quote.
Contract test: tests/ink/cardlib.test.mjs (protected), 8 expected fails before build, 19 existing pass.
brief-sha256: b448ba848227a8420131bd008007f1a648251b6f1723c6e32c4214a173a9aebc
VERDICT: PASS
