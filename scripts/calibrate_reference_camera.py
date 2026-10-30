"""Measure reference camera transforms against clean, source-assisted set plates.

Stores geometry, not source pictures. Low-confidence fits are omitted, never invented.
"""
import argparse
import json
from pathlib import Path

import cv2
import numpy as np

from reference_study_review import frames


def main():
    p=argparse.ArgumentParser()
    p.add_argument('--source',type=Path,required=True)
    p.add_argument('--shots',type=Path,required=True)
    p.add_argument('--plates',type=Path,required=True)
    p.add_argument('--out',type=Path,required=True)
    p.add_argument('--stride',type=int,default=5)
    args=p.parse_args()
    shots=json.loads(args.shots.read_text())['shots']
    stage_files={'counter':'counter','door':'door','chain':'door','aisle':'aisle',
                 'dark':'aisle','parking':'parking','exterior':'exterior',
                 'radio':'prop','map':'map'}
    cv2.setNumThreads(2)
    sift=cv2.SIFT_create(nfeatures=1000,contrastThreshold=.018)
    matcher=cv2.FlannBasedMatcher(dict(algorithm=1,trees=4),dict(checks=40))
    clahe=cv2.createCLAHE(clipLimit=2,tileGridSize=(8,8))
    def gray(x):return clahe.apply(cv2.cvtColor(x,cv2.COLOR_RGB2GRAY))
    plates={}
    for stage,name in stage_files.items():
        path=args.plates/f'{name}-clean-v1.png'
        if not path.exists():continue
        image=cv2.cvtColor(cv2.resize(cv2.imread(str(path)),(270,480)),cv2.COLOR_BGR2RGB)
        kp,desc=sift.detectAndCompute(gray(image),None)
        plates[stage]=(name,kp,desc)
    samples=sorted({f for s in shots if s['stage'] in plates
                    for f in [s['start'],*range(s['start']+2,s['end'],args.stride),s['end']-1]})
    source=frames(args.source,samples)
    rows=[]
    for frame,image in zip(samples,source):
        shot=next(s for s in shots if s['start']<=frame<s['end'])
        stage=shot['stage']
        # Coarse groups contain real internal transitions.
        if stage=='phone':continue
        if shots.index(shot)+1==15 and frame>=885:stage='map'
        if stage not in plates:continue
        name,kp0,d0=plates[stage]
        mask=np.full((480,270),255,np.uint8)
        mask[300:345,:]=0  # narrative captions
        kp1,d1=sift.detectAndCompute(gray(image),mask)
        if d1 is None:continue
        pairs=matcher.knnMatch(d0,d1,k=2)
        matches=[a for pair in pairs if len(pair)==2 for a,b in [pair] if a.distance<.72*b.distance]
        if len(matches)<9:continue
        a=np.float32([kp0[m.queryIdx].pt for m in matches])
        b=np.float32([kp1[m.trainIdx].pt for m in matches])
        matrix,inliers=cv2.estimateAffinePartial2D(a,b,method=cv2.RANSAC,ransacReprojThreshold=2.2,maxIters=3000)
        if matrix is None:continue
        count=int(inliers.sum())
        scale=float(np.hypot(matrix[0,0],matrix[1,0]))
        angle=float(np.degrees(np.arctan2(matrix[1,0],matrix[0,0])))
        if count<8 or count/len(matches)<.35 or not .4<scale<4.2 or abs(angle)>5:continue
        errors=np.linalg.norm(cv2.transform(a[None],matrix)[0]-b,axis=1)[inliers[:,0].astype(bool)]
        rows.append({'frame':frame,'shot':shots.index(shot)+1,'plate':name,
                     'matrix':np.round(matrix,6).tolist(),'inliers':count,
                     'median_error_px':round(float(np.median(errors)),3)})
    args.out.parent.mkdir(parents=True,exist_ok=True)
    args.out.write_text(json.dumps({'stride':args.stride,'coordinate_plane':[270,480],
                        'method':'SIFT / ratio .72 / similarity RANSAC; reference-assisted only',
                        'samples':rows},indent=2),encoding='utf-8')
    print('Accepted',len(rows),'of',len(samples),'camera samples; shots:',sorted({r['shot'] for r in rows}))
    if rows:print('median landmark residual',round(float(np.median([r['median_error_px'] for r in rows])),3),'review-plane pixels')


if __name__=='__main__':main()
