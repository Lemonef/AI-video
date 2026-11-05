"""Gate for the takrut01 asset build: every bg/cast id the episode names must be registered,
and every room still must exist at the canvas size (read from src/lib/tokens.ts)."""
import json
import re
import struct
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
EP = json.loads((ROOT / "episodes" / "takrut01.json").read_text(encoding="utf-8"))
ROOMS = ["find", "ancient", "coinflood", "reset"]


def _canvas():
    tokens = (ROOT / "src" / "lib" / "tokens.ts").read_text(encoding="utf-8")
    w = int(re.search(r"\bW\s*=\s*(\d+)", tokens).group(1))
    h = int(re.search(r"\bH\s*=\s*(\d+)", tokens).group(1))
    return w, h


def _png_size(path):
    head = path.read_bytes()[:24]
    assert head[:8] == b"\x89PNG\r\n\x1a\n", path
    return struct.unpack(">II", head[16:24])


def _registered(source, key):
    return re.search(rf"^\s*{re.escape(key)}\s*:", source, re.M) is not None


def test_every_background_is_registered():
    forest = (ROOT / "src" / "v5" / "Forest.tsx").read_text(encoding="utf-8")
    bgs = {s["bg"] for s in EP["scenes"]} | {EP.get("coverBg")} - {None}
    missing = [b for b in bgs if not _registered(forest, b)]
    assert not missing, missing


def test_every_cast_member_is_registered():
    cast = (ROOT / "src" / "v2" / "cast.ts").read_text(encoding="utf-8")
    who = {c["who"] for s in EP["scenes"] for c in s.get("cast", [])}
    who |= {EP.get("coverCast")} - {None}
    missing = [w for w in who if not _registered(cast, w)]
    assert not missing, missing


def test_room_stills_exist_at_canvas_size():
    size = _canvas()
    for room in ROOMS:
        png = ROOT / "public" / "takrut01" / f"{room}.png"
        assert png.exists(), png
        assert _png_size(png) == size, (png, _png_size(png), size)


def test_flux_script_never_prints_keys():
    src = (ROOT / "scripts" / "gen_bg_flux.py").read_text(encoding="utf-8")
    assert ".secrets" in src
    assert not re.search(r"print\([^)]*(key|token)", src, re.I)
