# References — what was mined, from where

Strip-mine rule: every reference is mined for usable parts before anything is set aside; salvaged ideas keep their source.

## Instagram (downloaded with yt-dlp 2026-10-26, frames sampled every 2 s)

### "Keep Pip Alive" — instagram.com/p/Dew5Touk-nb (~26K likes)
Dark, cinematic flat 2D. Silent hero Pip (yellow knitted scarf, glowing dot eyes) on a daily interactive story: "He only listens to one voice: yours." Post caption ends "The rooftops, or the subway? What would YOU do? New part every day at 7pm."
- **Persistent HUD**: battery 3 %, hearts ♥♥♥, "DAY 1 · 214 MI" in the top-left of every shot. Stakes that carry across episodes and make each choice cost something ("every choice has a price"). **Adopt** (TODO).
- **Big stat card** ("BATTERY 3%" in huge red type) as its own beat. Adopt as a scene type.
- **Hook line with one coloured word**: "IT ONLY FREEZES IN THE **LIGHT**." Adopt in TitleCard.
- One **signature prop** that reads at thumbnail size (the scarf). Mochi's version: the hair curl + lanyard.
- Fixed posting time stated in the caption. Use it in the weekly loop.
- Captions: small, clean white sans, no box. Their tone is dark and ours is bright, so keep our boxed captions.

### Chandler (Claude Code + Remotion edit) — instagram.com/p/De8SPjEAuV0
Talking-head edit built by Claude Code. Workflow, as he states it:
- **Storyboard table first**: every line, what's on screen, which tool makes it. Fix the plan, then build. Our `episodes/*.json` plays this role; worth adding a human-readable table export for review.
- **Whisper word timing** drives captions and card pop-ins. Ours comes from TTS word boundaries; Whisper is the verification pass (TODO).
- Text-behind-head (segmentation), Remotion motion graphics, FFmpeg colour grades (warm with a slider reveal; moody with curves, lower saturation and a vignette), **whip-pan** transitions instead of recursive zoom. Adopt whip-pan + vignette.

### "Harvey" explainer — instagram.com/p/DeghgsivKu7
Blocky low-poly **3D** characters (cube heads, rectangle eyes, ties) in warm-lit miniature rooms, film grain.
- **Taped-paper headline strip** at the top, one per beat ("YOU BRIEF IT, IT HUNTS"). Adopt (TODO).
- **Word-chip captions**: each word on its own torn-paper chip, popping in as spoken. Optional caption style (TODO).
- Terminal / paper-card overlays for "data" moments.
- The 3D look is the three.js route (see the skill pack below); kept as a style option, not v1.

## story-series-skill-pack (Instagram, local copy D:\Documents\Downloads\story-series-skill-pack-yoolaibeef)
Thai-language Remotion + three.js pack for 9:16 "survival rule" series. **Licence is an unfilled DRAFT with "no redistribution"**, so no code is copied; ideas only.
- Pipeline shape: edge-tts → faster-whisper transcribe/align (`overlaps: 0` gate) → splice pauses → render → mix (sidechain duck, −14 LUFS). **Adopted the idea** of −14 LUFS mastering (`scripts/pipeline/master.py`, own implementation).
- "Write for the ear": numbers as words, Thai ไม้ไต่คู้ for short vowels, listen to doubtful words because Whisper can't prove pronunciation. Folded into the README's episode-writing rules.
- Re-voice one line without re-cutting the picture (keep slot lengths). Ours already caches per line; the picture re-times automatically.
- Pause rules: +0.4–0.6 s after a punch line, +0.8–1.0 s before the twist. Applied via `padAfter`.
- Story formula: "ถ้า… อย่า…" hook, fact-with-number → action, sidekick animal, twist "everything was right except one thing", cliffhanger, series bible. Useful for scripts.
- Room-tone bed so there is no dead silence between lines. Skipped for now: Zen adds a trend sound in-app.
- Mentions official Remotion agent skills (github.com/remotion-dev/skills). TODO to evaluate.
