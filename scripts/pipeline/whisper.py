"""Word timings from Whisper (faster-whisper on CPU). Used to align one-take narration and to check what was said."""
import subprocess
from functools import lru_cache

import numpy as np

from .tts.word import Word

MODEL = "small"  # enough for Thai alignment/check-listening on CPU; "medium" is slower, slightly better
SAMPLE_RATE = 16_000


def load_audio(path: str) -> np.ndarray:
    # ffmpeg decode instead of faster-whisper's PyAV loader, which breaks on Python 3.14.
    pcm = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", path, "-f", "s16le", "-ac", "1", "-ar", str(SAMPLE_RATE), "-"],
        capture_output=True, check=True,
    ).stdout
    return np.frombuffer(pcm, np.int16).astype(np.float32) / 32768


@lru_cache(maxsize=1)
def _model():
    from faster_whisper import WhisperModel

    return WhisperModel(MODEL, device="cpu", compute_type="int8")


# Without these, Whisper can hallucinate whole stretches (seen: 30 s of English gibberish over a
# Thai take). VAD skips non-speech, no self-conditioning stops errors snowballing, a Thai prompt
# anchors the language.
DECODE = {"vad_filter": True, "condition_on_previous_text": False, "temperature": 0.0, "initial_prompt": "เรื่องเล่าภาษาไทย"}


def transcribe(path: str, language: str = "th"):
    segments, _ = _model().transcribe(load_audio(path), language=language, word_timestamps=True, **DECODE)
    return list(segments)


def words(path: str, language: str = "th") -> list[Word]:
    return [Word(w.word.strip(), w.start, w.end) for s in transcribe(path, language) for w in (s.words or []) if w.word.strip()]
