"""Voice an episode and write public/<ep>/timing.json: {scene_id: {audio, duration, words, cues}}.

Two modes, chosen by the engine:
- per line (edge): each scene voiced separately, cached by text, word timings from the engine.
- whole take (gemini): the episode is read in ONE request so tone and pacing flow like a real
  narrator; Whisper finds the word timings and the take is cut at the silence before each line.
"""
import hashlib
import json
from dataclasses import asdict
from pathlib import Path

from . import media, whisper
from .align import scene_cuts, spoken_len, words_in
from .captions import build_cues
from .tts import TtsEngine, Word


MIN_COVERAGE = 0.7  # below this share of the script's letters, the transcript is not trusted for cutting


def _key(*parts: str) -> str:
    return hashlib.sha1("|".join(parts).encode("utf-8")).hexdigest()[:16]


def _line(scene: dict) -> str:
    """Spoken line with its optional delivery tag, e.g. "[whispers] ..."."""
    tone = scene.get("tone")
    return f"[{tone}] {scene['say']}" if tone else scene["say"]


def _entry(episode: dict, scene: dict, key: str, words: list[Word], duration: float) -> dict:
    cues = build_cues(scene.get("caption", scene["say"]), words, duration)
    return {
        "key": key,
        "audio": f"{episode['id']}/{scene['id']}.mp3",
        "duration": duration,
        "words": [asdict(w) for w in words],
        "cues": [asdict(c) for c in cues],
    }


def _save(path: Path, data: dict) -> None:
    path.write_text(json.dumps(data, ensure_ascii=False, indent=1), encoding="utf-8")


def narrate(episode: dict, engine: TtsEngine, public_dir: Path, force: bool = False) -> dict:
    ep_dir = public_dir / episode["id"]
    ep_dir.mkdir(parents=True, exist_ok=True)
    timing_path = ep_dir / "timing.json"
    cache = {} if force or not timing_path.exists() else json.loads(timing_path.read_text(encoding="utf-8"))
    if engine.whole_take:
        return _narrate_take(episode, engine, ep_dir, timing_path, cache)
    return _narrate_lines(episode, engine, ep_dir, timing_path, cache)


def _narrate_lines(episode: dict, engine: TtsEngine, ep_dir: Path, timing_path: Path, cache: dict) -> dict:
    voice, rate = episode["voice"], episode.get("rate", "+0%")
    timing = {k: v for k, v in cache.items() if k != "_take"}
    for scene in episode["scenes"]:
        sid = scene["id"]
        key = _key(engine.name, voice, rate, scene["say"])
        mp3 = ep_dir / f"{sid}.mp3"
        old = cache.get(sid)
        if old and old.get("key") == key and mp3.exists():
            words = [Word(**w) for w in old["words"]]
            print(f"  = {sid} (cached)")
        else:
            print(f"  > {sid}: voicing…", flush=True)
            tmp = ep_dir / f"{sid}.tmp.mp3"
            words = engine.synthesize(scene["say"], voice, rate, tmp)
            tmp.replace(mp3)
        timing[sid] = _entry(episode, scene, key, words, media.duration(mp3))
        _save(timing_path, timing)  # persist per line so audio and cache key never disagree
    return {s["id"]: timing[s["id"]] for s in episode["scenes"]}


def _narrate_take(episode: dict, engine: TtsEngine, ep_dir: Path, timing_path: Path, cache: dict) -> dict:
    voice = episode["voice"]
    lines = [_line(s) for s in episode["scenes"]]
    script = "\n".join(lines)  # newline = natural breath between lines
    speed = float(episode.get("tempo", 1.0))
    voice_key = _key(engine.name, voice, script)  # the paid/quota'd part: only re-voice when this changes
    key = _key(voice_key, str(speed))
    raw = ep_dir / "take.raw.mp3"
    take = ep_dir / "take.mp3"
    take_meta = cache.get("_take", {})
    if take_meta.get("voice_key") == voice_key and raw.exists():
        print("  = take voice (cached)")
    else:
        print(f"  > take: voicing {len(lines)} lines in one request…", flush=True)
        tmp = ep_dir / "take.tmp.mp3"
        engine.synthesize(script, voice, "", tmp)
        tmp.replace(raw)
    if take_meta.get("key") == key and take.exists():
        words = [Word(**w) for w in take_meta["words"]]
        print("  = take alignment (cached)")
    else:
        media.tempo(raw, speed, take)
        print(f"  > take: tempo x{speed}, aligning with Whisper…", flush=True)
        words = whisper.words(str(take))
    heard = sum(spoken_len(w.text) for w in words)
    expected = sum(spoken_len(line) for line in lines)
    if heard < MIN_COVERAGE * expected:
        raise RuntimeError(f"Whisper heard {heard}/{expected} letters of the script: transcript unusable, cuts would be wrong")
    take_sec = media.duration(take)
    timing: dict = {"_take": {"key": key, "voice_key": voice_key, "words": [asdict(w) for w in words], "duration": take_sec}}
    cuts = scene_cuts(lines, words, take_sec, media.silences(take))
    for scene, (start, end) in zip(episode["scenes"], cuts):
        mp3 = ep_dir / f"{scene['id']}.mp3"
        media.cut(take, start, end, mp3)
        timing[scene["id"]] = _entry(episode, scene, key, words_in(words, start, end), end - start)
        print(f"  ✓ {scene['id']}: {start:5.2f}–{end:5.2f}s")
    _save(timing_path, timing)
    return {s["id"]: timing[s["id"]] for s in episode["scenes"]}
