# Flood03 completion review

Export: `out/final/02-bangkok-flood/ep03/video.mp4`.
Version: `out/versions/flood03/2026-11-01_195924.mp4`.
SHA-256: `5ef89352f1877eb7c1a6f8ea566f83e78dceff10ec16b7427901a59c7e9ab36a`.

74.000 seconds, 2220 frames, 1440 x 2560, 30 fps; video and audio both 74.000 seconds.
Actual measured input loudness: **-14.01 LUFS / -1.58 dBTP / LRA 2.50 LU**. Targets are not substituted for these measurements.
Nothing posted; no `--publish` used. Changes remain uncommitted. The requested 19:00 owner-review deadline was missed; this completed review was recorded around 20:00 Bangkok.

## Verification

- TypeScript passed with `npx.cmd tsc --noEmit -p .` (PowerShell blocks npx.ps1).
- Normal make.py workflow ran with the requested model/voice, retention gate and framing checks. Reviewed ASR line starts were retained by scripts/build_flood03_aligned.py; targeted replacement scenes were assembled with scripts/finish_flood03.py.
- 21 focused alignment/build/caption tests passed. No lint was disabled.
- Audited all 15 say strings against the approved story: exact match. Iapetus / gemini-2.5-flash-preview-tts / tempo 1.104 preserved.
- Inspected every scene in the extracted final midpoint contact sheet; inspected the corrected escape frame separately, plus chair and seated temporal previews.
- Evidence: out/drafts/flood03-review/{every-scene.jpg,01-hook.png through 15-outro.png,action-beats.jpg,receipt.json,loudness.txt,speech-bed.json}. The action sheet contains four exported samples each for decoy, chair, door, battery and sitting.
- Source speech-window RMS measurement places the drone 53.7-54.9 dB below speech in its three authored scenes; all other scene drone levels are zero. No rain bed. Battery scene has no beds.
- Post kit opens with the B result and uses an open pinned question, with no A/B ending. Cover, script and post.txt sit alongside the video.

## New scene components

In src/v7/FloodFinale.tsx: FloodRing, FloodRewind, FloodStall, FloodDecoy, FloodUpload, FloodCount, FloodChairSwing, FloodDoorLatch, FloodWindowSignal, FloodSearchlight, FloodArrest, FloodBatteryDie, FloodDawnChair, FloodFinale. Shared Part 2 set/rig/prop helpers are exported from FloodEscape.tsx and registered in src/v5/Forest.tsx.

## Per-scene still review

| Scene | What the exported still shows / issue |
|---|---|
| 01 hook | Jaab left, phone glow and the larger leader at right; title/caption fit. |
| 02 rewind | Seven residents plus Jaab in room 606; cabinet at right. |
| 03 stall | Back-view Jaab faces the barricade gap, bag and distant leader. |
| 04 decoy | Aunt reaches into the bag with connected hands; Jaab conceals his phone. |
| 05 upload | Phone insert shows rescue group, 12%, one signal bar and 9% battery. |
| 06 count | Bag foreground contains seven phones; leader counts, Jaab small at right. |
| 07 ring | Matches hook composition with Jaab left and leader right. |
| 08 chair | Aunt grips the original chair between Jaab and the doorway; single impact shake. |
| 09 door | Back-view depth move reaches the service door; hand, closing panel and latch are distinct phases. |
| 10 signal | Facade wide shows tiny Jaab flashing from a window and rescue boat below. |
| 11 turn | Searchlight crosses the window and lights Jaab from the right. |
| 12 caught | Both thugs, police boat/officer and stolen TV are visible; water-layer face clipping repaired. The escape/arrest remains a stylized overhead tableau rather than detailed swimming or cuffing animation. |
| 13 sent | Phone shows 100% and 1%, then darkens; no beds in this scene. |
| 14 end | Warm aunt/Jaab two-shot with chair; late temporal preview confirms bent knees and seated pose. |
| 15 outro | Sharp wide shows residents and seated Jaab, season-end title and open question; shortened caption chunks fit. |

## Limits and changed files

No human audio audition was available in this tool environment. ASR, waveform timing and loudness checks do not certify Thai pronunciation or performance; owner listening remains open. The escape/arrest is the explicit visual approximation noted above. Midpoint inspection alone does not certify every in-between animation frame.

Task files: episodes/flood03.json; src/v7/FloodFinale.tsx; src/v7/FloodEscape.tsx; src/v5/Forest.tsx; scripts/build_flood03_aligned.py; scripts/check_flood03_beds.py; scripts/finish_flood03.py; scripts/review_flood03.py; scripts/pipeline/narrate.py; scripts/pipeline/postkit.py; tests/test_narrate_cuts.py; this review. Generated take/timing, ringtone and export/review artifacts are under public/flood03, public/sfx/floodRing.wav and out/. Existing unrelated workspace changes were preserved.

A concurrent process also worked on flood03 in the shared workspace; duplicate renders were stopped and this report identifies the exact final reviewed hash.
