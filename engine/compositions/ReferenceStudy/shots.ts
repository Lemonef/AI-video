// Cut frames measured from the supplied reference at 30 fps; private visual study only.
export const STUDY_FPS = 30;
export const STUDY_FRAMES = 2799;
export type Stage = 'exterior' | 'aisle' | 'counter' | 'radio' | 'phone' | 'door' | 'parking' | 'map' | 'control' | 'mechanism' | 'chain' | 'gap' | 'dark' | 'end';
export type StudyShot = {id: number; start: number; end: number; stage: Stage; label: string; zoom: [number,number]; focus: [number,number]};
const INPUT: Array<{start: number; stage: Stage; label: string; zoom: [number,number]; focus: [number,number]}> = [
    {"start": 0, "stage": "exterior", "label": "Exterior wide", "zoom": [1, 1.04], "focus": [540, 960]},
    {"start": 59, "stage": "exterior", "label": "Push toward store", "zoom": [1.34, 1.45], "focus": [540, 1080]},
    {"start": 111, "stage": "aisle", "label": "Aisle depth", "zoom": [1, 1.04], "focus": [540, 960]},
    {"start": 173, "stage": "counter", "label": "Counter medium", "zoom": [1, 1.02], "focus": [540, 960]},
    {"start": 228, "stage": "counter", "label": "Face reaction", "zoom": [1.25, 1.32], "focus": [630, 980]},
    {"start": 279, "stage": "radio", "label": "Counter prop insert", "zoom": [1, 1.06], "focus": [540, 960]},
    {"start": 314, "stage": "counter", "label": "Alert reaction close", "zoom": [1.8, 1.85], "focus": [650, 920]},
    {"start": 330, "stage": "phone", "label": "Phone insert to city view", "zoom": [1.18, 1.2], "focus": [540, 960]},
    {"start": 450, "stage": "counter", "label": "Calm warning reaction", "zoom": [1.55, 1.6], "focus": [650, 940]},
    {"start": 537, "stage": "door", "label": "Move toward entrance", "zoom": [1, 1.02], "focus": [540, 960]},
    {"start": 596, "stage": "parking", "label": "Through-glass point of view", "zoom": [1, 1.03], "focus": [540, 960]},
    {"start": 674, "stage": "parking", "label": "Threats in parking lot", "zoom": [1.25, 1.3], "focus": [540, 1120]},
    {"start": 746, "stage": "door", "label": "Full-body hesitation", "zoom": [1, 1.03], "focus": [540, 960]},
    {"start": 789, "stage": "door", "label": "Prop-led decision beat", "zoom": [1.12, 1.16], "focus": [470, 1100]},
    {"start": 852, "stage": "door", "label": "Close warning reaction", "zoom": [1.3, 1.34], "focus": [420, 1080]},
    {"start": 971, "stage": "map", "label": "Overhead parking view", "zoom": [1.35, 1.4], "focus": [540, 1660]},
    {"start": 1035, "stage": "map", "label": "Overhead spatial explanation", "zoom": [1.05, 1.07], "focus": [540, 960]},
    {"start": 1421, "stage": "exterior", "label": "Return outside with timer", "zoom": [1.1, 1.14], "focus": [540, 1100]},
    {"start": 1479, "stage": "aisle", "label": "Bright interior contrast", "zoom": [1, 1.04], "focus": [540, 960]},
    {"start": 1526, "stage": "parking", "label": "Return to the threats", "zoom": [1.25, 1.28], "focus": [540, 1080]},
    {"start": 1565, "stage": "control", "label": "Hand presses control", "zoom": [1, 1.03], "focus": [540, 960]},
    {"start": 1605, "stage": "door", "label": "Shutter begins to fall", "zoom": [1, 1.04], "focus": [540, 960]},
    {"start": 1692, "stage": "mechanism", "label": "Explain the mechanism", "zoom": [1, 1.03], "focus": [540, 960]},
    {"start": 1799, "stage": "chain", "label": "Manual action and counter", "zoom": [1, 1.03], "focus": [540, 960]},
    {"start": 1886, "stage": "gap", "label": "Low insert under shutter", "zoom": [1, 1.05], "focus": [540, 1150]},
    {"start": 1962, "stage": "chain", "label": "Last movement", "zoom": [1.02, 1.05], "focus": [540, 960]},
    {"start": 2002, "stage": "door", "label": "Closed barrier, full body", "zoom": [1.02, 1.04], "focus": [540, 960]},
    {"start": 2037, "stage": "door", "label": "Hold on the consequence", "zoom": [1.03, 1.05], "focus": [540, 960]},
    {"start": 2151, "stage": "aisle", "label": "Lights go down", "zoom": [1.02, 1.05], "focus": [540, 960]},
    {"start": 2255, "stage": "dark", "label": "Darkness and information card", "zoom": [1.04, 1.06], "focus": [540, 1000]},
    {"start": 2328, "stage": "dark", "label": "Flashlight medium", "zoom": [1.25, 1.32], "focus": [470, 1180]},
    {"start": 2424, "stage": "radio", "label": "Isolate the radio", "zoom": [1, 1.08], "focus": [540, 960]},
    {"start": 2517, "stage": "dark", "label": "Face close-up in darkness", "zoom": [2.7, 2.8], "focus": [470, 1180]},
    {"start": 2577, "stage": "radio", "label": "Final prop emphasis", "zoom": [1.7, 1.8], "focus": [660, 1000]},
    {"start": 2704, "stage": "end", "label": "Private study end card", "zoom": [1, 1], "focus": [540, 960]},
 ];
export const STUDY_SHOTS: StudyShot[] = INPUT.map((shot,index) => ({...shot,id:index+1,end:INPUT[index+1]?.start ?? STUDY_FRAMES}));
export const shotAt = (frame: number): StudyShot => STUDY_SHOTS.find(shot => frame >= shot.start && frame < shot.end) ?? STUDY_SHOTS[STUDY_SHOTS.length-1];
