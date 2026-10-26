"""Voice every scene of an episode and write public/<ep>/timing.json (cached per line)."""
import hashlib
import json
from dataclasses import asdict
from pathlib import Path

from . import media
from .captions import build_cues
from .tts import TtsEngine, Word


def _line_key(engine: TtsEngine, voice: str, rate: str, say: str) -> str:
    return hashlib.sha1(f"{engine.name}|{voice}|{rate}|{say}".encode("utf-8")).hexdigest()[:16]


def narrate(episode: dict, engine: TtsEngine, public_dir: Path, force: bool = False) -> dict:
    """Return {scene_id: {audio, duration, cues}}; re-voices only lines whose text/voice changed."""
    ep_dir = public_dir / episode["id"]
    ep_dir.mkdir(parents=True, exist_ok=True)
    timing_path = ep_dir / "timing.json"
    cache = {} if force or not timing_path.exists() else json.loads(timing_path.read_text(encoding="utf-8"))
    voice, rate = episode["voice"], episode.get("rate", "+0%")

    timing: dict = {}
    for scene in episode["scenes"]:
        sid, say = scene["id"], scene["say"]
        key = _line_key(engine, voice, rate, say)
        mp3 = ep_dir / f"{sid}.mp3"
        old = cache.get(sid)
        if old and old.get("key") == key and mp3.exists():
            words = [Word(**w) for w in old["words"]]
            print(f"  = {sid} (cached)")
        else:
            print(f"  > {sid}: voicing…", flush=True)
            words = engine.synthesize(say, voice, rate, mp3)
        dur = media.duration(mp3)
        cues = build_cues(scene.get("caption", say), words, dur)
        timing[sid] = {
            "key": key,
            "audio": f"{episode['id']}/{sid}.mp3",
            "duration": dur,
            "words": [asdict(w) for w in words],
            "cues": [asdict(c) for c in cues],
        }
    timing_path.write_text(json.dumps(timing, ensure_ascii=False, indent=1), encoding="utf-8")
    return timing
