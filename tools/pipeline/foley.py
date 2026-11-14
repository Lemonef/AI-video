"""v3 sound library, procedural (numpy) and licence-free, written once into public/sfx/.

Beds loop seamlessly (wind, crickets, drone, rain); one-shots punctuate beats (step, click,
heartbeat, impact, boom, riser, stinger, swish). Episodes name them; src/v2/sound.ts maps names.
"""
import wave
from pathlib import Path

import numpy as np

SR = 48_000
LOOP_SEC = 12.0
SEED = 7
VERSION = "1"  # bump after changing any generator to rewrite the files


def _rng(salt: int = 0) -> np.random.Generator:
    return np.random.default_rng(SEED + salt)


def _t(sec: float) -> np.ndarray:
    return np.arange(int(sec * SR)) / SR


def _band(x: np.ndarray, lo: float, hi: float) -> np.ndarray:
    """Band-pass by zeroing FFT bins: exact and fast for whole clips."""
    spec = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    spec[(f < lo) | (f > hi)] = 0
    return np.fft.irfft(spec, len(x))


def _env(n: int, attack: float, decay: float) -> np.ndarray:
    t = np.arange(n) / SR
    return np.minimum(1, t / max(attack, 1e-4)) * np.exp(-np.maximum(0, t - attack) / decay)


def _seamless(x: np.ndarray, fade_sec: float = 1.0) -> np.ndarray:
    """Crossfade the tail into the head so the loop point is inaudible."""
    n = int(fade_sec * SR)
    ramp = np.linspace(0, 1, n)
    return np.concatenate([x[-n:] * (1 - ramp) + x[:n] * ramp, x[n:-n]])


def _norm(x: np.ndarray, peak: float) -> np.ndarray:
    return x / (np.max(np.abs(x)) + 1e-9) * peak


def _write(path: Path, left: np.ndarray, right: np.ndarray | None = None) -> None:
    right = left if right is None else right
    pcm = (np.clip(np.stack([left, right], 1), -1, 1) * 32767).astype("<i2")
    with wave.open(str(path), "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())


def _bed(gen) -> tuple[np.ndarray, np.ndarray]:
    """Stereo bed: two decorrelated renders of the same generator (wide, never phasey)."""
    return gen(0), gen(1)


# ---- beds -------------------------------------------------------------------------------

def wind(salt: int) -> np.ndarray:
    n = int((LOOP_SEC + 1) * SR)
    t = _t(n / SR)
    body = _band(_rng(salt).standard_normal(n), 70, 800)
    gust = 0.55 + 0.45 * np.sin(2 * np.pi * t / 6.5 + salt) * np.sin(2 * np.pi * t / 4.1 + 1)
    return _norm(_seamless(body * gust), 0.6)


def crickets(salt: int) -> np.ndarray:
    n = int((LOOP_SEC + 1) * SR)
    t = _t(n / SR)
    rng = _rng(10 + salt)
    out = np.zeros(n)
    for _ in range(7):  # a few insects at different pitches and rhythms
        f, rate, phase = rng.uniform(4200, 5600), rng.uniform(2.5, 4.5), rng.uniform(0, 6)
        gate = (np.sin(2 * np.pi * rate * t + phase) > 0.6).astype(float)
        trill = 0.5 + 0.5 * np.sin(2 * np.pi * 38 * t)
        out += np.sin(2 * np.pi * f * t) * gate * trill * rng.uniform(0.3, 1)
    return _norm(_seamless(_band(out, 3000, 7000)), 0.3)


def drone(salt: int) -> np.ndarray:
    n = int((LOOP_SEC + 1) * SR)
    t = _t(n / SR)
    tone = sum(np.sin(2 * np.pi * f * t + p + salt) for f, p in [(55, 0), (55.6, 1), (82.4, 2), (110.4, 0.5)])
    breath = 0.7 + 0.3 * np.sin(2 * np.pi * t / 8 + salt)
    air = _band(_rng(20 + salt).standard_normal(n), 200, 600) * 0.12
    return _norm(_seamless(tone * breath + air), 0.65)


def rain(salt: int) -> np.ndarray:
    n = int((LOOP_SEC + 1) * SR)
    rng = _rng(30 + salt)
    hiss = _band(rng.standard_normal(n), 1500, 11000) * 0.5
    drops = np.zeros(n)
    for i in rng.integers(0, n - 2000, 900):  # scattered droplets
        drops[i : i + 600] += _band(rng.standard_normal(600), 2000, 9000) * _env(600, 0.0005, 0.004) * rng.uniform(0.2, 1)
    return _norm(_seamless(hiss + drops), 0.5)


# ---- one-shots ----------------------------------------------------------------------------

def step() -> np.ndarray:
    n = int(0.2 * SR)
    crunch = _band(_rng(40).standard_normal(n), 300, 3500) * _env(n, 0.004, 0.05)
    thud = np.sin(2 * np.pi * 90 * _t(n / SR)) * _env(n, 0.002, 0.04)
    return _norm(crunch * 0.7 + thud, 0.7)


def click() -> np.ndarray:
    n = int(0.12 * SR)
    snap = _band(_rng(41).standard_normal(n), 1500, 9000) * _env(n, 0.001, 0.012)
    return _norm(snap + 0.4 * np.roll(snap, int(0.035 * SR)), 0.8)


def heartbeat() -> np.ndarray:
    n = int(0.9 * SR)
    t = _t(n / SR)
    lub = np.sin(2 * np.pi * 52 * t) * _env(n, 0.005, 0.09)
    return _norm(lub + 0.7 * np.roll(lub, int(0.28 * SR)), 0.9)


def impact() -> np.ndarray:
    n = int(1.4 * SR)
    t = _t(n / SR)
    sub = np.sin(2 * np.pi * (70 - 30 * np.minimum(1, t / 0.6)) * t) * _env(n, 0.003, 0.45)
    hit = _band(_rng(42).standard_normal(n), 100, 5000) * _env(n, 0.001, 0.06)
    return _norm(sub + 0.6 * hit, 0.95)


def boom() -> np.ndarray:
    n = int(3.0 * SR)
    t = _t(n / SR)
    sub = np.sin(2 * np.pi * (48 - 18 * np.minimum(1, t / 1.5)) * t) * _env(n, 0.01, 1.1)
    rumble = _band(_rng(43).standard_normal(n), 20, 180) * _env(n, 0.02, 0.9)
    return _norm(sub + 0.8 * rumble, 0.95)


def riser() -> np.ndarray:
    n = int(2.0 * SR)
    t = _t(n / SR)
    swell = (t / t[-1]) ** 2
    noise = _band(_rng(44).standard_normal(n), 400, 9000)
    return _norm((noise * 0.6 + np.sin(2 * np.pi * (200 + 600 * swell) * t) * 0.3) * swell, 0.8)


def stinger() -> np.ndarray:
    """Dissonant cluster + metallic scrape: the 'it found you' moment."""
    n = int(2.5 * SR)
    t = _t(n / SR)
    cluster = sum(np.sin(2 * np.pi * f * t) for f in (233, 247, 262, 466, 494)) * _env(n, 0.005, 0.9)
    scrape = _band(_rng(45).standard_normal(n), 2000, 7000) * _env(n, 0.002, 0.3)
    return _norm(cluster + 0.5 * scrape, 0.9)


def swish() -> np.ndarray:
    """Short air cut for shot changes (softer than the v2 whoosh)."""
    n = int(0.3 * SR)
    t = _t(n / SR)
    return _norm(_band(_rng(46).standard_normal(n), 900, 6000) * np.sin(np.pi * t / t[-1]) ** 3, 0.5)


BEDS = {"wind": wind, "crickets": crickets, "drone": drone, "rain": rain}
ONE_SHOTS = {"step": step, "click": click, "heartbeat": heartbeat, "impact": impact, "boom": boom, "riser": riser, "stinger": stinger, "swish": swish}


def ensure(out_dir: Path) -> None:
    stamp = out_dir / ".foley-version"
    fresh = stamp.exists() and stamp.read_text() == VERSION
    for name, gen in BEDS.items():
        if not (fresh and (out_dir / f"{name}.wav").exists()):
            _write(out_dir / f"{name}.wav", *_bed(gen))
    for name, gen in ONE_SHOTS.items():
        if not (fresh and (out_dir / f"{name}.wav").exists()):
            _write(out_dir / f"{name}.wav", gen())
    stamp.write_text(VERSION)
