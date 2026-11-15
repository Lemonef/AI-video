"""Line starts from Gemini when Whisper is unavailable (Windows Smart App Control blocks it).

Without a transcript the cuts are guessed from pause lengths, and a take with dramatic pauses
inside lines fools that (ep02: the cut landed one pause early and every scene after it drifted).
Gemini's text model hears the take and is given the script, so it only has to say WHEN each
numbered line starts - forced alignment, not transcription. Free tier, separate from TTS quota.
"""
import base64
import json
import time
import urllib.error
import urllib.request
from pathlib import Path

from .tts.gemini_engine import _api_key

MODEL = "gemini-2.5-flash"
ENDPOINT = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent"
TIMEOUT_SEC = 180
PROMPT = (
    "This audio is a Thai narration read from the numbered script below, line by line, in order.\n"
    "Return ONLY a JSON array, one object per line: {\"line\": <number>, \"start\": <seconds from the "
    "start of the audio when that line's first word begins>}. Use decimals (e.g. 12.4).\n\nScript:\n"
)


RETRIES = 4
RETRY_BASE_SEC = 8  # busy/quota answers clear within seconds: wait 8, 16, 24 s


def _post(req: urllib.request.Request) -> dict:
    """POST with retries on 'busy' (503) and 'too many requests' (429); anything else raises."""
    for attempt in range(RETRIES):
        try:
            return json.load(urllib.request.urlopen(req, timeout=TIMEOUT_SEC))
        except urllib.error.HTTPError as e:
            if e.code not in (429, 503) or attempt == RETRIES - 1:
                raise
            time.sleep(RETRY_BASE_SEC * (attempt + 1))
    raise RuntimeError("unreachable")


def line_starts(audio: Path, lines: list[str]) -> list[float] | None:
    """Start second of each line, or None when Gemini is unavailable or the answer is unusable."""
    script = "\n".join(f"{i + 1}. {line}" for i, line in enumerate(lines))
    body = {
        "contents": [{"parts": [
            {"inline_data": {"mime_type": "audio/mp3", "data": base64.b64encode(audio.read_bytes()).decode()}},
            {"text": PROMPT + script},
        ]}],
        "generationConfig": {"responseMimeType": "application/json", "temperature": 0},
    }
    req = urllib.request.Request(ENDPOINT, data=json.dumps(body).encode(), headers={"Content-Type": "application/json", "x-goog-api-key": _api_key()})
    try:
        out = _post(req)
        rows = json.loads(out["candidates"][0]["content"]["parts"][0]["text"])
        by_line = {int(r["line"]): float(r["start"]) for r in rows}
        starts = [by_line[i + 1] for i in range(len(lines))]
    except (urllib.error.URLError, KeyError, ValueError, TypeError, json.JSONDecodeError) as e:
        print(f"  ! Gemini line alignment failed ({type(e).__name__} {getattr(e, 'code', '') or getattr(e, 'reason', '')}): falling back to pauses only")
        return None
    if any(b <= a for a, b in zip(starts, starts[1:])):  # must be read in order
        print("  ! Gemini line starts are out of order: falling back to pauses only")
        return None
    return starts
