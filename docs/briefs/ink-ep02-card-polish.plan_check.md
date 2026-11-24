# Plan check: ink-ep02-card-polish
brief-sha256: ede49d59043ec8e1f085a5da345dbef12a2952359e0d89cfd855a043344f19ea
Reviewer: Codex gpt-6.1-sol (OpenAI, read-only), rounds 1-9.
r5 FAIL (stamp slam scale, no bottom clamp, texts, Done-when) -> f413ad8.
r6 FAIL (useIn spring envelope, tags in bottom clamp) -> 270e82f.
r7 PASS -> f5d14b4; build then failed audit (hook off-frame, overlaps, literals).
r8 FAIL (hook stamp cannot fit: 2254 vs 1824 screen px; Done-when lacked overlap-repair diffs; 2 stills do not prove the visible interval).
r9 (d0d1c69) PASS: hook as red fitted words fits at size 92 (>= HOOK_MIN_SIZE 80) at (1084, 240); 'red' valid words colour; all 6 table stamps fit (no fallback); --sequence sweep command valid, output in git-ignored .tmp/.
VERDICT: PASS
