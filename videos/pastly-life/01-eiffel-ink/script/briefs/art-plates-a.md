---json
{"id": "art-plates-a", "type": "creative", "risk": "high", "repo": "D:/history-ep", "gates": ["python -I tools/check_art.py public/ink60full/art_manifests/art-plates-a.json"], "protected": ["tools/**", "src/**", "tests/**", "public/ink60full/art_manifests/**", "public/ink60full/art_refs/**", "public/ink60full/*.json", "public/ink60/**"], "context_files": ["public/ink60full/art_refs/paris_dusk.png", "public/ink60full/art_refs/paris_night.png"], "plan_check": "docs/briefs/art-plates-a.plan_check.md"}
---
# Goal
6 background plates for the Ink Lustig episode (hand-inked storybook look matching the existing Paris plates).

# Files
Work only inside the repo (D:/history-ep). Create ONLY these files (exact names): public/ink60full/plates/chicago_street_night.png, public/ink60full/plates/federal_jail_exterior_night.png, public/ink60full/plates/alcatraz_island_fog.png, public/ink60full/plates/crillon_salon_chandeliers.png, public/ink60full/plates/paris_expo_1889.png, public/ink60full/plates/paris_cafe_artists.png. Do not edit any other file.

# Steps
Use your built-in image generation tool. Generate one image per file, then SAVE each as PNG at the exact path. Look at each result; redo any that miss the rules (wrong content, text/letters present, wrong count, people/figures/text in the plate). The gate script only checks size/key-colour/blob-count; YOU must check the look.

STYLE LOCK (identical to the 6 existing Paris plates `public/ink60full/art_refs/paris_dusk.png` and `paris_night.png`; open and match them: same line weight, rendering, palette family): hand-inked storybook illustration, thick charcoal outlines, soft cel shading, muted vintage palette, paper-grain texture, 3 depth layers (foreground, midground, background). Wide 16:9 landscape, 1920x1080 or the closest 16:9 size you can output (never below 1500 px wide).
HARD RULES: NO people, NO characters, NO text, NO letters, NO logos, NO signs with readable words. Keep the central 60% of the lower half open and uncluttered: a flat walkable ground band whose horizon/ground line sits at about 75% of image height, because a stickman is composited there afterwards. Props only at far left/right edges and in the background. Each plate must show a clearly different place from the others in the batch. Any mention of actors/figures/standing space in a plate description is a space reservation only: draw NO figures, silhouettes or crowds at all. Also no speech bubbles, watermarks, perspective grids or 3D render shading.

PLATES:
1. chicago_street_night.png - 1920s Chicago street at night, hand-drawn ink and watercolour style matching the Paris plates: brick buildings with fire escapes, neon-less painted speakeasy sign, a parked black 1920s sedan at far right (x 80-100%), lamp posts at x ~12% and ~88%, wet asphalt from y ~63% down fully open, centre x 20-80% clear for two actors
2. federal_jail_exterior_night.png - Exterior of a 1930s New York federal detention building at night, same ink style: tall grey stone wall with barred windows, one window at upper-left open with a knotted white bedsheet rope hanging down to the street, searchlight beam across a navy sky, sidewalk from y ~63% down open, centre and right clear for a sneaking actor
3. alcatraz_island_fog.png - Alcatraz island prison seen from the shore/dock in heavy grey fog, same ink style: cellhouse and lighthouse on the rock at right (x 60-95%), choppy grey bay water mid-ground, wooden dock planks foreground from y ~65% down fully open, left/centre clear for one actor; mood bleak and lonely
4. crillon_salon_chandeliers.png - Palatial hotel salon interior: gilded panelled walls, two crystal chandeliers, tall mirrors, red velvet chairs pushed to the edges, polished parquet floor open y 66-100% full width, centre clear for 2-3 actors added later
5. paris_expo_1889.png - 1889 Paris World's Fair (Exposition Universelle) on the Champ de Mars, sunny day: the brand-new Eiffel Tower, painted red-brown, at right (x 68-95%), flags and bunting, exhibition pavilions and empty distant promenade, no visitors; open sandy foreground from y ~65% down, centre-left clear for actors. Same hand-drawn ink and watercolour style as the existing plates, 16:9.
6. paris_cafe_artists.png - Montmartre-style Paris cafe terrace by day: small round marble tables with chairs, striped awning, easels and canvases leaning on the wall at left, the Eiffel Tower small and dark on the far skyline at right; open paved floor from y ~65% down, keep centre-left (x 35-45%) bare floor, the petition prop is added later. Same ink and watercolour style, 16:9.

# Done when
All listed files exist at the exact paths and `python -I tools/check_art.py public/ink60full/art_manifests/art-plates-a.json` prints OK. Report one line per file: what it shows and any known weakness.
