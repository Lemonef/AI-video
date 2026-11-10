---json
{"id":"nolie01-cuts","type":"normal","risk":"low","repo":"D:/AI-video-nolie01","gates":["python tests/gates/nolie01_cuts.py","npx tsc --noEmit"],"protected":["tests/**","conftest.py","**/conftest.py","pytest.ini","pyproject.toml","setup.cfg","scripts/pipeline/retention.py"],"context_files":["src/jaab3d/Nolie01.tsx","episodes/nolie01.json","scripts/pipeline/retention.py","src/jaab3d/engine/camera.ts","docs/nolie01-story-lock.md"]}
---
# Brief: nolie01 multi-shot cutting (retention lint)

## Problem
`python scripts/make.py nolie01 --no-render` stops at the pre-voice retention lint
(`scripts/pipeline/retention.py`): every scene after the hook holds one camera angle for
5-15 s (static limit `MAX_STATIC_SEC`, push limit `MAX_PUSH_SEC`). Cause: `episodes/nolie01.json`
scenes carry one shot at `at: 0`, and `src/jaab3d/Nolie01.tsx` picks one camera angle per scene id
(`angles[id]`), so even extra `shots` marks would not change the picture.

## Do
1. `src/jaab3d/Nolie01.tsx`: support several shots per scene. Each scene's `shots[]` entry
   (`at` = fraction of the line, 0..1) switches to a different camera angle (new framing:
   wide / medium / close / over-shoulder / insert on the prop being talked about). Keep the
   existing `solveCamera` + angle data style; add angles as named data, no magic numbers inline
   (put them beside the existing `angles` table). Camera may push slowly inside a shot.
2. `episodes/nolie01.json`: give every non-endcard scene enough `shots` marks that no stretch
   exceeds the static limit at the measured 10 letters/s estimate (the lint prints the estimate;
   the resolution scene is ~15 s and needs ~4 cuts). Cut on meaning (new subject in the line),
   not on a timer. Do not change any `say` text.
3. Keep the story beats in `docs/nolie01-story-lock.md`; update its shot list column if it has one.

## Done when
- Gate: `python tests/gates/nolie01_cuts.py` exits 0 (no FAIL and no WARN "without a cut"). Run the
  lint path only: the pre-voice estimate in make.py must print no retention FAIL for nolie01.
  If you cannot run make.py (no network/key), call `pipeline.retention.check(episode, estimate(episode, 10.0))`
  directly in a one-off python snippet and show zero FAIL.
- `npx tsc --noEmit` no NEW errors vs baseline; `python -m pytest -q` no new failures vs baseline
  (7 known baseline failures need ffmpeg - ignore those).
- Work only inside this repo. Do not commit (sandbox blocks .git); the parent commits.
- Do not edit tests, conftest.py, pytest.ini, pyproject.toml, retention.py limits.
- Final message: files changed, per-scene longest stretch before/after, gate output.
