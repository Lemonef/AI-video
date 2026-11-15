---json
{"id": "ink-upscale", "type": "normal", "risk": "low", "repo": "D:/AI-video", "gates": ["python -m pytest tests/test_upscale_assets.py -q"], "protected": ["tests/**", "conftest.py", "**/conftest.py", "pytest.ini", "pyproject.toml", "setup.cfg", "docs/**", "videos/**", "engine/**", "package.json", "package-lock.json"], "context_files": ["tests/test_upscale_assets.py"]}
---
# Goal
Write a CLI tool that upscales the Ink episode's line-art PNGs (stickman sprites with alpha, painted background plates) to exactly 2x their pixel size, in place, using the Real-ESRGAN anime x4 model on CPU. The 1080p render shows the sprites and plates soft/pixelated because they are drawn larger than their native size. Layout code sizes sprites by height with the aspect kept, so a uniform 2x change is layout-neutral.

# Files
- NEW `tools/ink/upscale_assets.py` - the module and its CLI.
- NEW `tools/ink/requirements-upscale.txt` - spandrel and torch (CPU) pins for the CLI only.
- EDIT `.gitignore` - add one line ignoring the weights cache folder tools/ink/models/ (a gitignored cache: never created or committed by this task, the CLI makes it at run time).
- Do not touch anything else. Work only inside the repo.

# Contract (tests/test_upscale_assets.py is the source of truth; it is protected)
- `upscale_image(img, model_fn, model_scale=4, tile=256, overlap=16) -> np.ndarray`
  - `img`: uint8 HxWx3 or HxWx4. Returns uint8 (2H)x(2W) with the same channel count.
  - `model_fn(rgb)`: float32 hxwx3 in [0,1] -> float32 (h*model_scale)x(w*model_scale)x3. Any other output shape raises `ValueError` naming expected vs got.
  - Tiling: split the image into tiles of `tile` px with `overlap` px of context on each side (clamped at image borders); run the model per padded tile; crop the context back off in output space; paste. Result must not depend on the tile size (no seams).
  - Alpha (4-channel input): run alpha through the same model as a 3-channel grey image (alpha replicated to RGB) and take the channel mean, so anti-aliased line edges stay sharp.
  - After the model, resize the model_scale output to exactly 2x with Lanczos (`cv2.INTER_LANCZOS4`), clip to [0,255], round to uint8.
- `upscale_dir(directory, model_fn, model_scale=4, tile=256, overlap=16) -> {"upscaled": int, "skipped": int}`
  - Processes only `*.png` directly in `directory` (not recursive). Other files are never read or written.
  - Writes each result over its source file (PNG, same mode RGB/RGBA).
  - Manifest `.upscale_manifest.json` in the same directory: `{filename: sha256 of the written output bytes}`. A file whose current bytes hash to its manifest entry is skipped (already upscaled). A file that does not match (new or replaced art) is upscaled and its entry updated. Write the manifest after each file so an interrupted run resumes cleanly.
- Importing the module must not import torch or spandrel; load them lazily inside the CLI model loader.

# CLI
`python tools/ink/upscale_assets.py <dir> [<dir> ...] [--tile 256] [--overlap 16] [--weights PATH]`
- Default weights: `tools/ink/models/RealESRGAN_x4plus_anime_6B.pth`; if missing, download from `https://github.com/xinntao/Real-ESRGAN/releases/download/v0.2.2.4/RealESRGAN_x4plus_anime_6B.pth` with urllib (send a browser-like User-Agent), to a temp name then rename.
- Load with `spandrel.ModelLoader().load_from_file(path)`, check `.scale == 4`, `.eval()`, CPU; `model_fn` wraps it under `torch.inference_mode()` converting HWC float32 <-> NCHW tensors.
- Print one line per file (`upscaled` / `skipped`, name, old -> new size) and a final summary; exit non-zero if a directory does not exist.
- Name every number that is a setting (default tile, overlap, out scale 2, manifest name) as a module constant at the top.

# Steps
1. Read tests/test_upscale_assets.py fully.
2. Write tools/ink/upscale_assets.py, requirements-upscale.txt, the .gitignore line.
3. Run `python -m pytest tests/test_upscale_assets.py -q` until green. Do not run the CLI on real assets.

# Done when
- The gate `python -m pytest tests/test_upscale_assets.py -q` exits 0.
- The test file is unchanged; no conftest or pytest config added.
- No files changed outside the list above; no asset under videos/ touched.
