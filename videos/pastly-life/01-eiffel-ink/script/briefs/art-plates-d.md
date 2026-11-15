---json
{"id": "art-plates-d", "type": "creative", "risk": "high", "repo": "D:/history-ep", "gates": ["python -I tools/check_art.py public/ink60full/art_manifests/art-plates-d.json"], "protected": ["tools/**", "src/**", "tests/**", "public/ink60full/art_manifests/**", "public/ink60full/art_refs/**", "public/ink60full/*.json", "public/ink60/**"], "context_files": ["public/ink60full/art_refs/paris_dusk.png", "public/ink60full/art_refs/paris_night.png"], "plan_check": "docs/briefs/art-plates-d.plan_check.md"}
---
# Goal
6 background plates for the Ink Lustig episode (hand-inked storybook look matching the existing Paris plates).

# Files
Work only inside the repo (D:/history-ep). Create ONLY these files (exact names): public/ink60full/plates/limousine_street_day.png, public/ink60full/plates/poisson_parlour_night.png, public/ink60full/plates/paris_train_station_night.png, public/ink60full/plates/vienna_street_dusk.png, public/ink60full/plates/vienna_cafe_morning.png, public/ink60full/plates/paris_police_station.png. Do not edit any other file.

# Steps
Use your built-in image generation tool. Generate one image per file, then SAVE each as PNG at the exact path. Look at each result; redo any that miss the rules (wrong content, text/letters present, wrong count, people/figures/text in the plate). The gate script only checks size/key-colour/blob-count; YOU must check the look.

STYLE LOCK (identical to the 6 existing Paris plates `public/ink60full/art_refs/paris_dusk.png` and `paris_night.png`; open and match them: same line weight, rendering, palette family): hand-inked storybook illustration, thick charcoal outlines, soft cel shading, muted vintage palette, paper-grain texture, 3 depth layers (foreground, midground, background). Wide 16:9 landscape, 1920x1080 or the closest 16:9 size you can output (never below 1500 px wide).
HARD RULES: NO people, NO characters, NO text, NO letters, NO logos, NO signs with readable words. Keep the central 60% of the lower half open and uncluttered: a flat walkable ground band whose horizon/ground line sits at about 75% of image height, because a stickman is composited there afterwards. Props only at far left/right edges and in the background. Each plate must show a clearly different place from the others in the batch. Any mention of actors/figures/standing space in a plate description is a space reservation only: draw NO figures, silhouettes or crowds at all. Also no speech bubbles, watermarks, perspective grids or 3D render shading.

PLATES:
1. limousine_street_day.png - Paris boulevard outside the Hotel de Crillon, 1925, grey-bright afternoon: two long black 1920s limousines with chauffeurs parked right-centre (x 50-95%, wheels at y ~70%), stone hotel facade with flags behind, plane trees; open cobbled pavement y 66-100% on the left half for actors; same ink-and-watercolour style and framing as paris_dusk, 1672x941
2. poisson_parlour_night.png - Modest bourgeois Paris parlour at night, 1925: patterned wallpaper, small fireplace with a clock at centre-left, armchair at far left, oil lamp glowing on a side table at far right (x ~90%), heavy curtains; plain wooden floor y 66-100% open across the centre for two actors added later; same ink-and-watercolour style, 1672x941
3. paris_train_station_night.png - Paris Gare de l'Est interior at night, hand-drawn ink and watercolour matching existing plates: iron-and-glass arched roof, steam locomotive with carriages along the right third (x 65-100%), warm gas lamps, platform clock top-centre, open stone platform floor from y ~65% to bottom across full width, centre-left clear for actors.
4. vienna_street_dusk.png - Vienna Ringstrasse street at dusk, 1925, same ink-and-watercolour style: Baroque facades and a church spire (Stephansdom-like) right-centre, tram wires, orange-pink sky, gas lamps at x ~12% and ~88%, open cobbled foreground from y ~63% down, centre clear for one or two actors. No Eiffel Tower.
5. vienna_cafe_morning.png - Viennese coffee-house interior in morning light, 1925: marble tables, bentwood chairs, newspaper rack on wooden holders at left (x 0-15%), tall windows onto a Vienna street at right, warm cream walls, open wooden floor from y ~66% down, centre clear for an actor added later.
6. paris_police_station.png - Exterior of a 1920s Paris commissariat at grey daytime: stone facade with blue-white-red flag and 'POLICE' lamp over a dark double door at right (x 75-92%), wet cobbles from y ~63% down, centre-left open for two actors facing each other.

# Done when
All listed files exist at the exact paths and `python -I tools/check_art.py public/ink60full/art_manifests/art-plates-d.json` prints OK. Report one line per file: what it shows and any known weakness.
