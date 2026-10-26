"""EdgeTtsEngine: free Microsoft neural voices via edge-tts (th-TH-PremwadeeNeural / NiwatNeural).

The endpoint is unofficial and flaky: identical requests fail at random with NoAudioReceived,
so every call retries with backoff. Digits fail every time for Thai voices -> rejected up front.
"""
import asyncio
import re
import time
from pathlib import Path

import aiohttp
import edge_tts
from edge_tts.exceptions import NoAudioReceived

from .word import Word

MAX_ATTEMPTS = 10
BACKOFF_SEC = 1.5
TICKS_PER_SEC = 10_000_000  # edge-tts offsets are in 100 ns units


class EdgeTtsEngine:
    name = "edge"

    def synthesize(self, text: str, voice: str, rate: str, out_path: Path) -> list[Word]:
        if voice.startswith("th-") and re.search(r"\d", text):
            raise ValueError(f"Thai edge voices cannot read digits; spell numbers out in `say`: {text!r}")
        last_err: Exception | None = None
        for attempt in range(1, MAX_ATTEMPTS + 1):
            try:
                audio, words = asyncio.run(self._once(text, voice, rate))
                out_path.write_bytes(audio)
                return words
            except (NoAudioReceived, aiohttp.ClientError) as e:
                last_err = e
                time.sleep(BACKOFF_SEC * attempt)
        raise RuntimeError(f"edge-tts gave no audio after {MAX_ATTEMPTS} tries: {text!r}") from last_err

    @staticmethod
    async def _once(text: str, voice: str, rate: str) -> tuple[bytes, list[Word]]:
        comm = edge_tts.Communicate(text, voice, rate=rate, boundary="WordBoundary")
        audio = bytearray()
        words: list[Word] = []
        async for chunk in comm.stream():
            if chunk["type"] == "audio":
                audio += chunk["data"]
            elif chunk["type"] == "WordBoundary":
                start = chunk["offset"] / TICKS_PER_SEC
                words.append(Word(chunk["text"], start, start + chunk["duration"] / TICKS_PER_SEC))
        return bytes(audio), words
