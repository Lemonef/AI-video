---json
{"id": "ink-ep02-meter", "type": "normal", "risk": "medium", "repo": "D:/AI-video", "gates": ["python tools/tsc_in_worktree.py", "node --test tests/ink/ep02-meter.test.mjs tests/ink/v11b-chip.test.mjs tests/ink/v11b.test.mjs"], "protected": ["tests/**", "docs/**", "videos/**", "public/**", "package.json", "package-lock.json", "tsconfig.json", "engine/ink/parts/shots/**", "engine/ink/parts/shots_v*/**", "engine/ink/parts/shots_ep02min1/**", "tools/ink/make_v10_shots.py", "tools/ink/make_v11b_shots.py", "engine/ink/parts/cards.tsx", "engine/ink/parts/icons.tsx", "engine/ink/parts/elements.tsx", "engine/ink/Root.tsx", "engine/ink/ink/**", "engine/ink/rig/**"], "context_files": ["tests/ink/ep02-meter.test.mjs", "engine/ink/parts/schema.ts", "engine/ink/parts/doodle.tsx", "engine/ink/compositions/InkParts.tsx", "engine/ink/compositions/InkProof.tsx", "tools/ink/make_ep02_min1_shots.py", "engine/ink/rig/tokens.mjs"]}
---
# Goal
ep02 ("Blackbeard's last night") needs a HUD survival-odds meter: a small hand-drawn bar in the top-right
corner reading e.g. "YOUR ODDS 35%", which eases to a new value when a shot changes it (odds drop as the
threat grows). Build the engine side only: a pure math module, the schema field, the drawn component, the
render hook, and a pass-through kwarg in the ep02 shot generator. No shot sets a value yet (the planner
sets the values after this merges). The protected contract is `tests/ink/ep02-meter.test.mjs`; read it
first, it must pass unchanged. Shots without a meter must render exactly as today.

# Files
- `engine/ink/parts/meter.mjs` (new)
- `engine/ink/parts/schema.ts`
- `engine/ink/parts/doodle.tsx`
- `engine/ink/compositions/InkParts.tsx`
- `tools/ink/make_ep02_min1_shots.py`

# Steps
1. `engine/ink/parts/meter.mjs` (plain ES module, JSDoc types, same style as `engine/ink/rig/tokens.mjs`):
   - `export const METER_MAX = 100;`
   - `export const METER_DANGER = 25;` (at or below this the bar inks red)
   - `export const METER_TWEEN = 18;` with a comment: 0.6 s at the 30 fps composition rate (`FPS` in
     `InkProof.tsx`); change together.
   - `export const meterAt = (meter, frame) => number`: `meter` is `{value, from?}`. Progress
     `t = clamp(frame / METER_TWEEN, 0, 1)` eased with cubic in-out; result
     `from + (value - from) * eased`, where a missing `from` means `from = value`. Clamp both the inputs
     and the result to `0..METER_MAX`. Negative frames behave like frame 0. At `frame >= METER_TWEEN` the
     result is exactly `value` (clamped).
   - `export const meterTone = (v) => v <= METER_DANGER ? 'red' : 'ink';`
2. `schema.ts`: add `meter?: {label: string; value: number; from?: number}` to the `Shot` type next to
   `chipPos`. Write it exactly in that shape (the test matches it).
3. `doodle.tsx`: add `export const DoodleMeter: React.FC<{label: string; value: number; font: string;
   ink: string; paper: string; red: string}>`. It mirrors `DoodleChip` on the right side:
   - `position: absolute`, `top: CHIP_INSET`, `right: CHIP_INSET + 8` (reuse the existing `CHIP_INSET`
     constant, do not add a new literal), `transform: rotate(-CHIP_TILT deg)` (mirror of the chip tilt).
   - Paper box, `border: LINE * 0.8 px solid ink`, `borderRadius: HAND_RADIUS`, padding `8px 22px`,
     hand font, weight 700, uppercase, letterSpacing 2.
   - Row 1: the label at fontSize 30.
   - Row 2 (flex, gap 16, centred vertically): a bar track 360 x 34 px with an ink border of
     `LINE * 0.6` px and `HAND_RADIUS` corners, `overflow: hidden`, paper inside; the fill is a block of
     width `${value}%` of the track (value is already the eased number, 0-100), coloured `red` when
     `meterTone(value) === 'red'` else `ink`. After the bar, the number as `${Math.round(value)}%` at
     fontSize 44, coloured the same way.
   - Import `meterTone` with `import {meterTone} from './meter.mjs';`.
   - One-line comment above it, like the chip's: what it is, where it sits, that the caller boils it.
4. `InkParts.tsx`:
   - Import `DoodleMeter` from `../parts/doodle`, `meterAt` from `../parts/meter.mjs`, and `RED` from
     `./InkProof` (it is already exported there).
   - Add `const BoiledMeter: React.FC<{meter: NonNullable<Shot['meter']>}>` beside `BoiledChip`: it reads
     `useCurrentFrame()` (shot-local inside the Sequence), computes `meterAt(meter, frame)`, and returns
     `<AbsoluteFill style={{filter: useBoil()}}><DoodleMeter label={meter.label} value={...} font={FONT}
     ink={INK} paper={PAPER} red={RED}/></AbsoluteFill>`.
   - In `ShotPlayer`'s return, render `{shot.meter && <BoiledMeter meter={shot.meter}/>}` after the
     Watermark and before the chip. No slide-in or fade: consecutive shots that carry a meter must not
     blink at the cut.
5. `make_ep02_min1_shots.py`: `S()` gains `meter=None` and stores it in the returned dict like `chip`;
   the shot-assembly loop copies it into the JSON only when not None (add `'meter'` to the
   `('cam', 'chip', 'chipAt', 'chipPos')` tuple). If a meter is set, validate it: `label` is a non-empty
   string and `value` (and `from` when present) lies in 0..100, else append an error like the chip check.
   Run `python tools/ink/make_ep02_min1_shots.py`; it must exit 0 and the generated JSON must not change
   (no shot sets a meter yet). Do not commit the generated JSON.

# Done when
- Both gates pass; `tests/ink/ep02-meter.test.mjs`, `v11b-chip.test.mjs`, `v11b.test.mjs` unchanged and green.
- `python tools/ink/make_ep02_min1_shots.py` exits 0 and `git status` shows no change under
  `engine/ink/parts/shots_ep02min1/`.
- No new numeric literal for position: the meter reuses `CHIP_INSET`, `CHIP_TILT`, `LINE`, `HAND_RADIUS`.
- Shots without `meter` render byte-for-byte the same React tree as before (meter block is conditional).
- Work only inside the repo; touch only the files listed above.
