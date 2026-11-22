import type {IconName} from './icons';
export type Color = 'orange' | 'red' | 'green' | 'teal';
type Position = {x: number; y: number};
type Entry = {at?: number};
export type SpriteEl = Position & Entry & {t: 'sprite'; src: string; h: number; flip?: boolean; x2?: number};
export type WordsEl = Position & Entry & {t: 'words'; text: string; size: number; color?: Color};
export type UnderlineEl = Position & Entry & {t: 'underline'; w: number};
export type StampEl = Position & Entry & {t: 'stamp'; text: string; rot: number; color: Color};
export type TowerEl = Position & {t: 'tower'; h: number; build?: [number, number]; cut?: [number, number]};
// Cross: square `size` box by default; w/h (when set) fit it to the word it strikes so stacked rows never overlap.
export type CrossEl = Position & Entry & {t: 'cross'; size: number; w?: number; h?: number};
export type TicketEl = Position & Entry & {t: 'ticket'; w: number; text: string};
export type TagEl = Position & Entry & {t: 'tag'; text: string};
export type PhotoEl = Position & Entry & {t: 'photo'; src: string; w: number; rot: number; frame: 'polaroid'; label: string};
export type RedactEl = Position & Entry & {t: 'redact'; w: number; h: number};
export type TickEl = Position & Entry & {t: 'tick'};
// Red hand circle round a detail (a photo, a word): ellipse w x h centred on x,y, drawn on in one overshooting stroke.
export type CircleEl = Position & Entry & {t: 'circle'; w: number; h: number};
export type TimelineEl = {t: 'timeline'; x1: number; x2: number; y: number; left: string; right: string; at: number; bracket: string; bracketAt: number};
export type ChimneyEl = Position & {t: 'chimney'; h: number; at: number; done: number};
export type RadioEl = Position & Entry & {t: 'radio'};
// Chart: bars grow from a shared baseline at y, spread across w centred on x; tallest value = h px. Bar i starts at `at + i*step`.
export type BarsEl = Position & {t: 'bars'; w: number; h: number; at: number; step: number; items: {label: string; value: number; text: string; color?: Color}[]};
// Diagram: boxes left-to-right centred on x, joined by arrows; box i appears at `at + i*step`. Box width = w, gap between boxes = gap.
export type FlowEl = Position & {t: 'flow'; w: number; gap: number; at: number; step: number; items: string[]; color?: Color};
export type IconEl = Position & Entry & {t: 'icon'; name: IconName; size: number; color?: Color; rot?: number; from?: [number, number, number]};
export type CountEl = Position & {t: 'count'; w: number; icon: IconName; n: number; at: number; step: number; label?: string; color?: Color};
export type Side = {icon: IconName; label: string; color?: Color};
export type SlotIcon = {icon: IconName; label?: string; color?: Color};
export type SplitEl = {t: 'split'; at: number; step: number; left: Side; right: Side; vs?: string};
export type TransformEl = {t: 'transform'; a: SlotIcon; b: SlotIcon; label?: string; at: number; step: number};
export type ScaleEl = {t: 'scale'; left: SlotIcon; right: SlotIcon; heavy: 'left' | 'right'; label?: string; at: number; dur: number};
export type RingEl = {t: 'ring'; x: number; y: number; r: number; icon: IconName; n: number; at: number; step: number; odd: {icon?: IconName; angle: number; label?: string}; label?: string};
export type HeroEl = Position & {t: 'hero'; icon: IconName; size: number; label: string; at: number; color?: Color; burst?: boolean; from?: [number, number, number]};
export type CrossoutEl = Position & {t: 'crossout'; icon: IconName; size: number; label?: string; at: number; crossAt: number};
export type ChecklistEl = Position & {t: 'checklist'; w: number; at: number; step: number; rows: {text: string; mark: 'tick' | 'cross' | 'none'}[]};
export type QuoteEl = Position & {t: 'quote'; w: number; text: string; who?: string; at: number};
export type BignumEl = Position & {t: 'bignum'; value: number; prefix?: string; suffix?: string; group?: boolean /* false = no thousands separator (years) */; label: string; at: number; dur: number; color?: Color};
export type DocEl = {t: 'doc'; x: number; y: number; w: number; h: number; kind: 'card' | 'memo' | 'certificate'; title: string; lines: string[]; at: number; step: number; rot?: number; mark?: {line: number; style: 'circle' | 'underline'}; redact?: number[]; stamp?: string};
export type MapEl = {t: 'map'; region: 'europe' | 'atlantic'; from: {x: number; y: number; label: string}; to: {x: number; y: number; label: string}; at: number; dur: number; label?: string};
export type GridEl = {t: 'grid'; x: number; y: number; w: number; icon: IconName; cols: number; rows: number; odd: {index: number; icon: IconName}; at: number; step: number; label?: string};
export type El = SpriteEl | WordsEl | UnderlineEl | StampEl | TowerEl | CrossEl | TicketEl | TagEl | PhotoEl | RedactEl | TickEl | CircleEl | TimelineEl | ChimneyEl | RadioEl | BarsEl | FlowEl | IconEl | CountEl | SplitEl | HeroEl | CrossoutEl | ChecklistEl | QuoteEl | BignumEl | DocEl | MapEl | TransformEl | ScaleEl | RingEl | GridEl;
export type Background = {plate: string; zoom: [number, number]; origin?: string} | {photo: string; push: [number, number]; origin?: string; pos?: string} | {card: true};
// Virtual camera over the whole shot (background + elements): [scale, focusX, focusY] in 1920x1080 stage px.
// The focus point is held at frame centre (clamped so the stage always covers the frame), eased from -> to
// across `span` (fraction of the shot, default 1). Shots without `cam` render exactly as before.
export type Cam = {from: [number, number, number]; to: [number, number, number]; span?: number};
export type Shot = {f0: number; f1: number; bg: Background; cam?: Cam; chip?: string; chipAt?: number; chipPos?: 'tl' | 'bl'; els: El[]};
export type Part = {_doc?: string; part: string; f0: number; f1: number; shots: Shot[]};
