"""Minute index 7 (b60-b68) fresh scenes. Story per beat: see tools/ink/ep02_full_shots.py comments.
Every plate here replaces a minute-1 scene (s01-s11) that was being recycled. Plates serve two beats of THIS
minute with different camera moves where the story allows (pairs listed in 'minute'). The officer cast key is
Lt Maynard. Fight is cartoon-safe: no blood, no wounds shown, no severed anything; b68 is told by a distant
silhouette only. Min1 review lessons applied (no birds, few props, exact figure counts, flags furled, no glow)."""
NOTES = 'Min1 review lessons applied up front (no birds, props cut, counts exact, flags furled, no glow). See scenes_min7_review.md.'
SCENES = [
    {'id': 'm7a_deck_brawl', 'minute': 'minute 8 (b60: now it is even, on their ship, slow pan; b66: his crewmates going down, push in; text on the left)',
     'goal': 'a crowded cartoon brawl on the navy sloop deck: pirates and navy sailors evenly matched, pushing, '
             'shoving and clashing swords, with pirates starting to get knocked down.',
     'cast': [('bb', 1), ('crew', 4), ('navy', 4)],
     'palette': 'Overcast midday: dusty grey sky, slate-grey sea, worn brown deck; soft diffused daylight, gentle soft shadows; thin matte grey smoke wisps, no glow.',
     'camera': 'LOW view from deck height right in the middle of the fight, eye level of a man sitting on the deck. FOREGROUND = the dazed crewman sitting on the deck close to camera, cut by the bottom-left edge, a dropped hat beside him; MIDDLE = the fighting pairs overlapping at different depths, the near ones large; BACK = Blackbeard fighting near the mast, rail, sea. Keep the right third a little calmer for text.',
     'action': 'Four pairs fight in staggered depth: a crewman and a navy sailor push swords against each other; a navy '
               'sailor trips a crewman who is falling backward onto the deck; a crewman sits dazed on the deck seeing '
               'stars; a navy sailor and a crewman wrestle over a cutlass. At the back Blackbeard swings his sword at a '
               'navy sailor who ducks. No blood, no wounds.',
     'props': 'the navy sloop deck with an open hatch, plain swords and cutlasses, a dropped hat, a coil of rope, a '
              'barrel, the mast with a furled sail and rigging, thin smoke wisps. No birds. All flags furled tight.',
     'scale': 'rail at a standing man\'s waist; sword about arm length; the sloop only about four men long.'},
    {'id': 'm7b_powder_fuse', 'minute': 'minute 8 (b61: in the powder room, a lit fuse, push in; b62: the plan was to blow the ship up, pull back; text on the right)',
     'goal': 'below deck in a cramped powder room: a nervous pirate crewman crouching beside powder kegs holding a long '
             'fuse cord with a small smoking tip, about to set it to the kegs.',
     'cast': [('crew', 1)],
     'palette': 'Dim below-deck room: dusty blue-grey shadows, worn brown wood planks and kegs. Main light = soft cool grey daylight falling through a small open hatch above; the fuse tip only a thin grey smoke curl, no glow, no sparks, matte surfaces.',
     'camera': 'OBJECT INSERT, low and close: the camera at floor level right beside the bottom powder keg. FOREGROUND = the keg curve and the smoking fuse tip close to camera, large and sharp, cut by the bottom-left edge; MIDDLE = the fuse cord running back along the floor to the crewman crouched behind, full figure, medium size; BACK = stacked kegs, low ceiling beams, a ladder up to the open hatch. Keep the right third calmer for text.',
     'action': 'The crewman crouches beside a stack of powder kegs, sweating, biting his lip, holding the fuse cord at arm\'s '
               'length; the cord runs along the floor to the bottom keg; a thin grey smoke curl rises from the fuse tip. '
               'He glances up toward the hatch.',
     'props': 'six round wooden powder kegs with plain iron hoops (no letters, no symbols), a long fuse cord, a wooden '
              'ladder to an open square hatch, low ceiling beams, a coil of rope. No lanterns, no candles, no birds.',
     'scale': 'keg reaches a crouching man\'s chest; ceiling just above a standing man\'s head; hatch about one man wide.'},
    {'id': 'm7c_sword_snap', 'minute': 'minute 8 (b63: pistols, BANG, push in; b64: his blade snaps the officer\'s sword, pull back; text on the right)',
     'goal': 'the duel: Blackbeard and the navy officer face to face on the deck; Blackbeard\'s big sword has just snapped '
             'the officer\'s blade in half, the broken piece flying away, both men still holding a small flintlock pistol.',
     'cast': [('bb', 1), ('officer', 1)],
     'palette': 'Overcast midday: dusty grey sky, slate-grey sea, worn brown deck; soft diffused daylight, gentle soft shadows; pistol smoke = slow drifting matte grey residue, no muzzle flash, no orange or red light, no glow.',
     'camera': "OVER-THE-SHOULDER view from just behind the navy officer, the officer seen from behind and a little to the side, large in the right third; Blackbeard beyond him facing the camera, swinging his sword down, centre-left. FOREGROUND = the officer's shoulder and deck planks; BACK = rail, sea, sky. Keep the top-left calm for text.",
     'action': 'Blackbeard swings his big curved sword down, roaring, a faint matte grey wisp curling from under his hat; the officer\'s '
               'straight sword is snapped in half, the broken blade spinning through the air; the officer stumbles back '
               'with the stub of his sword, eyes wide. Both hold a small flintlock pistol in their other hand, slow '
               'drifting grey residue from the officer\'s pistol (no flash). No blood.',
     'props': 'one big curved sword, one straight sword snapped in two with the broken piece in the air, two small '
              'flintlock pistols, slow drifting grey residue (no flash), deck planks, rail, rigging. No birds. All flags furled tight.',
     'scale': 'rail at a standing man\'s waist; sword about arm length; pistol about hand-and-forearm sized.'},
    {'id': 'm7d_still_standing', 'minute': 'minute 8 (b65: five bullets, about twenty cuts, still standing, slow pan; b67: they still outnumber you, a few minutes, pull back; text on the right)',
     'goal': 'Blackbeard, battered but still standing in the middle of the deck, ringed by navy sailors closing in; '
             'his torn coat and askew hat show he is in trouble, yet he still grins.',
     'cast': [('bb', 1), ('officer', 1), ('navy', 5)],
     'palette': 'Overcast midday: dusty grey sky, slate-grey sea, worn brown deck; soft diffused daylight, gentle soft shadows; thin matte grey smoke wisps, no glow.',
     'camera': 'HIGH TOP-DOWN view looking almost straight down from the mast at the deck, Blackbeard centre-left inside a loose ring of navy sailors that stays in the left two thirds, everyone seen from above (round heads, hats, short foreshortened bodies, feet visible). FOREGROUND = a rigging rope crossing the top-left corner; deck planks running diagonally. The RIGHT THIRD stays empty deck planks and rail (no figures) for text.',
     'action': 'Blackbeard stands wide-legged, coat torn and hat crooked, a few plain cloth patches on his sleeves, sword '
               'raised in both hands, grinning through his beard. Five navy sailors circle him at different distances '
               'on the left and centre, swords pointed, edging closer; the officer stands centre-left behind them pointing at Blackbeard. No blood, no wounds shown.',
     'props': 'deck planks, plain swords, a dropped pistol, a dropped hat, the mast with a furled sail and rigging, the rail. '
              'No birds. All flags furled tight.',
     'scale': 'rail at a standing man\'s waist; sword about arm length; the ring about three men across.'},
    {'id': 'm7e_bowsprit_far', 'minute': 'minute 8 (b68: his end, told only by a far silhouette; slow push in on a distant ship)',
     'goal': 'the end, told from far away: the navy sloop sailing off across a grey inlet, a small dark bundle hanging '
             'from the tip of its bowsprit, too far to see any detail. Quiet, sombre, not gory.',
     'cast': [('navy', 2)],
     'palette': 'Late afternoon overcast: dusty grey-blue sky, slate water, low grey clouds; soft diffused daylight, gentle soft shadows, sombre and quiet, no glow.',
     'camera': 'wide view from low over the water, horizon about one third from the top. FOREGROUND = calm rippled water '
               'and one floating plank cut by the bottom edge; MIDDLE-RIGHT = the navy sloop sailing away, small in frame, '
               'seen from the side; BACK = low dark wooded shoreline and wide grey sky.',
     'action': 'The navy sloop sails away under one small sail. At the very tip of its bowsprit hangs a small dark '
               'cloth bundle on a short rope, only a dot at this distance, no face, no detail. Two tiny navy figures stand at the '
               'stern, backs turned. The water is calm.',
     'props': 'the navy sloop with one small sail set, the bowsprit with a small dark cloth bundle on a rope, one floating plank, '
              'a low dark wooded shoreline. No birds. Flags furled tight.',
     'scale': 'the sloop small and far, about a fifth of the frame width; figures tiny.'},
]
