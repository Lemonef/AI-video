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


MONSTER_PITCH = 0.72  # the creature's words: deeper AND slower by this rate (0.72 -> ~1.4x as long)
MONSTER_ECHO = "aecho=0.8:0.6:70|140:0.35|0.2"  # a little space around it, as if not quite human


def monster(path: Path, start: float, end: float | None = None, *, preserve_timing: bool = False) -> float:
    """Re-voice `start`..`end` (s; to the clip's end when None) as the creature: slowed and
    deepened together (asetrate alone, the classic slowed-tape demon voice), a faint echo; the
    narration after it stays as it was. The narrator says a punch word fast; keeping its length
    made it a blur, so the clip grows. With preserve_timing=True, lower the pitch
    without stretching speech or caption timing. Returns the clip's length."""
    if preserve_timing:
        # A subtle lower pitch, with tempo restored before adding a short, quiet room tail.
        # Trim the echo to the original span: it must not delay the next word or scene.
        original_length = duration(path)
        stop = end if end is not None else original_length
        pitch = 0.82
        tmp = path.with_suffix(".monster.mp3")
        graph = (
            f"[0:a]atrim=0:{start:.6f},asetpts=PTS-STARTPTS[head];"
            f"[0:a]atrim={start:.6f}:{stop:.6f},asetpts=PTS-STARTPTS,"
            f"asetrate={48000 * pitch:.0f},aresample=48000,atempo={1 / pitch:.9f},"
            f"aecho=0.8:0.8:55:0.12,apad,atrim=duration={stop - start:.6f}[mid];"
            f"[0:a]atrim={stop:.6f},asetpts=PTS-STARTPTS[tail];"
            f"[head][mid][tail]concat=n=3:v=0:a=1,apad,atrim=duration={original_length:.6f}[out]"
        )
        subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(path), "-filter_complex", graph, "-map", "[out]", "-ar", "48000", str(tmp)], check=True)
        tmp.replace(path)
        return original_length
    sr = 48000  # cut() writes every clip at 48 kHz
    tmp = path.with_suffix(".monster.mp3")
    span = f"{start:.3f}:{end:.3f}" if end is not None else f"{start:.3f}"
    parts = ["[0:a]atrim=0:{:.3f},asetpts=PTS-STARTPTS[head]".format(start),
             f"[0:a]atrim={span},asetpts=PTS-STARTPTS,asetrate={sr * MONSTER_PITCH:.0f},aresample={sr},{MONSTER_ECHO}[mid]"]
    if end is not None:
        parts.append(f"[0:a]atrim={end:.3f},asetpts=PTS-STARTPTS[tail]")
    labels = "[head][mid][tail]" if end is not None else "[head][mid]"
    graph = ";".join(parts) + f";{labels}concat=n={labels.count('[')}:v=0:a=1[out]"
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(path), "-filter_complex", graph, "-map", "[out]", "-ar", str(sr), str(tmp)], check=True)
    tmp.replace(path)
    return duration(path)


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
