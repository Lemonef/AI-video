"""Spike: render the shot-2 lead as Blender Grease Pencil v3 instead of the IK SVG.

Same keys, same rig geometry as LeadPerformance.tsx (parsed from it, not copied),
so a gate difference measures the renderer only: GP stroke/fill raster vs Chrome SVG.

  blender -b --factory-startup --python scripts/spikes/gp_shot2.py

Writes public/reference-study/gp-shot2/NNNNN.png (1080x1920 RGBA, gitignored).
Composition picks them up when REMOTION_GP_SHOT2=1.
"""
import math
import re
from pathlib import Path

import bpy

REPO = Path(__file__).resolve().parents[2]
TSX = REPO/'src/compositions/ReferenceStudy/LeadPerformance.tsx'
OUT = REPO/'public/reference-study/gp-shot2'
UNIT = 4                       # LeadPerformance draws in the 270x480 plane under scale(4)
W, H = 270*UNIT, 480*UNIT
SHOT, START, END = 2, 59, 111  # shot-review.json shot 2 (end exclusive)
CURVE_STEPS = 16               # samples per quadratic segment
ELLIPSE_STEPS = 48
NAMES = ['h', 'hip', 'lk', 'la', 'rk', 'ra', 'le', 'lw', 're', 'rw']


def keys():
    block = re.search(r'const shot2:Key\[\]=\[(.*?)\n\];', TSX.read_text(encoding='utf-8'), re.S).group(1)
    out = []
    for row in re.findall(r'\{(.*?)\}', block):
        k = {'f': int(re.search(r'f:(\d+)', row).group(1)), 'r': float(re.search(r'\br:([\d.]+)', row).group(1))}
        for n in NAMES:
            k[n] = [float(v) for v in re.search(rf'\b{n}:\[([\d.]+),([\d.]+)\]', row).groups()]
        out.append(k)
    return out


def at(ks, f):
    """Same as LeadPerformance `at`: linear between the bracketing keys, clamped."""
    a = next((k for k in reversed(ks) if k['f'] <= f), ks[0])
    b = next((k for k in ks if k['f'] >= f), ks[-1])
    t = 0 if a['f'] == b['f'] else (f - a['f'])/(b['f'] - a['f'])
    k = {'r': a['r'] + (b['r'] - a['r'])*t}
    for n in NAMES:
        k[n] = [a[n][i] + (b[n][i] - a[n][i])*t for i in (0, 1)]
    return k


def quad(p0, c, p1):
    return [((1-t)**2*p0[0] + 2*(1-t)*t*c[0] + t*t*p1[0], (1-t)**2*p0[1] + 2*(1-t)*t*c[1] + t*t*p1[1])
            for t in (i/CURVE_STEPS for i in range(1, CURVE_STEPS + 1))]


def ellipse(cx, cy, rx, ry):
    return [(cx + rx*math.cos(2*math.pi*i/ELLIPSE_STEPS), cy + ry*math.sin(2*math.pi*i/ELLIPSE_STEPS))
            for i in range(ELLIPSE_STEPS)]


def srgb(hexcol, alpha=1.0):
    lin = lambda c: c/12.92 if c <= .04045 else ((c + .055)/1.055)**2.4
    return (*(lin(int(hexcol[i:i+2], 16)/255) for i in (1, 3, 5)), alpha)


MATS = {}


def material(gp, hexcol, fill, alpha=1.0):
    name = f'{hexcol}-{"f" if fill else "s"}-{alpha}'
    if name not in MATS:
        m = bpy.data.materials.new(name)
        bpy.data.materials.create_gpencil_data(m)
        g = m.grease_pencil
        g.show_stroke, g.show_fill = not fill, fill
        (g.__setattr__('fill_color', srgb(hexcol, alpha)) if fill else g.__setattr__('color', srgb(hexcol, alpha)))
        gp.materials.append(m)
        MATS[name] = len(gp.materials) - 1
    return MATS[name]


def rig(k):
    """Shapes in paint order: (points in study units, hex, fill?, width in study units, alpha)."""
    x, y = k['h']
    s = k['r']/30
    sh = (x - 4*s, y + 40*s)
    hip = k['hip']
    shapes = [(ellipse((k['la'][0] + k['ra'][0])/2, max(k['la'][1], k['ra'][1]) + 5*s, 32*s, 5*s), '#2e3028', True, 0, .25)]
    for knee, ankle, col, side in ((k['lk'], k['la'], '#99936a', -1), (k['rk'], k['ra'], '#aaa277', 1)):
        shapes.append(([(hip[0] + side*3*s, hip[1]), knee, ankle], col, False, 9*s, 1))
        shapes.append((ellipse(ankle[0] + 2*s, ankle[1] + 1*s, 8*s, 3.4*s), '#303a36', True, 0, 1))
    shapes.append(([(sh[0] - 3*s, sh[1]), k['le'], k['lw']], '#2e6645', False, 8*s, 1))
    torso = [(sh[0] - 4*s, sh[1] - 2*s), *quad((sh[0] - 4*s, sh[1] - 2*s), (sh[0] - 6*s, sh[1] - 5*s), (sh[0] - 5.5*s, sh[1] + 7*s)),
             (hip[0] - 9*s, hip[1] - 13*s), (hip[0] + 6*s, hip[1] - 13*s), (sh[0] + 5*s, sh[1] + 2*s)]
    shapes.append((torso, '#3a7951', True, 0, 1))
    shapes.append(([(sh[0] + 3*s, sh[1] + 10*s), (hip[0] + 7*s, hip[1] + 3*s), (hip[0] - 4*s, hip[1] + 3*s), (sh[0] - 3*s, sh[1] + 12*s)], '#1c343a', True, 0, 1))
    shapes.append(([(sh[0] + 2*s, sh[1]), k['re'], k['rw']], '#3e8055', False, 8*s, 1))
    head = lambda pts: [(x + px*s, y + py*s) for px, py in pts]
    # radial face gradient (.4 #eeece1 -> 1 #dfddcf) flattened to its area-weighted mean: spike keeps fills solid
    shapes.append((head(ellipse(0, 0, 30, 30)), '#e3e1d4', True, 0, 1))
    cap = [(-30, -5), *quad((-30, -5), (-29, -33), (0, -35)), *quad((0, -35), (25, -35), (30, -7)), (31, -4), *quad((31, -4), (1, -3), (-30, -5))]
    shapes.append((head(cap), '#2f7048', True, 0, 1))
    shapes.append((head([(13, -6), (44, -2), (43, 1), (12, -1)]), '#285e3f', True, 0, 1))
    shapes.append((head(ellipse(0, -35, 2.1, 2.1)), '#2d593d', True, 0, 1))
    for ex in (8, 19):
        shapes.append((head(ellipse(ex, 5, 3, 4.2)), '#181e18', True, 0, 1))
    shapes.append((head([(0, -4), (10, 0)]), '#22271d', False, 2*s, 1))
    shapes.append((head([(17, 0), (24, -3)]), '#22271d', False, 2*s, 1))
    shapes.append((head([(9, 21), (18, 20)]), '#23291f', False, 2*s, 1))
    return shapes


def main():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc = bpy.context.scene
    gp = bpy.data.grease_pencils.new('lead')
    ob = bpy.data.objects.new('lead', gp)
    sc.collection.objects.link(ob)
    layer = gp.layers.new('rig')
    layer.use_lights = False   # flat cartoon colours; an empty scene would otherwise light every stroke black
    ks = keys()
    for f in range(START, END):
        d = layer.frames.new(f).drawing
        shapes = rig(at(ks, f))
        d.add_strokes([len(p) for p, *_ in shapes])
        for i, (stroke, (pts, col, fill, width, alpha)) in enumerate(zip(d.strokes, shapes)):
            stroke.material_index = material(gp, col, fill, alpha)
            stroke.cyclic = fill
            # Blender 5.2 ignores the material show_fill/show_stroke flags (deprecated): a fill is
            # a per-stroke fill_id, and the outline is hidden per stroke.
            stroke.fill_id, stroke.hide_stroke = (i + 1, True) if fill else (0, False)
            for pt, (px, py) in zip(stroke.points, pts):
                pt.position = (px*UNIT, 0, -py*UNIT)   # image y down -> world z up
                pt.radius = max(width*UNIT/2, .01)     # radius = half the SVG strokeWidth, world units = px
        d.tag_positions_changed()   # fills are triangulated from cached positions

    cam = bpy.data.objects.new('cam', bpy.data.cameras.new('cam'))
    cam.data.type, cam.data.ortho_scale = 'ORTHO', H
    cam.location, cam.rotation_euler = (W/2, -100, -H/2), (math.pi/2, 0, 0)
    sc.collection.objects.link(cam)
    sc.camera = cam
    r = sc.render
    r.engine = 'BLENDER_EEVEE'
    r.resolution_x, r.resolution_y, r.resolution_percentage = W, H, 100
    r.film_transparent = True
    r.image_settings.file_format, r.image_settings.color_mode = 'PNG', 'RGBA'
    sc.view_settings.view_transform, sc.view_settings.look = 'Standard', 'None'
    OUT.mkdir(parents=True, exist_ok=True)
    for f in range(START, END):
        sc.frame_set(f)
        r.filepath = str(OUT/f'{f:05d}.png')
        bpy.ops.render.render(write_still=True)


main()
