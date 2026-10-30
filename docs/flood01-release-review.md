# Bangkok flood Part1 — release receipt, 2026-10-30

Final: D:/AI-video/out/final/bangkok-flood/ep01/video.mp4
45.000s container /1347 pictureframes /30fps /1440x2560 /SAR1:1 /9:16.
SHA256 c335fc288fc66f65c5d1336dd898d1d5c4c654fd5b4b0ac9c902154f358841a0.
Kit alongside: cover.png,post.txt,script.md. Post now after owner's review; no social post performed.

## Owner-approved direction and finished story

User explicitly requested finish/build quickly after refining: “จะเกิดอะไรขึ้นถ้าน้ำท่วมแล้วติดอยู่ที่คอนโด” then thugs stealing things. Thugs are fictional antagonists, not the discarded comic duck-float helper. Opening establishes the flooded condo; false-help claim → stolen603TV on boat → Jaab calls for help → warning saves a neighbor → looters target him → A barricade/wait,B join others by alternate route. Humour is one dry aside about thieves helping themselves. No ghost twist. Part1 of3, next vote is not yet known.

## Evidence against the production checklist

- Story/hook: new viewer understands flood/condo; hook2.67s. Clue603TV/going downstairs appears before lie explanation. Protagonist's warning causes retaliation. Neighbor's stopped opening is an actual small payoff before cliffhanger.
- Full Thai narration: Gemini2.5flash-preview-tts/Iapetus,continuous take,tempo1.03. Correct UTF8 script validated before request. First service request503; same model retry succeeded.10 cut scenes,44.182s source take; scene padding/frame rounding gives44.9s picture.
- Transcript checked against all major beats. Whole-take Whisper omitted final villain dialogue; separate threat-clip transcription verified complete “เมื่อกี้มึงว่าใครขโมย”. No unnecessary replacement generated.
- Automated retention and framing checks remained enabled and passed. TypeScript and28 Python regressions pass.
- Actual rendered still of EVERY10scenes inspected: out/drafts/bangkok-flood/ep01-review/scenes-1.jpg,scenes-2.jpg; individual jpgs and scene-review.json.
- Actual temporal samples inspected: action-review.jpg (12phases across carrying,window warning,handle rotation). CarriedTV and hands share group transform; feet/turns use existing rig. Insert knob rotates on its own clock. Visual review is sampled, not a claim of owner approval.
- Cover inspected. Labels/captions at sampled frames within canvas; no visible overlap/clipped face in those samples. Phone/boat/TV inserts explain the relevant beats. Indoor rain not drawn; outdoor flood scene has rain and water motion. Blackout corridor cast dimmed/rim-lit.
- Actual final audio measured -13.75LUFS,-1.49dBTP,LRA3.0. Background beds quiet/ducked and continuous. This meter/transcript check does NOT substitute for a full human listening/performance sign-off; that remains OPEN.
- Final code/source uses new Flood.tsx and two distinct looter looks. Source reference study and copied plates are NOT used for this original release.
- Ghost finale moved per explicit owner ask to out/final/ghost/ep03/video.mp4; hash unchanged c176f122392eb23ffbc925f05fff1a3351f40c819f6e7b0ec152e26ac249e5ee. All ghost ep01–03 kits grouped intact.

## Practical limits / follow-up

Original code-rendered episode using established Jaab rig, not a completed1:1 reference exercise. Alternate escape route is indicated by corridor exit signage but not a full measured floorplan; establish it explicitly in Part2 ifB wins. No ownership claims based merely on a genericTV:603sticker/room label is the intended clue. Full owner playback/listening and actual retention analytics are pending. No paid image generation, no source-derived practice assets, no new cross-agent spawn.

Reference copy remains PAUSED unfinished. Three Wishes direction stopped, no release. Failed encoding take retained as local diagnostic, excluded from git.

Cover QA caught inherited forest/watcher artwork from the old template; fixed story-selectable coverBg, human looter, flood exterior and shorter single-line hook. Re-rendered cover only; video bytes unchanged. Third cover revision moves the villain below the title and hides scene-only text.


## Superseding pacing revision ? owner rejects fixed45s

Owner heard fast,monotone,repeated pacing, then explicitly said video can be as long as it needs. Historical35?45s advice was wrongly treated as requirement; no replacement target or total cap is authorized. Pipeline total90/120second restrictions removed; visual-stagnation/hook/framing checks retained. Old45s final and full audio cache preserved at out/drafts/bangkok-flood/ep01/previous-rushed-final/.

A genuinely fresh Iapetus performance (same Gemini2.5model) was generated with episode-level natural/story-specific direction,joined scene text,tempo1.0 instead of1.03,more varied natural Thai syntax and purposeful recognition/threat holds. No instructed runtime. Transcript covers the whole revised script and complete final villain dialogue, with no spoken English direction. Source take72.922875s. Camera cuts retimed around the performance.

New promoted final: SAME out/final/bangkok-flood/ep01/video.mp4,74.500s container,2233pictureframes,1440x2560,30fps. SHA256 dccad60c4c1217077aa6f8b925849c86971c19269e584179f65cf5b893d33c22. Distinct review copy out/drafts/bangkok-flood/ep01/natural-pacing.mp4; isolated performance natural-narration.mp3. Cover/post/script updated alongside final.

All10new scene stills and12action phases inspected in ep01-natural-review. Actual new mix -13.02LUFS/-1.49dBTP,LRA2.6. Output is not speed-stretched to an artificial duration.31pytest pass (new tests ensure long stories allowed,visual checks preserved,performance direction invalidates voice cache without changing alignment lines); TypeScript pass. Threat's4.6s held visual reported as WARN, intentional quiet build,not a blocked duration check.

Still OPEN: actual owner playback/listening/performance acceptance. Transcript,frames and loudness do not establish that the new voice sounds natural. No social posting. Do not call the prior45s pacing approved. Reusable direction/cache mechanism informed by official https://ai.google.dev/gemini-api/docs/speech-generation; no model switch.

## Slightly quicker follow-up ?1.05tempo
Owner said the fresh1.0performance speaks a bit slowly. SAME expressive cached take retimed at1.05, pitch preserved; build confirms take voice(cached), no new synthesis. Alignment/captions/picture regenerated. Prior74.5s final+kit preserved at out/drafts/bangkok-flood/ep01/previous-slower-final/.
New promoted final71.100s container,2130frames,1440x2560/30fps; SHA256 1eddee33fca99f683367492491fe472944920250ec43af224398383c2b705783. Distinct copy out/drafts/bangkok-flood/ep01/pace-105.mp4; voice audition pace-105-voice.mp3. Retimed helpers/threat/end frames inspected; complete threat transcript checked, build lints pass. User playback/pace acceptance remains open. No fixedruntime target was added.

## Further speed adjustment explicitly approved
Owner: STILL SLOW; assistant proposed another10percent; owner:go. Applied1.1x to the complete prior1.05delivery using video setpts=(PTS-STARTPTS)/1.1,audio atempo=1.1,pitch preserved,30fps. Burned captions,scene cuts,action,sound and dialogue share the same timing transform. No new TTS. Canonical episode tempo now1.155 for future rebuilds; this delivery is a uniform retime of the priorfinal,so future native rebuild may differ slightly at fixedlength holds.
Final64.600s,1938frames,1440x2560/30fps; SHA256 8021b1c018e896d3cd021905c66584b953c182530c2d7149e5f0a74e1ed15e0c. New distinct file out/drafts/bangkok-flood/ep01/pace-1155.mp4; prior1.05final+kit preserved in previous-105-final/. Three corresponding source/retimed frames inspected (SSIM.9952,.9996,.9756; diagnostics only). Actual audio -13.09LUFS/-1.47dBTP,LRA2.5. Final promoted; cover/script/post unchanged because story/text unchanged. Owner pace acceptance still pending; no runtime target/cap and no social post.
