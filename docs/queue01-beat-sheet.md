# ลูกเจ้าของร้าน — queue01 beat sheet

Status: script/data handoff ready for Claude's final review and render. No audio or video generated; performance and picture remain unreviewed.

## Premise

คนแซงคิวจ๊าบอ้างว่าเป็นลูกเจ้าของร้าน จ๊าบเลยขอให้ช่วยแม่คิดเงินแทนการเถียง
แม่ได้ยินเต็มสองหู เลยจับลูกชายเข้ากะ แถมสั่งล้างห้องน้ำก่อนกลับ

Original fictional Thai shop comedy, written for this handoff. The Reddit-story / Roblox-reel influence is limited to an everyday grievance, an attempted status shortcut, and a consequence caused by the character's own words. No Reddit post, real person, dialogue, or reference plot was used. Viewer: a Thai short-story viewer who recognizes the irritation of someone jumping a shop queue.

## Existing assets only

- Background: `storeInside`, registered in `src/v5/Forest.tsx` under **ENV5** (the handoff calls this BACKGROUNDS; ENV5 is the actual export). Its art comes from `src/v7/Store.tsx`.
- `jaab`: จ๊าบ, the customer and viewpoint character; unchanged existing lead.
- `runner`: ตี๋, the queue jumper; existing look recast as the owner's son. His football plan is spoken; no ball or sports uniform is required.
- `mum`: แม่ตี๋, the cashier and shop owner; existing look recast for this standalone story. She is not Jaab's mother in this episode.
- No new props, sets, looks, TS edits, or generated art. Water, bag, mop and bathroom are mentioned in speech only. Do not add art to show them.

## Beats and scene list

| id | bg | cast ids | say |
| --- | --- | --- | --- |
| hook | storeInside | jaab, runner | แซงคิวผมเฉย บอกเป็นลูกเจ้าของร้าน |
| queue | storeInside | mum, jaab, runner | จ๊าบต่อคิวซื้อน้ำอยู่ร้านปากซอย พี่คนหนึ่งเดินเบียดมาข้างหน้า แล้วเรียกพนักงานว่า คิดของผมก่อน ผมรีบ |
| claim | storeInside | jaab, runner | จ๊าบบอก ผมมาก่อนนะครับ เขาหัวเราะ ร้านแม่ผมเองน้อง ซื้อทุกวัน ไม่ต้องต่อหรอก |
| request | storeInside | jaab, runner | จ๊าบเลยยิ้ม งั้นพี่ช่วยแม่คิดเงินหน่อยสิครับ ลูกค้ารออยู่ แม่พี่จะได้พักบ้าง |
| caught | storeInside | mum, runner, jaab | พนักงานเงยหน้าทันที เออ ตี๋ มาพอดีเลย แม่ยังไม่ได้กินข้าว เขาหน้าซีด แม่ ผมจะไปเตะบอล |
| shift | storeInside | mum, runner, jaab | แม่ชี้หลังเคาน์เตอร์ เตะพรุ่งนี้ วันนี้ช่วยจนปิดร้าน เพิ่งอวดเองไม่ใช่เหรอ ว่าร้านแม่ |
| service | storeInside | runner, jaab, mum | ไม่ถึงนาที คนที่เพิ่งแซงคิว ก็ยืนคิดเงินให้จ๊าบ แล้วถามเสียงเบา รับถุงไหมครับ |
| punchline | storeInside | runner, jaab, mum | จ๊าบบอก ไม่รับครับ แม่ตะโกนจากข้างหลัง แต่ลูกแม่รับไม้ถูพื้นด้วย ห้องน้ำยังไม่ได้ล้าง |

The first two seconds start directly on the queue grievance, with Tee ahead of Jaab. The next scene briefly establishes the event before catching up to the opening claim. The status claim becomes an obligation: Tee really is her son, and that makes him available to help. The bag question sets up the final parallel use of รับ. End on the bathroom line and Tee's reaction; no spoken CTA after the punchline.

## Staging and voice

The existing checkout is on the left of the frame (`Counter` in `src/v7/Store.tsx`, approximately x=-20..470). Mum starts at x=230, with customers to the right. Tee moves in front of Jaab during `queue`. A cut marked ไม่ถึงนาทีต่อมา puts Tee in Mum's checkout position and Mum away from the register: this avoids inventing an unsupported handover interaction. Omitted cast members in close shots are out of frame, not departing the shop.

Use supported idle, point, think, hold and shock poses with expression changes. A hold pose is a generic hand gesture here, not a claim that the rig carries a bottle or bag. Camera reframes alternate the shop geography, Tee's confidence, Mum's reply and Tee's reaction. No extra sound effects are required for this dialogue joke.

Gemini / Iapetus / `gemini-2.5-flash-preview-tts`, tempo 1.08, matching the requested source format. One native Thai conversational narrator; Tee moves from smug to meek, Mum is firm and practical. Instructions are in `narrationDirection`. The narrative is third person after the first-person cold-open quote; the opening is Jaab's complaint as retold by the narrator.

## Validation and next action

- JSON loaded successfully with Python. All eight scene backgrounds and every scene/cover cast id resolve against ENV5 / CAST2; captions equal spoken lines.
- Scene ids are unique; pose, expression and action values checked against `src/types.ts`; shot/key fractions checked in [0,1].
- 585 spoken letters using the pipeline's `spoken_len`. Existing cached narration measures approximately 10.373 letters/second at tempo 1.0, yielding **52.5 seconds estimated** at 1.08 including the 0.3-second final pad. This is a planning estimate across cached takes, not a measured Iapetus performance. Claude must confirm 45–60 seconds after TTS and adjust delivery or trim the script if needed.
- No TS typecheck needed: no TS changes. No network calls, commits, rendering or new assets in this task. `post.publishNow` is false for the review handoff.
- Claude next: review Thai delivery, generate the take, verify actual duration and hook timing, inspect checkout geometry/occlusion and character framing, then review the continuous render and commit. Pay particular attention to the static counter being drawn behind cast: the JSON positions establish a checkout role but do not create a foreground occlusion layer.

Files delivered: `episodes/queue01.json`, `docs/queue01-beat-sheet.md`. This local handoff also records the milestone for the next session; the brain vault is outside this task's writable sandbox.
