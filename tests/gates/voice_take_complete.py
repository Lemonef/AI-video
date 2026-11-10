"""Gate: a whole-take voice must contain EVERY line, with no long dead air between lines.

Why (nolie01, 2026-11-11): Gemini voiced 10 lines in one request and stopped after line 7 -
the take ran 122 s but 71.6-122.6 s was silence (-60 dB). The aligner then invented start times
for the 3 missing lines and the reel shipped silent scenes. The same take also held 3-4.5 s
pauses between every line, which broke the 6 s hook limit and padded the reel by ~25 s.

Fix contract (see docs/briefs/voice-take-complete.md):
- voice the script in chunks of at most TAKE_CHUNK_LINES lines (balanced sizes), one request each,
  each chunk to ep_dir/take.chunk{i}.mp3, then media.join(chunk_paths, raw)
- a chunk whose trailing silence is longer than MAX_TAIL_SILENCE_SEC is truncated: re-voice it
  (TRUNCATION_RETRIES times), then raise RuntimeError mentioning "truncated"
- after tempo, every pause longer than MAX_LINE_PAUSE_SEC is shortened to it:
  media.keep(src, squeeze_segments(pauses, sec, MAX_LINE_PAUSE_SEC), take)
Runs offline: engine, ffmpeg (media), Whisper and the Gemini aligner are all stubbed.
"""
import json
import sys
import tempfile
from pathlib import Path
from types import SimpleNamespace

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "scripts"))
from pipeline import narrate  # noqa: E402

CHUNK_SEC = 40.0
OK_CHUNK = [(0.0, 0.1), (10.0, 14.0), (39.6, CHUNK_SEC)]  # 0.4 s tail: complete
CUT_CHUNK = [(0.0, 0.1), (15.0, CHUNK_SEC)]  # 25 s tail: the model stopped talking
LONG = [(8 * k + 5.0, 8 * k + 8.5) for k in range(10)]  # 3.5 s gaps, as in the real take
SHORT = [(5.0 * k, 5.0 * k + 0.5) for k in range(1, 10)]


def approx(a, b, eps=1e-6):
    return len(a) == len(b) and all(abs(x - y) < eps for p, q in zip(a, b) for x, y in zip(p, q))


def check_pure():
    for name in ("TAKE_CHUNK_LINES", "MAX_TAIL_SILENCE_SEC", "MAX_LINE_PAUSE_SEC", "TRUNCATION_RETRIES"):
        assert hasattr(narrate, name), f"named constant narrate.{name} missing"
    for name in ("take_chunks", "tail_silence", "squeeze_segments"):
        assert hasattr(narrate, name), f"narrate.{name} missing"
    sizes = lambda n, k: [len(c) for c in narrate.take_chunks([str(i) for i in range(n)], k)]
    assert sizes(10, 5) == [5, 5], sizes(10, 5)
    assert sizes(11, 5) == [4, 4, 3], sizes(11, 5)
    assert sizes(3, 5) == [3], sizes(3, 5)
    flat = [x for c in narrate.take_chunks([str(i) for i in range(11)], 5) for x in c]
    assert flat == [str(i) for i in range(11)], "chunks must keep every line, in order"

    assert narrate.tail_silence(OK_CHUNK, CHUNK_SEC) < narrate.MAX_TAIL_SILENCE_SEC
    assert abs(narrate.tail_silence(CUT_CHUNK, CHUNK_SEC) - 25.0) < 1e-6
    assert narrate.tail_silence([(1.0, 2.0)], CHUNK_SEC) == 0.0, "no pause at the end = no tail"

    segs = narrate.squeeze_segments([(0.0, 0.2), (5.0, 8.3), (13.4, 17.9)], 20.0, 0.5)
    assert approx(segs, [(0.0, 5.25), (8.05, 13.65), (17.65, 20.0)]), segs
    assert approx(narrate.squeeze_segments([(5.0, 5.4)], 20.0, 0.5), [(0.0, 20.0)]), "short pauses stay whole"


class Rig:
    """Stubs for engine + media; `cut_chunks` = {chunk index: how many voicings come back truncated}."""

    def __init__(self, cut_chunks=None):
        self.cut_chunks = dict(cut_chunks or {})
        self.texts, self.writes, self.keeps = [], {}, []
        self.dur, self.squeezed = {}, set()

    def synthesize(self, text, voice, rate, out_path):
        out_path = Path(out_path)
        self.texts.append(text)
        out_path.write_bytes(b"mp3")
        self.writes[out_path.name] = self.writes.get(out_path.name, 0) + 1
        self.dur[out_path.name] = CHUNK_SEC
        self.last_written = out_path.name
        return []

    def _chunk_index(self, name):
        return int(name.split("chunk")[1].split(".")[0]) if "chunk" in name else None

    def silences(self, path):
        name = Path(path).name
        i = self._chunk_index(name)
        if i is None and name.startswith("take.tmp") and getattr(self, "last_written", "").startswith("take.chunk"):
            i = self._chunk_index(self.last_written)  # chunk voiced to tmp then renamed
        if i is not None:
            return CUT_CHUNK if self.writes.get(name, self.writes.get(self.last_written, 0)) <= self.cut_chunks.get(i, 0) else OK_CHUNK
        return SHORT if name in self.squeezed else LONG

    def duration(self, path):
        return self.dur.get(Path(path).name, CHUNK_SEC)

    def join(self, paths, out):
        Path(out).write_bytes(b"mp3")
        self.dur[Path(out).name] = sum(self.duration(p) for p in paths)

    def tempo(self, src, factor, out):
        Path(out).write_bytes(b"mp3")
        self.dur[Path(out).name] = 2 * len(LONG) * 4.0 / factor  # 80 s

    def keep(self, src, segments, out):
        self.keeps.append(list(segments))
        Path(out).write_bytes(b"mp3")
        self.dur[Path(out).name] = sum(b - a for a, b in segments)
        self.squeezed.add(Path(out).name)

    def cut(self, src, start, end, out):
        Path(out).write_bytes(b"mp3")

    def install(self):
        m = narrate.media
        m.silences, m.duration, m.join, m.tempo, m.keep, m.cut = self.silences, self.duration, self.join, self.tempo, self.keep, self.cut

        def no_whisper(*a, **k):
            raise ImportError("whisper blocked (test)")

        narrate.whisper.words = no_whisper
        narrate.gemini_align.line_starts = lambda take, lines: [0.0] + [5.0 * k + 0.5 for k in range(1, len(lines))]
        return SimpleNamespace(name="gemini", whole_take=True, model=None, synthesize=self.synthesize)


LINES = [f"บรรทัดที่{i} เรื่องสั้น" for i in range(10)]


def episode():
    return {"id": "gate01", "voice": "Iapetus", "scenes": [{"id": f"s{i}", "say": s} for i, s in enumerate(LINES)]}


def check_chunked_take():
    rig = Rig()
    engine = rig.install()
    with tempfile.TemporaryDirectory() as d:
        pub = Path(d)
        out = narrate.narrate(episode(), engine, pub)
        assert len(rig.texts) == 2, f"10 lines must be voiced as 2 chunks of 5, got {len(rig.texts)} request(s)"
        assert all(l in rig.texts[0] for l in LINES[:5]) and not any(l in rig.texts[0] for l in LINES[5:]), "chunk 0 = lines 0-4 only"
        assert all(l in rig.texts[1] for l in LINES[5:]) and not any(l in rig.texts[1] for l in LINES[:5]), "chunk 1 = lines 5-9 only"
        assert len(rig.keeps) == 1, f"the take must be squeezed once with media.keep, got {rig.keeps}"
        want = narrate.squeeze_segments(LONG, 80.0, narrate.MAX_LINE_PAUSE_SEC)
        assert approx(rig.keeps[0], want), f"media.keep segments {rig.keeps[0]} != squeeze_segments(...) {want}"
        assert set(out) == {f"s{i}" for i in range(10)}, out.keys()
        timing = json.loads((pub / "gate01" / "timing.json").read_text(encoding="utf-8"))
        assert timing["_take"]["duration"] < 80.0, "timing must describe the squeezed take"
        rig.texts.clear()
        narrate.narrate(episode(), engine, pub)
        assert rig.texts == [], "an unchanged script must reuse the cached take (no new TTS request)"


def check_truncation():
    rig = Rig(cut_chunks={1: 1})  # chunk 1 comes back truncated once, then complete
    engine = rig.install()
    with tempfile.TemporaryDirectory() as d:
        narrate.narrate(episode(), engine, Path(d))
    assert len(rig.texts) == 3, f"a truncated chunk must be re-voiced once: expected 3 requests, got {len(rig.texts)}"

    rig = Rig(cut_chunks={0: 99})  # never completes
    engine = rig.install()
    with tempfile.TemporaryDirectory() as d:
        try:
            narrate.narrate(episode(), engine, Path(d))
        except RuntimeError as e:
            assert "truncated" in str(e).lower(), e
        else:
            raise AssertionError("a chunk that stays truncated must raise RuntimeError('... truncated ...')")
    assert len(rig.texts) == 1 + narrate.TRUNCATION_RETRIES, f"retries must stop at TRUNCATION_RETRIES, got {len(rig.texts)} requests"


def main() -> int:
    check_pure()
    check_chunked_take()
    check_truncation()
    print("voice_take_complete gate: PASS")
    return 0


if __name__ == "__main__":
    sys.exit(main())
