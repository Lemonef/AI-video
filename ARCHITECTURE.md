# ARCHITECTURE

One file that says where everything goes. `tests/test_architecture.py` fails if the tree drifts from it.

## Folders

| Dir | Owner / purpose | Rule |
|---|---|---|
| `engine/` | Remotion code: `compositions/`, `components/`, `lib/`, `registry/`, `characters/<name>/` | code is shared; no per-version or per-style folder at the top of `engine/` (characters go under `characters/<name>/`) |
| `episodes/` | one `<id>.json` per episode, `archive/` for retired drafts | data only |
| `public/` | Remotion static assets, one subdir per episode id + `shared/` | `staticFile()` resolves only here; ignored assets move via a script that writes a manifest |
| `tools/` | `make.py`, `pipeline/`, `episode/` (per-episode one-offs), `spikes/` | python only; max 4 levels (package dirs like pipeline/tts) |
| `tests/` | pytest + node tests, flat | one place |
| `docs/` | guides flat; `briefs/`, `agent-logs/`, `episodes/<id>/`, `reference/`, `TODO.md` | flat except `docs/episodes/<id>/` (the only 4-deep area) |
| `out/` | renders and logs, gitignored | `final/ drafts/ stills/ voices/ qa/ logs/` only |

## Practices
- One place per thing. A new top-level dir needs a row above AND an entry in `tests/architecture.json`.
- Outputs only in `out/`. Never commit renders.
- Data, assets and outputs for an episode live in `episodes/<id>.json`, `public/<id>/`, `out/final/<id>/`; docs in `docs/episodes/<id>/`; one-off scripts in `tools/episode/`.
- Delete rejected experiments after logging why in `docs/`.
- Pipeline briefs list `ARCHITECTURE.md` in `context_files`.

## Where does X go
| X | Goes in |
|---|---|
| new episode data | `episodes/<id>.json` |
| episode beat sheet / review | `docs/episodes/<id>/` |
| one-off episode script | `tools/episode/` |
| shared tool | `tools/` |
| new character | `engine/characters/<name>/` |
| brief for the pipeline | `docs/briefs/` |
