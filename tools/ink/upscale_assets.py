"""2x upscale tool for Ink line-art PNG assets using Real-ESRGAN."""

from __future__ import annotations

import argparse
import hashlib
import json
import shutil
import sys
import urllib.request
from collections.abc import Callable
from pathlib import Path

import cv2
import numpy as np
from PIL import Image

# Module constants for all configuration numbers and settings
DEFAULT_TILE: int = 256
DEFAULT_OVERLAP: int = 16
DEFAULT_MODEL_SCALE: int = 4
OUTPUT_SCALE: int = 2
MANIFEST_FILENAME: str = ".upscale_manifest.json"
DEFAULT_WEIGHTS_PATH: Path = (
    Path(__file__).resolve().parent / "models" / "RealESRGAN_x4plus_anime_6B.pth"
)
WEIGHTS_URL: str = (
    "https://github.com/xinntao/Real-ESRGAN/releases/download/v0.2.2.4/RealESRGAN_x4plus_anime_6B.pth"
)


def _upscale_plane_tiled(
    img_float: np.ndarray,
    model_fn: Callable[[np.ndarray], np.ndarray],
    model_scale: int,
    tile: int,
    overlap: int,
) -> np.ndarray:
    """Run model_fn across img_float (HxWx3 float32 in [0,1]) in padded tiles."""
    h, w, c = img_float.shape
    out_h = h * model_scale
    out_w = w * model_scale
    out = np.zeros((out_h, out_w, c), dtype=np.float32)

    for y in range(0, h, tile):
        core_y0 = y
        core_y1 = min(y + tile, h)
        pad_y0 = max(0, core_y0 - overlap)
        pad_y1 = min(h, core_y1 + overlap)

        for x in range(0, w, tile):
            core_x0 = x
            core_x1 = min(x + tile, w)
            pad_x0 = max(0, core_x0 - overlap)
            pad_x1 = min(w, core_x1 + overlap)

            tile_in = img_float[pad_y0:pad_y1, pad_x0:pad_x1]
            tile_out = model_fn(tile_in)

            expected_shape = (
                (pad_y1 - pad_y0) * model_scale,
                (pad_x1 - pad_x0) * model_scale,
                3,
            )
            if tile_out.shape != expected_shape:
                raise ValueError(
                    f"Expected model output shape {expected_shape}, got {tile_out.shape}"
                )

            crop_y0 = (core_y0 - pad_y0) * model_scale
            crop_y1 = crop_y0 + (core_y1 - core_y0) * model_scale
            crop_x0 = (core_x0 - pad_x0) * model_scale
            crop_x1 = crop_x0 + (core_x1 - core_x0) * model_scale

            tile_core = tile_out[crop_y0:crop_y1, crop_x0:crop_x1]
            out[
                core_y0 * model_scale : core_y1 * model_scale,
                core_x0 * model_scale : core_x1 * model_scale,
            ] = tile_core

    return out


def upscale_image(
    img: np.ndarray,
    model_fn: Callable[[np.ndarray], np.ndarray],
    model_scale: int = DEFAULT_MODEL_SCALE,
    tile: int = DEFAULT_TILE,
    overlap: int = DEFAULT_OVERLAP,
) -> np.ndarray:
    """Upscale uint8 HxWx3 or HxWx4 image to (2H)x(2W) using model_fn and Lanczos downsampling."""
    if img.dtype != np.uint8 or img.ndim != 3 or img.shape[2] not in (3, 4):
        raise ValueError(
            f"Expected uint8 HxWx3 or HxWx4 image, got dtype={img.dtype}, shape={img.shape}"
        )

    h, w, c = img.shape
    rgb_in = img[:, :, :3].astype(np.float32) / 255.0
    rgb_out = _upscale_plane_tiled(rgb_in, model_fn, model_scale, tile, overlap)

    if c == 4:
        alpha_in = np.repeat(img[:, :, 3:4].astype(np.float32) / 255.0, 3, axis=2)
        alpha_out_3ch = _upscale_plane_tiled(alpha_in, model_fn, model_scale, tile, overlap)
        alpha_out = np.mean(alpha_out_3ch, axis=2, keepdims=True)
        model_out = np.concatenate([rgb_out, alpha_out], axis=2)
    else:
        model_out = rgb_out

    scaled = model_out * 255.0
    out_w = w * OUTPUT_SCALE
    out_h = h * OUTPUT_SCALE
    resized = cv2.resize(scaled, (out_w, out_h), interpolation=cv2.INTER_LANCZOS4)
    return np.clip(np.round(resized), 0, 255).astype(np.uint8)


def upscale_dir(
    directory: str | Path,
    model_fn: Callable[[np.ndarray], np.ndarray],
    model_scale: int = DEFAULT_MODEL_SCALE,
    tile: int = DEFAULT_TILE,
    overlap: int = DEFAULT_OVERLAP,
    verbose: bool = False,
) -> dict[str, int]:
    """Upscale all *.png images directly in directory, updating .upscale_manifest.json."""
    dir_path = Path(directory)
    if not dir_path.is_dir():
        raise FileNotFoundError(f"Directory not found: {directory}")

    manifest_path = dir_path / MANIFEST_FILENAME
    manifest: dict[str, str] = {}
    if manifest_path.is_file():
        try:
            manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
        except (json.JSONDecodeError, OSError):
            manifest = {}

    png_files = sorted(p for p in dir_path.glob("*.png") if p.is_file())
    upscaled = 0
    skipped = 0

    for p in png_files:
        data = p.read_bytes()
        file_hash = hashlib.sha256(data).hexdigest()
        if manifest.get(p.name) == file_hash:
            skipped += 1
            if verbose:
                with Image.open(p) as pil_img:
                    w, h = pil_img.size
                print(f"skipped: {p.name} ({w}x{h} -> {w}x{h})")
            continue

        with Image.open(p) as pil_img:
            orig_mode = pil_img.mode
            if orig_mode not in ("RGB", "RGBA"):
                orig_mode = "RGBA" if "A" in pil_img.getbands() else "RGB"
                pil_img = pil_img.convert(orig_mode)
            old_w, old_h = pil_img.size
            arr = np.array(pil_img)

        out_arr = upscale_image(
            arr,
            model_fn=model_fn,
            model_scale=model_scale,
            tile=tile,
            overlap=overlap,
        )
        out_pil = Image.fromarray(out_arr, mode=orig_mode)
        out_pil.save(p, format="PNG")

        new_hash = hashlib.sha256(p.read_bytes()).hexdigest()
        manifest[p.name] = new_hash
        manifest_path.write_text(json.dumps(manifest, indent=2), encoding="utf-8")
        upscaled += 1

        if verbose:
            new_w, new_h = out_pil.size
            print(f"upscaled: {p.name} ({old_w}x{old_h} -> {new_w}x{new_h})")

    return {"upscaled": upscaled, "skipped": skipped}


def ensure_weights(weights_path: Path) -> Path:
    """Ensure RealESRGAN model weights are downloaded and available."""
    if weights_path.is_file():
        return weights_path

    weights_path.parent.mkdir(parents=True, exist_ok=True)
    temp_path = weights_path.with_name(f"{weights_path.name}.tmp")
    req = urllib.request.Request(
        WEIGHTS_URL,
        headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"},
    )
    with urllib.request.urlopen(req) as resp, open(temp_path, "wb") as out_file:
        shutil.copyfileobj(resp, out_file)
    temp_path.replace(weights_path)
    return weights_path


def load_model(
    weights_path: Path | str = DEFAULT_WEIGHTS_PATH,
) -> Callable[[np.ndarray], np.ndarray]:
    """Lazily load spandrel and torch, returning a callable model_fn."""
    import spandrel
    import torch

    path = ensure_weights(Path(weights_path))
    loader = spandrel.ModelLoader()
    descriptor = loader.load_from_file(str(path))
    if descriptor.scale != DEFAULT_MODEL_SCALE:
        raise ValueError(
            f"Expected model scale {DEFAULT_MODEL_SCALE}, got {descriptor.scale}"
        )

    model = getattr(descriptor, "model", descriptor)
    if hasattr(descriptor, "eval"):
        descriptor.eval()
    if hasattr(model, "eval"):
        model.eval()
    if hasattr(model, "to"):
        model.to("cpu")

    @torch.inference_mode()
    def model_fn(rgb: np.ndarray) -> np.ndarray:
        tensor = torch.from_numpy(rgb).permute(2, 0, 1).unsqueeze(0).to("cpu")
        out_tensor = model(tensor)
        out_numpy = out_tensor.squeeze(0).permute(1, 2, 0).cpu().numpy()
        return out_numpy

    return model_fn


def main() -> None:
    parser = argparse.ArgumentParser(description="Upscale Ink PNG line-art assets 2x")
    parser.add_argument("dirs", nargs="+", help="Directories containing PNG assets to upscale")
    parser.add_argument("--tile", type=int, default=DEFAULT_TILE, help="Tile size in pixels")
    parser.add_argument("--overlap", type=int, default=DEFAULT_OVERLAP, help="Tile overlap in pixels")
    parser.add_argument(
        "--weights",
        type=Path,
        default=DEFAULT_WEIGHTS_PATH,
        help="Path to RealESRGAN model weights",
    )
    args = parser.parse_args()

    for d in args.dirs:
        p = Path(d)
        if not p.is_dir():
            print(f"Error: Directory does not exist: {d}", file=sys.stderr)
            sys.exit(1)

    model_fn = load_model(args.weights)

    total_upscaled = 0
    total_skipped = 0
    for d in args.dirs:
        res = upscale_dir(
            d,
            model_fn=model_fn,
            model_scale=DEFAULT_MODEL_SCALE,
            tile=args.tile,
            overlap=args.overlap,
            verbose=True,
        )
        total_upscaled += res["upscaled"]
        total_skipped += res["skipped"]

    print(f"Summary: {total_upscaled} upscaled, {total_skipped} skipped")


if __name__ == "__main__":
    main()
