---json
{"id": "takrut01-assets", "type": "normal", "risk": "low", "repo": "D:/AI-video", "gates": ["python -m pytest -q -p no:cacheprovider tests/test_takrut01_assets.py", "python scripts/tsc_in_worktree.py"], "protected": ["tests/**", "conftest.py", "**/conftest.py", "pytest.ini", "pyproject.toml", "setup.cfg", "scripts/make.py", "scripts/pipeline/**", "scripts/tsc_in_worktree.py", "out/**", "package.json", "package-lock.json", "episodes/**", "docs/**", "src/compositions/**", "src/types.ts", "tsconfig.json"], "context_files": ["episodes/takrut01.json", "docs/takrut01-beat-sheet.md", "src/v7/Lift.tsx", "src/v7/light.tsx", "src/v5/Forest.tsx", "src/v2/cast.ts", "src/lib/tokens.ts", "tests/test_takrut01_assets.py"]}
---
# Goal
Episode `episodes/takrut01.json` names one cast member and four backgrounds that do not exist yet.
Build them so the episode renders. Room descriptions + the lead's look: `docs/takrut01-beat-sheet.md`.

# Steps
1. `scripts/gen_bg_flux.py` - CLI: `python scripts/gen_bg_flux.py <out.png> "<prompt>"`.
   Calls Cloudflare Workers AI `@cf/black-forest-labs/flux-1-schnell`
   (POST `https://api.cloudflare.com/client/v4/accounts/<id>/ai/run/@cf/black-forest-labs/flux-1-schnell`,
   JSON body `{"prompt": ..., "steps": 8}`, response JSON `result.image` = base64 JPEG/PNG).
   Account id from `~/.secrets/cloudflare_account_id`, token from `~/.secrets/cloudflare_api_key`
   (Bearer). Never print, log or write either value. Send a browser-like User-Agent.
   Output: square result scaled to cover W x H from `src/lib/tokens.ts` (read the numbers, do not
   hard-code), centre-cropped, saved as PNG. Pillow is installed.
2. Run it to create `public/takrut01/find.png`, `ancient.png`, `reset.png` from the beat-sheet room
   notes (same room, same camera, wide eye-level view; warm-cool fluorescent + blue window light;
   flat illustrated storybook style; NO people, NO text, NO logos). `public/takrut01/coinflood.png`
   is already committed - do not regenerate or replace it.
3. `src/v2/cast.ts` - add `takrutLead` (Look2, style per beat sheet: dark wavy hair, brick-orange
   tee, cream open shirt; slim). Match existing entry format.
4. New `src/v7/Takrut.tsx`: four `React.FC<BgProps>` components `TakrutRoomFind`, `TakrutRoomAncient`,
   `TakrutRoomCoinFlood`, `TakrutRoomReset`. Each = full-frame `Img` of its `staticFile('takrut01/<room>.png')`
   plus a light code layer driven by `useCurrentFrame()`: Find = drifting dust + one soft warm glow
   near floor-left; Ancient = slow golden shimmer specks; CoinFlood = falling coin particles;
   Reset = still, faint dust only. Follow `src/v7/Lift.tsx` patterns. No magic numbers: sizes from W/H.
5. Register the four in the `BACKGROUNDS` object at the end of `src/v5/Forest.tsx` under keys
   `takrutRoomFind`, `takrutRoomAncient`, `takrutRoomCoinFlood`, `takrutRoomReset`.

# Done when
- Work only inside the repo you were started in; never read or write paths outside it.
- `python -m pytest -q tests/test_takrut01_assets.py` passes and `python scripts/tsc_in_worktree.py` passes.
- The test file is the contract: do not edit it; if an assertion is wrong, STOP and report.
- Diff touches only: scripts/gen_bg_flux.py, public/takrut01/{find,ancient,reset}.png, src/v2/cast.ts, src/v7/Takrut.tsx, src/v5/Forest.tsx.
