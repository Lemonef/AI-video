import React from 'react';
import {H, W} from '../lib/tokens';

/**
 * Lighting kit for flat-vector scenes. The cinematic look comes from light, not detail:
 * paint the scene in its lit colours, then lay darkness over it everywhere except where a
 * light source reaches (Darkness), add the source's glow on top (Glow), and let light fall
 * through openings as soft shafts (Shaft). Contact shadows seat objects on the floor.
 */

export type LightSource = {x: number; y: number; reach: number};

/** Night over the whole frame, with a soft hole around each light source. */
export const Darkness: React.FC<{id: string; color: string; opacity: number; lights: LightSource[]}> = ({id, color, opacity, lights}) => (
	<g>
		<defs>
			<radialGradient id={`${id}-hole`}>
				<stop offset="0" stopColor="#000" />
				<stop offset="0.45" stopColor="#000" stopOpacity={0.6} />
				<stop offset="1" stopColor="#000" stopOpacity={0} />
			</radialGradient>
			<mask id={`${id}-mask`} maskUnits="userSpaceOnUse" x={0} y={0} width={W} height={H}>
				<rect width={W} height={H} fill="#fff" />
				{lights.map((l, i) => (
					<circle key={i} cx={l.x} cy={l.y} r={l.reach} fill={`url(#${id}-hole)`} />
				))}
			</mask>
		</defs>
		<rect width={W} height={H} fill={color} opacity={opacity} mask={`url(#${id}-mask)`} />
	</g>
);

/** The visible glow of a source: a hot core and a wide warm halo, added on top (screen). */
export const Glow: React.FC<{id: string; x: number; y: number; r: number; color: string; strength?: number}> = ({id, x, y, r, color, strength = 1}) => (
	<g style={{mixBlendMode: 'screen'}}>
		<defs>
			<radialGradient id={`${id}-glow`}>
				<stop offset="0" stopColor={color} stopOpacity={0.9 * strength} />
				<stop offset="0.12" stopColor={color} stopOpacity={0.45 * strength} />
				<stop offset="1" stopColor={color} stopOpacity={0} />
			</radialGradient>
		</defs>
		<circle cx={x} cy={y} r={r} fill={`url(#${id}-glow)`} />
	</g>
);

/** Light falling through an opening: a soft-edged polygon fading from the opening outward. */
export const Shaft: React.FC<{id: string; points: Array<[number, number]>; from: [number, number]; to: [number, number]; color: string; opacity?: number; blur?: number}> = ({
	id,
	points,
	from,
	to,
	color,
	opacity = 0.5,
	blur = 14,
}) => (
	<g style={{mixBlendMode: 'screen'}}>
		<defs>
			<linearGradient id={`${id}-fade`} gradientUnits="userSpaceOnUse" x1={from[0]} y1={from[1]} x2={to[0]} y2={to[1]}>
				<stop offset="0" stopColor={color} stopOpacity={opacity} />
				<stop offset="1" stopColor={color} stopOpacity={0} />
			</linearGradient>
			<filter id={`${id}-soft`} x="-20%" y="-20%" width="140%" height="140%">
				<feGaussianBlur stdDeviation={blur} />
			</filter>
		</defs>
		<polygon points={points.map((p) => p.join(',')).join(' ')} fill={`url(#${id}-fade)`} filter={`url(#${id}-soft)`} />
	</g>
);

/** A dark soft ellipse under an object so it sits on the floor instead of floating. */
export const ContactShadow: React.FC<{x: number; y: number; rx: number; ry: number; opacity?: number}> = ({x, y, rx, ry, opacity = 0.55}) => (
	<ellipse cx={x} cy={y} rx={rx} ry={ry} fill="#000" opacity={opacity} style={{filter: 'blur(10px)'}} />
);

/**
 * How the cast is lit in each v7 place. Characters are drawn flat and evenly bright; in a night
 * scene that reads as pasted on. Dim them to the scene and add a thin rim on the side the light
 * comes from (a drop-shadow offset toward the light shows only as a sliver around the outline).
 */
export type CastLight = {brightness: number; saturate: number; rim: string; dx: number; dy: number};
export const CAST_LIGHT: Record<string, CastLight> = {
	forestPath: {brightness: 0.62, saturate: 0.8, rim: 'rgba(157,184,230,0.75)', dx: 5, dy: -4}, // moon up right
	forestClinic: {brightness: 0.66, saturate: 0.85, rim: 'rgba(255,214,150,0.55)', dx: 0, dy: -5}, // the clinic's glow ahead
	houseNight: {brightness: 0.82, saturate: 0.9, rim: 'rgba(255,184,102,0.7)', dx: -4, dy: -5}, // the bulb, up and to his left
};
export const castFilter = (bg: string): string | undefined => {
	const l = CAST_LIGHT[bg];
	return l ? `brightness(${l.brightness}) saturate(${l.saturate}) drop-shadow(${l.dx}px ${l.dy}px 0 ${l.rim})` : undefined;
};
