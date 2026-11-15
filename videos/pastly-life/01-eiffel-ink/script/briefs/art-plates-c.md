---json
{"id": "art-plates-c", "type": "creative", "risk": "high", "repo": "D:/history-ep", "gates": ["python -I tools/check_art.py public/ink60full/art_manifests/art-plates-c.json"], "protected": ["tools/**", "src/**", "tests/**", "public/ink60full/art_manifests/**", "public/ink60full/art_refs/**", "public/ink60full/*.json", "public/ink60/**"], "context_files": ["public/ink60full/art_refs/paris_dusk.png", "public/ink60full/art_refs/paris_night.png"], "plan_check": "docs/briefs/art-plates-c.plan_check.md"}
---
# Goal
6 background plates for the Ink Lustig episode (hand-inked storybook look matching the existing Paris plates).

# Files
Work only inside the repo (D:/history-ep). Create ONLY these files (exact names): public/ink60full/plates/liner_cabin_night.png, public/ink60full/plates/tailor_shop_mirror.png, public/ink60full/plates/forger_desk_night.png, public/ink60full/plates/hotel_crillon_facade_day.png, public/ink60full/plates/scrap_yard_day.png, public/ink60full/plates/elite_banquet_table_night.png. Do not edit any other file.

# Steps
Use your built-in image generation tool. Generate one image per file, then SAVE each as PNG at the exact path. Look at each result; redo any that miss the rules (wrong content, text/letters present, wrong count, people/figures/text in the plate). The gate script only checks size/key-colour/blob-count; YOU must check the look.

STYLE LOCK (identical to the 6 existing Paris plates `public/ink60full/art_refs/paris_dusk.png` and `paris_night.png`; open and match them: same line weight, rendering, palette family): hand-inked storybook illustration, thick charcoal outlines, soft cel shading, muted vintage palette, paper-grain texture, 3 depth layers (foreground, midground, background). Wide 16:9 landscape, 1920x1080 or the closest 16:9 size you can output (never below 1500 px wide).
HARD RULES: NO people, NO characters, NO text, NO letters, NO logos, NO signs with readable words. Keep the central 60% of the lower half open and uncluttered: a flat walkable ground band whose horizon/ground line sits at about 75% of image height, because a stickman is composited there afterwards. Props only at far left/right edges and in the background. Each plate must show a clearly different place from the others in the batch. Any mention of actors/figures/standing space in a plate description is a space reservation only: draw NO figures, silhouettes or crowds at all. Also no speech bubbles, watermarks, perspective grids or 3D render shading.

PLATES:
1. liner_cabin_night.png - 1920s first-class ocean liner stateroom at night: round porthole with moonlit sea at centre-left, brass lamp, writing desk with inkwell and papers at left (x 5-25%), wood panelling, steamer trunk at right; open carpet floor from y ~66% down
2. tailor_shop_mirror.png - Paris tailor's fitting room 1925: tall gilt mirror at right-centre, rack of dark formal tailcoats and top hats at left, bolts of cloth on shelves, warm afternoon light; open wooden floor from y ~66% down, centre-left clear for an actor
3. forger_desk_night.png - Cramped dim room at night, wooden desk under a green banker's lamp, inkwell, rubber stamps, stacks of blank letterhead with a French tricolour government crest, wastebasket of crumpled drafts; empty floor y 68-100% left-centre for an actor added later, desk right half
4. hotel_crillon_facade_day.png - Hotel de Crillon neoclassical colonnaded facade on Place de la Concorde, daytime warm light, obelisk at left edge, grand arched entrance right-centre with doorman post, wide open cobbled/paved foreground y 64-100%
5. scrap_yard_day.png - 1920s Paris scrap-metal yard by day: heaps of rusty girders, wheels and pipes left and right, a small office shed with sign 'Ferraille', overcast sky, open dirt ground y 64-100% centre clear
6. elite_banquet_table_night.png - Grand Paris club dining room at night, 1925: long banquet table seen side-on across the right half (x 45-100%, tabletop y ~62%), candelabras and silverware, tall-backed chairs pushed in and unoccupied except ONE chair pulled out at x ~68% with a glowing place setting; chandelier above, dark panelled walls; open floor on the left half y 66-100% for two standing actors; same ink-and-watercolour style, 1672x941

# Done when
All listed files exist at the exact paths and `python -I tools/check_art.py public/ink60full/art_manifests/art-plates-c.json` prints OK. Report one line per file: what it shows and any known weakness.
