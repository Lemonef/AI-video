"""Post kit: everything Zen needs to post an episode by hand (see docs/growth-playbook.md).

Writes out/final/<ep>.post.txt (caption, pinned comment, hashtags, posting checklist) and
out/final/<ep>-cover.png (the hook frame) from the episode's optional `post` block.
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
    ep_id = episode["id"]
    hook = post.get("hook") or episode["scenes"][0].get("caption") or episode["scenes"][0]["say"]
    end = next((s for s in episode["scenes"] if s.get("type") == "endcard"), {})
    question = post.get("question") or f"A) {end.get('a', '')}  หรือ  B) {end.get('b', '')} ?"
    part = post.get("part")
    lines = [
        "== CAPTION ==",
        f"{'ตอนที่ ' + str(part) + ' · ' if part else ''}{hook.replace('*', '')}",
        question,
        f"เลือกแล้วคอมเมนต์ A หรือ B 👇 {post.get('next', 'ตอนต่อไปมาแน่')}",
        " ".join(post.get("hashtags", DEFAULT_TAGS)),
        "",
        "== PINNED COMMENT ==",
        post.get("pin", f"📌 A = {end.get('a', '')} · B = {end.get('b', '')} — เสียงส่วนใหญ่เลือกอะไร จ๊าบทำตามนั้น!"),
        "",
        "== CHECKLIST ==",
        *[f"[ ] {c}" for c in CHECKLIST],
    ]
    out = final_dir / f"{ep_id}.post.txt"
    out.write_text("\n".join(lines) + "\n", encoding="utf-8")
    render_still(final_dir / f"{ep_id}-cover.png", post.get("coverFrame", 45))
    return out


def remotion_still(root: Path, props: Path):
    npx = shutil.which("npx") or "npx"

    def render(png: Path, frame: int) -> None:
        subprocess.run([npx, "remotion", "still", "src/index.ts", "Episode", str(png), f"--frame={frame}", f"--props={props}", "--log=error"], cwd=root, check=True)

    return render

