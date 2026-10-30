# Private visual reference study: DegJCmXtbGj

Source: https://www.instagram.com/p/DegJCmXtbGj/ (StickItOutStories), downloaded for local analysis. Source container duration 93.319546 s; picture stream 2799 frames / 93.300 s, 1080 x 1920, 30 fps. The visual timeline has 35 measured hard-cut groups. Original media and analytical frames stay in ignored `out/drafts/reference-study/DegJCmXtbGj/`.

## Initial implementation scope (owner rejected as insufficient)

Reconstruct framing, cut timing, subject placement, depth, light changes, insert logic and physical action as closely as practical in an isolated code-drawn study. This is private practice, never a post or a new story release. The reference's footage, voice, music and full written narration are not embedded in the export. The result is a silent visual study with small technical shot labels, not a pixel-identical or audio-identical duplicate.

## Files and validation

- `src/compositions/ReferenceStudy/shots.ts`: measured frame boundaries; single timeline source.
- `src/compositions/ReferenceStudy/Stages.tsx`: original vector sets, props and a generic practice cashier.
- `src/compositions/ReferenceStudy/index.tsx`: camera, light and staging orchestration.
- `src/Root.tsx`: additional `ReferenceStudy` composition only; existing Episode stays unchanged.
- Render: `npx remotion render src/index.ts ReferenceStudy out/drafts/reference-study/DegJCmXtbGj/practice.mp4 --crf=18`.
- Verify timeline continuity, render the full composition, inspect each shot and selected movement sequences, and verify the approved EP3 final's SHA-256 stays unchanged.

Story upgrades and a new publishable episode follow this exercise. This task does not replace the approved Jaab identity or change EP1-3.

## Render and review result (2026-10-30)

Output: `out/drafts/reference-study/DegJCmXtbGj/practice.mp4`, 1080 x 1920 (9:16), 30 fps, 2799 frames / 93.3 seconds. Silent, approximately 23.7 MB. Inspected all 35 final shot samples against the reference in `final-comparison-1.jpg` through `final-comparison-5.jpg`; inspected 20 additional temporal samples in `button-action.jpg`, `shutter-action.jpg` and `chain-action.jpg`. Button contact, chain-hand attachment and shutter progression are visible.

Validation: 28 Python tests, 3 Node tests (gait and study timeline), and TypeScript passed. Approved EP3 final SHA-256 remains `c176f122392eb23ffbc925f05fff1a3351f40c819f6e7b0ec152e26ac249e5ee`.

**Remaining fidelity gaps:** this is a first visual reconstruction, not completion of Zen's literal 1:1 request. Cut boundaries and picture duration match; sets, perspective, cashier proportions, background density and micro-acting are simplified approximations. Technical labels replace narrative captions; the clock uses 24-hour format; the ending is a private study card. Voice, music and sound are absent, so audio sync has not been evaluated. Owner visual review and further fidelity work remain pending before story upgrades. Source transcription was unavailable because Windows Application Control blocked a dependency; no policy bypass attempted.

## Measured shot groups

| Shot | Start frame | End frame (exclusive) | Stage | Study label |
|---|---:|---:|---|---|
| 1 | 0 | 59 | exterior | Exterior wide |
| 2 | 59 | 111 | exterior | Push toward store |
| 3 | 111 | 173 | aisle | Aisle depth |
| 4 | 173 | 228 | counter | Counter medium |
| 5 | 228 | 279 | counter | Face reaction |
| 6 | 279 | 314 | radio | Counter prop insert |
| 7 | 314 | 330 | counter | Alert reaction close |
| 8 | 330 | 450 | phone | Phone insert to city view |
| 9 | 450 | 537 | counter | Calm warning reaction |
| 10 | 537 | 596 | door | Move toward entrance |
| 11 | 596 | 674 | parking | Through-glass point of view |
| 12 | 674 | 746 | parking | Threats in parking lot |
| 13 | 746 | 789 | door | Full-body hesitation |
| 14 | 789 | 852 | door | Prop-led decision beat |
| 15 | 852 | 971 | door | Close warning reaction |
| 16 | 971 | 1035 | map | Overhead parking view |
| 17 | 1035 | 1421 | map | Overhead spatial explanation |
| 18 | 1421 | 1479 | exterior | Return outside with timer |
| 19 | 1479 | 1526 | aisle | Bright interior contrast |
| 20 | 1526 | 1565 | parking | Return to the threats |
| 21 | 1565 | 1605 | control | Hand presses control |
| 22 | 1605 | 1692 | door | Shutter begins to fall |
| 23 | 1692 | 1799 | mechanism | Explain the mechanism |
| 24 | 1799 | 1886 | chain | Manual action and counter |
| 25 | 1886 | 1962 | gap | Low insert under shutter |
| 26 | 1962 | 2002 | chain | Last movement |
| 27 | 2002 | 2037 | door | Closed barrier, full body |
| 28 | 2037 | 2151 | door | Hold on the consequence |
| 29 | 2151 | 2255 | aisle | Lights go down |
| 30 | 2255 | 2328 | dark | Darkness and information card |
| 31 | 2328 | 2424 | dark | Flashlight medium |
| 32 | 2424 | 2517 | radio | Isolate the radio |
| 33 | 2517 | 2577 | dark | Face close-up in darkness |
| 34 | 2577 | 2704 | radio | Final prop emphasis |
| 35 | 2704 | 2799 | end | Private study end card |

## Continued work after owner rejection (2026-10-30)

Zen rejected practice.mp4 as much worse than the source and explicitly requested autonomous self-review until matching, plus a reusable skill covering structure, shots, effects, sound, lighting, background and technique. The first pass is not approved. Do not stop merely to request fidelity feedback or redefine 1:1 as cut-timing coverage.

Iterations now exist beside the source:

- `practice-v2-preview.mp4`: measured vector sets/props/rig and camera rebuild; 105 synchronized samples. MAE 42.153/255; SSIM .4770 (first pass 43.738/.4876). Mixed, not acceptance.
- `practice-v3-mastered.mp4`: independent vector reconstruction at 1080x1920/93.3 s with 33 original paraphrased scratch narration clips, 75 word-timed caption chunks, 67 procedural/voice events. No omitted voice lines; rate .95-1.377 after measured silence trim. Reference measured -14.12 LUFS/-1.18 dBTP; raw scratch -22.26 LUFS/-7.36 dBTP; mastered export targets reference level. No human listening sign-off. Full 105-sample comparison MAE42.336/SSIM.4778. New changes after that render are not implicitly reviewed.
- `practice-v4-assisted-preview.mp4`: separate source-assisted background-plate experiment (counter, aisle, door, parking), own animated rig/original scratch sound. Compared and visually inspected 105 samples across all 35 groups. MAE37.003/SSIM.4921, better but far from literal match. Found wrong actor size/camera, wrong dark acting location and missing map/prop geometry.
- `practice-v5-calibrated-preview.mp4`: rendering next; seven source-assisted set plates plus measured camera tracks. Do not mark accepted before actual comparison. Latest calibration accepted252/301 samples across28 groups, median inlier residual .385 pixels on270x480 review plane. This measures background landmark registration, NOT whole-image/rig fidelity.

Source-assisted plates are explicitly derived from source stills through built-in imagegen object-removal edits. They are NOT independently authored background reproductions. Local files are ignored under `public/reference-study/`; original frames remain ignored in out/. Keep the separate `ReferenceStudy` (vector) and `ReferenceAssisted` compositions honest. No source footage or source audio is embedded as the delivered film.

Utilities: `scripts/reference_study_review.py` (three phases/shot + metrics), `calibrate_reference_camera.py` (SIFT/ratio/similarity RANSAC; low-confidence fits omitted), `build_reference_sound.py` (cached original free Edge narration and procedural foley), `build_reference_player.py` (local synchronized side-by-side, frame stepping, slow motion, source/study audio switch). `compare-v3.html` is generated. All source/reference outputs are local, not social posts.

Reusable skill canonical home: `D:/second-brain/skills/reference-animation-rebuild/`; installed copy `C:/Users/user/.codex/skills/reference-animation-rebuild/`. Skill scaffold validated; comparison helper exercised on the real film. Technique reference includes shot grammar, geometry, rig/action/contact, local light, typography, sound and failure ledger. Installation must be refreshed after further edits.

Current next corrections: finish source-assisted camera/rig review, add separate parking-map and dark-face plates (generation in progress), correct actor blocking for flashlight shot, distinguish cleaning/phone/keys/pull/torch acting, then compare every shot and dense actions again. Literal1:1 remains OPEN. Approved EP3 final must retain SHA256 c176f122392eb23ffbc925f05fff1a3351f40c819f6e7b0ec152e26ac249e5ee.

## Complete milestone/checklist record

See `docs/reference-study-milestones-DegJCmXtbGj.md` for every meaningful iteration,tools,comparisons,failures,steps and open matching checklist. Future original episode QA: `docs/episode-release-checklist.md` points to the canonical complete checklist in the skill.
