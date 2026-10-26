"""transcribe.py — hear what a voice actually said (Whisper), to catch misreads before posting.

    python scripts/transcribe.py out/ep01.mp4 [more files...]
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from pipeline.whisper import transcribe  # noqa: E402


def main() -> None:
    for path in sys.argv[1:]:
        print(f"== {path}")
        for s in transcribe(path):
            print(f"  [{s.start:6.2f}-{s.end:6.2f}] {s.text.strip()}")


if __name__ == "__main__":
    main()
