"""Merge public/ink60full/directed/act<N>.json -> directed_full.json, validate, and rewrite beats/timeline shot counts.

Checks (fail loudly, exit 1):
  - every beat of beats_full.json has 1-5 shots
  - scene sprite/plate ids exist in the catalogs OR are declared in that act's needed_poses / needed_plates
  - prop kinds are in PROP_KINDS, cam.move in CAM_MOVES, every scene has a non-empty `why`
  - no two consecutive scene shots share plate + sprites + cam move
  - cards (title/compare/label) are at most 1 per 3 shots across a beat run
Then rewrites beats_full.json shot counts and timeline_full.json shot splits by weight `w`
(real durations from ink_audio.py later overwrite the timeline; weights live in directed_full.json).

Usage: python -I tools/merge_directed.py   (run from D:/history-ep)
"""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
VID = ROOT / "videos/pastly-life/01-eiffel-ink"
PUB = VID / "assets/ink60full"
PROP_KINDS = {"suitcase", "banknotes", "door", "newspaper", "tower", "coin", "papers", "telegram", "handcuffs", "ship", "keys"}
CAM_MOVES = {"push", "pull", "pan_l", "pan_r", "drift", "hold"}
MIN_SHOTS, MAX_SHOTS = 1, 5
CARD_KINDS = {"title", "compare", "label"}
CARD_WINDOW = 3          # at most 1 card per this many consecutive shots
RESERVED = {"needed_plates", "needed_poses"}


def main() -> int:
    cast = json.loads((PUB / "cast_catalog.json").read_text(encoding="utf-8"))
    plates = json.loads((PUB / "plate_catalog.json").read_text(encoding="utf-8"))
    beats = json.loads((PUB / "beats_full.json").read_text(encoding="utf-8"))
    tl = json.loads((PUB / "timeline_full.json").read_text(encoding="utf-8"))
    errs: list[str] = []
    merged: dict[str, list] = {}
    need_plates: dict[str, dict] = {}
    need_poses: dict[str, dict] = {}

    files = sorted((PUB / "directed").glob("act*.json"))
    if not files:
        print("no act files in public/ink60full/directed/")
        return 1
    for f in files:
        d = json.loads(f.read_text(encoding="utf-8"))
        for p in d.get("needed_plates", []):
            need_plates.setdefault(p["id"], {**p, "beats": []})["beats"] += p.get("beats", [])
        for p in d.get("needed_poses", []):
            need_poses.setdefault(p["id"], {**p, "beats": []})["beats"] += p.get("beats", [])
        merged.update({k: v for k, v in d.items() if k not in RESERVED})

    for b in beats["beats"]:
        if b["id"] not in merged:
            errs.append(f"{b['id']}: no directed shots")

    ok_sprites = set(cast) | set(need_poses)
    ok_plates = set(plates) | set(need_plates)
    # directors spelled the stand-in keys differently; canonical = shot.fallback_plate, actor.fallback_sprite
    for shots in merged.values():
        for s in shots:
            if "plate_fallback" in s:
                s.setdefault("fallback_plate", s.pop("plate_fallback"))
            for a in s.get("actors", []):
                if "fallback" in a:
                    a.setdefault("fallback_sprite", a.pop("fallback"))
    for bid, shots in merged.items():
        if not MIN_SHOTS <= len(shots) <= MAX_SHOTS:
            errs.append(f"{bid}: {len(shots)} shots (want {MIN_SHOTS}-{MAX_SHOTS})")
        for i, s in enumerate(shots):
            where = f"{bid}[{i}]"
            if s.get("k") == "scene":
                if s["plate"] not in ok_plates:
                    errs.append(f"{where}: unknown plate {s['plate']}")
                if not s.get("why", "").strip():
                    errs.append(f"{where}: missing why")
                if s.get("cam", {}).get("move", "hold") not in CAM_MOVES:
                    errs.append(f"{where}: bad cam move")
                for a in s.get("actors", []):
                    if a["sprite"] not in ok_sprites:
                        errs.append(f"{where}: unknown sprite {a['sprite']}")
                for p in s.get("props", []):
                    if p["kind"] not in PROP_KINDS:
                        errs.append(f"{where}: unknown prop {p['kind']}")
            elif s.get("k") not in CARD_KINDS:
                errs.append(f"{where}: unknown kind {s.get('k')}")

    # cross-beat rules over the episode order
    flat = [(b["id"], i, s) for b in beats["beats"] for i, s in enumerate(merged.get(b["id"], []))]
    sig = lambda s: (s.get("plate"), tuple(a["sprite"] for a in s.get("actors", [])), s.get("cam", {}).get("move"))
    for (b0, i0, s0), (b1, i1, s1) in zip(flat, flat[1:]):
        if s0.get("k") == s1.get("k") == "scene" and sig(s0) == sig(s1):
            errs.append(f"{b1}[{i1}]: same plate+pose+camera as previous shot")
    for n in range(len(flat) - CARD_WINDOW + 1):
        win = flat[n:n + CARD_WINDOW]
        if sum(s.get("k") in CARD_KINDS for _, _, s in win) > 1:
            errs.append(f"{win[0][0]}[{win[0][1]}]: >1 card within {CARD_WINDOW} shots")

    if errs:
        print(f"{len(errs)} problems:")
        for e in errs[:80]:
            print(" -", e)
        return 1

    (PUB / "directed_full.json").write_text(json.dumps({"shots": merged, "needed_plates": list(need_plates.values()),
                                                         "needed_poses": list(need_poses.values())}, indent=1), encoding="utf-8")
    # timeline: split each beat's duration by shot weight
    by_id = {b["id"]: b for b in tl["beats"]}
    for b in beats["beats"]:
        b["shots"] = len(merged[b["id"]])
        tb = by_id[b["id"]]
        ws = [float(s.get("w", 1.0)) for s in merged[b["id"]]]
        total, t, out = sum(ws), tb["start"], []
        for j, w in enumerate(ws):
            dur = tb["start"] + tb["dur"] - t if j == len(ws) - 1 else round(tb["dur"] * w / total)
            out.append({"start": t, "dur": dur})
            t += dur
        tb["shots"] = out
    (PUB / "beats_full.json").write_text(json.dumps(beats, indent=1), encoding="utf-8")
    (PUB / "timeline_full.json").write_text(json.dumps(tl), encoding="utf-8")
    kinds = [s["k"] for _, _, s in flat]
    print(f"OK {len(merged)} beats, {len(flat)} shots ({kinds.count('scene')} scene), "
          f"{len(need_plates)} needed plates, {len(need_poses)} needed poses")
    return 0


if __name__ == "__main__":
    sys.exit(main())
