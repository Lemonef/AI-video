"""Contract for tools/ink/upscale_assets.py (2x line-art upscale of Ink sprites and plates).

The real model (Real-ESRGAN anime 4x via spandrel) is injected as `model_fn`, so these tests use a
nearest-neighbour stub and never need torch, spandrel or the weights file.
"""
import subprocess
import sys
from pathlib import Path

import numpy as np
import pytest
from PIL import Image

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "tools" / "ink"))

import upscale_assets as ua  # noqa: E402

MODEL_SCALE = 4  # the stub mirrors the real x4 model


def nearest_model(rgb: np.ndarray) -> np.ndarray:
    """Stub for the network: float32 HxWx3 in [0,1] -> (4H)x(4W)x3, nearest neighbour."""
    assert rgb.dtype == np.float32 and rgb.ndim == 3 and rgb.shape[2] == 3
    return np.repeat(np.repeat(rgb, MODEL_SCALE, axis=0), MODEL_SCALE, axis=1)


def blocky(h: int, w: int, channels: int, seed: int = 0) -> np.ndarray:
    """Image of flat 8x8 blocks so interiors survive any resampling exactly."""
    rng = np.random.default_rng(seed)
    small = rng.integers(0, 256, size=((h + 7) // 8, (w + 7) // 8, channels), dtype=np.uint8)
    return np.repeat(np.repeat(small, 8, axis=0), 8, axis=1)[:h, :w]


def save_png(path: Path, arr: np.ndarray) -> None:
    Image.fromarray(arr, "RGBA" if arr.shape[2] == 4 else "RGB").save(path)


@pytest.mark.parametrize("channels", [3, 4])
def test_output_is_twice_the_size_and_keeps_channels(channels):
    img = blocky(45, 70, channels)
    out = ua.upscale_image(img, nearest_model, model_scale=MODEL_SCALE, tile=32, overlap=8)
    assert out.dtype == np.uint8
    assert out.shape == (90, 140, channels)


def test_tiling_leaves_no_seams():
    img = blocky(70, 90, 4, seed=1)
    tiled = ua.upscale_image(img, nearest_model, model_scale=MODEL_SCALE, tile=24, overlap=8)
    whole = ua.upscale_image(img, nearest_model, model_scale=MODEL_SCALE, tile=512, overlap=8)
    assert np.abs(tiled.astype(int) - whole.astype(int)).max() <= 1


def test_block_interiors_and_alpha_are_preserved():
    img = blocky(64, 64, 4, seed=2)
    img[:, :32, 3] = 0      # left half fully transparent
    img[:, 32:, 3] = 255    # right half fully opaque
    out = ua.upscale_image(img, nearest_model, model_scale=MODEL_SCALE, tile=32, overlap=8)
    assert (out[:, :56, 3] == 0).all()
    assert (out[:, 72:, 3] == 255).all()
    # centre pixel of every 8x8 source block keeps its colour at 2x
    for by in range(8):
        for bx in range(8):
            y, x = by * 8 + 4, bx * 8 + 4
            assert np.abs(out[2 * y, 2 * x, :3].astype(int) - img[y, x, :3].astype(int)).max() <= 1


def test_model_with_wrong_scale_fails_loudly():
    def x2_model(rgb):
        return np.repeat(np.repeat(rgb, 2, axis=0), 2, axis=1)

    with pytest.raises(ValueError):
        ua.upscale_image(blocky(16, 16, 3), x2_model, model_scale=MODEL_SCALE, tile=32, overlap=8)


def test_directory_run_is_idempotent_and_ignores_non_png(tmp_path):
    save_png(tmp_path / "a.png", blocky(20, 30, 4, seed=3))
    save_png(tmp_path / "b.png", blocky(24, 16, 3, seed=4))
    (tmp_path / "notes.txt").write_text("not an image")

    first = ua.upscale_dir(tmp_path, nearest_model, model_scale=MODEL_SCALE, tile=32, overlap=8)
    assert first == {"upscaled": 2, "skipped": 0}
    assert Image.open(tmp_path / "a.png").size == (60, 40)
    assert Image.open(tmp_path / "b.png").size == (32, 48)
    assert (tmp_path / "notes.txt").read_text() == "not an image"
    snapshot = {p.name: p.read_bytes() for p in tmp_path.glob("*.png")}

    second = ua.upscale_dir(tmp_path, nearest_model, model_scale=MODEL_SCALE, tile=32, overlap=8)
    assert second == {"upscaled": 0, "skipped": 2}
    assert {p.name: p.read_bytes() for p in tmp_path.glob("*.png")} == snapshot


def test_replaced_file_is_upscaled_again(tmp_path):
    save_png(tmp_path / "a.png", blocky(20, 30, 4, seed=5))
    ua.upscale_dir(tmp_path, nearest_model, model_scale=MODEL_SCALE, tile=32, overlap=8)
    save_png(tmp_path / "a.png", blocky(10, 12, 4, seed=6))  # new source art dropped in
    again = ua.upscale_dir(tmp_path, nearest_model, model_scale=MODEL_SCALE, tile=32, overlap=8)
    assert again == {"upscaled": 1, "skipped": 0}
    assert Image.open(tmp_path / "a.png").size == (24, 20)


def test_import_does_not_load_the_model_stack():
    code = (
        "import sys; sys.path.insert(0, r'%s'); import upscale_assets; "
        "bad = [m for m in ('torch', 'spandrel') if m in sys.modules]; "
        "sys.exit(1 if bad else 0)" % (Path(__file__).resolve().parent.parent / "tools" / "ink")
    )
    assert subprocess.run([sys.executable, "-c", code]).returncode == 0
