"""Retention lint: the docs/growth-playbook.md rules, enforced before anything renders.

Runs after voicing (real line durations are known). A failing episode does not render unless
make.py is given --allow-retention (deliberate exceptions only). Thresholds come from the
retention research (2026-10-27) and ep01's own data (most viewers left at 0:01).
"""
from dataclasses import dataclass

from .align import spoken_len

TOTAL_TARGET_SEC = 45  # new account: shorter = more completions
TOTAL_MAX_SEC = 59.5  # stay under 60 s so Duet/Stitch remain available
HOOK_MAX_SEC = 4.0  # the opening scene must state its stakes fast
MAX_STATIC_SEC = 4.5  # a visual change (cut/push/new element) at least this often
MAX_PUSH_SEC = 7.0  # a slow camera push counts as change, but not forever
RULES_CARD_MAX_SEC = 4.0  # never read a rules list out: show, then teach just-in-time
DEAD_AIR_MAX_SEC = 1.0  # extra pause after a line, except the freeze / end card


@dataclass
class Finding:
    level: str  # "FAIL" stops the render, "WARN" is printed
    scene: str
    message: str


def _scene_sec(scene: dict, timing: dict) -> float:
    line = timing[scene["id"]]["duration"]
    extra = scene.get("countdown", 0) if scene.get("countdownAt") is None else 0
    return scene.get("padBefore", 0) + line + scene.get("padAfter", 0) + extra


def check(episode: dict, timing: dict) -> list[Finding]:
    out: list[Finding] = []
    scenes = episode["scenes"]
    total = sum(_scene_sec(s, timing) for s in scenes)
    if total > TOTAL_MAX_SEC:
        out.append(Finding("FAIL", "episode", f"{total:.1f}s long; must stay under {TOTAL_MAX_SEC:.0f}s"))
    elif total > TOTAL_TARGET_SEC:
        out.append(Finding("WARN", "episode", f"{total:.1f}s long; target is {TOTAL_TARGET_SEC}s while the account is new"))

    first = scenes[0]
    first_sec = _scene_sec(first, timing)
    if first_sec > HOOK_MAX_SEC:
        out.append(Finding("FAIL", first["id"], f"hook scene is {first_sec:.1f}s; the stakes must land within {HOOK_MAX_SEC:.0f}s"))
    if not (first.get("title") or first.get("hits") or first.get("sfx")):
        out.append(Finding("FAIL", first["id"], "hook has no on-screen title and no sound hit: frame 1 must grab (visual + text + sound)"))

    for s in scenes:
        sec = _scene_sec(s, timing)
        kind = s.get("type")
        if s.get("rulesView") == "big" and sec > RULES_CARD_MAX_SEC:
            out.append(Finding("FAIL", s["id"], f"rules card held {sec:.1f}s; show it for at most {RULES_CARD_MAX_SEC:.0f}s and teach each rule when it is tested"))
        if kind not in ("freeze", "endcard") and s.get("padAfter", 0) > DEAD_AIR_MAX_SEC:
            out.append(Finding("WARN", s["id"], f"{s['padAfter']:.1f}s of dead air after the line"))
        if kind == "endcard":
            continue
        # longest stretch without a cut; a camera push stretches the allowance
        cuts = sorted({0.0, *[sh.get("at", 0) for sh in s.get("shots", [])], 1.0})
        line = timing[s["id"]]["duration"]
        longest = max((b - a) * line for a, b in zip(cuts, cuts[1:])) + s.get("padAfter", 0)
        cam = s.get("camera", {})
        moving = cam.get("from", 1) != cam.get("to", cam.get("from", 1))
        limit = MAX_PUSH_SEC if moving else MAX_STATIC_SEC
        if longest > limit:
            out.append(Finding("FAIL" if longest > limit * 1.5 else "WARN", s["id"], f"{longest:.1f}s without a cut ({'push' if moving else 'static'} limit {limit}s)"))
    return out


def estimate(episode: dict, letters_per_sec: float) -> dict:
    """Timing stand-in before voicing: each line's length at the measured speaking rate, so a
    script that would fail is fixed for free instead of spending a quota'd TTS request."""
    rate = letters_per_sec * float(episode.get("tempo", 1.0))
    return {s["id"]: {"duration": spoken_len(s["say"]) / rate} for s in episode["scenes"]}


def report(findings: list[Finding]) -> bool:
    """Print findings; True when nothing blocks the render."""
    if not findings:
        print("  retention: all rules pass")
        return True
    for f in findings:
        print(f"  retention {f.level}: [{f.scene}] {f.message}")
    return not any(f.level == "FAIL" for f in findings)
