import React from 'react';
import {interpolate} from 'remotion';
import {FONT_CAPTION} from '../../lib/fonts';
import {C, SAFE, W} from '../../lib/tokens';

const SIZE = 300;
const R = 130;
const RING = 2 * Math.PI * R;

/** 3-2-1 ring. Visible from `start` to `start + seconds` (seconds since the line started). */
export const Countdown: React.FC<{seconds: number; t: number; start: number}> = ({seconds, t, start}) => {
	const into = t - start;
	if (into < 0 || into >= seconds) return null;
	const n = seconds - Math.floor(into);
	const frac = into % 1;
	const scale = interpolate(frac, [0, 0.15, 1], [1.5, 1, 0.92]);
	return (
		<div style={{position: 'absolute', left: 0, width: W, top: SAFE.top + 60, display: 'flex', justifyContent: 'center'}}>
			<div style={{position: 'relative', width: SIZE, height: SIZE, transform: `scale(${scale})`}}>
				<svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} style={{position: 'absolute'}}>
					<circle cx={SIZE / 2} cy={SIZE / 2} r={R} fill={C.ink} />
					<circle
						cx={SIZE / 2}
						cy={SIZE / 2}
						r={R}
						fill="none"
						stroke={C.sun}
						strokeWidth={20}
						strokeDasharray={RING}
						strokeDashoffset={RING * frac}
						transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
						strokeLinecap="round"
					/>
				</svg>
				<div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT_CAPTION, fontWeight: 800, fontSize: 180, color: C.white}}>
					{n}
				</div>
			</div>
		</div>
	);
};
