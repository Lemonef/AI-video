# ep02 set bible + framing plan

Purpose: every integrated scene brief pastes the SHIP SCALE block verbatim and names its framing in the
first prompt sentence, so the ship never changes size and no two scenes in a row share a camera.
Scale anchor: `assets/ink/scenes/s01_deck_party.png` (approved).

## SHIP SCALE (paste verbatim)
SHIP SCALE (same ship in every shot, match s01): a small one-mast sloop about 12 figures long; the rail
top sits at a standing figure's waist; the deck is about 5 figures wide; the mast is about 4 figures tall
to the yard; a lantern is head-sized; barrels reach from hip to chest. The hold is low (a standing figure
stoops, head near the beams) and short (about 4 figures long), crates stacked to the beams. Never a giant
galleon deck, never a long tunnel hold.

## LIGHTING (paste verbatim, Zen 2026-11-22 "why lighting so saturate")
Realistic night. Main light = cool, pale, diffused moonlight. Lanterns = small, dim, muted amber points, light falls off fast into shadow, never a big warm wash. Most of the frame in soft shadow, detail kept in the darks. AVOID: oversaturated orange, teal-and-orange grade, glowing bloom, neon, stylized color grading, everything evenly lit.
Target mean HSV saturation <= 0.35 (Beanie 0.235, Ink 0.242; ep01 0.299; v2 scenes measured 0.42-0.64). Post grade for merged scenes: colour x0.45, gamma 1.15, R x0.94 B x1.04 (test D:/AI-video/.tmp/scenes/light_test.jpg).

## DEPTH + DETAIL (paste verbatim, Zen 2026-11-22 7 reference stills)
DEPTH: three clear layers. Foreground: one object close to camera, cut off by the frame edge and a little darker. Middle: the action. Background: far shore, sky or a vanishing point. Pack the set with small story props (coiled rope, buckets, nets, crates, a lantern hook, a tankard) so it feels lived in, but leave calm empty space around the main subject. Characters may be small, turned away or cropped. Keep to one muted colour family; the only strong accent is a small red (bandana or a single detail). Every character and object casts a soft contact shadow on the planks.
Each scene brief names its own foreground element (see the FG list in the rebrief). Check by eye: a cropped near layer is present.

## Framing plan (minute 1)
| Scene | Framing | Location |
|---|---|---|
| s01 | wide, deck party (kept) | deck |
| s02 | wide exterior, shore lookout (kept) | shore |
| s03 | hands insert: crew hands hauling rope + scrub brush | deck close |
| s04 | medium, hold cower (kept) | hold |
| s05 | silhouette of a crewman at the rail vs moonlit water | rail |
| s06 | low-angle medium: Blackbeard on a barrel, 2 crew small behind | deck |
| s07 | EXTERIOR: sloop seen from the water, tiny toasting figures (scale anchor) | outside view |
| s08 | tight face close-up: Blackbeard + wig gent whispering | deck close |
| s09 | top-down through the hatch into the low hold, 2 crew carry a crate | hold |
| s10 | over-shoulder from behind Blackbeard looking over the deck | deck |
| s11 | spyglass POV circle across the inlet, edge of a gloved hand | outside view |

Wides: s01, s02, s07 (3 of 11). Check before merge: figure-to-rail and figure-to-mast against s01 on the
contact grid.
