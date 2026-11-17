# Ep01 v11 beat list — full visual remake

_One-line purpose: every VO beat (107, locked voice + script) mapped to ONE visual: a Beanie-style SCENE (existing plate + framing + sprite + fact on an object) or an Ink-style CARD (white, one idea, the drawing IS the idea, 1-4 words, one red accent). Source of truth for `tools/ink/make_v11_shots.py`._

Rules carried (brain `skills/pastly-explainer/SKILL.md` rows 10-11, `docs/ink-card-patterns.md`):
- Remake, not patch: nothing copied from shots_v10.
- Art (pivot Zen 2026-11-17, brain `docs/ink-card-patterns.md` item 11): BOTH videos may add new art via pipeline, cost quoted before spending. A (this list) = 4 corner-room plates + ~5 inserts on top of the 63 plates, 94 cast sprites, 13 PD photos. B (v10.2 continued) may also replace weak v10.2 art with new art. Card drawings are code-drawn SVG doodles (boiled).
- TYPE_CAP: any card layout <= 4 per episode; BAR <= 1; FLOW <= 2. Charts only where the VO compares numbers (b69 only).
- Each PD photo used once, with paper border + tilt + red mark.
- Scenes: 4-6 framings per plate max reuse; facts written ON objects (tags, papers, stamps), not floating.
- HUD: `TOWERS SOLD` tally (0 -> 1 at b50, -> 2 at b58).

Framing codes: WIDE · MED · CLOSE · INSERT (object fills frame) · OTS (over shoulder) · TOP (top-down) · LOW · HIGH.

## Card layouts (code-drawn, new engine elements)

| Layout | What it draws | Uses |
|---|---|---|
| COUNT | a row of N identical doodles drawing on one by one, number above | b02, b16, b23 |
| SPLIT | page split by a hand line, left idea vs right idea, red X or tick on one side | x01, b30, b49, x21 |
| HERO | one big doodle centered + 1-3 words under it | b10, x02, x12, x19 |
| CROSSOUT | 2-3 hand-written words, each struck by a red line, final word circled | b17, x08, b53 |
| CHECKLIST | hand-ruled list, ticks draw on per word | x10, x20 |
| DOC | a drawn paper (letterhead / card / certificate), one line circled red | b25, b37, b74 |
| MAP | doodle coast outline, dashed route draws on, two pins | b51, b57, b61 |
| QUOTE | the sentence on a ruled line; blank first, then filled | b05, b75, b76 |
| TRANSFORM | object A, red cross, arrow, object B | b46, x16 |
| FLOW | 3 boxes + arrows, drawn in order | b55, x23 |
| SCALE | balance scale, heavier side drops | b29 |
| RING | circle of N hats, one hat outside the ring circled red | b43 |
| GRID | grid of masks, one plain face circled red | x27 |
| XRAY | box outline, hidden bills revealed by a red dashed cutaway | x24 |
| THOUGHT | thought bubble with the drawn tower inside + price tag | x14 |
| PIN | push-pin missing a blurred silhouette | x06 |
| LIST | notebook page numbered 1-10, writing fills in | b19 |
| BIGNUM | huge hand number + one doodle | b38 |
| BAR | three bars, hand-drawn, values on bars | b69 |

## Beat map

| Beat | Kind | Visual |
|---|---|---|
| **p01** | | |
| b01 | PHOTO | citroen_tower_1925 push-in; red stamp "SOLD" lands on "The actual tower" |
| b02 | CARD COUNT | 2 towers draw on, each gets a red SOLD tag: "TWICE" |
| b03 | SCENE | alcatraz_island_fog WIDE slow push; 3 tags pin on: CAPONE / JAIL / ALCATRAZ |
| b04 | PHOTO | lustig_1935, red circle on face, name tag "VICTOR LUSTIG" |
| b05 | CARD QUOTE | empty ruled line, padlock doodle: "ONE SENTENCE" |
| **p02** | | |
| b06 | PHOTO | eiffel_construction_1888, tag "1889" |
| b07 | SCENE | paris_expo_1889 WIDE, tag on tower "20 YEARS" then red "TAKE APART" |
| b08 | PHOTO | eiffel_caricature_1887, red underline, words "BLACK FACTORY CHIMNEY" |
| b09 | PHOTO | antenna_1914, red circle on antenna -> "RADIO" |
| b10 | CARD HERO | tower drawn in dashed line, fading: "TEMPORARY?" |
| **p03** | | |
| b11 | SCENE | tower_rust_closeup CLOSE; tags on beams PAINT / REPAIRS / BILLS |
| b12 | SCENE | desk_topdown_papers TOP; newspaper headline "WORTH KEEPING?" |
| b13 | SCENE | paris_rooftops_high_angle HIGH, parisian_walk_profile crossing |
| b14 | SCENE | hotel_suite_corner_34 OTS, lustig_reading_newspaper |
| **p04** | | |
| x01 | CARD SPLIT | MONUMENT (tower) vs PILE OF IRON (heap of beams), red tick on iron |
| x02 | CARD HERO | open book with tower on its page: "A STORY" |
| x03 | SCENE | desk_topdown_papers INSERT, headline with "..." and a pen finishing it |
| **p05** | | |
| b15 | SCENE | bohemia_village_1890 WIDE, signpost tag "BOHEMIA 1890" |
| b16 | CARD COUNT | 5 speech bubbles (BONJOUR / HELLO / GUTEN TAG / CIAO / AHOJ): "5 LANGUAGES" |
| b17 | CARD CROSSOUT | GUN ~~ / GANG ~~ / then SUIT, SMILE, PATIENCE circled |
| **p06** | | |
| x04 | SCENE | forger_desk_night MED, lustig_passports_fan, tag "40+ NAMES" |
| x05 | SCENE | police_records_office, police_officer_two_files; files tagged with 2 different names |
| x06 | CARD PIN | pin stabs, silhouette slides away: "NOBODY CAN PIN HIM" |
| **p07** | | |
| b18 | SCENE | ocean_liner_deck WIDE, rich_passenger_deckchair + lustig_lean_murmur |
| b19 | CARD LIST | notebook page 1-10 writing on: "10 RULES" |
| b20 | SCENE | liner_cabin_night MED, mark_talking_gesturing + lustig_rapt_listening, tag "1. LISTEN" |
| b21 | SCENE | liner_deck_high_angle HIGH, lustig_nodding_agree, tags "2. NEVER BORED" "3. AGREE" |
| **p08** | | |
| x07 | SCENE | tailor_shop_mirror, lustig_rehearsing_mirror, tags "4. NEVER BOAST" "5. CLEAN SHOES" on shoes |
| x08 | CARD CROSSOUT | CLEVER ~~, then CAREFUL / CALM / KIND |
| x09 | SCENE | elite_banquet_table_night WIDE, loud_braggart_shouting + lustig_from_below_smug quiet in corner |
| b22 | SCENE | paris_skyline_extreme_wide, chip "ONE AFTERNOON" |
| **p09** | | |
| b23 | CARD COUNT | 3 doodles: suit / building / 6 hats: COSTUME STAGE AUDIENCE |
| b24 | SCENE | forger_desk_night CLOSE, lustig_forging_pen, letterhead tag "REPUBLIQUE FRANCAISE" |
| b25 | CARD DOC | name card, title keeps writing and overflows: "DEPUTY DIRECTOR GENERAL..." |
| b26 | SCENE | telegraph_desk_topdown TOP, tag "POSTS & TELEGRAPHS" |
| **p10** | | |
| b27 | PHOTO | crillon_concorde_1890s push, tag "HOTEL DE CRILLON" |
| b28 | SCENE | crillon_salon_chandeliers LOW, doorman_bowing |
| b29 | CARD SCALE | big room vs tiny man; room side drops: "ROOM FIRST" |
| b30 | CARD SPLIT | RICH (one coin stack) vs WANTS RICHER (stack + arrow up), red tick right |
| b31 | SCENE | telegraph_desk_topdown INSERT (2nd framing), 6 sealed envelopes fan out, each addressed; top one tagged "6 DEALERS" |
| b32 | SCENE | wax_seal_extreme_closeup INSERT, letter line "TELL NO ONE" |
| b33 | SCENE | hotel_crillon_facade_day WIDE, scrap_dealer_proud; hook doodle tag "HOOK 1" |
| **p11** | | |
| b34 | SCENE | hotel_suite_window_dutch, lustig_back_window |
| x10 | CARD CHECKLIST | PAPERS / TITLE / HOTEL / ORDER ticks draw on |
| x11 | SCENE | crillon_salon_through_doors WIDE, very slow push (long beat, tension) |
| x12 | CARD HERO | film slate: "ONE TAKE" |
| **p12** | | |
| b35 | SCENE | crillon_salon_over_armchair OTS, lustig_lean_whisper, stamp "STATE SECRET" |
| b36 | SCENE | crillon_salon_birdseye TOP, dealers round table, stamp "DEMOLISH" |
| b37 | CARD DOC | memo with redact bars, red "CONFIDENTIAL" |
| b38 | CARD BIGNUM | "7,000 TONS" + iron girder doodle |
| **p13** | | |
| b39 | SCENE | limousine_street_day WIDE -> limousine_backseat_view (2 shots) |
| b40 | SCENE | tower_low_angle_up LOW, scrap_dealer_looking_up, tag on beam "INVENTORY" |
| x13 | SCENE | tower_lattice_framing_paris, poisson_from_below_greedy |
| x14 | CARD THOUGHT | tower in a thought bubble with price tag: "ALREADY PAYING" |
| **p14** | | |
| b41 | SCENE | tower_top_looking_down HIGH, lustig_high_angle_sly |
| b42 | SCENE | poisson_parlour_night MED, poisson_back_stand, name tag "ANDRE POISSON" |
| b43 | CARD RING | ring of hats (the elite), one hat outside circled red |
| b44 | SCENE | parlour_through_doorway, poisson_high_angle_eager, tag "HIGHEST BID" |
| **p15** | | |
| b45 | SCENE | parlour_tea_table_high_angle, poisson_wife_suspicious, tag "HOOK 2" |
| b46 | CARD TRANSFORM | straight story arrow, red cross, bent arrow: "SHIFT" |
| b47 | SCENE | crillon_salon_over_armchair CLOSE, lustig_embarrassed, tag "LOW PAID" |
| b48 | SCENE | poisson_parlour_night TOP feel, poisson_topdown_reach + envelope tag "BRIBE" |
| b49 | CARD SPLIT | BIG LIE (red X) vs SMALL SIN (red tick) |
| **p16** | | |
| x15 | SCENE | banquet_table_high_angle HIGH, empty chair circled red |
| x16 | CARD TRANSFORM | tower crossed -> chair: "A SEAT" |
| b50 | SCENE | scrap_yard_day MED, scrap_dealer_handing_cash; HUD TOWERS SOLD 1 |
| b51 | CARD MAP | Paris -> Vienna dashed train route |
| **p17** | | |
| b52 | SCENE | vienna_cafe_morning, lustig_reading_newspaper (second use of sprite, new plate) |
| b53 | CARD CROSSOUT | HEADLINE ~~ ARRESTS ~~ MANHUNT ~~ -> "SILENCE" |
| b54 | SCENE | poisson_parlour_night CLOSE, scrap_dealer_head_in_hands |
| b55 | CARD FLOW | GO TO POLICE -> ADMIT BRIBE -> HE IS THE CRIMINAL |
| b56 | SCENE | police_station_high_angle, scrap_dealer_humiliated walking away |
| **p18** | | |
| x17 | SCENE | poisson_parlour window, scrap_dealer_waiting_window |
| x18 | SCENE | paris_birdseye_champ_de_mars, poisson_back_34_peek OTS at tower, tag "MINE" |
| x19 | CARD HERO | calendar pages tearing off: "WEEKS" |
| **p19** | | |
| b57 | CARD MAP | Vienna -> Paris route back: "AGAIN" |
| b58 | SCENE | crillon_salon_birdseye (2nd framing WIDE), tag "SAME SCRIPT"; HUD TOWERS SOLD 2 |
| b59 | SCENE | paris_police_station, dealer_reporting |
| b60 | SCENE | paris_train_station_night, lustig_back_walk_case |
| x20 | CARD CHECKLIST | FORTUNE / CLEAN EXIT ticked: "HE HAD WON" |
| x21 | CARD SPLIT | CON MAN (still telling stories) vs THIEF WITH A HOBBY |
| x22 | SCENE | hotel_suite_window_dutch CLOSE, lustig_back_window, chip "NEED TO BE BELIEVED" |
| **p20** | | |
| b61 | CARD MAP | Atlantic crossing, Europe -> America |
| b62 | SCENE | backroom_workshop_lamp, lustig_money_box |
| b63 | SCENE | backroom_workshop_lamp OTS, buyer_amazed -> buyer_paying, tag "$10,000s" |
| x23 | CARD FLOW | 2 BILLS -> BOX (6 HRS) -> 2 "COPIES" |
| x24 | CARD XRAY | box cut open, hidden real bills: "HIDDEN" |
| x25 | SCENE | texas_main_street_day, sheriff_paying -> sheriff_angry, tag "$30,000" |
| **p21** | | |
| b64 | PHOTO | capone_mugshot, red circle: "AL CAPONE" |
| b65 | SCENE | capone_office MED, capone_seated_desk + lustig_official_tailcoat, paper tag "$50,000 x2 / 60 DAYS" |
| b66 | SCENE | capone_desk_low_angle LOW, capone_warning_finger |
| b67 | SCENE | bank_vault_safe_deposit INSERT, box tag "60 DAYS" |
| b68 | SCENE | capone_desk_topdown_cash TOP, lustig_sad |
| b69 | CARD BAR | IN $50,000 / BACK $50,000 / GIFT $5,000 (only chart in the episode) |
| **p22** | | |
| x26 | SCENE | capone_office, capone_thinking |
| x27 | CARD GRID | 12 masks, one plain face circled: "ONE HONEST MAN" |
| b70 | CARD QUOTE | "THE TRUST WAS THE CON" |
| **p23** | | |
| b71 | PHOTO | lustig_fbi_1931, tag "CAUGHT 1935", secret_service_agent scene follows |
| b72 | SCENE | federal_jail_exterior_night, lustig_bedsheet_rope |
| b73 | PHOTO+SCENE | alcatraz_1930s photo -> prison_hospital_ward, lustig_sick_bed, tag "1947" |
| b74 | CARD DOC | death certificate, "APPRENTICE SALESMAN" circled red |
| x28 | SCENE | tower_lattice_framing_paris WIDE (2nd framing), tiny figure |
| x29 | SCENE | records_office_desk INSERT, form tags "NO MONEY. NO TITLE." |
| **p24** | | |
| b75 | CARD QUOTE | blank ruled line again (callback to b05) |
| b76 | CARD QUOTE | same card as b75 fills in: "GIVE PEOPLE A REASON TO FEEL **SPECIAL**", red underline |
| b77 | PHOTO | expo_1925_concorde, slow pull out |
| b78 | SCENE | hotel_suite_corner_34 MED, lustig_point_viewer (CTA) |

## Tallies (lint targets)
- 107 beats: cards 39 · scenes 58 · photos 10 (b73 = photo then scene; unused: expo_1889, concorde_1922).
- Card layouts all <= 4 (SPLIT 4, COUNT 3, HERO 4, QUOTE 4, CROSSOUT 3, DOC 3, MAP 3, CHECKLIST 2, TRANSFORM 2, FLOW 2, BAR 1, rest 1).
- Longest same-kind run: 2 cards (SKILL.md row 8 + ink-card-patterns lint: max 2 cards in a row).
