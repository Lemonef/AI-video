---json
{"id": "art-poses-k", "type": "creative", "risk": "high", "repo": "D:/history-ep", "gates": ["python -I tools/check_art.py public/ink60full/art_manifests/art-poses-k.json"], "protected": ["tools/**", "src/**", "tests/**", "public/ink60full/art_manifests/**", "public/ink60full/art_refs/**", "public/ink60full/*.json", "public/ink60/**"], "context_files": ["public/ink60full/art_refs/ref_host.png", "public/ink60full/art_refs/ref_lustig.png", "public/ink60full/art_refs/lustig_master.png", "public/ink60full/art_refs/parisian_sheet.png"], "plan_check": "docs/briefs/art-poses-k.plan_check.md"}
---
# Goal
One magenta-keyed pose sheet of 5 stickman poses for the Ink Lustig episode.

# Files
Work only inside the repo (D:/history-ep). Create ONLY these files (exact names): public/ink60full/sheets/sheet_k.png. Do not edit any other file.

# Steps
Use your built-in image generation tool. Generate one image per file, then SAVE each as PNG at the exact path. Look at each result; redo any that miss the rules (wrong content, text/letters present, wrong count, magenta on a character, merged or touching poses). The gate script only checks size/key-colour/blob-count; YOU must check the look.

STYLE LOCK: match the reference images `public/ink60full/art_refs/ref_host.png`, `ref_lustig.png`, `lustig_master.png` and `parisian_sheet.png` exactly (open and study them): round plain white head, dash eyes plus one expressive brow, thin black stick limbs, big white cartoon gloves, black shoes, thick clean black outline, flat cel colour with light shading, NOT photoreal, NOT 3D.
SHEET RULES: one PNG, 1672x941 or closest, 2 rows (3 on top, 2 below) of EXACTLY the listed number of full-body poses (no extra, no fewer), each head to shoes, standing on NOTHING (no ground, no shadow; the only props allowed are those the pose description names, drawn as simple outlines, e.g. a desk front). Background = perfectly flat solid magenta #FF00FF, no gradient, no texture, no magenta anywhere on any character. Leave a wide clear magenta gap between poses so they can be cut apart; no pose may touch another or the image edge. NO text, NO labels, NO numbering. Same character identity and outfit for the same name in every pose. Poses must be clearly distinct and readable as the described emotion/action. Order = row-major, left-to-right then top row first.

POSES (5 in row-major order, ids in brackets are for the report only, never draw them):
1. [scrap_dealer_waiting_window] Andre Poisson, i.e. the same scrap-metal dealer as Act 3 (stocky stick figure, grey work waistcoat over rolled sleeves, bowler hat, moustache), standing three-quarter right, hands clasped behind back, gazing patiently out of frame right as if at a window.
2. [secret_service_agent] 1930s US Secret Service agent stick figure in the same cast style: white round head, grey fedora, long tan trench coat, dark tie, one arm holding up a gold badge toward the right, other hand on hip, stern frown; facing right.
3. [sheriff_angry] Same Texas sheriff front-on, fists clenched, red face, steam puffs from ears, furious frown, hat askew
4. [sheriff_paying] 1920s Texas sheriff (tan cowboy hat, star badge, vest, holster, boots, droopy moustache) facing right, holding out a thick wad of dollar bills, greedy grin
5. [soldier_radio_operator] French army stickman, early 1900s horizon-blue uniform and kepi, seated or standing at a wooden radio set, headphones on, one hand tapping a telegraph key, focused face, facing right.

# Done when
All listed files exist at the exact paths and `python -I tools/check_art.py public/ink60full/art_manifests/art-poses-k.json` prints OK. Report one line per file: what it shows and any known weakness.
