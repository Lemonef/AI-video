---json
{"id":"ep02-cut-white-key","type":"normal","risk":"medium","repo":"D:/AI-video","gates":["python -m pytest tests/test_cut_sprites_white.py -q"],"protected":["tests/**","conftest.py","**/conftest.py","pytest.ini","pyproject.toml","setup.cfg","videos/**","engine/**","tools/ink/check_art.py","tools/ink/integrate_art.py"],"context_files":["tools/ink/cut_sprites.py","tests/test_cut_sprites_white.py"],"shared_context":[]}
---
# Goal
Add a white-background mode to the sprite-sheet cutter so the ep02 master sheets (pure white background, figures with WHITE heads and gloves inside thick black outlines) can be cut into transparent per-pose PNGs. The default magenta mode must behave exactly as it does now.

# Files
- `tools/ink/cut_sprites.py`: the only file to change.

# Steps
1. Switch the CLI to argparse and keep the positional interface: `<sheet> <outdir> <prefix> [expected_count]`. Add `--key {magenta,white}` (default `magenta`) and `--merge N` (dilation iterations used to merge a pose's parts into one blob; default 8, the current value). Update the module docstring.
2. Leave magenta mode unchanged: same key test, same opening, same min_area, same fringe clean-up, same output names and printed lines. `python -m pytest tests/test_cut_sprites_white.py -k magenta` must stay green on every ep01 sheet.
3. In white mode, compute the background like this:
   - Mark near-white pixels (every RGB channel above about 235; name the threshold as a constant with a comment).
   - The background is ONLY the near-white region connected to the image border. Use `scipy.ndimage.label` on the near-white mask and keep the labels that touch the border. White areas enclosed by an outline, such as heads, gloves and cravats, are foreground and must stay opaque.
   - Foreground = not background. Apply the same opening as magenta mode.
   - Then drop thin separator lines. master_bath has full-width thin black horizontal divider lines between its three bands, and possibly vertical ones. Before labelling blobs, remove any foreground connected component whose bounding box spans at least 90% of the image width (or height) and whose thickness is under about 2% of the image height (or width). Name these fractions as constants with a comment. Do this BEFORE the dilate/merge step, so a divider cannot glue a whole band of figures into one blob.
4. Blob labelling, row-major ordering and min_area filtering stay shared by both modes.
   - The ordering row test compares blob centres within half a row height. The ep02 sheets mix full-body rows with shorter expression-head rows, so check that this still gives true row-major order.
   - If it does not, make the row grouping more robust in a way that leaves magenta output identical.
5. Alpha in white mode = the blob's foreground mask inside its crop. In white mode, do NOT run the magenta fringe clean-up. Edge anti-aliasing against white is fine.
6. If the default merge of 8 makes neighbouring cells merge on a tightly packed sheet (the master_bath merchant band sits close together), choose per-mode defaults: 8 for magenta, and whatever value cuts every ep02 sheet to the exact counts in the test. Keep `--merge` as an override, and comment why the white default differs.

# Done when
- `python -m pytest tests/test_cut_sprites_white.py -q` passes: every test, both modes.
- Exact counts with no WARN line: master_bb 42, master_crew 42, master_bath 39.
- `python -I tools/ink/cut_sprites.py videos/pastly-life/01-eiffel-ink/assets/ink60full/sheets/sheet_a.png <tmp> p 6` prints the same lines as before the change.
- Work only inside the repo, touch no other file, and add no new test or config file.
