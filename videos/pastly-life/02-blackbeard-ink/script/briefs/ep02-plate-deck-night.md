---json
{"id": "ep02-plate-deck-night", "type": "creative", "risk": "high", "repo": "D:/AI-video", "gates": ["python -I tools/ink/check_art.py videos/pastly-life/02-blackbeard-ink/assets/ink/art_manifests/ep02-plate-deck-night.json"], "protected": ["tools/**", "engine/**", "tests/**", "docs/**", "package.json", "package-lock.json", "tsconfig.json", "conftest.py", "**/conftest.py", "pytest.ini", "pyproject.toml", "setup.cfg", "videos/pastly-life/02-blackbeard-ink/assets/ink/art_manifests/**", "videos/pastly-life/02-blackbeard-ink/script/**", "videos/pastly-life/01-eiffel-ink/**"], "context_files": ["videos/pastly-life/01-eiffel-ink/assets/ink60full/art_refs/paris_night.png", "videos/pastly-life/01-eiffel-ink/assets/ink60full/art_refs/paris_dusk.png"], "plan_check": "videos/pastly-life/02-blackbeard-ink/script/briefs/ep02-plate-deck-night.plan_check.md"}
---
# Goal
Main set of minute 1: the open deck of Blackbeard's small sloop at night, lantern-lit, party mood.

# Files
Work only inside the repo (D:/AI-video). Create ONLY this file (exact name): videos/pastly-life/02-blackbeard-ink/assets/ink/plates/deck_night_lanterns.png. Do not edit any other file.

# Steps
Use your built-in image generation tool. Generate ONE image, SAVE it as PNG at the exact path. Look at it; redo (up to 3 times) if it misses the rules (wrong content, text/letters present, people/figures in the plate, wrong camera angle, flat side-on view when another angle is asked). STYLE LOCK: match `videos/pastly-life/01-eiffel-ink/assets/ink60full/art_refs/paris_night.png` and `videos/pastly-life/01-eiffel-ink/assets/ink60full/art_refs/paris_dusk.png` (open them): same line weight, rendering and paper grain, but this is 1718 colonial North Carolina coast, not Paris. Hand-inked storybook illustration, thick charcoal outlines, soft cel shading, muted vintage palette, paper-grain texture, 3 depth layers (foreground, mid, back). Wide 16:9 landscape, 1920x1080 or the closest 16:9 size you can output (never below 1500 px wide). HARD RULES: NO people, NO characters, NO text, NO letters, NO logos, NO readable signs, NO flags with symbols (plain cloth only), no watermarks, no 3D render shading. A stickman is composited afterwards where the description names open space; keep that area low-detail.

PROMPT:
Three-quarter view from the stern looking forward along the open wooden deck of a small single-masted 1718 sloop at night: warm orange lanterns hanging from the rigging, a single mast with a furled grey sail, a few barrels and a coil of rope on the deck, a cannon at the rail, dark calm water and black pine-tree shoreline beyond the rail, a deep blue starry sky with a thin moon. Diagonal plank perspective. Open empty deck in the lower-centre and left for 3-5 figures. Foreground: a barrel and a lantern cropped at the bottom-left corner.

# Done when
The file exists and `python -I tools/ink/check_art.py videos/pastly-life/02-blackbeard-ink/assets/ink/art_manifests/ep02-plate-deck-night.json` prints OK. Report: what the image shows and any weak cells/areas.
