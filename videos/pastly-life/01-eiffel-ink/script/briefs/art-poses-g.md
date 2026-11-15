---json
{"id": "art-poses-g", "type": "creative", "risk": "high", "repo": "D:/history-ep", "gates": ["python -I tools/check_art.py public/ink60full/art_manifests/art-poses-g.json"], "protected": ["tools/**", "src/**", "tests/**", "public/ink60full/art_manifests/**", "public/ink60full/art_refs/**", "public/ink60full/*.json", "public/ink60/**"], "context_files": ["public/ink60full/art_refs/ref_host.png", "public/ink60full/art_refs/ref_lustig.png", "public/ink60full/art_refs/lustig_master.png", "public/ink60full/art_refs/parisian_sheet.png"], "plan_check": "docs/briefs/art-poses-g.plan_check.md"}
---
# Goal
One magenta-keyed pose sheet of 6 stickman poses for the Ink Lustig episode.

# Files
Work only inside the repo (D:/history-ep). Create ONLY these files (exact names): public/ink60full/sheets/sheet_g.png. Do not edit any other file.

# Steps
Use your built-in image generation tool. Generate one image per file, then SAVE each as PNG at the exact path. Look at each result; redo any that miss the rules (wrong content, text/letters present, wrong count, magenta on a character, merged or touching poses). The gate script only checks size/key-colour/blob-count; YOU must check the look.

STYLE LOCK: match the reference images `public/ink60full/art_refs/ref_host.png`, `ref_lustig.png`, `lustig_master.png` and `parisian_sheet.png` exactly (open and study them): round plain white head, dash eyes plus one expressive brow, thin black stick limbs, big white cartoon gloves, black shoes, thick clean black outline, flat cel colour with light shading, NOT photoreal, NOT 3D.
SHEET RULES: one PNG, 1672x941 or closest, exactly 2 rows of 3 of EXACTLY the listed number of full-body poses (no extra, no fewer), each head to shoes, standing on NOTHING (no ground, no shadow; the only props allowed are those the pose description names, drawn as simple outlines, e.g. a desk front). Background = perfectly flat solid magenta #FF00FF, no gradient, no texture, no magenta anywhere on any character. Leave a wide clear magenta gap between poses so they can be cut apart; no pose may touch another or the image edge. NO text, NO labels, NO numbering. Same character identity and outfit for the same name in every pose. Poses must be clearly distinct and readable as the described emotion/action. Order = row-major, left-to-right then top row first.

POSES (6 in row-major order, ids in brackets are for the report only, never draw them):
1. [lustig_walking_profile_case] Victor Lustig (navy double-breasted coat, cream scarf, orange pocket square, black beret) walking in right-facing profile mid-stride, brown brass-cornered suitcase in the trailing hand, hurried focused look.
2. [lustig_writing_desk] Victor Lustig in profile facing right, hunched forward writing with a fountain pen on a sheet held in the other hand, concentrated narrowed eyes, small sly smile
3. [mark_talking_gesturing] Middle-aged businessman stick figure (brown suit, bowler hat, round spectacles), facing right, mid-sentence with mouth open and both hands gesturing expansively, pleased with himself
4. [parisian_awe_looking_up] Parisian bystander (brown flat cap, brown herringbone tweed jacket, bright orange scarf, dark brown trousers), front-on, head tipped back looking up and to the right, mouth open in wonder, one hand holding the cap on his head. Same stick style: white round head, long black stick legs.
5. [parisian_walk_profile] Parisian bystander (brown flat cap, tweed jacket, orange scarf) walking in side profile to the right, mid-stride, hands in pockets, bored neutral face.
6. [poisson_wife_suspicious] Madame Poisson (stick figure, white round head, plum 1920s cloche hat, pearl necklace, dark green drop-waist dress) arms crossed tightly, narrowed suspicious eyes, one eyebrow raised, mouth pursed; front-facing, transparent background

# Done when
All listed files exist at the exact paths and `python -I tools/check_art.py public/ink60full/art_manifests/art-poses-g.json` prints OK. Report one line per file: what it shows and any known weakness.
