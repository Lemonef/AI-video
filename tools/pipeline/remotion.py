"""The one place that builds a Remotion CLI command, so every render reads a staged public dir.

Remotion takes ONE public dir per render (--public-dir, Remotion 4.0.539 publicDirOption) and
defaults to <root>/public/. Layout v2 has no root public/, so every caller passes the dir that
tools/pipeline/stage.py built, as an absolute path (the CLI resolves relative ones against cwd).
"""
from __future__ import annotations

import shutil
from pathlib import Path

ENTRY = "engine/index.ts"


def npx() -> str | None:
    """npx.cmd first (the order reference_gate used): the Windows shim subprocess starts without a shell."""
    return shutil.which("npx.cmd") or shutil.which("npx")


def command(verb: str, composition: str, out: Path, public_dir: Path, *args: str) -> list[str]:
    """`npx remotion <render|still> engine/index.ts <composition> <out> --public-dir=<abs> *args`."""
    return [npx() or "npx", "remotion", verb, ENTRY, composition, str(out),
            f"--public-dir={Path(public_dir).resolve()}", *args]
