import type {Look2} from './Character';
import {V2} from './tokens';

/**
 * v2 cast. Mochi keeps the v1 identity (teal top, staff lanyard, the panic curl) in a more
 * grown, cinematic build: hoodie + backpack for the outdoor/adventure arcs.
 */
export const CAST2: Record<string, Look2> = {
	mochi: {skin: V2.skin, skinShade: V2.skinShade, hair: V2.hair, hairHi: V2.hairHi, top: V2.hoodie, topShade: V2.hoodieShade, pants: V2.pants, pantsShade: V2.pantsShade, style: 'mochi', bag: true, lanyard: true},
	friend: {skin: '#E2B08A', skinShade: '#C08D6A', hair: '#2A2028', hairHi: '#453744', top: '#C2553F', topShade: '#94402F', pants: V2.pants, pantsShade: V2.pantsShade, style: 'long'},
};
