# Flood Part2 release receipt — 2026-10-31

## CURRENT — slightly eased after owner heard rushing

Owner felt the new take was a little rushed. Retimed the complete reviewed delivery to0.96speed, pitch preserved; picture/captions/foley share the same clock. No new TTS or generated assets. **CURRENT final57.166667s /1715frames /1440×2560 /30fps**, same finalpath. SHA256 `b041e3bcf6a736d636a95c957964216a8f0b8de0f5b12f8a0050c8192e885b8c`; latestversion `out/versions/flood02/2026-10-31_215931.mp4`. Actualmix **-14.21LUFS/-1.83dBTP/LRA2.00**. Picture/audio both57.166667s; three mapped chair/rear/ending frames inspected at `out/drafts/bangkok-flood/ep02/pace-eased-review.jpg`. Unique current copy `out/drafts/bangkok-flood/ep02/pace-eased.mp4`.

Prior54.866667sfinal and kit preserved intact in `out/drafts/bangkok-flood/ep02/previous-115-final/`. Canonical episode tempo now1.104 (=1.15×.96); a native rebuild can differ in fixed holds/frame rounding and still needs the documented quiet edit. To replay the delivered revision, retime the archived priorfinal uniformly with setpts/0.96 and atempo0.96, then pad/trim to57.166667s at30fps. Owner subjective listening/visual acceptance and posting remain OPEN.

The receipt below describes the first54.866667sdelivery and how it was produced; current values above and machine receipt supersede its output hash/clock. Source patches/quiet-gap evidence remain valid on the prior delivery clock; remap timestamps by1/.96 for the new delivery. Sound-cue JSON preserves prior-clock values alongside remapped final frames.

Final file: `D:/AI-video/out/final/bangkok-flood/ep02/video.mp4`.
SHA256: `488f6f953d0b84d74258da7997e86e5d5c7ad7e980b66d0fa461debb1059c03a`.
Version: `out/versions/flood02/2026-10-31_215153.mp4`.
Picture and audio: **54.866667s**, **1646picture frames**, **1440×2560**, **30fps**, H.264/AAC,9:16.
Measured actual final mix: **-14.30LUFS / -1.85dBTP / LRA2.10LU**. These are measured input values, not the meter's proposed output values.
Kit in the same final directory: `cover.png`, `post.txt`, `script.md`.

## Owner decisions and scope

Original Bangkok flood/condo-looter arc, Part2of3. Owner confirmed **B: join the other residents**. The ghost trilogy is complete; the older1:1 practice remains paused and unfinished. Owner asked that the29reference posts and actual useful GitHub skills inform story/hook/graphics/retention BEFORE speech generation. No fixed total-duration target or cap. Chat English, story Thai. Later seven URLs are explicitly watch-later, after this release.

Part1 remains byte-identical: `out/final/bangkok-flood/ep01/video.mp4`, SHA256 `4991bbecde018c791b688e5853d4d2b45e5e6c44ba20c07bc0022e5c6a6796ff`.
GhostPart3 remains byte-identical: `out/final/ghost/ep03/video.mp4`, SHA256 `c176f122392eb23ffbc925f05fff1a3351f40c819f6e7b0ec152e26ac249e5ee`.

## Story and source lessons applied

Three Thai-first hooks were reviewed; selected concrete phone/evidence dilemma. B produces a temporary advantage—neighbors, barricade, witnesses and a recording—before the planted rear route lets the established second looter flank them. There are seven residents already hiding, including the aunt, plus Jaab: eight. A dry chair misunderstanding gives a brief human release. The newly recorded clip,11%phone battery and visible rescue light make surrender vs sending evidence a specific next choice. No invented Part3vote or guarantee that surrender opens a safe exit.

Actual source documents read: Content Principles, ig-reel, ig-human, earshot, real-sound and earshot limits. Content Principles installed; the existing reference-animation-rebuild skill updated and installed. English-only numeric hook/humanizer scores and a15–45second recommendation were not adopted as Thai validation. Exact promoted Motion Director files were not recovered; staged action/contact techniques were studied from footage. Reusable story/motion/graphics/sound lessons and per-post reviews are in the private brain's `research/instagram-reference-library-2026-10-31.md` and canonical skill references.

## Visual iterations and actual fixes

- Initial13environment preview was too plain; owner feedback is retained. Technique presence in code did not establish visual acceptance.
- Distinct room606: furniture, curtain/window, rug, visible battery lantern and localized warm spill. Corridor: recessed doors, beams/conduit, emergency practical light, plaster/baseboard/tile detail, foreground jambs, shadows and restrained reflections. Closer framing supports specific subjects; maps/phone POV/depth walk/window view serve different information.
- Chair transfer and cabinet brace use fixed-length two-bone arms with world-space prop contact targets.8008reach checks found zero unreachable grips. Anticipation, transfer/release and reaction are separate phases. Original duplicate arms and excessive reaches were fixed before final render.
- Rear door starts ajar, opens further and precedes entry. Red/green looters are distinct existing people, not new creatures. Group count is visually verified.
- Full render inspection caught flat floor masks in passage/rear views and red-thug hands hovering above the cabinet. Only affected picture ranges were re-rendered: `[187,249)`, `[741,869)`, `[1399,1674)`. Red pressure hands now share the loaded cabinet's contact targets. See `docs/flood02-frame-patches.json`.
- Cover uses human looter and flood/rescue setting. Repaired flood detection so a non-floodWide background cannot inherit a ghost watcher. Opaque foreground prevents background boat text showing through the looter's face.

## Voice, pacing and sound

ElevenLabs Free stock George/v3 audition158characters succeeded. Owner rejected its monotone, stop/start narrator delivery. It used an English-trained stock voice and disconnected lines, so it was a weak natural-Thai performance test. A native-Thai Voice Design API request returned403 `feature_unavailable`: creating a voice through the API requires a paid plan. No designed voice or subscription was created. Earlier401read-scope errors did not mean TTS access was blocked. Credential stays local-only and is redacted from dialogue RAW.

Owner explicitly chose **the previous Iapetus narrator tonight**, with ElevenLabs improvement separate. One pinned Gemini2.5take was generated:63.210958s raw,54.978833s attempo1.15. Connected performance instructions vary urgency, brief dry humor, relief and controlled human threat. No monster pitch effect. All15sceneIDs aligned; later captions/camera/sound changes reused that take. ASR broadly covers the story, demand,11%and ending choices, with frequent Thai spelling errors. The possible record/retreat word split was treated as an ASR/alignment warning, not proof of mispronunciation or missing speech.

Hard-floor sneaker recording replaces inappropriate woodland footsteps. Cabinet friction uses a CC0wooden-chair recording, explicitly a material substitute. Asset identities/licences/trims/hashes/onsets are in `docs/flood02-sound-assets.json`; deterministic builder `scripts/pipeline/flood_sfx.py`. Plastic-chair drag and metal-latch recordings were retained as candidates but not forced onto a lifted wooden chair or an already-ajar door. Voice remains foreground; continuous rain/tension beds develop and dip at the threat. Actual authored/remapped cue frames are in `docs/flood02-final-cues.json`.

Five isolated-voice quiet centers were shortened, removing0.933333s, **no extra speed**. Global minimum retained silence.24s, with longer protected reveal/threat holds. End-card entrance and reading hold preserved. Every removed voice peak was<=-48.65dBFS; guards>=118ms. Source-matched measurement and plan: `docs/flood02-flow-measurement.json`, `docs/flood02-flow-edit.json`.

An unnecessary `atempo=1` filter shortened the audio tail; `-shortest` then lost two picture frames. Removed unity-speed atempo, added a real FFmpeg audio-tail regression check, and mastered to the exact54.866667s clock. Both final streams now have equal duration and all1646picture frames remain. Final AAC true peak is measured, not assumed from the limiter setting.

## Verification record

| Check | Result / evidence |
|---|---|
| Native Thai hook/story continuity and actual B choice | PASS in source/beat review; subjective owner acceptance remains open |
| All15scenes and16contact phases | Inspected `out/drafts/bangkok-flood/ep02/review-final/every-scene.jpg` and `action-contacts.jpg`; targeted replacements inspected |
| Independent group/end/pressure/door still review | Correct8people, legibleA/B, repaired floors and contacts; `review/independent-final-review.jpg`, `independent-group-ending.jpg` |
| Contact rig reach |8008checks,0violations; `.build/flood02-arm-reach.json` |
| Captions/bounds/cover | Actual loaded Thai font inspected; no obvious clipped essential text; minor duplicate room/count label is non-colliding |
| Speech completeness | All15aligned entries, broad ASR coverage; exact pronunciation not certified by ASR |
| Pause safety / shared clock |5quiet edits, no extra speed, actual audio/video durations equal |
| Sound source/onset/mix | CC0metadata and decoded sample measurements; final -14.30LUFS/-1.85dBTP |
| TypeScript | PASS |
| Python suite |39PASS, including actual unity-speed audio-tail test |
| Gait tests |2PASS, hip attachment/stance and18frame footfall cadence |
| Prior releases protected | Both hashes above match prior approved values |
| Owner new-voice/art acceptance / posting | OPEN; no social posting performed |

Stills, scripts and meters do not certify continuous-motion taste or human listening. No claim of complete auditory review, guaranteed retention or1:1reference fidelity. A known minor cosmetic redundancy is the room606count appearing in both the scene sign and top chip.

## Reproduction and tracking

`python -X utf8 scripts/make.py flood02 --draft` recreates the current native picture/voice/caption mix from the cached take and current code. It does not automatically apply delivery quiet cuts. The latest saved version is the reviewed delivery; `--publish` currently selects it. A fresh render has a new source hash and needs a new measured pause pass; never apply stale frame ranges to different media.

The preserved exact delivery source is `out/drafts/bangkok-flood/ep02/source-before-flow.mp4`, SHA256 `04c466544a0774e06d7c60d313dc89083e1dddfc15b15e6ad7aa4e2a47536a2d`. Replay:

```
python -X utf8 scripts/repair_delivery_pauses.py --source out/drafts/bangkok-flood/ep02/source-before-flow.mp4 --measurement docs/flood02-flow-measurement.json --speed 1 --out <flow.mp4>
ffmpeg -i <flow.mp4> -af loudnorm=I=-14:TP=-2.0:LRA=11,apad=whole_dur=54.866666667 -c:v copy -c:a aac -b:a 192k -ar 48000 -movflags +faststart -t 54.866666667 <final.mp4>
```

Original native render, exact patched source, intermediate flow edit, dated final version, QA sheets and sound source previews are preserved locally. `docs/flood02-export-receipt.json` is the machine-readable final receipt. Source committed locally; public AI-video remote is not pushed by this release. Private brain records and full visible dialogue capture are synced separately.
