import React from 'react';
import {AbsoluteFill} from 'remotion';
import {FONT_CAPTION} from '../../lib/fonts';
import {H, W} from '../../lib/tokens';
import type {Episode, Expr, Pose} from '../../types';
import {CAST2} from '../../v2/cast';
import {Character2} from '../../v2/Character';
import {PROPS2} from '../../v2/props';
import {V2} from '../../v2/tokens';
import {ENV5} from '../../v5/Forest';

/**
 * Series cover template (one look for every episode, so the profile grid reads as an index).
 * Everything sits inside the CENTRE SQUARE (y 420-1500): the tightest crop any platform takes
 * (Instagram's composer previews 1:1, its feed is 4:5 and its grid 3:4; TikTok's grid is 3:4),
 * so one cover fits all of them.
 */
const SQUARE_TOP = (H - W) / 2;
const SQUARE_MARGIN = 40;
const GRID_TOP = SQUARE_TOP + SQUARE_MARGIN;
const GRID_BOTTOM = SQUARE_TOP + W - SQUARE_MARGIN;
const SIDE = 80;
const HOOK_BLOCK = 170; // the hook line's height at 120 px type: it ends on GRID_BOTTOM

type CoverActor = {look: string; pose?: Pose; expr?: Expr; turn?: number; x: number; y: number; scale?: number};

export type CoverProps = {episode: Episode};

const outline = (px: number, color = '#0B0E18') => ({
	WebkitTextStroke: `${px}px ${color}`,
	paintOrder: 'stroke fill' as const,
	textShadow: '0 10px 30px rgba(0,0,0,0.65)',
});

export const Cover: React.FC<CoverProps> = ({episode}) => {
	const post = episode.post ?? {};
	const Env = ENV5[String(post.coverBg ?? 'forestPath')] ?? ENV5.forestPath;
 const flood = String(post.coverBg ?? '').startsWith('flood');
	const hook = String(post.coverHook ?? '');
	// per-series cover cast; absent = the original forest/flood layout, so older covers re-render unchanged
	const cast = Array.isArray(post.coverCast) ? (post.coverCast as CoverActor[]) : null;
	return (
		<AbsoluteFill style={{background: '#000'}}>
			<svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', filter: 'saturate(0.85) brightness(0.92)'}}>
				<Env frame={flood?-1:0} scroll={0} fireflies={false} density={1} />
				{cast ? cast.map((c, i) => (
					<g key={i} transform={`translate(${c.x} ${c.y}) scale(${c.scale ?? 1})`}>
						<Character2 look={CAST2[c.look] ?? CAST2.jaab} pose={c.pose ?? 'idle'} expr={c.expr ?? 'smile'} turn={c.turn ?? 0} frame={8} torch={false} />
					</g>
				)) : (<>
				<g transform={flood?"translate(170 1950) scale(1.1)":"translate(150 1640) scale(1.25)"} opacity={flood ? 1 : 0.95}>
					{flood?<Character2 look={CAST2.floodThug} pose="armsCrossed" expr="angry" turn={.3} frame={8} torch={false}/>:React.createElement(PROPS2.watcher, {frame: 9})}
				</g>
				{/* the hero, big and scared: the face carries the cover */}
				<g transform="translate(620 2330) scale(1.7)">
					<Character2 look={CAST2.jaab} pose="shock" expr="shock" turn={-0.35} frame={8} torch={!flood} />
				</g>
				</>)}
			</svg>
			{/* warm-to-dark grade toward the text, so white type always reads */}
			<AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(5,8,18,0.85) 0%, rgba(5,8,18,0) 38%, rgba(5,8,18,0) 70%, rgba(5,8,18,0.6) 100%)'}} />
			<div style={{position: 'absolute', top: GRID_TOP, left: SIDE, right: SIDE}}>
				<div style={{display: 'flex', gap: 18, alignItems: 'center'}}>
					<div style={{fontFamily: FONT_CAPTION, fontWeight: 800, fontSize: 64, color: V2.ink, background: V2.yellow, borderRadius: 18, padding: '4px 26px'}}>EP.{post.part ?? 1}</div>
					{post.total ? <div style={{fontFamily: FONT_CAPTION, fontWeight: 800, fontSize: 52, color: V2.white, ...outline(8)}}>{post.part}/{post.total}</div> : null}
				</div>
				<div style={{fontFamily: FONT_CAPTION, fontWeight: 800, fontSize: 150, lineHeight: 1.05, color: V2.white, marginTop: 12, ...outline(14)}}>{post.series ?? episode.title}</div>
			</div>
			{hook ? (
				<div style={{position: 'absolute', top: GRID_BOTTOM - HOOK_BLOCK, left: SIDE, right: SIDE, textAlign: 'center'}}>
					<span style={{fontFamily: FONT_CAPTION, fontWeight: 800, fontSize: flood?104:120, color: V2.yellow, ...outline(14)}}>{hook}</span>
				</div>
			) : null}
		</AbsoluteFill>
	);
};
