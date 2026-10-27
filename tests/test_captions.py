import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "scripts"))

from pipeline.captions import MAX_CHUNK_CHARS, MIN_CHUNK_SEC, build_cues, chunk  # noqa: E402
from pipeline.tts import Word  # noqa: E402


def test_chunks_fit_one_line():
    text = "เจ็ดโมงเช้า คุณคิดในใจว่า ไม่อยากไปทำงานเลย แล้วเพื่อนบ้านก็ตะโกนกลับมาว่า เหมือนกัน!"
    parts = chunk(text)
    assert " ".join(parts) == text
    # a single long phrase may exceed the limit, but never two joined phrases
    assert all(len(p) <= MAX_CHUNK_CHARS or " " not in p for p in parts)


def test_cues_follow_word_timings_and_never_overlap():
    words = [Word("หนึ่ง", 0.1, 0.5), Word("สอง", 1.0, 1.4), Word("สาม", 2.0, 2.4)]
    cues = build_cues("หนึ่ง สอง สาม", words, duration=2.6)
    assert [c.text for c in cues] == ["หนึ่ง สอง สาม"]  # short line = one chunk, held to the end
    assert cues[0].start == 0.0 and abs(cues[0].end - 2.9) < 1e-9
    for a, b in zip(cues, cues[1:]):
        assert a.end <= b.start + 1e-9
    assert all(c.end - c.start >= MIN_CHUNK_SEC for c in cues)


def test_chunk_starts_track_speech_when_split():
    words = [Word("ก" * 20, 0.0, 1.0), Word("ข" * 20, 3.0, 4.0)]
    cues = build_cues("ก" * 20 + " " + "ข" * 20, words, duration=4.0)
    assert len(cues) == 2
    assert cues[0].start == 0.0
    assert abs(cues[1].start - 3.0) < 1e-9


def test_no_word_timings_falls_back_to_proportional():
    cues = build_cues("ก" * 20 + " " + "ข" * 20, [], duration=4.0)
    assert abs(cues[1].start - 2.0) < 1e-9


def test_empty_caption_gives_no_cues():
    assert build_cues("   ", [Word("ก", 0, 0.2)], duration=1.0) == []


def test_cues_never_pass_the_line_end():
    cues = build_cues(" ".join(["a" * 20] * 4), [Word("aaaa", 0, 0.2)], duration=0.2)
    assert cues[-1].end <= 0.2 + 0.3 + 1e-9
    assert " ".join(c.text for c in cues) == " ".join(["a" * 20] * 4)  # nothing dropped


def test_highlight_with_a_space_stays_in_one_chunk():
    parts = chunk("อนามัยอยู่ข้างหน้าแล้ว… อีกแค่ *300 เมตร*")
    assert any(p.endswith("*300 เมตร*") for p in parts)
    assert all(p.count("*") % 2 == 0 for p in parts)


def test_without_words_chunks_stay_inside_the_spoken_part():
    cues = build_cues("กกกก ขขขข คคคค งงงง", [], duration=4.0, speech=(1.0, 3.0))
    assert cues[1].start >= 1.0 and cues[-1].start < 3.0
