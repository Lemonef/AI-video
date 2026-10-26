// Episode data model. One episodes/epNN.json = one video; scripts/make.py adds `timing` and `take`.

export type Pose = 'idle' | 'wave' | 'shock' | 'yawn' | 'armsCrossed' | 'point' | 'think' | 'hold';
export type Expr = 'smile' | 'sleepy' | 'shock' | 'sweat' | 'flat' | 'angry' | 'gross' | 'talk';
export type Look = 'left' | 'center' | 'right';
export type Action = 'idle' | 'walk' | 'wobble' | 'bounce' | 'shake';

/** A state switch at a fraction (0..1) of the scene's narration. */
export type CastKey = {at: number; pose?: Pose; expr?: Expr; look?: Look; facing?: 1 | -1; action?: Action};

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
	scenes: Scene[];
	timing?: Record<string, SceneTiming>;
};
