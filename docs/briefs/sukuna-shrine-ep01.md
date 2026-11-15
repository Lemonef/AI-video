# Brief: what-if episode "ถ้า Sukuna มาไทย แล้วเดินเข้าวัด"

Owner approved premise 2026-11-06. Build the full short in this repo (D:/AI-video) with the existing pipeline (episodes/*.json + make.py). Claude only reviews; you build.

## Read first (in order)
1. D:/second-brain/skills/story/references/owner-story-brief.md  (owner's story rules - obey all)
2. D:/second-brain/research/zen-story-raw.md  (owner's exact words; last ~10 entries matter most)
3. D:/second-brain/research/what-if-premise-bank.md  (section "Zen clarification 2026-11-06")
4. D:/second-brain/memory/tiktok-what-if-series.md  (FORMAT, pipeline how-tos, voice/pace corrections)
5. episodes/flood02.json + scripts/pipeline/ to copy the working episode shape.

## Story (owner's angle - keep it)
Sukuna has his own shrine (Malevolent Shrine). A Thai temple looks like a shrine to him -> he thinks a rival sorcerer owns this territory. Hook opens with the what-if line, built into the story.
- Hook: "ถ้า Sukuna มาไทย แล้วเดินเข้าวัด จะเกิดอะไรขึ้น?" He sees the temple, reads it as an enemy shrine.
- Build: he prepares for a fight; monks, temple dogs, merit-making aunties treat him as a normal visitor. Each step escalates his confusion.
- Drive: he readies a domain clash, Malevolent Shrine vs the temple.
- Climax: he opens his domain. Nobody fights; the monk keeps chanting calmly, an aunty hands him a lotus. Nothing to defeat.
- Ending: he walks out holding the lotus - a complete punchline ending. NO A/B card, no Part 2 (owner 2026-11-06: one episode per premise). Remove any A/B from the script/JSON already written.
Respectful to Buddhism: the joke is on Sukuna, never on monks/the religion. No real destruction of the temple.
Characters: simple stickman-like style per series; Sukuna recognisable by markings/silhouette, no copied official art.

## Steps + checkpoints
1. Write natural Thai script (calm normal narrator, joined sentences). Cross-check it free: `python D:/second-brain/tools/multi_ai_check.py --skip-codex --file <prompt-file>` (Thai via file, never argv). Apply real fixes. Save docs/sukuna-shrine-script.md.
2. Episode JSON episodes/sukuna01.json, voice via existing TTS path (Iapetus like flood, no ElevenLabs purchase).
3. CHECKPOINT: render 4 stills (hook, build, domain clash, ending) to out/drafts/sukuna/ep01/stills/ with `npx remotion still`. Then continue.
4. Full render to out/drafts/sukuna/ep01/video.mp4 + cover.png + post.txt.
5. Run the repo's lints/tests. Write docs/agent-logs/codex-sukuna01.md: checklist, commands run, output paths, durations, anything left open.

## Rules
- No posting, no purchases, no account actions, no secrets in files.
- Do not touch other episodes' finals.
- If a design question is genuinely open, pick the option that best matches owner-story-brief and note it in the log; do not stop.
- Do not git commit (sandbox); Claude commits after review.
