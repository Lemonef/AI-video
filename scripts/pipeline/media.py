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


MONSTER_PITCH = 0.72  # the creature's words: pitched down this far (length kept)
MONSTER_ECHO = "aecho=0.8:0.6:70|140:0.35|0.2"  # a little space around it, as if not quite human


def monster(path: Path, start: float) -> None:
    """Re-voice the clip from `start` (s) as the creature: lower pitch, same length, a faint echo.

    asetrate drops pitch AND slows down; atempo then restores the length, so every timing
    computed from the original clip (cuts, cues, captions) stays valid.
    """
    sr = 48000  # cut() writes every clip at 48 kHz
    tmp = path.with_suffix(".monster.mp3")
    graph = (
        f"[0:a]atrim=0:{start:.3f},asetpts=PTS-STARTPTS[head];"
        f"[0:a]atrim={start:.3f},asetpts=PTS-STARTPTS,asetrate={sr * MONSTER_PITCH:.0f},aresample={sr},"
        f"atempo={1 / MONSTER_PITCH:.4f},{MONSTER_ECHO}[tail];"
        "[head][tail]concat=n=2:v=0:a=1[out]"
    )
    length = duration(path)  # the echo tail would lengthen the clip; the scene timing is the original's
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(path), "-filter_complex", graph, "-map", "[out]", "-ar", str(sr), "-t", f"{length:.3f}", str(tmp)], check=True)
    tmp.replace(path)


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
