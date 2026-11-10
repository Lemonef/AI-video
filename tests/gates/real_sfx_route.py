"""Gate: an episode whose mix is real must fetch real CC0 effects, never the synth.

Why: make.py called sfx.ensure(public, realSfx) - sfx.ensure is the ffmpeg synth and takes one
argument, so every mix.real episode crashed at [2/4] (TypeError). Real effects live in
freesound.ensure(public_dir, names), which writes public/sfx/real/ (what the jaab3d scenes read).
Runs offline: both fetchers are stubbed.
"""
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "scripts"))
import make  # noqa: E402


def run(episode: dict) -> list:
    calls = []
    make.sfx.ensure = lambda *a, **k: calls.append(("synth", a, k))
    make.freesound.ensure = lambda *a, **k: calls.append(("real", a, k)) or {}
    make.freesound.ensure_music = lambda *a, **k: calls.append(("music", a, k)) or {}
    make.ensure_sound(episode, Path("PUB"))
    return calls


def main() -> int:
    assert hasattr(make, "ensure_sound"), "make.ensure_sound(episode, public) missing"

    names = ["boom", "hit"]
    calls = run({"mix": {"real": True, "realSfx": names,
                         "music": {"name": "nolie01_truth_pulse", "volume_lufs": -27}}})
    kinds = [c[0] for c in calls]
    assert "synth" not in kinds, f"real mix must not call the synth: {calls}"
    real = [c for c in calls if c[0] == "real"]
    assert len(real) == 1, calls
    assert real[0][1][0] == Path("PUB") and list(real[0][1][1]) == names, real
    music = [c for c in calls if c[0] == "music"]
    assert len(music) == 1 and list(music[0][1][1]) == ["nolie01_truth_pulse"] and music[0][1][2] == -27, music

    calls = run({"mix": {"beds": []}})
    assert [c[0] for c in calls] == ["synth"] and calls[0][1] == (Path("PUB"),), f"non-real mix keeps the synth: {calls}"

    calls = run({})
    assert [c[0] for c in calls] == ["synth"], f"no mix keeps the synth: {calls}"
    print("real_sfx_route gate: PASS")
    return 0


if __name__ == "__main__":
    sys.exit(main())
