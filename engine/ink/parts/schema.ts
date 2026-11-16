export type Color = 'orange' | 'red' | 'green' | 'teal';
type Position = {x: number; y: number};
type Entry = {at?: number};
export type SpriteEl = Position & Entry & {t: 'sprite'; src: string; h: number; flip?: boolean; x2?: number};
export type WordsEl = Position & Entry & {t: 'words'; text: string; size: number; color?: Color};
export type UnderlineEl = Position & Entry & {t: 'underline'; w: number};
export type StampEl = Position & Entry & {t: 'stamp'; text: string; rot: number; color: Color};
export type TowerEl = Position & {t: 'tower'; h: number; build?: [number, number]; cut?: [number, number]};
export type CrossEl = Position & Entry & {t: 'cross'; size: number};
export type TicketEl = Position & Entry & {t: 'ticket'; w: number; text: string};
export type TagEl = Position & Entry & {t: 'tag'; text: string};
export type PhotoEl = Position & Entry & {t: 'photo'; src: string; w: number; rot: number; frame: 'polaroid'; label: string};
export type RedactEl = Position & Entry & {t: 'redact'; w: number; h: number};
export type TickEl = Position & Entry & {t: 'tick'};
export type TimelineEl = {t: 'timeline'; x1: number; x2: number; y: number; left: string; right: string; at: number; bracket: string; bracketAt: number};
export type ChimneyEl = Position & {t: 'chimney'; h: number; at: number; done: number};
export type RadioEl = Position & Entry & {t: 'radio'};
export type El = SpriteEl | WordsEl | UnderlineEl | StampEl | TowerEl | CrossEl | TicketEl | TagEl | PhotoEl | RedactEl | TickEl | TimelineEl | ChimneyEl | RadioEl;
export type Background = {plate: string; zoom: [number, number]; origin?: string} | {photo: string; push: [number, number]; origin?: string; pos?: string} | {card: true};
// Virtual camera over the whole shot (background + elements): [scale, focusX, focusY] in 1920x1080 stage px.
// The focus point is held at frame centre (clamped so the stage always covers the frame), eased from -> to
// across `span` (fraction of the shot, default 1). Shots without `cam` render exactly as before.
export type Cam = {from: [number, number, number]; to: [number, number, number]; span?: number};
export type Shot = {f0: number; f1: number; bg: Background; cam?: Cam; chip?: string; chipAt?: number; els: El[]};
export type Part = {_doc?: string; part: string; f0: number; f1: number; shots: Shot[]};
