# Plan check: ink-card-lib-2h1fix2
brief-sha256: 46031e7fc9bfb6db71f9955456f9123d6bb6f0db3604c526a567339ec397c460

Reviewer: Codex gpt-6.1-sol (read-only), 15 rounds. Rounds 1-14 FAILED on test loopholes (outline-blind gaps,
bbox vs contour, opacity/paint-order/PAPER-copy/relative-command/number-grammar/open-subpath/fill-expression
tricks, even-odd vs nonzero coverage); each fixed in tests/ink/cardlib2h1fix2.test.mjs and mutation-verified.
Round 15: target geometry passes all 10 tests in an in-memory fixture; no concrete problems.

VERDICT: PASS
