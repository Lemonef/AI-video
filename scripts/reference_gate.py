"""Measured keep/discard gate for one reference-study change.

Renders each named shot as a short partial clip with the current code and
compares it with a cached control clip rendered at the SAME settings from the
accepted baseline code. Same settings matter: comparing a half-scale partial
against a full-size export adds encoder/scale noise, so an unchanged shot would
not measure as unchanged.

  python scripts/reference_gate.py --make-baseline --shots 6 7 20
  python scripts/reference_gate.py --shots 23 --guard 6

Target shots must lower MAE and must not lower SSIM. Guard shots (shots that
share a set or component with the target) must not get worse on either metric.
Exit code 0 = keep, 1 = discard, 2 = usage/setup error.
"""
import argparse
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys

REPO = Path(__file__).resolve().parents[1]
STUDY_DIR = Path(os.environ.get('REFERENCE_STUDY_DIR',
                                REPO/'out/drafts/reference-study/DegJCmXtbGj'))
COMPOSITION = 'ReferenceAssisted'
# Render settings are part of the baseline: changing them means rebuilding it.
RENDER_ARGS = ['--scale=0.5', '--crf=20', '--concurrency=4']
METRIC_DECIMALS = {'mae_255': 3, 'ssim': 4}


def shot_ranges():
    shots = json.loads((STUDY_DIR/'shot-review.json').read_text(encoding='utf-8'))['shots']
    return {i: (s['start'], s['end']) for i, s in enumerate(shots, 1)}


def render(shot, out):
    start, end = shot_ranges()[shot]
    npx = shutil.which('npx.cmd') or shutil.which('npx')
    out.parent.mkdir(parents=True, exist_ok=True)
    cmd = [npx, 'remotion', 'render', 'src/index.ts', COMPOSITION, str(out),
           f'--frames={start}-{end-1}', '--overwrite', *RENDER_ARGS]
    run = subprocess.run(cmd, cwd=REPO, stdin=subprocess.DEVNULL, capture_output=True, text=True)
    if run.returncode:
        sys.exit(f'render failed for shot {shot}:\n{run.stderr[-2000:]}')
    return start


def measure(shot, clip, start, out_dir):
    run = subprocess.run([sys.executable, str(REPO/'scripts/reference_loop_review.py'),
                          '--source', str(STUDY_DIR/'source.mp4'), '--render', str(clip),
                          '--render-start-frame', str(start), '--shot-ids', str(shot),
                          '--shots', str(STUDY_DIR/'shot-review.json'), '--out', str(out_dir)],
                         cwd=REPO, stdin=subprocess.DEVNULL, capture_output=True, text=True)
    if run.returncode:
        sys.exit(f'review failed for shot {shot}:\n{run.stderr[-2000:]}')
    report = json.loads((out_dir/'metrics.json').read_text(encoding='utf-8'))
    return {'mae_255': report['mean_mae_255'], 'ssim': report['mean_ssim']}


def main():
    p = argparse.ArgumentParser()
    p.add_argument('--shots', type=int, nargs='+', required=True, help='One-based target shot IDs')
    p.add_argument('--guard', type=int, nargs='*', default=[], help='Shots that must not regress')
    p.add_argument('--make-baseline', action='store_true', help='Cache control clips from the current code')
    p.add_argument('--baseline-dir', type=Path, default=STUDY_DIR/'gate-baseline')
    p.add_argument('--out', type=Path, default=STUDY_DIR/'gate-runs/latest')
    args = p.parse_args()
    if not (STUDY_DIR/'source.mp4').exists():
        p.error(f'source.mp4 missing under {STUDY_DIR}; set REFERENCE_STUDY_DIR')
    known = shot_ranges()
    if any(s not in known for s in args.shots+args.guard):
        p.error('unknown shot id')

    if args.make_baseline:
        for shot in args.shots:
            clip = args.baseline_dir/f'shot{shot:02}.mp4'
            start = render(shot, clip)
            metrics = measure(shot, clip, start, args.baseline_dir/f'shot{shot:02}-review')
            (args.baseline_dir/f'shot{shot:02}.json').write_text(
                json.dumps({'start': start, **metrics}, indent=2), encoding='utf-8')
            print(f'baseline shot {shot}: {metrics}')
        return

    verdicts, ok = [], True
    for shot in dict.fromkeys(args.shots+args.guard):
        cached = args.baseline_dir/f'shot{shot:02}.json'
        if not cached.exists():
            print(f'no baseline for shot {shot}; run --make-baseline first')
            sys.exit(2)
        base = json.loads(cached.read_text(encoding='utf-8'))
        clip = args.out/f'shot{shot:02}.mp4'
        cand = measure(shot, clip, render(shot, clip), args.out/f'shot{shot:02}-review')
        mae_c, mae_b = round(cand['mae_255'], 3), round(base['mae_255'], 3)
        ssim_c, ssim_b = round(cand['ssim'], 4), round(base['ssim'], 4)
        if shot in args.shots:
            passed = mae_c < mae_b and ssim_c >= ssim_b
            rule = 'target: MAE down, SSIM not down'
        else:
            passed = mae_c <= mae_b and ssim_c >= ssim_b
            rule = 'guard: no regression'
        ok &= passed
        verdicts.append({'shot': shot, 'rule': rule, 'pass': passed,
                         'baseline': {'mae_255': mae_b, 'ssim': ssim_b},
                         'candidate': {'mae_255': mae_c, 'ssim': ssim_c},
                         'sheet': str(args.out/f'shot{shot:02}-review/compare-1.jpg')})
    args.out.mkdir(parents=True, exist_ok=True)
    (args.out/'gate.json').write_text(json.dumps({'keep': ok, 'shots': verdicts}, indent=2), encoding='utf-8')
    for v in verdicts:
        print(f"shot {v['shot']:>2} {'PASS' if v['pass'] else 'FAIL'} ({v['rule']}) "
              f"MAE {v['baseline']['mae_255']} -> {v['candidate']['mae_255']}, "
              f"SSIM {v['baseline']['ssim']} -> {v['candidate']['ssim']}")
    print('KEEP' if ok else 'DISCARD')
    sys.exit(0 if ok else 1)


if __name__ == '__main__':
    main()
