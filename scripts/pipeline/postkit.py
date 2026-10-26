"""Post kit: everything Zen needs to post an episode by hand (see docs/growth-playbook.md).

Writes into the episode's own folder (out/final/<ep>/): post.txt (caption, pinned comment,
hashtags, posting checklist), cover.png (the hook frame) and script.md (readable script).
"""
import shutil
import subprocess
from pathlib import Path

# Genre-neutral defaults (scary / funny / shop all share them); episodes add their own genre tags.
DEFAULT_TAGS = ["#jaabstory", "#จ๊าบ", "#จะเกิดอะไรขึ้นถ้า", "#animation", "#storytime"]
CHECKLIST = [
    "Cover = the -cover.png (also the playlist thumbnail)",
    "Add to the arc's playlist, in order",
    "Pin the comment above right after posting",
    "Reply to the first comments within 30-60 min",
    "Next part = reply-to-comment video on the winning choice",
]


def write(final_dir: Path, episode: dict, render_still) -> Path:
    post = episode.get("post", {})
    hook = post.get("hook") or episode["scenes"][0].get("caption") or episode["scenes"][0]["say"]
    end = next((s for s in episode["scenes"] if s.get("type") == "endcard"), {})
    question = post.get("question") or f"A) {end.get('a', '')}  หรือ  B) {end.get('b', '')} ?"
    part = post.get("part")
    pin = post.get("pin", f"📌 A = {end.get('a', '')} · B = {end.get('b', '')}\nคนส่วนใหญ่เลือกอะไร จ๊าบทำตามนั้น!")
    lines = [
        "1) PASTE INTO 'DESCRIPTION' (whole block):",
        "",
        f"{'ตอนที่ ' + str(part) + ' · ' if part else ''}{hook.replace('*', '')}",
        question,
        f"คอมเมนต์ A หรือ B 👇 {post.get('next', 'ตอนต่อไปมาแน่')}",
        " ".join(post.get("hashtags", DEFAULT_TAGS)),
        "",
        "2) ON THE UPLOAD PAGE:",
        "- Cover: cover.png (from this folder)",
        "- When to post: Schedule -> 20:00",
        "- Who can see: Everyone · High-quality uploads: ON",
        "- Show more: AI-generated content ON · comments ON · Duet/Stitch ON · Disclose post content OFF",
        "",
        "3) RIGHT AFTER IT GOES LIVE: post this comment, then hold it -> Pin:",
        "",
        pin,
        "",
        "4) THEN:",
        *[f"[ ] {c}" for c in CHECKLIST if not c.startswith(("Cover", "Pin"))],
    ]
    out = final_dir / "post.txt"
    out.write_text("\n".join(lines) + "\n", encoding="utf-8")
    write_script(final_dir, episode)
    render_still(final_dir / "cover.png", post.get("coverFrame", 45))
    return out


def write_script(folder: Path, episode: dict) -> Path:
    """Human-readable script: what is said, what is shown, per scene."""
    lines = [f"# {episode.get('title', episode['id'])}", "", f"Voice: {episode.get('engine', 'edge')} / {episode.get('voice', '')}", ""]
    for i, s in enumerate(episode["scenes"], 1):
        lines.append(f"## {i}. {s['id']}" + (f"  ({s['tone']})" if s.get("tone") else ""))
        lines.append(f"- พูด: {s['say']}")
        if s.get("caption") and s["caption"] != s["say"]:
            lines.append(f"- ซับ: {s['caption'].replace('*', '')}")
        if s.get("type") == "endcard":
            lines.append(f"- A: {s.get('a', '')}")
            lines.append(f"- B: {s.get('b', '')}")
        lines.append("")
    path = folder / "script.md"
    path.write_text("\n".join(lines), encoding="utf-8")
    return path


def remotion_still(root: Path, props: Path):
    """Renders the series Cover template (src/compositions/Cover) with the episode's props."""
    npx = shutil.which("npx") or "npx"

    def render(png: Path, _frame: int) -> None:  # the Cover template is a still; frame kept for the call signature
        subprocess.run([npx, "remotion", "still", "src/index.ts", "Cover", str(png), f"--props={props}", "--log=error"], cwd=root, check=True)

    return render

