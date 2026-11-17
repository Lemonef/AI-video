Plan check: ink-card-lib-1
Reviewer: Codex gpt-6.1-sol (read-only) - VERDICT FIX, 9 defects found, all applied to the brief (timing semantics, protected InkParts.tsx, test in context_files, per-icon spec, element geometry + validation throws, demo carry geometry, done-when).
Free legs (multi_ai_check --skip-codex): minimax, codestral, qwen, nemotron, gemini answered (glm timeout, mistral 429, cohere timeout). Leftovers applied: DOODLE hex values, accent fills use existing colour constants, pop overshoot 1.08, explicit durations for split/vs/crossout/checklist/quote.
Contract test: tests/ink/cardlib.test.mjs (protected), 8 expected fails before build, 19 existing pass.
brief-sha256: 113e12bbd9734aa80a0f753b91440d552da0d0b4f186df92d3f5c21b60cfdf6b
VERDICT: PASS
