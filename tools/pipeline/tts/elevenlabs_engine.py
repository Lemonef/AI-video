"""ElevenLabs whole-take Thai speech with provider character alignment, cached locally.

Credentials are read only from the environment or ~/.secrets; provider failures never
silently switch voices/models. Free-plan output is an audition until usage rights are resolved.
"""
import base64
from dataclasses import asdict
import json
import os
from pathlib import Path
import re
import urllib.error
import urllib.request

from .word import Word

KEY_FILE = Path.home() / ".secrets" / "elevenlabs_api_key"


def alignment_words(alignment: dict, speed: float = 1.0) -> list[Word]:
    """Keep exact provider character timings, including Thai combining marks.

    Existing caption/cue alignment matches joined letters, so it accepts these finer
    units without relying on English whitespace or inventing Thai word boundaries.
    """
    chars = alignment.get("characters", [])
    starts = alignment.get("character_start_times_seconds", [])
    ends = alignment.get("character_end_times_seconds", [])
    if not len(chars) == len(starts) == len(ends):
        raise ValueError("ElevenLabs returned mismatched character alignment arrays")
    words = []
    last = 0.0
    for char, start, end in zip(chars, starts, ends):
        if start < last - .001 or end < start:
            raise ValueError("ElevenLabs returned invalid character timing order")
        last = start
        if re.search(r"[\u0e00-\u0e7fA-Za-z0-9]", char):
            words.append(Word(char, start / speed, end / speed))
    if not words:
        raise ValueError("ElevenLabs returned no usable speech alignment")
    return words


class ElevenLabsTtsEngine:
    name = "elevenlabs"
    whole_take = True
    model: str | None = None
    settings: dict | None = None

    def synthesize(self, text: str, voice: str, rate: str, out_path: Path) -> list[Word]:
        key = os.environ.get("ELEVENLABS_API_KEY") or (KEY_FILE.read_text().strip() if KEY_FILE.exists() else "")
        if not key:
            raise RuntimeError(f"No ElevenLabs key: save it locally at {KEY_FILE}")
        body = {
            "text": text,
            "model_id": self.model or "eleven_v3",
            "language_code": "th",
            "voice_settings": self.settings or {"stability": .5, "similarity_boost": .75},
        }
        req = urllib.request.Request(
            f"https://api.elevenlabs.io/v1/text-to-speech/{voice}/with-timestamps?output_format=mp3_44100_128",
            data=json.dumps(body, ensure_ascii=False).encode("utf-8"),
            headers={"xi-api-key": key, "Content-Type": "application/json"},
        )
        try:
            with urllib.request.urlopen(req, timeout=180) as response:
                result = json.load(response)
                request_id = response.headers.get("request-id")
        except urllib.error.HTTPError as error:
            detail = error.read().decode("utf-8", errors="replace").replace(key, "[REDACTED]")
            raise RuntimeError(f"ElevenLabs HTTP {error.code}: {detail}") from None
        audio = base64.b64decode(result["audio_base64"], validate=True)
        alignment = result.get("normalized_alignment") or result.get("alignment") or {}
        words = alignment_words(alignment)
        out_path.write_bytes(audio)
        out_path.with_suffix(".alignment.json").write_text(json.dumps({
            "provider": "elevenlabs", "voice": voice, "model": body["model_id"],
            "request_id": request_id, "alignment": alignment,
            "words": [asdict(w) for w in words],
        }, ensure_ascii=False), encoding="utf-8")
        return words

    @staticmethod
    def cached_words(raw: Path, speed: float) -> list[Word]:
        path = raw.with_suffix(".alignment.json")
        if not path.exists():
            return []
        return alignment_words(json.loads(path.read_text(encoding="utf-8"))["alignment"], speed)
