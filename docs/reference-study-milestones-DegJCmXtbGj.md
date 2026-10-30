# Reference reconstruction milestone ledger - DegJCmXtbGj

Owner: Zen. Updated 2026-10-30. Target: keep improving the supplied reference copy through self-review, record every meaningful iteration/technique, and turn the learning into a reusable production skill and future pre-final checklist.

**Status: IN PROGRESS. Exact visual/audio match is not achieved or approved.** This ledger records evidence, not a completion claim. The first render was rejected. Part 3's approved production final stays untouched; story upgrades wait behind this exercise.

## The fixed source and protected artifact

- Reference: https://www.instagram.com/p/DegJCmXtbGj/ (StickItOutStories).
- Local original: `out/drafts/reference-study/DegJCmXtbGj/source.mp4`, ignored and private.
- Source picture: 1080x1920, 30 fps, 2799 frames /93.3 seconds. Container duration93.319546 is a different measurement.
- Protected EP3: `out/final/ep03/video.mp4`; SHA256 `c176f122392eb23ffbc925f05fff1a3351f40c819f6e7b0ec152e26ac249e5ee`.
- Independent reconstruction composition: `ReferenceStudy`.
- Source-assisted generated-plate experiment: `ReferenceAssisted`. Its backgrounds derive from source stills; its animated rig, original paraphrased scratch voice/foley and overlays are separate. It is not an independently authored background replica and not the original video relabeled.

## Milestones and what each one proved

| ID | Work / technique / tools | Concrete evidence | Result / remaining gap |
|---|---|---|---|
| M00 | Read brain/project handoff; sync main; protect final | EP3 path/hash, project TODO, brain home | Production final preserved; no posting authorized |
| M01 | Download public reference using yt-dlp, no login/cookies | source.mp4 and source.info.json under ignored draft folder | Real primary source available locally |
| M02 | Probe picture/container, sample stills, detect hard cuts using FFmpeg | 2799frames,93.3s,35 coarse groups; cut-times/detected-cuts/contact sheets | Cut groups measured; internal transitions still needed manual review |
| M03 | Attempt speech analysis with existing Whisper stack | transcript.log: Windows Application Control blocked PyAV motionvectors DLL | Stopped without bypass. Transcription unavailable; did not claim listening approval |
| M04 | Original SVG generic cashier/store, 35-group Remotion timeline | shots.ts, Stages.tsx, ReferenceStudy registration | Isolated from existing Episode/Jaab production |
| M05 | Half-size preview, source-versus-study comparisons | preview.mp4, comparison sheets | Actor size, map crop, chain-hand anchor, sparse shelves exposed |
| M06 | Adjust poses/camera/props/map; render full first draft | practice.mp4:1080x1920/93.3s;35 stills,20 action samples;28 Python+3 Node+tsc passed | Silent simplified visual study. Not1:1 despite matching coarse timing |
| M07 | Save first review/brain and sync code | AI-video e47f72e; brain82cb52e; original media excluded | Durable technical checkpoint, not owner approval |
| M08 | Owner rejects first draft | Zen: looks way worse / not even1:1; asks keep trying and self-check until match | Target explicitly remains broad: background, character, camera, light, effects, text, sound and structure |
| M09 | Rebuild detailed geometry on270x480 measured art plane | FidelityScenes.tsx: roof/glass/stock, perspective aisle/counter/door, props, rig, local gradients/shadows | Major silhouettes and density improved; still approximate |
| M10 | Per-shot camera and actor measurements; remove technical labels from default | index.tsx and Root.tsx; independent composition retained | Camera positions no longer just reuse first generic study |
| M11 | Add three-phase comparative review utility | reference_study_review.py;105 samples;7 comparison pages/iteration | Beginning/middle/end catches acting/transitions missed by one still |
| M12 | First quantitative comparison after vector rebuild | review-v2/metrics.json:MAE42.153,SSIM.4770 vs first43.738/.4876 | Mixed. MAE improves but SSIM worsens; not match certification |
| M13 | Inspect all105 v2 comparisons; inspect source per-frame deltas | scene-deltas.json; frame375 city,885 overhead,1495 aisle move,1639 jam,2151 lights region | Discovered35 groups were not a full shot/effect description |
| M14 | Correct internal transitions, shutter speed, actor blocking, count curve, stock grouping | Updated FidelityScenes/index; shared RIG hand-chain anchor | Fixes concrete misses; subsequent render required |
| M15 | Build original scratch sound and English paraphrase | build_reference_sound.py;67 total foley/voice events;free Edge Christopher voice | Sound now exists; different words/voice remain a fidelity gap |
| M16 | Fix missing short narration lines via silence measurement and shorter wording | sound-review.json:33/33 lines fit,75 caption chunks;rate.95-1.377;cache hashes include voice/rate/text | No omitted lines; avoids extreme compression; naturalness still needs listening |
| M17 | Integrate word-timed captions, condensed Anton type, cards/timers | captions.json,index.tsx; no debug labels by default | Narrative replaces technical shot labels; wording differs from reference |
| M18 | Render independent full picture/sound and master levels | practice-v3.mp4,practice-v3-mastered.mp4;source-14.12LUFS/-1.18dBTP vs raw scratch-22.26/-7.36 | Master targets reference loudness; whole-track level alone does not establish voice/bed balance |
| M19 | Review105 full v3 samples | review-v3-full:MAE42.336,SSIM.4778 | Still materially different; no fidelity approval |
| M20 | Generate clean source-assisted counter plate using built-in imagegen | counter-clean-v1.png; cashier/caption removed, foreground retained | Shelf/clock/counter density much closer; clear source-derived provenance |
| M21 | Generate/inspect door, aisle, parking clean plates | source stills -> imagegen object removal -> local public/reference-study plates | Preserve detailed set, remove cast/text, animate own separate rig |
| M22 | Add actor mask behind counter props, glass/shutter foreground layers | ReferenceAssisted composition and plate branches | Layered production technique tested; does not change independent composition's provenance |
| M23 | Render/review four-plate assisted preview | practice-v4-assisted-preview.mp4;105 inspected samples;MAE37.003,SSIM.4921 | Both metrics improve; camera/actor size and dark blocking still wrong |
| M24 | Generate/inspect exterior, prop insert and wide map clean plates | local generated images + project copies | Seven plates cover more sets; missing map crop/dark close-up identified |
| M25 | Calibrate camera from stable background features | calibrate_reference_camera.py:SIFT,ratio.72,similarity RANSAC;252/301 fits,28 groups,median inlier error.385px/270x480 | Geometric background fits only; no whole-film match claim |
| M26 | Optimize calibration and integrate measured per-shot transforms | bounded OpenCV threads,FLANN;calibration.json,index.tsx | Original manual camera remains fallback; low-confidence fits omitted |
| M27 | Render and measure calibrated assisted preview | practice-v5-calibrated-preview.mp4;review-v5:MAE23.489,SSIM.7077 vs v437.003/.4921 | Large measured gain. Visual inspection and remaining rig/lighting gaps still required |
| M28 | Separate missing map-parking crop and dark-face environment | two imagegen plates generated and inspected; not integrated at this checkpoint | A new camera cannot repair a genuinely different set; actor movement must be independent |
| M29 | Create validated reusable skill and install it | brain skills/reference-animation-rebuild;Codex installed copy;quick_validate passes | Method/techniques saved; it must keep evolving with demonstrated results |
| M30 | Add local synchronized review player | build_reference_player.py;compare-v3.html | Frame stepping,shot jump,slow motion,source/study audio switching,local notes |
| M31 | Save rejection/current work and push milestone | AI-video d83aae6;brain928a447 | Ongoing target remains OPEN; generated plates/audio remain local/ignored |
| M32 | Owner requests all milestones/tools/steps and future exhaustive final checklist | this ledger;skill references/episode-release-checklist.md | Production quality gates include story/hook/retention and actual motion/audio review |

Later milestones must append actual outputs, comparisons, failures and fixes here. Do not overwrite prior verdicts or turn pending work into checked boxes.

## Iteration scorecard

All values below use the same105 synchronized samples at270x480. MAE lower is closer; SSIM higher is closer. Captions, grading and tiny shifts affect scores. These are diagnostics, not a percentage of completion or artistic approval.

| Export | Kind | Mean MAE /255 | Mean SSIM | Visual review status |
|---|---|---:|---:|---|
| practice.mp4 | rejected first silent vector study |43.738|.4876|35 shot stills +20 action samples; owner rejected |
| practice-v2-preview.mp4 | vector geometry rebuild |42.153|.4770|all105 samples inspected |
| practice-v3-picture.mp4 | corrected picture-only preview |41.992|.4802|metrics generated; not a standalone acceptance |
| practice-v3-mastered.mp4 | independent vector + original sound/text |42.336|.4778|105 comparisons generated; no full listening sign-off |
| practice-v4-assisted-preview.mp4 | four source-assisted plates + own rig/sound |37.003|.4921|all105 samples inspected |
| practice-v5-calibrated-preview.mp4 | seven plates + feature-measured camera |23.489|.7077|105 comparisons generated; final inspection/corrections ongoing |

## Master continuation checklist

### Source and scope
- [x] Primary reference local; provenance and picture metadata recorded.
- [x] Independent and source-assisted work distinguished.
- [x] Approved EP3 final protected and original source media ignored.
- [x] First draft rejection recorded; do not call it approved.
- [x] Existing tests and TypeScript exercised; code checkpoint pushed.

### Close the fidelity gaps
- [x] Add repeatable beginning/middle/end comparison,105 samples.
- [x] Record missed internal transitions rather than equating35 groups with35 complete shots.
- [x] Rebuild independent vector sets/rig and original scratch audio.
- [x] Test source-assisted clean set plates and foreground masks.
- [x] Measure background camera transforms; omit weak fits.
- [ ] Inspect all v5 comparisons and dense motion/contact strips.
- [ ] Integrate separate parking-map and dark-face plates with correct registration.
- [ ] Correct actor approach/blocking/scale in flashlight and close-up shots.
- [ ] Refine worker poses, genuine hand contact/weight and complete walk cycles.
- [ ] Match crowd identities, costume variety, blocking and motion instead of identical waving figures.
- [ ] Correct remaining phone/city graphic, control/mechanism/gap and end-card geometry/effects.
- [ ] Verify local darkness, beam origin, material shading, masks, reflections and no ghost bodies.
- [ ] Resolve text wording/size/timing/placement differences explicitly; debug labels absent from candidate.
- [ ] Review voice casting/tone/emotional performance and every spoken word on actual audio.
- [ ] Review cue choice/onset, voice-versus-bed balance, dynamics and complete playback.
- [ ] Render final-size candidate after last change and compare all shots/actions again.
- [ ] Verify exact requested matching scope; record remaining limits rather than declaring success from image scores.
- [ ] Owner acceptance / production promotion / posting: separate, still not established.

### Capture reusable production method
- [x] Skill created, installed and validated.
- [x] Source-specific shot grammar/landmarks and demonstrated failures captured.
- [x] Future pre-final checklist written: story/hook/retention,camera/effects,light/background,character/rig,motion,overlap/bounds,captions,voice,sound/mix/sync,export and analytics.
- [ ] Add final successful plate/camera/acting workflow and its measured limitations to skill.
- [ ] Persist prompt specs, asset manifest/hashes and build/review commands.
- [ ] Test the learned technique on an original shot before treating it as a general production recipe.
- [ ] Update this ledger,project TODO,brain home/session and installed skill at each real milestone.

## Tool and file inventory

| Tool / dependency | Actual use |
|---|---|
| PowerShell,Python3.14 | orchestration,media analysis,JSON/timings,procedural sound,documentation |
| yt-dlp | download public reference without cookies/login |
| FFmpeg9.0.1/ffprobe | metadata,cuts,frame extraction,PCM decode,loudness analysis/mix/master/export |
| Remotion4.0.539,React,TypeScript | deterministic frames,camera,SVG sets/rig,plates,masks,overlays,audio render |
| NumPy/OpenCV4.13/Pillow | temporal comparisons,MAE/local SSIM,contact sheets,source deltas,SIFT/FLANN/RANSAC |
| Built-in imagegen | precise object-removal edits to source stills;9 source-assisted clean set plates generated |
| Existing free edge-tts7.3.1 | original English scratch narration,word boundaries;Christopher voice |
| Existing Whisper/PyAV attempt | blocked by Application Control; not used for a claimed transcript/listening approval |
| Google-font package Anton; existing Kanit | condensed study captions and existing project typography |
| pytest,node:test,tsc | regression/timeline/type checks; not a visual/audio quality verdict |
| Git/Git Bash brain sync,brain graph gate | main-branch milestone commits/push and durable notes |
| skill-creator initializer/quick_validate | reusable skill creation/validation; installed copy in Codex skills |
| Local HTML video player | synchronized private comparison,frame stepping,slow motion,audio switch,review notes |

Project code: `src/compositions/ReferenceStudy/{shots.ts,FidelityScenes.tsx,index.tsx,calibration.json,captions.json}`. Legacy initial vector components remain in `Stages.tsx` for history/type compatibility. Utilities in `scripts/reference_study_review.py`, `scripts/calibrate_reference_camera.py`, `scripts/build_reference_sound.py`, `scripts/build_reference_player.py`.

Skill canonical home: `D:/second-brain/skills/reference-animation-rebuild/`; installed copy: `C:/Users/user/.codex/skills/reference-animation-rebuild/`. Future episode checklist is the skill's `references/episode-release-checklist.md`; create an evidence-filled per-episode review, not a permanently pre-checked template.

## Important failures and lessons

1. Generic geometry plus exact coarse timing produced a poor copy. Fix silhouette,composition,actor scale,detail density and acting before relying on render/tests.
2. One still per scene missed hand/rig/action bugs. Review temporal phases and contact intervals.
3. High cut thresholds missed real within-group transitions. Source-frame analysis and continuous inspection were necessary.
4. Uniform bottles/counting/blinks/camera pushes replaced source intent with generic loops. Per-shot measurements and action progress are required.
5. Background camera and character blocking are independent; the flashlight character advances toward the viewer.
6. A global dark overlay and bright replacement actor lose local lighting; reflections/overlapping bodies can become ghost images.
7. Silence-trim,content-aware cache keys and shorter original wording repaired scratch voice fitting; missing lines must not be silently accepted.
8. Whole-track loudness does not prove background balance or suitable voice tone. Actual audio review remains required.
9. FFmpeg9 removed `-vsync`; frame extraction uses `-fps_mode vfr`. A105-term left-associated select expression hit the parser depth limit; a balanced expression fixed it.
10. Source-assisted generated plates improved background fidelity substantially; source-derived provenance must remain explicit. Inlier residual from camera fitting is not whole-film error.
11. Do not print image-generation base64 in logs. Save the output path/prompt spec/hash and inspect the actual asset.
12. Keep creative judgments, observed measurements and inferred production techniques distinguishable. The source creator's actual software/workflow is not known.

## Reproduction order

1. Verify source/protected-final hashes and source metadata.
2. Load shot groups and inspect source temporal samples; update internal transition/action ledger.
3. Select independent vector or explicitly source-assisted plate mode.
4. Inspect/reference-guide each set asset; save prompt/spec,source frame,output path/hash and provenance.
5. Build rig/action/world layers; derive shared contact anchors.
6. Measure/fit camera; inspect confidence and missing-frame coverage.
7. Block actor movement independently; apply local light/shadow/occlusion.
8. Build original/authorized narration and sound,verify complete lines,then align captions/contacts and measure mix.
9. Render lightweight candidate; run105-sample comparison and inspect every sheet plus dense actions/full playback.
10. Log discrepancies,fix the largest,repeat. Render full size only for an integrated candidate.
11. Apply the complete per-film release checklist; preserve OPEN checks where evidence is missing.
12. Save/push project and brain milestone,refresh installed skill; keep production promotion/posting separate.

## Build/review commands used

```powershell
npx remotion render src/index.ts ReferenceStudy out/drafts/reference-study/DegJCmXtbGj/practice-v3.mp4 --crf=18 --concurrency=4
npx remotion render src/index.ts ReferenceAssisted out/drafts/reference-study/DegJCmXtbGj/practice-v5-calibrated-preview.mp4 --scale=0.5 --crf=20 --concurrency=4
python scripts/reference_study_review.py --source out/drafts/reference-study/DegJCmXtbGj/source.mp4 --render out/drafts/reference-study/DegJCmXtbGj/practice-v5-calibrated-preview.mp4 --baseline out/drafts/reference-study/DegJCmXtbGj/practice-v4-assisted-preview.mp4 --shots out/drafts/reference-study/DegJCmXtbGj/shot-review.json --out out/drafts/reference-study/DegJCmXtbGj/review-v5
python scripts/calibrate_reference_camera.py --source out/drafts/reference-study/DegJCmXtbGj/source.mp4 --shots out/drafts/reference-study/DegJCmXtbGj/shot-review.json --plates public/reference-study --out src/compositions/ReferenceStudy/calibration.json --stride 10
.venv/Scripts/python.exe scripts/build_reference_sound.py --out out/drafts/reference-study/DegJCmXtbGj/sound-v3
python scripts/build_reference_player.py --dir out/drafts/reference-study/DegJCmXtbGj --video practice-v3-mastered.mp4 --out compare-v3.html
npx tsc --noEmit -p .
node --test tests/walk-cycle.test.mjs tests/reference-study.test.mjs
.venv/Scripts/python.exe -m pytest -q tests
```

Use `--stride 10` (space-separated) for calibration. Paths above identify actual versions; future iterations need unique output/review folders.

## M33-M35: expanded QA and actor blocking correction

- **M33 - all-step record:** this milestone ledger, complete future release checklist, and9-asset manifest written. Source/reference/derived paths and hashes recorded; protected EP3 hash re-verified unchanged. Checklist includes voice suitability/emotion, whether a cue belongs now, bed levels under speech, borders/alignment/overlap, complete gait/rig actions, hook/story/retention and final export. English requested for communication.
- **M34 - failed automatic actor measurement:** neutral-color contour detector produced77/224 candidates but diagnostic sheets showed false detections on captions/window notices and missed tinted/dark faces. Rejected; never used as rig targets. Experiment/candidates preserved locally under `rejected-actor-detector.py` and `rejected-actor-candidates.json`. This is why diagnostics must be read, not just generated.
- **M35 - manual blocking guides:** source-reviewed head-center/radius keyframes added separately from background camera in `actor-blocking.json`. Inverse camera maps these to rig world coordinates; walk lean/bob compensated; chain anchor uses the same resolved rig layout. Distinct dark portrait and parking-map views added. Approximate guides still require the next actual render/comparison. No claim of exact mocap or matched acting yet.

## M36: voice-flow and resource-aware handoff feedback

Zen asked to protect token/credit allowance and to keep all important user feedback,agent findings,steps and open work in the brain following its handoff rules. Use English. Thai wording in the previous film feels unnatural/possibly translated; narration repeats a talk-pause-walk cadence. The reference's coordinated music/voice/tone/pacing is the benchmark. Do not assert translation was actually used.

Code check: Gemini is already whole-take; take-mode default pads are0; per-line mode adds0.25s before/0.5s after; production ambience beds already span cuts. Therefore inspect actual writing,performance,line boundaries/repair clips,edit and local action keys rather than claiming a whole-take toggle fixes it. The current study's short Edge clips are scratch timing,not matched-performance proof. No new production TTS or overwrite of approved EP3 was performed for this feedback.

Resource method: cached assets/voice/analysis,short affected previews before full candidates,full QA at meaningful milestones; no repeated image/voice generation without a demonstrated need. Exact account allowance/bill unavailable. Official OpenAI guidance reviewed2026-10-30: https://learn.chatgpt.com/docs/pricing (usage depends on task/context/model/tools/caching; actual limits in dashboard). No numeric budget specified. Do not promise negligible cost.

Canonical natural-Thai/voice-flow reference: `D:/second-brain/skills/reference-animation-rebuild/references/voice-flow.md`. Expanded release checklist and milestone handoff saved in skill/brain. Every milestone distinguishes planned,implemented,rendered,reviewed,listened,approved and posted.
