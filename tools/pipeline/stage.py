"""Stage the one public dir a render reads, and check every staticFile() path against it.

    python -I tools/pipeline/stage.py ep03        # stage .build/unsorted-ep03/public/, run the gate
    python -I tools/pipeline/stage.py --shared    # stage .build/shared/public/ (no video), run the gate

Staging (plan D2): every tree from layout.stage_sources() is hardlinked at the staged ROOT, so
the old public/ paths keep working (staticFile('ep03/a.mp3') finds assets/ep03/a.mp3). os.link
falls back to a copy (another volume, a filesystem without links). A path two sources both
provide is skipped when the bytes match and fails loudly when they differ: no source silently
wins. The staged dir is rebuilt on every call; it holds only links and copies, never an
original, and staged files are never edited in place (a hardlink edit would change the source).

The gate greps every staticFile( call in engine/ and resolves its argument: string literals,
template prefixes, constant tables (SFX.pop), helper functions (sfxFile) and function
parameters (localFont's file) are followed to the paths they can produce; data-driven
arguments (timing.audio) are checked from the staged <id>/timing.json when there is one.
A path that is missing is a failure unless git ignores it in a source it could come from: such
data never reaches a fresh clone, so it is reported as unverifiable instead.
"""
from __future__ import annotations

import argparse
import filecmp
import json
import os
import re
import shutil
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from pipeline import layout  # noqa: E402

ROOT = Path(__file__).resolve().parents[2]
ENGINE = "engine"
SOURCE_EXTS = (".ts", ".tsx")
CALL = "staticFile("


class StageCollision(RuntimeError):
    pass


def _place(src: Path, target: Path) -> None:
    target.parent.mkdir(parents=True, exist_ok=True)
    try:
        os.link(src, target)
    except OSError:
        shutil.copy2(src, target)


def stage(root: Path, episode_id: str | None) -> Path:
    """Build the staged public dir for one video (None = shared trees only); return its path."""
    dest = layout.stage_dir(root, episode_id)
    build = (root / layout.BUILD).resolve()
    if not dest.resolve().is_relative_to(build):
        raise ValueError(f"staged dir {dest} is outside {build}")
    if dest.exists():
        shutil.rmtree(dest)  # links/copies only: see the module docstring
    dest.mkdir(parents=True)
    owner: dict[Path, Path] = {}
    for tree in layout.stage_sources(root, episode_id):
        for src in sorted(p for p in tree.rglob("*") if p.is_file()):
            rel = src.relative_to(tree)
            target = dest / rel
            if rel in owner:
                if filecmp.cmp(owner[rel], src, shallow=False):
                    continue
                raise StageCollision(f"{rel.as_posix()}: {owner[rel]} and {src} differ; "
                                     "remove or rename one (staging never picks a winner)")
            _place(src, target)
            owner[rel] = src
    return dest


# ---- staticFile gate -------------------------------------------------------------------------

_STR = re.compile(r"""(['"])((?:(?!\1).)*)\1|`([^`]*)`""")


def _balanced(text: str, start: int) -> str:
    """Text from `start` (just after an open paren) up to its matching close paren."""
    depth = 1
    for i in range(start, len(text)):
        depth += {"(": 1, ")": -1}.get(text[i], 0)
        if depth == 0:
            return text[start:i]
    raise ValueError("unbalanced parentheses")


def _split_args(args: str) -> list[str]:
    out, depth, cur = [], 0, ""
    for ch in args:
        depth += {"(": 1, "[": 1, "{": 1, ")": -1, "]": -1, "}": -1}.get(ch, 0)
        if ch == "," and depth == 0:
            out.append(cur.strip())
            cur = ""
        else:
            cur += ch
    return out + [cur.strip()] if cur.strip() else out


class _Engine:
    """Engine sources, searched for the definitions a staticFile argument refers to."""

    def __init__(self, root: Path):
        self.files = {p: p.read_text(encoding="utf-8") for p in sorted((root / ENGINE).rglob("*"))
                      if p.suffix in SOURCE_EXTS}

    def calls(self, name: str):
        for path, text in self.files.items():
            for m in re.finditer(rf"(?<![\w.]){re.escape(name)}\(", text):
                yield path, text, m.end()

    def table(self, name: str, key: str) -> list[str]:
        """'x' from `const NAME = {key: 'x', ...}`."""
        for text in self.files.values():
            m = re.search(rf"const {re.escape(name)}\s*=\s*\{{([^}}]*)\}}", text)
            if m:
                k = re.search(rf"\b{re.escape(key)}\s*:\s*(['\"])(.*?)\1", m.group(1))
                if k:
                    return [k.group(2)]
        return []

    def function(self, name: str) -> tuple[list[str], str] | None:
        """(parameter names, body) of `const NAME = (params) => body`, one line."""
        for text in self.files.values():
            m = re.search(rf"const {re.escape(name)}\s*=\s*\(([^)]*)\)[^=\n]*=>(.*)", text)
            if m:
                return [p.split(":")[0].split("=")[0].strip() for p in m.group(1).split(",")], m.group(2)
        return None

    def enclosing_function(self, text: str, at: int) -> tuple[str, list[str]] | None:
        """Name and parameters of the nearest `const NAME = (params) =>` before `at`."""
        found = None
        for m in re.finditer(r"const (\w+)\s*=\s*\(([^)]*)\)[^=\n]*=>", text[:at]):
            found = m.group(1), [p.split(":")[0].split("=")[0].strip() for p in m.group(2).split(",")]
        return found


def _patterns(arg: str, eng: _Engine, text: str, at: int, depth: int = 0) -> list[tuple[str, str]]:
    """[(kind, value)]: ('file', path) | ('dir', prefix) | ('data', expression)."""
    arg = arg.strip()
    lit = _STR.fullmatch(arg)
    if lit:
        if lit.group(3) is None:
            return [("file", lit.group(2))]
        tmpl = lit.group(3)
        if "${" not in tmpl:
            return [("file", tmpl)]
        return [("dir", tmpl.split("${")[0].rsplit("/", 1)[0])]
    member = re.fullmatch(r"(\w+)\.(\w+)", arg)
    if member and (hit := eng.table(*member.groups())):
        return [("file", v) for v in hit]
    call = re.fullmatch(r"(\w+)\((.*)\)", arg, re.S)
    if call and depth < 3 and (fn := eng.function(call.group(1))):
        found = [p for m in _STR.finditer(fn[1]) for p in _patterns(m.group(0), eng, text, at, depth + 1)]
        if found:
            return found
    if re.fullmatch(r"\w+", arg) and depth < 3 and (enc := eng.enclosing_function(text, at)) and arg in enc[1]:
        index = enc[1].index(arg)
        out = []
        for _, ctext, cstart in eng.calls(enc[0]):
            args = _split_args(_balanced(ctext, cstart))
            if index < len(args):
                out += _patterns(args[index], eng, ctext, cstart, depth + 1)
        if out:
            return out
    return [("data", arg)]


def _ignored(root: Path, rel: str, kind: str, episode_id: str | None) -> bool:
    """True when git ignores this path in a source it could be staged from (its home is local data)."""
    sources = [layout.ENGINE_SHARED, layout.LEGACY_PUBLIC]
    if episode_id:
        sources.insert(1, layout.assets_dir(Path(), episode_id).as_posix())
    # A dir that is not on disk only matches dir-only rules (`sfx/`) when git is told it is a dir.
    tail = "/" if kind == "dir" else ""
    paths = [f"{s}/{rel}{tail}" for s in sources]
    run = subprocess.run(["git", "check-ignore", "--no-index", *paths], cwd=root, capture_output=True,
                         text=True, stdin=subprocess.DEVNULL)
    return bool(run.stdout.strip())


def gate(root: Path, staged: Path, episode_id: str | None) -> int:
    """Print one line per staticFile path; return the number of failures."""
    eng = _Engine(root)
    checks: list[tuple[str, str, str]] = []  # (site, kind, value)
    for path, text in eng.files.items():
        for m in re.finditer(re.escape(CALL), text):
            site = f"{path.relative_to(root).as_posix()}:{text.count(chr(10), 0, m.start()) + 1}"
            for kind, value in _patterns(_balanced(text, m.end()), eng, text, m.start()):
                checks.append((site, kind, value))
    timing = staged / episode_id / "timing.json" if episode_id else None
    if timing and timing.is_file():
        for sid, entry in json.loads(timing.read_text(encoding="utf-8")).items():
            if isinstance(entry, dict) and entry.get("audio"):
                checks.append((f"{episode_id}/timing.json:{sid}", "file", entry["audio"]))
    failures = 0
    for site, kind, value in checks:
        if kind == "data":
            status = "data (value comes from props; not checkable here)"
        elif (staged / value).is_file() if kind == "file" else (staged / value).is_dir():
            status = "ok"
        elif _ignored(root, value, kind, episode_id):
            status = "unverifiable (gitignored data, not in this checkout)"
        else:
            status = "MISSING"
            failures += 1
        print(f"{status}: {kind} {value}  <- {site}")
    print(f"staticFile gate: {len(checks)} paths, {failures} missing")
    return failures


def main() -> None:
    ap = argparse.ArgumentParser(description="Stage a render's public dir and check staticFile paths")
    who = ap.add_mutually_exclusive_group(required=True)
    who.add_argument("episode", nargs="?", help="episode id, e.g. ep03")
    who.add_argument("--shared", action="store_true", help="stage the shared trees only (no video)")
    args = ap.parse_args()
    staged = stage(ROOT, None if args.shared else args.episode)
    print(f"staged: {staged}")
    sys.exit(1 if gate(ROOT, staged, None if args.shared else args.episode) else 0)


if __name__ == "__main__":
    main()
