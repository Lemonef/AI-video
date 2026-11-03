"""Measure reference camera transforms against clean, source-assisted set plates.

Stores geometry, not source pictures. Low-confidence fits are omitted, never invented.
"""
import argparse
import json
from pathlib import Path

import cv2
import numpy as np

from reference_study_review import frames


DENSIFY_TOL_PX = 1.0


def _map_corners(matrix, plane=(270, 480)):
    width, height = plane
    corners = np.float64([[0, 0], [width, 0], [width, height], [0, height]])
    matrix = np.asarray(matrix, dtype=np.float64)
    return corners @ matrix[:2, :2].T + matrix[:2, 2]


def corner_gap(m1, m2, plane=(270, 480)):
    a = _map_corners(m1, plane)
    b = _map_corners(m2, plane)
    return float(np.max(np.linalg.norm(a - b, axis=1)))


def blend(ma, mb, t):
    ma = np.asarray(ma, dtype=np.float64)
    mb = np.asarray(mb, dtype=np.float64)
    return (1 - t) * ma + t * mb


def densify(fit, keys, tol, min_gap=1):
    added = {}
    known = {frame: np.asarray(matrix, dtype=np.float64) for frame, matrix in keys.items()}
    fitted = {}

    def get(frame):
        if frame not in fitted:
            fitted[frame] = fit(frame)
        return fitted[frame]

    def add(frame, matrix):
        known[frame] = np.asarray(matrix, dtype=np.float64)
        added[frame] = matrix

    def walk(a, b):
        if b - a <= min_gap:
            return
        mid = (a + b) // 2
        matrix = get(mid)
        if matrix is None:
            return
        guess = blend(known[a], known[b], (mid - a) / (b - a))
        if corner_gap(matrix, guess) > tol:
            add(mid, matrix)
            walk(a, mid)
            walk(mid, b)

    ordered = sorted(known)
    for a, b in zip(ordered, ordered[1:]):
        walk(a, b)

    # Bisection can land exactly on the blend at the middle of a symmetric ease while
    # the halves still drift. Keep adding the worst remaining frame until the whole
    # gap interpolates within tolerance (or has no fit).
    while True:
        ordered = sorted(known)
        if len(ordered) < 2:
            break
        pending = None
        for frame in range(ordered[0], ordered[-1] + 1):
            if frame in known:
                continue
            a = max(key for key in ordered if key < frame)
            b = min(key for key in ordered if key > frame)
            matrix = get(frame)
            if matrix is None:
                continue
            guess = blend(known[a], known[b], (frame - a) / (b - a))
            if corner_gap(matrix, guess) > tol:
                pending = frame
                break
        if pending is None:
            break
        add(pending, get(pending))

    return added


def merge_samples(old_rows, new_rows, shot_ids):
    shot_ids = set(shot_ids)
    rows = [row for row in old_rows if row.get('shot') not in shot_ids]
    rows.extend(new_rows)
    return sorted(rows, key=lambda row: row['frame'])


def main():
    p=argparse.ArgumentParser()
    p.add_argument('--source',type=Path,required=True)
    p.add_argument('--shots',type=Path,required=True)
    p.add_argument('--plates',type=Path,required=True)
    p.add_argument('--out',type=Path,required=True)
    p.add_argument('--stride',type=int,default=5)
    p.add_argument('--densify-px',type=float,default=DENSIFY_TOL_PX,
                   help='review-plane pixel tolerance for extra keys; 0 disables')
    p.add_argument('--shot-ids',type=int,nargs='+',help='Fit only these original shot numbers; preserve global IDs.')
    args=p.parse_args()
    shots=json.loads(args.shots.read_text())['shots']
    stage_files={'counter':'counter','door':'door','chain':'door','aisle':'aisle',
                 'dark':'aisle','parking':'parking','exterior':'exterior',
                 'radio':'prop','map':'map','map-parking':'map-parking','dark-face':'dark-face','dark-prop':'dark-prop'}
    cv2.setNumThreads(2)
    sift=cv2.SIFT_create(nfeatures=1000,contrastThreshold=.018)
    matcher=cv2.FlannBasedMatcher(dict(algorithm=1,trees=4),dict(checks=40))
    clahe=cv2.createCLAHE(clipLimit=2,tileGridSize=(8,8))
    def gray(x):return clahe.apply(cv2.cvtColor(x,cv2.COLOR_RGB2GRAY))
    plates={}
    for stage,name in stage_files.items():
        path=args.plates/(f'{name}-clean-v9.png' if name=='dark-prop' else f'{name}-clean-v1.png')
        if not path.exists():continue
        image=cv2.cvtColor(cv2.resize(cv2.imread(str(path)),(270,480)),cv2.COLOR_BGR2RGB)
        kp,desc=sift.detectAndCompute(gray(image),None)
        plates[stage]=(name,kp,desc)

    def fit(frame,image):
        shot=next((s for s in shots if s['start']<=frame<s['end']),None)
        if shot is None:return None
        stage=shot['stage']
        # Coarse groups contain real internal transitions.
        if stage=='phone':return None
        sid=shots.index(shot)+1
        if sid==16 or (sid==15 and frame>=885):stage='map-parking'
        if sid==33:stage='dark-face'
        if sid in (32,34) and 'dark-prop' in plates:stage='dark-prop'
        if stage not in plates:return None
        name,kp0,d0=plates[stage]
        mask=np.full((480,270),255,np.uint8)
        mask[300:345,:]=0  # narrative captions
        kp1,d1=sift.detectAndCompute(gray(image),mask)
        if d1 is None:return None
        pairs=matcher.knnMatch(d0,d1,k=2)
        matches=[a for pair in pairs if len(pair)==2 for a,b in [pair] if a.distance<.72*b.distance]
        if len(matches)<9:return None
        a=np.float32([kp0[m.queryIdx].pt for m in matches])
        b=np.float32([kp1[m.trainIdx].pt for m in matches])
        matrix,inliers=cv2.estimateAffinePartial2D(a,b,method=cv2.RANSAC,ransacReprojThreshold=2.2,maxIters=3000)
        if matrix is None:return None
        count=int(inliers.sum())
        scale=float(np.hypot(matrix[0,0],matrix[1,0]))
        angle=float(np.degrees(np.arctan2(matrix[1,0],matrix[0,0])))
        if count<8 or count/len(matches)<.35 or not .4<scale<4.2 or abs(angle)>5:return None
        errors=np.linalg.norm(cv2.transform(a[None],matrix)[0]-b,axis=1)[inliers[:,0].astype(bool)]
        return {'frame':frame,'shot':sid,'plate':name,
                'matrix':np.round(matrix,6).tolist(),'inliers':count,
                'median_error_px':round(float(np.median(errors)),3)}

    samples=sorted({f for sid,s in enumerate(shots,1) if s['stage'] in plates and (not args.shot_ids or sid in args.shot_ids)
                    for f in [s['start'],*range(s['start']+2,s['end'],args.stride),s['end']-1]})
    source=frames(args.source,samples)
    rows=[row for frame,image in zip(samples,source) if (row:=fit(frame,image))]

    added_rows=[]
    if args.densify_px>0:
        groups={}
        for row in rows:
            groups.setdefault((row['shot'],row['plate']),[]).append(row)
        for (sid,plate),group in sorted(groups.items()):
            keys={row['frame']:np.asarray(row['matrix'],np.float64) for row in group}
            if len(keys)<2:continue
            shot=shots[sid-1]
            lo,hi=min(keys),max(keys)
            images=dict(zip(range(lo,hi+1),frames(args.source,list(range(lo,hi+1)))))
            cache={}
            def fitted_row(frame):
                if frame not in cache:
                    image=images.get(frame)
                    cache[frame]=None if image is None else fit(frame,image)
                return cache[frame]
            def fitted_matrix(frame):
                row=fitted_row(frame)
                return None if row is None else np.asarray(row['matrix'],np.float64)
            added=densify(fitted_matrix,keys,args.densify_px)
            for frame in sorted(added):
                row=fitted_row(frame)
                if row is not None and row['plate']==plate:
                    added_rows.append(row)

    rows=rows+added_rows
    if args.shot_ids and args.out.exists():
        old=json.loads(args.out.read_text()).get('samples',[])
        rows=merge_samples(old,rows,set(args.shot_ids))
    else:
        rows=sorted(rows,key=lambda row:row['frame'])

    args.out.parent.mkdir(parents=True,exist_ok=True)
    args.out.write_text(json.dumps({'stride':args.stride,'densify_px':args.densify_px,
                        'coordinate_plane':[270,480],
                        'method':'SIFT / ratio .72 / similarity RANSAC; reference-assisted only',
                        'samples':rows},indent=2),encoding='utf-8')
    print('Accepted',len(rows),'of',len(samples),'camera samples; shots:',sorted({r['shot'] for r in rows}))
    if added_rows:print('Densified',len(added_rows),'extra keys at',args.densify_px,'review-plane pixels')
    if rows:print('median landmark residual',round(float(np.median([r['median_error_px'] for r in rows])),3),'review-plane pixels')


if __name__=='__main__':main()
