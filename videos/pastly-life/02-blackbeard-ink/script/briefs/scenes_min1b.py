"""Minute index 0 (video minute 1) fill scenes, v7 card-spam fix (Zen 2026-11-25: "You seem to be spamming the explain
cards"; 2026-11-27 picked "Codex draws 3 plates"). Three cut cards leave three slots that need a NEW graded scene,
because every approved plate is already used once and the reuse lint bans cross-minute reuse.
Slots: b1[1] f46 hook (the navy is already coming), b5[2] f784 Teach's Hole (one small sloop), b7[1] f1262 the
buried-money question. Min1 review lessons applied (no birds, few props, exact figure counts, flags furled, no glow).
Spec review 2026-11-27 (5 free legs, scratchpad m0_review.txt) applied: m0a boats staggered + horizon kept visible +
reeds edge-only; m0b rowing boat dropped + high oblique (not steep top-down) + dune moved to a corner + minute text no
longer says twenty men; m0c camera side made consistent, sea side named, shovel blade shown, coins dropped."""
NOTES = ('Min1 review lessons applied up front (no birds, props cut, counts exact, flags furled, no glow). '
         'New fill plates for min1 v7 slots b1[1], b5[2], b7[1]; cameras chosen to differ from neighbours s01/m1d/s08. '
         'Spec review fixes: staggered boats, horizon visible, edge-only foreground, consistent camera geometry.')
SCENES = [
    {'id': 'm0a_navy_coming', 'minute': 'minute 1 (b1: the hook, he has less than a day to live; slow push in; text low centre)',
     'goal': 'first grey light: two small navy sloops sliding quietly toward the inlet, seen from the reeds on the shore, the threat already on its way.',
     'cast': [('navy', 2)],
     'palette': 'Pre-dawn: cold dusty blue-grey sky with one pale grey band of light low on the horizon, slate water, dark olive reeds; soft flat light, no sun disc, no glow.',
     'camera': 'LOW view from the reeds on the shore, camera at reed height looking out across open water. FOREGROUND = dark reed stalks only at the far left and far right edges, plus one wooden mooring stake at the left edge; the lower centre of the frame is open calm water with no reeds. MIDDLE = the two navy sloops clearly apart, not overlapping: the near one larger at centre-right, the far one much smaller at upper-left, with clear water between them. BACK = a low dark headland on the right side only, and the pale grey horizon band left open and visible across the rest of the frame above the water. Keep the lower centre calm water for a text tag.',
     'action': 'The two small one-mast navy sloops glide in under small sails, low in the water, side-on, both heading toward the right. Exactly two tiny navy sailors in total, both standing at the bow of the near sloop. The far sloop shows no figures. The water is calm with soft wakes.',
     'props': 'two small navy sloops with one small sail each, reeds at the frame edges, one mooring stake, a low headland. No birds. All flags furled tight. No lanterns lit.',
     'scale': 'near sloop about a quarter of the frame width; far sloop about a tenth; figures tiny, about a twelfth of the frame height.'},
    {'id': 'm0b_lone_sloop', 'minute': "minute 1 (b5: he is anchored at Teach's Hole with one small sloop, a weak spot to be caught in; slow pan; text low centre)",
     'goal': "Blackbeard's one small sloop sitting alone at anchor in a quiet sandy inlet, nothing else around, it looks small and exposed.",
     'cast': [('crew', 2)],
     'palette': 'Calm late afternoon: pale dusty blue sky, slate-blue water, pale tan sand bars, muted green-grey scrub; soft diffused daylight, gentle soft shadows, no glow.',
     'camera': "HIGH oblique view from the top of a sand dune, looking down and out across the inlet at a gentle angle, so the water fills most of the frame and a strip of sea and sky still shows at the top. FOREGROUND = a small dune corner with a few tufts of sea grass and one half-buried driftwood log, only in the bottom-left corner; the lower centre of the frame is calm open water. MIDDLE = the sloop at anchor, small, a little above the centre of a wide empty stretch of water, its anchor line going down into the water at the bow. BACK = long thin sand bars, a strip of open sea beyond and a flat sky along the top. Keep the lower centre calm water for a text tag.",
     'action': 'The small one-mast sloop rides at anchor, sail furled. Exactly two tiny crewmen sit on the deck, one fishing over the rail with a line, one leaning on a barrel. Lots of empty water all around the boat so it looks small and alone.',
     'props': 'the sloop with its sail furled, anchor line, two barrels on deck, sand bars, sea grass, one driftwood log. No birds. All flags furled tight. No other boats of any kind, no rowing boat, no dinghy.',
     'scale': 'the sloop only about a sixth of the frame width; figures tiny.'},
    {'id': 'm0c_buried_chest', 'minute': 'minute 1 (b7: a guest asks does your wife know where you buried your money?; slow push in; text top left)',
     'goal': 'the rumour pictured: a small wooden money chest half-buried in the sand on a lonely beach at dusk, a crooked pine behind it, a shovel stuck in the sand beside it.',
     'cast': [],
     'palette': 'Dusk: dusty violet-grey sky, slate-blue sea, pale grey-tan sand, dark green-black pine; soft fading light, gentle soft shadows, quiet and secret, no glow.',
     'camera': 'LOW close view at sand level, camera standing just right of the hole and looking left along the beach. FOREGROUND = a mound of dug sand at the right edge with a shovel stuck in it, the whole shovel visible (iron blade in the sand, handle upright), cut only slightly by the right edge; MIDDLE = the chest half in its hole, lid shut, iron bands and a closed padlock; BACK = the crooked pine in the mid-background at centre-right, leaning right, away from the top-left; a line of boot prints leading away left along the beach; the calm sea as a thin band along the right half of the horizon. Keep the top-left quarter plain calm sky for text: no tree, no sea line, nothing in it.',
     'action': 'No people. The chest sits half-buried, lid closed and locked. A line of boot prints leads away from the hole toward the far end of the beach. Still and secret.',
     'props': 'one small iron-banded wooden chest with a padlock, a shovel, a dug sand mound, a crooked pine, boot prints, a few shells. No coins. No birds. No maps, no X marks, no signs.',
     'scale': "chest about as wide as a man's shoulders; shovel about chest-high to a man; pine about three men tall."},
]
