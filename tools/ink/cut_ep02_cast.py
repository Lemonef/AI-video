"""Cut the three ep02 master sheets into named cast sprites.

Runs tools/ink/cut_sprites.py --key white on each master sheet (cells come back p1..pN in
row-major order), then renames each cell to its pose name below and writes
assets/ink/cast/<sheet>.order.json (pose name per cell) so a re-cut can be checked by eye.

Cell order was read off the sheets (2026-11-22); see tests/test_cut_sprites_white.py for counts.
Run: python tools/ink/cut_ep02_cast.py
"""
import json
import pathlib
import shutil
import subprocess
import sys
import tempfile

ROOT = pathlib.Path(__file__).resolve().parents[2]
INK = ROOT / 'videos/pastly-life/02-blackbeard-ink/assets/ink'
CUT = ROOT / 'tools/ink/cut_sprites.py'

TURN3 = ['turn_front', 'turn_34', 'turn_profile']
TURN6 = TURN3 + ['turn_34back', 'turn_back', 'turn_profile_l']
BB_EXP = ['angry_grin', 'grin', 'laugh', 'surprised', 'shout', 'smirk', 'thinking', 'wink_laugh',
          'sweat_worried', 'sad', 'scared_tear', 'deadpan']
CREW_EXP = ['neutral', 'worried', 'sweat', 'surprised', 'scared', 'grin', 'laugh', 'oh',
            'thinking', 'sad', 'angry', 'deadpan']  # read off contact sheet 2026-11-22
BATH_BAND = TURN3 + ['stand', 'walk', 'laugh', 'toast', 'whisper', 'shocked',
                     'neutral', 'laughing', 'worried', 'sly']

SHEETS = {
    'master_bb': ['bb_' + n for n in TURN6 + [
        'stand', 'hands_hips', 'laugh', 'raise_tankard', 'drink', 'walk', 'walk2', 'run',
        'sit_barrel', 'lean_rail', 'arms_crossed', 'cutlass', 'hand_hilt', 'arms_wide', 'whisper', 'shush',
        'shrug', 'dig', 'hold_sack', 'fist_up', 'crouch', 'kneel_hurt', 'top', 'worm']]
                  + ['bb_exp_' + n for n in BB_EXP],
    'master_crew': ['crew_' + n for n in TURN6 + [
        'stand', 'hug_self', 'walk', 'run', 'scrub', 'haul_rope', 'carry_crate', 'push_barrel',
        'climb', 'sit_knees', 'sit_drink', 'laugh',
        'point', 'spyglass', 'cower', 'hide_barrel', 'scared', 'thinking', 'shrug', 'wave',
        'lantern', 'cheer', 'top', 'worm']]
                    + ['crew_exp_' + n for n in CREW_EXP],
    'master_bath': [f'bath_{who}_{n}' for who in ('gent', 'merchant', 'farmer') for n in BATH_BAND],
}


def main():
    out = INK / 'cast'
    out.mkdir(exist_ok=True)
    for sheet, names in SHEETS.items():
        assert len(names) == len(set(names)), f'{sheet}: duplicate pose names'
        with tempfile.TemporaryDirectory() as tmp:
            r = subprocess.run([sys.executable, '-I', str(CUT), str(INK / 'sheets' / f'{sheet}.png'), tmp, 'p',
                                str(len(names)), '--key', 'white'],
                               stdin=subprocess.DEVNULL, capture_output=True, text=True)  # see test _cut
            if r.returncode or 'WARN' in r.stdout:
                raise SystemExit(f'{sheet}: cut failed\n{r.stdout}\n{r.stderr}')
            for k, name in enumerate(names, 1):
                shutil.copyfile(pathlib.Path(tmp) / f'p{k}.png', out / f'{name}.png')
        (out / f'{sheet}.order.json').write_text(json.dumps(names, indent=1), encoding='utf-8')
        print(f'OK {sheet}: {len(names)} sprites')


if __name__ == '__main__':
    main()
