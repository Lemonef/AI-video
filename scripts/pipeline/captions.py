"""Turn a narration line + word timings into on-screen caption chunks (pure, unit-tested)."""
import re
from dataclasses import dataclass

from .tts.word import Word

MAX_CHUNK_CHARS = 24  # one caption line on a phone at the caption font size
MIN_CHUNK_SEC = 0.35  # shorter than this flickers
TAIL_HOLD_SEC = 0.3  # keep the last chunk up briefly after the voice stops
BREAK_AFTER = ("…", "!", "?", "'")  # punctuation that ends a phrase
_KEEP = re.compile(r"[฀-๿A-Za-z0-9]")


@dataclass(frozen=True)
class Cue:
    start: float
    end: float
    text: str


def _norm_len(s: str) -> int:
    """Length counting only letters/digits, so spoken and displayed text can be aligned."""
    return len(_KEEP.findall(s))


def chunk(caption: str, max_chars: int = MAX_CHUNK_CHARS) -> list[str]:
    """Group space-separated phrases into chunks that fit one caption line."""
    chunks: list[str] = []
    cur = ""
    for tok in caption.split():
        joined = f"{cur} {tok}" if cur else tok
        if cur and len(joined) > max_chars:
            chunks.append(cur)
            cur = tok
        else:
            cur = joined
        if cur.endswith(BREAK_AFTER) and len(cur) >= max_chars // 2:
            chunks.append(cur)
            cur = ""
    if cur:
        chunks.append(cur)
    return chunks


def build_cues(caption: str, words: list[Word], duration: float) -> list[Cue]:
    """Time each chunk by mapping its position in the caption onto the spoken word timeline.

    Caption and spoken text may differ ("7" vs "เจ็ด", quotes, ellipses), so chunks are placed by
    proportional letter position rather than exact string match.
    """
    parts = chunk(caption)
    if not parts:
        return []
    total = sum(_norm_len(p) for p in parts) or 1
    spoken_ends: list[tuple[int, Word]] = []
    acc = 0
    for w in words:
        acc += _norm_len(w.text)
        spoken_ends.append((acc, w))
    spoken_total = acc

    def time_at(frac: float) -> float:
        if not words or spoken_total == 0:
            return frac * duration
        target = frac * spoken_total
        for end_idx, w in spoken_ends:
            if end_idx > target:
                return w.start
        return words[-1].start

    starts: list[float] = []
    seen = 0
    for p in parts:
        starts.append(time_at(seen / total))
        seen += _norm_len(p)
    starts[0] = 0.0
    cues: list[Cue] = []
    for i, p in enumerate(parts):
        end = starts[i + 1] if i + 1 < len(parts) else duration + TAIL_HOLD_SEC
        cues.append(Cue(starts[i], max(end, starts[i] + MIN_CHUNK_SEC), p))
    # Enforce no overlap after the minimum-length stretch, but never run past the line's end:
    # a chunk with no room left is merged into the previous one instead of being pushed off-screen.
    limit = duration + TAIL_HOLD_SEC
    out: list[Cue] = [cues[0]]
    for c in cues[1:]:
        prev = out[-1]
        start = max(c.start, prev.end)
        if start + MIN_CHUNK_SEC > limit:
            out[-1] = Cue(prev.start, max(prev.end, c.end), f"{prev.text} {c.text}")
        else:
            out.append(Cue(start, min(max(c.end, start + MIN_CHUNK_SEC), limit), c.text))
    return out
