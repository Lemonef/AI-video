"""Pinned CC0 floor/furniture/door recordings for flood02; explicit, cached build.

Run: .venv/Scripts/python.exe scripts/pipeline/flood_sfx.py
Source previews and final one-shots stay in ignored public/sfx/real/. The manifest
records identity, licence, source trim, hashes and measured onset for cue placement.
"""
from __future__ import annotations

import hashlib
import json
from pathlib import Path
import subprocess
import sys
import urllib.request

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from pipeline.freesound import _finish, _sound  # noqa: E402

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "public" / "sfx" / "real"
MANIFEST = ROOT / "docs" / "flood02-sound-assets.json"

# Source ranges selected from 20 ms RMS envelopes, before a second event begins.
# Ends lie in quiet gaps, with short edge fades after the existing normalizer.
ASSETS = {
    "step": {
        "id": 479138, "trim": [0.18, 0.85],
        "role": "A sneaker-on-linoleum footfall/rubber scuff; not leaves.",
        "approximation": "Linoleum stands in for the fictional hard corridor floor; the recording includes sneaker squeak.",
    },
    "scrape": {
        "id": 485142, "trim": [0.04, 1.928],
        "role": "Wooden furniture scrape during the cabinet push.",
        "approximation": "The source is a wooden chair on ceramic flooring, used as a cabinet-drag material substitute.",
    },
    "chair": {
        "id": 161225, "trim": [0.02, 1.55],
        "role": "First isolated plastic-chair drag; second drag excluded.",
        "approximation": "Recorded outside on stone; use quietly for the hard-floor chair move, not as an interior ambience.",
    },
    "door": {
        "id": 481789, "trim": [0.0, 0.40],
        "role": "Single metallic door-latch release at the service-door opening.",
        "approximation": "Latch release only, not a complete hinge swing or door slam.",
    },
}


def digest(path: Path) -> str:
    with path.open("rb") as stream:
        return hashlib.file_digest(stream, "sha256").hexdigest()


def measure(path: Path) -> dict:
    raw = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", str(path), "-ar", "48000", "-ac", "1", "-f", "f32le", "-"],
        check=True, capture_output=True,
    ).stdout
    samples = np.frombuffer(raw, dtype=np.float32)
    if not len(samples) or not np.isfinite(samples).all():
        raise RuntimeError(f"invalid decoded audio: {path.name}")
    block = 240  # 5 ms; absolute threshold plus relative onset both retained.
    rms = np.array([
        np.sqrt(np.mean(samples[i:i + block] ** 2))
        for i in range(0, len(samples), block)
    ])
    peak = float(np.max(np.abs(samples)))
    absolute = np.flatnonzero(rms > 10 ** (-40 / 20))
    relative = np.flatnonzero(rms > max(float(np.max(rms)) * 10 ** (-25 / 20), 1e-7))
    db = lambda value: float(20 * np.log10(max(float(value), 1e-8)))
    return {
        "decoded_duration_sec": len(samples) / 48000,
        "peak_dbfs": db(peak),
        "rms_dbfs": db(np.sqrt(np.mean(samples ** 2))),
        "onset_absolute_minus40_dbfs_sec": int(absolute[0]) * .005 if len(absolute) else None,
        "onset_relative_minus25_db_sec": int(relative[0]) * .005 if len(relative) else None,
        "first_5ms_rms_dbfs": db(rms[0]),
        "last_5ms_rms_dbfs": db(rms[-1]),
        "clip_sample_count": int(np.sum(np.abs(samples) >= 1)),
        "measurement_note": "Waveform/decode evidence; not human listening or a perceptual quality approval.",
    }


def ensure() -> dict:
    OUT.mkdir(parents=True, exist_ok=True)
    previous = json.loads(MANIFEST.read_text(encoding="utf-8")) if MANIFEST.exists() else {}
    rows = {}
    for name, spec in ASSETS.items():
        source = _sound(spec["id"])  # checks current primary CC0 metadata, fails closed otherwise.
        raw = OUT / f"flood02-{name}-{spec['id']}-source.mp3"
        if not raw.exists():
            with urllib.request.urlopen(source["previews"]["preview-hq-mp3"], timeout=90) as response:
                raw.write_bytes(response.read())
        old = previous.get("assets", {}).get(name, {})
        if old.get("source_sha256") and old["source_sha256"] != digest(raw):
            raise RuntimeError(f"cached source hash changed for {name}; inspect before replacing")
        start, end = spec["trim"]
        trimmed = OUT / f"flood02-{name}-trim.wav"
        normalized = OUT / f"flood02-{name}-normalized.mp3"
        final = OUT / f"flood02_{name}.mp3"
        subprocess.run(
            ["ffmpeg", "-y", "-v", "error", "-i", str(raw), "-af", f"atrim=start={start}:end={end},asetpts=PTS-STARTPTS", "-ar", "48000", str(trimmed)],
            check=True,
        )
        _finish(trimmed, normalized, bed=False)
        normalized_metrics = measure(normalized)
        length = normalized_metrics["decoded_duration_sec"]
        # Short files can evade integrated loudness gating. Leave encoding headroom
        # from the decoded peak rather than assuming the normalizer met its target.
        peak_gain = min(1.0, 10 ** ((-3.0 - normalized_metrics["peak_dbfs"]) / 20))
        edge = .025 if length > .5 else .012
        subprocess.run(
            ["ffmpeg", "-y", "-v", "error", "-i", str(normalized), "-af", f"volume={peak_gain:.9f},afade=t=in:d=0.003,afade=t=out:st={max(0, length - edge):.6f}:d={edge}", "-ar", "48000", "-ac", "2", "-b:a", "192k", str(final)],
            check=True,
        )
        metrics = measure(final)
        if metrics["clip_sample_count"] or metrics["decoded_duration_sec"] > 2.1:
            raise RuntimeError(f"one-shot verification failed: {name}")
        rows[name] = {
            **{key: source[key] for key in ("id", "name", "username", "url", "license", "duration")},
            "local_path": final.relative_to(ROOT).as_posix(),
            "source_preview_path": raw.relative_to(ROOT).as_posix(),
            "source_sha256": digest(raw), "output_sha256": digest(final),
            "source_trim_seconds": [start, end],
            "processing": "Source trim -> existing freesound._finish one-shot -45dB leading trim / -14LUFS target / -1.5dBTP -> reduce decoded peaks above -3dBFS -> 3ms attack and short tail fades;48kHz stereo MP3 192k.",
            "role": spec["role"], "approximation": spec["approximation"],
            "metrics": metrics,
        }
        print(f"{name}: CC0 id {source['id']}; {metrics['decoded_duration_sec']:.3f}s; peak {metrics['peak_dbfs']:.2f}dBFS; onset {metrics['onset_relative_minus25_db_sec']}s")
    manifest = {
        "episode": "flood02", "captured_date": "2026-10-31", "assets": rows,
        "provenance_note": "Primary Freesound API metadata checked per pinned id via _sound; downloaded HQ previews remain local. CC0 is asset-specific, not inferred from a search label.",
        "limits": "Source/material identification plus waveform/decode checks. Human listening/earshot semantic checks have not been performed. Mix volume and final picture sync remain production integration work.",
    }
    MANIFEST.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return manifest


if __name__ == "__main__":
    ensure()
