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
