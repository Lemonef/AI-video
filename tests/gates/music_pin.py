"""Gate: ensure_music must honour a pinned Freesound id before searching.

Why: the nolie01 music query returned 0 CC0 hits, so make.py would crash at the music fetch.
SFX already have PINNED; music needs the same so a hand-checked track always wins.
Runs offline: search, sound lookup, download and loudness finish are stubbed.
"""
import json
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "scripts"))
from pipeline import freesound as f  # noqa: E402

PICK = 819108  # hand-checked CC0 soft piano, 88.6 s (covers the ~85 s reel)


def main() -> int:
    pins = getattr(f, "MUSIC_PINNED", None)
    assert isinstance(pins, dict), "freesound.MUSIC_PINNED dict missing"
    assert pins.get("nolie01_truth_pulse") == PICK, f"nolie01_truth_pulse must pin {PICK}"

    def no_search(*a, **k):
        raise AssertionError("pinned music must not search")

    fake = {"id": PICK, "name": "soft slow piano", "username": "jcmbo369",
            "url": f"https://freesound.org/people/jcmbo369/sounds/{PICK}/",
            "license": "http://creativecommons.org/publicdomain/zero/1.0/", "duration": 88.55,
            "previews": {"preview-hq-mp3": "http://example.invalid/x.mp3"}}

    class Resp:
        def __enter__(self): return self
        def __exit__(self, *a): return False
        def read(self): return b"ID3fake"

    f._search = no_search
    f._sound = lambda i: dict(fake, id=i)
    f.urllib.request.urlopen = lambda *a, **k: Resp()
    f._finish = lambda raw, target, **k: Path(target).write_bytes(Path(raw).read_bytes())

    with tempfile.TemporaryDirectory() as d:
        credits = f.ensure_music(Path(d), ["nolie01_truth_pulse"], -27)
        c = credits["nolie01_truth_pulse"]
        assert c["id"] == PICK, c
        assert "publicdomain/zero" in c["license"], c
        assert (Path(d) / "music" / "nolie01_truth_pulse.mp3").exists()
        saved = json.loads((Path(d) / "music" / "credits.json").read_text(encoding="utf-8"))
        assert saved["nolie01_truth_pulse"]["id"] == PICK
    print("music_pin gate: PASS")
    return 0


if __name__ == "__main__":
    sys.exit(main())
