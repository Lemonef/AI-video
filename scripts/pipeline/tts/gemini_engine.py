"""GeminiTtsEngine: Google Gemini TTS (expressive, inline [tone] tags, natural Thai phrasing).

Returns no word timings: narration is voiced as ONE take per episode and aligned afterwards
(pipeline/take.py + Whisper). Free tier = 10 requests/day PER MODEL, so on a quota error the
next model in MODELS is tried; each has its own daily allowance.
"""
import base64
import json
import os
import subprocess
import urllib.error
import urllib.request
from pathlib import Path

from .word import Word

MODELS = ("gemini-3.8-flash-tts", "gemini-3.1-flash-tts-preview", "gemini-2.5-flash-preview-tts")
ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
KEY_FILE = Path.home() / ".secrets" / "gemini_api_key"
PCM_RATE = 24_000  # raw PCM output when the response has no WAV header
TIMEOUT_SEC = 300


def _api_key() -> str:
    key = os.environ.get("GEMINI_API_KEY") or (KEY_FILE.read_text().strip() if KEY_FILE.exists() else "")
    if not key:
        raise RuntimeError(f"no Gemini key: set GEMINI_API_KEY or put it in {KEY_FILE}")
    return key


class GeminiTtsEngine:
    name = "gemini"
    whole_take = True  # voice the episode in one request; see pipeline/take.py

    def synthesize(self, text: str, voice: str, rate: str, out_path: Path) -> list[Word]:
        # `rate` is edge-specific; Gemini pacing is steered by [tags] in the text instead.
        body = {
            "contents": [{"parts": [{"text": text}]}],
            "generationConfig": {
                "responseModalities": ["AUDIO"],
                "speechConfig": {"voiceConfig": {"prebuiltVoiceConfig": {"voiceName": voice}}},
            },
        }
        errors = []
        for model in MODELS:
            req = urllib.request.Request(
                ENDPOINT.format(model=model),
                data=json.dumps(body).encode(),
                headers={"Content-Type": "application/json", "x-goog-api-key": _api_key()},
            )
            try:
                data = json.load(urllib.request.urlopen(req, timeout=TIMEOUT_SEC))
            except urllib.error.HTTPError as e:
                errors.append(f"{model}: HTTP {e.code}")
                if e.code in (429, 404):  # quota spent / model retired -> try the next one
                    continue
                raise
            audio = base64.b64decode(data["candidates"][0]["content"]["parts"][0]["inlineData"]["data"])
            self._write_mp3(audio, out_path)
            print(f"    (gemini model: {model}, voice: {voice})")
            return []
        raise RuntimeError("all Gemini TTS models refused: " + "; ".join(errors))

    @staticmethod
    def _write_mp3(audio: bytes, out_path: Path) -> None:
        raw = out_path.with_suffix(".bin")
        raw.write_bytes(audio)
        src = ["-i", str(raw)] if audio[:4] == b"RIFF" else ["-f", "s16le", "-ar", str(PCM_RATE), "-ac", "1", "-i", str(raw)]
        try:
            subprocess.run(["ffmpeg", "-y", "-v", "error", *src, str(out_path)], check=True)
        finally:
            raw.unlink(missing_ok=True)
