"""Thin wrappers over ffmpeg/ffprobe."""
import json
import re
import subprocess
from pathlib import Path


def duration(path: Path) -> float:
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "json", str(path)],
        check=True, capture_output=True, text=True,
    ).stdout
    return float(json.loads(out)["format"]["duration"])


def synth(expr: str, out: Path) -> None:
    """Render an ffmpeg lavfi filter expression to a 48 kHz stereo wav."""
    subprocess.run(
        ["ffmpeg", "-y", "-v", "error", "-f", "lavfi", "-i", expr, "-ar", "48000", "-ac", "2", str(out)],
        check=True,
    )


def cut(src: Path, start: float, end: float, out: Path) -> None:
    """Cut [start, end) seconds of `src` into `out` (re-encoded, so cuts are sample-accurate)."""
    subprocess.run(
        ["ffmpeg", "-y", "-v", "error", "-ss", f"{start:.3f}", "-to", f"{end:.3f}", "-i", str(src), "-ar", "48000", str(out)],
        check=True,
    )


SILENCE_DB = -35  # quieter than this counts as a pause
SILENCE_MIN_SEC = 0.12


def silences(path: Path) -> list[tuple[float, float]]:
    """(start, end) of every pause in the audio, via ffmpeg silencedetect."""
    log = subprocess.run(
        ["ffmpeg", "-v", "info", "-i", str(path), "-af", f"silencedetect=noise={SILENCE_DB}dB:d={SILENCE_MIN_SEC}", "-f", "null", "-"],
        capture_output=True, text=True, check=True,
    ).stderr
    starts = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", log)]
    ends = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", log)]
    return list(zip(starts, ends))


def tempo(src: Path, factor: float, out: Path) -> None:
    """Speed speech up/down without changing pitch (ffmpeg atempo)."""
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(src), "-af", f"atempo={factor}", str(out)], check=True)
