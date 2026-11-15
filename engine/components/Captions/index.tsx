import React from 'react';
import {interpolate} from 'remotion';
import {FONT_CAPTION} from '../../lib/fonts';
import {C, CAPTION_TOP, SAFE} from '../../lib/tokens';
import {activeCue} from '../../lib/cues';
import type {Cue} from '../../types';

const POP_IN_SEC = 0.12;

/** Word-timed caption chunk. `t` = seconds since the narration line started. */
export const Captions: React.FC<{cues: Cue[]; t: number}> = ({cues, t}) => {
	const cue = activeCue(cues, t);
	if (!cue) return null;
	const pop = interpolate(t - cue.start, [0, POP_IN_SEC], [0.85, 1], {extrapolateRight: 'clamp'});
	return (
		<div style={{position: 'absolute', left: SAFE.left, width: SAFE.right - SAFE.left, top: CAPTION_TOP, display: 'flex', justifyContent: 'center'}}>
			<div
				style={{
					fontFamily: FONT_CAPTION,
					fontWeight: 800,
					fontSize: 70,
					lineHeight: 1.3,
					color: C.white,
					textAlign: 'center',
					background: C.ink,
					borderRadius: 28,
					padding: '14px 34px',
					transform: `scale(${pop})`,
					boxShadow: `0 10px 0 ${C.coralDark}`,
				}}
			>
				{cue.text}
			</div>
		</div>
	);
};
