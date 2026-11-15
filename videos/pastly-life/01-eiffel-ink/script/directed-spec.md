# Directed shot spec (Ink full episode)

Replaces rule-derived `shots_full.json`. One file per act: `public/ink60full/directed/act<N>.json`, merged by `tools/merge_directed.py` into `directed_full.json`.
Bar = the 10 s proof (`src/ink/ep1.tsx`, `src/compositions/InkProof.tsx`): varied plate per place, pose matched to the sentence meaning, real camera + sprite motion, props, cuts on the voice.

```jsonc
{ "<beatId>": [            // director CHOOSES 1-5 shots per beat (each >= ~1.6 s of speech); merge tool rewrites beats_full.json shot counts from this
  {
    "k": "scene",
    "w": 1.0,                       // relative duration weight inside the beat (timing split)
    "plate": "paris_dusk",          // plate id; if new, add to needed_plates (below)
    "cam": {"move": "push|pull|pan_l|pan_r|drift|hold", "amt": 0.08},   // amt = zoom delta or pan fraction
    "actors": [{
      "sprite": "lustig_3",         // id from cast_catalog.json, chosen by pose meaning
      "x": 520, "y": 900, "h": 640, // y/h default FEET/H
      "flip": false,
      "enter": {"how": "walk|slide|pop|none", "from": -300, "at": 0, "dur": 18},  // from = x offset; frames
      "move":  {"to": 760, "at": 20, "dur": 40},     // optional second move (walk across)
      "bob": 0
    }],
    "props": [{"kind": "suitcase|banknotes|door|newspaper|tower|coin|papers|telegram|handcuffs|ship|keys", "x": 1200, "y": 700, "k": 1, "at": 12, "anim": "pop|slide_up|drop|none"}],
    "fx": ["dust", "flash", "shake"],       // optional
    "chip": "PARIS 1925", "caption": null,   // optional HUD, use for place/date changes only
    "why": "one line: how pose/camera serves the sentence"   // reviewer reads this
  },
  {"k": "title", "lines": ["Twice."], "accent": "x", "icon": "tower|flame|coin|null", "w": 1.0},
  {"k": "compare", "head": "...", "left": "...", "right": "..."},
  {"k": "label", "title": "...", "a": "...", "b": "..."}
]}
```

Rules for directors
- Read the beat text; every scene shot's `why` must tie pose + camera to a phrase in the sentence.
- No two consecutive scene shots with the same plate+pose+camera. Vary x side, flip, push vs pan.
- Never cycle poses mechanically; pick by meaning (pointing, shrugging, holding case, shocked...).
- Title/compare/label cards only for punchlines, numbers and contrasts; at most 1 per 3 shots. Peak lines get a scene with a prop.
- Hook (b1-b3) and each act's last beat get the richest staging (enter + move + prop + camera).
- A plate not in `plate_catalog.json` goes in the file's top-level `"needed_plates": [{"id","desc"}]`.
- Only use sprite ids and prop kinds that exist in the catalogs; if a needed pose is missing, add to `"needed_poses"`.
