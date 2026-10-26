import {loadFont as loadKanit} from '@remotion/google-fonts/Kanit';
import {loadFont as loadMali} from '@remotion/google-fonts/Mali';

// Kanit = captions/titles (bold, readable at phone size). Mali = bubbles (rounded, playful).
export const FONT_CAPTION = loadKanit('normal', {weights: ['600', '800'], subsets: ['thai', 'latin']}).fontFamily;
export const FONT_BUBBLE = loadMali('normal', {weights: ['600', '700'], subsets: ['thai', 'latin']}).fontFamily;
