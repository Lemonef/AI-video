import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {FONT_CAPTION} from '../../lib/fonts';
import {H, W} from '../../lib/tokens';
import {Character7, JAAB7, type View7} from '../../v7/Character7';
import type {Expr} from '../../types';

/** Turnaround sheet for the v7 cast: views and expressions side by side, walking on demand. */
const POSES: Array<{view: View7; expr: Expr; label: string; walk?: boolean; torch?: boolean}> = [
	{view: 'front', expr: 'flat', label: 'หน้า', torch: true},
	{view: 'side', expr: 'sweat', label: 'ข้าง · เดิน', walk: true, torch: true},
	{view: 'back', expr: 'flat', label: 'หลัง'},
	{view: 'front', expr: 'shock', label: 'ตกใจ'},
	{view: 'front', expr: 'smile', label: 'ยิ้ม'},
	{view: 'side', expr: 'shock', label: 'ข้าง · ตกใจ'},
];

export const CharPreview: React.FC = () => {
	const frame = useCurrentFrame();
	return (
		<AbsoluteFill style={{background: '#1B2333'}}>
			<svg width={W} height={H}>
				{POSES.map((p, i) => {
					const x = 190 + (i % 3) * 350;
					const y = i < 3 ? 860 : 1700;
					return (
						<g key={i}>
							<g transform={`translate(${x} ${y}) scale(0.62)`}>
								<Character7 look={JAAB7} view={p.view} expr={p.expr} frame={frame} walking={p.walk} torch={p.torch} />
							</g>
							<text x={x} y={y + 70} textAnchor="middle" fontFamily={FONT_CAPTION} fontWeight={800} fontSize={40} fill="#E8EEF5">
								{p.label}
							</text>
						</g>
					);
				})}
			</svg>
		</AbsoluteFill>
	);
};
