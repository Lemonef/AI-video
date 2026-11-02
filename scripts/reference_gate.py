"""Measured keep/discard gate for one reference-study change.

Renders each named shot as a short partial clip with the current code and
compares it with a cached control clip rendered at the SAME settings from the
accepted baseline code. Same settings matter: comparing a half-scale partial
against a full-size export adds encoder/scale noise, so an unchanged shot would
not measure as unchanged.

  python scripts/reference_gate.py --make-baseline --shots 6 7 20
  python scripts/reference_gate.py --shots 23

Each shot is scored twice: whole frame, and a crop around the source actor
(actor-boxes.json, scripts/actor_boxes.py) where that shot has boxes. The actor
is ~5% of the frame, so acting changes are invisible to the whole-frame score.
A target passes when one score lowers MAE by at least MIN_MAE_GAIN without
lowering SSIM and the other score does not regress. Guard shots must not
regress on either score beyond measured render noise. Every shot on the same stage
(shared set/components, from shot-review.json) is guarded automatically; extra
guards can be added, none can be removed.
Exit code 0 = keep, 1 = discard, 2 = usage/setup error.

Baselines are written once from a clean, committed tree and record the hashes
of everything they depend on; the gate refuses a baseline whose source, shot
list, clip or settings no longer match. Builders get the gate command from an
immutable brief and never run --make-baseline.
"""
import argparse
import hashlib
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
from typing import NoReturn

REPO = Path(__file__).resolve().parents[1]
STUDY_DIR = Path(os.environ.get('REFERENCE_STUDY_DIR',
                                REPO/'out/drafts/reference-study/DegJCmXtbGj'))
COMPOSITION = 'ReferenceAssisted'
# Render settings and sample phases are part of the baseline: changing them
# invalidates every cached control (checked below), so they live here only.
# ProRes 4444, not h264: a badge-only edit on shot 26 changed 61% of the pixels
# outside the badge at crf20 (mean 1.65, max 59) and none at ProRes (2026-11-03),
# so local fixes no longer fail on encoder spill. Remotion 4.0.539's h264 floor is
# crf 1, so true-lossless h264 is not available.
RENDER_ARGS = ['--scale=0.5', '--codec=prores', '--prores-profile=4444', '--concurrency=4']
CLIP_EXT = 'mov'   # must match the codec above; Remotion rejects a mismatched extension
# Offline fonts keep renders free of network font loading, so two runs of the
# same code draw identical captions.
RENDER_ENV = {'REMOTION_OFFLINE_FONTS': '1'}
PHASES = [round(.05 + .1*i, 2) for i in range(10)]  # .05 .. .95, ten per shot
# Unchanged code measures bit-identical (self-test 2026-11-01), so any gain is
# real; this floor only rejects gains too small to see in a side-by-side.
MIN_MAE_GAIN = 0.05
# Re-rendering unchanged code is exact for most shots, but shot 28 wobbled by
# MAE 0.0007 / SSIM 0.00002 between identical runs (2026-11-01). The noise
# allowance is ~7-10x that measurement and stays 10x below MIN_MAE_GAIN, so a
# real regression still fails. Re-measure if a guard flips on unchanged code.
NOISE_MAE = 0.005
NOISE_SSIM = 0.0002
# Actor crops reuse the frame noise allowance: the measured lead shots (10/13/14)
# re-rendered bit-identical. Re-measure before boxing a shot that wobbles (28).
ACTOR_BOXES = STUDY_DIR/'actor-boxes.json'


def sha(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def git(*cmd):
    return subprocess.run(['git', *cmd], cwd=REPO, capture_output=True, text=True).stdout.strip()


def fail(msg) -> NoReturn:
    print(msg)
    sys.exit(2)


def study_shots():
    return json.loads((STUDY_DIR/'shot-review.json').read_text(encoding='utf-8'))['shots']


def fps(path):
    out = subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries',
                          'stream=r_frame_rate', '-of', 'default=noprint_wrappers=1:nokey=1', str(path)],
                         capture_output=True, text=True).stdout.split()[0]
    num, _, den = out.partition('/')
    return float(num)/float(den or 1)


def render(shot, out):
    s = study_shots()[shot-1]
    npx = shutil.which('npx.cmd') or shutil.which('npx')
    if not npx:
        fail('npx not found on PATH')
    out.parent.mkdir(parents=True, exist_ok=True)
    run = subprocess.run([npx, 'remotion', 'render', 'src/index.ts', COMPOSITION, str(out),
                          f"--frames={s['start']}-{s['end']-1}", '--overwrite', *RENDER_ARGS],
                         cwd=REPO, stdin=subprocess.DEVNULL, capture_output=True, text=True,
                         env={**os.environ, **RENDER_ENV})
    if run.returncode:
        fail(f'render failed for shot {shot}:\n{run.stderr[-2000:]}')
    if abs(fps(out) - fps(STUDY_DIR/'source.mp4')) > 1e-6:
        fail(f'shot {shot}: render fps {fps(out)} differs from source fps')
    return s['start']


def measure(shot, clip, start, out_dir):
    run = subprocess.run([sys.executable, str(REPO/'scripts/reference_loop_review.py'),
                          '--source', str(STUDY_DIR/'source.mp4'), '--render', str(clip),
                          '--render-start-frame', str(start), '--shot-ids', str(shot),
                          '--shots', str(STUDY_DIR/'shot-review.json'), '--out', str(out_dir),
                          '--phases', *map(str, PHASES), '--actor-boxes', str(ACTOR_BOXES)],
                         cwd=REPO, stdin=subprocess.DEVNULL, capture_output=True, text=True)
    if run.returncode:
        fail(f'review failed for shot {shot}:\n{run.stderr[-2000:]}')
    rows = json.loads((out_dir/'metrics.json').read_text(encoding='utf-8'))['rows']
    # Unrounded means, so the comparison is not decided by display rounding.
    mean = lambda key, rs: {k: sum(r[key][k] for r in rs)/len(rs) for k in ('mae_255', 'ssim')}
    actor = [r for r in rows if 'actor' in r]
    return {'frame': mean('current', rows), 'actor': mean('actor', actor) if actor else None}


def improves(base, cand):
    return base['mae_255'] - cand['mae_255'] >= MIN_MAE_GAIN and cand['ssim'] >= base['ssim'] - NOISE_SSIM


def holds(base, cand):
    return cand['mae_255'] <= base['mae_255'] + NOISE_MAE and cand['ssim'] >= base['ssim'] - NOISE_SSIM


def fingerprint():
    return {'source_sha256': sha(STUDY_DIR/'source.mp4'),
            'shots_sha256': sha(STUDY_DIR/'shot-review.json'),
            'render_args': RENDER_ARGS, 'render_env': RENDER_ENV, 'phases': PHASES,
            # Decoder/scaler version can shift metrics, so it is part of the baseline.
            'ffmpeg': subprocess.run(['ffmpeg', '-version'], capture_output=True,
                                     text=True).stdout.splitlines()[0]}


def make_baseline(shots, base_dir):
    if git('status', '--porcelain', '--untracked-files=no'):
        fail('baseline must come from a clean committed tree; commit or revert tracked changes first')
    for shot in shots:
        meta = base_dir/f'shot{shot:02}.json'
        if meta.exists():
            fail(f'baseline for shot {shot} exists; delete it deliberately to rebuild')
        clip = base_dir/f'shot{shot:02}.{CLIP_EXT}'
        metrics = measure(shot, clip, render(shot, clip), base_dir/f'shot{shot:02}-review')['frame']
        meta.write_text(json.dumps({'shot': shot, 'commit': git('rev-parse', 'HEAD'),
                                    'clip_sha256': sha(clip), **fingerprint(), **metrics},
                                   indent=2), encoding='utf-8')
        print(f'baseline shot {shot} @ {git("rev-parse", "--short", "HEAD")}: '
              f"MAE {metrics['mae_255']:.3f} SSIM {metrics['ssim']:.4f}")


def load_baseline(shot, base_dir):
    meta = base_dir/f'shot{shot:02}.json'
    if not meta.exists():
        fail(f'no baseline for shot {shot}; the parent must run --make-baseline')
    base = json.loads(meta.read_text(encoding='utf-8'))
    for key, value in fingerprint().items():
        if base.get(key) != value:
            fail(f'baseline for shot {shot} is stale: {key} changed since it was made')
    if sha(base_dir/f'shot{shot:02}.{CLIP_EXT}') != base['clip_sha256']:
        fail(f'baseline clip for shot {shot} was modified')
    return base


def main():
    p = argparse.ArgumentParser()
    p.add_argument('--shots', type=int, nargs='+', required=True, help='One-based target shot IDs')
    p.add_argument('--guard', type=int, nargs='*', default=[], help='Extra shots that must not regress')
    p.add_argument('--make-baseline', action='store_true', help='Parent only: cache control clips')
    p.add_argument('--baseline-dir', type=Path, default=STUDY_DIR/'gate-baseline')
    p.add_argument('--out', type=Path, default=STUDY_DIR/'gate-runs/latest')
    args = p.parse_args()
    if not (STUDY_DIR/'source.mp4').exists():
        p.error(f'source.mp4 missing under {STUDY_DIR}; set REFERENCE_STUDY_DIR')
    shots = study_shots()
    if any(not 1 <= s <= len(shots) for s in args.shots+args.guard):
        p.error('unknown shot id')

    if args.make_baseline:
        make_baseline(args.shots, args.baseline_dir)
        return

    stages = {shots[t-1]['stage'] for t in args.shots}
    same_stage = [i for i, s in enumerate(shots, 1) if s['stage'] in stages]
    guards = [g for g in dict.fromkeys(same_stage+args.guard) if g not in args.shots]
    verdicts, ok = [], True
    for shot in args.shots+guards:
        meta = load_baseline(shot, args.baseline_dir)
        # The baseline clip is re-measured every run (cheap, deterministic decode),
        # so editing actor boxes never leaves a stale cached score.
        base = measure(shot, args.baseline_dir/f'shot{shot:02}.{CLIP_EXT}', shots[shot-1]['start'],
                       args.out/f'shot{shot:02}-baseline-review')
        clip = args.out/f'shot{shot:02}.{CLIP_EXT}'
        cand = measure(shot, clip, render(shot, clip), args.out/f'shot{shot:02}-review')
        scores = [k for k in ('frame', 'actor') if base[k]]
        if shot in args.shots:
            passed = any(improves(base[k], cand[k]) and all(holds(base[o], cand[o]) for o in scores if o != k)
                         for k in scores)
            rule = f'target: frame or actor MAE down >= {MIN_MAE_GAIN} with SSIM held, other score held'
        else:
            passed = all(holds(base[k], cand[k]) for k in scores)
            rule = 'guard: frame and actor held within render noise'
        ok &= passed
        verdicts.append({'shot': shot, 'rule': rule, 'pass': passed, 'baseline_commit': meta['commit'],
                         'baseline': base, 'candidate': cand,
                         'sheet': str(args.out/f'shot{shot:02}-review/compare-1.jpg')})
    args.out.mkdir(parents=True, exist_ok=True)
    (args.out/'gate.json').write_text(json.dumps({'keep': ok, 'commit': git('rev-parse', 'HEAD'),
                                                  'shots': verdicts}, indent=2), encoding='utf-8')
    for v in verdicts:
        print(f"shot {v['shot']:>2} {'PASS' if v['pass'] else 'FAIL'} ({v['rule']})")
        for k in ('frame', 'actor'):
            b, c = v['baseline'][k], v['candidate'][k]
            if b:
                print(f"   {k:5} MAE {b['mae_255']:.3f} -> {c['mae_255']:.3f}, "
                      f"SSIM {b['ssim']:.4f} -> {c['ssim']:.4f}")
    print('KEEP' if ok else 'DISCARD')
    sys.exit(0 if ok else 1)


if __name__ == '__main__':
    main()
