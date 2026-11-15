"""Find where each scene's line starts inside one continuous take (pure; Whisper words in, cut times out)."""
import re
from difflib import SequenceMatcher

from .tts.word import Word

_KEEP = re.compile(r"[฀-๿A-Za-z0-9]")
_TAG = re.compile(r"\[[^\]]*\]")  # [whispers] etc. are not spoken
SNAP_WINDOW_SEC = 0.8  # the fuzzy estimate is within ~a word; only snap to a pause that close
DISTANCE_PENALTY = 0.4  # prefer long pauses, but not far ones: score = pause length - penalty * distance
BREAK_DRIFT_PENALTY = 0.2  # no transcript: seconds of pause traded per second away from the estimate (ep01 v2: 0.1-0.2 stable)
LINE_PACE_PENALTY = 0.25  # seconds of pause traded per second a line runs off its letters' pace (ep01 v4: <0.275 keeps breaths over commas)


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
        seen, estimates = 0, []
        for part in script_parts[:-1]:
            seen += len(part)
            estimates.append(take_sec * seen / max(1, len(script)))
        if silences:
            return _cuts(_line_breaks(estimates, silences, take_sec, [len(p) for p in script_parts]), take_sec)
        starts += estimates
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
    return _cuts(starts[1:], take_sec)


def _cuts(breaks: list[float], take_sec: float) -> list[tuple[float, float]]:
    starts = [0.0, *breaks]
    return list(zip(starts, [*breaks, take_sec]))


def _line_breaks(estimates: list[float], silences: list[tuple[float, float]], take_sec: float, letters: list[int] | None = None) -> list[float]:
    """Without a transcript: pick one pause per line break, in order, for the whole take at once.

    The narrator breathes longest between lines, so the chosen pauses maximise total pause length
    while each stays near its letter-proportional estimate. Snapping each estimate on its own
    lets the error build up line by line until a cut lands on a comma inside a sentence.
    A dramatic pause INSIDE a line can still outlast the real break; `letters` (per line) adds a
    pace check: each line's length should match its letters at the take's average speed.
    """
    edge = 0.05  # lead-in / tail silence of the take is never a line break
    inner = [s for s in silences if s[0] > edge and s[1] < take_sec - edge]
    n, m = len(estimates), len(inner)
    if m < n:
        return [snap(e, silences) for e in estimates]
    mid = [(a + b) / 2 for a, b in inner]
    sec_per_letter = take_sec / max(1, sum(letters)) if letters else 0.0

    def pace(line: int, start: float, end: float) -> float:
        """Penalty for a line whose length disagrees with its letters at the average pace."""
        return LINE_PACE_PENALTY * abs((end - start) - letters[line] * sec_per_letter) if letters else 0.0

    def score(i: int, j: int) -> float:
        a, b = inner[j]
        return (b - a) - BREAK_DRIFT_PENALTY * abs(mid[j] - estimates[i])

    best = [[score(0, j) - pace(0, 0.0, mid[j]) for j in range(m)]]
    back: list[list[int]] = [[-1] * m]
    for i in range(1, n):
        row, links = [float("-inf")] * m, [-1] * m
        for j in range(i, m):
            k = max(range(i - 1, j), key=lambda k: best[i - 1][k] - pace(i, mid[k], mid[j]))
            row[j], links[j] = best[i - 1][k] - pace(i, mid[k], mid[j]) + score(i, j), k
        best.append(row)
        back.append(links)
    j = max(range(n - 1, m), key=lambda j: best[n - 1][j] - pace(n, mid[j], take_sec))
    picked = []
    for i in range(n - 1, -1, -1):
        picked.append(sum(inner[j]) / 2)
        j = back[i][j]
    return picked[::-1]


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
