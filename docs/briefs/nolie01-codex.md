# nolie01 — ONE jaab reel that passes every gate (Codex Sol, workspace-write)

Work ONLY inside this repo (D:/AI-video-nolie01). No network, no git commits (parent commits). Do not touch other episodes' files except where stated.
Owner bar: every earlier reel "sucks so bad"; old SFX sounded like a fake template. Quality over speed. If a rule below is impossible, STOP and write why in docs/agent-logs/codex-nolie01.md.

## Read first
docs/refs/narrated-script-engine.md (script method: title -> Story Lock card -> audited script), docs/refs/sound-skill.md (music + real SFX rules), docs/refs/video-maker-skill.md, docs/refs/camera-skill.md, episodes/mood01.json + src/jaab3d/Mood01.tsx + src/jaab3d/engine/ (the house 3D style, the format to copy), scripts/make.py + scripts/pipeline/{render,master,freesound,flood_sfx}.py.

## Premise (locked)
"ถ้าทั้งกรุงเทพโกหกไม่ได้ ยกเว้นคุณคนเดียว" — Thai what-if, เรื่องจ๊าบๆ channel, 60-90 s, 9:16. No real politicians, temples never mocked, no brand logos, original cast (no recurring mascot).

## Phase 1 — story (write docs/nolie01-story-lock.md)
Story Lock card with every What-If pack field (BASELINE->EXTREME, THE RULE, HERO, CAST, HEART + PLANTED DETAIL, HIDDEN COST, CRISIS, CHOICE, RESOLUTION, SAFETY/LESSON). Then the audited Thai script: 2nd person present, short sentences, ellipses before payoffs, questions; hook line lands in first 2 s. Then a beat table: beat id, line, est. seconds, picture, SFX events (real-world sound names), music action (enter / swell at crisis / drop at choice / out).

## Phase 2 — episode (episodes/nolie01.json)
Same schema as mood01.json, style jaab3d, engine gemini voice Iapetus (fallback edge th-TH-NiwatNeural), narrationDirection written for this story, post kit filled. SFX: only real recorded sounds — reuse names already in public/sfx/real/credits.json where they fit; for new ones add entries to the freesound.py name table (CC0 query + length) so the parent can fetch them (you have no network). Layer key beats (impact + body + tail) per sound-skill.

## Phase 3 — music bed support (code)
The mix has no background music today. Add `mix.music`: {"name": <file in public/music/>, "volume_lufs": target under voice, "duck_db", "events": [{"at": sec, "action": "swell"|"drop"|"out"}]}. Duck under narration, swell/drop on the events, fade out at end; master stays -14 LUFS. Add a CC0 music search table to freesound.py (3 candidates: query + length) writing public/music/<name>.mp3 + credits — parent fetches. Unit tests in tests/ for the duck/event envelope math. Keep existing episodes rendering unchanged when mix.music is absent.

## Phase 4 — visuals (src/jaab3d/Nolie01.tsx + register in src/jaab3d/index.tsx)
Own scenes per beat in the jaab3d world (2D cards in 3D, weather kit, lighting). Strong hook frame at 0 s, camera move per beat per camera-skill, readable Thai title cards, captions synced to narration as mood01 does. Duration derived from the voice timing, never hard-coded magic numbers.

## Done when
- docs/nolie01-story-lock.md, episodes/nolie01.json, src/jaab3d/Nolie01.tsx exist; `npx tsc --noEmit` passes; `python -m pytest -q tests` passes (report counts verbatim).
- docs/agent-logs/codex-nolie01.md lists: files changed, every new freesound/music entry to fetch, open risks, exact commands the parent must run to voice + render a draft.
