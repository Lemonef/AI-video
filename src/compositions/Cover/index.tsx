import React from 'react';
import {AbsoluteFill} from 'remotion';
import {FONT_CAPTION} from '../../lib/fonts';
import {H, W} from '../../lib/tokens';
import type {Episode} from '../../types';
import {CAST2} from '../../v2/cast';
import {Character2} from '../../v2/Character';
import {PROPS2} from '../../v2/props';
import {V2} from '../../v2/tokens';
import {ENV5} from '../../v5/Forest';

/**
 * Series cover template (one look for every episode, so the profile grid reads as an index).
 * Everything sits inside the profile grid's ~3:4 centre crop (y ≈ 240–1680) and above the
 * caption band TikTok prints over the bottom.
 */
const GRID_TOP = 300;
const GRID_BOTTOM = 1560;
const SIDE = 80;

export type CoverProps = {episode: Episode};

const outline = (px: number, color = '#0B0E18') => ({
	WebkitTextStroke: `${px}px ${color}`,
	paintOrder: 'stroke fill' as const,
	textShadow: '0 10px 30px rgba(0,0,0,0.65)',
});

export const Cover: React.FC<CoverProps> = ({episode}) => {
	const post = (episode as Episode & {post?: {series?: string; part?: number; total?: number; coverHook?: string}}).post ?? {};
	const Env = ENV5.forestPath; // the series' v7 look: the path into the forest
	const hook = post.coverHook ?? '';
	return (
		<AbsoluteFill style={{background: '#000'}}>
			<svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', filter: 'saturate(0.85) brightness(0.92)'}}>
				<Env frame={0} scroll={0} fireflies={false} density={1} />
				<g transform="translate(150 1640) scale(1.25)" opacity={0.95}>
					{React.createElement(PROPS2.watcher, {frame: 9})}
				</g>
				{/* the hero, big and scared: the face carries the cover */}
				<g transform="translate(620 2330) scale(1.7)">
					<Character2 look={CAST2.jaab} pose="shock" expr="shock" turn={-0.35} frame={8} torch />
				</g>
			</svg>
			{/* warm-to-dark grade toward the text, so white type always reads */}
			<AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(5,8,18,0.85) 0%, rgba(5,8,18,0) 38%, rgba(5,8,18,0) 70%, rgba(5,8,18,0.6) 100%)'}} />
			<div style={{position: 'absolute', top: GRID_TOP, left: SIDE, right: SIDE}}>
				<div style={{display: 'flex', gap: 18, alignItems: 'center'}}>
					<div style={{fontFamily: FONT_CAPTION, fontWeight: 800, fontSize: 64, color: V2.ink, background: V2.yellow, borderRadius: 18, padding: '4px 26px'}}>EP.{post.part ?? 1}</div>
					{post.total ? <div style={{fontFamily: FONT_CAPTION, fontWeight: 800, fontSize: 52, color: V2.white, ...outline(8)}}>{post.part}/{post.total}</div> : null}
				</div>
				<div style={{fontFamily: FONT_CAPTION, fontWeight: 800, fontSize: 168, lineHeight: 1.05, color: V2.white, marginTop: 18, ...outline(14)}}>{post.series ?? episode.title}</div>
			</div>
			{hook ? (
				<div style={{position: 'absolute', top: GRID_BOTTOM - 210, left: SIDE, right: SIDE, textAlign: 'center'}}>
					<span style={{fontFamily: FONT_CAPTION, fontWeight: 800, fontSize: 120, color: V2.yellow, ...outline(14)}}>{hook}</span>
				</div>
			) : null}
		</AbsoluteFill>
	);
};
