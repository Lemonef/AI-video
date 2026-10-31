"""A unity-speed pause edit must preserve the full audio/video clock, including the tail."""
import json
from pathlib import Path
import subprocess
import sys


def test_unity_speed_edit_preserves_audio_tail(tmp_path):
    src, out, measurement = (tmp_path / n for n in ("source.mp4", "edited.mp4", "gaps.json"))
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-f", "lavfi", "-i",
                    "color=c=black:s=32x32:r=30:d=1.2", "-f", "lavfi", "-i",
                    "sine=frequency=440:sample_rate=48000:duration=1.2",
                    "-c:v", "libx264", "-c:a", "aac", str(src)], check=True)
    measurement.write_text(json.dumps({"safe_gaps": []}))
    script = Path(__file__).resolve().parents[1] / "scripts" / "repair_delivery_pauses.py"
    subprocess.run([sys.executable, str(script), "--source", str(src), "--measurement",
                    str(measurement), "--out", str(out), "--speed", "1"], check=True, capture_output=True)
    streams = json.loads(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries",
                         "stream=codec_type,duration", "-of", "json", str(out)]))["streams"]
    durations = {s["codec_type"]: float(s["duration"]) for s in streams}
    assert abs(durations["video"] - 1.2) < .001
    assert abs(durations["audio"] - 1.2) < .02
