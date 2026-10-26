import type {Look2} from './Character';
import {V2} from './tokens';

/**
 * v2/v3 cast. The series lead is JAAB (จ๊าบ, "cool") from v3 on: scared of everything, curious
 * anyway. Same build as v2's Mochi (teal hoodie, backpack, lanyard, the curl that springs up in
 * a panic); `mochi` stays so the frozen v2 episode (tag v2) still renders.
 */
const LEAD: Look2 = {skin: V2.skin, skinShade: V2.skinShade, hair: V2.hair, hairHi: V2.hairHi, top: V2.hoodie, topShade: V2.hoodieShade, pants: V2.pants, pantsShade: V2.pantsShade, style: 'mochi', bag: true, lanyard: true};

// v4: the same Jaab as a dark silhouette; teal survives only as the one accent colour.
const JAAB_DARK: Look2 = {
	...LEAD,
	skin: '#1B2130',
	skinShade: '#141927',
	hair: '#0C0F17',
	hairHi: '#1C2232',
	top: '#161B28',
	topShade: '#10141E',
	pants: '#121621',
	pantsShade: '#0D1018',
	silhouette: true,
	accent: V2.hoodie,
};

export const CAST2: Record<string, Look2> = {
	jaab: LEAD,
	jaabDark: JAAB_DARK,
	mochi: LEAD,
	friend: {skin: '#E2B08A', skinShade: '#C08D6A', hair: '#2A2028', hairHi: '#453744', top: '#C2553F', topShade: '#94402F', pants: V2.pants, pantsShade: V2.pantsShade, style: 'long'},
};
