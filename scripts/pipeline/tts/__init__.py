"""TTS strategy seam: every voice engine implements TtsEngine; get_engine() picks one by name.

Adding a voice (Google Chirp, F5-TTS-THAI, ...) = one new file + one line in ENGINES.
"""
from pathlib import Path
from typing import Protocol

from .word import Word


class TtsEngine(Protocol):
    name: str

    def synthesize(self, text: str, voice: str, rate: str, out_path: Path) -> list[Word]:
        """Write speech for `text` to out_path (mp3) and return word timings (may be empty)."""
        ...


def get_engine(name: str) -> TtsEngine:
    if name == "edge":
        from .edge_engine import EdgeTtsEngine

        return EdgeTtsEngine()
    raise ValueError(f"unknown TTS engine {name!r} (known: edge)")


__all__ = ["TtsEngine", "Word", "get_engine"]
