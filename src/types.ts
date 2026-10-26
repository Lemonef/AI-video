// Episode data model. One episodes/epNN.json = one video; scripts/make.py adds `timing` and `take`.

export type Pose = 'idle' | 'wave' | 'shock' | 'yawn' | 'armsCrossed' | 'point' | 'think' | 'hold';
export type Expr = 'smile' | 'sleepy' | 'shock' | 'sweat' | 'flat' | 'angry' | 'gross' | 'talk';
export type Look = 'left' | 'center' | 'right';
export type Action = 'idle' | 'walk' | 'wobble' | 'bounce' | 'shake';

/** A state switch at a fraction (0..1) of the scene's narration. */
export type CastKey = {at: number; pose?: Pose; expr?: Expr; look?: Look; facing?: 1 | -1; action?: Action; turn?: number};

export type CastMember = {
	who: string; // key in src/registry/cast.ts
	x: number; // feet position in the 1080x1920 frame
	y: number;
	scale?: number;
	pose?: Pose;
	expr?: Expr;
	look?: Look;
	facing?: 1 | -1;
	action?: Action;
	toX?: number; // walk target
	keys?: CastKey[];
	turn?: number; // v2: head turn -1..1 (3/4 view)
	torch?: boolean; // v2: holding a flashlight (scene draws the beam)
};

export type PropItem = {type: string; x: number; y: number; scale?: number; at?: number};

export type BubbleItem = {
	kind: 'thought' | 'speech' | 'shout';
	text: string;
	x: number;
	y: number;
	at?: number; // appears at this fraction of the narration
	label?: string; // small speaker tag, e.g. "เพื่อนบ้าน"
	tail?: 'left' | 'right' | 'down';
};

export type Camera = {from?: number; to?: number; x?: number; y?: number};

export type Scene = {
	id: string;
	type?: 'story' | 'freeze' | 'endcard';
	bg: string;
	say: string; // spoken text (TTS-friendly: numbers as words, no emoji)
	caption?: string; // displayed text; defaults to `say`
	tone?: string; // delivery tag for expressive engines, e.g. "whispers", "excited" (sent as [tone])
	showCaptions?: boolean;
	title?: string;
	cast?: CastMember[];
	props?: PropItem[];
	bubbles?: BubbleItem[];
	camera?: Camera;
	padBefore?: number; // seconds of silence before the line
	padAfter?: number; // seconds after
	countdown?: number; // freeze: seconds of 3-2-1 after the line
	// v2 only
	chip?: string; // time/place chip, e.g. "23:47 · ทางเข้าป่า"
	intro?: {name: string; trait: string; at?: number};
	rulesView?: 'big' | 'hud'; // rules card full-screen or as a corner HUD
	reveal?: number; // big view: how many rules are shown (reveals one by one over the line)
	breaks?: Array<{rule: number; at: number}>; // rule (1-based) broken at `at` in this scene; stays broken
	scroll?: number; // px/frame the forest scrolls past (walking)
	fireflies?: boolean;
	density?: number; // tree density multiplier
	transition?: 'fade' | 'whip' | 'cut';
	shake?: number; // constant camera tremble (px) for the whole scene
	hits?: Array<{at: number; strength?: number}>; // sharp camera jolts at moments (scare beats), decaying
	a?: string; // endcard choices
	b?: string;
	prompt?: string;
	footer?: string;
};

export type Cue = {start: number; end: number; text: string};
export type SceneTiming = {audio: string; duration: number; cues: Cue[]};

export type Episode = {
	id: string;
	title: string;
	engine?: string; // TTS engine: "gemini" (one expressive take) or "edge" (per line)
	voice: string;
	rate?: string;
	take?: boolean; // set by make.py when the narration is one continuous take
	tempo?: number; // whole-take speed factor (pitch kept), e.g. 1.15
	style?: 'v1' | 'v2'; // visual style; default v1
	rules?: {title: string; items: string[]}; // v2: the episode's rules, tracked across scenes
	scenes: Scene[];
	timing?: Record<string, SceneTiming>;
};
