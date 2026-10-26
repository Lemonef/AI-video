"""TTS strategy seam: every voice engine implements TtsEngine; get_engine() picks one by name.

Adding a voice (Google Chirp, F5-TTS-THAI, ...) = one new file + one branch in get_engine().
"""
from pathlib import Path
from typing import Protocol

from .word import Word


class TtsEngine(Protocol):
    name: str
    whole_take: bool  # True = voice the whole episode in one request, then align (pipeline/take.py)

    def synthesize(self, text: str, voice: str, rate: str, out_path: Path) -> list[Word]:
        """Write speech for `text` to out_path (mp3) and return word timings (may be empty)."""
        ...


def get_engine(name: str) -> TtsEngine:
    if name == "edge":
        from .edge_engine import EdgeTtsEngine

        return EdgeTtsEngine()
    if name == "gemini":
        from .gemini_engine import GeminiTtsEngine

        return GeminiTtsEngine()
    raise ValueError(f"unknown TTS engine {name!r} (known: edge, gemini)")


__all__ = ["TtsEngine", "Word", "get_engine"]
