# nolie01 brief - amendment 1 (parent, 03:00)

Your stop was correct. Parent fixed the environment:
- node_modules is now present (junction - NEVER run npm install / modify node_modules). Typecheck: `node node_modules/typescript/bin/tsc --noEmit` (passes at baseline).
- public/sfx/real/credits.json + public/mood01/timing.json copied in (gitignored assets).
- Use `python -m pytest -q tests --basetemp=.build/pytest-nolie01/<fresh-name>` (.build exists).

Gate is now RELATIVE TO BASELINE. Parent-measured baseline: 7 failed, 84 passed, 1 skipped:
  test_delivery_clock::test_unity_speed_edit_preserves_audio_tail, test_master_loudness::{test_master_hits_target_on_gappy_mix,test_video_stream_is_copied}
  (subprocess "WinError 6 handle is invalid" = no console stdin in harness/sandbox), and 4 x test_takrut01_assets (gitignored assets).
- Do NOT fix or touch takrut01, other episodes, or those tests.
- Done-when: no NEW failures beyond that set; every test you add passes; tsc passes. Record before/after counts in docs/agent-logs/codex-nolie01.md.
- Phase 4 render routing: scripts/pipeline/render.py renders only src/index.ts today. Add opt-in routing for jaab3d episodes (e.g. episode field "engine": "jaab3d" -> entry src/jaab3d/index.tsx, public dir public3d, composition id from episode). Episodes without the field must behave byte-identically. Unit-test the routing (command construction only, no real render).
- Continue all 4 phases of docs/briefs/nolie01-codex.md now.
