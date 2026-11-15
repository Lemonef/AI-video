"""Layout guard: the tracked tree must match tests/architecture.json and ARCHITECTURE.md."""
import json
import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SPEC = json.loads((ROOT / "tests" / "architecture.json").read_text(encoding="utf-8"))


def tracked():
    out = subprocess.run(["git", "ls-files", "-co", "--exclude-standard"], cwd=ROOT, capture_output=True, text=True,
                         check=True, stdin=subprocess.DEVNULL).stdout
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
        if rule["depth"] is not None and len(p.parts) > rule["depth"]:
            bad.append(f"too deep: {p}")
        asset_area = len(p.parts) > 2 and p.parts[1] in SPEC["asset_subdirs"].get(p.parts[0], [])
        if rule["ext"] and not asset_area and p.suffix.lower() not in rule["ext"]:
            bad.append(f"bad extension: {p}")
    assert not bad, "\n".join(bad[:20])


def test_docs_top_level_is_loose_guides_only():
    bad = [str(p) for p in tracked() if p.parts[0] == "docs" and len(p.parts) == 2 and p.suffix not in SPEC["docs_loose_ext"]]
    assert not bad, bad


def test_src_top_has_no_version_or_style_folders():
    tops = {p.parts[1] for p in tracked() if p.parts[0] == "engine" and len(p.parts) > 2}
    allowed = set(SPEC["legacy_src_tops"]) | set(SPEC["render_entries"])
    bad = [t for t in tops - allowed for pre in SPEC["forbidden_src_top_prefixes"] if re.fullmatch(rf"{pre}\d*\w*", t) and re.search(r"\d", t)]
    assert not bad, f"per-version/style folders at engine top: {bad}"


def test_render_entries_are_real_entry_points():
    # an exemption must point at a separate Remotion entry, or it hides a per-version copy
    fake = [e for e in SPEC["render_entries"] if not (ROOT / "engine" / e / "index.tsx").is_file()]
    assert not fake, f"render_entries without engine/<name>/index.tsx: {fake}"


def test_architecture_md_lists_exactly_the_declared_dirs():
    text = (ROOT / "ARCHITECTURE.md").read_text(encoding="utf-8")
    folders = text.split("## Folders", 1)[1].split("\n## ", 1)[0]
    rows = set(re.findall(r"^\| `([a-z_]+)/` \|", folders, re.M))
    declared = set(SPEC["top_level_dirs"]) | set(SPEC["ignored_dirs"])
    assert rows == declared, f"missing rows: {declared - rows}; undeclared rows: {rows - declared}"


def test_legacy_src_entries_still_exist():
    # the frozen list must shrink as folders move; a stale entry hides a re-added one
    tops = {p.parts[1] for p in tracked() if p.parts[0] == "engine" and len(p.parts) > 2}
    stale = set(SPEC["legacy_src_tops"]) - tops
    assert not stale, f"remove from legacy_src_tops (already moved): {stale}"


def test_ignored_dirs_are_never_tracked():
    bad = [str(p) for p in tracked() if p.parts[0] in SPEC["ignored_dirs"]]
    assert not bad, f"renders/logs must stay gitignored: {bad[:5]}"


# Output layout on disk (gitignored, so tracked() cannot see it). Zen 2026-11-16: superseded cuts, previews,
# stills and logs kept piling up in draft/ root and out/ was never emptied - a note did not stop it, this does.
# Zen 2026-11-16 ("why is this still out alone"): a lone cut beside two folders reads as misplaced, so draft/
# root holds folders only and the current cut gets its own folder.
DRAFT_SUBDIRS = {"current", "versions", "previews"}  # change together with ARCHITECTURE.md '## Practices' output line


def test_output_dirs_follow_the_layout():
    bad = [f"top-level out/ exists: {p}" for p in [ROOT / "out"] if p.exists()]
    for draft in ROOT.glob("videos/*/*/draft"):
        bad += [f"{p}: draft/ root holds folders only (cut -> current/, old -> versions/, compressed -> previews/)"
                for p in draft.iterdir() if p.is_file()]
        current = draft / "current"
        if current.is_dir() and len(cuts := list(current.glob("*.mp4"))) > 1:
            bad.append(f"{current}: {len(cuts)} cuts, keep only the current one (old -> versions/)")
        bad += [f"{p}: draft/ subdir must be one of {sorted(DRAFT_SUBDIRS)}" for p in draft.iterdir()
                if p.is_dir() and p.name not in DRAFT_SUBDIRS]
        for sub in DRAFT_SUBDIRS:
            if (draft / sub).is_dir():
                bad += [f"{p}: only .mp4 in {sub}/" for p in (draft / sub).iterdir() if p.suffix != ".mp4"]
    assert not bad, "\n".join(bad)
