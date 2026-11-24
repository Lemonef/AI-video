# TODO — the only place live status lives

## NOW 2026-11-23 — ep02 full video (Zen away: "make one full vid today ... after vid done stop")
- [x] Full audio: 88 beats, Gemini batched TTS + Groq word-timestamp split -> D:/AI-video/videos/pastly-life/02-blackbeard-ink/assets/full-hybrid/master.wav (17803 f)
- [x] Shots script tools/ink/ep02_full_shots.py (b1-b88, old plain sNN scenes) -> engine/ink/parts/shots_ep02full/full.json, lint OK (186 shots, 92 cards, per-minute split/TF 2-4, icon caps)
- [x] Composition InkEp02Full registered
- [x] Render -> D:/AI-video/videos/pastly-life/02-blackbeard-ink/draft/previews/ep02_full_hybrid.mp4, check stills, send
  - [x] render 1 crashed @17055: b85 scale coin/coin (renderer bans equal icons); fixed b85 pen/coin + SCALE asserts it; tail 17000-17802 test render clean
  - [x] render 2 OK: 593.45 s 1920x1080 + audio, 460 MB; 8 stills read OK; share copy ep02_full_hybrid-share.mp4 (720p, 26.4 MB) sent 2026-11-23
- [x] old s03 (Zen-rejected) back in full render at 1:46 -> REJECTED.json hash ban in SC(), s03 = approved mid again; still f3200 checked
- [ ] ep02 REDO per brain TODO (photo hunt, new art per minute, fresh job per minute). Lints done: reuse + meter overlap (13cb111) + clear_meter fit
  - [x] min1 m1a/m1b/m1c merged (96b839f, a849b65, b332fa5)
  - [ ] m1d qar deck: attempt 1 review-fail (reviewer reads PNG bytes, no vision), attempt 2 running
  - [x] briefs drafted min2-min7 (24 scenes, scenes_minN.py + briefs + manifests, committed)
  - [ ] Groq + Cohere review min2-min7 -> scenes_minN_review.md -> --stamp
  - [ ] pipeline job per scene m2-m7, eye-check, cherry-pick, push
    - [x] m3a town tavern accepted (a0023c1)
    - [x] m3b loot shares accepted (4658ec3)
    - [x] m3c nobody watch accepted (7899458)
    - [x] m3d dawn sails accepted (6c7a3cb); min3 sheet sent
    - [x] m4a twenty vs sixty accepted (4b877ad)
    - [x] m4b the look accepted (818101c)
    - [x] m4c ships surrender accepted (4d8d4c2)
    - [x] m5a cut anchor accepted (17397d1; rung 2 fixed the BB scowl, low deck cam)
    - [x] m5b both stuck accepted (10b8fb5)
    - [x] m5c closing gap accepted (3899f4e; over-shoulder Maynard cam, clean)
    - [x] m5d shouted challenge accepted (45a4fc2)
    - [x] m6a broadside accepted (c5c6d38)
    - [x] m6b navy hurting accepted (e7fb0e9)
    - [x] m6c empty deck grapple: run 2 needs-owner (boats too far, officer faces pirates, BB 3/4 face); brief fixed 55f8567 after Codex review 2 FAIL (2 contradictions), review 3 PASS (28b68d8), run 3 ep02-scene-m6c-empty-deck-grapple-20261124005447 accepted cc9a91a (eye-check: hull against hull, officer back turned, BB profile raised brow, clean, md5 not rejected)
    - [x] m6d hatches burst: accepted fabf07c (low angle from the hold, Opus audit PASS, md5 a9d28bbf not in REJECTED)
    - [x] m7a deck brawl accepted ac76e92 (rung 2 astra, md5 d89de5ad not rejected, eye-checked)
    - [x] m7b powder fuse accepted b76236c (rung 0 sol, md5 cfc4148f not rejected, eye-checked)
    - [x] m7c sword snap accepted cec3a44 (rung 0 sol, md5 5c2ca736 not rejected, eye-checked)
    - [x] m7d still standing accepted 49019cc (rung 1 astra, md5 7c65c7cd not rejected, eye-checked: high angle, navy ring, BB standing)
    - [x] m7e bowsprit far accepted ada3ffa (rung 2 astra, md5 not rejected, eye-checked: far sloop, bundle on bowsprit, 2 tiny cast figures, clean)
    - [ ] card fix 1 (cards explain by context): diffgate fixed 16aa6b0 after review 2 FAIL, review 3 PASS (28b68d8), job ink-ep02-card-fix1-20261124005433 needs-owner (rungs 0-1 audit FAIL: tags echo layout, CARD_FACTS table, full-stage overlap, no report; rung 2 timeout). SUPERSEDED by fix 2
    - [ ] card fix 2: brief+gate+beat words 0343eed; Codex Sol review 1 FAIL (junk words pass, mark not tied to label, map unspecified, cards with no fact); gate+brief fixed f6d6810; re-review running, then pipeline
    - [ ] NOTE generator drift: scenes_minN.py / make_scene_briefs.py no longer match the committed min6 briefs (hand edits); regen breaks plan_check hashes. Committed brief = source of truth; reconcile generator later
    - [ ] min5/min6/min7 progress sheets (m7e done)
  - [ ] scenes_min8-10 (b69-b88), callbacks named, 1 photo/min
  - [ ] rewire ep02_full_shots.py to per-minute plates + CALLBACKS + photo spread + scene/photo repeat lint
  - [ ] render min2 first, then full + share copy
- [ ] 3 ep02 thumbs (if time)
- [ ] ep02 explain cards redo (Zen 11-24 "white card no design ... should explain according to context")
  - [x] brief 1 surface merged (59a19f4)
  - [x] brief 2 content merged (1fa0558)
  - [ ] fix brief 1 (4019e56): real-font text width, underline only under captions, tags off captions, <=6 words, 8542 no lantern, 4659 no LAYOFF; Codex plan check waits on quota reset
  - [x] spec + contract test (4fffa25), brief + lint baseline gate (3bc6902), free-leg critique read
  - [x] Codex sol review 1 = FAIL (8 must-fixes); brief/spec/tests revised (e9d5251)
  - [x] Codex sol review 2 PASS, plan_check stamped (fd41748)
  - [x] attempt 1 gate-failed only on cardlib2h3 sha freeze; gate skips that test, Codex sol review 3 PASS (339448a)
  - [x] pipeline job ink-ep02-context-cards-20261123200750 merged (59a19f4, pushed): 7/7 contract, tsc 0, lint baseline OK, b81 on s01
  - [x] stills read (6 cards): plate+sheet+vignette render right; content still thin (e.g. 'paid from his own budget' = 2 sloops), sheet hides ~80% of scene
  - [ ] brief 2: per-beat card content (key fact biggest, callouts on drawing, artifacts as evidence) - critique says surface alone = decoration

## NOW 2026-11-22 — Pastly Life ep02 Blackbeard minute one (read first)
- [x] White-key cutter merged (pipeline e40283f) + gate stdin fix (57a4b71, 18 passed x3)
- [x] Cast sprites cut from 3 master sheets, names read off contact sheets (de98d3c, 123 png)
- [x] Shots script tools/ink/make_ep02_min1_shots.py -> engine/ink/parts/shots_ep02min1/{hybrid,straight}.json, lint clean (hybrid 28 shots, straight 27)
- [x] Compositions InkEp02Min1Hybrid / InkEp02Min1Straight registered
- [x] Year card read "1,718" in sheet -> bignum group:false flag (003d1b3); min1 build committed (e9bc39c)
- [x] Render both -> D:/AI-video/videos/pastly-life/02-blackbeard-ink/draft/previews/ep02_min1_{hybrid,straight}.mp4 (65.7 s / 57.2 s), year card checked 1718, sent (720p share copies) + opened
- [ ] Zen picks hybrid vs straight (Claude rec: hybrid, no jokes on death beats) -- ON HOLD until quality reset passes
- [ ] 3 ep02 thumbs; fix bath_gent_shocked outline gap (moot if humans go stickman)
- [x] White halo on sprites (Zen 11-22 "pixelate white outlines"): binary alpha kept blend pixels -> unmix_white_edge, cast re-cut, ring-1 light 67-78% -> 0-0.1%, 21 tests pass (e449d58)
- [ ] **Min 1 BELOW BAR (Zen 11-22)**: plates not Ink/Beanie level, explain cards far under Ink, characters pasted on plates with no depth, realistic humans look bad, no real photos. SKILL rule 11 side-by-side gate was skipped before render (correction 2026-11-22-ep02-min1-below-bar). Reset:
  - [ ] Side-by-side sheet: our min-1 frames vs Ink + Beanie frames, same shot kinds, scored on rule-11 anatomy
  - [ ] All humans = Ink-style stickman (drop bath gent/merchant/farmer sprites)
  - [ ] PD photo hunt (Wikimedia/LoC: Blackbeard engravings, Bath/Ocracoke maps, QAR wreck artifacts) -> photo beats, no gap >2 min
  - [ ] Scene shots = character drawn INTO the plate (shared light, contact shadow, foreground occluder, small/turned/cropped), not pasted front-centre -> Zen OK 11-22 "apply all"; Codex plan quota (no money)
    - [x] s01 deck party (66a9f66), sent to Zen
    - [x] briefs s02-s11 + plan_checks (b2fb38d)
    - [ ] s02-s04 building (pipeline), then s05-s07, s08-s10, s11; eyeball each vs s01 + sheets
  - [ ] PD photos: moseley_map_1733.jpg OK; bb_engraving_1724 retry (Wikimedia 429)
  - [ ] HUD tracker overlay like Beanie NOISE meter (Zen 11-22 "See" still) -> ep02 survival-odds meter, SKILL rule 12
  - [ ] Explain cards rebuilt to Ink anatomy, judged vs Ink still before render
  - [ ] Re-render min 1 only after side-by-side passes; send sheet with render

## NOW 2026-11-16 — Pastly Life ink ep01 polish (read first)
- [x] FINAL render `draft/current/ink_ep01_full.mp4` (p01-p24)
- [x] Scene-switch "weird sound" diagnosed: no SFX/clicks (151 cuts measured); music bed swells ~+10 dB in VO gaps
      that sit on cuts (e.g. 147.9->149.3 s across p07 cut 148.87 s) = duck release/pump
- [ ] Music fix (Zen 2026-11-16 "where is the background music"): bed was -23 dB vs mix
  - [x] music_bed.py: loudnorm bed to TARGET-10 LU, duck threshold derived for 6 dB dip, release 1200 ms -> -13.6 dB vs mix, -19 under speech
  - [x] re-render (v1 full 654.5 s, -14.8 LUFS); logo OK per Zen 2026-11-16
  - [ ] Zen listens to music bed (VO edge fades still open)
  - [x] "Cut sound" re-check (Zen 2026-11-16 v3): 78 VO clips padded 220-495 ms both ends (not chopped); v3 mp4 audio == master.wav (0 diffs >6 dB)
  - [x] loudnorm gain-riding suspect RULED OUT: mix-vs-voice offset steady -3.3 dB (p5 -4.1 / p95 -1.8) over 10.9 min
  - [x] ROOT CAUSE: ink_audio.py adds synthetic whoosh (beat start, incl. t=0) + pop (every shot) at -16 dB, timed to the OLD timeline_full shot splits; first 57 s = 25 SFX, only 4 within 3 frames of a real cut -> clicks mid-shot. Earlier "no SFX" diagnosis was wrong (checked only at real cuts)
  - [x] SFX dropped (ink_audio --no-sfx) + music louder (bed ~8-10 dB under speech) -> .build/.../remix-nosfx/master_music.wav; muxed on v3 video -> draft/versions/ink_ep01_v4sound_first1min_send.mp4, sent
  - [x] Zen: "this music is bad, find something better + better sound effects" (2026-11-16). Root cause old bed 475737 = 95% energy <200 Hz, phone speakers cannot play it. CC0 music + SFX shortlist in listening folder -> Zen picks -> remix with picked track + real SFX placed from render shot JSONs -> picked 3 (621294) 2026-11-17
  - [x] Audio stems written separately (voice.wav / music.wav / sfx.wav / final_mix.wav); Zen confused master_music.wav = full mix -> .build/pastly-life-01-eiffel-ink/remix-v4sound
  - [x] Zen picked v4nomusic first minute 2026-11-17 ("ok no sound", "this one good") = no music track, voice+pad+sparse SFX; v3 card merge OK
  - [ ] v4 full: new master + merge pass + even-quality pass p03-p24, full re-render; first min >=26 cuts, rest 20-24/min (new pictures, hard cuts); payoff-first hook kept (b01); Ink lessons, not a copy (D:/second-brain/docs/ink-episode-quality-bar.md)
    - [x] v5 first minute sent 2026-11-17: 26 cuts at scene>0.3 in 57.2 s (v4 16); 9 long v3 shots split into new pictures on word starts; tools/ink/make_v5_shots.py -> engine/ink/parts/shots_v5; InkFirstMinV5; draft/versions/ink_ep01_v5_first1min(_share).mp4
    - [x] Zen verdict on v5 (2026-11-17): 0:03-04, 0:29, 0:32, ~0:50 rush, 0:53-54 worse (padding plates, chimney halved); liked 0:36
    - [x] v6 first minute 2026-11-17: v3 + splits 402/666/1001/1263 only (make_v5_shots.py v6 -> shots_v6, InkFirstMinV6), 24 shots; draft/versions/ink_ep01_v6_first1min(_share).mp4 sent + opened
    - [x] v6 audio fix 2026-11-17 (Zen: "how is that weird sound effect back"): v5/v6 comps played old ink60full/master.wav (music + old SFX); now EPISODE_AUDIO = ink60full/master_v4nomusic.wav (copy of remix-v4sound/final_nomusic.wav), v6 remuxed, RMS matches v4nomusic send (-17.79 vs -17.77 dB)
    - [x] Zen verdict on v6: OK 2026-11-17 ("ready for full video")
    - [ ] full-episode render must use EPISODE_AUDIO too (InkBuilt + older comps still on master.wav)
    - [ ] NO DROP (Zen 2026-11-17 "most important"; revised after v5): measure QUALITY per quarter, not cut count. Any new shot p03-p24 = picture designed one by one for its line (no library plate to pad cuts, never halve a drawn build). quality_by_quarter.py reports cuts/min as info only (Beanie: 36 in min 1 then ~9/min)
    - [ ] publish pack: Zen picks title/thumb/desc (videos/pastly-life/01-eiffel-ink/script/publish.md)
- [ ] Even-quality pass p03-p24 (Zen 2026-11-16 rule, brain docs/ink-episode-quality-bar.md): photos every quarter, no repeated / side-view-only plates, no bare white cards
  - [ ] build tools/ink/quality_by_quarter.py (per-quarter photos, distinct plates, angle mix, card share; fail if below Q1)
  - [ ] Zen OK on draft/ cleanup (~2.4 GB old builds) — asked, not yet answered
- [ ] Real photos only early (Zen 2026-11-16): 8 PD photos all in p01/p02/p06 (<=2:29 of 10:54); p03-p24 zero -> source more PD photos for later story beats (needs Zen OK on list)
- [x] Background/camera audit (Zen 2026-11-16 "enough background... various camera angle?") -> v2 REJECTED, v1 stays
  - [x] Audit: 152 shots = 92 plate (45 distinct images, 409 s) + 56 paper cards (236 s, 36%) + 4 PD photos;
        plates vary angle (extreme wide, birdseye, low-angle up, top-down desk, close-up rust, framed doorway);
        weak: stickman always full-body eye-level same size, 85% of moves = same slow centre push-in 1.00->1.06,
        ~half of 20 s samples are paper cards, some near-empty (lone stickman on blank paper)
  - [x] v2 first minute (camera grammar + fewer bare cards; v1 untouched)
    - [x] `cam` field in schema + Camera in InkParts
    - [x] generator tools/ink/make_v2_shots.py -> engine/ink/parts/shots_v2/
    - [x] InkFirstMinV2 composition
    - [x] stills checked; fixed 6 cut-offs (SOLD, GOT AWAY, ESCAPED, ticks, chimney quote, redact bars)
    - [x] render + send to Zen (57.2 s, sent 2026-11-16) (draft/versions/ink_ep01_v2_first1min.mp4)
    - [x] Zen verdict 2026-11-16: "too dissy", "wrose than v1" -> REJECTED, no rollout; v2 code kept (unused) for reference
          lesson: camera move on every ~2.4 s cut = dizzy; first minute pacing 24 shots/57 s (2.4 s avg) vs 4.3 s rest of ep
- [ ] v3 first minute = v1 + short cards merged (Zen 2026-11-16 picked option A: "ok sho me v3 the a")
    - [x] generator tools/ink/make_v3_shots.py -> engine/ink/parts/shots_v3/ (merges at f0 143, 1001, 1263)
    - [x] InkFirstMinV3 composition, tsc clean; stills f200/f1120/f1370 checked, no overlap/cut-off
    - [x] render + send (57.2 s) draft/versions/ink_ep01_v3_first1min.mp4: 21 shots (was 24), shortest 1.8 s (was 1.0 s)
    - [x] Zen OK (v4nomusic first minute uses v3 video, 2026-11-17) -> merge pass p03-p24 goes into v4 full
- [x] Logo: 12 concepts `videos/pastly-life/brand/logo/` (html source + png/ + contact_sheet.png), sent to Zen
- [x] GPT-image logos: 10 via Codex gpt-6.1-sol (paused at 3, resumed) -> `videos/pastly-life/brand/logo/gpt/`
      gpt_logo_01..10.png + gpt_contact_sheet.png, all 1024px, spelling checked by eye, sent to Zen
- [ ] Zen picks logo -> replace placeholder `Watermark` (engine/ink/compositions/InkProof.tsx:195), re-render
      - [ ] Zen floated the 2-line Ink Free wordmark "PASTLY / LIFE" with an orange underline: advised wordmark for watermark/banner + icon (GPT #10 or PL) for avatar; awaiting "go"
      - [x] Zen: "watermark should be simple, want more designs" -> 12 simple Ink Free watermarks `videos/pastly-life/brand/logo/watermark/` wm_01..12 + wm_sheet + wm_corners_1to1 (true size in frame), viewed, sent
      - [x] Zen picked GPT #10 -> make_wm_rewind.py -> assets/brand/wm_rewind.png, Watermark = Img 72px @0.8 (still checked frame 1200)
      - [ ] full re-render verified

## NOW 2026-11-09 — jaab3d engine + mood01 "ฟ้าตามอารมณ์" (read first)
- [x] jaab3d engine (three.js world via @remotion/three; 2D card cast; weather kit) `engine/jaab3d/`
- [x] mood01 built: no main character, simple end question, no A/B; 84.7 s 1080x1920
- [x] Render path while Smart App Control blocks Remotion ffprobe: `--props='{"audio":false}' --muted`,
      cue sheet `MOOD01_AUDIO` dumped via esbuild -> ffmpeg mix -> master.py (-14.0 LUFS, TP -1.3)
- [x] Final: `out/final/mood/ep01/video.mp4`; QA contact sheet + end card read
- [ ] Zen posts (IG + TikTok @jaabjaab); collect views / retention
- [ ] Cue-sheet mixer lives in scratchpad; promote to `tools/pipeline/mixcues.py` next episode

## QUEUE (owner order, 2026-11-01)
-1. NOW (owner order 2026-11-04, lift03 ep3 posted TikTok + IG): finish 1:1 -> skill work -> next video (story 04) built with both
   - [ ] A. Finish 1:1 DegJCmXtbGj (item 7 below): remaining loop shots, v15 render, V1/V2 voice + M1 music, owner side-by-side approval
     DONE BAR (owner 2026-11-04): owner's eyes AND ears on a side-by-side - picture + voice + music + SFX + extra sound all matched; numbers are diagnostics only
     - [x] A1 resume check: v14 artifacts + 35 baselines present; gate re-run on shot 7 unchanged = bit-identical (24.244, guards 4/5/9 held)
     - [ ] A2 picture loop: shot 7 head/hands/arms, 9, 22; grade curve on 35/4/25/6 (pipeline free legs, gate verifies)
     - [ ] A3 voice: ElevenLabs stock voice timed to source (never clone the creator)
       - [x] voice pick: Daniel (speech-to-speech A/B, owner "so close"; Callum backup)
       - [x] full narration re-voiced: out/drafts/reference-study/DegJCmXtbGj/narration/daniel-sts-full.mp3 (93.30 s vs 93.32 s, ASR 98% word match)
       - [ ] owner listens full take; check 'rolls' and 'shutters' spots
     - [ ] A4 SFX: event map of source sounds -> CC0/toon clips -> listening preview for owner BEFORE mixing
     - [ ] A5 music: original bed (never the source song), -14 LUFS
     - [ ] A6 v15 full render + side-by-side video+audio vs source -> owner watches/listens
   - [ ] B. Skill work — LIVE PLAN: D:/second-brain/skills/video-maker/skill-plan.md (single source, 2026-11-09). Old notes: reference-study rename, seed craft skills with 1:1 lessons, strip-mine github.com/mromidev/claude-animated-shorts (MIT; method only, never its reference frames)
     - [x] B-gaps1 (2026-11-05, brain 69f399b/057457f): hook, background, ending skills + A/B policy in video-maker + skill map
     - [ ] B-gaps2 TO BUILD (skill-gap cross-check 2026-11-05, 7 free legs; votes in brackets):
       - [ ] editing-pacing skill: cut rhythm, scene length, transitions, beat sync to voice [3 legs]
       - [ ] series-continuity skill: series bible - cast, props, open threads, callbacks across parts [4 legs]
       - [ ] storyboard/animatic skill: beats -> rough frames before render [1 leg + Claude: saves re-renders]
       - [x] fold motion fundamentals (timing, easing, anticipation) into character skill [2 legs]
       - [x] add locked series style bible line to background skill [1 leg]
       - [ ] update skill-map.md + skills.md + video-maker call list; features-log line
       - parked (owner 2026-11-05): analytics/retention (Claude pulls public numbers only, rare), trend radar
       - also raised, not picked: AI-voice post-processing (script-voice covers), asset ops, legal/copyright check (release covers)
     - [ ] More reels from owner coming later -> reference-study lessons
   - [ ] B2. 3D look test (owner OK 2026-11-04): rebuild ONE existing set (lift interior) in the claude-animated-shorts three.js template, 3-4 camera angles, side-by-side vs our 2D; owner judges. 3D fixes set variety/depth/light, NOT poses/SFX/story. Win -> story 04/05 goes 3D
   - [ ] C. Next video = ตะกรุดสามคำขอ (promised in posted lift-ex ep3 end card), ONE standalone ep, genre open (one-sentence what-if); NO จ๊าบ (dropped 2026-11-05, own cast per premise); ideas from cross-agent fan-out; reuse wishes01 art only where it fits. Not Gojo/เด็กช่าง (others videos)
0. [superseded 2026-11-04 by NOW] Token budget mode (owner 2026-11-03): weekly Claude quota low, keep it for this week's next episode.
   Heartbeat cron stopped; 1:1 loop PAUSED until the episode ships. Next episode first.
   - [ ] Story skill (later, owner call): turn docs/story-ideas.md "How to judge a story" + the standalone-part methods into a reusable skill when the next story starts
1. [x] Pipeline v1 shipped (brain a8fe06f)
2. [x] 3 practice jobs: 2 free passes, trap caught
3. [x] Mine all 36 reels: extraction + top-15 lessons (brain research/reel-top15-lessons-2026-11-01.md, cinematic-guide §4)
4. [x] Brain update + other agents read the brain: global block (brain docs/global-agents-md.md, tools/install_agent_globals.py), builder guard, doctor check; Codex+OpenCode live-tested; RAG auto-rebuild confirmed
5. [x] AgentsRoom via own MCP: brain tools/agentsroom_mcp.py proxy (13 of 175 tools), spawn + live status verified with app open; results come back via docs/agent-logs files (wait/get refuse non-AgentsRoom callers)
6. [x] Brain cleanup: research/ 124->53 items (c1c3f17), paper-trades price log archived 595->473 KB (85c6273); v2 shadow skill kept; memory/ + AGENT.md renames skipped (cross-repo churn, cosmetic)
7. [ ] 1:1 reference (DegJCmXtbGj) from v10, ElevenLabs voice; stash@{0} = Codex shot-7 lighting WIP (unverified)
   - [x] Measured gate tools/episode/reference_gate.py: same-settings control clips, stage guards, fingerprinted baselines, self-test pass+fail (501d758, f77eb1e); render-noise allowance from repeat run (cf2c123)
   - [x] Baselines from f77eb1e for shots 10,13,14,15,22,27,28,24,26 (gate-baseline/)
   - [x] Playable previews: CRF 16 High/yuv420p (-crf 0 = 4:4:4 = black screen); v12 playable copy
   - [x] IK lib engine/lib/rig/ik.ts + 5 tests (8e2cff4); retrofit on lead rig DISCARDED by gate (<=0.006 MAE), branch ik/lead-rig kept unmerged
   - [x] Character score: actor-box crop MAE/SSIM in review + gate (eb4007b); tools/actor_boxes.py derives boxes from LeadPerformance.tsx, shots 2/3 hand-measured; self-test 8 px shift = actor +2.14 MAE vs frame +0.30
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
     - [x] Blender GP spike: shot 2 as GP rig render, gate vs IK SVG version — KEEP (actor MAE 30.19->27.03, SSIM .566->.608; frame MAE 12.04->11.91; guards identical; 0164d26, flag REMOTION_GP_SHOT2=1)
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
       - [x] Gate flaw: crf20 encode spill. Gate now renders ProRes 4444 (d0b13eb; badge-only edit on shot 26: 61% of outside pixels changed at crf20, 0% ProRes; h264 floor is crf 1). All 35 baselines rebuilt at d0b13eb (old set in gate-baseline-crf20-archive/). Self-test: unchanged code on 28/7/26 + 10 guards bit-identical, targets DISCARD. Known-pass half comes with the next real fix
       - [ ] 1:1 loop on ProRes numbers: 7 (28.14), 22 (26.83), 9 (23.61), 27 (23.21), 15 (20.35 -> 15.09 KEEP), 7 (-> 25.46 KEEP), 9 (-> 21.74 KEEP), 22 (-> 18.06 KEEP), 7 hands (-> 24.84 KEEP f196227), 27 green clock + grade + flash (-> 18.67 KEEP 69f72d3/25d9712); worst now 7 (24.84), 9 (21.74), 27 (18.67), 22 (18.06); next = shot 29 brightness (ratio .796), then 35/4/25/6 ratios, 22 shutter/face/caption, 7 head
         - [x] Gate captions now draw vendored Anton (2e3fa89); all 35 baselines re-made. Anton-honest worst: 19 (27.07), 7 (24.68), 29 (21.72), 9 (21.70), 27 (18.69), 4 (18.68), 22 (18.28)
         - [x] Shot 19 camera keys densified (pipeline: zen deepseek-v4.1-flash built, groq reviewed; merged): MAE 27.07 -> 13.09, SSIM .695 -> .941 KEEP; guards 3/29 held
         - [x] Densify other moving shots: 26-shot motion-aware gate, KEEP 17 (1 2 3 4 5 6 7 10 15 16 17 18 20 22 24 26 27; e.g. 6 15.93->12.56, 16 10.33->8.24, 27 18.69->16.94), reverted 9 (wobble) + 11/12/28/29/31/32/33/34 (MAE flat) (402e23d); baselines re-made, deterministic
         - [x] Motion score in gate + side-by-side for failed targets (pipeline zen deepseek, groq review; 9254672)
         - [ ] MAE-flat review lane: Gemini vision opinion on shotNN-side.mp4, Zen decides (candidates 28, 11, 31; 29 solved by grade curve)
         - [x] Shot 29 per-frame grade curve (pipeline: nim nemotron-3-ultra built, cohere reviewed; tools/fit_grade_curve.py -> grade-curves.json): MAE 21.72 -> 12.34, SSIM .768 -> .862, motion 3.26 -> 2.38 KEEP (dd5f54d); guards 3/19/28/30 held; baseline 29 rebuilt
         - [ ] Check gate motion on shot 3: guard motion 4.93 -> 1.61 with frame MAE identical (baseline vs candidate should be bit-identical)
         - [ ] Try grade curve on other brightness-ratio shots (35/4/25/6), one gate each
         - [ ] Worst now: 7 (24.24 head/hands/arms), 9 (21.70), 22 (18.15), 4 (17.99), 33 (17.22)
         - [ ] Small brief: calibrate script prints "Accepted N of M" with M = stride count; gate subprocess encoding=utf-8 (cp874 crash without PYTHONUTF8)
         - [x] shot 15/16 map-parking plate extended (map-parking-clean-v2, unclipped svg): gate KEEP, 15 MAE 20.35->15.09 SSIM .754->.828, 16 MAE 10.66->10.25 SSIM .817->.825, guards bit-identical
         - [x] shots 7/9 counter alarm grade: red+black wash -> fitted per-channel feColorMatrix; 7 MAE 28.14->25.46 SSIM .664->.685, 9 MAE 23.61->21.74 SSIM .733->.757. Left on 7: arms raised to chest in ref (ours at sides), head/eyes size, caption weight, first ~10% brighter in source
         - [x] door plate extended (door-clean-v2, all door/chain shots): 22 MAE 26.83->18.06 SSIM .621->.744; every other door shot improved slightly. Left on 22: shutter too pale (ref mid-grey), face angry vs ref alarmed, JAMS yellow vs ref red
       - [ ] Optional: slat groove phase fit at left and right edges
   - [ ] J1-J4 cut transitions + grades (full v13 luma scan vs source, per-frame)
     - [x] Shot 20: 3-frame flash + clock exits at 1537 (781a7b0; gate MAE 17.637->13.241, SSIM .7934->.8065). Shot 6 already near source.
     - [x] tools/gate_in_worktree.py so pipeline attempts can render (smoke: unchanged shot 35 measures identical)
     - [x] Pipeline job ref-cut-transitions: all 3 rungs built it right (nemotron + terra identical gate numbers); brief numbers partly wrong. Kept 31/32 (c348cc3: 16.60->15.02, 17.70->16.42), dropped 8/9/23 (< 0.05 bar) and 28 (doubled its own dark grade, worse). Baselines 31/32 rebuilt at c348cc3
     - [x] Pipeline job ref-shot-grade: kept 23/28/32/34 (b754ced: 25.97->17.52, 24.46->18.16, 16.42->5.16, 25.19->7.99), dropped 3/19 (local mismatch, global slope worse). Baselines rebuilt at b754ced
     - [x] Shots 3/19 local brightness (region, not global): root cause was framing, not light. Fitted camera pulls back past the one-frame aisle plate (scale .87 / tilt +105) and the nested stage svg clipped at 270x480, leaving black bars. tools/extend_clean_plate.py builds aisle-clean-v2 from source frames; assisted aisle/dark shots render unclipped (f43e95e: shot 3 22.46->14.67, 19 29.36->26.13, guard 29 22.90->22.26). Baselines 3/19/29/30/31/33 rebuilt at f43e95e
       - [ ] Optional: shot 19 residual +10-34 at edges/ceiling during the tilt (source-median margins); same overshoot measured on other plates (units past the frame, calibration.json): door shot 22 right +47, map-parking shot 15 right +52 / top +64, parking shot 11 right +25, door 15 right +17, map 17 bottom +47, dark-prop 32 ~9. Next: add spans/overlays per plate to extend_clean_plate.py and gate each
     - [x] Full v14 render: out/drafts/reference-study/DegJCmXtbGj/practice-v14-gated-preview.mp4 (sha 6d158f6b9c18, +playable). vs v13: MAE 17.81->14.96, SSIM .783->.796, 13 shots better, 0 shots worse; one frame worse (27@2005). Worst left: 7 (30.7), 22 (26.0), 9 (23.9), 27 (23.2), 15 (21.4) -> 1:1 loop
     - [x] Skill family (owner-agreed 2026-11-03; DONE brain 9cbd8cc, installed to ~/.codex/skills), right after v14: video-maker (top, idea -> posted video) calls craft skills story / script-voice / character / camera / lighting / sound / captions / qa / release
       - [ ] Rename reference-animation-rebuild -> reference-study: job 1 copy 1:1 (private, learning only), job 2 EXTRACT every aspect into the craft skills; each studied reference upgrades the family
       - [ ] Seed craft skills from existing docs (episode-release-checklist, story-ideas, flood story docs, postkit) + this rebuild's lessons: plate extension / nested-svg clip -> camera; curtain-only shade, overlays above grade -> lighting; encoder spill -> qa; shade from region means, sawtooth phase fit, Gemini joints unreliable -> hand-measure -> character/lighting
   - [ ] V1/V2 ElevenLabs stock voice; M1 original music bed (never the source song), -14 LUFS; F final
   - [x] stash@{0} dropped (saved out/drafts/stash0-codex-shot7-lighting-wip.patch); wishes01 + download_batch2 parked on branch park/wishes01-and-batch2; .agentsroom/ ignored
   - [x] Owner: English-channel answer (2026-11-03): yes, English re-voice of the same episodes on a separate 2nd account. Not built yet; needs an English stock voice + English captions, queued after the 1:1 work
   - [x] Story numbering (owner 2026-11-03): out/final/<NN>-<slug>/ - 01-ghost, 02-bangkok-flood, 03-lift-ex; next story = 04. Folders renamed, docs/scripts paths updated
   - [x] Owner: wishes01 KEEP as story 04 (2026-11-03). Branch park/wishes01-and-batch2 stays; repo cleanup must not delete it
   - [ ] Story 04 wishes (ตะกรุดสามคำขอ): TONE = FUNNY (owner 2026-11-05: trend now is funny what-ifs, e.g. "what if Gojo in Thailand", "what if everybody became เด็กช่าง"); next idea queued: ถ้าทุกคนกลายเป็นเด็กช่าง (comedy, no fights); IP characters (Gojo) -> original lookalike-free character only. Was: pick tone (horror vs lighter), plot parts 2-3, re-record voice with UTF-8 stdin fix. Queued after the 1:1 list
   - [ ] LAST in queue (owner 2026-11-02: "add the repo clean up at last, rn its so messy"): AI-video repo cleanup - re-check the plan against the repo as it stands then, show it, then execute
9. [ ] Upload quality (owner 2026-11-02: "ppl say video quality is bad")
   - [x] Posted copies measured (lift ep1, 2026-11-03): TikTok 576x1024 h264 ~301 kbps + aac 128k; IG 1080x1920 ~398 kbps + audio ~49 kbps. Copies in D:/Documents/Downloads/ (Download.mp4, ig/lift-ep1-ig.mp4)
   - [x] Static film grain overlay (engine/components/Grain, GRAIN token) + yuv420p/bt709 tags in render.py (3c035d0); test render probes yuv420p/tv/bt709 1440x2560
   - [ ] Re-render lift ep1 (or next episode) with grain, then compare against the TikTok copy after upload (owner downloads it; auto-mode blocks the API)
8. [x] Flood ep 3 (Part 3) - branch B: final out/final/02-bangkok-flood/ep03 (74s, -14.0 LUFS), src 42812b1; posting = owner
10. [x] Lift-ex ep 2 (Part 2, vote A = truth) - beat sheet videos/unsorted/lift02/script/docs/lift02/lift02-beat-sheet.md v2
   - [x] Beat sheet v2 after free-leg story review (f33ee79, 0b7f749)
   - [x] Script videos/unsorted/lift02/script/lift02.json, pre-voice retention lint pass (6a5c920)
   - [x] Contract test + brief for 4 new sets: tests/test_lift02_sets.py, docs/briefs/lift02-sets.md (322763f)
   - [x] Pipeline build lift02-sets (deepseek-flash-free, cohere review PASS), merged e1aedf9
   - [x] Draft 1 rendered (out/drafts/lift02/video.mp4); stills read: 7/9 scenes OK
   - [x] Fix round 1 (docs/briefs/lift02-fix1.md), merged e63e37c; pipeline cp874 decode fix (brain 7010d1e)
   - [x] Fix round 2 (docs/briefs/lift02-fix2.md: forearm sleeve, cup clear of faces), merged 171fff1; verified by remotion stills + final-render frames
   - [x] Two-pass loudness master (869b0d5): draft 3 = -13.8 LUFS vs -14
   - [x] Published out/final/03-lift-ex/ep02 (video, cover, post.txt); posting = owner
   - [ ] Owner feedback after viewing (2026-11-03, NOT fixed on purpose, apply from ep 3): hook not catchy; a Part 2 must make sense without Part 1 (recap inside the hook); story not strong enough. Rules added to docs/story-ideas.md "How to judge a story" 7-9
   - [ ] Pipeline bug: --resume after a crash re-adds an existing worktree (exit 255); crashed attempt not checkpointed
   - [ ] post-kit bug: description repeats the series title ("ติดลิฟต์กับแฟนเก่า · ตอน 2/3 · ติดลิฟต์กับแฟนเก่า ตอน 2"); YouTube title cut mid-word
   - [ ] post-kit: for EACH vote option (A, B, other idea) give 3 reply styles - hype / tease / hint at next part without spoiling - not one fixed line (owner 2026-11-04: same reply feels stale). Pipeline job, free rung.
   - [ ] make.py --publish uses seriesSlug "lift-ex", not the "03-lift-ex" folder ep 1 lives in (moved by hand)

## CURRENT — 2026-11-01 agent pipeline + paused 1:1 (read first; full context: brain session-log 2026-11-01)
- [ ] 1:1 reference rebuild (private, never posted): paused at v10 (MAE 18.79 / SSIM .777, not 1:1); WIP committed 5fab1ff.
  - [ ] Codex resumes when quota resets: open boxes of the ledger "Master continuation checklist" (docs/reference/reference-study-milestones-DegJCmXtbGj.md), picture first, then ElevenLabs voice (key ~/.secrets/elevenlabs_api_key - owner to ROTATE), measured gate (keep a change only if MAE down + SSIM not down).
  - [x] Guided-loop handoff written: docs/reference/handoff-gemini-reference-loop.md (reusable by any builder).
- [ ] Reel mining (both batches, 29 + 7): handoff docs/reference/handoff-gemini-reel-mining.md; sent to Antigravity agent 2026-11-01 (result unverified).
- [ ] Agent pipeline (owner talks only to Claude; Claude launches builders via `bash D:/second-brain/tools/run_agent.sh <codex|gemini|antigravity> <repo> <handoff> <log> [model]`)
  - [x] AgentsRoom installed (free): projects D:\ + D:\AI-video
  - [ ] Add agents in AgentsRoom; check if it can start agents from the command line
  - [ ] Retest OpenCode free builders (config ~/.config/opencode/opencode.json: NVIDIA GLM 5.3 / DeepSeek / Kimi K3, Mistral Devstral/Codestral, OpenRouter Nemotron) - first test gave empty output
  - [ ] Design tiered pipeline (plan Opus -> build Codex sol/terra/luna | OpenCode free | Antigravity -> verify other company + free legs -> escalate on gate failure) and get owner approval before building
- [ ] Flood Part 3 finale: waits for the real Part 2 A/B count
- [ ] Untracked draft videos/unsorted/wishes01/script/wishes01.json + engine/legacy/v7/Wishes.tsx ("ตะกรุดสามคำขอ"): owner to decide keep/drop


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
- [x] Verify final export/cover and write `videos/unsorted/flood02/script/docs/flood02/flood02-release-review.md`; delivered exact `out/final/02-bangkok-flood/ep02/video.mp4` path. Owner heard slight rushing; current57.166667s/1715frames after4percent pitch-preserving sharedAVretime. Actualmix-14.21LUFS/-1.83dBTP. Priorfinalarchived;39pytest+2gaitchecks/TypeScriptpass.
- [ ] Owner listens/reviews and posts; record actual vote/retention before Part3. No automatic social post.
- [ ] Later: improve ElevenLabs Thai casting/performance; review seven queued posts and investigate sourcecreator stack (still unverified).

## NOW (2026-10-30) — read this first
- [x] New survival story Part1 built/reviewed: out/final/02-bangkok-flood/ep01/video.mp4,45s,1440x2560; flood + looter antagonists, cover/post/script. videos/unsorted/flood01/script/docs/flood01/flood01-release-review.md.
- [ ] Zen watches/posts flood Part1; collect actual A/B votes and retention before Part2.
- [x] Group existing final arc as out/final/01-ghost/ep01–ep03; approved ep03 bytes/hash preserved.
- [ ] Reference-copy study PAUSED at owner request; incomplete, keep checkpoints.
- [x] Part 3 approved and promoted: `out/final/ep03/video.mp4` (78.6 s) with revised cover/post/script. Previous final archived as draft: `out/drafts/ep03/previous-final/video.mp4`. Review: `videos/unsorted/ep03/script/docs/ep03/ep03-rewrite-review.md`.
- [ ] กฎเข้าป่า series
  - [x] Part 1 posted
  - [x] Part 2 posted (IG ~1.1K views first night, 2 real followers; TikTok stuck at ~3 views - check "not eligible" warning)
  - [x] Part 3 finale approved: `out/final/ep03/video.mp4` 78.6 s (repaired hands and animated pull, full-body shadows, corrected B caption and voice).
  - [ ] Zen posts Part 3 at 20:00 (TikTok, IG via Business Suite, YouTube) + pins comment
  - [ ] Collect numbers: views, avg watch time, retention graphs (IG + TikTok), comments
- [ ] Upgrade phase (start in a NEW chat; Codex does the heavy work, Claude writes the contract + checks frames)
  - [ ] Read Part 2/3 retention graphs → where viewers drop
  - [ ] Private visual reconstruction of reference reel IG DegJCmXtbGj (never posted; `docs/reference/reference-study-DegJCmXtbGj.md`)
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
  - [ ] Character7 (new simple Jaab, `engine/legacy/v7/Character7.tsx`) wired into SceneV2 (style v7 / view prop / FACE_BOX7)
  - [ ] Camera vocabulary: over-the-shoulder, from behind, POV, low/high angle, mood shot first
  - [ ] Test a ChatGPT-generated background plate (Zen saves it to `assets/`) behind the animated cast
  - [ ] Next story (zombie store story assets exist: `engine/legacy/v7/Store*.tsx`; ideas in `docs/story-ideas.md`)
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
- [ ] vitest for `engine/lib/castState.ts`

- 2026-11-05 PARKED (quota): A4-A6 1:1 study + B2 3D test until weekly quotas reset. NOW: takrut01 - script done (videos/unsorted/takrut01/script/docs/takrut01/takrut01-beat-sheet.md, videos/unsorted/takrut01/script/takrut01.json); next = 4 new sets free-only, then key frames, then draft.

## NOW 2026-11-06 (owner asks 11-05 + 11-06, full tree rebuilt from chat log)
- [ ] 1. Sukuna shrine ep01 "ถ้า Sukuna มาไทย แล้วเดินเข้าวัด" (ONE ep, NO A/B, others build, Claude reviews only)
  - [x] brief + script + episode json + 2D scenes (Codex terra)
  - [x] 4 stills reviewed by Claude: FAIL (temple = house, weak Sukuna, flat centred static, domain = black box)
  - [ ] voice: Gemini TTS outside Codex sandbox (no network inside)
  - [ ] 3D rebuild (B2 un-parked; needs owner OK to clone claude-animated-shorts + npm three/@remotion/three/@react-three/fiber)
  - [ ] use EVERYTHING learned: three.js skill, angle switching, light, reference-study lessons, retention rules
  - [ ] IG ref DfWxbmMSP5D: owner says what to take (IG blocks fetch)
  - [ ] cast may include anime characters (friend's Light Yagami court + Ryuk example), don't copy friend
  - [ ] final render, cover, post.txt; owner posts
- [ ] 2. Story direction (owner 11-05)
  - [x] ONE ep per premise, NO A/B, no "next ep is X" lock-in end cards
  - [x] Jaab dropped, own cast per premise
  - [ ] premise style = one-sentence what-if, not only Bangkok/anime: hulk in TH, gojo next door, whole world turns doctor, hear everyone's thoughts, city of blind people; funny OR weird, not only funny
  - [ ] title: ไทย vs Bangkok (owner open question)
  - [ ] handle rename @jaabstory -> @jaabjaab (owner in app), then update post.txt files; channel name เรื่องจ๊าบๆ idea
  - [ ] ตะกรุดสามคำขอ: owner felt locked in by end card; keep as option, not forced
- [ ] 3. Method research (owner 11-05: "figure out how he actually did it", 1:1 grind may be wrong tool)
  - [ ] find real stack of the creators (tools, skill, image gen, TTS) before more 1:1 work
  - [ ] judge: does 1:1 transfer anything; stop grinding if not
  - [ ] skill-gap research: what other creators' skills have that ours miss (B-gaps2 list) + more reels coming from owner
- [ ] 4. Image generation (owner 11-05): GPT image / Gemini Flash image are best; check access (Flash out of quota then); Gemini inside Antigravity?
- [ ] 5. Agent stack (owner 11-05/06)
  - [x] cross-agent on at every chat start + tick-box stack check in chat (playbook rule)
  - [x] dashboard PARKED (too long, unusable) - find replacement later
  - [~] fix legs: NVIDIA deepseek-v4.1-flash timeout (dropped), Mistral 429 (account side), OmniRoute READY mismatch (prefix strip done) - recheck live
  - [x] benchmark-gate every tier choice (cross-agent skill 1.8); Sol vs Astra, Opus vs Fable by benchmark not habit
  - [ ] ladders: add every Antigravity model (own free quotas), Qwen + all OmniRoute models, Codex luna, Claude sonnet/haiku tiers; brief cross-check with best model (Sol) not Astra by default - verify ladders.json now
  - [ ] Dahl MiniMax-M2.7 as free leg; call weekly so 100M grant does not burn (7 idle days)
  - [ ] Flint (OpenRouter recursive/flint-v1.0:free) into multi_ai_check
- [ ] 6. Older queue still open: 1:1 v10 (paused, see item 3), takrut01, DeepSeek/Mistral top-up (owner), groq 403, reel mining both batches, browser eyes, story-mode social mining, repo cleanup LAST

## 2026-11-17 drafts housekeeping
- [x] draft/current deleted on Zen ask (old v1 full, 935 MB, old audio) - the FINAL-render line above points to a file that no longer exists
- [x] drafts renamed: versions/ = full only (01-v1, 01-v1-lowres, 01-v1-share), previews/ = partial (01-v0..v6 first1min/parts)
- [x] v7 = v6 minus split 402 (Zen: full-frame Capone mugshot "bad", v4 polaroid-on-office better); shots_v7 via make_v5_shots.py v7, full comp on v7, tsc OK
- [x] v7 render stopped: Zen 2026-11-17 "it was good at v4 but then you try to do more than everything broke"
- [x] v8 = v4 shots + only the 1888 photo split (make_v5_shots.py v8, 21 cuts), full comp on v8, tsc OK
- [x] full render 01-v8.mp4 (654.5 s) + 01-v8-share.mp4 (2-pass 960p 280k, 27.6 MiB) sent proactive 03:10 (Zen asleep, open on return)
- [x] p03-p24 rebuild to v4 effort: every scene made for its line, real images + white explainer cards + diagrams + charts where the line needs them; same effect level every scene (no quarter drop)
  - [x] generator tools/ink/make_v9_shots.py: 151 shots p03-p24, per-sentence scenes (plates+sprites w/ camera, white cards, bars, flow, real photos, stamps, crosses)
  - [x] BarsEl + FlowEl elements (schema.ts, elements.tsx); InkParts full comp = v8 p01-p02 + v9 p03-p24, tsc clean
  - [x] frame-safe fit pass (stage->frame affine incl. cam + plate zoom): 45 words shifted/shrunk; 151 stills (tools/ink/v9_stills.mjs) read on 13 sheets, no clipping
  - [x] full render 01-v9.mp4 (654.5 s, EXIT 0) + 01-v9-share.mp4 (2-pass 960p 280k, 27.7 MiB), spot frames 120/300/302/450 s OK, sent proactive 03:44 (Zen asleep, open on return)
- [ ] v10: restage Q1/Q2/Q4 to Q3 level (Zen 2026-11-17: "why i only see the background and character in the side way after middle"). Measured char-in-scene Q1 36 / Q2 40 / Q3 62 / Q4 41 %. Go via away mode (Zen 2026-11-17 again: "did you fix about the real image and the angle bird eye ... this image here a bit too squish").
  - [x] cross sized from its text + row pitch (p17 NO HEADLINE/ARRESTS/MANHUNT: 260px X on 140px rows = lattice; NOT A LIE X narrower than word): CrossEl w/h, generator helper, overlap lint (99f92af)
  - [x] real photos every quarter (v9: Q1 1 / Q2 1 / Q3 0 / Q4 5, pool 7): +4 PD (citroen 1925, concorde 1922, expo 1925, lustig 1935) as polaroids -> v10 photo 3/3/3/5; 3 more Commons files 429'd, skipped
  - [x] angle plates every quarter (v9 angled: Q1 5 / Q2 11 / Q3 10 / Q4 3): 5 plate swaps (rust closeup, doorway, birdseye, topdown, extreme wide) -> v10 angle 5/8/6/5; generator lint quarter_balance() fails build if photo<3 or angle<5 in any quarter
  - [x] char-in-scene: +9 sprites on bare plates (2848, 2498, 5932, 7505, 15090, 15229, 16975, 19090, 19296) -> scene share 47/50/58/51 %, non-front 92/96/100/100 %
  - [x] per-SHOT bar (Zen 2026-11-17: "Didn't I say that the whole thing. Should get same effeort"): 37/151 shots were text-only, hidden by quarter averages. +1 living visual each (31 posed sprites, 6 PD polaroids) + build lint `text_only()` errors on any text-only shot -> bare 0/0/0/0, scene 19/22/23/24, non-front 94/97/100/97 %, photo 3/5/5/6
  - [x] backstory lines: angled room + side/3-4 pose beside the card (p05-p06: every plate has sprite, every card sprite+tag/flow; 4 per-shot fixes 6972/9186/14370/17884 after reading 13 QA sheets)
  - [x] pre-render check: each quarter within ~10 pts on char-in-scene + non-frontal pose share + photo/angle counts -> scene 59/58/61/56 %, nonfront 94/97/100/97 %, photo 3/4/4/6, angle 5/8/6/5
  - [x] full render 01-v10 + share copy, send (01-v10-share.mp4 sent 2026-11-17)
- [ ] v10.1 (Zen 2026-11-17: "for the real images you didn't just use same one every where right" / "I don't see you make more unique back ground ... mostly sides")
  - [x] photo de-dup: 9 repeat photo slots swapped (sprites/other PD); lint reuse_errors() PHOTO_MAX=1 in body
  - [x] plate cap lint PLATE_MAX=2 (15 plates over cap, 26 slots); remap plan written
  - [x] Q3 photo 2<3: Commons gave up (429), fixed with PD Crillon/Concorde 1890s photo -> Q1-Q4 photo 3/3/3/3 (0499a7c)
  - [x] 24 new camera-angle plates (briefs art-plates-h..k): cross-check -> plan_check -> pipeline -> eye-check
    - [x] batches h + i: 12 plates, Codex gpt-6.1-sol, eye-checked, committed bf38ae8
    - [x] batches j + k
      - [x] k: 6 plates committed 3b27553
      - [x] j: 6 plates harvested from attempt 4 (Codex gpt-6-astra), eye-checked, gate OK 6 files
  - [ ] viewpoint sprites (Zen 2026-11-17: "2d so ... made the background and character pose THAT angle"): all 79 sprites eye-level -> 15 new poses drawn from above/below/behind
    - [x] briefs art-poses-v1/v2/v3 + manifests + sheet_v*.order.json (cite master drawing # for top_down/from_below/turn_back)
    - [x] Codex gpt-6.1-sol plan_check -> pipeline -> harvest -> integrate_art cut -> eye-check -> commit (20ecaae)
    - [x] generator: 39 plate/sprite swaps + angle_errors() lint, 0 errors, angle 5/10/15/10 (0499a7c)
  - [ ] pipeline flaw: blind reviewer FAILs image briefs it cannot see -> good build discarded (j att 1); route image briefs to owner-check
  - [ ] apply remap, generator clean, stills READ, render 01-v10.1 + share, send
    - [x] remap + lint clean, 32 QA stills READ, full render 01-v10.1.mp4 (997,649,053 B, 1920x1080, 654.549 s)
    - [x] share copy 01-v10.1-share.mp4 29,483,769 B, 654.549 s, sent 2026-11-17
    - [x] opened 01-v10.1.mp4 + thumbs preview on Zen's PC 2026-11-17
  - [x] thumbs v2 (Zen 2026-11-17: "thumbnail should be straightforward ... say he sold eiffel twice"): tools/ink/make_thumbs.py -> thumbD + thumbE + phone_size_preview_v2, READ at full + phone size, sent + opened
  - [x] Zen picked thumbE ("this one"): publish.md pick 1 = "How One Sentence Let a Con Man Sell the Eiffel Tower" + E, D = A/B variant
- [ ] v10.2 sprite fit (Zen 2026-11-17 @01:10: "thisi sbroken" - top-down Lustig oversized, cut bottom-right)
  - [x] root cause: v10.1 swap kept old tall sprite x/h for wide top-down PNG
  - [x] fit_sprites() in make_v10_shots.py: ink-box vs camera states, x pulled in, h shrunk, top-down 4-edge + cap 0.36 x stage H; 8 top-down stills READ, all in frame (f735444)
  - [x] Zen "idk why he write on empty thing": pen-on-empty-palm sprite rejected, 2 shots swapped, 77 sprites scanned (4573484)
  - [ ] full render 01-v10.2.mp4 + share copy, send + open
- [ ] Ep01 packaging pass (Zen 2026-11-17: "the cover and the title ... 50 % of its work")
  - [x] pick title: pick 1 'How One Sentence Let a Con Man Sell the Eiffel Tower' + thumb A (publish.md, b376236)
  - [x] 3 thumbnail mock-ups A/B/C + phone_size_preview.jpg in D:/AI-video/videos/pastly-life/01-eiffel-ink/final/thumbs/ (local, gitignored)
  - [ ] Shorts/IG cover frame, YT A/B test plan
