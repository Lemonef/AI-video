"""script_full.md -> beats_full.json + shots_full.json + timeline_full.json (draft timing).

Shots are derived from the script, no hand authoring:
  - one shot per sentence (merged so a shot is >= MIN_SHOT_S, capped at MAX_SHOTS per beat)
  - short punchy sentence (<= TITLE_MAX_WORDS) -> TitleCard, long sentence -> Scene (plate tag + sprite)
Draft timing = words / WPS + GAP_S; the real voice (tools/hist_ep/ink_audio.py) overwrites it with measured
durations, so the numbers here only have to be believable for a silent look-check.

Usage: python -I tools/gen_full.py   (run from D:/history-ep)
"""
import json
import math
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
VID = ROOT / "videos/pastly-life/01-eiffel-ink"
SCRIPT = ROOT / "engine/ink/ink/script_full.md"
OUT = VID / "assets/ink60full"

FPS = 30
WPS = 2.5                # ~150 wpm, same figure the script was sized with
GAP_S = 0.3              # = beats.json gapSeconds of the proof
TAIL_S = 0.6             # = ink_audio.TAIL_S
MIN_SHOT_S = 1.6         # below this a cut reads as a flicker
MAX_SHOTS = 4
TITLE_MAX_WORDS = 6
LUSTIG_POSES = 6
BEAT_RE = re.compile(r"^(?P<id>[bx]\d+)\s+(?:\[(?P<plate>[^\]]*)\]\s+)?(?P<text>.+)$")
# keyword -> secondary cast sprite (prefix, pose count); otherwise Lustig
CAST_KEYS = [
    (re.compile(r"\b(dealers?|Poisson|buyers?|businessmen|victims?|marks?)\b", re.I), ("parisian", 3)),
    (re.compile(r"\b(clerk|police|sheriff|guard|officials?|ministry|inspector|agents?)\b", re.I), ("clerk", 3)),
]
SENT_RE = re.compile(r"(?<=[.!?])\s+")


def parse():
    beats, plate = [], None
    for line in SCRIPT.read_text(encoding="utf-8").splitlines():
        m = BEAT_RE.match(line.strip())
        if not m:
            continue
        plate = m["plate"] or plate
        beats.append({"id": m["id"], "plate": plate, "text": m["text"].strip()})
    return beats


def shots_for(beat, idx):
    sents = SENT_RE.split(beat["text"])
    # merge neighbours until each shot would last >= MIN_SHOT_S (estimated), then cap
    groups, cur = [], ""
    for s in sents:
        cur = f"{cur} {s}".strip()
        if len(cur.split()) / WPS >= MIN_SHOT_S:
            groups.append(cur)
            cur = ""
    if cur:
        if groups:
            groups[-1] += " " + cur
        else:
            groups.append(cur)
    while len(groups) > MAX_SHOTS:           # fold the tail into the last allowed shot
        groups[-2] += " " + groups[-1]
        groups.pop()
    shots = []
    cast = next((c for rx, c in CAST_KEYS if rx.search(beat["text"])), None)
    for j, g in enumerate(groups):
        k = idx + j
        words = g.split()
        if len(words) <= TITLE_MAX_WORDS and len(groups) > 1 or len(words) <= 3:
            # break the line into <=2 lines at the middle word
            mid = math.ceil(len(words) / 2) if len(words) > 3 else len(words)
            lines = [" ".join(words[:mid]), " ".join(words[mid:])] if mid < len(words) else [g]
            shots.append({"k": "title", "lines": lines, "accent": "x" if j == len(groups) - 1 else None})
        else:
            prefix, n = cast if cast and j % 2 else ("lustig", LUSTIG_POSES)
            shots.append({"k": "scene", "plate": beat["plate"], "sprite": f"{prefix}_{k % n + 1}",
                          "x": 520 if k % 2 == 0 else 1300})
    return shots


def main():
    beats = parse()
    OUT.mkdir(parents=True, exist_ok=True)
    shots_all, tl_beats, t, idx = {}, [], 0, 0
    for b in beats:
        shots = shots_for(b, idx)
        idx += len(shots)
        shots_all[b["id"]] = shots
        words = len(b["text"].split())
        dur = round((words / WPS + GAP_S + (TAIL_S if b is beats[-1] else 0)) * FPS)
        per = dur // len(shots)
        tl_shots = [{"start": t + i * per, "dur": per if i < len(shots) - 1 else dur - per * (len(shots) - 1)}
                    for i in range(len(shots))]
        tl_beats.append({"id": b["id"], "start": t, "dur": dur, "shots": tl_shots})
        t += dur
    (OUT / "shots_full.json").write_text(json.dumps(shots_all, indent=1), encoding="utf-8")
    (OUT / "timeline_full.json").write_text(json.dumps({"fps": FPS, "silent": True, "totalFrames": t, "beats": tl_beats}), encoding="utf-8")
    (OUT / "beats_full.json").write_text(json.dumps({
        "voice": "Charon", "gapSeconds": GAP_S,
        "beats": [{"id": b["id"], "shots": len(shots_all[b["id"]]), "text": b["text"]} for b in beats]}, indent=1), encoding="utf-8")
    nshots = sum(len(v) for v in shots_all.values())
    kinds = [s["k"] for v in shots_all.values() for s in v]
    print(f"{len(beats)} beats, {nshots} shots ({kinds.count('scene')} scene / {kinds.count('title')} title), "
          f"{t / FPS / 60:.1f} min draft")


if __name__ == "__main__":
    main()
