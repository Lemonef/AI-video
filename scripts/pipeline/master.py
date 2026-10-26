"""Loudness-master the render to TikTok's playback level; the video stream is copied untouched."""
import subprocess
from pathlib import Path

TARGET_LUFS = -14  # short-video platforms normalise near here; quieter uploads sound weak
TRUE_PEAK_DB = -1.5


def master(raw: Path, out: Path) -> None:
    subprocess.run(
        ["ffmpeg", "-y", "-v", "error", "-i", str(raw),
         "-af", f"loudnorm=I={TARGET_LUFS}:TP={TRUE_PEAK_DB}:LRA=11",
         "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-ar", "48000", str(out)],
        check=True,
    )
