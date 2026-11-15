---json
{"id": "restage-variety", "type": "normal", "risk": "low", "repo": "D:/history-ep", "gates": ["python -I tools/check_restage.py"], "protected": ["tools/**", "src/**", "tests/**", "public/ink60full/plates/**", "public/ink60full/timeline_full.json"], "context_files": []}
---
# Goal
Shot variety: Zen said the video is "still side view". Give standing-actor scene shots close-up and low-angle focus cameras.

# Files
Work only inside the repo (D:/history-ep). Create `out/restage_variety.py`; run it once to edit `public/ink60full/directed_full.json` in place. No other file.

# Steps
Data shape: `{"shots": {beat: [shot,...]}}`; scene shot has `k:"scene"`, optional `actors:[{x,y,h,move,enter}]`, `cam:{move,amt}`. Canvas W=1920, H=1080.
Script rule (deterministic, idempotent): iterate beats in file order, scene shots only. Eligible = has actors AND actors[0] has no `move` AND `actors[0].enter.how != "walk"`. Keep counter i over eligible shots (1-based):
- i%3==1: `cam = {"move":"push","zoom":2.1,"focus":{"x":round(x/1920,3),"y":round((y-h*0.72)/1080,3)}}` (close-up on head; x,y,h from actors[0], defaults 960,900,620)
- i%3==2: `cam = {"move":"hold","zoom":1.65,"focus":{"x":round(x/1920,3),"y":round((y-h*0.3)/1080,3)}}` (low-angle torso/legs)
- i%3==0: leave untouched.
Clamp focus x,y into [0,1]. Write JSON back with ensure_ascii=False, indent=1. Print counts. Do not change any other key.

# Done when
`python -I tools/check_restage.py` prints OK (fails now: no focus cams yet). Running the script twice gives identical file bytes (idempotent). Report counts of close/low.
