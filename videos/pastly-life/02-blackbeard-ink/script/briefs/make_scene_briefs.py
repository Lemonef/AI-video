"""Write ep02 scene briefs + manifests from one spec table, all sharing the ONE old house style block (see STYLE).

Usage: python -I make_scene_briefs.py <spec-module-name>   (spec file next to this script, e.g. scenes_min1)
Plan-check files are written later, after the brief review (see stamp()).
"""
import importlib.util
import json
import pathlib
import sys

EP = 'videos/pastly-life/02-blackbeard-ink'
HERE = pathlib.Path(__file__).resolve().parent
REPO = HERE.parents[4]  # briefs -> script -> 02-blackbeard-ink -> pastly-life -> videos -> repo root
SHEETS = {'crew': f'{EP}/assets/ink/sheets/master_crew.png', 'bb': f'{EP}/assets/ink/sheets/master_bb.png',
          'bath': f'{EP}/assets/ink/sheets/master_bath.png'}
CAST = {
    'crew': 'CREWMAN: white round head with two black dot eyes, muted brick-red bandana, blue-and-white striped shirt, '
            'brown vest, tan knee-length trousers, small white hands, black shoes, thin black stick legs and stick-thin arms.',
    'bb': 'BLACKBEARD: white round head, wide toothy grin, thick angled eyebrows, huge black bushy beard with small red '
          'ribbons tied in it, black tricorn hat with gold trim and thin grey smoke wisps curling from under the brim, long '
          'black coat with gold buttons, red sash and red cuffs, brown bandolier across the chest, white gloves, black boots, '
          'thin stick legs.',
    'wig': 'WIG GENT: white round head, white powdered wig with a black ribbon, grey long coat with silver buttons, white '
           'cravat, thin stick legs, black shoes.',
    'merchant': 'MERCHANT: white round head, rosy cheeks, round body, brown tricorn, brown waistcoat over a cream shirt, '
                'thin stick legs.',
    'farmer': 'FARMER: white round head, straw hat, a wheat stalk in his mouth, green patched coat, tan trousers, brown boots.',
    'navy': 'NAVY SAILOR (no sheet; same stickman build as the crewman): white round head with black dot eyes, plain navy-blue '
            'short jacket, white shirt, white trousers, small round black hat, black shoes, thin stick legs.',
    'officer': 'NAVY OFFICER (no sheet; same stickman build): white round head with black dot eyes, dark navy-blue long coat '
               'with gold buttons and plain gold shoulder trim, black bicorne hat, white trousers, black boots, thin stick legs.',
}
SHEET_OF = {'crew': 'crew', 'bb': 'bb', 'wig': 'bath', 'merchant': 'bath', 'farmer': 'bath'}

# ONE house style = the OLD graded scenes (Zen 2026-11-22 20:55 FINAL: "I still like the old one more what maybe
# to just it some issue only with somescene"; 2026-11-23 "we already choose one style don't mix the other").
# Style core copied verbatim from the old scene briefs (e.g. ep02-scene-s06-bb-calm.md). The only changes are the
# faults Zen named on old s03 (glowing lantern light, wet shiny deck, glossy AI look, giant gloved hands): REDO/AVOID.
STYLE_REF = f'{EP}/assets/ink/scenes/s01_deck_party.png'  # old approved first scene (md5 6701cd0e), never a *_mid/_flat/_blend
STYLE = ('Hand-inked storybook illustration, thick charcoal outlines, soft cel shading, muted desaturated vintage '
         'palette (dusty blues, slate greys, worn browns, low saturation), paper-grain texture, same look as the '
         'approved first scene (copy its line, cel shading, paper grain and palette; ignore its lighting and any '
         'lantern glow). Keep to one muted colour family; the only strong accent is a small muted brick red '
         '(the bandanas or one single detail), no other saturated colour. Every character and object casts a soft '
         'contact shadow on the floor or deck it stands on.')
DEPTH = ('DEPTH: three clear layers. Foreground: one object close to camera, cut off by the frame edge and a little '
         'darker. Middle: the action. Background: far shore, sky or a vanishing point. Pack the set with small story '
         'props so it feels lived in, but leave calm empty space around the main subject.')
LIGHT_RULE = ('Every light source is small and dim, its light falls off fast into soft shadow; NO glow, NO bloom, NO '
              'halo or light rays around any lamp, candle or sun. Surfaces are dry and matte: no wet sheen, no shiny or '
              'reflective planks, no specular highlights. Every character is lit and shadowed by the same light as the '
              'place around them.')
REDO = ('any light glows, blooms, has a halo or rays; wet, shiny or reflective surfaces; glossy plastic shine or '
        'specular highlights; oversaturated orange or teal-and-orange grade; a look that does not match the STYLE MATCH '
        'image (line weight, grading, paper grain); giant hands or close-up gloves; realistic faces; a character not '
        'matching its sheet; characters pasted on (no shadow, white rim); any text, letters or numbers; wrong figure '
        'count; legs cropped; objects out of scale.')
AVOID = ('glowing bloom, light halos or rays, wet shine, glossy highlights, oversaturated orange, teal-and-orange grade, '
         'neon colours, everything evenly lit, giant hands, photoreal, 3D render, fog or mist, lens flare, motion blur, '
         'depth-of-field blur, smooth airbrush gradients, extra or melted limbs, text.')
PROTECTED = ['tools/**', 'engine/**', 'tests/**', 'docs/**', 'package.json', 'package-lock.json', 'tsconfig.json',
             'conftest.py', '**/conftest.py', 'pytest.ini', 'pyproject.toml', 'setup.cfg',
             f'{EP}/assets/ink/art_manifests/**', f'{EP}/assets/ink/sheets/**', f'{EP}/assets/ink/plates/**',
             f'{EP}/script/**', 'videos/pastly-life/01-eiffel-ink/**']


def brief(s):
    sid, out = f"ep02-scene-{s['id']}", f"{EP}/assets/ink/scenes/{s['id']}.png"
    manifest = f'{EP}/assets/ink/art_manifests/{sid}.json'
    sheets = sorted({SHEET_OF[c] for c, _ in s['cast'] if c in SHEET_OF})
    existing = sorted(p.name for p in (REPO / EP / 'assets/ink/scenes').glob('*.png'))
    data = {'id': sid, 'type': 'creative', 'risk': 'high', 'repo': 'D:/AI-video',
            'gates': [f'python -I tools/ink/check_art.py {manifest}'],
            'protected': PROTECTED + [f'{EP}/assets/ink/scenes/{n}' for n in existing],
            'context_files': [SHEETS[k] for k in sheets] + [STYLE_REF],
            'plan_check': f'{EP}/script/briefs/{sid}.plan_check.md'}
    refs = ''.join(f'- CHARACTER IDENTITY: `{SHEETS[k]}`. Copy the exact design: proportions, outline weight, colours, '
                   f'face style. Cartoon stickmen, never realistic people.\n' for k in sheets)
    refs += (f'- STYLE MATCH: `{STYLE_REF}` is the approved first scene. Match its line weight, colour grading and '
             'paper grain so all scenes cut together as one film (copy its look, not its lantern glow).')
    cast = '\n'.join(f'- {CAST[c]} Draw {n}.' for c, n in s['cast'])
    total = sum(n for _, n in s['cast'])
    body = f"""# Goal
New scene for ep02 (Blackbeard) {s['minute']}: {s['goal']} Same look as the approved first scene s01_deck_party.png (the old graded style): hand-inked storybook, thick charcoal outlines, soft cel shading, muted vintage palette, paper grain. Lights stay small and dim with no glow; surfaces dry and matte.

# Files
Work only inside the repo (D:/AI-video). Create ONLY this file (exact name): {out}. Do not edit any other file.

# Steps
Use your built-in image generation tool. Generate ONE image and SAVE it as PNG at the exact path (overwrite it on each redo). Pass these reference images to the image tool:
{refs}
Do NOT pass any other scene or plate image.

Then LOOK at your result and redo (up to 3 times) if ANY of these show: {REDO}

Characters (every human is one of these cartoon stickmen; exactly {total} figures):
{cast}

PROMPT:
{STYLE} {s['palette']} {LIGHT_RULE}
CAMERA: {s['camera']}
ACTION: {s['action']}
SET DETAIL (draw all of these, cleanly inked): {s['props']} Busy and lived-in but every object readable.
{DEPTH}
SCALE: {s['scale']} Wide 16:9 landscape, 1920x1080 or the closest 16:9 size you can output (never below 1500 px wide).

AVOID (keep short): {AVOID}

HARD RULES: exactly {total} figures as described, no other figures (no distant figures or silhouettes on shore, in the rigging or in the shadows); NO text, NO letters, NO numbers, NO logos, NO readable signs or writing on any paper; no watermarks; no white outline/halo around characters.

# Done when
The file exists and `python -I tools/ink/check_art.py {manifest}` prints OK. Report: what the image shows, the redo-list check, how the characters match the sheet/description, and any weak areas.
"""
    (HERE / f'{sid}.md').write_text('---json\n' + json.dumps(data) + '\n---\n' + body, encoding='utf-8')
    (REPO / manifest).write_text(json.dumps({'kind': 'plates', 'files': [out]}) + '\n', encoding='utf-8')
    return sid


def stamp(sid, notes):
    """Write the plan-check after the brief review: hash of the final brief + applied notes + PASS."""
    sys.path.insert(0, 'D:/second-brain/tools')
    from pipeline.brief import plan_check_hash
    bp = HERE / f'{sid}.md'
    (HERE / f'{sid}.plan_check.md').write_text(
        f'# Plan check: {sid}\nbrief-sha256: {plan_check_hash(bp)}\n\n{notes}\n\nVERDICT: PASS\n', encoding='utf-8')


if __name__ == '__main__':
    spec = importlib.util.spec_from_file_location('spec', HERE / f'{sys.argv[1]}.py')
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    ids = [brief(s) for s in mod.SCENES]
    if len(sys.argv) > 2 and sys.argv[2] == '--stamp':
        for sid in ids:
            stamp(sid, mod.NOTES)
    print('\n'.join(ids))
