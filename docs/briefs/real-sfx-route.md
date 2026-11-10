---json
{"id":"real-sfx-route","type":"normal","risk":"low","repo":"D:/AI-video-nolie01","gates":["python tests/gates/real_sfx_route.py"],"protected":["tests/**","conftest.py","**/conftest.py","pytest.ini","pyproject.toml","setup.cfg"],"context_files":["scripts/make.py","scripts/pipeline/freesound.py","scripts/pipeline/sfx.py"]}
---
# Brief: route real-mix episodes to Freesound CC0 effects

## Problem
`scripts/make.py` step `[2/4] sound effects` calls `sfx.ensure(public, mix.get("realSfx") or None)`.
`sfx.ensure(public_dir)` is the ffmpeg synth and takes ONE argument, so every episode with
`mix.real == true` crashes: `TypeError: ensure() takes 1 positional argument but 2 were given`.
Real effects come from `freesound.ensure(public_dir, names)` (writes `public/sfx/real/`, which the
jaab3d scenes read). Synth effects are not allowed for real-mix episodes.

## Do
1. In `scripts/make.py` add a module-level function `ensure_sound(episode: dict, public: Path) -> None`
   holding the whole step-2 body:
   - `mix = episode.get("mix", {})`
   - if `mix.get("real")`: `freesound.ensure(public, mix.get("realSfx") or None)`; else `sfx.ensure(public)`.
   - music unchanged: if `mix.get("music")`, `freesound.ensure_music(public, [music["name"]], music.get("volume_lufs"))`.
   - Call module attributes (`sfx.ensure`, `freesound.ensure`) so they can be stubbed.
2. In `main`, replace the inline step-2 code with `print("[2/4] sound effects")` + `ensure_sound(episode, public)`.
3. No other behaviour change.

## Done when
- `python tests/gates/real_sfx_route.py` exits 0.
- `python -m pytest -q` no new failures vs baseline (7 known ffmpeg baseline failures - ignore).

- Work only inside this repo. Do not commit (sandbox blocks .git). Do not edit tests.
- Final message: files changed, diff summary, gate output.
