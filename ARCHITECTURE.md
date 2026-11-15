# ARCHITECTURE

One file that says where everything goes. `tests/test_architecture.py` fails if the tree drifts from it.

## Folders

| Dir | Owner / purpose | Rule |
|---|---|---|
| `engine/` | Remotion code: `compositions/`, `components/`, `lib/`, `registry/`, `characters/<name>/`, `legacy/` (old per-version engines); `jaab3d/` (separate 3D-shorts entry); `ink/` (separate hand-drawn Ink history entry, assets in `videos/pastly-life/01-eiffel-ink/assets` via `--public-dir`); `shared/` (assets every render gets: fonts, sfx, reference-study) | code is shared; no per-version or per-style folder at the top of `engine/` (a second Remotion entry is listed in `render_entries`); `shared/` is assets, so any file type |
| `tools/` | `make.py`, `pipeline/`, `episode/` (per-episode one-offs), `spikes/` | python only; max 4 levels (package dirs like pipeline/tts) |
| `videos/` | `<channel>/<id>/`: `script/` (`<id>.json`, `docs/<id>/`), `assets/<id>/` (voices, images, `3d/`), `final/` and `draft/` (gitignored outputs); `<channel>/_shared/` for channel assets | one folder per video; `unsorted/` until a channel is chosen |
| `docs/` | guides flat; `briefs/`, `agent-logs/`, `reference/`, `TODO.md` | max 3 levels |
| `tests/` | pytest + node tests, flat | one place |
| `_archive/` | retired data kept for the record (e.g. `episodes/` drafts) | frozen; nothing reads it |

## Practices
- One place per thing. A new top-level dir needs a row above AND an entry in `tests/architecture.json`.
- Outputs only in the video's `final/` (what gets posted) or `draft/`; intermediates in the hidden `.build/`. Never commit renders. `draft/` root holds folders only: `draft/current/` = the one current full-res cut; `draft/versions/` = superseded cuts; `draft/previews/` = compressed copies made to send/watch (a preview is not a version). Stills, render logs and scratch audio go to `.build/<channel>-<video>/` (`stills/`, `logs/`). No top-level `out/`: it was emptied 2026-11-16 (old previews -> `draft/previews/`, the one kept wav -> `.build/pastly-life-01-eiffel-ink/legacy-out/`).
- Data, assets and outputs for an episode live in `videos/<channel>/<video>/script/<id>.json`, `videos/<channel>/<video>/assets/<id>/`, `videos/<channel>/<video>/final/`; docs in `videos/<channel>/<video>/script/docs/<id>/`; one-off scripts in `tools/episode/`.
- Remotion reads one public dir per render: `tools/pipeline/stage.py` hardlinks `engine/shared/`, the channel `_shared/` and the video's `assets/` into `.build/<channel>-<video>/public/` and checks every `staticFile()` path first. Never edit a staged file (it is a hardlink to the original).
- Delete rejected experiments after logging why in `docs/`.
- Pipeline briefs list `ARCHITECTURE.md` in `context_files`.

## Where does X go
| X | Goes in |
|---|---|
| new episode data | `videos/<channel>/<video>/script/<id>.json` |
| episode beat sheet / review | `videos/<channel>/<video>/script/docs/<id>/` |
| one-off episode script | `tools/episode/` |
| shared tool | `tools/` |
| episode voice, image, 3D asset | `videos/<channel>/<video>/assets/<id>/` |
| asset every render uses (font, sfx) | `engine/shared/` |
| retired data | `_archive/` |
| new character | `engine/characters/<name>/` |
| brief for the pipeline | `docs/briefs/` |
