# AI-video — "จะเกิดอะไรขึ้นถ้า…" series pipeline

Data-driven pipeline for a Thai TikTok "What If" series: flat-2D characters drawn in code, Thai TTS narration with word-synced captions, a freeze-and-choose ending, rendered to a 1080×1920 / 30 fps MP4 with Remotion. No AI video model and no posting: the output is reviewed and posted manually.

## Make the next episode (one command)

```bash
cp episodes/ep01.json episodes/ep02.json   # then edit the scenes
python scripts/make.py ep02                 # -> out/ep02.mp4
```

`make.py` voices each line (cached: only changed lines are re-voiced), builds word-timed captions, generates sound effects, renders with Remotion, and masters loudness to −14 LUFS. New episode = new data file, no new code.

| Flag | Effect |
|---|---|
| `--voice th-TH-NiwatNeural` | male voice instead of the episode's voice |
| `--force` | re-voice every line |
| `--no-render` | voice + captions only (fast check) |
| `--engine edge` | TTS engine (see `scripts/pipeline/tts/`) |

Preview while editing: `npm run studio` (uses ep01 with estimated timing, no audio until `make.py` has run).

## First-time setup

```bash
npm install
python -m venv .venv && .venv/Scripts/pip install edge-tts pytest   # macOS/Linux: .venv/bin/pip
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

## Writing an episode

Each scene: a background (`bedroom`, `bts`, `office`, `closeup`, `card`), a narration line, and optionally cast, props, bubbles, camera.

- `say` = what the voice reads. **Spell numbers as Thai words** (`เจ็ดโมงเช้า`, not `7 โมงเช้า`): the free Thai voice cannot read digits and `make.py` rejects them.
- `caption` = what is shown on screen (digits, quotes and "…" are fine here). Defaults to `say`.
- Timing is relative to the line: `at: 0.5` = halfway through the narration; `at > 1` lands in the pause after it (`padAfter` seconds).
- Cast `keys` switch pose / expression / gaze / facing / action at a given `at`. Actions: `idle`, `walk` (with `toX`), `wobble`, `bounce`, `shake`.
- `type: "freeze"` + `countdown: 3` = desaturated 3-2-1 with ticks. `type: "endcard"` + `a` / `b` / `prompt` / `footer` = the A/B comment card.

## The cast

**Mochi (โมจิ)** is the series lead: a 24-year-old Bangkok office worker and chronic overthinker. Mint-teal shirt, staff lanyard, and a single hair curl that springs up and jitters when Mochi panics. Every scenario happens to Mochi. Supporting cast: `auntie`, `uncle`, `boss`, `girl`, `student`, `office`.

## Voice

Default: **edge-tts `th-TH-PremwadeeNeural`** (free Microsoft neural voice, returns word timings). The endpoint is unofficial and randomly fails, so every line retries with backoff. It is a grey area for a monetised channel. Paid upgrade path: Google Chirp 3 HD (1M characters/month free, then about $30 per 1M). Local open models: F5-TTS-THAI, ThonburianTTS, VachanaTTS. Each is one engine file away.

## Licences

Remotion is free for individuals and companies of up to 3 people (remotion.dev/license). Fonts: Kanit and Mali (SIL OFL) via `@remotion/google-fonts`. Sound effects are generated procedurally by `scripts/pipeline/sfx.py`.
