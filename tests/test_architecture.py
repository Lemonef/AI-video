"""Layout guard: the tracked tree must match tests/architecture.json and ARCHITECTURE.md."""
import json
import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SPEC = json.loads((ROOT / "tests" / "architecture.json").read_text(encoding="utf-8"))


def tracked():
    out = subprocess.run(["git", "ls-files", "-co", "--exclude-standard"], cwd=ROOT, capture_output=True, text=True, check=True).stdout
    return [Path(p) for p in out.splitlines() if p]


def test_top_level_dirs_and_files_are_declared():
    dirs, files = set(), set()
    for p in tracked():
        (dirs if len(p.parts) > 1 else files).add(p.parts[0])
    assert dirs <= set(SPEC["top_level_dirs"]), f"undeclared top-level dirs: {dirs - set(SPEC['top_level_dirs'])}"
    assert files <= set(SPEC["top_level_files"]), f"undeclared top-level files: {files - set(SPEC['top_level_files'])}"


def test_depth_and_extensions_per_dir():
    bad = []
    for p in tracked():
        rule = SPEC["top_level_dirs"].get(p.parts[0])
        if rule is None:
            continue
        if len(p.parts) > rule["depth"]:
            bad.append(f"too deep: {p}")
        if rule["ext"] and p.suffix.lower() not in rule["ext"]:
            bad.append(f"bad extension: {p}")
    assert not bad, "\n".join(bad[:20])


def test_docs_top_level_is_loose_guides_only():
    bad = [str(p) for p in tracked() if p.parts[0] == "docs" and len(p.parts) == 2 and p.suffix not in SPEC["docs_loose_ext"]]
    assert not bad, bad


def test_src_top_has_no_version_or_style_folders():
    tops = {p.parts[1] for p in tracked() if p.parts[0] == "engine" and len(p.parts) > 2}
    legacy = set(SPEC["legacy_src_tops"])
    bad = [t for t in tops - legacy for pre in SPEC["forbidden_src_top_prefixes"] if re.fullmatch(rf"{pre}\d*\w*", t) and re.search(r"\d", t)]
    assert not bad, f"per-version/style folders at engine top: {bad}"


def test_architecture_md_lists_every_declared_dir():
    text = (ROOT / "ARCHITECTURE.md").read_text(encoding="utf-8")
    rows = set(re.findall(r"^\| `([a-z]+)/` \|", text, re.M))
    assert rows >= set(SPEC["top_level_dirs"]) | {"out"}, f"missing rows: {(set(SPEC['top_level_dirs']) | {'out'}) - rows}"


def test_legacy_src_entries_still_exist():
    # the frozen list must shrink as folders move; a stale entry hides a re-added one
    tops = {p.parts[1] for p in tracked() if p.parts[0] == "engine" and len(p.parts) > 2}
    stale = set(SPEC["legacy_src_tops"]) - tops
    assert not stale, f"remove from legacy_src_tops (already moved): {stale}"


def test_out_dir_is_never_tracked():
    bad = [str(p) for p in tracked() if p.parts[0] == "out"]
    assert not bad, f"renders/logs must stay gitignored: {bad[:5]}"
