"""Reproduce a private, gated preview from reviewed reconstruction clips.

Run from the repository root. Receipts contain local input hashes and a filter
graph; this never uses source-film frames as reconstruction frames.
"""
import argparse
import hashlib
import json
from pathlib import Path
import shutil
import subprocess


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--receipt', type=Path, required=True)
    parser.add_argument('--output', type=Path, required=True)
    # The repo-local out/tools copy is blocked by Windows Application Control
    # since 2026-11-01; use whichever ffmpeg is on PATH.
    parser.add_argument('--ffmpeg', type=Path, default=Path(shutil.which('ffmpeg') or 'ffmpeg'))
    args = parser.parse_args()
    receipt = json.loads(args.receipt.read_text(encoding='utf-8'))
    inputs = [Path(item['path']) for item in receipt['inputs']]
    if args.output.resolve() in [p.resolve() for p in inputs]:
        parser.error('Output must not overwrite an input')
    for item, path in zip(receipt['inputs'], inputs):
        if hashlib.sha256(path.read_bytes()).hexdigest() != item['sha256']:
            parser.error(f'Input hash changed: {path}')
    args.output.parent.mkdir(parents=True, exist_ok=True)
    cmd = [str(args.ffmpeg.resolve()), '-v', 'error', '-n']
    for path in inputs:
        cmd += ['-i', str(path)]
    cmd += ['-filter_complex', receipt['filter'], '-map', '[out]', '-map', '0:a?',
            # Lossless (-crf 0) forces the High 4:4:4 profile, which common
            # players show as a black screen; CRF 16 High stays visually clean.
            '-c:v', 'libx264', '-crf', '16', '-preset', 'fast', '-profile:v', 'high',
            '-pix_fmt', 'yuv420p', '-movflags', '+faststart',
            '-c:a', 'copy', str(args.output)]
    subprocess.run(cmd, check=True)
    print(json.dumps({'output': str(args.output), 'sha256': hashlib.sha256(args.output.read_bytes()).hexdigest()}))


if __name__ == '__main__':
    main()
