# TODO — the only place live status lives

## QUEUE (owner order, 2026-11-01)
1. [x] Pipeline v1 shipped (brain a8fe06f)
2. [x] 3 practice jobs: 2 free passes, trap caught
3. [x] Mine all 36 reels: extraction + top-15 lessons (brain research/reel-top15-lessons-2026-11-01.md, cinematic-guide §4)
4. [x] Brain update + other agents read the brain: global block (brain docs/global-agents-md.md, tools/install_agent_globals.py), builder guard, doctor check; Codex+OpenCode live-tested; RAG auto-rebuild confirmed
5. [x] AgentsRoom via own MCP: brain tools/agentsroom_mcp.py proxy (13 of 175 tools), spawn + live status verified with app open; results come back via docs/agent-logs files (wait/get refuse non-AgentsRoom callers)
6. [x] Brain cleanup: research/ 124->53 items (c1c3f17), paper-trades price log archived 595->473 KB (85c6273); v2 shadow skill kept; memory/ + AGENT.md renames skipped (cross-repo churn, cosmetic)
7. [ ] 1:1 reference (DegJCmXtbGj) from v10, ElevenLabs voice; stash@{0} = Codex shot-7 lighting WIP (unverified)
   - [x] Measured gate scripts/reference_gate.py: same-settings control clips, stage guards, fingerprinted baselines, self-test pass+fail (501d758, f77eb1e); render-noise allowance from repeat run (cf2c123)
   - [x] Baselines from f77eb1e for shots 10,13,14,15,22,27,28,24,26 (gate-baseline/)
   - [x] Playable previews: CRF 16 High/yuv420p (-crf 0 = 4:4:4 = black screen); v12 playable copy
   - [x] IK lib src/lib/rig/ik.ts + 5 tests (8e2cff4); retrofit on lead rig DISCARDED by gate (<=0.006 MAE), branch ik/lead-rig kept unmerged
   - [x] Character score: actor-box crop MAE/SSIM in review + gate (eb4007b); scripts/actor_boxes.py derives boxes from LeadPerformance.tsx, shots 2/3 hand-measured; self-test 8 px shift = actor +2.14 MAE vs frame +0.30
   - [ ] Tool trials (local, zero tokens while running)
     - [x] Free vision (Gemini 2.5 flash) for joint coords: FAILS (generic skeleton); pose description OK -> hand-marking stays
     - [x] Blender 5.2.3 headless Grease Pencil v3 smoke render works (stroke + plane visible; materials need show_stroke=True)
     - [x] SAM 2 CPU (D:/tools/sam2, hiera_tiny): shot 2 = 52 frames in ~2.3 min (2.6 s/frame, 540x960), clean full-body masks; MUST prompt on a sharp frame (box + torso point, propagate both ways) - frame-0 focus blur sent the track onto the pink window
     - [ ] Joint pipeline (owner-agreed 2026-11-02): SAM mask -> Gemini points -> auto-check (point outside mask, limb length jump vs neighbours) -> Claude hand-marks ONLY flagged joints
       - [x] Shot 2: 10 frames pointed, check.py --sheet review, joints2keys.py (flagged joint = neighbour mean, focus-blur frame dropped) -> gate KEEP actor MAE 30.19->27.28 SSIM .566->.607 (4d80b9d)
       - [x] Shot 3: 11 frames pointed, keys in LeadPerformance -> gate KEEP (6593a42)
       - [x] Shot 7: joint route does NOT fit a front close-up (9/15 joints, invented legs, arms mostly flagged); joints.py now drops a null point instead of crashing. Arms hand-measured instead (see H1)
     - [x] SAM shot 3 masks (D:/tools/sam2/trial/track.py): 62 frames 175 s
     - [x] Gemini joints on SAM crops, shot 2 frames 5/25/51 (gemini-3-flash-preview; 2.5-flash 429, 3.7/3.8-flash time out, gemini-4-argon listed but 429 = no free quota): head/wrists/ankles/toes good, hips/knees weak
     - [x] Auto-check D:/tools/sam2/trial/check.py <shot_dir> [--sheet] (off-mask + leg/torso/head bone length vs median; arms exempt): flags 4-7 of 15 per frame, catches the visible knee/hip misses; arm-length rule over-flags foreshortened reaching arms; misses frame-25 high hip with only 3 frames (median weak)
     - [ ] Blender GP spike: shot 2 as GP rig render, gate vs IK SVG version
     - [ ] OpenCV optical flow for walking shots (later)
   - [ ] Character acting H1-H4
     - [x] H4 shots 2/3 pose (4d80b9d, 6593a42)
     - [x] H1 shot 7 alarm arms, shot-7-only override (ed33fd5: MAE 29.124->28.974, SSIM .6612->.6613; head-as-ruler try measured worse, discarded); baseline rebuilt at ed33fd5
     - [x] H2 shot 22 shutter timing + lead pose (a8042c6)
     - [ ] H3 shot 27 shutter + actor, then 24/26/28
       - [x] Closed-shutter shade overlay from region means (2cc27f3: 27 MAE 26.26->23.74, 28 18.17->15.72); sawtooth slats tried and discarded (groove phase off 4-8 px, MAE up)
       - [x] Shot 27 side-view lead hold, hand-measured (30a37fa: MAE 23.739->23.224, SSIM .5231->.5257); baseline rebuilt at 30a37fa
       - [x] Shots 24 / 26 / 28 error-map pass
         - [x] 24/26 shutter shade, curtain only (8135d5c: 22.27->16.22, 23.01->16.07); whole-frame and stage-only grades both failed on the actor box
         - [x] Pull badge green at 40 (34d6ca9: 26 16.07->15.05, 27 23.22->22.19); 26 actor +0.013 kept by hand as encoder spill
         - [x] 28 rule card above grade + fade timing + no clock (8217b3e: 15.72->12.16, SSIM .701->.715)
         - [ ] Later: shot 28 lead pose (source arms behind back), shot 22 shutter light
       - [ ] Gate flaw: crf20 encode spreads any local change over the whole frame (1.0-1.4 MAE between renders whose SVG differs only in a badge), so actor sub-scores can fail on spill. Fix: lossless gate renders (crf 0 or PNG) + rebuild all baselines once
       - [ ] Optional: slat groove phase fit at left and right edges
   - [ ] J1-J4 cut transitions + grades (full v13 luma scan vs source, per-frame)
     - [x] Shot 20: 3-frame flash + clock exits at 1537 (781a7b0; gate MAE 17.637->13.241, SSIM .7934->.8065). Shot 6 already near source.
     - [x] scripts/gate_in_worktree.py so pipeline attempts can render (smoke: unchanged shot 35 measures identical)
     - [x] Pipeline job ref-cut-transitions: all 3 rungs built it right (nemotron + terra identical gate numbers); brief numbers partly wrong. Kept 31/32 (c348cc3: 16.60->15.02, 17.70->16.42), dropped 8/9/23 (< 0.05 bar) and 28 (doubled its own dark grade, worse). Baselines 31/32 rebuilt at c348cc3
     - [x] Pipeline job ref-shot-grade: kept 23/28/32/34 (b754ced: 25.97->17.52, 24.46->18.16, 16.42->5.16, 25.19->7.99), dropped 3/19 (local mismatch, global slope worse). Baselines rebuilt at b754ced
     - [ ] Shots 3/19 local brightness (region, not global) - after shot 3 pose
     - [ ] Full v14 render
     - [ ] Umbrella video-maker skill (owner ask: same animation level + quality on new stories) - right after v14
     - [ ] Update skills/reference-animation-rebuild/SKILL.md lessons (shade overlay from region means, sawtooth needs phase fit, Gemini joints unreliable -> hand-measure with rig head geometry)
   - [ ] V1/V2 ElevenLabs stock voice; M1 original music bed (never the source song), -14 LUFS; F final
   - [x] stash@{0} dropped (saved out/drafts/stash0-codex-shot7-lighting-wip.patch); wishes01 + download_batch2 parked on branch park/wishes01-and-batch2; .agentsroom/ ignored
   - [ ] Owner: English-channel monetization answer
   - [ ] LAST in queue (owner 2026-11-02: "add the repo clean up at last, rn its so messy"): AI-video repo cleanup - re-check the plan against the repo as it stands then, show it, then execute
9. [ ] Upload quality (owner 2026-11-02: "ppl say video quality is bad")
   - [x] Static film grain overlay (src/components/Grain, GRAIN token) + yuv420p/bt709 tags in render.py (3c035d0); test render probes yuv420p/tv/bt709 1440x2560
   - [ ] Re-render lift ep1 (or next episode) with grain, then compare against the TikTok copy after upload (owner downloads it; auto-mode blocks the API)
8. [x] Flood ep 3 (Part 3) - branch B: final out/final/bangkok-flood/ep03 (74s, -14.0 LUFS), src 42812b1; posting = owner

## CURRENT — 2026-11-01 agent pipeline + paused 1:1 (read first; full context: brain session-log 2026-11-01)
- [ ] 1:1 reference rebuild (private, never posted): paused at v10 (MAE 18.79 / SSIM .777, not 1:1); WIP committed 5fab1ff.
  - [ ] Codex resumes when quota resets: open boxes of the ledger "Master continuation checklist" (docs/reference-study-milestones-DegJCmXtbGj.md), picture first, then ElevenLabs voice (key ~/.secrets/elevenlabs_api_key - owner to ROTATE), measured gate (keep a change only if MAE down + SSIM not down).
  - [x] Guided-loop handoff written: docs/handoff-gemini-reference-loop.md (reusable by any builder).
- [ ] Reel mining (both batches, 29 + 7): handoff docs/handoff-gemini-reel-mining.md; sent to Antigravity agent 2026-11-01 (result unverified).
- [ ] Agent pipeline (owner talks only to Claude; Claude launches builders via `bash D:/second-brain/tools/run_agent.sh <codex|gemini|antigravity> <repo> <handoff> <log> [model]`)
  - [x] AgentsRoom installed (free): projects D:\ + D:\AI-video
  - [ ] Add agents in AgentsRoom; check if it can start agents from the command line
  - [ ] Retest OpenCode free builders (config ~/.config/opencode/opencode.json: NVIDIA GLM 5.3 / DeepSeek / Kimi K3, Mistral Devstral/Codestral, OpenRouter Nemotron) - first test gave empty output
  - [ ] Design tiered pipeline (plan Opus -> build Codex sol/terra/luna | OpenCode free | Antigravity -> verify other company + free legs -> escalate on gate failure) and get owner approval before building
- [ ] Flood Part 3 finale: waits for the real Part 2 A/B count
- [ ] Untracked draft episodes/wishes01.json + src/v7/Wishes.tsx ("ตะกรุดสามคำขอ"): owner to decide keep/drop


## CURRENT — 2026-10-31 Bangkok flood Part2
- [x] Owner confirmed B: join the other residents; Thai-first story and three hooks reviewed before voice.
- [x] Capture/review29 reference posts in the brain:26videos,2carousels,1restricted; preserve271returned comments,approximateASR,upstreamskilltexts and localmedia hashes. Seven later URLs remain queued.
- [x] Use actual content-principles/ig-reel/earshot guidance; no English-only numeric score or fixed runtime imposed on Thai.
- [x] Produce15-scene original continuation,8-person group, readable route, chair handoff, cabinet load, phone recording and rear-door flank.
- [x] Address plain preview: distinct lived-in room606, motivated lantern/cool emergency light, set depth, purposeful framing and fixed-length contact IK.
- [x] ElevenLabs stock audition rejected; native voice-design API blocked on Free. Owner selected established Iapetus tonight; ElevenLabs improvement remains separate.
- [x] Build one cached Iapetus performance, align all15scenes, integrate CC0 hard-floor/furniture recordings and continuous bed dynamics.
- [x] Review every scene and16contact phases; replace flat floor masks and hovering red-thug hands with targeted frame renders.
- [x] Remove5measured quiet centers only, preserve reveal/end holds, fix unity-speed audio-tail handling and check the actual exported clock.
- [x] Verify final export/cover and write `docs/flood02-release-review.md`; delivered exact `out/final/bangkok-flood/ep02/video.mp4` path. Owner heard slight rushing; current57.166667s/1715frames after4percent pitch-preserving sharedAVretime. Actualmix-14.21LUFS/-1.83dBTP. Priorfinalarchived;39pytest+2gaitchecks/TypeScriptpass.
- [ ] Owner listens/reviews and posts; record actual vote/retention before Part3. No automatic social post.
- [ ] Later: improve ElevenLabs Thai casting/performance; review seven queued posts and investigate sourcecreator stack (still unverified).

## NOW (2026-10-30) — read this first
- [x] New survival story Part1 built/reviewed: out/final/bangkok-flood/ep01/video.mp4,45s,1440x2560; flood + looter antagonists, cover/post/script. docs/flood01-release-review.md.
- [ ] Zen watches/posts flood Part1; collect actual A/B votes and retention before Part2.
- [x] Group existing final arc as out/final/ghost/ep01–ep03; approved ep03 bytes/hash preserved.
- [ ] Reference-copy study PAUSED at owner request; incomplete, keep checkpoints.
- [x] Part 3 approved and promoted: `out/final/ep03/video.mp4` (78.6 s) with revised cover/post/script. Previous final archived as draft: `out/drafts/ep03/previous-final/video.mp4`. Review: `docs/ep03-rewrite-review.md`.
- [ ] กฎเข้าป่า series
  - [x] Part 1 posted
  - [x] Part 2 posted (IG ~1.1K views first night, 2 real followers; TikTok stuck at ~3 views - check "not eligible" warning)
  - [x] Part 3 finale approved: `out/final/ep03/video.mp4` 78.6 s (repaired hands and animated pull, full-body shadows, corrected B caption and voice).
  - [ ] Zen posts Part 3 at 20:00 (TikTok, IG via Business Suite, YouTube) + pins comment
  - [ ] Collect numbers: views, avg watch time, retention graphs (IG + TikTok), comments
- [ ] Upgrade phase (start in a NEW chat; Codex does the heavy work, Claude writes the contract + checks frames)
  - [ ] Read Part 2/3 retention graphs → where viewers drop
  - [ ] Private visual reconstruction of reference reel IG DegJCmXtbGj (never posted; `docs/reference-study-DegJCmXtbGj.md`)
    - [x] Download and inspect reference; measure 35 shot groups
    - [x] Rebuild isolated sets, poses, camera and lighting on the measured timeline
    - [x] Render and inspect every shot plus action sequences (93.3 s, 1080x1920, silent practice.mp4)
    - [ ] Continue autonomous matching after Zen rejected first pass; self-review every shot/action, close fidelity gaps before story upgrades
    - [x] Original scratch narration/foley and word captions built; v3 rendered, not fidelity-approved
    - [x] Four-plate source-assisted experiment compared at105 samples; improves MAE42.3 to37.0, not1:1
    - [x] Inspect all seven v6 comparison sheets; v7 full-resolution progress delivered
    - [ ] Picture/animation first per latest owner feedback: finish measured crowd paths/poses, lead rig/acting, hands, light/torch, diagrams/camera/text; voice deferred
    - [x] Short crowd v8 tests, measured head paths and source-frame proportion correction (not full-film acceptance)
    - [x] Reusable reference-animation-rebuild skill created/installed; keep enriching actual techniques
  - [ ] Future-film natural Thai/prosody/edit review: vary talk/pause/action rhythm; inspect actual whole-take flow and continuous beds; use docs/episode-release-checklist.md before final
  - [ ] Character7 (new simple Jaab, `src/v7/Character7.tsx`) wired into SceneV2 (style v7 / view prop / FACE_BOX7)
  - [ ] Camera vocabulary: over-the-shoulder, from behind, POV, low/high angle, mood shot first
  - [ ] Test a ChatGPT-generated background plate (Zen saves it to `assets/`) behind the animated cast
  - [ ] Next story (zombie store story assets exist: `src/v7/Store*.tsx`; ideas in `docs/story-ideas.md`)
- [ ] TikTok reach: appeal if flagged; else keep posting on schedule

## Working rules
- Codex: `codex exec -m gpt-5.6-terra -s workspace-write -c sandbox_workspace_write.network_access=true -C D:/AI-video "<contract>"`; Claude commits after checking 3-5 frames.
- Renders: every cut in `out/versions/<ep>/`, `out/final/<ep>/` = latest only; locked → `make.py <ep> --publish`.
- Watch renders with ONE completion notice; check once at ~10 min for a stall.

---
# History

## v1 pipeline
- [x] Remotion project 1080×1920 / 30 fps, typecheck clean
- [x] Flat-2D character kit (poses, expressions, walk/wobble/bounce/shake/turn) + Mochi lead + 6 supporting cast
- [x] Episode = one JSON file; registries for cast / backgrounds / props
- [x] Thai TTS (edge-tts, retry/backoff, digit guard) behind a Strategy/Factory seam
- [x] Word-timed captions (pytest-covered)
- [x] Freeze 3-2-1 countdown + A/B end card + procedural SFX
- [x] Loudness master to −14 LUFS
- [x] ep01 rendered to `out/ep01.mp4` (40.5 s), frames checked
- [ ] Zen reviews ep01 (look, voice, pacing)
- [ ] Zen picks voice (edge Premwadee / Niwat, or Google Chirp 3 HD, or F5-TTS-THAI clone)

## Next (from `docs/references.md`)
- [ ] Persistent stakes HUD across episodes (e.g. "ความคิดรั่ว ●●○", day counter), the "Keep Pip Alive" device
- [ ] Beat headline strip at the top of each scene (taped-paper banner)
- [ ] Optional word-chip captions (one chip per word; word timings already exist)
- [ ] Whip-pan transitions between scenes; light grain + vignette pass
- [ ] Cover still (`remotion still`) for the TikTok thumbnail
- [ ] Whisper re-check of the final MP4 (catch mispronounced words)
- [ ] Evaluate official Remotion agent skills (github.com/remotion-dev/skills)
- [ ] vitest for `src/lib/castState.ts`
