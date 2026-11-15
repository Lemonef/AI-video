---json
{"id": "ink-firstmin", "type": "creative", "risk": "high", "repo": "D:/AI-video", "gates": ["python tools/tsc_in_worktree.py"], "protected": ["tools/**", "docs/**", "videos/**", "public/**", "package.json", "package-lock.json", "tsconfig.json", "engine/ink/parts/shots/**", "engine/ink/ink/**", "engine/ink/rig/**", "engine/ink/compositions/SlideProof.tsx", "engine/ink/compositions/Test10.tsx"], "context_files": ["engine/ink/compositions/InkProof.tsx", "engine/ink/Root.tsx", "engine/ink/parts/shots/p01.json", "engine/ink/parts/shots/p02.json"], "plan_check": "docs/briefs/ink-firstmin.plan_check.md"}
---
# Goal
Build a generic, data-driven renderer that plays hand-designed per-part shot lists (JSON) in the existing Ink look, and a composition `InkFirstMin` that plays parts p01 + p02 (frames 0-1716, the first ~57 s) over the locked voice track. The shot lists are the design; the renderer must draw exactly what they say, nothing generic or random on top. Later parts (p03-p24) will only add JSON files, so every element type must be a reusable component driven by its fields.

# Files
- NEW `engine/ink/parts/schema.ts` - TypeScript types for the shot-list JSON (below).
- NEW `engine/ink/parts/elements.tsx` - one component per element type.
- NEW `engine/ink/compositions/InkParts.tsx` - background layer, shot player, the InkParts component, InkFirstMin + INK_FIRSTMIN_FRAMES.
- EDIT `engine/ink/compositions/InkProof.tsx` - ADDITIVE ONLY: add Words, Underline, Card, useIn, GREEN, RED to an export list. Change no existing code or behaviour.
- EDIT `engine/ink/Root.tsx` - register a Composition with id InkFirstMin (1920x1080, 30 fps, durationInFrames = INK_FIRSTMIN_FRAMES).
- Do not touch anything else. Work only inside the repo.

# Data contract (read p01.json and p02.json - they are the source of truth)
- Part: `{_doc?: string, part: string, f0: number, f1: number, shots: Shot[]}` (`_doc` is metadata, not rendered). Shot: `{f0, f1, bg, chip?, chipAt?, els:[El]}`. All frame numbers (`f0`, `f1`, `at`, `bracketAt`, `done`, `build`, `cut`) are ABSOLUTE timeline frames. Each shot renders inside `<Sequence from={shot.f0} durationInFrames={shot.f1 - shot.f0}>`, so inside it convert: `delay = at - shot.f0` (and the same for every other absolute frame field). Pass the shot's `f0` down (prop or React context) rather than recomputing.
- An element with no `at` is visible from the shot's first frame (delay 0).
- Canvas 1920x1080. `x,y` = CENTRE of the element unless stated. Sprite `y` = feet line (same as existing `Sprite`). Tower `y` = base line. Redact `x,y` = TOP-LEFT.
- Colour names: `orange`->ORANGE, `red`->RED, `green`->GREEN, `teal`->TEAL, absent->INK. Use the constants from InkProof.tsx; no new hex literals except where stated below.
- Unknown `t` or bg kind: throw an Error naming it (fail loudly, never silently skip).
- Asset paths are `staticFile()` paths (the render uses `--public-dir videos/pastly-life/01-eiffel-ink/assets`).
- `INK_FIRSTMIN_FRAMES` = last part's `f1` read from the JSON (1716), not a typed number.

# Background layer (`bg`)
All three kinds: wrapper `AbsoluteFill` overflow hidden; on top of everything put `Vignette` (plate/photo only), `Watermark`, and the chip.
- `{plate, zoom:[a,b], origin?}` - `Img` objectFit cover, scale interpolated a->b over the shot length (clamped), transformOrigin `origin ?? '50% 60%'`. The scaled camera container holds SIBLING layers in this order: background `Img`, then the elements (each SVG-type element in its own full-frame `<svg>`, each HTML-type element in a positioned div), then the `Dust` SVG. Elements move with the camera. Never put HTML (`Words`) or a nested `<svg>` (`Underline`) inside a parent SVG.
- `{photo, push:[a,b], origin?, pos?}` - real archive photo: `Img` objectFit cover, objectPosition `pos ?? '50% 50%'`, scale a->b over the shot, transformOrigin `origin ?? '50% 50%'`, CSS filter `sepia(0.35) contrast(1.08)`; no dust. Elements render above, NOT scaled.
- `{card:true}` - plain PAPER `AbsoluteFill`, no zoom. Do NOT wrap in the existing `Card` (it renders its own `Watermark`; the shot player adds the single common one).
- `chip` - the existing `Chip` box with a short slide-in from the left (spring, ~10 frames). Chip delay = `(chipAt ?? shot.f0) - shot.f0`, i.e. without `chipAt` it enters at shot-relative frame 0.
- Text legibility: on plate and photo shots, wrap `words` and `underline` elements in a div with a PAPER `textShadow` halo (e.g. `0 0 6px PAPER` repeated 3-4 times; text-shadow is inherited by `Words`). Not on cards.

# Elements (`els`, drawn in array order = z-order)
HTML-type (`words`, `underline` (its own small `<svg>` inside a positioned div), `stamp`, `tag`, `photo`) are absolutely positioned divs centred with `translate(-50%,-50%)`, `whiteSpace: nowrap`. SVG-type (`sprite`, `tower`, `cross`, `ticket`, `redact`, `tick`, `timeline`, `chimney`, `radio`) each render in their own full-frame `<svg width=1920 height=1080>` layer.
- `sprite {src,x,y,h,flip?,x2?,at}` - existing `Sprite`. Entry: spring pop (scale 0.9->1 about the feet, opacity 0->1). With `x2`: x moves linearly x->x2 from `at` to shot end, plus a walk bounce `-|sin(frame/4)|*10` px while moving.
- `words {text,x,y,size,color?,at}` - existing `Words` (word-pop) with delay.
- `underline {x,y,w,at}` - existing `Underline`, centred.
- `stamp {text,x,y,rot,color,at}` - rubber stamp: bordered box (border 10px, radius 12, colour = color), Arial Black 110px, same colour, opacity 0.92, rotated `rot` deg. Entry slam: scale 2.2->1 spring (damping 10) + opacity over 4 frames, plus a 6-frame 6px screen shake of the stamp only.
- `tower {x,y,h,build?:[a,b],cut?:[a,b]}` - existing `Tower` with `k = h/430` (430 = the Tower path height). `build:[a,b]`: fully clipped out before a, bottom-to-top reveal (clip rect growing from base) during [a,b], fully visible after b. `cut:[a,b]`: at a two dashed RED horizontal cut lines draw on (8 frames) at 1/3 and 2/3 of the height; the three clipped sections stay joined through b; after b animate 14 frames eased: bottom stationary, middle `translateX(30px)`, top `translateY(-60px) rotate(8deg)`, then hold the final transforms.
- `cross {x,y,size,at}` - big RED X: two strokes (width 22, round caps) drawing on 7 frames each, second starts 4 frames after the first.
- `ticket {x,y,w,text,at}` - paper ticket: rect w x 0.38w, PAPER fill, INK stroke LINE, radius 18, a dashed vertical perforation at 76% width, a semicircle notch top and bottom on that line, `text` in FONT 0.075w INK centred in the left part; rotated -3 deg; pop in.
- `tag {text,x,y,at}` - label pill: PAPER bg, INK border LINE, radius 16, FONT 56 uppercase INK, padding 10/28; pop in (spring scale 0.8->1).
- `photo {src,x,y,w,rot,frame:"polaroid",label,at}` - HTML element. Polaroid: white (#ffffff allowed) border 18px sides/top, 80px bottom with `label` in FONT 40 INK centred in it. `w` = displayed image width excluding borders; the `Img` has width w and height auto so the intrinsic aspect is kept (outer box = w+36 wide, image height+98 high); the whole outer box is centred at x,y; a translucent tape strip (PAPER, opacity 0.7, 140x40, rotated) across the top edge; soft drop shadow; rotated `rot`. Entry: from y+80 and scale 0.9 to rest via spring.
- `redact {x,y,w,h,at?}` - INK bar, slightly rough (radius 6); with `at` it wipes left->right over 8 frames; without `at` fully present from frame 0.
- `tick {x,y,at}` - GREEN check mark (stroke 20, round), about 120px, drawing on over 8 frames.
- `timeline {x1,x2,y,left,right,at,bracket,bracketAt}` - INK line x1->x2 at y drawing on over 15 frames from `at`; end ticks; `left`/`right` labels in FONT 70 below each end (fade in with the line). At `bracketAt` an ORANGE curly brace above the line spanning x1..x2 draws on (12 frames) with `bracket` text in FONT 70 ORANGE above it.
- `chimney {x,y,h,at,done}` - the Eiffel Tower turns into a black factory chimney: from `at` to `done` crossfade/squeeze a `Tower` (k=h/430) into a tall tapered INK chimney (base width ~0.16h, top ~0.11h, a rim at the top, faint PAPER brick lines); from `done` grey (#6b6b70 allowed) smoke puffs rise from the rim in a continuous loop (circles growing + fading, ~4 alive at once). Before `at` show the plain tower.
- `radio {x,y,at}` - radio waves from point x,y: 3 ORANGE arcs (stroke 10) on each side, pulsing outward on a 30-frame loop, staggered 10 frames; starts at `at`.

# Composition
`InkParts: React.FC<{parts: Part[]}>` renders every shot of every part as above on a PAPER `AbsoluteFill`. `InkFirstMin` = `<InkParts parts={[p01, p02]} />` plus `<Audio src={staticFile('ink60full/master.wav')} />`. Import the JSON with `import p01 from '../parts/shots/p01.json'` (resolveJsonModule is on). JSON imports widen string literals (`t`, `frame`) to `string` and tuples (`zoom`, `push`, `build`, `cut`) to `number[]`, so `const x: Part = p01` and `satisfies Part` fail: use an explicit boundary cast `const part01 = p01 as unknown as Part;` (no `any`). Hard cuts between shots (the shot lists are cut on the voice).

# Steps
1. Read InkProof.tsx fully and both JSON files.
2. Write schema.ts, elements.tsx, InkParts.tsx; add the additive export line to InkProof.tsx; register the composition in Root.tsx (keep the existing one-line JSX style).
3. Run `npx tsc --noEmit` and fix all errors in your files.

# Done when
- The gate `python tools/tsc_in_worktree.py` exits 0.
- Every element type and bg kind used in p01.json and p02.json has a component; none is skipped or stubbed; no `any` in schema.ts.
- InkProof.tsx diff is the single additive export line; existing compositions unchanged.
- No new npm dependencies. No files changed outside the list above.
