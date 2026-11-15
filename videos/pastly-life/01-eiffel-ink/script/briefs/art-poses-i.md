---json
{"id": "art-poses-i", "type": "creative", "risk": "high", "repo": "D:/history-ep", "gates": ["python -I tools/check_art.py public/ink60full/art_manifests/art-poses-i.json"], "protected": ["tools/**", "src/**", "tests/**", "public/ink60full/art_manifests/**", "public/ink60full/art_refs/**", "public/ink60full/*.json", "public/ink60/**"], "context_files": ["public/ink60full/art_refs/ref_host.png", "public/ink60full/art_refs/ref_lustig.png", "public/ink60full/art_refs/lustig_master.png", "public/ink60full/art_refs/parisian_sheet.png"], "plan_check": "docs/briefs/art-poses-i.plan_check.md"}
---
# Goal
One magenta-keyed pose sheet of 6 stickman poses for the Ink Lustig episode.

# Files
Work only inside the repo (D:/history-ep). Create ONLY these files (exact names): public/ink60full/sheets/sheet_i.png. Do not edit any other file.

# Steps
Use your built-in image generation tool. Generate one image per file, then SAVE each as PNG at the exact path. Look at each result; redo any that miss the rules (wrong content, text/letters present, wrong count, magenta on a character, merged or touching poses). The gate script only checks size/key-colour/blob-count; YOU must check the look.

STYLE LOCK: match the reference images `public/ink60full/art_refs/ref_host.png`, `ref_lustig.png`, `lustig_master.png` and `parisian_sheet.png` exactly (open and study them): round plain white head, dash eyes plus one expressive brow, thin black stick limbs, big white cartoon gloves, black shoes, thick clean black outline, flat cel colour with light shading, NOT photoreal, NOT 3D.
SHEET RULES: one PNG, 1672x941 or closest, exactly 2 rows of 3 of EXACTLY the listed number of full-body poses (no extra, no fewer), each head to shoes, standing on NOTHING (no ground, no shadow; the only props allowed are those the pose description names, drawn as simple outlines, e.g. a desk front). Background = perfectly flat solid magenta #FF00FF, no gradient, no texture, no magenta anywhere on any character. Leave a wide clear magenta gap between poses so they can be cut apart; no pose may touch another or the image edge. NO text, NO labels, NO numbering. Same character identity and outfit for the same name in every pose. Poses must be clearly distinct and readable as the described emotion/action. Order = row-major, left-to-right then top row first.

POSES (6 in row-major order, ids in brackets are for the report only, never draw them):
1. [scrap_dealer_handing_cash] Andre Poisson, i.e. the same scrap-metal dealer as Act 3 (stocky stick figure, grey work waistcoat over rolled sleeves, bowler hat, moustache), Andre Poisson, scrap-metal dealer (stout stick figure, brown bowler hat, grey three-piece suit, gold watch chain, moustache), extending a fat envelope of banknotes forward to the right, eager hopeful smile.
2. [scrap_dealer_head_in_hands] Andre Poisson, i.e. the same scrap-metal dealer as Act 3 (stocky stick figure, grey work waistcoat over rolled sleeves, bowler hat, moustache), standing front-on with both hands gripping his head, eyes wide, mouth open in dawning horror.
3. [scrap_dealer_hesitating] Andre Poisson, i.e. the same scrap-metal dealer as Act 3 (stocky stick figure, grey work waistcoat over rolled sleeves, bowler hat, moustache), facing right, one foot forward then frozen, hat clutched to chest, sweat drop, worried brows: about to enter but stopping.
4. [scrap_dealer_humiliated] Andre Poisson, i.e. the same scrap-metal dealer as Act 3 (stocky stick figure, grey work waistcoat over rolled sleeves, bowler hat, moustache), front-on, shoulders slumped, face red, eyes down, hat in limp hand: publicly shamed.
5. [scrap_dealer_lapels] Andre Poisson, i.e. the same scrap-metal dealer as Act 3 (stocky stick figure, grey work waistcoat over rolled sleeves, bowler hat, moustache): standing still, chest puffed out, chest puffed out, both hands gripping his lapels, proud eager smile, eyebrows up; facing right, transparent background
6. [scrap_dealer_looking_up] A scrap-metal dealer as Act 3 (stocky stick figure, grey work waistcoat over rolled sleeves, bowler hat, moustache): standing three-quarter right, head tilted back looking up, one hand shading eyes, other hand counting on fingers, calculating squint; facing right

# Done when
All listed files exist at the exact paths and `python -I tools/check_art.py public/ink60full/art_manifests/art-poses-i.json` prints OK. Report one line per file: what it shows and any known weakness.
