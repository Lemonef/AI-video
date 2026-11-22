---json
{"id": "ep02-scene-s03-flat", "type": "creative", "risk": "high", "repo": "D:/AI-video", "gates": ["python -I tools/ink/check_art.py videos/pastly-life/02-blackbeard-ink/assets/ink/art_manifests/ep02-scene-s03-flat.json"], "protected": ["tools/**", "engine/**", "tests/**", "docs/**", "package.json", "package-lock.json", "tsconfig.json", "conftest.py", "**/conftest.py", "pytest.ini", "pyproject.toml", "setup.cfg", "videos/pastly-life/02-blackbeard-ink/assets/ink/art_manifests/**", "videos/pastly-life/02-blackbeard-ink/assets/ink/sheets/**", "videos/pastly-life/02-blackbeard-ink/assets/ink/plates/**", "videos/pastly-life/02-blackbeard-ink/script/**", "videos/pastly-life/01-eiffel-ink/**", "videos/pastly-life/02-blackbeard-ink/assets/ink/scenes/s01_deck_party.png", "videos/pastly-life/02-blackbeard-ink/assets/ink/scenes/s03_deck_work.png"], "context_files": ["videos/pastly-life/02-blackbeard-ink/assets/ink/sheets/master_crew.png"], "plan_check": "videos/pastly-life/02-blackbeard-ink/script/briefs/ep02-scene-s03-flat.plan_check.md"}
---
# Goal
STYLE TEST for ep02: redraw scene s03 (crew at work on deck at night) in a FLAT, CLEAN, LESS-AI look. The owner said the current scenes look "AI saturated / textured". Target look = a simple flat 2D vector cartoon explainer: solid flat colour fills, one uniform outline, very little detail, pale muted colours, a background that reads in one second. If in doubt, choose LESS detail.

# Files
Work only inside the repo (D:/AI-video). Create ONLY this file (exact name): videos/pastly-life/02-blackbeard-ink/assets/ink/scenes/s03_deck_work_flat.png. Do not edit any other file.

# Steps
Use your built-in image generation tool. Generate ONE image and SAVE it as PNG at the exact path (overwrite it on each redo). Pass exactly ONE reference image to the image tool:
- CHARACTER IDENTITY: `videos/pastly-life/02-blackbeard-ink/assets/ink/sheets/master_crew.png`. Copy only the crewman DESIGN (body shapes, clothing, white round head, dot eyes, stick legs). Render him with the flat fill rules below, whatever shading the sheet has.
Do NOT pass any scene or plate image; the set is described in text only.

Then LOOK at your result and redo (up to 3 times) if ANY of these show: texture, grain or noise on any surface; shine, highlights or rim light; glow or soft light around the lantern or moon; any gradient (sky included); stars or clouds; vignette, haze or blur; wood grain or rope detail; a warm wash over the frame; more than 2 tones on any object; varying or sketchy line weight; oversized hands; realistic faces; any text or letters; wrong crew design; legs cropped out of frame; ship out of scale.

Characters:
- CREWMAN (draw 3 of them): white round head with two black dot eyes, muted brick-red bandana, blue-and-white striped shirt, brown vest, tan knee-length trousers, small white hands, black shoes, thin black stick legs and stick-thin arms.

PROMPT:
Flat 2D vector cartoon explainer illustration, like a simple educational animation frame. Every shape is one solid flat colour with crisp hard edges. One uniform dark navy outline (#1f2533) of the same thickness on every object, clean vector strokes, no hatching. Each object has a base colour plus at most ONE darker flat shadow shape with a hard edge. Palette, use only these: sky #3b4a63 as one single flat colour from top to horizon; sea #2c3a4f as one flat band; deck and rail #8a8f99 with plank lines #6f747e; mast and bucket #8b7a68; moon #e8e4d8 as a flat disc; crew shirt stripes #4a6a9a and #f2f2f2, vest #6e5642, trousers #c8b48f, bandana #9a4a42. The ONLY warm colour in the frame is the small lantern, #e0a040, plus one flat ellipse of #a49c8a on the deck under it with a hard edge.
CAMERA: medium-wide shot, eye level, full bodies head to shoes visible, on the deck of a small one-mast sloop at night. Left third: two crewmen standing side by side, leaning back, hauling one plain rope that runs up the mast out of frame. Right third: one crewman kneeling on one knee, scrubbing the deck with a plain brush beside a plain bucket. Background: the plain rail across the frame at waist height of the standing men, the flat sea band above the rail, the round moon upper right, one lantern hanging on a short post near the kneeling man, the mast at left behind the haulers. Props are only: mast, rope, rail, lantern on post, brush, bucket. Big calm empty areas of flat colour. Planks are a few straight parallel lines. SHIP SCALE: rail top at a standing man's waist; lantern about head-sized; bucket reaches the kneeling man's shoulder. Wide 16:9 landscape, 1920x1080 or the closest 16:9 size you can output (never below 1500 px wide).

AVOID (keep short): texture, gradients, glow, highlights, painterly or 3D look, stars, text.

HARD RULES: exactly 3 crewmen as described, no other figures; NO text, NO letters, NO numbers, NO logos, NO readable signs; no watermarks; no white outline/halo around characters.

# Done when
The file exists and `python -I tools/ink/check_art.py videos/pastly-life/02-blackbeard-ink/assets/ink/art_manifests/ep02-scene-s03-flat.json` prints OK. Report: what the image shows, how flat/simple it is against the redo list, how the crew match the sheet, and any weak areas.
