# Handoff: produce Bangkok flood Part 3 (finale) — deadline today 19:00 Bangkok for owner review, posts 20:00

Agent: Codex (gpt-6.1-sol). Repo D:\AI-video. Owner is away; the parent (Claude) reviews your output. NEVER post anything anywhere.

## Read first (in this order)
1. `docs/flood03-story.md` — the approved story, 15 scenes, exact Thai narration (`say`) and the staging/camera plan per scene. Narration text is FINAL: use it verbatim.
2. `episodes/flood02.json` — the episode format to copy (top-level fields, `post`, `narrationDirection`, scene fields `id,bg,say,caption,cast,transition,progress,shots,beds,sfx,hits,chip,inserts...`).
3. `docs/flood02-release-review.md`, `docs/ep03-rewrite-review.md`, `docs/cinematic-guide.md` — what the owner liked (ghost Part 3: off-centre staging, wide/medium changes, back-view depth walks with toY/toScale, motivated inserts, modest pushes) and rejected (Jaab dead-centre, stiff poses, static camera, hug that looks fake, continuous rain/noise, monster voice on a whole line).
4. Flood scene components: `src/v5/Forest.tsx` registry line ~236 (`floodEvidence ... floodPressure`) and their implementations; reuse sets/characters (room 606, cabinet barricade, service door, rescue boat light, aunt, thugs red/green shirts as VISUALS only).

## Build
- `episodes/flood03.json`: id `flood03`, seriesSlug `bangkok-flood`, releaseEpisode `ep03`, same voice (Gemini `gemini-2.5-flash-preview-tts`, Iapetus), tempo as Part 2 (1.104) unless the measured take needs adjustment, `narrationDirection` from the story doc. `post`: part 3, total 3, finale wording, NO question/A-B pin (see story doc "Post kit").
- New background scene components for scenes that need new sets (e.g. `floodDecoy`, `floodUpload`, `floodCount`, `floodChairSwing`, `floodDoorLatch`, `floodWindowSignal`, `floodSearchlight`, `floodArrest`, `floodBatteryDie`, `floodDawnChair`, `floodFinale`); reuse existing components where the set is identical (hook/ring can share one set with different shots). Register them in the same registry.
- Camera per the story table: vary shot size every 1-2 scenes; Jaab in a third, not centred; one impact shake only on the chair hit; searchlight = strong motivated key light; scene 13 has a silence beat (no beds); beds: no rain bed unless rain is visible; drone only on count/ring/chair.
- Mix: speech gaps >= 16-18 dB under speech; loudness like Part 2 (~-14 LUFS, <= -1 dBTP).

## Run + verify (all must pass before you report)
- `npx tsc --noEmit -p .`
- `python scripts/make.py flood03` (renders a version into `out/versions/flood03/`, latest copy in final per repo convention). If the TTS call fails on quota, stop and report it — do NOT switch voice or model.
- Extract one still per scene (ffmpeg, mid-scene) into `out/drafts/flood03-review/` and LOOK at every one: check Jaab placement, poses, readable action, no clipping/overlap, captions inside safe area.
- Run the repo's retention/framing lints if `make.py` does not already.
- Do NOT run `--publish`; the parent publishes after review.

## Report
Path of the rendered video, duration, LUFS/dBTP, list of new components, and per scene one line: what the still shows + any issue you could not fix. Leave changes uncommitted if the sandbox blocks git; list changed files.
