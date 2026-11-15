---json
{"id": "art-poses-l2", "type": "creative", "risk": "high", "repo": "D:/history-ep", "gates": ["python -I tools/check_art.py public/ink60full/art_manifests/art-poses-l2.json"], "protected": ["tools/**", "src/**", "tests/**", "public/ink60full/art_manifests/**", "public/ink60full/art_refs/**", "public/ink60full/*.json", "public/ink60/**"], "context_files": ["public/ink60full/art_refs/ref_host.png", "public/ink60full/art_refs/ref_lustig.png", "public/ink60full/art_refs/lustig_master.png", "public/ink60full/art_refs/parisian_sheet.png"], "plan_check": "docs/briefs/art-poses-l2.plan_check.md"}
---
# Goal
One magenta-keyed sheet of 6 LOCOMOTION AND SEATED POSTURES for Count Victor Lustig, part of the detailed character library Zen asked for (camera angle changes => pose/view must change too).

# Files
Work only inside the repo (D:/history-ep). Create ONLY these files (exact names): public/ink60full/sheets/sheet_l2.png. Do not edit any other file.

# Steps
Use your built-in image generation tool. Generate the image, then SAVE it as PNG at the exact path. Look at the result; redo if it misses the rules (wrong content, text/letters present, wrong count, magenta on a character, merged or touching poses, wrong view angle, different outfit). The gate script only checks size/key-colour/blob-count; YOU must check the look.

STYLE LOCK: match the reference images `public/ink60full/art_refs/ref_host.png`, `ref_lustig.png`, `lustig_master.png` and `parisian_sheet.png` exactly (open and study them): round plain white head, dash eyes plus one expressive brow, thin black stick limbs, big white cartoon gloves, black shoes, thick clean black outline, flat cel colour with light shading, NOT photoreal, NOT 3D.
SHEET RULES: one PNG, 1672x941 or closest, exactly 2 rows of 3 of EXACTLY 6 poses (no extra, no fewer), each head to shoes (the camera-angle poses may be foreshortened but the whole body must be inside its cell), standing on NOTHING (no ground, no shadow; the only props allowed are those the pose description names, drawn as simple outlines). Background = perfectly flat solid magenta #FF00FF, no gradient, no texture, no magenta anywhere on any character. Leave a wide clear magenta gap between poses so they can be cut apart; no pose may touch another or the image edge. NO text, NO labels, NO numbering. SAME character identity and outfit in every pose. Poses must be clearly distinct and readable as the described view/emotion/action. The VIEW ANGLE in each description is the point: draw the body genuinely from that angle (back view shows the back, top-down shows the hat top), never a front-on figure redrawn. Order = row-major, left-to-right then top row first.

POSES (6 in row-major order, ids in brackets are for the report only, never draw them):
1. [lustig_walk_right] Count Victor Lustig stickman EXACTLY as in lustig_master.png and ref_lustig.png (same dapper suit, hat and moustache): mid-stride walking to the right, one arm swinging, relaxed confident walk, side view.
2. [lustig_run_right] Count Victor Lustig stickman EXACTLY as in lustig_master.png and ref_lustig.png (same dapper suit, hat and moustache): sprinting to the right, leaning forward, arms pumping, hat clutched on head with one glove, panicked.
3. [lustig_sit_chair_side] Count Victor Lustig stickman EXACTLY as in lustig_master.png and ref_lustig.png (same dapper suit, hat and moustache): sitting on a simple wooden chair (chair drawn as outline), side view facing right, legs crossed, relaxed.
4. [lustig_sit_front_desk] Count Victor Lustig stickman EXACTLY as in lustig_master.png and ref_lustig.png (same dapper suit, hat and moustache): sitting behind a plain desk front (desk drawn as outline), facing the viewer, fingers steepled, scheming grin.
5. [lustig_kneel] Count Victor Lustig stickman EXACTLY as in lustig_master.png and ref_lustig.png (same dapper suit, hat and moustache): kneeling on one knee facing right, one hand on the knee, head bowed slightly, humble.
6. [lustig_climb_stairs] Count Victor Lustig stickman EXACTLY as in lustig_master.png and ref_lustig.png (same dapper suit, hat and moustache): climbing stairs facing right, one foot raised on an invisible step, hand on a short bannister rail outline.

# Done when
All listed files exist at the exact paths and `python -I tools/check_art.py public/ink60full/art_manifests/art-poses-l2.json` prints OK. Report one line per pose: what it shows and any known weakness.
