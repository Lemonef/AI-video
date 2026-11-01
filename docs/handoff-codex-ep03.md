# Handoff: rewrite + re-shoot Part 3 (ep03), post-ready by 19:30 today

Repo `D:\AI-video` (Remotion 4 + Python pipeline). Read first: `docs/TODO.md` (NOW), `episodes/ep03.json` (current version), `episodes/ep02.json` (style reference), brain note `D:\second-brain\memory\tiktok-what-if-series.md` (FULL STATE SUMMARY + "Feedback after Part 3").

## Why
The owner's verdict on the current Part 3: Jaab always dead-centre, one camera angle, stiff, the hug is fake, attention does not hold, the story feels like every TikTok ghost story, and the "cinematic" look is weak.

## 1. Story rewrite (Thai narration, ~70-80 s, keep the voice Iapetus via the existing pipeline)
Keep: the vote (most chose B: Jaab fetched the medicine first), the porch with two Jaabs, the shadow test, the final twist (mum hugging Jaab has no shadow; the real mum is still asleep in bed). Change:
- **Open in the middle of the climax** (in medias res): first 3 s = mum's hand on the door lock, two identical Jaabs outside calling "แม่" in the same voice. Hook line must start "จะเกิดอะไรขึ้น ถ้า…". Then "สิบนาทีก่อนหน้านี้…" and catch up fast (≤15 s) with the B chip "✅ คนส่วนใหญ่เลือก B".
- **A ticking clock**: mum's fever / the medicine must be given before something (e.g. the porch bulb dying, the hour grandma warned about). Every scene raises the price.
- **Fresher beats, no filler**: cut anything that only re-states. One unexpected detail per 10 s (a wrong-handed wave, the copy blinking out of sync, the copy knowing something only mum knows).
- Guess beat "ลองดูดีๆ…" before the shadow answer stays.
- Ending: the twist lands in the last 6 s, last line is a question for comments. NO A/B choice (finale).
- Lines in `say` must be TTS-friendly (numbers as words, no emoji). `monster` only on the creature's own words.

## 2. Camera / staging pass (every scene)
- Jaab **never dead-centre** for more than one shot: place him on thirds (x≈360 or ≈720), vary scale (wide 0.5 / medium 0.8 / close 1.2+).
- **A camera change every 1.5-2.5 s** using `shots` (zoom/x/y; a shot keeps its x,y fixed on screen): wide → medium → close-up. Use inserts and close-ups (door lock, eyes, hands, feet, the bulb).
- Add new insert environments if needed (pattern: `src/v7/HouseOutside.tsx` `InsertFeetTwo`; register in `src/v5/Forest.tsx` ENV5): e.g. door-lock close-up, mum's hand, eyes close-up.
- **Replace the stiff hug** with a close-up insert (arms around a back, mum's hand) rather than two standing figures.
- Motion in every shot: cast `keys` (turn, pose, action), `toX/toY/toScale` walks, `back` view.
- Keep: `shadows {x, wall:true}` for the shadow test, mum `noShadow:true` everywhere, quiet beds (no rain unless on screen, drone only when tense, `mix.bedVolume` 0.4).

## 3. Build and check
```
cd D:\AI-video
$env:PYTHONIOENCODING="utf-8"; .venv\Scripts\python scripts\make.py ep03
```
- The retention lint and the framing lint must pass. Framing lint error = a face cut off on tall phones: lower that shot's zoom or move its x toward the face. Never disable a lint.
- make.py prints TAKE times; video time = take time + earlier padAfter.
- If the final file is locked: `... scripts\make.py ep03 --publish` after closing the player.
- Extract a still at the middle of every scene into `out\drafts\ep03-check\` and look at each one: no centred static framing, faces in frame, shadow test readable.
- `npx tsc --noEmit -p .` and `.venv\Scripts\python -m pytest -q tests` must pass.

## 4. Finish
- Commit (Conventional Commits, one concern each): new inserts/code, then `feat(ep03): rewrite + camera pass`.
- Update `out/final/ep03/post.txt` via the pipeline (it regenerates) and report: final duration, scene list with one-line description, still paths, anything left undone.
