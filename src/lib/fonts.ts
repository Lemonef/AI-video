import {cancelRender, continueRender, delayRender, staticFile} from 'remotion';
import {loadFont as loadKanit} from '@remotion/google-fonts/Kanit';
import {loadFont as loadMali} from '@remotion/google-fonts/Mali';

// Kanit = captions/titles (bold, readable at phone size). Mali = bubbles (rounded, playful).
// Explicit fallback for renders in environments without network/font-cache access.
export const OFFLINE_FONTS = process.env.REMOTION_OFFLINE_FONTS === '1';
export const FONT_CAPTION = OFFLINE_FONTS ? 'Tahoma' : loadKanit('normal', {weights: ['600', '800'], subsets: ['thai', 'latin']}).fontFamily;
export const FONT_BUBBLE = OFFLINE_FONTS ? 'Tahoma' : loadMali('normal', {weights: ['600', '700'], subsets: ['thai', 'latin']}).fontFamily;

// Offline renders (the reference gate) must still draw the font that ships, or caption
// scores measure a stand-in. Registers a vendored file under its real family name, held by
// delayRender until loaded - the same mechanism @remotion/fonts uses.
export const localFont = (family: string, file: string): string => {
	if (typeof FontFace === 'undefined') return family;
	const handle = delayRender(`font ${family}`);
	new FontFace(family, `url(${staticFile(file)})`).load()
		.then((face) => {document.fonts.add(face); continueRender(handle);})
		.catch((err) => cancelRender(err));
	return family;
};
