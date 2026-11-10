---json
{"id":"voice-take-complete","type":"normal","risk":"medium","repo":"D:/AI-video-nolie01","gates":["python tests/gates/voice_take_complete.py"],"protected":["tests/**","conftest.py","**/conftest.py","pytest.ini","pyproject.toml","setup.cfg"],"context_files":["scripts/pipeline/narrate.py","scripts/pipeline/media.py","scripts/pipeline/tts/gemini_engine.py"]}
---
# Brief: whole-take voice must hold every line, with no long dead air

## Problem
`narrate._narrate_take` sends the whole script (10 lines) to Gemini TTS in ONE request. On nolie01
the model stopped after line 7: the take ran 122 s but 71.6-122.6 s was silence. The aligner then
invented starts for the 3 missing lines, so 3 scenes shipped silent. The take also held 3-4.5 s
pauses between lines (hook 6.65 s > 6.0 s limit, reel padded ~25 s).

## Do (all in `scripts/pipeline/narrate.py` + `scripts/pipeline/media.py`)
1. Named constants in narrate.py, each with a one-line WHY comment:
   `TAKE_CHUNK_LINES = 5` (episode override `voiceChunkLines`), `MAX_TAIL_SILENCE_SEC = 2.0`,
   `TRUNCATION_RETRIES = 1`, `MAX_LINE_PAUSE_SEC = 0.5` (episode override `maxPauseSec`).
2. Pure helpers in narrate.py:
   - `take_chunks(lines, max_lines) -> list[list]`: fewest chunks of <= max_lines, sizes balanced
     (differ by <= 1, larger first), order kept. 10/5 -> [5,5]; 11/5 -> [4,4,3]; 3/5 -> [3].
   - `tail_silence(pauses, take_sec) -> float`: length of the pause that ends at take_sec
     (end within 0.05 s of take_sec), else 0.0.
   - `squeeze_segments(pauses, take_sec, max_pause) -> list[(start,end)]`: keep-segments of the
     take where every pause longer than max_pause is cut down to max_pause, keeping max_pause/2
     on each side of it. Pauses <= max_pause untouched. Example: pauses
     [(0,0.2),(5.0,8.3),(13.4,17.9)], take 20, max 0.5 -> [(0,5.25),(8.05,13.65),(17.65,20)].
3. In media.py: `join(paths, out)` (concat audio files in order, ffmpeg concat) and
   `keep(src, segments, out)` (atrim each segment + concat into out). Use module attributes so
   tests can stub them; narrate must call `media.join`, `media.keep`, `media.silences`,
   `media.duration`, `media.tempo`, `media.cut` via the module.
4. `_narrate_take` voicing: replace the single `engine.synthesize(script, ...)` with chunked
   voicing. For chunk i (lines from `take_chunks`), build the chunk text exactly like the
   whole script today (same `_line` tone prefix, same `narrationJoin`, same optional
   `narrationDirection` preamble) and synthesize to `ep_dir/take.chunk{i}.mp3`. Check
   `tail_silence(media.silences(chunk), media.duration(chunk)) > MAX_TAIL_SILENCE_SEC` -> truncated:
   re-voice up to TRUNCATION_RETRIES times, then `raise RuntimeError("chunk {i} truncated ...")`.
   Then `media.join(chunk_paths, raw)`.
5. voice_key must include the chunk size, so a cached single-request take is not reused.
   An unchanged script with an existing raw take must still make ZERO TTS requests.
6. After `media.tempo(raw, speed, take)`: compute `pauses = media.silences(take)`, call
   `media.keep(tempo_out, squeeze_segments(pauses, media.duration(tempo_out), max_pause), take)`
   (one call), then recompute `take_sec` and `pauses` from the squeezed take. Everything after
   (alignment, cuts, timing.json `_take.duration`) uses the squeezed take.
7. No other behaviour change. Non-whole-take engines untouched.

## Done when
- `python tests/gates/voice_take_complete.py` exits 0.
- `python -m pytest -q` no new failures vs baseline (7 known ffmpeg baseline failures - ignore).

- Work only inside this repo. Do not commit (sandbox blocks .git). Do not edit tests.
- The gate's test code is the contract; if an assertion is genuinely wrong, STOP and report it.
- Final message: files changed, diff summary, gate output.
