"""Post kit: everything Zen needs to post an episode by hand (see docs/growth-playbook.md).

Writes into the episode's own folder (out/final/<ep>/): post.txt (caption, pinned comment,
hashtags, posting checklist), cover.png (the hook frame) and script.md (readable script).
"""
import shutil
import subprocess
from pathlib import Path

# Hashtags are a minor search signal now: 3-5 specific Thai tags beat broad English ones
# (#animation reaches the wrong audience; #จ๊าบ is also slang for "cool"). The caption's first
# ~50 characters carry the search phrase instead (docs/growth-playbook.md, Captions and search).
DEFAULT_TAGS = ["#jaabstory"]
MAX_TAGS = 5
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
    nxt = post.get("next", "ตอนต่อไปมาแน่")
    pin = post.get("pin", f"📌 A = {end.get('a', '')} · B = {end.get('b', '')}\nคนส่วนใหญ่เลือกอะไร จ๊าบทำตามนั้น! {nxt}")
    tags = post.get("hashtags", DEFAULT_TAGS)
    if len(tags) > MAX_TAGS:
        raise ValueError(f"{len(tags)} hashtags; keep {MAX_TAGS} or fewer, specific ones")
    label = f"ตอน {part}/{post['total']}" if part and post.get("total") else (f"ตอน {part}" if part else "")
    first = " · ".join(x for x in (post.get("keyword"), label) if x)  # search phrase inside the first ~50 chars
    lines = [
        "1) PASTE INTO 'DESCRIPTION' (whole block):",
        "",
        f"{first + ' · ' if first else ''}{hook.replace('*', '')}",
        question,
        f"คอมเมนต์ A หรือ B 👇 {nxt}",
        " ".join(tags),
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
        "",
        "5) INSTAGRAM REELS (same video.mp4, same time):",
        "- Caption: the same block as 1)",
        "- Cover: cover.png (it is kept inside IG's 3:4 profile-grid crop)",
        "- Share to Feed: ON · AI label: ON",
        "- After posting: the same comment as 3), then pin it",
        "- Next part: use 'Link a reel' to point this one at part 2",
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

