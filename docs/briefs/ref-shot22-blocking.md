---json
{"id": "ref-shot22-blocking", "type": "creative", "risk": "low", "repo": "D:/AI-video", "gates": ["python scripts/gate_in_worktree.py --shots 22"], "protected": ["scripts/**", "out/**", "public/**", "package.json", "package-lock.json", "src/compositions/ReferenceStudy/shots.ts", "src/compositions/ReferenceStudy/calibration.json", "src/compositions/ReferenceStudy/captions.json", "docs/**"], "context_files": ["src/compositions/ReferenceStudy/FidelityScenes.tsx", "src/compositions/ReferenceStudy/Stages.tsx", "src/compositions/ReferenceStudy/LeadPerformance.tsx", "src/compositions/ReferenceStudy/index.tsx"]}
---
# Goal
Shot 22 ("Shutter begins to fall", source frames 1605-1691, door stage) in the `ReferenceAssisted` render must match the private source more closely. Current gate baseline: frame MAE 28.59, SSIM 0.606 (lower MAE better).

# What is wrong (seen in out/drafts/reference-study/DegJCmXtbGj/gate-baseline/shot22-review/compare-1.jpg; left half of each pair = source, right = ours)
1. Shutter timing: in the source the shutter starts fully OPEN at frame ~1609 (glass doors and the parking lot visible through them), is roughly a third down at ~1617, about 70% down at ~1635 and nearly closed (~90%) from ~1652 to the end. Ours is already ~85% down from the first frame.
2. Actor blocking: in the source the actor stands at the far LEFT edge of the frame (head around x 5-15% of width, partly cut by the frame edge), facing right toward the door. Ours stands centre-right, in front of the shutter.
3. Everything else (clock, captions, colours) is out of scope.

# How to measure
Extract source frames yourself: `ffmpeg -i out/drafts/reference-study/DegJCmXtbGj/source.mp4 -vf "select=eq(n\,1617)" -frames:v 1 x.png` (read-only use of out/). Measure positions from frames; do not guess.

# Do not run the gate yourself
Do NOT run scripts/reference_gate.py or scripts/gate_in_worktree.py: your sandbox cannot reach the ffmpeg build the baselines were made with, so the gate reports "baseline is stale". The pipeline runs the gate after you finish. To check your work visually, render a still of the ReferenceAssisted composition at a frame inside the shot with `npx remotion still` (if that fails in the sandbox, reason from the code) and compare it with the same source frame; then finish.

# Files
Only files under src/compositions/ReferenceStudy/ except shots.ts / calibration.json / captions.json. Keep CRLF line endings and the compact one-line JSX style. Changes must apply to shot 22 only (shot ids are unique; guard with id===22) so other door shots 10/13/14/15/27/28 render byte-identically.

# Done when
After you finish, the pipeline's gate exits 0 and prints KEEP for shot 22 (frame or actor MAE down, SSIM not down, door-stage guards not regressed). Do NOT edit scripts/, out/ baselines, or the gate. If you think the brief is wrong or a target cannot be met, STOP and say why.
