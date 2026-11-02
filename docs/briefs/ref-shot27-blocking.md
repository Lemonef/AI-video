---json
{"id": "ref-shot27-blocking", "type": "creative", "risk": "low", "repo": "D:/AI-video", "gates": ["python scripts/gate_in_worktree.py --shots 27"], "protected": ["scripts/**", "out/**", "public/**", "package.json", "package-lock.json", "src/compositions/ReferenceStudy/shots.ts", "src/compositions/ReferenceStudy/calibration.json", "src/compositions/ReferenceStudy/captions.json", "docs/**"], "context_files": ["src/compositions/ReferenceStudy/FidelityScenes.tsx", "src/compositions/ReferenceStudy/Stages.tsx", "src/compositions/ReferenceStudy/LeadPerformance.tsx", "src/compositions/ReferenceStudy/index.tsx"]}
---
# Goal
Shot 27 ("Closed barrier, full body", source frames 2002-2036, door stage) in the `ReferenceAssisted` render must match the private source more closely. Current gate baseline MAE about 27.8 (lower better); see out/drafts/reference-study/DegJCmXtbGj/gate-baseline/shot27.json.

# What is wrong (out/drafts/reference-study/DegJCmXtbGj/gate-baseline/shot27-review/compare-1.jpg; left half of each pair = source, right = ours)
1. Framing: in the source the closed shutter sits centre-right and fills most of the frame height, with the dark parking lot visible on the left beside it. The actor stands at the LEFT (around x 15-30% of width), full body, feet near the bottom, shopping basket at his right. Ours places the actor centre and the shutter further right/larger, with the whole picture lighter and greyer than the source.
2. The source is darker/more contrasty overall (night lot, warm floor). Ours reads washed out.
3. Clock and captions are out of scope.

# How to measure
Extract source frames yourself with ffmpeg from out/drafts/reference-study/DegJCmXtbGj/source.mp4 (read-only). Measure positions and mean brightness from frames; do not guess.

# Do not run the gate yourself
Do NOT run scripts/reference_gate.py or scripts/gate_in_worktree.py: your sandbox cannot reach the ffmpeg build the baselines were made with, so the gate reports "baseline is stale". The pipeline runs the gate after you finish. To check your work visually, render a still of the ReferenceAssisted composition at a frame inside the shot with `npx remotion still` (if that fails in the sandbox, reason from the code) and compare it with the same source frame; then finish.

# Files
Only files under src/compositions/ReferenceStudy/ except shots.ts / calibration.json / captions.json. Keep CRLF line endings and the compact one-line JSX style. Changes must apply to shot 27 only (guard with id===27) so other door shots 10/13/14/15/22/28 render byte-identically. Note shot 28 shares `closed=id>=27` logic; do not change 28.

# Done when
After you finish, the pipeline's gate exits 0 and prints KEEP for shot 27 (frame or actor MAE down, SSIM not down, door-stage guards not regressed). Do NOT edit scripts/, out/ baselines, or the gate. If you think the brief is wrong or a target cannot be met, STOP and say why.
