"""Contract: the loudness master lands on TARGET_LUFS even when the mix has long quiet gaps.

Single-pass ffmpeg loudnorm runs in dynamic mode and guesses; on lift02 (66 s, voice with pauses)
it landed at -12.9 LUFS against a -14 target. A measured two-pass master is exact to a few tenths.
"""
import json
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "scripts"))

from pipeline.master import TARGET_LUFS, master  # noqa: E402

TOLERANCE_LU = 0.5


def integrated_lufs(path: Path) -> float:
    out = subprocess.run(["ffmpeg", "-hide_banner", "-i", str(path), "-af", "ebur128=framelog=quiet", "-f", "null", "-"],
                         capture_output=True, text=True, encoding="utf-8", errors="replace", stdin=subprocess.DEVNULL).stderr
    return float(re.findall(r"I:\s+(-?[\d.]+) LUFS", out)[-1])


def make_gappy_clip(path: Path) -> None:
    # loud bursts separated by near-silence: the shape that fools single-pass loudnorm
    audio = ("aevalsrc='if(lt(mod(t,4),1.5),0.6*sin(2*PI*220*t)+0.3*sin(2*PI*660*t),0.002*sin(2*PI*90*t))'"
             ":s=48000:d=40")
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-f", "lavfi", "-i", "color=c=black:s=320x568:r=30:d=40",
                    "-f", "lavfi", "-i", audio, "-shortest", "-c:v", "libx264", "-c:a", "aac", str(path)], check=True, stdin=subprocess.DEVNULL)


def test_master_hits_target_on_gappy_mix(tmp_path):
    raw = tmp_path / "raw.mp4"
    make_gappy_clip(raw)
    out = master(raw, tmp_path / "out.mp4")
    assert abs(integrated_lufs(out) - TARGET_LUFS) <= TOLERANCE_LU


def test_video_stream_is_copied(tmp_path):
    raw = tmp_path / "raw.mp4"
    make_gappy_clip(raw)
    out = master(raw, tmp_path / "out.mp4")
    probe = lambda p: json.loads(subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries",
                                                 "stream=codec_name,nb_frames", "-of", "json", str(p)],
                                                capture_output=True, text=True, stdin=subprocess.DEVNULL).stdout)["streams"][0]
    assert probe(out) == probe(raw)


REAL_RAW = ROOT / ".build" / "lift02.raw.mp4"  # local render, git-ignored: the mix that exposed the miss


def test_master_hits_target_on_real_episode(tmp_path):
    import pytest
    if not REAL_RAW.exists():
        pytest.skip("no local lift02 render")
    out = master(REAL_RAW, tmp_path / "out.mp4")
    assert abs(integrated_lufs(out) - TARGET_LUFS) <= TOLERANCE_LU
