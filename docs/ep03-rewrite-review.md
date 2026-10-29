# Part 3 rewrite review - 2026-10-29

Draft: `out/drafts/ep03/video.mp4` (79.5 seconds by ffprobe; 2383 video frames at 30 fps).
Build: `.venv/Scripts/python scripts/make.py ep03 --draft`.
Voice: cached Gemini 2.5 Flash preview TTS / Iapetus, tempo 1.03; one new voice request.

The existing `out/final/ep03/video.mp4` is byte-for-byte unchanged. Its original SHA-256 is `67e31cef0eac76e9d69c5cce8a28d902dc419206848409331de55c9debb5769b`. The final post kit is also preserved; the revised kit is `out/drafts/ep03/{post.txt,script.md,cover.png}`.

## Validation

- Retention lint passed; framing lint remained enabled and the full render passed.
- TypeScript: `npx tsc --noEmit -p .` passed.
- Python: `.venv/Scripts/python -m pytest -q tests` passed (20 tests).
- The new draft regression test checks that final video and post.txt bytes stay unchanged.
- Inspected all 21 midpoint stills on four contact sheets, plus full-size opening, wall-shadow answer, mum feet, and sleeping-mum reveal.
- Catch-up ends at approximately 14.2 seconds; the final twist occupies the last approximately 3.8 seconds.
- Existing uncommitted insert artwork was integrated; the hug arm SVG path was repaired.

## Scenes and stills

| Scene | Video time | Description | Midpoint still |
| --- | --- | --- | --- |
| 01 cold | 0.00-3.27s | Two identical sons call mum; cut to her hand at the lock. | `out/drafts/ep03-check/01-cold.png` |
| 02 rewind | 3.27-7.90s | Rewind: the winning B vote sends Jaab for medicine. | `out/drafts/ep03-check/02-rewind.png` |
| 03 deadline | 7.90-14.27s | Fever and the dying porch light establish the deadline. | `out/drafts/ep03-check/03-deadline.png` |
| 04 return | 14.27-19.17s | His own voice is already ahead of him on the way home. | `out/drafts/ep03-check/04-return.png` |
| 05 twins | 19.17-23.43s | The double waves with the wrong hand. | `out/drafts/ep03-check/05-twins.png` |
| 06 eyes | 23.43-26.77s | The eyes blink out of sync. | `out/drafts/ep03-check/06-eyes.png` |
| 07 secret | 26.77-31.73s | The double knows a private nickname. | `out/drafts/ep03-check/07-secret.png` |
| 08 copy | 31.73-35.40s | The creature uses the nickname to ask for entry. | `out/drafts/ep03-check/08-copy.png` |
| 09 bolt | 35.40-39.37s | The bolt moves as the porch bulb sputters. | `out/drafts/ep03-check/09-bolt.png` |
| 10 stop | 39.37-45.13s | Jaab demands a test under the light before it dies. | `out/drafts/ep03-check/10-stop.png` |
| 11 guess | 45.13-48.57s | Pause for viewers to guess which son is real. | `out/drafts/ep03-check/11-guess.png` |
| 12 answer | 48.57-51.83s | The left son casts a wall shadow; the right son does not. | `out/drafts/ep03-check/12-answer.png` |
| 13 feet | 51.83-53.80s | Feet confirm only one shadow. | `out/drafts/ep03-check/13-feet.png` |
| 14 bulb | 53.80-56.93s | The porch bulb stays dark longer. | `out/drafts/ep03-check/14-bulb.png` |
| 15 reach | 56.93-62.07s | A hand pulls the real son inside while he grips the medicine. | `out/drafts/ep03-check/15-reach.png` |
| 16 slam | 62.07-64.77s | The door slams; the double stops smiling. | `out/drafts/ep03-check/16-slam.png` |
| 17 whisper | 64.77-67.33s | The creature begs through the locked door. | `out/drafts/ep03-check/17-whisper.png` |
| 18 hug | 67.33-70.53s | Close-up arms wrap around Jaab in apparent safety. | `out/drafts/ep03-check/18-hug.png` |
| 19 wrong | 70.53-75.60s | The embrace tightens and will not release. | `out/drafts/ep03-check/19-wrong.png` |
| 20 shadow | 75.60-76.90s | Mum has no shadow beside Jaab. | `out/drafts/ep03-check/20-shadow.png` |
| 21 bed | 76.90-79.43s | The real mum sleeps in bed; who is holding Jaab? | `out/drafts/ep03-check/21-bed.png` |

Contact sheets: `out/drafts/ep03-check/contact-1.jpg` through `contact-4.jpg`.
Additional stills: `01-cold-opening.png`, `21-bed-reveal.png` in that folder.

## Remaining limits

- The opening represents both calls with an on-screen voice bubble over the narrated hook; there are no separately layered overlapping calls.
- This was a visual frame review and automated alignment, not a full human listening pass.
- No publishing or replacement of the existing final was performed, as requested.
