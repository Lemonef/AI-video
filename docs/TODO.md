# TODO — the only place live status lives

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
