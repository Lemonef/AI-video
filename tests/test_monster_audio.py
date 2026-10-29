import subprocess
import sys
from pathlib import Path

import numpy as np
import pytest

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "scripts"))
from pipeline import media


def dominant(samples, start, end):
    section = samples[int(start * 48000):int(end * 48000)]
    spectrum = abs(np.fft.rfft(section * np.hanning(len(section))))
    return np.fft.rfftfreq(len(section), 1 / 48000)[np.argmax(spectrum)]


def test_deep_voice_preserves_word_times_and_surrounding_narrator(tmp_path):
    path = tmp_path / "voice.mp3"
    media.synth("aevalsrc='sin(2*PI*if(lt(t,1),440,if(lt(t,2),660,880))*t)':d=3", path)
    before = media.duration(path)
    reported = media.monster(path, 0.8, 1.8, preserve_timing=True)
    assert reported == before
    assert abs(media.duration(path) - before) < 0.05
    pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", str(path), "-f", "f32le", "-ar", "48000", "-ac", "1", "-"], capture_output=True, check=True).stdout
    samples = np.frombuffer(pcm, dtype=np.float32)
    assert dominant(samples, .2, .5) == pytest.approx(440, abs=10)
    assert dominant(samples, 1.1, 1.5) == pytest.approx(660 * .82, abs=10)
    assert dominant(samples, 2.3, 2.7) == pytest.approx(880, abs=10)


def test_entire_character_line_can_be_deep_without_an_empty_head_error(tmp_path):
    path = tmp_path / "voice.mp3"
    media.synth("sine=frequency=440:duration=1", path)
    before = media.duration(path)
    media.monster(path, 0, before, preserve_timing=True)
    assert abs(media.duration(path) - before) < 0.05
