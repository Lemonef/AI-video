# Handoff: deep mining of the owner's Instagram reference reels (both batches)

Agent: Gemini CLI (free). Do NOT touch `src/compositions/ReferenceStudy/` or the 1:1 reference study files (another agent owns them). No installs of new packages, no social posting, no comments/DMs, no paid services.

## Inputs
- Existing partial review (read first): `D:\second-brain\research\instagram-reference-library-2026-10-31.md` (29 posts) and RAW `D:\second-brain\transcripts\2026-10-31-instagram-reference-library\library.md`.
- Local media per post: `D:\AI-video\out\drafts\reference-library-2026-10-31\<post-id>\` (video, review.jpg/review.json, ASR outputs).
- Batch 2 (seven links, not reviewed yet): find them in `D:\second-brain\memory\live-handoff.md` / the library notes ("seven queued"). Download with the same method used for batch 1 if a tool is present (`yt-dlp` / existing scripts in `D:\AI-video\scripts\`); if download is impossible, record the URL and the exact error.

## For every post (batch 1 + batch 2)
1. **All on-screen text (OCR):** extract frames every ~1 s (ffmpeg) and read every caption, card, label, URL, handle, repo name, tool name. Write it verbatim (Thai stays Thai).
2. **Spoken content:** use the existing ASR; correct obvious Thai/tool-name errors only where the on-screen text confirms them.
3. **Referenced resources:** for every GitHub repo / skill / tool named on screen or in speech, fetch the primary page (README) with `curl`/`gh` and summarise what it actually does, its licence and whether it fits the Jaab pipeline (Remotion + Python, free only). Mark unverified spellings explicitly; never guess a URL as fact.
4. **Craft lessons for Jaab** - concrete and reusable: design/graphics, voice and pacing, camera work, animation (anticipation/contact/recovery), lighting, sound, hook/story/retention. One line each, with the timestamp where it is shown.

## Output
- Append a section per post to `D:\second-brain\research\instagram-reference-library-2026-10-31.md` titled "Deep pass (2026-11-01)" under that post, and add batch-2 posts as new numbered entries.
- Put verbatim OCR text in the RAW transcript folder: `D:\second-brain\transcripts\2026-10-31-instagram-reference-library\ocr-<post-id>.md`.
- Write a synthesis `D:\second-brain\research\reel-lessons-synthesis-2026-11-01.md`: the top 15 techniques ranked by how much they would improve Jaab videos, each with source posts and a one-line "how to apply in our Remotion pipeline".
- Keep a progress checklist in `D:\AI-video\docs\agent-logs\gemini-reel-mining.md` (one box per post, tick as done) so the work can resume if rate-limited.
- After every 5 posts: `cd D:\second-brain && git add -A && git commit -m "[manual] reel deep pass: <posts>" && git push origin main` (pull --rebase first if rejected).

## Rules
- Claims in reels are claims (views, "proves", costs): label them, do not repeat as fact.
- If rate-limited, wait and continue; if a step is impossible, record why and move on.
- Final reply: posts done / skipped (with reason), files written, top 5 lessons.

## Use the other free models (save your own quota)
For text-only sub-tasks (summarising a README, cleaning a Thai transcript, ranking lessons, a second opinion), call the owner's free legs instead of doing it all yourself:
`python D:/second-brain/tools/multi_ai_check.py "<prompt>" --skip-codex` (all free legs at once) or one leg: `python D:/second-brain/tools/groq_check.py "<prompt>"` (Qwen, fast), `nvidia_check.py` (GLM 5.3 / Kimi K3 / DeepSeek), `openrouter_check.py` (Nemotron 120B), `mistral_check.py`, `cohere_check.py`. Their answers are claims: check against the actual frames/files. Note in the agent log which leg did what.
