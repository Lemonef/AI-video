# Handoff: today's jaabstory episode (Codex builds, Claude reviews last)

Owner dropped takrut01 (story too weak). Build a NEW short instead, today.

## Story
- Inspired by the kind of story that does well in Reddit-story / Roblox-animation reels
  (r/tifu, r/AmItheAsshole, r/pettyrevenge, r/nosleep-lite: one clear setup, escalation, twist).
  Invent or heavily change it: Thai setting, Thai names, no real post copied, no real people.
- 45-60 s, Thai narration, funny or twisty, a strong first-2-second hook, ends on a punchline.
- Read videos/unsorted/takrut01/script/takrut01.json and videos/unsorted/takrut01/script/docs/takrut01/takrut01-beat-sheet.md for format and tone only.

## Build (no new art: today only)
- Reuse ONLY backgrounds already in the BACKGROUNDS object at the end of engine/legacy/v5/Forest.tsx and
  cast already in engine/legacy/v2/cast.ts. Pick the story to fit the sets we have (store, lift, house, forest...).
- Write docs/<id>-beat-sheet.md and videos/<channel>/<video>/script/<id>.json (same schema/style v6 as takrut01, engine
  gemini, voice Iapetus). Pick a short id like `revenge01`.
- Check it: `python tools/tsc_in_worktree.py` style typecheck not needed (no TS change);
  validate JSON loads and every bg/cast id exists in the registries.
- You cannot reach the network or commit; do not try. Claude runs the render and commits.

## Report
Premise in 2 lines, the scene list (id, bg, cast, say), and the files written.
