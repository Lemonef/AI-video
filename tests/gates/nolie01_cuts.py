"""Gate: nolie01 has no stretch over the retention cut limit (FAIL or WARN) at the measured rate."""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "scripts"))
from pipeline import retention  # noqa: E402

LETTERS_PER_SEC = 10.0  # mirrors the rate make.py measured and printed for the pre-voice estimate

episode = json.loads((ROOT / "episodes" / "nolie01.json").read_text(encoding="utf-8"))
bad = [f for f in retention.check(episode, retention.estimate(episode, LETTERS_PER_SEC)) if "without a cut" in f.message]
for f in bad:
    print(f.level, f.scene, f.message)
sys.exit(1 if bad else 0)
