---json
{"id": "art-plates-g", "type": "creative", "risk": "high", "repo": "D:/history-ep", "gates": ["python -I tools/check_art.py public/ink60full/art_manifests/art-plates-g.json"], "protected": ["tools/**", "src/**", "tests/**", "public/ink60full/art_manifests/**", "public/ink60full/art_refs/**", "public/ink60full/*.json", "public/ink60/**"], "context_files": ["public/ink60full/art_refs/paris_dusk.png", "public/ink60full/art_refs/paris_night.png"], "plan_check": "docs/briefs/art-plates-g.plan_check.md"}
---
# Goal
6 ANGLE-VARIETY background plates (low angle, bird's-eye, extreme wide, framed doorway, top-down, 3/4 corner) for the Ink Lustig episode, hand-inked storybook look matching the existing Paris plates. Zen: the video must not be one flat side-on view; these give the camera real different angles.

# Files
Work only inside the repo (D:/history-ep). Create ONLY these files (exact names): public/ink60full/plates/tower_low_angle_up.png, public/ink60full/plates/paris_birdseye_champ_de_mars.png, public/ink60full/plates/paris_skyline_extreme_wide.png, public/ink60full/plates/hotel_doorway_framed_view.png, public/ink60full/plates/desk_topdown_papers.png, public/ink60full/plates/hotel_suite_corner_34.png. Do not edit any other file.

# Steps
Use your built-in image generation tool. Generate one image per file, then SAVE each as PNG at the exact path. Look at each result; redo any that miss the rules (wrong content, text/letters present, people/figures in the plate, wrong camera angle). The gate script only checks size/key-colour/blob-count; YOU must check the look.

STYLE LOCK (identical to the existing Paris plates `public/ink60full/art_refs/paris_dusk.png` and `paris_night.png`; open and match them: same line weight, rendering, palette family): hand-inked storybook illustration, thick charcoal outlines, soft cel shading, muted vintage palette, paper-grain texture, 3 depth layers. Wide 16:9 landscape, 1920x1080 or the closest 16:9 size you can output (never below 1500 px wide).
HARD RULES: NO people, NO characters, NO text, NO letters, NO logos, NO readable signs, no speech bubbles, no watermarks, no perspective-grid lines, no 3D render shading. Each plate must be a clearly different camera angle, exactly as described (the angle is the whole point; do NOT draw a flat side-on view). A stickman is composited afterwards only where a description names open space; elsewhere keep detail low-contrast enough that it can be cropped/zoomed.

PLATES:
1. tower_low_angle_up.png - Worm's-eye view from the ground at the base of the Eiffel Tower looking steeply UP: the four iron legs and lattice converge dramatically toward a pale dusk sky, strong upward perspective, small cobbled ground strip along the bottom 15% (open centre for a tiny figure), 1889 Paris, rust-brown iron, warm ochre sky.
2. paris_birdseye_champ_de_mars.png - High bird's-eye view looking DOWN from a balloon at 1889 Paris: Champ de Mars gardens as geometric green/cream parterres with tree-lined paths, the Eiffel Tower seen from above as a small lattice cross-shape casting a long shadow, grey zinc rooftops and the Seine curving across; no figures at all.
3. paris_skyline_extreme_wide.png - Extreme wide panoramic view of the Paris skyline at golden dusk from a far hill: tiny Eiffel Tower in the distance at the right third, rooftops, church domes, smoke, rolling foreground hill with a few bare trees; low horizon, huge sky; foreground grass band y 80-100% open centre.
4. hotel_doorway_framed_view.png - Interior hotel lobby view looking out through a tall arched doorway (frame within a frame): dark heavy door-frame and curtains forming a near-black vignette frame around the edges, bright Paris street and a glimpse of the tower beyond in the centre, polished marble floor strip at the bottom; open centre bottom for one figure.
5. desk_topdown_papers.png - Straight top-down flat-lay of a dark mahogany desk: blank cream papers with a red wax seal, an ink pot, a fountain pen, a brass magnifier, leather folder, a rubber stamp (blank), all arranged around an open empty cream rectangle in the centre (for text overlay); no text anywhere.
6. hotel_suite_corner_34.png - Three-quarter corner view of a luxurious 1889 Paris hotel suite: two walls converging at a corner left of centre, diagonal parquet floor, chandelier, tall window with drapes on the right wall, a sofa and round table in the corner; wide-angle diagonal perspective; open parquet floor lower-centre for two figures.

# Done when
All listed files exist at the exact paths and `python -I tools/check_art.py public/ink60full/art_manifests/art-plates-g.json` prints OK. Report one line per file: what it shows and any known weakness.
