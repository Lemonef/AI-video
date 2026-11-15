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
 floodThug: {skin:'#C99471',skinShade:'#A76F54',hair:'#171F29',hairHi:'#303A43',top:'#713D42',topShade:'#482B35',pants:'#252B38',pantsShade:'#171E2B',style:'short'},
 floodThug2: {skin:'#DBAF8E',skinShade:'#BA8E6C',hair:'#252526',hairHi:'#454142',top:'#758152',topShade:'#505B3A',pants:'#303641',pantsShade:'#202731',style:'long'},
	jaab: LEAD,
	jaabDark: JAAB_DARK,
	mochi: LEAD,
	friend: {skin: '#E2B08A', skinShade: '#C08D6A', hair: '#2A2028', hairHi: '#453744', top: '#C2553F', topShade: '#94402F', pants: V2.pants, pantsShade: V2.pantsShade, style: 'long'},
	// the infected: grey-green skin, dull clothes; they read by silhouette and walk, not gore
	zombie: {skin: '#8FA58A', skinShade: '#6E8469', hair: '#2B2E2A', hairHi: '#3A3E38', top: '#5E5A55', topShade: '#46433F', pants: '#3B3D44', pantsShade: '#2C2E34', style: 'mochi'},
	zombie2: {skin: '#9AA88F', skinShade: '#77856D', hair: '#3A2E26', hairHi: '#4C3D33', top: '#6B4E4E', topShade: '#523B3B', pants: '#3F3A36', pantsShade: '#2F2B28', style: 'long'},
	// Jaab's mum: older, hair in a bun, a faded sarong-coloured top
	mum: {skin: '#D9AA85', skinShade: '#B98A67', hair: '#3A3436', hairHi: '#55494C', top: '#7A4E6E', topShade: '#5E3B55', pants: '#4A3A44', pantsShade: '#382B33', style: 'long'},
	runner: {skin: '#D9A77F', skinShade: '#B9875F', hair: '#1E1A1C', hairHi: '#36303A', top: '#3E6FA8', topShade: '#2F5684', pants: '#2C3140', pantsShade: '#21252F', style: 'mochi'},
	// lift story: Fon (Jaab's ex) in office clothes, long hair; the lobby night guard and two cleaners
	fon: {skin: '#E8B996', skinShade: '#C79574', hair: '#2B1D1A', hairHi: '#4A332C', top: '#E7E1D6', topShade: '#BDB5A8', pants: '#2E3445', pantsShade: '#1F2433', style: 'long'},
	liftGuard: {skin: '#C79A74', skinShade: '#A57A57', hair: '#1A1A1D', hairHi: '#33333A', top: '#3D4A66', topShade: '#2B354B', pants: '#252A36', pantsShade: '#191D26', style: 'short'},
	cleaner: {skin: '#D6A47E', skinShade: '#B5845F', hair: '#2E2427', hairHi: '#4A3B3F', top: '#5F9C8E', topShade: '#467568', pants: '#3A3F4A', pantsShade: '#2A2E37', style: 'long'},
	cleaner2: {skin: '#C99271', skinShade: '#A87152', hair: '#3B3134', hairHi: '#574A4E', top: '#5F9C8E', topShade: '#467568', pants: '#3A3F4A', pantsShade: '#2A2E37', style: 'mochi'},
};
