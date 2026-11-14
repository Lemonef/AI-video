"""Post kit: everything Zen needs to post an episode by hand (see docs/growth-playbook.md).

Writes into the episode's own folder (out/final/<ep>/): post.txt (caption, pinned comment,
hashtags, posting checklist), cover.png (the hook frame) and script.md (readable script).
"""
import shutil
import subprocess
from pathlib import Path

# Hashtags: Thai tags with measured volume (YouTube /hashtag counts in the brain,
# corrections/2026-11-02-hashtags-picked-without-volume.md), listed per episode biggest-first.
# Broad English tags reach the wrong audience; #จ๊าบ is also slang for "cool". The series tag
# always goes first so every part links together, even though its own pool is small.
SERIES_TAG = "#jaabstory"
IG_MAX_TAGS = 5    # Instagram cap since Dec 2025 (caption + comments count together)
YT_MAX_TAGS = 15   # YouTube ignores ALL hashtags when there are more than 15
CHECKLIST = [
    "Cover = the -cover.png (also the playlist thumbnail)",
    "Add to the arc's playlist, in order",
    "Pin the comment above right after posting",
    "Reply to the first comments within 30-60 min",
    "Next part = reply-to-comment video on the winning choice",
]
# Ready replies for the comments that come up on every post, in jaab's voice. Gender-neutral
# on purpose (no ครับ/ค่ะ): the account speaks as the series, not as one person. An episode
# overrides or adds lines with post.replies {"<when someone comments...>": "<reply>"}.
VOTE_REPLIES = {
    "A": "ทีม A +1 แล้ว 😆 ตอนนี้ใครนำอยู่น้า รอดูตอนหน้าเลย",
    "B": "ทีม B +1 แล้ว 😆 ตอนนี้ใครนำอยู่น้า รอดูตอนหน้าเลย",
    "a different idea / both": "ไอเดียนี้ก็เด็ดนะ 😂 แต่รอบนี้ต้องเลือก A หรือ B นะ เลือกให้หน่อย",
}
FINALE_REPLIES = {
    "guessed the ending": "เดาเก่งมาก 👀 ดูออกตั้งแต่ตอนไหนเนี่ย",
    "wants more / a new story": "เรื่องใหม่กำลังมา กดติดตามไว้ก่อนนะ 🔔",
}
COMMON_REPLIES = {
    "when is the next part?": "ตอนต่อไปมาเร็ว ๆ นี้ กดติดตามไว้ก่อนนะ 🔔",
    "is this AI? / how is it made?": "ใช้ AI ช่วยทำภาพกับเสียง ส่วนเรื่องคิดเองทั้งหมดนะ 🙏",
    "laughing / praise": "ขอบคุณที่ดูนะ 🥹 ฝากแชร์ให้เพื่อนดูด้วยน้า",
    "tags a friend": "เพื่อนคนนี้เลือก A หรือ B ล่ะ? 👀",
    "story idea": "ไอเดียดีมาก! ขอเก็บไว้ก่อน อาจได้เห็นในตอนต่อไป 👀",
    "fair criticism (voice, quality, too long)": "ขอบคุณที่บอกนะ จดไว้แล้ว ตอนหน้าจะทำให้ดีขึ้น 🙏",
}
REPLY_RULES = [
    "Like every comment; reply to as many as you can in the first 30-60 min",
    "Troll / hate: no reply. Hide it (long-press -> Hide/Delete); answer only real feedback",
    "Never promise a date you have not scheduled",
]


def write(final_dir: Path, episode: dict, render_still) -> Path:
    post = episode.get("post", {})
    hook = post.get("hook") or episode["scenes"][0].get("caption") or episode["scenes"][0]["say"]
    end = next((s for s in episode["scenes"] if s.get("type") == "endcard"), {})
    question = post.get("question") or f"A) {end.get('a', '')}  หรือ  B) {end.get('b', '')} ?"
    part = post.get("part")
    nxt = post.get("next", "ตอนต่อไปมาแน่")
    # only an episode that ends on a choice asks for A/B; a finale asks an open question
    vote = bool(end.get("a") and end.get("b"))
    finale = bool(part and part == post.get("total") and not vote)
    pin = post.get("pin") or (
        f"📌 A = {end.get('a', '')} · B = {end.get('b', '')}\nคนส่วนใหญ่เลือกอะไร จ๊าบทำตามนั้น! {nxt}" if vote else f"📌 {question}\n{nxt}"
    )
    tags = [SERIES_TAG] + [t for t in post.get("hashtags", []) if t != SERIES_TAG]
    if len(tags) > YT_MAX_TAGS:
        raise ValueError(f"{len(tags)} hashtags; YouTube drops them all above {YT_MAX_TAGS}")
    ig_tags = tags[:IG_MAX_TAGS]  # the episode lists tags biggest-first, so the cut keeps the strongest
    label = f"ตอน {part}/{post['total']}" if part and post.get("total") else (f"ตอน {part}" if part else "")
    first = " · ".join(x for x in (post.get("keyword"), label) if x)  # search phrase inside the first ~50 chars
    lines = [
        "1) PASTE INTO 'DESCRIPTION' (whole block):",
        "",
        hook.replace('*', '') if finale else f"{first + ' · ' if first else ''}{hook.replace('*', '')}",
        nxt if finale else question,
        question if finale else (f"คอมเมนต์ A หรือ B 👇 {nxt}" if vote else nxt),
        " ".join(tags),
        "",
        "2) ON THE UPLOAD PAGE:",
        "- Cover: cover.png (from this folder)",
        "- When to post: Post now after review (today’s 20:00 slot has passed)" if post.get("publishNow") else "- When to post: Schedule -> 20:00",
        "- Who can see: Everyone · High-quality uploads: ON",
        "- Show more: AI-generated content ON · comments ON · Duet/Stitch ON · Disclose post content OFF",
        "",
        "3) RIGHT AFTER IT GOES LIVE: post this comment, then hold it -> Pin:",
        "",
        pin,
        "",
        "4) THEN:",
        *[f"[ ] {c}" for c in CHECKLIST if not c.startswith(("Cover", "Pin")) and not (finale and c.startswith("Next part"))],
        "",
        "5) INSTAGRAM REELS via Meta Business Suite (business.facebook.com -> Create reel; same video.mp4, same time):",
        "- Post to: Instagram only (untick Facebook unless you want it there too)",
        f"- Video: video.mp4 · Caption: the block in 1), but swap its hashtag line for this one (Instagram allows {IG_MAX_TAGS}):",
        f"  {' '.join(ig_tags)}",
        "- Cover: cover.png (it is kept inside IG's 3:4 profile-grid crop)",
        "- AI label: ON · Auto captions: OFF (the video has its own)",
        "- Schedule -> 20:00, the same time as TikTok",
        "- After it goes live: the same comment as 3), pinned (phone app: long-press the comment -> Pin)",
        "- Phone app, Edit reel: 'Link a reel' -> the previous part (Business Suite cannot link reels)",
        "",
        "6) YOUTUBE SHORTS (same video.mp4 - the original, never a TikTok download: watermarks get buried):",
        f"- Title: {' · '.join(x for x in (post.get('series'), label) if x)} · {hook.replace('*', '')}"[:100 + len("- Title: ")],
        "- Description: the complete description block in 1)" if finale else "- Description: lines 2-4 of the block in 1) (question, A/B + next time, hashtags)",
        "- Audience: No, it's not made for kids ('for kids' turns comments off)",
        "- Thumbnail (mobile): the opening title frame or the cover frame",
        "",
        "7) COMMENT REPLIES (copy, tweak a word so they do not all look identical):",
        *[f"- {when}: {reply}" for when, reply in replies(post, vote, finale).items()],
        *[f"  ! {rule}" for rule in REPLY_RULES],
    ]
    out = final_dir / "post.txt"
    out.write_text("\n".join(lines) + "\n", encoding="utf-8")
    write_script(final_dir, episode)
    render_still(final_dir / "cover.png", post.get("coverFrame", 45))
    return out


def replies(post: dict, vote: bool, finale: bool) -> dict:
    base = dict(VOTE_REPLIES) if vote else {}
    if finale:
        base.update(FINALE_REPLIES)
    base.update({k: v for k, v in COMMON_REPLIES.items() if vote or k != "tags a friend"})
    if not vote:
        base["tags a friend"] = "แท็กเพื่อนมาดูด้วยกันเลย 😂"
    if post.get("nextWhen"):
        base["when is the next part?"] = f"{post['nextWhen']} กดติดตามไว้ก่อนนะ 🔔"
    base.update(post.get("replies", {}))
    return base


def write_script(folder: Path, episode: dict) -> Path:
    """Human-readable script: what is said, what is shown, per scene."""
    lines = [f"# {episode.get('title', episode['id'])}", "", f"Voice: {episode.get('engine', 'edge')} / {episode.get('voice', '')}", ""]
    for i, s in enumerate(episode["scenes"], 1):
        lines.append(f"## {i}. {s['id']}" + (f"  ({s['tone']})" if s.get("tone") else ""))
        lines.append(f"- พูด: {s['say']}")
        if s.get("caption") and s["caption"] != s["say"]:
            lines.append(f"- ซับ: {s['caption'].replace('*', '')}")
        if s.get("type") == "endcard" and s.get("a") and s.get("b"):
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

