---json
{"id": "art-poses-d", "type": "creative", "risk": "high", "repo": "D:/history-ep", "gates": ["python -I tools/check_art.py public/ink60full/art_manifests/art-poses-d.json"], "protected": ["tools/**", "src/**", "tests/**", "public/ink60full/art_manifests/**", "public/ink60full/art_refs/**", "public/ink60full/*.json", "public/ink60/**"], "context_files": ["public/ink60full/art_refs/ref_host.png", "public/ink60full/art_refs/ref_lustig.png", "public/ink60full/art_refs/lustig_master.png", "public/ink60full/art_refs/parisian_sheet.png"], "plan_check": "docs/briefs/art-poses-d.plan_check.md"}
---
# Goal
One magenta-keyed pose sheet of 6 stickman poses for the Ink Lustig episode.

# Files
Work only inside the repo (D:/history-ep). Create ONLY these files (exact names): public/ink60full/sheets/sheet_d.png. Do not edit any other file.

# Steps
Use your built-in image generation tool. Generate one image per file, then SAVE each as PNG at the exact path. Look at each result; redo any that miss the rules (wrong content, text/letters present, wrong count, magenta on a character, merged or touching poses). The gate script only checks size/key-colour/blob-count; YOU must check the look.

STYLE LOCK: match the reference images `public/ink60full/art_refs/ref_host.png`, `ref_lustig.png`, `lustig_master.png` and `parisian_sheet.png` exactly (open and study them): round plain white head, dash eyes plus one expressive brow, thin black stick limbs, big white cartoon gloves, black shoes, thick clean black outline, flat cel colour with light shading, NOT photoreal, NOT 3D.
SHEET RULES: one PNG, 1672x941 or closest, exactly 2 rows of 3 of EXACTLY the listed number of full-body poses (no extra, no fewer), each head to shoes, standing on NOTHING (no ground, no shadow; the only props allowed are those the pose description names, drawn as simple outlines, e.g. a desk front). Background = perfectly flat solid magenta #FF00FF, no gradient, no texture, no magenta anywhere on any character. Leave a wide clear magenta gap between poses so they can be cut apart; no pose may touch another or the image edge. NO text, NO labels, NO numbering. Same character identity and outfit for the same name in every pose. Poses must be clearly distinct and readable as the described emotion/action. Order = row-major, left-to-right then top row first.

POSES (6 in row-major order, ids in brackets are for the report only, never draw them):
1. [lustig_handing_money] Victor Lustig facing right, both arms extended forward holding out a thick stack of green dollar bills, earnest open face, eyebrows raised (handing money over)
2. [lustig_handshake] Victor Lustig facing right, stepping forward with right hand extended for a handshake, friendly warm smile, other hand tipping his cap
3. [lustig_lean_murmur] Victor Lustig (navy double-breasted coat, cream scarf, orange pocket square, black flat cap), leaning forward toward the right, one hand half-raised beside his mouth as if murmuring a quiet word to someone close, calm half-closed eyes, soft half-smile; NOT a finger on the lips
4. [lustig_lean_whisper] Victor Lustig (navy double-breasted coat, cream scarf, orange pocket square, black beret) leaning forward at the waist, one hand cupped beside his mouth as if confiding, eyes sliding sideways; facing right
5. [lustig_money_box] Victor Lustig (navy double-breasted coat, cream scarf, orange pocket square, black flat cap), facing right, holding a small mahogany box with brass crank and slot out in front with both hands like a salesman, confident smirk
6. [lustig_nodding_agree] Victor Lustig, three-quarter right, head tilted in an agreeable nod, one hand on heart and the other open palm forward, warm sympathetic smile

# Done when
All listed files exist at the exact paths and `python -I tools/check_art.py public/ink60full/art_manifests/art-poses-d.json` prints OK. Report one line per file: what it shows and any known weakness.
