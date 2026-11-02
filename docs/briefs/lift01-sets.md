---json
{"id": "lift01-sets", "type": "creative", "risk": "low", "repo": "D:/AI-video", "gates": ["python scripts/tsc_in_worktree.py"], "protected": ["scripts/**", "out/**", "public/**", "package.json", "package-lock.json", "episodes/**", "docs/**", "src/compositions/**", "src/v2/**", "src/types.ts", "tsconfig.json"], "context_files": ["episodes/lift01.json", "src/v7/FloodEscape.tsx", "src/v7/FloodFinale.tsx", "src/v7/Store.tsx", "src/v7/light.tsx", "src/v2/cast.ts", "src/v5/Forest.tsx"]}
---
# Goal
Build the ten background sets for episode `episodes/lift01.json`. This is an original Thai rom-com, "Stuck in a lift with my ex", in the same flat-vector v7 look as the flood sets. Each scene's `bg` id is one `React.FC<EnvProps>` that draws the set AND its actors, with acting driven by `progress` (0..1 across the narration line). The scene JSON has `cast: []` because the actors live inside the set, exactly like `FloodStall` in `src/v7/FloodFinale.tsx`.

The frame is 1080x1920 portrait. Captions occupy roughly y 1350–1700, so keep faces and key props above y 1300.

# Files
- NEW `src/v7/Lift.tsx`: all ten sets plus shared pieces.
- `src/v5/Forest.tsx`: import them and register in the `ENV5` map (one new line, same style as the flood line).
- `src/v7/light.tsx`: add a `CAST_LIGHT` entry for each new bg id, the same shape as the flood entries. Interior lift is a cool white top light (rim `rgba(220,235,255,.5)`). Lift with lights out is red-tinted (low brightness, rim `rgba(255,70,60,.45)`). Lobby is warm (rim `rgba(255,205,140,.45)`).
- Change nothing else.

Reuse `Actor`, `phase`, `mix` and `label` from `./FloodEscape` (they are exported). Use `Darkness`/`Glow`/`Shaft`/`ContactShadow` from `./light`.

# Characters (looks already in CAST2)
- `jaab` (lead, default Actor).
- `fon`: his ex. Long hair, cream office blouse, carrying a phone.
- `liftGuard`: night security guard.
- `cleaner`, `cleaner2`: the two lobby cleaners.

Poses: idle, wave, shock, yawn, armsCrossed, point, think, hold. Expressions: smile, sleepy, shock, sweat, flat, angry, gross, talk.

# Shared pieces
- **LiftInterior:** one-point perspective box.
  - Brushed-steel side walls in vertical panels.
  - Back wall with a mirror strip.
  - Handrail on the side walls.
  - Ceiling light panel as the motivated practical light source.
  - Above the (camera-side, implied) doors, a floor display reading a number passed as a prop.
  - Speckled dark floor.
  - Prop `lit` (0..1): 1 = ceiling panel on; 0 = power out, where only the red emergency light and the display's dim glow remain.
- **Panel:** the button panel on the right wall. Floor buttons in two columns (G–20), a red EMERGENCY bell button, a small intercom speaker grille, and a small round red indicator LED. The LED is the story's secret: it is the intercom stuck ON, so it must always stay visibly lit.
- **Lobby:** night office lobby.
  - Polished floor with long warm reflections.
  - Tall dark glass windows with a few distant city lights.
  - A security counter centre-right, with a desk lamp as the warm practical.
  - On the counter: a small intercom speaker box whose grille glows and pulses with `Math.sin(frame*.5)` to show it is broadcasting.
  - Lift doors at the back left, closed, with a display reading "13".
  - A mop bucket.

# Lighting rules (measured lessons, follow them)
1. Paint the set in its lit colours, then darken with `Darkness` everywhere the practical lights do not reach. Darkness goes BEFORE the actors are drawn, so actors are lit by their local light and not crushed by a global overlay.
2. Every light has a visible source: the ceiling panel, the red LED, the desk lamp, the intercom grille. No unexplained glow.
3. Local, not global: in power-out shots the faces read only from the red LED side (a soft red `Glow` near the panel). Keep faces readable, never pure black.

# The ten sets (match the narration beats; p = progress)
1. **`liftJolt`:** LiftInterior, display 13, lit flickers (on, then at p<.15 a hard flicker using a frame-based on/off pattern, then settles dim .6).
   - Jaab in the left corner, Fon in the right corner, both scale ~.62, feet near y 1250.
   - Both `shock` pose/expr at p<.5, then Jaab turns his head toward Fon (turn .6) with expr `sweat`.
   - Small camera-independent shake on the whole set for the first 10 frames (translate by a decaying sine).
2. **`liftDoors`:** Jaab's view from inside, looking out through the open doors at the dark 13th-floor corridor (an exit sign glows green far away).
   - Two steel doors slide closed with `mix` over p .35→.75.
   - At p>.75 a hand and sleeve (cream, fon's colours) push in between the doors and the doors bounce back open a little.
   - Jaab at the left, front, scale ~.8, `idle` then `shock` at p>.75.
3. **`liftRecognize`:** two-shot close inside the lift, lit 1.
   - Fon steps in at the right (x 720→700, `idle`, expr `flat`, turn -.5 toward Jaab).
   - Jaab at the left (x 360), expr `shock`, then `sweat` at p>.4.
   - Both scale ~.95, faces around y 700–800.
4. **`liftAwkward`:** wide, lit 1 until p .72, then 0 (hard cut, no fade).
   - Jaab pressed into the far-left corner, Fon in the far-right corner, both looking UP at the floor display (turn 0).
   - Jaab `armsCrossed`, Fon `hold` (phone).
   - The display is big and readable near the top (y ~420, number 13).
   - Leave clear empty space between them; the gap is the joke.
5. **`liftPanel`:** insert close-up of the Panel, filling the frame.
   - Jaab's hand (skin colour, simple rounded shape plus hoodie cuff) jabs the EMERGENCY button repeatedly at p<.5 (4 presses, driven by `frame`).
   - The red LED glows steadily throughout, with a soft `Glow` around it.
   - Lights out (lit 0). The scene is lit by the LED and a faint cool spill from the button backlights.
6. **`lobbyGuard`:** Lobby wide.
   - liftGuard sits behind the counter, `sleepy`/`yawn` at p<.4.
   - At p>.4 the intercom grille lights up and the guard sits upright with `shock`, turn toward the speaker.
   - Draw 3 small sound-wave arcs coming out of the speaker after p .4.
7. **`liftBicker`:** inside, lights out (lit 0), red LED glow only, faces lit from the panel side. Medium two-shot.
   - Fon at the right holds up her phone; the screen glows and shows a red battery bar with "3%" in large readable text. Fon `point` toward Jaab with expr `angry` at p>.55.
   - Jaab at the left, `armsCrossed`, expr `flat` at p<.55, then `shock` at p>.55.
8. **`lobbyCrowd`:** Lobby, closer on the counter.
   - cleaner and cleaner2 lean their mops on the bucket (p<.3) and walk to stand beside the speaker (x mix over p .2→.55).
   - liftGuard carries a plastic chair to them at p>.6 and sets it down.
   - All three lean toward the speaker (turn toward it) with `smile`/`talk`. The pulsing speaker grille stays central.
9. **`liftQuestion`:** inside, lights out, red LED. Closer two-shot.
   - Fon (right) looks down, then turns to Jaab (turn -.6), expr `flat`, `idle`.
   - Jaab (left) freezes `shock` → `sweat`. A single bead of sweat drop is fine.
   - Keep extra headroom; the camera pushes in on Jaab.
10. **`liftPressure`:** endcard background (static, p=1).
    - Lights-out lift interior on the top half, with Jaab and Fon silhouetted and lit red.
    - A rounded inset in the lower-right third (~380x300) showing the lobby speaker, the guard and both cleaners leaning in, warm.
    - Keep the centre band y 700–1500 calm, because the A/B cards sit on top of it.

# Style
- Compact one-line JSX like `FloodFinale.tsx` is fine. Comment the why, not the what.
- No new dependencies, and no text other than the floor numbers, button labels, "3%" and the EXIT sign.
- Every gradient/filter/mask id must be unique per set; prefix with `lift-<bg>-`.

# Done when
The gate `python scripts/tsc_in_worktree.py` exits 0. Do NOT try to render; the sandbox cannot run a browser. Visual review happens outside. If an API you need does not exist (e.g. a prop on `Actor`), STOP and report rather than editing protected files.
