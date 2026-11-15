---json
{"id": "art-poses-e", "type": "creative", "risk": "high", "repo": "D:/history-ep", "gates": ["python -I tools/check_art.py public/ink60full/art_manifests/art-poses-e.json"], "protected": ["tools/**", "src/**", "tests/**", "public/ink60full/art_manifests/**", "public/ink60full/art_refs/**", "public/ink60full/*.json", "public/ink60/**"], "context_files": ["public/ink60full/art_refs/ref_host.png", "public/ink60full/art_refs/ref_lustig.png", "public/ink60full/art_refs/lustig_master.png", "public/ink60full/art_refs/parisian_sheet.png"], "plan_check": "docs/briefs/art-poses-e.plan_check.md"}
---
# Goal
One magenta-keyed pose sheet of 6 stickman poses for the Ink Lustig episode.

# Files
Work only inside the repo (D:/history-ep). Create ONLY these files (exact names): public/ink60full/sheets/sheet_e.png. Do not edit any other file.

# Steps
Use your built-in image generation tool. Generate one image per file, then SAVE each as PNG at the exact path. Look at each result; redo any that miss the rules (wrong content, text/letters present, wrong count, magenta on a character, merged or touching poses). The gate script only checks size/key-colour/blob-count; YOU must check the look.

STYLE LOCK: match the reference images `public/ink60full/art_refs/ref_host.png`, `ref_lustig.png`, `lustig_master.png` and `parisian_sheet.png` exactly (open and study them): round plain white head, dash eyes plus one expressive brow, thin black stick limbs, big white cartoon gloves, black shoes, thick clean black outline, flat cel colour with light shading, NOT photoreal, NOT 3D.
SHEET RULES: one PNG, 1672x941 or closest, exactly 2 rows of 3 of EXACTLY the listed number of full-body poses (no extra, no fewer), each head to shoes, standing on NOTHING (no ground, no shadow; the only props allowed are those the pose description names, drawn as simple outlines, e.g. a desk front). Background = perfectly flat solid magenta #FF00FF, no gradient, no texture, no magenta anywhere on any character. Leave a wide clear magenta gap between poses so they can be cut apart; no pose may touch another or the image edge. NO text, NO labels, NO numbering. Same character identity and outfit for the same name in every pose. Poses must be clearly distinct and readable as the described emotion/action. Order = row-major, left-to-right then top row first.

POSES (6 in row-major order, ids in brackets are for the report only, never draw them):
1. [lustig_official_tailcoat] Victor Lustig dressed as a French ministry official: black tailcoat, top hat, white gloves, tricolour sash, holding a leather briefcase, chin up, solemn official expression, facing right
2. [lustig_passports_fan] Victor Lustig (navy double-breasted coat, cream scarf, orange pocket square, black flat cap), front-on, holding a fan of five small dark passports in one gloved hand like playing cards, sly smirk, other hand on hip
3. [lustig_pen_newspaper] Victor Lustig (navy double-breasted coat, cream scarf, orange pocket square, black beret) leaning forward facing right, fountain pen in right hand reaching down as if writing the last word on something just in front of him at waist height (the newspaper is a separate prop), sly half-smile, full body, same stick style.
4. [lustig_point_viewer] Victor Lustig (cast style, beret, navy coat, scarf, orange pocket square) standing front-on, one arm extended pointing straight at the camera/viewer, other hand on hip, knowing sly grin with one raised eyebrow.
5. [lustig_polyglot_greeting] Victor Lustig (navy double-breasted coat, cream scarf, orange pocket square, black flat cap), three-quarter right, tipping his cap with one gloved hand, other hand open in greeting, mouth mid-word, warm charming smile; five small speech bubbles fan out above his head, each holding a tiny flag (France, Germany, Bohemia/Czech, Italy, Britain) instead of text
6. [lustig_prison_sad] Victor Lustig in black-and-white striped prison uniform and no cap, shoulders slumped, head bowed, hands cuffed in front, sad downturned mouth and drooping eyebrows; standing front-on; full body on flat magenta background

# Done when
All listed files exist at the exact paths and `python -I tools/check_art.py public/ink60full/art_manifests/art-poses-e.json` prints OK. Report one line per file: what it shows and any known weakness.
