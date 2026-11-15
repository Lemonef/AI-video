---json
{"id": "art-poses-b", "type": "creative", "risk": "high", "repo": "D:/history-ep", "gates": ["python -I tools/check_art.py public/ink60full/art_manifests/art-poses-b.json"], "protected": ["tools/**", "src/**", "tests/**", "public/ink60full/art_manifests/**", "public/ink60full/art_refs/**", "public/ink60full/*.json", "public/ink60/**"], "context_files": ["public/ink60full/art_refs/ref_host.png", "public/ink60full/art_refs/ref_lustig.png", "public/ink60full/art_refs/lustig_master.png", "public/ink60full/art_refs/parisian_sheet.png"], "plan_check": "docs/briefs/art-poses-b.plan_check.md"}
---
# Goal
One magenta-keyed pose sheet of 6 stickman poses for the Ink Lustig episode.

# Files
Work only inside the repo (D:/history-ep). Create ONLY these files (exact names): public/ink60full/sheets/sheet_b.png. Do not edit any other file.

# Steps
Use your built-in image generation tool. Generate one image per file, then SAVE each as PNG at the exact path. Look at each result; redo any that miss the rules (wrong content, text/letters present, wrong count, magenta on a character, merged or touching poses). The gate script only checks size/key-colour/blob-count; YOU must check the look.

STYLE LOCK: match the reference images `public/ink60full/art_refs/ref_host.png`, `ref_lustig.png`, `lustig_master.png` and `parisian_sheet.png` exactly (open and study them): round plain white head, dash eyes plus one expressive brow, thin black stick limbs, big white cartoon gloves, black shoes, thick clean black outline, flat cel colour with light shading, NOT photoreal, NOT 3D.
SHEET RULES: one PNG, 1672x941 or closest, exactly 2 rows of 3 of EXACTLY the listed number of full-body poses (no extra, no fewer), each head to shoes, standing on NOTHING (no ground, no shadow; the only props allowed are those the pose description names, drawn as simple outlines, e.g. a desk front). Background = perfectly flat solid magenta #FF00FF, no gradient, no texture, no magenta anywhere on any character. Leave a wide clear magenta gap between poses so they can be cut apart; no pose may touch another or the image edge. NO text, NO labels, NO numbering. Same character identity and outfit for the same name in every pose. Poses must be clearly distinct and readable as the described emotion/action. Order = row-major, left-to-right then top row first.

POSES (6 in row-major order, ids in brackets are for the report only, never draw them):
1. [capone_thinking] Al Capone (same as capone_1: white round head, long black stick limbs, grey pinstripe double-breasted suit, white fedora with black band, cigar) front-on, one hand stroking chin, other hand holding cigar, eyebrows raised, impressed and thoughtful
2. [capone_warning_finger] Al Capone (same as capone_1: white round head, long black stick limbs, grey pinstripe double-breasted suit, white fedora with black band, cigar) front-on close stance, leaning forward, index finger raised and wagging, cigar clenched, narrowed threatening eyes
3. [city_official_decree] City official stickman in a black bowler hat, grey frock coat and waistcoat, facing right, holding a rolled document with a red wax seal at chest height, stern neutral face.
4. [dealer_reporting] Scrap dealer (flat cap, brown work coat, rolled-up forged contract in hand) facing right, arm extended jabbing the papers forward, angry determined face: reporting a fraud.
5. [doorman_bowing] Hotel doorman stick figure in burgundy long coat with gold buttons and braid, peaked cap, white gloves, bowing politely with one hand on chest, facing right
6. [gangster_shifty] 1920s Chicago gangster henchman (black fedora, dark pinstripe suit, loud tie), front-on, hands in pockets, eyes sliding sideways, sly crooked grin (a liar)

# Done when
All listed files exist at the exact paths and `python -I tools/check_art.py public/ink60full/art_manifests/art-poses-b.json` prints OK. Report one line per file: what it shows and any known weakness.
