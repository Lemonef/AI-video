---json
{"id": "art-plates-f", "type": "creative", "risk": "high", "repo": "D:/history-ep", "gates": ["python -I tools/check_art.py public/ink60full/art_manifests/art-plates-f.json"], "protected": ["tools/**", "src/**", "tests/**", "public/ink60full/art_manifests/**", "public/ink60full/art_refs/**", "public/ink60full/*.json", "public/ink60/**"], "context_files": ["public/ink60full/art_refs/paris_dusk.png", "public/ink60full/art_refs/paris_night.png"], "plan_check": "docs/briefs/art-plates-f.plan_check.md"}
---
# Goal
2 background plates for the Ink Lustig episode (hand-inked storybook look matching the existing Paris plates).

# Files
Work only inside the repo (D:/history-ep). Create ONLY these files (exact names): public/ink60full/plates/prison_hospital_ward.png, public/ink60full/plates/records_office_desk.png. Do not edit any other file.

# Steps
Use your built-in image generation tool. Generate one image per file, then SAVE each as PNG at the exact path. Look at each result; redo any that miss the rules (wrong content, text/letters present, wrong count, people/figures/text in the plate). The gate script only checks size/key-colour/blob-count; YOU must check the look.

STYLE LOCK (identical to the 6 existing Paris plates `public/ink60full/art_refs/paris_dusk.png` and `paris_night.png`; open and match them: same line weight, rendering, palette family): hand-inked storybook illustration, thick charcoal outlines, soft cel shading, muted vintage palette, paper-grain texture, 3 depth layers (foreground, midground, background). Wide 16:9 landscape, 1920x1080 or the closest 16:9 size you can output (never below 1500 px wide).
HARD RULES: NO people, NO characters, NO text, NO letters, NO logos, NO signs with readable words. Keep the central 60% of the lower half open and uncluttered: a flat walkable ground band whose horizon/ground line sits at about 75% of image height, because a stickman is composited there afterwards. Props only at far left/right edges and in the background. Each plate must show a clearly different place from the others in the batch. Any mention of actors/figures/standing space in a plate description is a space reservation only: draw NO figures, silhouettes or crowds at all. Also no speech bubbles, watermarks, perspective grids or 3D render shading.

PLATES:
1. prison_hospital_ward.png - Hand-drawn ink-and-wash 1940s prison hospital ward, 16:9: pale green tiled walls, row of white iron beds receding left, one bed in centre-left foreground (x 30-60%) sized for a stick figure propped up, small barred window with dim afternoon light at right, bedside cabinet right-centre; quiet, sad; no people, no text.
2. records_office_desk.png - Hand-drawn ink-and-wash 1940s county records office, 16:9: dark wooden counter/desk across left-centre (x 15-65%, top at y ~70%) with an ink stamp and pen, tall filing cabinets and wall clock behind, green banker's lamp; open floor right (x 60-90%) for a clerk; muted brown palette; no people, no text.

# Done when
All listed files exist at the exact paths and `python -I tools/check_art.py public/ink60full/art_manifests/art-plates-f.json` prints OK. Report one line per file: what it shows and any known weakness.
