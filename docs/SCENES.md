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
| `goods` | SURFBIT | ✅ (flagship, interior §8) | 12 × 8 | Terracotta gable (`terracotta*`) | Cream + wood trim | Largest building, center-north. Big navy `SURFBIT` sign under the gable; blue/white awning over a tee window, orange/white awning over the open door; hibiscus vines on both corners; A-frame sign |
| `gear` | GEAR | ✅ | 9 × 7 | Thatch | Wood planks | Window shows wetsuits on hangers and shelves of bottles; board leaning on the right; navy sign |
| `workshop` | WORKSHOP | ✅ (interior §9) | 10 × 7 | Slate blue (`roofSlate*`) | Wood | Open garage front: surfboard on a shaping stand under a warm lamp; crossed-tools icon on the sign |
| `wear` | WEAR | ✅ | 9 × 7 | Indigo tiles (`roofIndigo*`) | Wood + cream | Two striped awnings (blue/white, orange/white); tees hanging in the windows; tee icons on the sign |
| `beach-club` | BEACH CLUB | ❌ (teaser `read`; interior brief §10) | 12 × 7 + deck 12 × 4 | Indigo tiles | Wood | Walkable wooden deck (`d`) in front with café tables, string lights, chalkboard; stairs from deck to sand; coffee-cup icon on the sign; blue SURFBIT flag on a pole beside it |
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
| Rack A (center-left, on rug) | `sunset-shortboard` (+ decorative boards) | `boardRack` with placard |
| Rack B (center-right, on rug) | `pixel-fish` (+ decorative boards) | `boardRack` with placard |
| Fin table (bottom-right) | `keel-twin-fins` (cross-sell, also in Gear) | `finTable` |
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
| Rack (right, hoodies) | `offshore-hoodie` | `hoodieRack` |
| Mannequin A (tee + floral boardshorts + bucket hat) | `reef-boardshorts` | `shortsMannequin` |
| Mannequin B (hoodie + shorts) | `offshore-hoodie` | `mannequin` |
| Swimwear rail next to the fitting rooms | `tide-one-piece` | `swimRack` |
| Front tables | `logo-tee` / decorative caps | `teeTable` / `capTable` |
| Cap shelf behind the counter | decorative | `capShelf` |

Other dressing: two fitting rooms with cream curtains and wave marks (solid),
wall mirror + standing oval mirror, board rack with 3 decorative boards,
sunset painting, hanging and potted plants, wave rug in the center, jute rugs
under racks and mannequins (each rug centered under its rack; the two-tile tee
rack uses `narrowRug`), log posts at the entrance.

Shopkeeper: curly-haired woman, white cap, cream tee (`idle`, behind the counter).

The Wave Trucker Cap is displayed for sale at Goods (§8).

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
| Leash hooks | `coil-leash` | `leashHooks` |
| Traction pad table | `grip-traction-pad` | `padTable` |
| Board-bag rack | `day-board-bag` | `bagRack` |

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
| Goods shopkeeper (Lani, §8) | Bun, navy SURFBIT tee with cream wave, cream shorts, cream bucket hat |
| Workshop shaper (Rafa, §9) | Short ink hair, beard, foam-dusted grey tee, navy shorts, deep-blue backward cap (optional `apron`) |
| Beach Club host (Malia, §10) | Curly ink hair with a sun-yellow accent, hibiscus tee, cream shorts |
| Surf coach (Ben, §10) | Sun-dark hair, teal wetsuit, barefoot |
| Surfer (`SURFER_LOOK`) | Navy wetsuit (`wetsuit: true`), barefoot, cream board under the arm (`board`): upright at the side from front/back, level across the hips in profile |
| Townsfolk | Mix of skin tones (`skin1..4`), hats (straw, cap, bucket), tees in palette colors |

Every character gets the same finish: shaded far edge of shirt and face, a
collar line, a rounded jaw, two-tone hair with a lit crown, and a cream glint
in each eye so faces read on every skin tone. Dark hair uses `ink`, never
`outline`, so it doesn't merge with the outline.

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

The SVG logo stacks a stepped turquoise wave with a cream crest above bold
pixel caps in Navy Dark (`#0c3b56`) on cream. In-world shop sub-labels
(`BOARDS`, `WEAR`, `GEAR`) are in letter-spaced caps below the wordmark.

---

## 7. Asset checklist (production art)

What a pixel artist, an asset pack or a generator needs to deliver. Keep
texture keys and frame sizes stable (ART_DIRECTION.md → Production art).

**Terrain tiles (16 × 16, with autotile edges):** sand (3 variants), wet sand,
cobblestone street (3), plaza pavers (2), grass/garden bed, raised planter
rim, stone retaining wall (face + top + ends), stone stairs, wooden deck,
water (4 frames), foam edges incl. **diagonal corners** (4 frames), interior
wood floor, wood wall, sage wall, cream plaster wall, wall trim, railing.

**Buildings:** Boards, SURFBIT Goods, Gear, Workshop, Wear, Beach Club (+
deck), 2 cottages. Each split into roof/wall layers if possible, plus a
"coming soon" door overlay.

**Town props:** palm ×2, shrub ×3, hibiscus bush, planter, street lamp,
bench, signpost, notice board, trash bin, umbrella ×2, lounger, towel ×2,
volleyball net, rock cluster ×2, lifeguard tower, flagpole + flag (3 frames),
boards in sand, café table + chairs, string lights, chalkboard, plaza logo
inlay, fence, gull (2 frames), footprints. Planter masonry comes from the
terrain tiles. The shore overlay supplies the town's wave foam.

**Interior props:** wall board rack, freestanding board rack, product placard,
counter + register, shelves (tees, wax, caps), wicker chair, pouf, round and
rectangle jute rugs (`rug`, `narrowRug`), wave mat, wave rug, pendant lamp + glow, hanging vines,
potted palm, monstera, framed posters ×3, window with beach view, rope posts,
log posts, fin table, bench + towel, coffee table, crates, clothes rack (tint
variants), mannequin (tint variants), display table, fitting room, mirrors ×2,
pegboard, wetsuit hanger, board-bag rack, shop sign boards (BOARDS, WEAR, GEAR,
GOODS, WORKSHOP).

**Characters (16 × 32, 3 × 4 sheets):** player, 5 shopkeepers, 4–6
townsfolk, surfer with board. Optional: sitting and lying frames.

**Phase B rooms (§8–10):**
- Tiles: cream plaster wall `wallCream` (`W`, with skirting trim), concrete
  floor `floorConcrete` (`o`, 3 variants with foam dust).
- Goods: `goodsSign`, `shadesStand`, `bottleFridge`, `packHooks`,
  `towelLadder`, `stickerRack`.
- Workshop: `workshopSign`, `toolWall`, `blankRack`, `templateRack`,
  `shapingStand`, `shapingLight`, `foamDust`, `glassingRack`, `sandingTable`,
  `materialsBoard`, `classBoard`, `workbench`, `stationPlacard1`,
  `stationPlacard5`.
- Beach Club: `clubSign`, `seaWindow`, `barCounter`, `beanShelf`,
  `lessonBoard`, `memberBoard`, `guideRack`, `storyFrame`, `dropCrate`.
- Product art kinds: `cap`, `shades`, `backpack`, `towel`, `bottle`,
  `stickers`, `kit`, `ticket`, `blank`, `sock`, `plugs`, `beans`.
- Characters: Lani, Rafa, Malia, Ben.

---

## 8. Goods interior (`goods`)

Coordinates use the map convention: props and displays are anchored at the
bottom-left tile of their footprint in the 20 × 15 room.
Shift a piece by a tile if footprints collide or the aisle closes, and
update the brief in the same change (AGENTS.md).

No reference image. Build it in the language of Boards and Wear (§2–3): same
shell, warm light, plants and wave mats. **Approved for B.2.**

**Mood:** the brand's flagship boutique. Cream plaster back wall with wood
trim (matching the cream-and-wood storefront), warm wood floor, golden
pendant light, tidy displays with room to browse. **Accent: Navy** (`navy*`).

**Size and shell:** 20 × 15 tiles like Gear. Back wall 3 rows of a new
**cream plaster wall tile** (`wallCream`, legend `W`, with the same skirting
trim as `wallWood`). Side columns `M`. Floor `_`. Row 13 is the railing with
the exit mat `DD` at x 9–10. Row 14 is cobble street (`:`), since Goods opens
onto the street.

```
 x: 0    2    4    6    8   10   12   14   16   18 19
 ┌──────────────────────────────────────────────────┐
 │  window   ╔SURFBIT GOODS╗  mirror   [wave print] vines│ cream wall (rows 0–2)
 │      lamp            lamp            lamp      lamp   │
 │ [cap shelf] [shades]          [bottle fridge] Lani    │ row 4
 │                                            [COUNTER] │
 │pack                                          towel    │
 │hooks          [tee table]                    ladder   │ rows 6–8
 │                  ┌─────wave rug─────┐                 │
 │ round rug        └─────────────────┘                 │ row 9
 │ pouf  palm                          sticker rack      │ row 10
 │                                              palm     │
 │▓▓▓▓▓ railing ▓ pot ▓  [wave mat]  ▓ pot ▓ railing ▓▓▓▓│ row 13
 └──────────────────────────────────────────────────┘
```

| Display | Product handle | Prop | Tile (x, y) |
|---|---|---|---|
| Cap shelf (back wall) | `wave-trucker-cap` | `capShelf` (shared with Wear) | (2, 4) |
| Sunglasses stand with a small mirror | `polarized-shades` | `shadesStand` (new) | (6, 4) |
| Glass-door fridge of bottles | `steel-bottle` | `bottleFridge` (new) | (12, 4) |
| Backpack hooks (left wall) | `day-pack` | `packHooks` (new, like `leashHooks`) | (1, 7) |
| Towel ladder (right wall) | `stripe-beach-towel` | `towelLadder` (new) | (18, 7) |
| Spinner rack of sticker packs | `pixel-sticker-pack` | `stickerRack` (new) | (13, 10) |
| Tee table north of the wave rug (cross-sell, also in Wear) | `logo-tee` | `teeTable` | (7, 7) |

| Handle | Title | Category | Art kind | Art color / accent | Options | Price (cents) |
|---|---|---|---|---|---|---|
| `wave-trucker-cap` | Wave Trucker Cap | Cap | `cap` (new) | `navy` / `cream` | Color: Navy, Sand | 3200 |
| `polarized-shades` | Polarized Shades | Sunglasses | `shades` (new) | `gearCharcoal` / `sky` | Frame: Black, Tortoise | 5800 |
| `day-pack` | Day Pack | Backpack | `backpack` (new) | `deepBlue` / `sun` | — | 7400 |
| `stripe-beach-towel` | Stripe Beach Towel | Towel | `towel` (new) | `coral` / `cream` | Color: Coral, Teal | 4200 |
| `steel-bottle` | Steel Bottle | Water bottle | `bottle` (new) | `productTeal` / `cream` | Size: 500 ml, 750 ml (+400) | 2800 |
| `pixel-sticker-pack` | Pixel Sticker Pack | Stickers | `stickers` (new) | `cream` / `coral` | — | 900 |

Descriptions (write them in the catalog, two sentences each like the existing
products): mesh-back cap with an embroidered wave; polarized lenses that cut
glare off the water; a 20 L day pack with a wet pocket; a sand-shedding
cotton towel; a double-wall bottle that keeps water cold all session;
waterproof vinyl stickers of the pixel wave and town.

**Other dressing:** navy sign board `SURFBIT GOODS` with the wave above
(`goodsSign`, built like `gearSign`), window with blinds, wall mirror beside
the shades, a framed wave print, vines, four pendants, round jute rug and
pouf, potted palms, hibiscus pots either side of the mat, navy wave mat.
Fixed positions: `counter` (15, 5), wave print (15, 1) above Lani, wave rug
(8, 9) centered on the doorway with a gap to the tee table, round rug and
pouf (2, 9), palms (4, 10) and
(17, 11), hibiscus pots (8, 13) and (11, 13), and wave mat (9, 13). Spawn
`door` is at (9, 12) facing up. The left palm sits a tile inward to keep
its fronds clear of the pouf.

**Shopkeeper:** Lani (`idle`, behind the counter at (16, 4)): bun, navy SURFBIT tee with a
cream wave mark, cream shorts, cream bucket hat. Lani points shoppers to the
caps by the window and the stickers by the door.

---

## 9. Workshop interior (`workshop`)

Coordinates use the map convention (bottom-left tile of each footprint), as
in §8.

No reference image. Same visual language as §2–4, but a working room.
**Approved for B.3.**

**Mood:** a shaping workshop you can walk through. A numbered path of five
stations shows how a board is made; the shop part is small and sits by the
counter and entrance. Bright shaping lights, foam dust on the floor, tools on
the wall. **Accent: Deep Blue** (`deepBlue`), echoing the slate-blue roof.

**Size and shell:** 20 × 15 tiles. Back wall 3 rows of `M`, side columns `M`.
Floor is a new **concrete floor tile** (`floorConcrete0–2`, legend `o`, three
variants with pale foam-dust specks, drawn to the A.4 standard). Railing and
`DD` exit mat on row 13. Row 14 is cobble street (`:`).

```
 x: 0    2    4    6    8   10   12   14   16   18 19
 ┌──────────────────────────────────────────────────┐
 │ [tool wall]  ╔WORKSHOP ⚒╗  lamp       window   vines │ wood wall (rows 0–2)
 │ ①blank rack ①   ②templates      ④glassing [COUNTER]  │ row 4
 │                                          Rafa          │
 │            light ┌─────────┐ light            materials│
 │                  │③ SHAPING│                  wall     │ rows 6–8
 │ shelf:           │  STAND  │                           │
 │ repair kits      └ foam dust┘                          │
 │       workbench                   sanding table ⑤     │ row 9
 │sock rack     "custom boards"          class board     │ row 11
 │                chalkboard                        crates│
 │▓▓▓▓▓ railing ▓ pot ▓  [wave mat]  ▓ pot ▓ railing ▓▓▓▓│ row 13
 └──────────────────────────────────────────────────┘
```

| Display | Product handle | Prop | Tile (x, y) |
|---|---|---|---|
| Rack of leaning foam blanks (station 1) | `foam-blank` | `blankRack` (new) | (2, 4) |
| Sanding table with fin plugs and a sander (station 5) | `fin-plug-kit` | `sandingTable` (new) | (14, 9) |
| Wall shelf of repair tins | `ding-repair-kit` | `shelf` (tinted) | (1, 7) |
| Board-sock rack | `board-sock` | `bagRack` (tinted) | (1, 11) |
| Class sign-up board with a schedule sheet | `shaping-class` | `classBoard` (new) | (15, 11) |

| Handle | Title | Category | Art kind | Art color / accent | Options | Price (cents) |
|---|---|---|---|---|---|---|
| `ding-repair-kit` | Ding Repair Kit | Repair | `kit` (new) | `sun` / `gearCharcoal` | Resin: Polyester, Epoxy | 2400 |
| `shaping-class` | Shaping Class | Class | `ticket` (new) | `deepBlue` / `cream` | Session: Saturday, Sunday | 34000 |
| `foam-blank` | PU Foam Blank | Blank | `blank` (new) | `cream` / `finBrown` | Length: 6′4″, 7′2″ (+1500), 9′2″ (+4000) | 12500 |
| `board-sock` | Board Sock | Board cover | `sock` (new) | `sky` / `navy` | Length: 6′0″, 7′0″, 9′0″ | 3600 |
| `fin-plug-kit` | Fin Plug Kit | Fin system | `plugs` (new) | `gearCharcoal` / `sun` | Setup: Thruster, Quad | 3900 |

The class is a one-day session: stock is the number of seats left, and the
description says what's included (your own blank shaped under supervision).

**Read stations** (`read` props). Stations 1 and 5 use a small numbered
placard on a post (`stationPlacard1`, `stationPlacard5`) beside their display;
stations 2–4 are the props themselves and carry the number as a small deep-blue
tag. Titles in the map are prefixed with the number (`1 · The blank`):

| # | Title | Text | Placard / prop at |
|---|---|---|---|
| 1 | The blank | Every board starts as a foam blank with a wooden stringer down the middle. We choose the blank for the length and rocker the board needs. | (4, 5) |
| 2 | Outline and rocker | Templates trace the outline onto the blank. The planer then sets the rocker, the curve from nose to tail that decides how the board fits the wave. | `templateRack` (new) at (7, 4) |
| 3 | Rails | Rails are the board's edges. Soft rails forgive, hard rails release water and bite. Most of the shaping hours go here. | `shapingStand` (new) at (9, 7) |
| 4 | Glassing | Fiberglass cloth and resin seal the foam: two layers on the deck, one on the bottom for a standard layup. | `glassingRack` (new) at (12, 4) |
| 5 | Sanding and fins | Sanding fairs the glass, then the fin boxes go in. The board cures for a week before its first surf. | (17, 9), beside the 3-tile sanding table |
| — | Foam and resin | PU foam with polyester resin: the classic feel, flexible and lively. EPS foam with epoxy: lighter, floatier and tougher against dings. | `materialsBoard` (new) at (18, 6) |
| — | Custom boards | Design your own shape, size and colors here in a later version of the shop. | `chalkboard` (town prop) at (6, 11) |

**Other dressing:** navy `WORKSHOP` sign board with the crossed-tools icon
(`workshopSign`, matching the storefront), a tool wall (planer, sander,
rasps, calipers as silhouettes; `toolWall`, wall-mounted), two tall shaping
lights either side of the stand (`shapingLight`, warm tubes; flicker only
without reduced motion), a flat foam-dust patch under the stand
(`foamDust`, `flat`), a workbench with clamps (`workbench`), crates, a
window, vines, pendants, hibiscus pots at the entrance, a deep-blue wave mat.
Fixed positions: `toolWall` (2, 1), sign (7, 1), window (15, 2), vines
(17, 1), pendants (5, 1), (13, 1) and (18, 1), `counter` (15, 5), shaping
lights (7, 6) and (12, 6), foam dust (9, 8), `workbench` (4, 9), crates
(17, 12) and (18, 12), wave mat (9, 13), spawn `door` (9, 12) facing up. The
workbench and sock rack sit a tile apart so the tall socks don't cover the
bench.

**Shopkeeper:** Rafa the shaper (`idle`, behind the counter at (16, 4)): short ink hair,
beard, grey tee (`bagSilver`), navy shorts, deep-blue backward
cap and a wood-dark shop apron (the `apron` option on `Look`). Rafa points
shoppers along the numbered stations and to the class board.

---

## 10. Beach Club interior (`beach-club`)

No reference image. Same visual language as §2–4, opening onto the deck.
**Awaiting owner approval (roadmap B.1).** See ARCHITECTURE.md → D19 for why the club
sells lessons, rentals, a pass and coffee.

**Mood:** a breezy club house. A big window over the sea fills the back wall,
string lights hang over a lounge, a coffee bar sits on the left and a
surf-school corner with softboards and wetsuits on the right. Boards you can
rent, a guide to read, and the week's events. **Accent: Sky** (`sky`), with
hibiscus pinks in the plants.

**Size and shell:** 20 × 15 tiles. Back wall 3 rows of `M`, side columns `M`.
The floor is the **deck tile** (`d`) so the room reads as a continuation of
the deck outside; no new floor tile. Railing and `DD` exit mat on row 13.
Row 14 is deck (`d`).

```
 x: 0    2    4    6    8   10   12   14   16   18 19
 ┌──────────────────────────────────────────────────┐
 │ sunset print ╔BEACH CLUB ☕╗ [══ SEA WINDOW ══]  vines │ wood wall (rows 0–2)
 │  string lights ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~      │
 │ [BAR COUNTER ☕] [bean shelf]  [lesson board] wetsuits│ row 4
 │   Malia                                      Ben      │
 │                 café table                            │
 │ guide  ┌round rug┐                       softboard     │ rows 7–9
 │ rack   │ wicker  │ coffee table          rack (rental) │
 │        └ pouf ───┘                        member board │
 │                                                        │
 │ story easel                         events   next-drop │ row 11
 │                                      board    crate    │
 │▓▓▓▓▓ railing ▓ pot ▓  [wave mat]  ▓ pot ▓ railing ▓▓▓▓│ row 13
 └──────────────────────────────────────────────────┘
```

| Display | Product handle | Prop | Tile (x, y) |
|---|---|---|---|
| Wall shelf of coffee bags beside the bar | `club-coffee-beans` | `beanShelf` (new) | (7, 4) |
| Whiteboard with a lesson schedule and a wave sketch | `surf-lesson` | `lessonBoard` (new) | (12, 4) |
| Softboard rack (rental boards) | `board-rental` | `boardRack` (tinted) | (15, 8) |
| Framed member card on an easel | `season-pass` | `memberBoard` (new) | (18, 9) |

| Handle | Title | Category | Art kind | Art color / accent | Options | Price (cents) |
|---|---|---|---|---|---|---|
| `surf-lesson` | Surf Lesson | Lesson | `ticket` | `teal` / `cream` | Type: Group, Private (+4000); Session: Morning, Afternoon | 6500 |
| `board-rental` | Board Rental | Rental | `board` | `sky` / `cream` | Board: Softboard, Mid-length; Time: Half day, Full day (+1500) | 2500 |
| `season-pass` | Season Pass | Membership | `ticket` | `sun` / `navy` | — | 24000 |
| `club-coffee-beans` | Club Coffee Beans | Coffee | `beans` (new) | `finBrown` / `cream` | Grind: Whole bean, Ground | 1800 |

Lessons and rentals are ordinary products: stock is the spots or boards left
for that option, and they go through the same cart and checkout. Their
descriptions say what's included (board and wetsuit for lessons; leash for
rentals); the season pass covers unlimited rentals and member events.

**Read stations** (`read` props):

| Title | Text | Prop at |
|---|---|---|
| Surf guide | Lineup etiquette: the surfer closest to the peak has the wave. Don't drop in, and paddle wide of anyone riding. / Watch a few sets before you paddle out, and use the channel where waves don't break to get back out. | `guideRack` (new, magazine rack) at (1, 8) |
| Tides and events | Dawn patrol meets here every Saturday at 6:30. / Beach clean-up on the first Sunday of the month. / Tides are posted on this board every morning. | `noticeBoard` (town prop) at (14, 11) |
| Our story | SURFBIT started as a board rack behind a beach shack. Every board, tee and fin we sell is tested in these waves first. | `storyFrame` (new, photo easel) at (2, 11) |
| Next drop | Something's under the tarp. The next SURFBIT collection lands with the summer swell. | `dropCrate` (new, tarp-covered crate with a NEXT DROP tag) at (17, 11) |

**Other dressing:** navy `BEACH CLUB` sign board with the coffee-cup icon
(`clubSign`, matching the storefront), a 4-tile sea window with sky, horizon
and a wave line (`seaWindow`, wall-mounted at x 12–15), a sunset print,
string lights across the ceiling (reuse `stringLights` if it reads indoors,
else an interior variant), a bar counter with an espresso machine and cups
(`barCounter`, 4 tiles), a café table with chairs (`cafeTable`), round rug,
wicker chair, pouf and coffee table, two wetsuit hangers (decorative), potted
palms and hibiscus, a sky-blue wave mat.
Fixed positions: `barCounter` (1, 5), `cafeTable` (9, 6), round rug +
wicker chair + pouf + coffee table around (4, 8), wetsuit hangers (17, 4) and
(18, 4), wave mat (9, 13), spawn `door` (9, 12) facing up.

**Host:** Malia (`idle`, behind the bar at (2, 4)): curly ink hair with a sun-yellow
accent, hibiscus tee, cream shorts. **Surf coach:** Ben (`idle`, school
corner at (16, 6)): sun-dark hair, teal wetsuit (`wetsuit: true`), barefoot. Their lines
invite you to book a lesson or rent a board; no prices.
