"""Fit per-shot, per-local-frame grade curves from source luma."""
import argparse
import json
import sys
from pathlib import Path
from typing import NoReturn

import numpy as np

MIN_SLOPE = 0.2  # keep a bad frame from crushing the shot
MAX_SLOPE = 2.0  # keep a bad frame from blowing out the shot
MIN_LUMA = 4.0  # below this the render frame is near black and the ratio is noise


def fit_curve(src_luma: list[float], ours_luma: list[float], base_slope: float = 1.0) -> list[float]:
    """Return per-frame slope: base_slope * src/ours, clamped, rounded to 3 places.

    When ours < MIN_LUMA, reuse the previous slope (first frame: base_slope, unclamped).
    """
    if len(src_luma) != len(ours_luma):
        raise ValueError("src_luma and ours_luma must have the same length")

    curve: list[float] = []
    prev_slope = base_slope

    for src, ours in zip(src_luma, ours_luma):
        if ours < MIN_LUMA:
            slope = prev_slope
        else:
            slope = base_slope * src / ours
            slope = max(MIN_SLOPE, min(MAX_SLOPE, slope))
        slope = round(slope, 3)
        curve.append(slope)
        prev_slope = slope

    return curve


def merge_curve(table: dict[str, list[float]], shot: int, curve: list[float]) -> dict[str, list[float]]:
    """Return a NEW dict with the shot's curve added/replaced; input not mutated."""
    out = dict(table)
    out[str(shot)] = curve
    return out


def fail(msg: str) -> NoReturn:
    print(msg, file=sys.stderr)
    sys.exit(2)


def main():
    from reference_gate import study_shots, gray_frames, STUDY_DIR

    p = argparse.ArgumentParser()
    p.add_argument('--shot', type=int, required=True, help='One-based shot ID')
    p.add_argument('--base-slope', type=float, required=True, help='Base slope to multiply')
    p.add_argument('--baseline-dir', type=Path, default=STUDY_DIR / 'gate-baseline')
    args = p.parse_args()

    shots = study_shots()
    if not 1 <= args.shot <= len(shots):
        fail(f'unknown shot id {args.shot}')

    shot = shots[args.shot - 1]
    count = shot['end'] - shot['start']

    src_path = STUDY_DIR / 'source.mp4'
    render_path = args.baseline_dir / f'shot{args.shot:02}.mov'

    src_frames = gray_frames(src_path, shot['start'], count, size=(270, 480))
    our_frames = gray_frames(render_path, 0, count, size=(270, 480))

    src_luma = src_frames.mean(axis=(1, 2)).tolist()
    our_luma = our_frames.mean(axis=(1, 2)).tolist()

    curve = fit_curve(src_luma, our_luma, base_slope=args.base_slope)

    grade_curves_path = Path(__file__).resolve().parents[1] / 'src' / 'compositions' / 'ReferenceStudy' / 'grade-curves.json'
    if grade_curves_path.exists():
        table = json.loads(grade_curves_path.read_text(encoding='utf-8'))
    else:
        table = {}

    table = merge_curve(table, args.shot, curve)

    grade_curves_path.parent.mkdir(parents=True, exist_ok=True)
    grade_curves_path.write_text(
        json.dumps(table, indent=1, sort_keys=True) + '\n',
        encoding='utf-8'
    )

    print(f'shot {args.shot}: {len(curve)} slopes, min {min(curve):.3f} max {max(curve):.3f}')


if __name__ == '__main__':
    main()