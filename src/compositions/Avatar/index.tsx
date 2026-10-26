import React from 'react';
import {AbsoluteFill} from 'remotion';
import {CAST2} from '../../v2/cast';
import {Character2} from '../../v2/Character';

const SIZE = 1080;

export type AvatarProps = {
	bg: 'yellow' | 'cream' | 'teal' | 'navy';
	icon?: boolean; // tiny-size version: tighter crop, thicker outline, no thin details
};

// Profile picture: genre-neutral (horror, comedy and shop videos sit under it). Flat background,
// head-and-shoulders crop that fills TikTok's circle, white sticker outline so it stays crisp small.
const BACKGROUNDS: Record<AvatarProps['bg'], {fill: string; halo: string}> = {
	yellow: {fill: '#FFC940', halo: '#FFD86E'},
	cream: {fill: '#FFF1DC', halo: '#BFEDE6'},
	teal: {fill: '#2FA595', halo: '#4CC2B1'},
	navy: {fill: '#16213E', halo: '#24375F'},
};

export const Avatar: React.FC<AvatarProps> = ({bg, icon}) => {
	const b = BACKGROUNDS[bg];
	// icon: profile photos display at ~100-200 px, so thin lines (lanyard, hair shine) turn to mush
	const look = icon ? {...CAST2.jaab, lanyard: false, bag: false} : CAST2.jaab;
	return (
		<AbsoluteFill style={{background: b.fill}}>
			<svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
				<defs>
					{/* sticker outline: dilate the figure's silhouette in white, under a soft drop shadow */}
					<filter id="sticker" x="-20%" y="-20%" width="140%" height="140%">
						<feMorphology in="SourceAlpha" operator="dilate" radius={icon ? 16 : 9} result="fat" />
						<feFlood floodColor="#FFFFFF" />
						<feComposite in2="fat" operator="in" result="outline" />
						<feGaussianBlur in="fat" stdDeviation={12} result="blur" />
						<feOffset in="blur" dy={12} result="drop" />
						<feFlood floodColor="#000000" floodOpacity={0.22} />
						<feComposite in2="drop" operator="in" result="shadow" />
						<feMerge>
							<feMergeNode in="shadow" />
							<feMergeNode in="outline" />
							<feMergeNode in="SourceGraphic" />
						</feMerge>
					</filter>
				</defs>
				{/* one soft disc behind the head: depth without clutter */}
				{icon ? null : <circle cx={SIZE / 2} cy={SIZE * 0.42} r={SIZE * 0.3} fill={b.halo} />}
				<g filter="url(#sticker)" transform={icon ? `translate(${SIZE / 2} ${SIZE * 2.3}) scale(2.4)` : `translate(${SIZE / 2} ${SIZE * 1.8}) scale(1.9)`}>
					<Character2 look={look} pose="idle" expr="smile" turn={0} frame={20} />
				</g>
			</svg>
		</AbsoluteFill>
	);
};
