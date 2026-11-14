"""Compare a reconstruction against the actual reference at matching frame numbers.

This measures pixel/edge differences, not artistic acceptance. Inspect the contact sheets too.
Source and render must have the same frame rate; source media stays local and uncommitted.
"""
import argparse
import hashlib
import json
from pathlib import Path
import subprocess

import cv2
import numpy as np
from PIL import Image, ImageDraw


def frames(path, indices, size=(270, 480)):
    terms = [f'eq(n,{i})' for i in indices]
    while len(terms) > 1:
        terms = ['('+'+'.join(terms[i:i+2])+')' for i in range(0,len(terms),2)]
    selector = terms[0]
    process = subprocess.run([
        'ffmpeg', '-v', 'error', '-i', str(path), '-vf',
        f"select='{selector}',scale={size[0]}:{size[1]}", '-fps_mode', 'vfr',
        '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-',
    ], capture_output=True)
    if process.returncode:
        raise RuntimeError(process.stderr.decode(errors='replace'))
    raw = process.stdout
    result = np.frombuffer(raw, np.uint8).reshape((-1, size[1], size[0], 3))
    if len(result) != len(indices):
        raise ValueError(f'{path}: expected {len(indices)} samples, decoded {len(result)}')
    return result


def metrics(a, b):
    a, b = a.astype(np.float32), b.astype(np.float32)
    gray = lambda x: cv2.cvtColor(x, cv2.COLOR_RGB2GRAY)
    x, y = gray(a), gray(b)
    ux, uy = cv2.GaussianBlur(x, (11, 11), 1.5), cv2.GaussianBlur(y, (11, 11), 1.5)
    vx = cv2.GaussianBlur(x*x, (11, 11), 1.5)-ux*ux
    vy = cv2.GaussianBlur(y*y, (11, 11), 1.5)-uy*uy
    cov = cv2.GaussianBlur(x*y, (11, 11), 1.5)-ux*uy
    ssim = ((2*ux*uy+6.5025)*(2*cov+58.5225))/((ux*ux+uy*uy+6.5025)*(vx+vy+58.5225))
    return {'mae_255': round(float(np.abs(a-b).mean()), 3),
            'ssim': round(float(ssim.mean()), 4),
            'luma_delta': round(float(y.mean()-x.mean()), 3)}


def main():
    p = argparse.ArgumentParser()
    p.add_argument('--source', type=Path, required=True)
    p.add_argument('--render', type=Path, required=True)
    p.add_argument('--baseline', type=Path)
    p.add_argument('--shots', type=Path, required=True)
    p.add_argument('--out', type=Path, required=True)
    args = p.parse_args()
    args.out.mkdir(parents=True, exist_ok=True)
    shots = json.loads(args.shots.read_text(encoding='utf-8'))['shots']
    # Beginning/middle/end catches transitions and acting omitted by a midpoint-only check.
    samples = sorted({int(s['start']+(s['end']-s['start']-1)*t)
                      for s in shots for t in [.1, .5, .9]})
    ref, study = frames(args.source, samples), frames(args.render, samples)
    old = frames(args.baseline, samples) if args.baseline else None
    rows = []
    for i, frame in enumerate(samples):
        shot = next(s for s in shots if s['start'] <= frame < s['end'])
        row = {'frame': frame, 'shot': shots.index(shot)+1,
               'current': metrics(ref[i], study[i])}
        if old is not None:
            row['baseline'] = metrics(ref[i], old[i])
        rows.append(row)
    # One row per shot, three phases per row, reference left / reconstruction right.
    for page in range((len(shots)+4)//5):
        sheet = Image.new('RGB', (3*360, 5*346), '#181a1c')
        draw = ImageDraw.Draw(sheet)
        for slot, shot in enumerate(shots[page*5:page*5+5]):
            sid = shots.index(shot)+1
            for phase, i in enumerate([i for i,r in enumerate(rows) if r['shot']==sid]):
                x, y = phase*360, slot*346
                draw.text((x+5,y+5), f'{sid:02} frame {samples[i]} / ref | reconstruction', fill='white')
                for col, pixels in enumerate((ref[i],study[i])):
                    sheet.paste(Image.fromarray(pixels).resize((180,320)), (x+col*180,y+22))
        sheet.save(args.out/f'compare-{page+1}.jpg', quality=90)
    report = {'source': str(args.source), 'render': str(args.render),
              'render_sha256': hashlib.sha256(args.render.read_bytes()).hexdigest(),
              'samples': len(rows), 'rows': rows,
              'mean_ssim': round(float(np.mean([r['current']['ssim'] for r in rows])),4),
              'mean_mae_255': round(float(np.mean([r['current']['mae_255'] for r in rows])),3),
              'acceptance': 'Not a match certification. Inspect the images and log remaining gaps.'}
    if old is not None:
        report['baseline_mean_ssim'] = round(float(np.mean([r['baseline']['ssim'] for r in rows])),4)
        report['baseline_mean_mae_255'] = round(float(np.mean([r['baseline']['mae_255'] for r in rows])),3)
    (args.out/'metrics.json').write_text(json.dumps(report,indent=2), encoding='utf-8')
    print(json.dumps({k:v for k,v in report.items() if k!='rows'},indent=2))


if __name__ == '__main__':
    main()
