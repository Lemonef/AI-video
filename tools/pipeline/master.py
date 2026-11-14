"""Loudness-master the render to TikTok's playback level; the video stream is copied untouched."""
import json
import re
import subprocess
from pathlib import Path

TARGET_LUFS = -14  # short-video platforms normalise near here; quieter uploads sound weak
TRUE_PEAK_DB = -1.5
TARGET_LRA = 11


def _filter(extra: str = "") -> str:
    return f"loudnorm=I={TARGET_LUFS}:TP={TRUE_PEAK_DB}:LRA={TARGET_LRA}{extra}"


def measure(raw: Path) -> dict:
    """First pass: loudnorm's own stats, fed back so the second pass can apply one linear gain."""
    err = subprocess.run(
        ["ffmpeg", "-hide_banner", "-i", str(raw), "-af", _filter(":print_format=json"), "-f", "null", "-"],
        capture_output=True, text=True, encoding="utf-8", errors="replace", check=True, stdin=subprocess.DEVNULL,
    ).stderr
    return json.loads(re.findall(r"\{[^{}]*\}", err)[-1])


def master(raw: Path, out: Path) -> Path:
    # single-pass loudnorm runs in dynamic mode and guesses: lift02 landed at -12.9 against -14.
    # Two passes with linear=true apply one measured gain, so the master lands on target
    m = measure(raw)
    second = (f":measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}"
              f":measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true")
    subprocess.run(
        ["ffmpeg", "-y", "-v", "error", "-i", str(raw), "-af", _filter(second),
         "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-ar", "48000", str(out)],
        check=True, stdin=subprocess.DEVNULL,
    )
    return out
