# SURFBIT — Scene Briefs

Concrete layouts for every scene, derived from the visual target in
[`docs/art-references/`](art-references/). Use this file when you build or
change maps (`src/game/maps/*`), buildings, props or characters.

- **Style rules** (palette, pixel sizes, outlines) → [ART_DIRECTION.md](ART_DIRECTION.md)
- **Map format and coordinates** → [ARCHITECTURE.md](ARCHITECTURE.md#map-format-srcgamemaps)
- **Products** → handles in `src/commerce/mock/catalog.ts`

The references are AI concept art, not game assets. **Match their composition,
palette, density and mood. Don't trace them.** Their perspective is painterly
(angled side walls, uneven pixel sizes). We rebuild them on a strict 16 px
grid in three-quarter view.

---

## 1. Beach town (`town`)

Reference: [beach-town.webp](art-references/beach-town.webp)

### What makes it look like the reference

- **Cobblestone town, not grass.** Warm beige cobbles (`stone*`, `grout`)
  cover streets and the plaza. Green appears as **lush planted beds**, raised
  stone planters, palms and hibiscus. Bare lawn is rare.
- **Dense, layered vegetation**: palms in clusters of 2–3, broad-leaf tropical
  shrubs, hibiscus (`hibiscus`, `pink`) everywhere, vines climbing building
  corners. Every gap between buildings is planted.
- **Each shop has its own roof material and silhouette** (table below). No two
  neighbours share a roof.
- **Stone retaining wall** separates town (higher) from beach (lower), with
  benches along the top and stone stairs down to the sand.
- **Diagonal shoreline** in the bottom-right: water is a large triangle, foam
  lines run parallel to the shore, rocks sit at the waterline.
- **Signage everywhere**: navy boards with the wave mark on every shop, a
  wooden signpost (`Surf ← · Shop → · Beach ↓`), a notice board, a chalkboard
  menu at the Beach Club.

### Layout (60 × 44 tiles)

Zones, not exact tiles. Codex/devs write the actual ASCII ground.

```
 x: 0         10        20        30        40        50       59
y 0  ┌──────────────────────────────────────────────────────────┐
     │ palms / jungle edge · 2 cottages + fence + steps (decor) │
y 4  │   [BOARDS]        [ SURFBIT  GOODS ]    [GEAR]  [WORKSHOP]│
     │   thatch 9×7      terracotta 12×8      thatch   slate 10×7│
y12  │ ═══════════ cobblestone street (`:`) ════════════════════ │
     │ [WEAR]    planter   ╔══ PLAZA (`#`) ══╗  planter          │
y16  │ indigo    notice    ║  wave-logo inlay ║   [BEACH CLUB]   │
     │ 9×7       board     ║  lamps, benches  ║   indigo 12×7    │
y24  │ planters            ╚═════════════════╝   + deck 12×4     │
y27  │ ▓▓▓ stone wall ▓▓ stairs ▓▓▓▓▓▓ stairs+signpost ▓▓ deck stairs
y30  │ volleyball     umbrellas+loungers     rocks    lifeguard  │
     │ net       boards-in-sand        surfer NPC        tower    │
y36  │ sand ........................................~~~~~~~~~~~~ │
     │ rocks ...........................~~~~~~~~~~~~~~~~~~~~~~~~ │
y43  └──────────────────────~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~┘
```

Spawns: `default` on the plaza facing down; `from-<shop>` one tile below each
enterable door, facing down.

### Buildings

All footprints include the roof. Doors are on the bottom row, centered unless
noted. Coming-soon shops have a boarded door and a SOON tag. A configured
`read` interaction can add a teaser.

| id | Label on sign | Enterable (MVP) | Size | Roof | Walls | Signature details |
|---|---|---|---|---|---|---|
| `boards` | BOARDS | ✅ | 9 × 7 | Thatch (`thatch*`) | Wood planks | Open shopfront showing boards inside; 4 boards leaning against the left wall outside; navy sign with wave mark; potted plants |
| `goods` | SURFBIT | ❌ (flagship, coming soon) | 12 × 8 | Terracotta gable (`terracotta*`) | Cream + wood trim | Largest building, center-north. Big navy `SURFBIT` sign under the gable; blue/white awning over a tee window, orange/white awning over the door; hibiscus vines on both corners; A-frame sign |
| `gear` | GEAR | ✅ | 9 × 7 | Thatch | Wood planks | Window shows wetsuits on hangers and shelves of bottles; board leaning on the right; navy sign |
| `workshop` | WORKSHOP | ❌ (teaser `read`) | 10 × 7 | Slate blue (`roofSlate*`) | Wood | Open garage front: surfboard on a shaping stand under a warm lamp; crossed-tools icon on the sign |
| `wear` | WEAR | ✅ | 9 × 7 | Indigo tiles (`roofIndigo*`) | Wood + cream | Two striped awnings (blue/white, orange/white); tees hanging in the windows; tee icons on the sign |
| `beach-club` | BEACH CLUB | ❌ (teaser `read`) | 12 × 7 + deck 12 × 4 | Indigo tiles | Wood | Walkable wooden deck (`d`) in front with café tables, string lights, chalkboard; stairs from deck to sand; coffee-cup icon on the sign; blue SURFBIT flag on a pole beside it |
| `cottage-*` | — | ❌ decor | 7 × 6 | Coral / terracotta | Cream | 2 cottages along the top edge behind a wooden fence, with stone steps |

### Props (town)

| Prop | Where | Notes |
|---|---|---|
| Palms (2 variants) | Clusters along edges, between shops, beach | Solid trunk; 3-frame sway |
| Tropical shrubs, hibiscus bushes | Every planter and gap | Solid |
| Raised stone planters | Plaza corners, along street | Solid; plants drawn on top |
| Plaza wave-logo inlay | Plaza center | Flat multi-tile prop (navy/teal cobbles) |
| Street lamps (black iron) | Flanking plaza and street | Solid base; warm glow at night later |
| Benches | Top of stone wall, plaza | Solid |
| Signpost `Surf/Shop/Beach` | Central stairs | `read` interaction |
| Notice board | Next to Wear | `read` interaction with Beach Club news |
| Trash bins | Near benches | Solid |
| Umbrellas (red/white, blue/white) + wooden loungers + towels | Beach | Umbrellas non-solid canopy; loungers solid |
| Boards stuck in sand (pair) | Foot of central stairs | Solid |
| Volleyball net | Beach left | Solid posts |
| Rock clusters | Beach corners and waterline | Solid |
| Lifeguard tower (with life ring) | Beach right | Solid |
| Café tables + chairs, string lights, chalkboard | Beach Club deck | Solid tables |
| Flags | Beach Club pole | 3-frame wave |

### NPCs (town)

| NPC | Behavior | Look |
|---|---|---|
| Kid in straw hat | wander, west street | Red tee, straw hat |
| Surfer carrying a board | wander along the beach | Wetsuit or tee, board under arm |
| Shopper | wander near Gear | Blue tee |
| Shopper | wander near Wear | Light-blue tee |
| Café guests ×2 *(optional, needs sitting frames)* | idle on the deck | Varied |
| Sunbather *(optional, needs lying frames)* | idle on a lounger | Sunglasses |

---

## 2. Boards interior (`boards`)

Reference: [boards-interior.webp](art-references/boards-interior.webp)

**Mood:** warm orange timber everywhere, golden pendant light, the boards are
the stars. Clear central aisle from entrance to counter.

**Size:** ~20 × 14 tiles. Back wall 3 tiles tall (room for sign, window,
posters). Side walls as 1-tile wood columns. Bottom row = low wooden railing
with a 2-tile opening in the center, sand strip outside.

```
 ┌──────────────────────────────────────────────┐
 │vines  [window+blinds]  ╔SURFBIT BOARDS╗  [big wave poster] [2 small]│  wall (3 rows)
 │  lamp           lamp   ╚══ teal sign ═╝  lamp                     │
 │tee  shelf   [wall rack: 3 boards] [shelf] [COUNTER+register] shelf│
 │rack                                        shopkeeper      ║boards│
 │  wicker chair  palm                                        ║ wall │
 │  round rug  pouf                                           ║ rack │
 │boards     ┌rug────────┐               ┌rug────────┐        ║  ×6  │
 │wall rack  │ RACK A  ▣ │    aisle      │ RACK B  ▣ │  cubbies     │
 │  ×4       └───────────┘   [wave mat]  └───────────┘  bottles     │
 │palm                                                         palm │
 │bench+towel  coffee table             fin table  crates           │
 │▓▓▓▓▓ railing ▓ pot ▓  [mat]  ▓ pot ▓▓▓▓▓ railing ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│
 └──────────────────────────────────────────────┘
   ▣ = small product placard on a post (interaction point)
```

| Display | Product handle(s) | Prop |
|---|---|---|
| Back-wall rack (3 boards) | `drift-mid-length`, `lazy-days-longboard`, `foamie-softboard` | `boardDisplay` ×3 |
| Rack A (center-left, on rug) | `sunset-shortboard` (+ decorative boards) | `boardDisplay` + placard |
| Rack B (center-right, on rug) | `pixel-fish` (+ decorative boards) | `boardDisplay` + placard |
| Fin table (bottom-right) | `keel-twin-fins` (cross-sell, also in Gear) | `pegboard`/table |
| Side-wall racks | decorative only | `prop`, no interaction |

Other dressing: wicker armchair + pouf + round jute rug, potted palms, hanging
vines, pendant lamps (flicker), shelves of folded tees and wax bottles,
bench with striped towel, coffee table with book and mug, hibiscus pots at the
entrance, wave-logo mats (center + entrance).

Shopkeeper: bearded man, white cap with wave mark, white SURFBIT tee
(`idle`, behind the counter).

---

## 3. Wear interior (`wear`)

Reference: [wear-interior.webp](art-references/wear-interior.webp)

**Mood:** sage-teal painted back wall (`wallSage*`) over warm wood floor,
plants everywhere, soft golden light. Fitting rooms visible from the door.

**Size:** ~20 × 14 tiles, same shell as Boards.

```
 ┌──────────────────────────────────────────────┐
 │ [sunset painting]  ╔SURFBIT WEAR╗  plants   [FITTING sign]        │  sage wall
 │ lamp        lamp   ╚════════════╝  lamp                           │
 │window [3 boards] [cap shelf] [COUNTER] mirror ║curtain║curtain║ ⬭  │
 │  ▒                            shopkeeper      ║  🌊   ║  🌊   ║mirror
 │  ▒                                                                │
 │mann.A     ┌rug──────┐   ┌wave rug┐   ┌rug──────┐        mann.B    │
 │ on rug    │ RACK tees│   │        │   │RACK hoodies│      on rug   │
 │plant      └─────────┘   └────────┘   └─────────┘          plant   │
 │        ┌table: folded tees┐        ┌table: caps + tees┐           │
 │        └──────────────────┘        └──────────────────┘           │
 │big plant                                               big plant │
 │▓▓▓▓▓▓▓▓ railing ▓▓ post ▓ [wave mat] ▓ post ▓▓ railing ▓▓▓▓▓▓▓▓▓▓│
 └──────────────────────────────────────────────┘
```

| Display | Product handle | Prop |
|---|---|---|
| Rack (left, tees) | `logo-tee` | `clothesRack` |
| Rack (right, hoodies) | `offshore-hoodie` | `clothesRack` |
| Mannequin A (tee + floral boardshorts + bucket hat) | `reef-boardshorts` | `mannequin` |
| Mannequin B (hoodie + shorts) | `offshore-hoodie` | `mannequin` |
| Swimwear rail next to the fitting rooms | `tide-one-piece` | `clothesRack` (small) |
| Front tables | `logo-tee` / decorative caps | `shelf`/table |
| Cap shelf behind the counter | decorative until a cap product exists | `shelf` |

Other dressing: two fitting rooms with cream curtains and wave marks (solid),
wall mirror + standing oval mirror, board rack with 3 decorative boards,
sunset painting, hanging and potted plants, wave rug in the center, jute rugs
under racks and mannequins, log posts at the entrance.

Shopkeeper: curly-haired woman, white cap, cream tee (`idle`, behind the counter).

> Catalog note: the reference shows caps and a bucket hat. Adding a
> `wave-cap` product to the Wear catalog would make the cap shelf
> interactive.

---

## 4. Gear interior (`gear`)

No reference yet. Build it in the same visual language as Boards and Wear:
same shell, warm wood floor, golden pendant light, plants, wave mats. Its
accent color is **Sun** (`sun*`). **Recommended:** create a
`docs/art-references/gear-interior.webp` concept in the same style before
step 2.3, so the three interiors match.

```
 ┌──────────────────────────────────────────────┐
 │ [window]  ╔SURFBIT GEAR╗ (sun-yellow accent)  [poster]  hanging plant│ wood wall
 │ [pegboard: fins] [wetsuit hangers ×3]  [shelf: wax/bottles] [COUNTER]│
 │                                                       shopkeeper     │
 │ leash hooks                                                board-bag │
 │ (wall)        ┌rug─────────────┐                         rack       │
 │               │ table: traction │                                    │
 │ bench +       │ pads            │         plant                      │
 │ changing area └────────────────┘                                    │
 │ plant                                                    crates     │
 │▓▓▓▓▓▓▓▓▓ railing ▓▓ pot ▓ [wave mat] ▓ pot ▓▓ railing ▓▓▓▓▓▓▓▓▓▓▓▓▓│
 └──────────────────────────────────────────────┘
```

| Display | Product handle | Prop |
|---|---|---|
| Pegboard of fins | `keel-twin-fins` | `pegboard` |
| Wetsuit hangers | `springsuit-wetsuit` | `wetsuitHanger` |
| Wax/bottle shelf | `tropical-wax` | `shelf` |
| Leash hooks | `coil-leash` | `pegboard` (variant) |
| Traction pad table | `grip-traction-pad` | `shelf`/table |
| Board-bag rack | `day-board-bag` | `wetsuitHanger`/rack variant |

Shopkeeper: woman with a ponytail, sun-yellow tee (`idle`, behind the counter).

---

## 5. Characters

All characters use the chibi proportions from the references: a big head
(~40% of height) and a short body, at **16 × 32 px** frames (see
ART_DIRECTION.md).

| Character | Look |
|---|---|
| **Player** | Blue/white trucker cap (worn forward), brown hair, white tee, blue shorts, brown backpack, sneakers |
| Boards shopkeeper | Beard, white cap with wave, white SURFBIT tee |
| Wear shopkeeper | Curly brown hair, white cap, cream tee |
| Gear shopkeeper | Ponytail, sun-yellow tee |
| Townsfolk | Mix of skin tones (`skin1..4`), hats (straw, cap, bucket), tees in palette colors |

---

## 6. Brand mark

The **wave mark** (a stylised breaking wave curling to the right) is
everywhere in the references: shop signs, plaza inlay, rugs, door mats, tees,
curtains, counter banners, flags.

| Version | Use |
|---|---|
| Vector SVG (`public/brand/surfbit-mark.svg`, `surfbit-logo.svg`) | HUD, favicon, site UI, OG images |
| Pixel 8 × 8 and 16 × 16 | Tees, mats, curtains, small signs |
| Pixel sign boards (navy board, cream wordmark, wave above) | Shop signs in world |
| Plaza inlay (multi-tile, navy/teal cobbles) | Town plaza |

Wordmark: bold, slightly rounded caps `SURFBIT` in Navy (`#114f6d`) with a
cream outline. Sub-labels (`BOARDS`, `WEAR`, `GEAR`) are in letter-spaced caps
under it.

---

## 7. Asset checklist (production art)

What a pixel artist, an asset pack or a generator needs to deliver. Keep
texture keys and frame sizes stable (ART_DIRECTION.md → Production art).

**Terrain tiles (16 × 16, with autotile edges):** sand (3 variants), wet sand,
cobblestone street (3), plaza pavers (2), grass/garden bed, raised planter
rim, stone retaining wall (face + top + ends), stone stairs, wooden deck,
water (4 frames), foam edges incl. **diagonal corners** (4 frames), interior
wood floor, wood wall, sage wall, wall trim, railing.

**Buildings:** Boards, SURFBIT Goods, Gear, Workshop, Wear, Beach Club (+
deck), 2 cottages. Each split into roof/wall layers if possible, plus a
"coming soon" door overlay.

**Town props:** palm ×2, shrub ×3, hibiscus bush, planter, street lamp,
bench, signpost, notice board, trash bin, umbrella ×2, lounger, towel ×2,
volleyball net, rock cluster ×2, lifeguard tower, flagpole + flag (3 frames),
boards in sand, café table + chairs, string lights, chalkboard, plaza logo
inlay, fence, gull (2 frames), wave foam, footprints.

**Interior props:** wall board rack, freestanding board rack, product placard,
counter + register, shelves (tees, wax, caps), wicker chair, pouf, round and
rectangle jute rugs, wave mat, wave rug, pendant lamp + glow, hanging vines,
potted palm, monstera, framed posters ×3, window with beach view, rope posts,
log posts, fin table, bench + towel, coffee table, crates, clothes rack (tint
variants), mannequin (tint variants), display table, fitting room, mirrors ×2,
pegboard, wetsuit hanger, board-bag rack, shop sign boards (BOARDS, WEAR, GEAR).

**Characters (16 × 32, 3 × 4 sheets):** player, 3 shopkeepers, 4–6
townsfolk, surfer with board. Optional: sitting and lying frames.
