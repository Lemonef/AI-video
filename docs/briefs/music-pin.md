---json
{"id":"music-pin","type":"normal","risk":"low","repo":"D:/AI-video-nolie01","gates":["python tests/gates/music_pin.py"],"protected":["tests/**","conftest.py","**/conftest.py","pytest.ini","pyproject.toml","setup.cfg"],"context_files":["scripts/pipeline/freesound.py"]}
---
# Brief: pinned Freesound ids for music

## Problem
`scripts/pipeline/freesound.py` `ensure_music` only searches (`MUSIC_LIBRARY[name] = (query, lo, hi)`).
The `nolie01_truth_pulse` query returns 0 CC0 results, so `make.py nolie01` crashes at the music fetch.
SFX already have `PINNED` (a hand-checked id always wins); music has no equivalent.

## Do
1. Add `MUSIC_PINNED = {"nolie01_truth_pulse": 819108}` beside `MUSIC_LIBRARY` with a one-line comment
   per entry (`# soft slow piano, CC0, 88.6 s, covers the ~85 s reel`).
2. In `ensure_music`: if the name is in `MUSIC_PINNED`, use `_sound(pinned_id)` (it already enforces CC0)
   instead of `_search`; otherwise keep the search path unchanged. Same download / `_finish(bed=True, lufs=...)`
   / credits write for both paths.
3. Cache rule: if the target exists and credits hold a DIFFERENT id than the pin, re-fetch (mirror how
   `ensure` treats `PINNED`).

## Done when
- `python tests/gates/music_pin.py` exits 0.
- `python -m pytest -q` no new failures vs baseline (7 known ffmpeg baseline failures - ignore).

- Work only inside this repo. Do not commit (sandbox blocks .git). Do not edit tests.
- Final message: files changed, diff summary, gate output.
