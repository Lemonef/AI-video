# TODO — the only place live status lives

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
- [x] Verify final export/cover and write `docs/flood02-release-review.md`; delivered exact `out/final/bangkok-flood/ep02/video.mp4` path.54.866667s/1646frames/1440×2560/30fps; actualmix-14.30LUFS/-1.85dBTP.39pytest+2gaitchecks/TypeScriptpass.
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
