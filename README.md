# AI-video — "จะเกิดอะไรขึ้นถ้า…" series pipeline

Data-driven pipeline for a Thai TikTok "What If" series: flat-2D characters drawn in code, Thai TTS narration with word-synced captions, a freeze-and-choose ending, rendered to a 1080×1920 / 30 fps MP4 with Remotion. No AI video model and no posting: the output is reviewed and posted manually.

## Make the next episode (one command)

```bash
cp episodes/ep01.json episodes/ep02.json   # then edit the scenes (ep01 = current template)
.venv/Scripts/python scripts/make.py ep02   # -> out/final/ep02.mp4
```

`make.py` voices the episode (cached: an unchanged script is never re-voiced), builds word-timed captions, generates sound effects, renders with Remotion, and masters loudness to −14 LUFS. New episode = new data file, no new code.

| Flag | Effect |
|---|---|
| `--voice Algieba` | another voice instead of the episode's |
| `--force` | re-voice (spends a Gemini request) |
| `--no-render` | voice + captions only (fast check) |
| `--engine edge` | TTS engine: `gemini` (default for v2) or `edge` (free, choppier) |

Check what the voice actually said: `.venv/Scripts/python scripts/transcribe.py out/ep03.mp4`.

Preview while editing: `npm run studio` (opens ep01 with estimated timing).

## Folder layout

```
episodes/        one JSON per episode (ep01 = v1, the current release)   archive/ = drafts
src/             Remotion code: compositions/, components/, v2/ (rig, forest, ui, sound), v5/ (forest art), lib/ (pure logic)
scripts/         make.py (one command) + pipeline/ (tts, align, captions, foley, freesound, render, master)
public/          generated: voice takes per episode, sfx/ (synthetic + real/ CC0 recordings)
out/final/       what gets posted: epNN.mp4, epNN-cover.png, epNN.post.txt
out/avatar/      profile picture (jaab-1080.jpg)
out/voices/      voice samples (Iapetus = the series voice)
out/drafts/      earlier experiments (not for posting)
.build/          intermediates: raw renders, props, logs (hidden, safe to delete)
docs/            TODO, cinematic-guide (the rules every episode follows), references
```

**Current release: v1** (git tag `v1`): Jaab in the night forest, the Gemini Iapetus one-take voice, real CC0 sound, the cinematic-guide pacing, and the layout guard. Everything earlier is a draft (tags `draft-1` to `draft-3`, videos in `out/drafts/`). In code, the style switch for v1 is `"style": "v6"` (an internal name left over from the drafts).

## First-time setup

```bash
npm install
python -m venv .venv && .venv/Scripts/pip install edge-tts faster-whisper pytest   # macOS/Linux: .venv/bin/pip
```

Requires Node 18+, Python 3.11+, ffmpeg on PATH. Run `make.py` with the venv's Python (`.venv/Scripts/python scripts/make.py ep02`). Tests: `.venv/Scripts/python -m pytest tests` and `npx tsc --noEmit`.

## Where to look

| Question | Go to |
|---|---|
| What fields does an episode have? | `src/types.ts` (`Scene`, `CastMember`, `BubbleItem`) |
| Which characters exist / add one | `src/registry/cast.ts` |
| Which backgrounds and props exist / add one | `src/registry/backgrounds.tsx`, `src/registry/props.tsx` |
| Colours, safe zones, layout tokens | `src/lib/tokens.ts` |
| How a scene is assembled | `src/compositions/Scene/index.tsx` |
| How captions are timed | `scripts/pipeline/captions.py` (tested in `tests/`) |
| Add a TTS engine (Google, F5-TTS-THAI…) | `scripts/pipeline/tts/__init__.py` + one new engine file |
| Ideas mined from references | `docs/references.md` |
| Open work | `docs/TODO.md` |

## Styles

- **v1** (git tag `v1`, ep01): bright pastel flat 2D, Mochi in office clothes.
- **v2** (ep02 onward, `"style": "v2"`): cinematic night-forest flat 2D, with parallax trees, fog, moonlight and a torch beam, plus grain and vignette, the new Mochi rig, a time/place chip (`chip`), a character intro card (`intro`), a rules card that becomes a corner HUD and strikes rules as they break (`rules`, `rulesView`, `breaks`), and `*highlighted*` caption words. Camera: always a light handheld drift; `shake` = constant tremble for a scene; `hits: [{"at": 0.9, "strength": 30}]` = a sharp jolt on a scare beat. Environments: `forestEdge`, `forestPath`, `dark`.

Keep the series identity fixed across episodes (Mochi, the voice, captions, the rules HUD and the end card); change only the setting and the story.

## Writing an episode

Each scene: a background (`bedroom`, `bts`, `office`, `closeup`, `card`), a narration line, and optionally cast, props, bubbles, camera.

- `say` = what the voice reads. **Spell numbers as Thai words** (`เจ็ดโมงเช้า`, not `7 โมงเช้า`).
- `tone` = delivery for that line (Gemini), e.g. `"whispers"`, `"slow, tense"`. Episode `tempo` (e.g. `1.15`) speeds up the whole take without a new voice request.
- `caption` = what is shown on screen (digits, quotes and "…" are fine here). Defaults to `say`.
- Timing is relative to the line: `at: 0.5` = halfway through the narration; `at > 1` lands in the pause after it (`padAfter` seconds).
- Cast `keys` switch pose / expression / gaze / facing / action at a given `at`. Actions: `idle`, `walk` (with `toX`), `wobble`, `bounce`, `shake`.
- `type: "freeze"` + `countdown: 3` = desaturated 3-2-1 with ticks. `type: "endcard"` + `a` / `b` / `prompt` / `footer` = the A/B comment card.

## The cast

**Mochi (โมจิ)** is the series lead: a 24-year-old Bangkok office worker and chronic overthinker. Mint-teal shirt, staff lanyard, and a single hair curl that springs up and jitters when Mochi panics. Every scenario happens to Mochi. Supporting cast: `auntie`, `uncle`, `boss`, `girl`, `student`, `office`.

## Voice

Series voice: **Gemini TTS `Iapetus`** (male; backup `Algieba`). The whole episode is voiced in **one request**, so pacing and tone flow like a real narrator. Whisper then finds each line in the take (fuzzy letter alignment, snapped to the real pause), and the take is cut per scene. Key: `GEMINI_API_KEY` or `~/.secrets/gemini_api_key`. The free tier allows 10 requests/day per model, and the engine falls back across models automatically. The paid rate works out to about $0.02 per episode.

Fallback: edge-tts (`--engine edge`, free Microsoft voices, per line). It sounds choppier and uses an unofficial endpoint.

## Licences

Remotion is free for individuals and companies of up to 3 people (remotion.dev/license). Fonts: Kanit and Mali (SIL OFL) via `@remotion/google-fonts`. Sound effects are generated procedurally by `scripts/pipeline/sfx.py`.
