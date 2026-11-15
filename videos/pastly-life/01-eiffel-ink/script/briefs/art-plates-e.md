---json
{"id": "art-plates-e", "type": "creative", "risk": "high", "repo": "D:/history-ep", "gates": ["python -I tools/check_art.py public/ink60full/art_manifests/art-plates-e.json"], "protected": ["tools/**", "src/**", "tests/**", "public/ink60full/art_manifests/**", "public/ink60full/art_refs/**", "public/ink60full/*.json", "public/ink60/**"], "context_files": ["public/ink60full/art_refs/paris_dusk.png", "public/ink60full/art_refs/paris_night.png"], "plan_check": "docs/briefs/art-plates-e.plan_check.md"}
---
# Goal
6 background plates for the Ink Lustig episode (hand-inked storybook look matching the existing Paris plates).

# Files
Work only inside the repo (D:/history-ep). Create ONLY these files (exact names): public/ink60full/plates/new_york_street_night.png, public/ink60full/plates/backroom_workshop_lamp.png, public/ink60full/plates/texas_main_street_day.png, public/ink60full/plates/capone_office.png, public/ink60full/plates/bank_vault_safe_deposit.png, public/ink60full/plates/prison_cell.png. Do not edit any other file.

# Steps
Use your built-in image generation tool. Generate one image per file, then SAVE each as PNG at the exact path. Look at each result; redo any that miss the rules (wrong content, text/letters present, wrong count, people/figures/text in the plate). The gate script only checks size/key-colour/blob-count; YOU must check the look.

STYLE LOCK (identical to the 6 existing Paris plates `public/ink60full/art_refs/paris_dusk.png` and `paris_night.png`; open and match them: same line weight, rendering, palette family): hand-inked storybook illustration, thick charcoal outlines, soft cel shading, muted vintage palette, paper-grain texture, 3 depth layers (foreground, midground, background). Wide 16:9 landscape, 1920x1080 or the closest 16:9 size you can output (never below 1500 px wide).
HARD RULES: NO people, NO characters, NO text, NO letters, NO logos, NO signs with readable words. Keep the central 60% of the lower half open and uncluttered: a flat walkable ground band whose horizon/ground line sits at about 75% of image height, because a stickman is composited there afterwards. Props only at far left/right edges and in the background. Each plate must show a clearly different place from the others in the batch. Any mention of actors/figures/standing space in a plate description is a space reservation only: draw NO figures, silhouettes or crowds at all. Also no speech bubbles, watermarks, perspective grids or 3D render shading.

PLATES:
1. new_york_street_night.png - Hand-drawn ink-and-wash 1930s New York street at night, 16:9: brick tenements and a lit pawnshop/bank front on the right third, fire escapes, wet asphalt reflecting yellow streetlamps, a parked black 1930s sedan far right; open empty pavement foreground y 62-100% across x 15-80% for stick figures standing feet ~y 83%; no people, no text.
2. backroom_workshop_lamp.png - Dim 1920s American back room / hotel suite workroom: single green-shaded hanging lamp, wooden workbench at right with tools and a small mahogany box with brass crank, venetian blinds, wallpaper; wooden floor y 66-100% open, actors left and centre
3. texas_main_street_day.png - Dusty 1920s small Texas town main street, bright day, false-front wooden storefronts, a sheriff's office sign right, water tower and a parked Model-T, tumbleweed; sandy ground y 64-100% open across full width
4. capone_office.png - Al Capone's 1920s Chicago hotel office (Lexington Hotel): dark wood panelling, big mahogany desk right of centre (x 60-85%) with ashtray and phone, leather chair, framed portrait, window with blinds and city lights; wooden floor y 66-100% open, actors left and centre
5. bank_vault_safe_deposit.png - 1920s American bank vault: wall of brass safe-deposit boxes left-to-right, massive round steel vault door open at right (x 70-95%), marble floor y 66-100% open, actors left and centre
6. prison_cell.png - Hand-drawn ink-and-wash 1930s jail cell interior, 16:9: grey stone walls, iron-barred door on left (x 0-20%), high barred window at right (x 65-85%, y 15-40%) with moonlight shaft, narrow cot with white bedsheet at back wall, open stone floor y 65-100% centre clear for one actor; cold blue-grey palette; no people, no text.

# Done when
All listed files exist at the exact paths and `python -I tools/check_art.py public/ink60full/art_manifests/art-plates-e.json` prints OK. Report one line per file: what it shows and any known weakness.
