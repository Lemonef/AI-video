# Part 3 animation and sound review - 2026-10-29
**Approved and promoted by Zen, 2026-10-29:** current final is `out/final/ep03/video.mp4` with the matching cover, post text and script. The previous final and its kit are now drafts in `out/drafts/ep03/previous-final/`. All four promoted files and all four archived originals were verified by SHA-256. Earlier preservation statements below describe the draft-review stage.

Latest reviewed export: `out/drafts/ep03/ep03-reviewed-v3.mp4` (**78.6 seconds**, 1440 x 2560 / 30 fps).
Canonical draft: `out/drafts/ep03/video.mp4` (identical bytes).
Version: `D:\AI-video\out\versions\ep03\2026-10-29_195320.mp4`.

The original `out/final/ep03/video.mp4` and final post kit remain untouched. Original video SHA-256: `67e31cef0eac76e9d69c5cce8a28d902dc419206848409331de55c9debb5769b`. Revised post kit: `out/drafts/ep03/{cover.png,post.txt,script.md}`.

## Changes

- Walking hips stay attached; head turns no longer switch into a sideways kicking gait. Footfalls follow the 1.2-second cycle.
- The first caption keeps `คนส่วนใหญ่เลือก B` together instead of attaching B to the following sentence.
- The unclear `ยายสั่ง` phrase is now `ยายบอกไว้`. Only rewind/deadline recordings changed; nineteen scene recordings were preserved.
- Replaced the malformed lock hand and navy hug insert. Jaab retains his teal clothing/backpack; the arms, sleeves and palms connect.
- The pull is an actual reach, grip, body lean and movement through a visible doorway. The sleeve stays behind Jaab’s face and the medicine stays attached to his other hand.
- Every shadow comparison is full-body, including mum’s reveal. Removed sandals that resembled a shadow under the copy.
- The early mimic request is normal. Only the exposed creature’s complete final dialogue is deepened (pitch 0.82, tempo preserved).
- Bolt/click and slam are word-cued. Trimmed 0.94 seconds from the impact sample and lowered it to preserve narration clarity.

## Validation

- Retention and framing lint passed; neither lint was disabled.
- `npx tsc --noEmit -p .` passed.
- `.venv/Scripts/python -m pytest -q tests`: **28 passed**.
- `node --test tests/walk-cycle.test.mjs`: **2 passed**.
- Reviewed all 21 scenes as midpoint stills and temporal samples, including targeted walk/blink/pull previews. Final extraction contains 126 temporal samples.
- Waveform comparison of the complete final voice mix against every source scene: maximum offset 0.333 ms, minimum normalized correlation 0.9265. Evidence: `out/drafts/ep03-review3/audio-sync.json`.
- The replacement full take failed completeness checking. Only its two fully transcribed opening lines were used; the incomplete remainder was rejected. Approved recordings and matching word timings are checked into `public/approved/ep03/` so builds are reproducible without another voice request.
- Final build used make.py; the corrected pull and caption shots were rendered from the same props, assembled at exact frame boundaries, and loudness-mastered.

## Scene list and final still paths

| Scene | Video time | Description | Still |
| --- | --- | --- | --- |
| 01 cold | 0.00-3.27s | Two matching sons call mum; cut to the repaired lock hand. | `out/drafts/ep03-review3/01-cold.png` |
| 02 rewind | 3.27-8.17s | Approved B-vote wording stays together, with the revised medicine-first line. | `out/drafts/ep03-review3/02-rewind.png` |
| 03 deadline | 8.17-14.73s | Clearer ยายบอกไว้ phrase, fever insert, and failing bulb establish the deadline. | `out/drafts/ep03-review3/03-deadline.png` |
| 04 return | 14.73-19.63s | Depth walk follows the path with attached hips and measured footfalls. | `out/drafts/ep03-review3/04-return.png` |
| 05 twins | 19.63-23.90s | The copy waves once, timed to the narration. | `out/drafts/ep03-review3/05-twins.png` |
| 06 eyes | 23.90-27.23s | Two separate faces blink at different times. | `out/drafts/ep03-review3/06-eyes.png` |
| 07 secret | 27.23-32.20s | The double knows the private nickname. | `out/drafts/ep03-review3/07-secret.png` |
| 08 copy | 32.20-34.87s | The mimic asks for entry in the normal voice. | `out/drafts/ep03-review3/08-copy.png` |
| 09 bolt | 34.87-38.83s | The bolt visibly slides with the click, then the bulb flickers. | `out/drafts/ep03-review3/09-bolt.png` |
| 10 stop | 38.83-44.60s | Jaab gestures for the light test and lowers his arm. | `out/drafts/ep03-review3/10-stop.png` |
| 11 guess | 44.60-48.03s | Full-body guess beat: compare both sons. | `out/drafts/ep03-review3/11-guess.png` |
| 12 answer | 48.03-51.30s | Both bodies and the real son’s wall shadow remain visible. | `out/drafts/ep03-review3/12-answer.png` |
| 13 feet | 51.30-53.27s | The ground clue is explained while retaining the full-body comparison. | `out/drafts/ep03-review3/13-feet.png` |
| 14 bulb | 53.27-56.40s | The bulb flickers toward darkness. | `out/drafts/ep03-review3/14-bulb.png` |
| 15 reach | 56.40-61.53s | A jointed arm reaches, grips the sleeve, and pulls the whole rig into the doorway; medicine follows the other hand. | `out/drafts/ep03-review3/15-reach.png` |
| 16 slam | 61.53-64.23s | The bolt shuts, the corrected impact lands, and the double stops smiling. | `out/drafts/ep03-review3/16-slam.png` |
| 17 whisper | 64.23-66.40s | Only this exposed creature dialogue uses a deeper voice, with unchanged pace. | `out/drafts/ep03-review3/17-whisper.png` |
| 18 hug | 66.40-69.60s | Connected arms wrap the correct teal hoodie and backpack. | `out/drafts/ep03-review3/18-hug.png` |
| 19 wrong | 69.60-74.67s | The embrace tightens; the downward glance cuts to a full-body view. | `out/drafts/ep03-review3/19-wrong.png` |
| 20 shadow | 74.67-75.97s | Full-body mum/Jaab comparison: only Jaab casts a shadow. | `out/drafts/ep03-review3/20-shadow.png` |
| 21 bed | 75.97-78.50s | Real mum asleep in bed, then return to the embrace for the final question. | `out/drafts/ep03-review3/21-bed.png` |

Temporal sheets: `out/drafts/ep03-review3/motion-01-cold.jpg` through `motion-21-bed.jpg`.

## Review limits

Audio sync was checked with word timestamps, transcription and waveform alignment. This environment cannot audition audio, so this is not a human pronunciation/listening sign-off. The paired opening calls remain on-screen bubbles over narration, without separately layered simultaneous calls. Nothing was posted or copied over the original final.
