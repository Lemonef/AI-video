# AI-video — Claude Code rules

AI-made YouTube history videos (channel Pastly Life), Remotion 4 + hand-drawn stickman. Read `ARCHITECTURE.md` (where things go) before touching anything. Plan for the move to this layout: brain `docs/specs/2026-11-15-ai-video-restructure-plan.md`.

## Layout (target v2, details in ARCHITECTURE.md)
`engine/` Remotion code · `tools/` python · `docs/` by topic · `videos/<channel>/NN-name/` one folder per video · `_archive/` parked · `tests/` guards.

## Rules
1. **One folder per video:** `videos/<channel>/NN-name/{final,draft,script,assets}`. Numbering restarts at 01 per channel. Recurring characters live in `videos/<channel>/_shared/`.
2. **Final vs draft:** only the approved cut sits in `final/` (video.mp4, cover.png, posting.md). Every other version goes to `draft/`. Never overwrite a final without Zen's word.
3. **Engine is video-agnostic.** No episode-specific code or assets in `engine/`; data (timeline json, scripts) belongs in the video's folder.
4. **Assets:** shared fonts/sfx in `engine/shared/`; per-video assets in that video's `assets/`. Renders stage a `.build/<ch>-<NN>/public/` and use `--public-dir` (never hard-code `public/`). `.build/`, `out/` and media are gitignored.
5. **Nothing deleted.** Park in `_archive/` or the video's `draft/`.
6. **Guard:** `tests/architecture.json` + `ARCHITECTURE.md` + `test_architecture.py` must agree. New top-level folder = update all three.
7. **Gates before any commit:** `tsc --noEmit`, `pytest tests`, and a `remotion still` smoke of one comp. Never claim a render works without running it.
8. **Refactors:** one concern per commit (Conventional Commits, body = why + evidence). Do restructures in a worktree branch; touch the main checkout only after Zen has seen the result.
9. Never commit secrets; `.env` untracked, `*.example` committed.
10. Research findings live in `D:\research`; shared models/tools in `D:\tools`. Reference them by path, never copy them in.
11. Match surrounding style; comment the WHY; no magic numbers (derive from single-source tokens).
