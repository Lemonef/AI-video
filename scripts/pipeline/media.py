"""Thin wrappers over ffmpeg/ffprobe."""
import json
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
