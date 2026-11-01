# Handoff: guided 1:1 reference matching loop (free builder, measured gate)

Agent: Codex (gpt-6.1-sol). Resume from v10 (MAE 18.79 / SSIM .777, WIP commit 5fab1ff). Private study only, never posted. Do not touch `episodes/`, `out/final/`, or the brain research files another agent is writing.

## Read first
- `docs/reference-study-milestones-DegJCmXtbGj.md` (ledger: open "Master continuation checklist", scorecard, lessons, commands)
- `D:\second-brain\memory\live-handoff.md` (latest: v10 preview, v11 pose/arm tests started)
- `D:\second-brain\skills\reference-animation-rebuild\SKILL.md`
- Source: `out/drafts/reference-study/DegJCmXtbGj/source.mp4`; shots: `.../shot-review.json`; code: `src/compositions/ReferenceStudy/`

## The loop (one shot at a time, worst shot first)
1. **Pick** the shot with the highest MAE in the latest review output (run `python scripts/reference_study_review.py ...` per the ledger commands, `--baseline` = the previous accepted render).
2. **Diagnose:** look at the source frame and our frame side by side (extract with ffmpeg). Write a precise diff list: pose/joint angles, hand contact, character position/scale, camera framing, light direction/darkness, colours, caption text/size/timing. Use the free text models for a second opinion when unsure: `python D:/second-brain/tools/multi_ai_check.py "<question>" --skip-codex`.
3. **Fix** ONE item group with the smallest code/data change (calibration.json, actor-blocking.json, crowd-blocking.ts, LeadPerformance.tsx, inserts, captions).
4. **Render only that shot's frame range** at 540x960 (`npx remotion render ... --frames=<start>-<end> --scale=0.5`).
5. **Gate (mandatory):** re-run the review for that shot. ACCEPT only if MAE goes down AND SSIM does not go down AND a visual look confirms it is closer. Otherwise `git checkout -- <files>` (discard) and try a different fix, max 3 tries per item, then log it as open and move on.
6. **Accepted:** commit (`fix(study): <shot> <what>`), tick/extend the ledger checklist, append the scorecard line.
7. Every 5 accepted shots: render the full 540x960 preview as the next version (v11, v12...), run the full 105-sample review, record mean MAE/SSIM in the scorecard, and confirm no shot regressed.

## Rules
- Picture/animation first (lead acting + hands, crowd, light/torch, inserts, captions). Voice/sound later (another agent with ElevenLabs).
- Never claim 1:1 from scores; record remaining differences honestly.
- `npx tsc --noEmit -p .` must pass before each commit.
- Keep a progress log `docs/agent-logs/codex-reference-loop.md` (shot, diff list, fix, before/after MAE/SSIM, accepted/discarded) so work resumes after rate limits.
- Update `D:\second-brain\memory\live-handoff.md` (top line) at each new version, then `cd D:\second-brain && git add -A && git commit -m "[manual] reference loop vN" && git push origin main`.
- Final reply: versions made, shots accepted/discarded, mean MAE/SSIM per version, biggest remaining gaps.

## Codex specifics
- Commits: the sandbox may block `git commit`; if so leave changes staged per accepted shot and list them in the log - the parent commits.
- Offload text-only sub-tasks to the free legs (`python D:/second-brain/tools/multi_ai_check.py "<q>" --skip-codex`) to save your quota.
- Stop at the end of the session quota cleanly: log is the resume point.
