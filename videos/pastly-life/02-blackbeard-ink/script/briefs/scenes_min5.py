"""Minute index 5 (b42-b50) fresh scenes. Story per beat: see tools/ink/ep02_full_shots.py comments.
Every plate here replaces a minute-1 scene (s01-s11) that was being recycled. Each fresh plate serves two
beats of THIS minute with different camera moves (pairs listed in 'minute'). b49 has no plate of its own.
Min1 review lessons applied (no birds, few props, exact figure counts, flags furled)."""
NOTES = 'Min1 review lessons applied up front (no birds, props cut, counts exact, flags furled). See scenes_min5_review.md.'
SCENES = [
    {'id': 'm5a_cut_anchor', 'minute': 'minute 6 (b42: maybe he never killed anyone, slow pan; b43: cut the anchor, push in; text on the right)',
     'goal': 'dawn on Blackbeard\'s small sloop: a crewman chops the anchor cable with an axe at the bow so the boat can '
             'run, while Blackbeard stands calmly at the tiller, more thoughtful than bloodthirsty.',
     'cast': [('bb', 1), ('crew', 3)],
     'palette': 'Grey misty dawn: pale dusty blue-grey sky and mist, slate-grey water, worn brown wood; soft diffused light, no sunbeams, no glow, gentle soft shadows.',
     'camera': 'LOW view at the bow, camera at deck height beside the anchor cable, looking back along the deck toward the stern. FOREGROUND = the thick anchor rope over the bow rail with the axe blade biting into it, cut by the bottom-left edge (the crewman swinging it seen full-figure just behind, normal-size hands); MIDDLE = the other two crewmen hauling a line and bracing at the rail; BACK = Blackbeard small at the tiller at the stern, misty inlet behind, two faint grey sails far off in the mist. Keep the right third calmer for text.',
     'action': 'Blackbeard holds the tiller with one hand, looking ahead with a calm, almost thoughtful face. At the bow '
               'one crewman swings an axe down onto the thick anchor rope, the rope fraying. One crewman hauls on a line '
               'to raise the sail, one crewman holds the rail bracing for the jolt. Staggered at different depths.',
     'props': 'the small one-mast sloop deck, a tiller, a thick anchor rope over the bow, an axe, a half-raised sail, '
              'rigging, a coil of rope, mist on the water, two faint distant sails. No birds. All flags furled tight.',
     'scale': 'the sloop only about four men long; rail at a standing man\'s waist; axe about arm length.'},
    {'id': 'm5b_both_stuck', 'minute': 'minute 6 (b44: the sandbar, and so are they, slow pan; b45: the navy dumps ballast and water barrels, pull back)',
     'goal': 'shallow inlet: a navy sloop stuck on a pale sandbar, its sailors heaving water barrels and ballast stones '
             'overboard to float free, while Blackbeard\'s sloop sits stuck on another sandbar in the background.',
     'cast': [('officer', 1), ('navy', 4), ('bb', 1)],
     'palette': 'Grey overcast morning: dusty slate sky, shallow grey-green water over pale sand, worn brown wood; soft diffused daylight, gentle soft shadows, matte water, no shine.',
     'camera': "BIRD'S-EYE high view from far above the shallow inlet, looking down at an angle like a map: pale sandbars and channels in grey-green water. MIDDLE = the navy sloop stuck on one sandbar, larger, its sailors tiny but readable from above; BACK-RIGHT = Blackbeard's smaller sloop stuck on another sandbar, Blackbeard a tiny figure at its rail; FOREGROUND = a floating barrel and splash rings near the bottom-left edge; the low wooded shore along the top.",
     'action': 'On the navy sloop: two navy sailors lift a water barrel over the rail, one tosses a ballast stone with '
               'both hands, one pushes against the sand with a long pole. The officer stands at the stern shouting orders '
               'with one arm out. Far back on his own sloop Blackbeard leans on the rail with his chin in his hand, '
               'watching, unimpressed. Figures staggered, overlapping a little.',
     'props': 'the navy sloop with a furled sail, water barrels (one in the air, one floating), a few grey ballast stones '
              'dropping into the water with dull matte splashes (no shine, no droplet sparkle), a long pole, Blackbeard\'s small sloop with a furled sail, pale sandbars showing through '
              'shallow water, a low wooded shore. No birds. All flags furled tight.',
     'scale': 'each sloop only about four men long; barrel reaches a man\'s hip; ballast stone about the size of a head.'},
    {'id': 'm5c_closing_gap', 'minute': 'minute 6 (b46: a traffic jam in the shallows, push in; b47: the gap closing, push in toward the right; text left or right)',
     'goal': 'the navy sloop, now afloat, crawling toward Blackbeard\'s sloop: navy sailors rowing hard with long sweeps, '
             'the strip of water between the two boats getting narrow.',
     'cast': [('officer', 1), ('navy', 4), ('bb', 1), ('crew', 2)],
     'palette': 'Overcast midday: dusty grey sky, slate-grey water, pale sand under the shallows, worn brown hulls; soft diffused daylight, gentle soft shadows.',
     'camera': "OVER-THE-SHOULDER view from just behind the navy officer at the bow of the navy sloop, looking forward at Blackbeard's sloop a short gap ahead, eye level; the officer seen from behind, large in the left third, pointing ahead. FOREGROUND = the navy bow rail cut by the bottom edge; MIDDLE = the oars of the four navy sailors along both sides of the deck below and behind him, the narrow strip of water; BACK = Blackbeard's sloop with Blackbeard and two crewmen facing us, a low sandy shore with scrub.",
     'action': 'On the navy sloop four navy sailors pull long oars together, straining, while the officer at the bow '
               'leans forward pointing ahead. On Blackbeard\'s sloop Blackbeard stands at the rail facing them, hands on hips; '
               'one crewman rolls a small cannon toward the rail, one crewman peeks over the rail. Figures staggered, '
               'overlapping within each boat.',
     'props': 'two small one-mast sloops with furled sails, four long oars dipping in the water with small splashes, one '
              'small cannon on wheels, rigging, shallow water with sand showing, low sandy shore with scrub. No birds, '
              'no smoke. All flags furled tight.',
     'scale': 'each sloop only about four men long; oars about two men long; gap between boats about one boat-length.'},
    {'id': 'm5d_shouted_challenge', 'minute': 'minute 6 (b48: "who are you?", push in on Blackbeard at the left; b50: no mercy, pull back toward the right; text centre or right)',
     'goal': 'the shouting match across the water: Blackbeard on his rail roaring a challenge with a raised tankard, the '
             'navy officer shouting back from his own bow a short distance away.',
     'cast': [('bb', 1), ('crew', 2), ('officer', 1), ('navy', 3)],
     'palette': 'Overcast midday: dusty grey sky, slate-grey water, worn brown hulls; soft diffused daylight, gentle soft shadows, matte surfaces.',
     'camera': 'LOW-ANGLE view looking UP at Blackbeard standing on his rail, from his own deck a few steps behind and below him, Blackbeard large in the left half against the sky. FOREGROUND = deck planks and a coiled rope cut by the bottom edge; MIDDLE = Blackbeard and the two crewmen behind him; BACK-RIGHT = across the narrow strip of water, the navy sloop smaller with the officer at its bow and sailors behind, low shore, sky.',
     'action': 'Blackbeard stands with one boot on the rail, tankard raised high in one hand, mouth wide open roaring, '
               'a faint matte grey wisp curling from under his hat (no glow, no fire). Two crewmen behind him laugh and shake their fists. On the navy sloop the '
               'officer cups one hand to his mouth shouting back, his other hand on his sword hilt; three navy sailors '
               'behind him crouch low behind the rail looking nervous. Figures staggered at different depths.',
     'props': 'Blackbeard\'s sloop rail, a plain pewter tankard, the navy sloop with a furled sail, rigging, a narrow strip '
              'of water, low shore. No birds. All flags furled tight. No fire, no glow.',
     'scale': 'rail at a standing man\'s waist; tankard about hand-sized; gap between boats about one boat-length.'},
]
