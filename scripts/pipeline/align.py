"""Find where each scene's line starts inside one continuous take (pure; Whisper words in, cut times out)."""
import re
from difflib import SequenceMatcher

from .tts.word import Word

_KEEP = re.compile(r"[฀-๿A-Za-z0-9]")
_TAG = re.compile(r"\[[^\]]*\]")  # [whispers] etc. are not spoken
SNAP_WINDOW_SEC = 0.8  # the fuzzy estimate is within ~a word; only snap to a pause that close
DISTANCE_PENALTY = 0.4  # prefer long pauses, but not far ones: score = pause length - penalty * distance


def spoken_len(s: str) -> int:
    return len(_norm(s))


def _norm(s: str) -> str:
    return "".join(_KEEP.findall(_TAG.sub("", s)))


def _char_map(script: str, heard: str) -> list[int]:
    """For each script char index, the matching index in the heard transcript.

    difflib aligns the two letter streams; unmatched stretches (misheard words, "7" vs "เจ็ด")
    are interpolated between the surrounding matches.
    """
    anchors = [(0, 0)]
    for a, b, size in SequenceMatcher(None, script, heard, autojunk=False).get_matching_blocks():
        if size:
            anchors += [(a, b), (a + size, b + size)]
    anchors.append((len(script), len(heard)))
    out, j = [], 0
    for i in range(len(script) + 1):
        while j + 1 < len(anchors) - 1 and anchors[j + 1][0] <= i:
            j += 1
        (a0, b0), (a1, b1) = anchors[j], anchors[min(j + 1, len(anchors) - 1)]
        out.append(b0 if a1 == a0 else round(b0 + (i - a0) * (b1 - b0) / (a1 - a0)))
    return out


def scene_cuts(lines: list[str], words: list[Word], take_sec: float, silences: list[tuple[float, float]] | None = None) -> list[tuple[float, float]]:
    """Return (start, end) seconds in the take for each line.

    Each line's first letter is located in Whisper's transcript by fuzzy letter alignment
    (spelling may differ: Whisper writes "7" for "เจ็ด"), giving the word where the line starts.
    When the take's measured `silences` are given, the cut then snaps to the real pause nearby,
    because the narrator always breathes between lines.
    """
    if not lines:
        return []
    script_parts = [_norm(s) for s in lines]
    script = "".join(script_parts)
    word_text = [_norm(w.text) for w in words]
    heard = "".join(word_text)
    starts = [0.0]
    if not words or not heard:
        seen = 0
        for part in script_parts[:-1]:
            seen += len(part)
            starts.append(take_sec * seen / max(1, len(script)))
    else:
        cmap = _char_map(script, heard)
        word_start_char, acc = [], 0
        for t in word_text:
            word_start_char.append(acc)
            acc += len(t)
        seen = 0
        for part in script_parts[:-1]:
            seen += len(part)
            target = cmap[seen]
            # first word whose letters reach the target position
            i = next((k for k, c in enumerate(word_start_char) if c + len(word_text[k]) > target), len(words) - 1)
            prev_end = words[i - 1].end if i > 0 else 0.0
            starts.append((prev_end + words[i].start) / 2)
    if silences:
        starts = [0.0] + [snap(s, silences) for s in starts[1:]]
    ends = starts[1:] + [take_sec]
    return list(zip(starts, ends))


def snap(estimate: float, silences: list[tuple[float, float]]) -> float:
    """Middle of the best pause within SNAP_WINDOW_SEC of `estimate`, or the estimate itself."""
    best, best_score = estimate, float("-inf")
    for a, b in silences:
        mid = (a + b) / 2
        dist = abs(mid - estimate)
        if dist > SNAP_WINDOW_SEC:
            continue
        score = (b - a) - DISTANCE_PENALTY * dist
        if score > best_score:
            best, best_score = mid, score
    return best


def words_in(words: list[Word], start: float, end: float) -> list[Word]:
    """Words that start inside [start, end), re-timed relative to `start`."""
    return [Word(w.text, w.start - start, w.end - start) for w in words if start <= w.start < end]
