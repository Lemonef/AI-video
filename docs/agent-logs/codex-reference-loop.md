# Codex reference loop — 2026-11-01

Scope: private source-assisted picture study. Preserve episodes/, out/final/ and other agents' brain research. Starting HEAD a59d6e2; v10 accepted preview 18.792 MAE / .7769 SSIM. HEAD includes previously unintegrated v11 performance work, so each new correction also gets an unchanged-code control where needed.

## Tooling

- Added --shot-ids (preserves original IDs) and --render-start-frame to scripts/reference_study_review.py. Baseline remains a full absolute-frame render.
- PowerShell npx.ps1 is disabled; use npx.cmd. FFmpeg was absent from PATH; Remotion's reduced binary lacks rawvideo output. Downloaded official Gyan release essentials into ignored out/tools/ffmpeg. Prefix its directory to PATH for review commands.
- Session allows writes only within D:/AI-video. Brain update/push cannot be completed here. Never stage unrelated pre-existing changes.

## Shot 7 — lighting, try 1 — ACCEPTED

- Diff: source counter walls/shelves darker and warmer; candidate plate too bright. Head/cap tilt, eye size, bent arm angles, scanner/contact, counter mask and caption detail remain approximate. Background window should remain darker/less red. Actor positions/scales were already changed in prior v11 work.
- Fix: counter alert/panic plate only: red overlay .14→.28; black .06→.14, before actor drawing. Does not tint cap/actor.
- Range 314–329, 540x960, CRF20. Candidate loop-shot07-light-try1.mp4.
- Mandatory review: loop-shot07-light-try1-review, samples315/321/327: MAE49.259→30.678; SSIM.5405→.5945 against v10.
- Isolated unchanged-code control: loop-shot07-code-baseline-review MAE37.713 / SSIM.5743. Lighting itself improves both; previous pose work accounts for part of total gain.
- All three comparison phases inspected; closer background darkness, remaining red-window mismatch explicitly open. TypeScript passed.
- Commit intended: fix(study): shot07 darken alarm background.
- Git add and git commit both failed: cannot create D:/AI-video/.git/index.lock (permission denied). Changes cannot be staged in this session; parent must stage the named files and commit.

## Resume / required commands

## Shot 27 — timer green, try 1 — DISCARDED

- Source closed-shutter timer turns green, ours stays red; source actor is leaning with shorter apron, ours upright; shutter rib/perspective and caption phase also differ.
- Tested green active segments/border at2002–2036. v10 gate improved29.507/.5104→27.569/.5256, but unchanged-code control27.605/.5268 exposes an SSIM regression from the actual timer change. Discarded all ReferenceInserts edits despite visual color being closer. Existing v11 changes explain the apparent baseline gain. Open: timer material/shape/green luminance must be solved together.
- Compared3 phases and TypeScript passed. No acceptance/commit.

## Shot 9 — lighting, try 1 — ACCEPTED

- Diff: same overly bright counter plate as shot7, source wall is warm/dark; head and phone/hand contact remain different; cap tilt and expression phases approximate; caption opacity differs. No new voice work.
- Fix: extend the accepted .28 red/.14 black plate grade to phone pose. Actor remains outside grade.
- Range450–536. loop-shot09-light-try1-review: MAE43.055→23.829, SSIM.6839→.7481 against v10. Unchanged-code control30.977/.7291, confirming isolated improvement too.
- All3 source/candidate phases inspected: wall/counter darkness closer; window still overly red. TypeScript passed.
- Intended commit fix(study): shot09 darken phone alarm background. Git permission blocker persists; unstaged.

Use npx.cmd remotion render src/index.ts ReferenceAssisted <unique-output> --frames=<start>-<inclusive-end> --scale=0.5 --crf=20 --concurrency=4.
Review with python scripts/reference_study_review.py --source <source.mp4> --render <partial.mp4> --render-start-frame <start> --shot-ids <original-id> --baseline <accepted-full.mp4> --shots <shot-review.json> --out <unique-review-dir>.
Five accepted distinct shots require an integrated full preview and105-sample review; never infer full-film gains from partial renders.


## Shared-workspace collision / isolation

The accepted lighting changes and review script additions were reverted outside this agent's commands (observed15:27 local). Continued in out/drafts/reference-loop-work/src with a dedicated loop-entry.tsx and review.py (also supports --baseline-start-frame for paired partial controls). No further shared code edits until ownership is resolved. Final patch must be applied/reviewed by parent. Both root and isolated TypeScript pass.

## Shot22 curtain timing ? try1 DISCARDED, try2 ACCEPTED

- Diff: shutter onset lags; lower-edge stopping height/actor pose, short arm contact, panicked expression, long apron and crowd remain approximate.
- Try1 changed .75*smooth(p/.55) to .80*smooth(p/.35):28.057/.6185?28.249/.6163, failed both. Discarded in isolated copy.
- Try2 retains .75 stopping height, shortens descent denominator .55?.35.27.863/.6197 against unchanged-code control28.057/.6185. All3 phases inspected: early shutter edge closer, final stopping height preserved. Range1605?1691; loop-shot22-curtain-try2-review. Types pass. Intended fix(study): shot22 advance shutter descent. Not staged: git permission denied.

## Shot19 ceiling clipping ? try1 ACCEPTED

- Diff: large black top margin instead of illuminated ceiling; perspective/parallax, ceiling lamp width/segments, rear shelf registration and extra distant actor remain wrong.
- Existing ceiling extension in HEAD was clipped by nested SVG. Shot19-only overflow=visible exposes it. Does not alter other shots.
-26.862/.7040?24.482/.7256 against v10. Unchanged-code partial26.879/.7038 confirms gain. All3 phases inspected; top field is closer, simple extension remains visibly approximate. Types pass.
- Range1479?1525; loop-shot19-ceiling-try1-review. Intended fix(study): shot19 reveal ceiling extension. Not staged: git permission denied.


## Shot15 early warning light ? try1 ACCEPTED

- Diff: source close warning beat is darker throughout actor/set; ours overbright. Head tilt/eye size/arms/feet and crowd still wrong. Subsequent map crop has a different roof boundary; captions mismatch timing.
- Early local0?32 only: .18 dark blue-black grade on stage, before screen-space warning/captions. Later map unchanged.
-26.004/.7118?21.338/.7250 against v10; unchanged-code control26.018/.7117. Three phases inspected; darker actor/set closer. Types pass. Range852?970, loop-shot15-light-try1-review.
- Intended fix(study): shot15 darken close warning beat. Not staged: git permission denied.
- Five distinct accepted shots now7/9/22/19/15. Integrated preview/review next. Accepted implementation currently isolated; shared code restored only this agent's failed shutter experiment. Parent integration patch will preserve accepted code.


## Integrated versions / final resume point

- v11 full isolated code render:18.619/.7780, SHA2564b7e7eb9fc7766798bcd8c8bf3685a73bd01a464707552634c7707a8d0e7b46a. REJECTED integration: shot6 incomplete early plate (suspected SVG image readiness; not proven), shot20 crowd/WIP regression; other pending work also differs. All7 sheets inspected. Aggregate improvement insufficient.
- v12 gated integrated preview:17.505/.7813, SHA25656f7ff0d441c174d6fa4d9b77559f6a131abc468052371dc8884aec927606ae9. Five accepted generated shot clips inserted into prior accepted v10; all other intervals preserved, lossless yuv420p encoding, v10 audio copied. No source-film frame substitution.105 samples,35 per-shot gates: ZERO regressions. All7 sheets inspected.
- Outputs in out/drafts/reference-study/DegJCmXtbGj; review-v12-gated/metrics.json and compare1?7 images. Receipt records every input hash, absolute source intervals and concat graph. Current code full rerender is still rejected; v12 requires interval integration recipe.
- TypeScript passes root and isolated study, existing timeline node test passes. Synthetic lossless12-frame check verifies partial source+baseline offsets and original shot3 ID; invalid offset rejected. No extra voice/audio work.
- Main tracked study code left at initial baseline after external revert/collision; accepted fixes are isolated in out/drafts/reference-loop-work/src and docs/agent-logs/reference-loop-accepted.patch. Parent should apply/check patch, NOT blindly copy the whole isolated source tree. New independent review tool scripts/reference_loop_review.py is usable without modifying shared original tool.
- Commits/staging unavailable (.git/index.lock permission denied). Brain sync unavailable (outside writable root). No commit, push or source-code integration completion claimed. Locally prepared brain handoff is docs/agent-logs/brain-live-handoff-reference-loop.md.
- Continue worst-first from accepted v12. Worst remaining: shot7~30.678,27~29.507,22~27.863,23~25.992,28~25.998,34~25.454,3~25.075. Investigate actor/arm silhouettes and local grades without accepting SSIM regressions. Resolve shared checkout owner before further main-code changes. Literal1:1 unfinished.


Final verification: git apply --check docs/agent-logs/reference-loop-accepted.patch passed (patch not applied to shared checkout). Root and isolated npx.cmd tsc --noEmit pass. Review/integration Python scripts compile and CLI help runs. OpenCV decoded v12 metadata:2799frames,30fps,540x960 (93.3s picture),188474892bytes. Downloaded ffprobe.exe was blocked by Application Control; not retried/bypassed. Existing supported OpenCV reader supplied metadata. No auditory sign-off claimed.

Reproduce gated integration from repo root:
python scripts/reference_loop_integrate.py --receipt docs/agent-logs/reference-loop-v12-receipt.json --output out/drafts/reference-study/DegJCmXtbGj/practice-v12-reproduced.mp4
It checks all input SHA256 values and refuses to overwrite an input/existing output. Then run scripts/reference_loop_review.py against source and accepted v10 as documented above.
