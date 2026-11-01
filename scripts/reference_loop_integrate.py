"""Reproduce a private, gated preview from reviewed reconstruction clips.

Run from the repository root. Receipts contain local input hashes and a filter
graph; this never uses source-film frames as reconstruction frames.
"""
import argparse
import hashlib
import json
from pathlib import Path
import subprocess


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--receipt', type=Path, required=True)
    parser.add_argument('--output', type=Path, required=True)
    parser.add_argument('--ffmpeg', type=Path, default=Path('out/tools/ffmpeg/ffmpeg.exe'))
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
            '-c:v', 'libx264', '-crf', '0', '-preset', 'fast', '-pix_fmt', 'yuv420p',
            '-c:a', 'copy', str(args.output)]
    subprocess.run(cmd, check=True)
    print(json.dumps({'output': str(args.output), 'sha256': hashlib.sha256(args.output.read_bytes()).hexdigest()}))


if __name__ == '__main__':
    main()
