import {C} from '../lib/tokens';

export type Hair = 'mochi' | 'bob' | 'curly' | 'bald' | 'spiky' | 'bun' | 'cap';

export type Look = {
	name: string;
	skin: string;
	hair: Hair;
	hairColor: string;
	shirt: string;
	pants: string;
	extras?: Array<'lanyard' | 'glasses' | 'mustache' | 'tie' | 'apron' | 'earring'>;
	headScale?: number;
};

/**
 * The recurring cast. Add a character = add an entry; episodes reference it by key.
 *
 * MOCHI (โมจิ) — the series lead. 24, Bangkok office worker, chronic overthinker whose
 * thoughts are always one step from leaking out. Mint-teal shirt, staff lanyard, a single
 * stubborn hair curl that sticks up when he panics. Every scenario happens TO Mochi.
 */
export const CAST: Record<string, Look> = {
	mochi: {name: 'โมจิ', skin: C.skin, hair: 'mochi', hairColor: C.hairDark, shirt: C.teal, pants: C.ink, extras: ['lanyard']},
	auntie: {name: 'ป้าข้างห้อง', skin: C.skinTan, hair: 'curly', hairColor: C.hairGrey, shirt: C.lilac, pants: C.lilacDark, extras: ['earring']},
	uncle: {name: 'ลุงทุเรียน', skin: C.skinDeep, hair: 'cap', hairColor: C.coral, shirt: C.sun, pants: C.hairBrown},
	boss: {name: 'หัวหน้า', skin: C.skin, hair: 'bald', hairColor: C.hairDark, shirt: C.white, pants: C.ink, extras: ['glasses', 'mustache', 'tie'], headScale: 1.05},
	girl: {name: 'ผู้โดยสาร', skin: C.skinTan, hair: 'bob', hairColor: C.hairBrown, shirt: C.coral, pants: C.ink},
	student: {name: 'นักศึกษา', skin: C.skin, hair: 'spiky', hairColor: C.hairDark, shirt: C.white, pants: C.ink},
	office: {name: 'พนักงาน', skin: C.skinTan, hair: 'bun', hairColor: C.hairDark, shirt: C.sky, pants: C.ink},
};
