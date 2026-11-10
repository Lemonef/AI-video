# nolie01 — completed under amendment 1 (2026-11-11)

All four phases are implemented. No other episode or Takrut file/test was changed; no network fetch, render, publish, dependency install, or commit was performed.

## Changes

- `docs/nolie01-story-lock.md`: What-If Story Lock, audited Thai second-person narration, and 84-second beat/SFX/music plan.
- `episodes/nolie01.json`: isolated `jaab3d` episode, Gemini/Iapetus voice direction with Edge/Niwat fallback, real-SFX cues, post metadata, and the music mix/event map.
- `src/jaab3d/Nolie01.tsx`, `src/jaab3d/index.tsx`: timing-derived `Nolie01` composition with per-beat 3D staging, camera moves, rain/light changes, Thai title/captions, real SFX, and music automation.
- `src/jaab3d/music.ts`, `scripts/pipeline/music.py`, `tests/test_music_envelope.py`: duck/swell/drop/out envelope and its unit coverage.
- `scripts/pipeline/render.py`, `tests/test_render_routing.py`: opt-in `style: "jaab3d"` route to `src/jaab3d/index.tsx`, `Nolie01`, and `public3d`; legacy command construction has no added argument.
- `scripts/make.py`, `scripts/pipeline/freesound.py`, `src/types.ts`: `public3d` assets for the isolated renderer; only configured real SFX are fetched; CC0 music is normalized to its configured `-27 LUFS` bed target. The master target remains `-14 LUFS`.

## Parent fetches

`make.py` fetches these existing CC0 real-SFX library names into `public3d/sfx/real/`: `boom`, `crowd_laugh`, `lift_door`, `hit`, `crowd_gasp`, `heartbeat`, and `crowd_cheer`.

The added CC0 music candidates are written to `public3d/music/` (the route's `--public-dir`), with `credits.json`:

| Name | Freesound CC0 query | Duration range |
|---|---|---:|
| `nolie01_truth_pulse` | `minimal suspense pulse ambient` | 45–180 s |
| `nolie01_truth_strings` | `gentle cinematic tension strings` | 45–180 s |
| `nolie01_truth_release` | `warm hopeful ambient piano` | 45–180 s |

The episode selects `nolie01_truth_pulse`; the other two remain reviewable alternatives. Fetch requires the parent-held `FREESOUND_API_KEY` or `~/.secrets/freesound_api_key`.

## Validation

- Baseline supplied by amendment: **7 failed, 84 passed, 1 skipped**.
- `node node_modules/typescript/bin/tsc --noEmit`: **passed**.
- `python -m pytest -q tests --basetemp=.build/pytest-nolie01/check-03`: **9 failed, 88 passed, 1 skipped**.

All tests added for this work pass. No new code-test failure occurred. The nine failures are five ffmpeg-dependent tests and the four known gitignored Takrut asset tests. Two monster-audio tests are additionally affected because `ffmpeg` is currently not discoverable in this shell; this is environment drift beyond the amendment's three harness failures. `Get-Command ffmpeg` returns no executable.

## Parent commands and open risks

Run after ensuring the voice credentials, Freesound key, and `ffmpeg` are available:

```powershell
$env:PYTHONIOENCODING = "utf-8"
$OutputEncoding = [Text.UTF8Encoding]::new()
python scripts/make.py nolie01 --draft

# Explicit fallback if Gemini/Iapetus cannot produce the whole take:
python scripts/make.py nolie01 --engine edge --voice th-TH-NiwatNeural --force --draft
```

The parent must listen to the generated Thai take, inspect captions/timing, and review the rendered audio mix and title readability before release. No voice, Freesound asset, or draft render was generated in this no-network task.
