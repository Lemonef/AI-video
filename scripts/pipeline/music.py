"""Reference envelope math for music automation; the renderer mirrors this frame by frame."""
from math import pow


def envelope(events: list[dict], duck_db: float, sec: float, speaking: bool, duration: float) -> float:
    level = 1.0
    for event in sorted(events, key=lambda e: e["at"]):
        if sec < event["at"]:
            break
        if event["action"] == "swell":
            level = 1.28
        elif event["action"] == "drop":
            level = 0.62
        elif event["action"] == "out":
            level = min(level, max(0.0, min(1.0, 1 - (sec - event["at"]) / 1.25)))
    return level * (pow(10, -duck_db / 20) if speaking else 1.0) * max(0.0, min(1.0, duration - sec))
