---json
{"id": "ep02-scene-s05-rail-thinking", "type": "creative", "risk": "high", "repo": "D:/AI-video", "gates": ["python -I tools/ink/check_art.py videos/pastly-life/02-blackbeard-ink/assets/ink/art_manifests/ep02-scene-s05-rail-thinking.json"], "protected": ["tools/**", "engine/**", "tests/**", "docs/**", "package.json", "package-lock.json", "tsconfig.json", "conftest.py", "**/conftest.py", "pytest.ini", "pyproject.toml", "setup.cfg", "videos/pastly-life/02-blackbeard-ink/assets/ink/art_manifests/**", "videos/pastly-life/02-blackbeard-ink/assets/ink/sheets/**", "videos/pastly-life/02-blackbeard-ink/assets/ink/plates/**", "videos/pastly-life/02-blackbeard-ink/script/**", "videos/pastly-life/01-eiffel-ink/**", "videos/pastly-life/02-blackbeard-ink/assets/ink/scenes/s01_deck_party.png"], "context_files": ["videos/pastly-life/02-blackbeard-ink/assets/ink/sheets/master_crew.png", "videos/pastly-life/02-blackbeard-ink/assets/ink/plates/deck_night_lanterns.png", "videos/pastly-life/02-blackbeard-ink/assets/ink/scenes/s01_deck_party.png", "videos/pastly-life/01-eiffel-ink/assets/ink60full/art_refs/paris_night.png"], "plan_check": "videos/pastly-life/02-blackbeard-ink/script/briefs/ep02-scene-s05-rail-thinking.plan_check.md"}
---
# Goal
One ep02 scene shot: one crewman alone at the rail, seen from behind, chin in hand, thinking while looking at the dark water. The characters are DRAWN INTO the scene (one finished illustration, lit by the same lanterns and moon as the place), matching the approved first scene `videos/pastly-life/02-blackbeard-ink/assets/ink/scenes/s01_deck_party.png` in style and quality.

# Files
Work only inside the repo (D:/AI-video). Create ONLY this file (exact name): videos/pastly-life/02-blackbeard-ink/assets/ink/scenes/s05_rail_thinking.png. Do not edit any other file.

# Steps
Use your built-in image generation tool. Generate ONE image and SAVE it as PNG at the exact path. Pass the reference images to the image tool:
- CHARACTER IDENTITY: `videos/pastly-life/02-blackbeard-ink/assets/ink/sheets/master_crew.png` (crewman). Copy the exact design: proportions, outline weight, colours, face style. Cartoon stickmen, never realistic people.
- SET: `videos/pastly-life/02-blackbeard-ink/assets/ink/plates/deck_night_lanterns.png` is this place on the same ship; keep its design but use the camera described below.
- STYLE MATCH: `videos/pastly-life/02-blackbeard-ink/assets/ink/scenes/s01_deck_party.png` is the approved first scene. Match its line weight, colour grading, lantern glow and paper grain, so all scenes cut together as one film.

Then LOOK at your result and redo (up to 3 times) if any of these fail: a character does not match its sheet (wrong colours, realistic face, missing details); characters look pasted on (no shadow, lit differently from the place, white rim around them); characters too big (see size rule); any text or letters; wrong number of figures; flat side-on view.

Characters (match the sheets exactly):
- CREWMAN: white round head with simple dot eyes, red bandana with knot tails, blue-and-white striped shirt, brown vest, rope belt, tan knee-length trousers, white gloves, black shoes, thin black stick legs.

PROMPT:
Hand-inked storybook illustration, thick charcoal outlines, soft cel shading, muted vintage palette, paper-grain texture, same look as the approved first scene. Night on the same sloop, camera behind and slightly above, looking past the stern rail out over the calm inlet. In the right third, one CREWMAN leans on the rail with his BACK to the camera, chin resting in one hand, alone and thinking, small in the frame. A single lantern on a post beside him lights his shoulder warm; the moon throws his long shadow back across the deck toward the camera. Beyond: wide still water with a moon path, black pine shoreline, deep starry sky. Foreground: a barrel and a coil of rope cropped by the bottom-left frame edge. Upper-left sky calm and low-detail. Characters are SMALL in the place: each about one quarter of the frame height or less; at least 55 percent of the frame is the place itself (ship, water, sky, cargo), like a film wide shot, not a character poster. One light logic: every character is lit and shadowed by the same lanterns and moon as the place around them. Wide 16:9 landscape, 1920x1080 or the closest 16:9 size you can output (never below 1500 px wide).

HARD RULES: exactly 1 character as listed, no other people or figures; no realistic humans; NO text, NO letters, NO numbers, NO logos, NO readable signs, plain cloth and plain crates only, no watermarks, no 3D render look, no white outline/halo around the characters.

# Done when
The file exists and `python -I tools/ink/check_art.py videos/pastly-life/02-blackbeard-ink/assets/ink/art_manifests/ep02-scene-s05-rail-thinking.json` prints OK. Report: what the image shows, how well each character matches its sheet, and any weak areas.
