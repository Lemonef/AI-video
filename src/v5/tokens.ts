// v5 art direction: clean vector, one outline weight, gradients on every surface, one key light.
export const INK = '#151826'; // the single outline colour for every drawn shape
export const LINE = 6; // the single outline weight (px at scale 1)

export const J5 = {
	// sky / atmosphere: far = lighter + bluer (aerial perspective)
	skyTop: '#060A16',
	skyMid: '#0E1830',
	skyLow: '#1C2D4C',
	moon: '#E9F2FF',
	haze: '#4D6A99',
	trunkNear: '#0A101E',
	trunkFar: '#2A3D60',
	pineNear: '#0C1426',
	pineFar: '#2C426A',
	ground: '#0D1424',
	pathNear: '#2A3550',
	pathFar: '#18223A',
	moonShaft: '#9FC2FF',
	torch: '#FFE3A1',
} as const;

export const VP = {x: 540, y: 980}; // vanishing point of the one-point forest
