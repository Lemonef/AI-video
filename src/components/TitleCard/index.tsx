import React from 'react';
import {spring, useVideoConfig} from 'remotion';
import {FONT_CAPTION} from '../../lib/fonts';
import {C, SAFE} from '../../lib/tokens';

/** Hook title that drops in from the top ("จะเกิดอะไรขึ้นถ้า…"). */
export const TitleCard: React.FC<{text: string; frame: number}> = ({text, frame}) => {
	const {fps} = useVideoConfig();
	const s = spring({frame, fps, config: {damping: 12}});
	return (
		<div style={{position: 'absolute', top: SAFE.top + 40, left: SAFE.left, width: SAFE.right - SAFE.left, display: 'flex', justifyContent: 'center'}}>
			<div
				style={{
					fontFamily: FONT_CAPTION,
					fontWeight: 800,
					fontSize: 76,
					color: C.ink,
					background: C.sun,
					border: `7px solid ${C.ink}`,
					borderRadius: 30,
					padding: '16px 40px',
					transform: `translateY(${(1 - s) * -(SAFE.top + 200)}px) rotate(-2deg)`,
					boxShadow: `12px 12px 0 ${C.ink}`,
				}}
			>
				{text}
			</div>
		</div>
	);
};
