---json
{"id": "art-poses-c", "type": "creative", "risk": "high", "repo": "D:/history-ep", "gates": ["python -I tools/check_art.py public/ink60full/art_manifests/art-poses-c.json"], "protected": ["tools/**", "src/**", "tests/**", "public/ink60full/art_manifests/**", "public/ink60full/art_refs/**", "public/ink60full/*.json", "public/ink60/**"], "context_files": ["public/ink60full/art_refs/ref_host.png", "public/ink60full/art_refs/ref_lustig.png", "public/ink60full/art_refs/lustig_master.png", "public/ink60full/art_refs/parisian_sheet.png"], "plan_check": "docs/briefs/art-poses-c.plan_check.md"}
---
# Goal
One magenta-keyed pose sheet of 6 stickman poses for the Ink Lustig episode.

# Files
Work only inside the repo (D:/history-ep). Create ONLY these files (exact names): public/ink60full/sheets/sheet_c.png. Do not edit any other file.

# Steps
Use your built-in image generation tool. Generate one image per file, then SAVE each as PNG at the exact path. Look at each result; redo any that miss the rules (wrong content, text/letters present, wrong count, magenta on a character, merged or touching poses). The gate script only checks size/key-colour/blob-count; YOU must check the look.

STYLE LOCK: match the reference images `public/ink60full/art_refs/ref_host.png`, `ref_lustig.png`, `lustig_master.png` and `parisian_sheet.png` exactly (open and study them): round plain white head, dash eyes plus one expressive brow, thin black stick limbs, big white cartoon gloves, black shoes, thick clean black outline, flat cel colour with light shading, NOT photoreal, NOT 3D.
SHEET RULES: one PNG, 1672x941 or closest, exactly 2 rows of 3 of EXACTLY the listed number of full-body poses (no extra, no fewer), each head to shoes, standing on NOTHING (no ground, no shadow; the only props allowed are those the pose description names, drawn as simple outlines, e.g. a desk front). Background = perfectly flat solid magenta #FF00FF, no gradient, no texture, no magenta anywhere on any character. Leave a wide clear magenta gap between poses so they can be cut apart; no pose may touch another or the image edge. NO text, NO labels, NO numbering. Same character identity and outfit for the same name in every pose. Poses must be clearly distinct and readable as the described emotion/action. Order = row-major, left-to-right then top row first.

POSES (6 in row-major order, ids in brackets are for the report only, never draw them):
1. [loud_braggart_shouting] Loud flashy stick figure (checked suit, red tie, cigar), front-on, mouth wide open shouting, one arm flung up, motion lines around head
2. [lustig_arrested] Victor Lustig (same stick figure: white round head, black beret, navy double-breasted coat, cream scarf, orange pocket square), standing front/three-quarter right, wrists together in front in steel handcuffs, shoulders sagging, eyes down, rueful tight-lipped half-smile; transparent/magenta background like the existing cast sheets.
3. [lustig_counting_cash] Lustig standing three-quarter right fanning a thick wad of banknotes in both gloved hands, satisfied smirk.
4. [lustig_embarrassed] Victor Lustig (navy double-breasted coat, cream scarf, orange pocket square, black beret) sheepish: one hand rubbing the back of his neck, beret held low in the other hand, eyes looking down and away, faint blush, small apologetic smile; facing right
5. [lustig_forging_pen] Victor Lustig (navy double-breasted coat, cream scarf, orange pocket square, black beret) standing, leaning over, pen in right hand writing on a sheet held flat in left, sly concentrated smirk, facing right
6. [lustig_glance_over_shoulder] Victor Lustig (navy double-breasted coat, cream scarf, orange pocket square, black beret) body facing right, head turned back over his left shoulder checking the room, one hand resting flat on a document; facing right

# Done when
All listed files exist at the exact paths and `python -I tools/check_art.py public/ink60full/art_manifests/art-poses-c.json` prints OK. Report one line per file: what it shows and any known weakness.
