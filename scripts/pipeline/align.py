"""Find where each scene's line starts inside one continuous take (pure; Whisper words in, cut times out)."""
import re

from .tts.word import Word

_KEEP = re.compile(r"[฀-๿A-Za-z0-9]")
_TAG = re.compile(r"\[[^\]]*\]")  # [whispers] etc. are not spoken


def spoken_len(s: str) -> int:
    return len(_KEEP.findall(_TAG.sub("", s)))


def scene_cuts(lines: list[str], words: list[Word], take_sec: float) -> list[tuple[float, float]]:
    """Return (start, end) seconds in the take for each line.

    Lines are placed by their letter position in the script, mapped onto Whisper's word timeline
    (spelling may differ: Whisper writes "7" for "เจ็ด"). Each cut sits in the middle of the
    silence before the line's first word, so no syllable is clipped.
    """
    if not lines:
        return []
    lens = [spoken_len(s) for s in lines]
    script_total = sum(lens) or 1
    acc, word_ends = 0, []
    for w in words:
        acc += spoken_len(w.text)
        word_ends.append(acc)
    heard_total = acc

    def first_word_at(frac: float) -> int:
        target = frac * heard_total
        for i, end in enumerate(word_ends):
            if end > target:
                return i
        return len(words) - 1

    starts = [0.0]
    seen = lens[0]
    for n in lens[1:]:
        if not words or heard_total == 0:
            starts.append(take_sec * seen / script_total)
        else:
            i = first_word_at(seen / script_total)
            prev_end = words[i - 1].end if i > 0 else 0.0
            starts.append((prev_end + words[i].start) / 2)
        seen += n
    ends = starts[1:] + [take_sec]
    return list(zip(starts, ends))


def words_in(words: list[Word], start: float, end: float) -> list[Word]:
    """Words that start inside [start, end), re-timed relative to `start`."""
    return [Word(w.text, w.start - start, w.end - start) for w in words if start <= w.start < end]
