---json
{"id": "art-poses-a", "type": "creative", "risk": "high", "repo": "D:/history-ep", "gates": ["python -I tools/check_art.py public/ink60full/art_manifests/art-poses-a.json"], "protected": ["tools/**", "src/**", "tests/**", "public/ink60full/art_manifests/**", "public/ink60full/art_refs/**", "public/ink60full/*.json", "public/ink60/**"], "context_files": ["public/ink60full/art_refs/ref_host.png", "public/ink60full/art_refs/ref_lustig.png", "public/ink60full/art_refs/lustig_master.png", "public/ink60full/art_refs/parisian_sheet.png"], "plan_check": "docs/briefs/art-poses-a.plan_check.md"}
---
# Goal
One magenta-keyed pose sheet of 6 stickman poses for the Ink Lustig episode.

# Files
Work only inside the repo (D:/history-ep). Create ONLY these files (exact names): public/ink60full/sheets/sheet_a.png. Do not edit any other file.

# Steps
Use your built-in image generation tool. Generate one image per file, then SAVE each as PNG at the exact path. Look at each result; redo any that miss the rules (wrong content, text/letters present, wrong count, magenta on a character, merged or touching poses). The gate script only checks size/key-colour/blob-count; YOU must check the look.

STYLE LOCK: match the reference images `public/ink60full/art_refs/ref_host.png`, `ref_lustig.png`, `lustig_master.png` and `parisian_sheet.png` exactly (open and study them): round plain white head, dash eyes plus one expressive brow, thin black stick limbs, big white cartoon gloves, black shoes, thick clean black outline, flat cel colour with light shading, NOT photoreal, NOT 3D.
SHEET RULES: one PNG, 1672x941 or closest, exactly 2 rows of 3 of EXACTLY the listed number of full-body poses (no extra, no fewer), each head to shoes, standing on NOTHING (no ground, no shadow; the only props allowed are those the pose description names, drawn as simple outlines, e.g. a desk front). Background = perfectly flat solid magenta #FF00FF, no gradient, no texture, no magenta anywhere on any character. Leave a wide clear magenta gap between poses so they can be cut apart; no pose may touch another or the image edge. NO text, NO labels, NO numbering. Same character identity and outfit for the same name in every pose. Poses must be clearly distinct and readable as the described emotion/action. Order = row-major, left-to-right then top row first.

POSES (6 in row-major order, ids in brackets are for the report only, never draw them):
1. [artist_signing_petition] Painter stickman in a floppy black beret, paint-smeared smock and red neckerchief, facing right, bent slightly forward signing a long paper petition with a quill held in his right hand, indignant frown.
2. [buyer_amazed] American 1920s mark (brown three-piece suit, bowler hat, moustache), front-on, both hands up open, eyes huge and starry, jaw dropped in wonder
3. [buyer_paying] Same American mark (brown suit, bowler hat, moustache) facing right, one arm extended handing a fat wad of dollar bills, eager grin
4. [capone_1] Al Capone stick figure in the same hand-drawn ink style (white round head, long black stick limbs): grey pinstripe double-breasted suit, white fedora with black band, cigar in mouth, arms crossed, heavy scowl with one eyebrow down; standing front-on, slight right turn; full body on flat magenta background
5. [capone_handing_money] Al Capone (same as capone_1: white round head, long black stick limbs, grey pinstripe double-breasted suit, white fedora with black band, cigar) standing facing right, one arm extended holding out a stack of dollar bills, small approving smile
6. [capone_seated_desk] Al Capone (same as capone_1: white round head, long black stick limbs, grey pinstripe double-breasted suit, white fedora with black band, cigar) seated behind a mahogany desk facing right, fingers steepled, cigar smoke curling, appraising squint

# Done when
All listed files exist at the exact paths and `python -I tools/check_art.py public/ink60full/art_manifests/art-poses-a.json` prints OK. Report one line per file: what it shows and any known weakness.
