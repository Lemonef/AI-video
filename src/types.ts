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
	word?: string; // or: exactly when the narrator says this word (overrides `at`)
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
	countdown?: number; // seconds of 3-2-1
	countdownAt?: number; // start at this fraction of the line (overlays it, adds no time); default = after the line
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
	hits?: Array<{at: number; word?: string; strength?: number; sound?: string}>; // sharp jolts on scare beats; sound overrides the auto impact ('' = silent)
	// v3 (only when the episode has `mix`)
	beds?: Record<string, number>; // bed level 0..1 for this scene, e.g. {"wind": 0.5, "crickets": 0}
	bedsAt?: {at?: number; word?: string; only?: string[]}; // when this scene's bed levels take over (default: scene start); `only` = just these beds wait
	bedsFade?: number; // seconds to glide into them (default 0.4; ~0.15 = sudden silence)
	bedsLead?: number; // J-cut: this scene's beds start this many seconds BEFORE its picture
	hush?: {word: string; lead?: number; hold?: number}; // silence-before-the-hit: every bed drops to near zero `lead` s before the word, for `lead + hold` s
	grade?: string; // colour script: CSS filter for this scene's world (v6)
	sfx?: Array<{at: number; word?: string; sound: string; volume?: number; rate?: number}>; // rate > 1 = faster (escalating heartbeat) // one-shots at fractions of the line
	shots?: Array<{at: number; word?: string; zoom: number; x: number; y: number; sound?: string}>; // camera cuts within the scene; silent unless `sound`
	stat?: {value: string; label: string; at?: number}; // big number card ("3 ข้อ")
	choices?: {a: {x: number; y: number}; b: {x: number; y: number}}; // end card: options pinned to places in the scene
	rain?: boolean; // v3: rain streaks over the scene
	tint?: {color: string; at?: number; strength?: number}; // v4: colour-coded light (e.g. red = danger) from `at`
	blackout?: {at: number; sec: number}; // v4: torch dies, frame goes black, captions stay
	a?: string; // endcard choices
	b?: string;
	prompt?: string;
	footer?: string;
};

export type Cue = {start: number; end: number; text: string};
export type SceneTiming = {audio: string; duration: number; cues: Cue[]; words?: Array<{text: string; start: number; end: number}>};

export type Episode = {
	id: string;
	title: string;
	engine?: string; // TTS engine: "gemini" (one expressive take) or "edge" (per line)
	voice: string;
	rate?: string;
	take?: boolean; // set by make.py when the narration is one continuous take
	tempo?: number; // whole-take speed factor (pitch kept), e.g. 1.15
	style?: 'v1' | 'v2' | 'v3' | 'v4' | 'v5' | 'v6'; // visual style; default v1. v3 = v2 + dust, rain, grade. v4 = v3 + silhouette cast, dark grade, minimal HUD. v5 = v3 sound/shots + redrawn chibi cast + perspective forest. v6 = v3 cast + v5-quality side forest
	rules?: {title: string; items: string[]}; // v2: the episode's rules, tracked across scenes
	handheld?: boolean; // constant handheld drift (default on for v3-v5; v6 episodes lock the camera)
	grain?: boolean; // animated film grain (default on for v2-v5; v6/v1-release off: it wrecks re-encoded uploads)
	mix?: {beds: string[]; duck?: number; bedVolume?: number; real?: boolean}; // real = recorded CC0 library (public/sfx/real) // v3 sound design: looping beds + auto foley
	scenes: Scene[];
	timing?: Record<string, SceneTiming>;
};
