---json
{"id": "art-plates-b", "type": "creative", "risk": "high", "repo": "D:/history-ep", "gates": ["python -I tools/check_art.py public/ink60full/art_manifests/art-plates-b.json"], "protected": ["tools/**", "src/**", "tests/**", "public/ink60full/art_manifests/**", "public/ink60full/art_refs/**", "public/ink60full/*.json", "public/ink60/**"], "context_files": ["public/ink60full/art_refs/paris_dusk.png", "public/ink60full/art_refs/paris_night.png"], "plan_check": "docs/briefs/art-plates-b.plan_check.md"}
---
# Goal
6 background plates for the Ink Lustig episode (hand-inked storybook look matching the existing Paris plates).

# Files
Work only inside the repo (D:/history-ep). Create ONLY these files (exact names): public/ink60full/plates/tower_radio_station.png, public/ink60full/plates/tower_rust_closeup.png, public/ink60full/plates/ministry_office_day.png, public/ink60full/plates/bohemia_village_1890.png, public/ink60full/plates/police_records_office.png, public/ink60full/plates/ocean_liner_deck.png. Do not edit any other file.

# Steps
Use your built-in image generation tool. Generate one image per file, then SAVE each as PNG at the exact path. Look at each result; redo any that miss the rules (wrong content, text/letters present, wrong count, people/figures/text in the plate). The gate script only checks size/key-colour/blob-count; YOU must check the look.

STYLE LOCK (identical to the 6 existing Paris plates `public/ink60full/art_refs/paris_dusk.png` and `paris_night.png`; open and match them: same line weight, rendering, palette family): hand-inked storybook illustration, thick charcoal outlines, soft cel shading, muted vintage palette, paper-grain texture, 3 depth layers (foreground, midground, background). Wide 16:9 landscape, 1920x1080 or the closest 16:9 size you can output (never below 1500 px wide).
HARD RULES: NO people, NO characters, NO text, NO letters, NO logos, NO signs with readable words. Keep the central 60% of the lower half open and uncluttered: a flat walkable ground band whose horizon/ground line sits at about 75% of image height, because a stickman is composited there afterwards. Props only at far left/right edges and in the background. Each plate must show a clearly different place from the others in the batch. Any mention of actors/figures/standing space in a plate description is a space reservation only: draw NO figures, silhouettes or crowds at all. Also no speech bubbles, watermarks, perspective grids or 3D render shading.

PLATES:
1. tower_radio_station.png - Foot of the Eiffel Tower around 1910: a wooden military radio hut with antenna wires running up into the tower legs at right (x 65-100%), a tricolour flag, sandbags; overcast sky; open ground from y ~65% down, centre-left clear for a soldier actor. Same ink and watercolour style, 16:9.
2. tower_rust_closeup.png - Close view of the Eiffel Tower's lower ironwork in grey weather: rusted, flaking red-brown girders and rivets filling the right half, paint peeling, a painter's ladder and paint buckets on scaffolding; open ground band from y ~66% down at left and centre for one actor. Same ink and watercolour style, 16:9.
3. ministry_office_day.png - 1920s French government office interior by day: dark wooden desk with stacks of papers and ledgers at right-centre, tall window with the Eiffel Tower faintly visible, filing cabinets, framed tricolour seal on the wall; open wooden floor from y ~68% down, centre-left clear for an actor. Same ink and watercolour style, 16:9.
4. bohemia_village_1890.png - Small Bohemian country town c.1890: cobbled square, pastel gabled houses with red tile roofs, onion-dome church tower at left, chestnut trees, overcast morning; hand-drawn ink + flat colour matching the Paris plates; open cobbled foreground from y ~65% down, centre x 25-80% clear for actors, no Eiffel Tower
5. police_records_office.png - 1920s European police records office interior: wooden filing cabinets and pigeonholes stacked with folders at left and right, desk lamp, map of Europe pinned on back wall with string between cities, dim lamplight; open wooden floor from y ~66% down, centre clear for one or two actors
6. ocean_liner_deck.png - First-class promenade deck of a 1920s transatlantic ocean liner by day: white railing at y ~58%, open sea and horizon behind, lifeboats and a funnel at top right, wooden deck chairs at far left; teak deck floor from y ~64% down fully open, centre x 20-80% clear for actors

# Done when
All listed files exist at the exact paths and `python -I tools/check_art.py public/ink60full/art_manifests/art-plates-b.json` prints OK. Report one line per file: what it shows and any known weakness.
