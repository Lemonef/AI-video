---json
{"id": "ep02-scene-s03-deck-work", "type": "creative", "risk": "high", "repo": "D:/AI-video", "gates": ["python -I tools/ink/check_art.py videos/pastly-life/02-blackbeard-ink/assets/ink/art_manifests/ep02-scene-s03-deck-work.json"], "protected": ["tools/**", "engine/**", "tests/**", "docs/**", "package.json", "package-lock.json", "tsconfig.json", "conftest.py", "**/conftest.py", "pytest.ini", "pyproject.toml", "setup.cfg", "videos/pastly-life/02-blackbeard-ink/assets/ink/art_manifests/**", "videos/pastly-life/02-blackbeard-ink/assets/ink/sheets/**", "videos/pastly-life/02-blackbeard-ink/assets/ink/plates/**", "videos/pastly-life/02-blackbeard-ink/script/**", "videos/pastly-life/01-eiffel-ink/**", "videos/pastly-life/02-blackbeard-ink/assets/ink/scenes/s01_deck_party.png"], "context_files": ["videos/pastly-life/02-blackbeard-ink/assets/ink/sheets/master_crew.png", "videos/pastly-life/02-blackbeard-ink/assets/ink/plates/deck_night_lanterns.png", "videos/pastly-life/02-blackbeard-ink/assets/ink/scenes/s01_deck_party.png", "videos/pastly-life/01-eiffel-ink/assets/ink60full/art_refs/paris_night.png"], "plan_check": "videos/pastly-life/02-blackbeard-ink/script/briefs/ep02-scene-s03-deck-work.plan_check.md"}
---
# Goal
One ep02 scene shot: an extreme close-up insert of crew hands at work on deck by lantern light. The characters are DRAWN INTO the scene (one finished illustration, lit by the same lanterns and moon as the place), matching the approved first scene `videos/pastly-life/02-blackbeard-ink/assets/ink/scenes/s01_deck_party.png` in style and quality.

# Files
Work only inside the repo (D:/AI-video). Create ONLY this file (exact name): videos/pastly-life/02-blackbeard-ink/assets/ink/scenes/s03_deck_work.png. Do not edit any other file.

# Steps
Use your built-in image generation tool. Generate ONE image and SAVE it as PNG at the exact path. Pass the reference images to the image tool:
- CHARACTER IDENTITY: `videos/pastly-life/02-blackbeard-ink/assets/ink/sheets/master_crew.png` (crewman). Copy the exact design: proportions, outline weight, colours, face style. Cartoon stickmen, never realistic people.
- SET: `videos/pastly-life/02-blackbeard-ink/assets/ink/plates/deck_night_lanterns.png` is this place on the same ship; keep its design and scale but use the CAMERA described below.
- STYLE MATCH: `videos/pastly-life/02-blackbeard-ink/assets/ink/scenes/s01_deck_party.png` is the approved first scene. Match its line weight, colour grading, lantern glow and paper grain, so all scenes cut together as one film.

Then LOOK at your result and redo (up to 3 times) if any of these fail: a character does not match its sheet (wrong colours, realistic face, missing details); characters look pasted on (no shadow, lit differently from the place, white rim around them); wrong camera (must be the CAMERA framing named in the prompt); any text or letters; wrong number of figures; ship out of scale vs SHIP SCALE (rail above a figure's waist, giant deck, long hold).

Characters (match the sheets exactly):
- CREWMAN: white round head with simple dot eyes, red bandana with knot tails, blue-and-white striped shirt, brown vest, rope belt, tan knee-length trousers, white gloves, black shoes, thin black stick legs.

PROMPT:
Hand-inked storybook illustration, thick charcoal outlines, soft cel shading, muted vintage palette, paper-grain texture, same look as the approved first scene. CAMERA: extreme close-up insert shot of hands, camera at knee height on the deck planks. Left half: two white-gloved hands in blue-and-white striped sleeves gripping and hauling a thick rope that runs out of frame upward, rope fibres and strain visible. Right half: a third white-gloved hand in a striped sleeve pushing a wet scrub brush across dark planks beside a wooden bucket, suds and lantern reflections on the wet wood. No faces, no heads, only hands, forearms and sleeves. This is a CLOSE shot: the framed subject fills most of the frame; do NOT pull back to a wide deck view. Anything of the ship that shows must still obey SHIP SCALE. SHIP SCALE (same ship in every shot, match s01): a small one-mast sloop about 12 figures long; the rail top sits at a standing figure's waist; the deck is about 5 figures wide; the mast is about 4 figures tall to the yard; a lantern is head-sized; barrels reach from hip to chest. The hold is low (a standing figure stoops, head near the beams) and short (about 4 figures long), crates stacked to the beams. Never a giant galleon deck, never a long tunnel hold. One light logic: every character is lit and shadowed by the same lanterns and moon as the place around them. Wide 16:9 landscape, 1920x1080 or the closest 16:9 size you can output (never below 1500 px wide).

HARD RULES: only crew hands, forearms and striped sleeves (from 2 or 3 crewmen) as described, no heads, no faces, no other figures; no realistic humans; NO text, NO letters, NO numbers, NO logos, NO readable signs, plain cloth and plain crates only, no watermarks, no 3D render look, no white outline/halo around the characters.

# Done when
The file exists and `python -I tools/ink/check_art.py videos/pastly-life/02-blackbeard-ink/assets/ink/art_manifests/ep02-scene-s03-deck-work.json` prints OK. Report: what the image shows, how well each character matches its sheet, and any weak areas.
