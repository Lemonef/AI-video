// v2 "night forest" design tokens. Cinematic flat 2D: cool darks, one warm light source.
// v1 tokens (src/lib/tokens.ts) stay untouched so v1 episodes render exactly as before.
export const V2 = {
	// sky + atmosphere (far = lighter/bluer: aerial perspective)
	sky0: '#0B1022',
	sky1: '#1A2342',
	sky2: '#2C3A5E',
	moon: '#F3EED8',
	moonGlow: 'rgba(243,238,216,0.18)',
	fog: 'rgba(170,190,220,0.16)',
	far: '#33436A',
	mid: '#1E2A47',
	near: '#0E1528',
	ground: '#161E33',
	path: '#2A3350',
	moss: '#2F4A3E',
	// warm light
	torch: '#FFD27A',
	torchSoft: 'rgba(255,210,122,0.22)',
	firefly: '#E9FF8A',
	// character
	skin: '#F2C9A5',
	skinShade: '#D9A47F',
	hair: '#1E1A24',
	hairHi: '#3A3245',
	hoodie: '#2FA595', // Mochi's teal, carried over from v1 for continuity
	hoodieShade: '#1F7A6E',
	pants: '#2A2F45',
	pantsShade: '#1C2033',
	shoe: '#E8E4DA',
	bag: '#C2553F',
	bagShade: '#94402F',
	lanyard: '#FFC83D',
	rim: 'rgba(190,215,255,0.85)', // moonlight rim on the shadow side
	eyeWhite: '#FBF7F0',
	iris: '#3B2A22',
	blush: 'rgba(255,120,120,0.28)',
	// ui
	ink: '#0B0E18',
	paper: '#F1E7D0',
	paperShade: '#D9CBAE',
	red: '#E5484D',
	yellow: '#FFD84D',
	white: '#FFFFFF',
	chip: 'rgba(11,14,24,0.72)',
} as const;

export const GROUND_Y = 1480; // low horizon: characters stand big in frame, captions sit over the ground
