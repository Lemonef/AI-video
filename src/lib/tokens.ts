// Design tokens: series palette + frame layout. Single source for every colour and safe-zone.
export const C = {
	ink: '#2A2438',
	cream: '#FFF3E2',
	paper: '#FFFBF4',
	coral: '#FF6F59',
	coralDark: '#E2533F',
	teal: '#3DBFB0',
	tealDark: '#2A9C8F',
	sun: '#FFC83D',
	sky: '#9AD7F5',
	skyDeep: '#6FB8E3',
	lilac: '#C9B6F2',
	lilacDark: '#9C85D6',
	mint: '#BFEBD9',
	grass: '#8FD694',
	blush: '#FF8FA0',
	skin: '#FFD9BC',
	skinTan: '#E9B48C',
	skinDeep: '#B9805A',
	hairDark: '#2E2633',
	hairBrown: '#6B4A3A',
	hairGrey: '#B9B4BE',
	wood: '#D9A273',
	woodDark: '#B7804F',
	wall: '#FBE3C8',
	wallCool: '#DCEFF0',
	steel: '#C7D3DC',
	steelDark: '#8FA2B0',
	white: '#FFFFFF',
	shadow: 'rgba(42,36,56,0.16)',
	durian: '#B7C64B',
	durianDark: '#8C9A2E',
} as const;

export const W = 1080;
export const H = 1920;
// Tall phones (~9:19.5) show a 9:16 video zoomed to fill the height, cutting a strip off each side.
const TALL_PHONE_ASPECT = 19.5 / 9;
const CROP_X = Math.ceil((W - H / TALL_PHONE_ASPECT) / 2); // ~97 px per side
export const VISIBLE = {left: CROP_X, right: W - CROP_X} as const;
const EDGE_MARGIN = 20;
// TikTok UI covers these regions of a 1080x1920 frame; keep text out of them. right = the button rail.
export const SAFE = {top: 170, bottom: 1500, right: 940, left: VISIBLE.left + EDGE_MARGIN} as const;
export const FLOOR_Y = 1260;
export const CAPTION_TOP = 1330; // below the floor line, above TikTok's bottom UI (SAFE.bottom)

// Procedural sound effects written by scripts/pipeline/sfx.py (licence-free).
export const SFX = {pop: 'sfx/pop.wav', tick: 'sfx/tick.wav', whoosh: 'sfx/whoosh.wav'} as const;
