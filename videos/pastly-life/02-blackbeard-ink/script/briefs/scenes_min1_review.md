# Minute 1 fresh scenes (m1a..m1d) - free-leg review and what was applied

_One-line purpose: record of the brief review for scenes_min1.py before the pipeline jobs ran._

Reviewers: Groq (Qwen) and Cohere, 2026-11-23 (free legs). A multi_ai_check fan-out hung for 32 min with no output and was stopped; it also rate-limited the pipeline review keys (see brain corrections note).

| Brief | Groq | Cohere | Finding | Applied |
|---|---|---|---|---|
| all | - | flag | gulls add uncounted figures | gulls removed, "No birds" added |
| m1a bath dock | FAIL | PASS | lamp post + lantern anachronism; cargo clutter; plank merges with hull | lamp post removed; props cut; plank kept separate from hull |
| m1b gov study | PASS | PASS | candle may become a glow source; globe detail | light = diffuse window daylight, matte, no shine; plain globe; extra props cut |
| m1c navy dawn | FAIL | PASS | "20 men" vs 8 figures; crowding; vague flag | goal reworded; crowding reduced; period red ensign |
| m1d QAR deck | FAIL | PASS | invented plain black flag; rigging climber; prop overload | flags furled/out of frame; nobody in rigging; props cut |

## Redo round 2026-11-23 (m1b, m1c)
Eye-check of the delivered images found rule breaks the briefs themselves invited: m1b drew a lit candle (props still listed one), m1c drew two flying red flags (brief asked for an ensign) and a glowing sun dot (brief asked for a sun disc). Old md5s added to REJECTED.json. The generator also protected each job's own output file, which would block any redo; fixed in make_scene_briefs.py.

| Brief | Groq | Cohere | Finding | Applied |
|---|---|---|---|---|
| m1b gov study | FAIL | PASS | ship mast outside the window may get a flag | "one bare ship mast outside (no flag, no sail)"; candle prop + scale removed; only light = window daylight, no candle/lamp/flame |
| m1c navy dawn | no answer (bare "VERDICT: FAIL" twice, no reasoning) | PASS | flag wording mixed | ensign removed, "NO flags of any kind"; sun disc removed, flat overcast sky, no light strip on water |

Style stays the OLD graded scenes (Zen 2026-11-22 20:55 FINAL).
