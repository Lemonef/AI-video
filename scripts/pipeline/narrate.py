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

from . import gemini_align, media, whisper
from .align import _norm, scene_cuts, spoken_len, words_in
from .captions import build_cues
from .tts import TtsEngine, Word


MIN_COVERAGE = 0.7  # below this share of the script's letters, the transcript is not trusted for cutting
PAUSE_TOLERANCE_SEC = 0.3  # Gemini's line starts are ~0.1-0.3 s loose; a pause ending this soon after still counts as "before"
MAX_PAUSE_GAP_SEC = 0.8  # if the nearest pause before a line start is further back than this, cut at the start itself
MIN_LINE_SEC = 0.5  # a line start this close to the end of the take cannot be real


def _key(*parts: str) -> str:
    return hashlib.sha1("|".join(parts).encode("utf-8")).hexdigest()[:16]


def _line(scene: dict) -> str:
    """Spoken line with its optional delivery tag, e.g. "[whispers] ..."."""
    tone = scene.get("tone")
    return f"[{tone}] {scene['say']}" if tone else scene["say"]


def _entry(episode: dict, scene: dict, key: str, words: list[Word], duration: float, speech: list[float] | None = None) -> dict:
    cues = build_cues(scene.get("caption", scene["say"]), words, duration, (speech[0], speech[1]) if speech else None)
    return {
        "key": key,
        "letters": spoken_len(scene["say"]),  # with duration + tempo: the measured speaking rate
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


def _take_keys(episode: dict, engine: TtsEngine) -> tuple[list[str], str, str]:
    lines = [_line(s) for s in episode["scenes"]]
    script = "\n".join(lines)  # newline = natural breath between lines
    voice_key = _key(engine.name, episode["voice"], script)  # the quota'd part: only re-voice when this changes
    return lines, script, voice_key


def needs_voicing(episode: dict, engine: TtsEngine, public_dir: Path) -> bool:
    """True when building this episode would spend a TTS request (whole-take engines only)."""
    if not engine.whole_take:
        return False
    ep_dir = public_dir / episode["id"]
    timing_path = ep_dir / "timing.json"
    if not (timing_path.exists() and (ep_dir / "take.raw.mp3").exists()):
        return True
    cached = json.loads(timing_path.read_text(encoding="utf-8")).get("_take", {})
    return cached.get("voice_key") != _take_keys(episode, engine)[2]


def measured_rate(public_dir: Path) -> float | None:
    """Spoken letters per second at tempo 1.0, measured across every voiced take on disk."""
    letters = seconds = 0.0
    for path in public_dir.glob("*/timing.json"):
        timing = json.loads(path.read_text(encoding="utf-8"))
        tempo = timing.get("_take", {}).get("tempo")
        if not tempo:
            continue
        for sid, entry in timing.items():
            if sid != "_take" and entry.get("letters"):
                letters += entry["letters"]
                seconds += entry["duration"] * tempo
    return letters / seconds if seconds else None


def word_start(say: str, word: str, words: list[Word], speech: list[float] | None) -> float | None:
    """Seconds into the clip where `word` begins: from Whisper's words when present (matched on
    joined letters, as src/lib/cueAt.ts does), else by its letter position across the spoken span."""
    target = _norm(word)
    if words:
        joined, starts = "", []
        for w in words:
            starts.append(len(joined))
            joined += _norm(w.text)
        idx = joined.find(target)
        if idx >= 0:
            k = max(i for i, s in enumerate(starts) if s <= idx)
            return words[k].start
    line = _norm(say)
    idx = line.find(target)
    if idx < 0 or not speech:
        return None
    return speech[0] + (speech[1] - speech[0]) * idx / len(line)


def _repair_starts(starts: list[float], letters: list[int], take_sec: float, pauses: list[tuple[float, float]]) -> tuple[list[float], int]:
    """Keep plausible starts (inside the take, after the previous one); re-estimate the rest
    between their nearest good neighbours, in proportion to letters, then take the nearest pause
    (a line starts just after one). Good anchors beat a whole-take guess."""
    good, last = [True], 0.0
    for s in starts[1:]:  # compare with the last GOOD start, so one invented time spoils only itself
        ok = last < s < take_sec - MIN_LINE_SEC
        good.append(ok)
        last = s if ok else last
    fixed = [0.0 if i == 0 else s for i, s in enumerate(starts)]
    for i, ok in enumerate(good):
        if ok:
            continue
        lo = max(j for j in range(i) if good[j])
        hi = next((j for j in range(i + 1, len(starts)) if good[j]), None)
        t_lo, t_hi = fixed[lo], (starts[hi] if hi is not None else take_sec)
        span = letters[lo : hi if hi is not None else len(letters)]
        est = t_lo + (t_hi - t_lo) * sum(letters[lo:i]) / max(1, sum(span))
        ends = [b for a, b in pauses if t_lo < b < t_hi] or [est]
        fixed[i] = min(ends, key=lambda b: abs(b - est))
    return fixed, good.count(False)


def _cuts_from_starts(starts: list[float], take_sec: float, pauses: list[tuple[float, float]]) -> list[tuple[float, float]]:
    """Scene (start, end) from each line's start: a cut sits in the pause just BEFORE a line starts
    (searching back from the start, since a line begins right after its pause)."""
    breaks = []
    for s in starts[1:]:
        before = [(a, b) for a, b in pauses if b <= s + PAUSE_TOLERANCE_SEC]
        a, b = before[-1] if before else (s, s)
        breaks.append((a + b) / 2 if s - b <= MAX_PAUSE_GAP_SEC else s)
    begins = [0.0, *breaks]
    return list(zip(begins, [*breaks, take_sec]))


def speech_span(start: float, end: float, pauses: list[tuple[float, float]]) -> list[float]:
    """[first, last] second of speech inside the clip [start, end): the cut pauses at its edges trimmed."""
    lead = next((b - start for a, b in pauses if a <= start < b), 0.0)
    tail = next((a - start for a, b in pauses if a < end <= b), end - start)
    return [round(max(0.0, lead), 3), round(max(lead, tail), 3)]


def _narrate_take(episode: dict, engine: TtsEngine, ep_dir: Path, timing_path: Path, cache: dict) -> dict:
    voice = episode["voice"]
    lines, script, voice_key = _take_keys(episode, engine)
    speed = float(episode.get("tempo", 1.0))
    key = _key(voice_key, str(speed))
    raw = ep_dir / "take.raw.mp3"
    take = ep_dir / "take.mp3"
    take_meta = cache.get("_take", {})
    if take_meta.get("voice_key") == voice_key and raw.exists():
        print("  = take voice (cached)")
    else:
        print(f"  > take: voicing {len(lines)} lines in one request…", flush=True)
        tmp = ep_dir / "take.tmp.mp3"
        if hasattr(engine, "model"):
            engine.model = episode.get("voiceModel")  # no silent fallback to a different-sounding model
        engine.synthesize(script, voice, "", tmp)
        tmp.replace(raw)
    if take_meta.get("key") == key and take.exists() and take_meta.get("tempo"):
        words = [Word(**w) for w in take_meta["words"]]
        print("  = take alignment (cached)")
    else:
        media.tempo(raw, speed, take)
        print(f"  > take: tempo x{speed}, aligning with Whisper…", flush=True)
        try:
            words = whisper.words(str(take))
        except (ImportError, OSError) as e:
            # e.g. Windows Smart App Control blocking faster-whisper's native DLLs. Fall back to cuts
            # placed by script length and snapped to the take's real pauses; captions spread per line.
            print(f"  ! Whisper unavailable ({type(e).__name__}): aligning by pauses only, word cues placed by letter position")
            words = []
    heard = sum(spoken_len(w.text) for w in words)
    expected = sum(spoken_len(line) for line in lines)
    if words and heard < MIN_COVERAGE * expected:
        raise RuntimeError(f"Whisper heard {heard}/{expected} letters of the script: transcript unusable, cuts would be wrong")
    take_sec = media.duration(take)
    timing: dict = {"_take": {"key": key, "voice_key": voice_key, "tempo": speed, "words": [asdict(w) for w in words], "duration": take_sec}}
    pauses = media.silences(take)
    line_starts = None
    if not words:  # no transcript: ask Gemini when each line starts (cached with the alignment)
        line_starts = take_meta.get("line_starts") if take_meta.get("key") == key else None
        line_starts = line_starts or gemini_align.line_starts(take, lines)
        timing["_take"]["line_starts"] = line_starts
    cuts = scene_cuts(lines, words, take_sec, pauses)
    if line_starts:
        # Gemini can invent a time (ep02: 104 s in a 71 s take): keep only starts that fall inside
        # the take, after the previous line; any other line keeps its pause-based cut.
        fixed, bad = _repair_starts(line_starts, [spoken_len(line) for line in lines], take_sec, pauses)
        cuts = _cuts_from_starts(fixed, take_sec, pauses)
        print(f"  = cuts from Gemini line starts, snapped to pauses ({bad} implausible start(s) replaced by the pause guess)")
    for scene, (start, end) in zip(episode["scenes"], cuts):
        mp3 = ep_dir / f"{scene['id']}.mp3"
        media.cut(take, start, end, mp3)
        speech = None if words else speech_span(start, end, pauses)
        timing[scene["id"]] = _entry(episode, scene, key, words_in(words, start, end), end - start, speech)
        if speech:  # word cues are then placed by letter position across the spoken part (see src/lib/cueAt.ts)
            timing[scene["id"]]["say"] = scene["say"]
            timing[scene["id"]]["speech"] = speech
        if scene.get("monster"):  # the creature's own words, from this one to the end of the line
            at = word_start(scene["say"], scene["monster"], words_in(words, start, end), speech)
            if at is not None:
                media.monster(mp3, at)
        print(f"  ✓ {scene['id']}: {start:5.2f}–{end:5.2f}s")
    _save(timing_path, timing)
    return {s["id"]: timing[s["id"]] for s in episode["scenes"]}
