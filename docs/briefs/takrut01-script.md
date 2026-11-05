# Handoff: takrut01 script + beat sheet (Codex Sol, workspace-write)

## Goal
Write the script for ONE standalone Thai short titled **ตะกรุดสามคำขอ** (promised by the end card of the
posted `lift03` episode). Output two files only:

1. `docs/takrut01-beat-sheet.md` - same structure as `docs/lift03-beat-sheet.md`.
2. `episodes/takrut01.json` - same schema as `episodes/lift03.json` (read it fully first; mirror every
   top-level key: style, engine, voice, voiceModel, tempo, mix, post, narrationJoin, narrationDirection, scenes).

Do not edit any other file. Do not run git. Do not run the renderer or TTS.

## Premise (owner-approved finalist, 2026-11-05)
One sentence: **ถ้าตะกรุดให้รวยจริง... แต่รวยเป็นเหรียญ 25 สตางค์**
- Setup (first 2 s = hook): a broke young guy at end of month finds an old ตะกรุด that grants three wishes.
- Wish 1 "ขอให้รวย": room fills with ANCIENT money (พดด้วง, เบี้ยหอย); his bank app still shows 0. Rich, unusable.
- Wish 2 "ขอเงินที่ใช้ได้จริง": 25-satang coins flood the room to the ceiling (legal, but nobody wants them).
- Wish 3 "ขอให้ทุกอย่างกลับเหมือนเดิม": everything vanishes except ONE 25-satang coin.
- Ending (closed payoff): he goes to a convenience store to buy something; the cashier will not take it / the
  price beats him. Land the joke in picture and sound. You may sharpen any beat if it gets funnier; keep the shape.

## Rules
- Genre: weird-funny. 60-80 s total narration. 8-12 scenes.
- **No จ๊าบ.** The lead is a NEW character (name him, e.g. a Thai nickname). He needs a new look; describe it
  in the beat sheet (hair, top colour, one recognisable trait) so a later task can add it to `src/v2/cast.ts`.
  In the JSON use look id `"takrutLead"` for him.
- Thai must be natural spoken Bangkok Thai, the way a friend tells a funny story - not translated, varied
  sentence rhythm (read `D:/second-brain/skills/script-voice/references/voice-flow.md` if reachable;
  otherwise follow lift03's narration style). Spell numbers in words (TTS cannot read digits).
- Hook in the first 2-3 s; no slow intro. Ending skill: `post.next` must be `"ติดตามเรื่องต่อไป"` - never name an
  undecided next story.
- No real brands (generic convenience store, no 7-Eleven logo/name). No real people. No religion mocked
  (the ตะกรุด is treated with a little respect; the joke is on the guy's wording).
- Reuse existing sets where they fit: read `src/v5/Forest.tsx` ENV5 map and `src/v7/Store.tsx`
  (`StoreInside` is a convenience store), `src/v7/House.tsx`. For every scene that needs a NEW set, give it a
  bg id and a one-paragraph set description in the beat sheet section "New sets needed" (props, layout,
  lighting, what animates over p 0..1), in the same detail level as `docs/briefs/lift03-sets.md`.
- `post`: title `ตะกรุดสามคำขอ`, `seriesSlug` `"takrut"`, standalone (part 1, total 1), coverHook <= 30 Thai chars,
  question = a comment prompt, hashtags like lift03 (Thai, 6-8).

## Done criteria
- Both files exist; `python -c "import json;json.load(open('episodes/takrut01.json',encoding='utf-8'))"` passes.
- Sum of narration reads at ~60-80 s at the lift03 tempo (state your estimate in the beat sheet).
- Beat sheet ends with: scene table (scene, bg id, new/existing, cast, line, seconds) and "New sets needed".
- Final report: list files written, scene count, estimated seconds, new set ids, and anything you were unsure of.
