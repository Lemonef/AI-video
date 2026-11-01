import {loadFont as loadKanit} from '@remotion/google-fonts/Kanit';
import {loadFont as loadMali} from '@remotion/google-fonts/Mali';

// Kanit = captions/titles (bold, readable at phone size). Mali = bubbles (rounded, playful).
// Explicit fallback for renders in environments without network/font-cache access.
export const OFFLINE_FONTS = process.env.REMOTION_OFFLINE_FONTS === '1';
export const FONT_CAPTION = OFFLINE_FONTS ? 'Tahoma' : loadKanit('normal', {weights: ['600', '800'], subsets: ['thai', 'latin']}).fontFamily;
export const FONT_BUBBLE = OFFLINE_FONTS ? 'Tahoma' : loadMali('normal', {weights: ['600', '700'], subsets: ['thai', 'latin']}).fontFamily;
