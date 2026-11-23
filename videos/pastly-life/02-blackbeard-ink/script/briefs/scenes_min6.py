"""Minute index 6 (b51-b59) fresh scenes. Story per beat: see tools/ink/ep02_full_shots.py comments.
Every plate here replaces a minute-1 scene (s01-s11) that was being recycled. Each fresh plate serves two
beats of THIS minute with different camera moves (pairs listed in 'minute'). b57 has no plate of its own.
Battle is cartoon-safe: nobody bleeding, hits shown as men knocked flat or ducking, smoke matte grey.
Min1 review lessons applied (no birds, few props, exact figure counts, flags furled, no glow)."""
NOTES = 'Min1 review lessons applied up front (no birds, props cut, counts exact, flags furled, no glow). See scenes_min6_review.md.'
SCENES = [
    {'id': 'm6a_broadside', 'minute': 'minute 7 (b51: BROADSIDE, push in; b52: about twenty navy hit, their captain down, pull back; text on the right)',
     'goal': 'Blackbeard\'s small sloop fires all its little cannons at once at a navy sloop close by: thick grey smoke '
             'rolls across the water and the navy sailors are knocked flat on their own deck like bowling pins.',
     'cast': [('bb', 1), ('crew', 3), ('officer', 1), ('navy', 5)],
     'palette': 'Overcast midday: dusty grey sky, slate-grey water, worn brown hulls; soft diffused daylight, gentle soft shadows. Cannon smoke = thick matte grey puffs, no flash, no fire, no glow.',
     'camera': 'wide side-on view across the water at eye level, horizon about one third from the top. LEFT = Blackbeard\'s '
               'sloop with smoke bursting from its side; RIGHT = the navy sloop a short gap away. FOREGROUND = rippled '
               'water along the bottom edge; MIDDLE = smoke drifting between the boats; BACK = low sandy shore.',
     'action': 'On the pirate sloop: three crewmen crouch behind three small cannons that have just fired, smoke pouring '
               'out of the muzzles, one covering his ears; Blackbeard stands behind them with one arm thrust forward '
               'yelling. On the navy sloop: four navy sailors are knocked over backward in comic poses (one flat on his '
               'back with legs in the air, one tumbling over a barrel, two sitting dazed), one navy sailor ducks behind '
               'the rail, the officer lies flat on the deck with his hat flying off. Nobody bleeding.',
     'props': 'two small one-mast sloops with furled sails, three small cannons on wheels, thick grey smoke clouds, one '
              'flying officer hat, a toppled barrel, a few wood splinters in the air, rigging, a low sandy shore. No birds, '
              'no fire, no flashes. All flags furled tight.',
     'scale': 'each sloop only about four men long; cannon barrel at knee height; gap between boats about one boat-length.'},
    {'id': 'm6b_navy_hurting', 'minute': 'minute 7 (b53: a third of them down, they are hurting, slow pan; b54: the odds going up, push in on the pirates at the left; text on the right)',
     'goal': 'aftermath on the pirate side: Blackbeard\'s crew cheering on their smoky sloop while across the water the '
             'battered navy sloop drifts with only a few sailors still standing, the rest sitting dazed.',
     'cast': [('bb', 1), ('crew', 3), ('navy', 5)],
     'palette': 'Overcast midday: dusty grey sky, slate-grey water, worn brown hulls; soft diffused daylight, gentle soft shadows; leftover smoke thin matte grey wisps, no glow.',
     'camera': 'medium-wide 3/4 view from the pirate sloop deck looking across at the navy sloop, eye level. LEFT THIRD = '
               'Blackbeard and his crew on their deck, large in frame; RIGHT TWO THIRDS = across the water, the navy sloop '
               'with a torn sail. FOREGROUND = a smoking cannon muzzle cut by the bottom-left edge; BACK = shore and sky.',
     'action': 'Blackbeard stands with one boot on a cannon, fist raised, laughing. One crewman waves his hat over his '
               'head, one does a little jig, one claps the jigging crewman on the back. On the navy sloop two navy '
               'sailors stand holding the rail looking shaken, three sit slumped on the deck holding their heads, bandaged '
               'with plain cloth. Nobody bleeding.',
     'props': 'the pirate sloop deck, two small cannons with thin smoke wisps, the navy sloop with a torn furled sail and a '
              'cracked rail, plain cloth bandages, a few floating wood planks on the water, a low sandy shore. No birds. '
              'All flags furled tight.',
     'scale': 'rail at a standing man\'s waist; cannon barrel at knee height; gap between boats about one boat-length.'},
    {'id': 'm6c_empty_deck_grapple', 'minute': 'minute 7 (b55: the deck looks empty, slow push in; b56: grenades and grappling hooks, pull back; text on the right)',
     'goal': 'the trick: the navy sloop drifting alongside with its deck looking completely empty (just a lone officer '
             'at the tiller), while Blackbeard\'s crew throw grappling hooks and small round grenade pots across.',
     'cast': [('bb', 1), ('crew', 3), ('officer', 1)],
     'palette': 'Overcast midday: dusty grey sky, slate-grey water, worn brown hulls; soft diffused daylight, gentle soft shadows; smoke thin matte grey, no glow, no sparks.',
     'camera': 'medium-wide 3/4 view from just behind the pirate rail looking across at the navy sloop, eye level. '
               'FOREGROUND = the pirate rail with coiled grapple ropes cut by the bottom edge; MIDDLE = the pirates '
               'throwing; RIGHT = the navy sloop alongside with its empty deck, shut hatches clearly visible; BACK = '
               'shore and sky.',
     'action': 'One crewman swings a grappling hook on a rope over his head, one has just thrown a hook that is flying '
               'across trailing rope, one lobs a small round black clay pot with a short smoking string. Blackbeard leans '
               'on the rail peering suspiciously at the empty deck with one eyebrow up. On the navy sloop the officer '
               'alone holds the tiller at the far end, not looking at them; the rest of the deck is bare except closed '
               'square hatches. No sparks, no fire.',
     'props': 'the pirate rail, two grappling hooks with ropes, one small round black clay pot in the air, the navy sloop '
              'with a furled sail, two closed square deck hatches, a tiller, rigging, a low shore. No birds. All flags '
              'furled tight.',
     'scale': 'rail at a standing man\'s waist; grapple about hand-and-forearm sized; hatch about one man wide; gap between boats about two arm-lengths.'},
    {'id': 'm6d_hatches_burst', 'minute': 'minute 7 (b58: never trust a free win, he jumps across, push in; b59: hatches burst, men hidden below, pull back; text on the right)',
     'goal': 'Blackbeard leaps onto the navy deck, and at that exact moment the hatches fly open and navy sailors burst '
             'up out of the hold with swords raised. Blackbeard freezes mid-landing, surprised.',
     'cast': [('bb', 1), ('crew', 2), ('officer', 1), ('navy', 5)],
     'palette': 'Overcast midday: dusty grey sky, slate-grey water, worn brown deck; soft diffused daylight, gentle soft shadows; thin matte grey smoke wisps, no glow.',
     'camera': 'medium-wide 3/4 view across the navy sloop deck at eye level, planks converging toward the far rail. '
               'FOREGROUND = an open hatch lid cut by the bottom-right edge; MIDDLE = Blackbeard landing centre-left and '
               'the navy sailors rising out of two open hatches; BACK = the pirate sloop rail with two crewmen climbing '
               'over, sea and sky.',
     'action': 'Blackbeard lands in a crouch with his sword drawn, eyes wide and mouth open in surprise, smoke curling from '
               'under his hat. Out of two open square hatches five navy sailors burst up to the waist or climbing out, '
               'swords and cutlasses raised, shouting. The officer steps forward from the tiller pointing his sword. Behind '
               'Blackbeard two crewmen climb over the rail, freezing mid-step. Figures staggered at different depths, '
               'overlapping a little. Nobody bleeding.',
     'props': 'the navy sloop deck with two open square hatches and their lids flung back, plain swords and cutlasses, a '
              'tiller, a furled sail and rigging, the pirate sloop rail alongside, a grappling rope over the rail. No '
              'birds. All flags furled tight.',
     'scale': 'rail at a standing man\'s waist; hatch about one man wide; sword about arm length.'},
]
