# SURFBIT — Architecture

How the code is organised, how data flows, and the decisions behind it.
Read this before touching `src/game`, `src/state` or `src/commerce`.

## System overview

```
┌──────────────────────────── Browser ─────────────────────────────┐
│                                                                  │
│   Phaser world (src/game)          React UI (src/components)     │
│   ───────────────────────          ─────────────────────────     │
│   maps, player, NPCs,     ──────▶  HUD, prompt pill, product     │
│   collisions, camera,     Zustand  modal, cart drawer, dialog,   │
│   animations, audio       stores   directory, settings, joystick │
│            ▲              (src/state)            │               │
│            └──────── gameEvents / virtualStick ◀─┘               │
│                       (src/game/bridge.ts)                       │
└───────────────────────────────┬──────────────────────────────────┘
                                │ server components / route handlers
┌───────────────────────────────▼──────────────────────────────────┐
│  Next.js server: src/commerce (CommerceProvider)                 │
│  Provider: mock (demo catalog + checkout, see D16).              │
└──────────────────────────────────────────────────────────────────┘
```

Two systems, one seam each:

| Seam | Direction | Mechanism |
|---|---|---|
| Game → UI | world tells React what's happening | Phaser calls `useUI.getState().setPrompt(...)`, `.openProduct(handle)`, `.openDialog(...)`, `.setLocation(...)` |
| UI → Game | React tells the world to do something | `gameEvents.emit("interact")`, `gameEvents.emit("travel", {...})`, `virtualStick.x/y` |
| Game reads UI | pause input while overlays are open | `isOverlayOpen(useUI.getState())`, `useUI.getState().lastClosedAt` |
| App → Commerce | products, checkout | `commerce` from `src/commerce/index.ts` (server only) |

## Folder layout

Status: ✅ exists · 🔲 to be built (see [ROADMAP.md](ROADMAP.md))

```
src/
├── instrumentation.ts          ✅ reports Next.js server request errors
├── instrumentation-client.ts   ✅ listens for browser errors and unhandled rejections
├── app/                         Next.js App Router
│   ├── layout.tsx            ✅ fonts, metadata, global CSS, store hydration, audio and cart drawer
│   ├── PageAnalytics.tsx     ✅ initial and client-side page views
│   ├── StoreAudio.tsx        ✅ client entry for the shared audio lifecycle
│   ├── globals.css           ✅ design tokens + .sb-btn / .sb-panel
│   ├── page.tsx              ✅ world page, catalog hydration, and HUD
│   ├── page.module.css       ✅ fullscreen canvas and fallback layout
│   ├── World.tsx             ✅ App Router client entry for the world
│   ├── shop/                ✅ catalog grouped by store, filter chips and CSS module
│   ├── products/[handle]/    ✅ prerendered product pages, purchase form and Product JSON-LD
│   ├── robots.ts            ✅ crawler rules and sitemap link
│   ├── sitemap.ts           ✅ town, shop and provider-backed product URLs
│   ├── siteUrl.ts           ✅ shared site origin and product paths
│   ├── checkout/             ✅ checkout review + demo confirmation (with CSS module)
│   ├── api/checkout/route.ts ✅ validates POST lines → commerce.createCheckout
│   └── api/telemetry/route.ts ✅ validates browser telemetry and writes structured logs
├── commerce/                    server-side commerce seam
│   ├── types.ts              ✅ Product, Variant, Money, CommerceProvider, STORES
│   ├── format.ts             ✅ formatMoney, priceRange, findVariant, defaultSelection
│   ├── format.test.ts        ✅ money formatting and variant selection tests
│   ├── index.ts              ✅ `commerce` (server-only) — selects provider
│   ├── mock/catalog.ts       ✅ 30 demo products across six shops
│   ├── mock/provider.ts      ✅ validates combined stock + reprices lines, demo checkout
│   ├── mock/provider.test.ts ✅ checkout repricing and combined stock tests
├── state/                       Zustand stores (client)
│   ├── cart.ts               ✅ global cart, persisted (localStorage, skipHydration)
│   ├── cart.test.ts          ✅ cart line merging, stock limits and removal tests
│   ├── settings.ts           ✅ audio, reduced motion and player appearance, persisted
│   ├── settings.test.ts      ✅ hydration of legacy settings and saved appearances
│   ├── playerAppearance.ts   ✅ appearance options and persisted choice validation
│   ├── ui.ts                 ✅ prompt, product modal, dialog, panels, location, and travel readiness
│   └── catalog.ts            ✅ client copy of products, keyed by handle
├── telemetry/                   first-party instrumentation
│   ├── client.ts             ✅ best-effort same-origin event and error reporting
│   └── events.ts             ✅ event types, route labels and error categories
├── game/                        Phaser world — never imported by server code
│   ├── bridge.ts             ✅ world controls and audio events + virtualStick (Phaser-free)
│   ├── art/                     procedural pixel art
│   │   ├── palette.ts        ✅ the palette (mirror of CSS tokens)
│   │   ├── canvas.ts         ✅ makeCanvas, rect, px, ellipse, box, rng, shade
│   │   ├── font.ts           ✅ 3×5 pixel font for in-world signs
│   │   ├── tiles.ts          ✅ tileset generator, TILE_NAMES, LEGEND
│   │   ├── characters.ts     ✅ character spritesheets, autoOutline, shadow
│   │   ├── props.ts          ✅ PROPS registry, shared props and interaction marker
│   │   ├── townProps.ts      ✅ town foliage, fixtures, beach props, gull and footprints
│   │   ├── shore.ts          ✅ smooth coastline overlay (wet sand, swash, surf lines)
│   │   ├── interiorProps.ts  ✅ shop signs, lighting, plants and fixtures
│   │   ├── shopDisplays.ts   ✅ shop racks, shelves, mannequins and display tables
│   │   ├── workshopProps.ts  ✅ Workshop stations, shaping lights, foam dust and displays
│   │   ├── beachClubProps.ts ✅ Beach Club window, lighting, café furnishings and stations
│   │   ├── motifs.ts         ✅ shared surfboard, shirt and wave-mark drawing
│   │   ├── buildingRoofs.ts  ✅ roof silhouettes, thatch and tile patterns
│   │   └── buildings.ts      ✅ shop façades, cottage fronts and signage
│   ├── textures.ts           ✅ per-map atlas loading and registration under stable texture keys
│   ├── textures.test.ts      ✅ shipped atlas coverage and sheet sizes for the configured maps
│   ├── config.ts             ✅ Phaser game config
│   ├── maps/                 ✅ MapDef types, builders, tests, reference town and lazy interiors
│   │                         ✅ Boards, Wear, Gear, Goods, Workshop and Beach Club interiors + catalog and read-station reachability tests
│   ├── scenes/               ✅ BootScene, MapScene ground, objects and player camera
│   ├── systems/              ✅ Player, collision and its unit tests, object placement, ambient animation, interaction
│   │                         ✅ NPC movement and shared character sprites
│   ├── audio.ts              ✅ Web Audio ambience, shop music and UI cues
│   └── WorldClient.tsx       ✅ React component that mounts Phaser
└── components/                  React UI
    ├── BrandLogo.tsx          ✅ shared SVG logo for the HUD and storefront
    ├── InteractPrompt.tsx     ✅ prompt pill and touch action button (with CSS module)
    ├── Joystick.tsx           ✅ coarse-pointer movement via virtualStick (with CSS module)
    ├── DialogBox.tsx          ✅ NPC and sign dialog (with CSS module)
    ├── CatalogHydrator.tsx    ✅ loads server products into the client catalog
    ├── ProductModal.tsx       ✅ in-world product details and modal controls (with CSS module)
    ├── ProductArt.tsx         ✅ photos and fallback illustrations (with CSS module)
    ├── ProductPurchase.tsx    ✅ variant selection, quantity, and add-to-cart (with CSS module)
    ├── StoreHydrator.tsx      ✅ restores cart and settings after the first client render
    ├── CartDrawer.tsx         ✅ shared cart button, line editing, subtotal, and checkout link (with CSS module)
    ├── Hud.tsx                ✅ world location, cart count, directory, settings, mute, and fullscreen (with CSS module)
    ├── StoreDirectory.tsx     ✅ town shops, travel shortcuts, and storefront links (with CSS module)
    ├── SiteHeader.tsx         ✅ storefront navigation (with CSS module)
    └── SettingsPanel.tsx      ✅ audio, reduced-motion and player appearance controls (with CSS module)
```

✅ `vitest.config.mts` at the repo root configures the Node test environment.

✅ `public/brand/` contains the vector wave mark (also the favicon) and wordmark.

✅ `public/assets/world/` contains the tileset and one packed atlas per map. The
exporter in `scripts/` reads the generators and map definitions. Run
`npm run art:export` after changing art, building designs, NPC looks or prop
tints.

✅ `scripts/tiled-to-mapdef.ts` converts Tiled maps, with a Node launcher and
Vitest coverage in `scripts/`.

✅ `docs/art-references/` contains the town, Boards, and Wear concept images.
[Visual references](ART_DIRECTION.md#visual-references)

## Key rules of the architecture

1. **Phaser is client-only.** Load it with `await import("phaser")` inside a
   `useEffect` (or `next/dynamic` with `ssr: false` from a Client Component).
   Never import anything from `src/game/**` (except `bridge.ts`) in a Server
   Component or in `src/components/**` at module top level.
2. **React never imports Phaser.** UI talks to the game only via
   `src/game/bridge.ts` and Zustand stores.
3. **The world never knows product data.** Map objects reference a product by
   **handle** (`productId: "pixel-fish"`). Titles, prices, stock, images are
   resolved by React from `useCatalog`. Visual tint for a display (board color)
   lives in the map config, not in the catalog.
4. **Commerce is server-only.** `src/commerce/index.ts` imports `server-only`.
   The client receives products as props from a Server Component and hydrates
   `useCatalog`. Checkout goes through a route handler that **re-prices on the
   server**; client prices are display-only snapshots.
5. **Config over code.** New shops, displays, NPCs and signs are added by
   editing map definitions, not by changing systems.

The home page uses `app/World.tsx` as its client entry. Its `WorldClient`
component leaves a frame for the page shell to paint before importing Phaser
and the game configuration inside an effect. The configuration passes the
loaded Phaser runtime to the scene factories. BootScene loads the shared
tileset and town atlas. Each shop's map and atlas load on its first visit,
and the game keeps the registered sheets for return visits.

## Data flow: buying a board

1. `app/page.tsx` (Server Component) awaits `commerce.listProducts()` and
   renders `<CatalogHydrator products={...} />` + `<WorldClient />` + HUD.
2. Player walks into Boards → `MapScene` restarts with map `boards`.
3. Player faces a `display` object with `productId: "pixel-fish"`; the
   interaction system calls `useUI.getState().setPrompt({ verb: "Inspect", label: "pixel-fish" })`.
   `InteractPrompt` resolves the handle to "Pixel Fish" via `useCatalog`.
4. Player presses **E** → `useUI.getState().openProduct("pixel-fish")`.
   Game input pauses while `isOverlayOpen` is true.
5. `<ProductModal>` renders the product, user picks a variant →
   `useCart.getState().add(product, variant, qty)` (persisted).
6. Checkout: `<CheckoutPage>` POSTs `{ lines: [{variantId, quantity}] }` to
   `/api/checkout` → `commerce.createCheckout(lines)` → redirect URL
   (`/checkout/success`). The demo
   confirmation shows the order number and catalog-priced total. It clears the
   hydrated cart once when the return URL and submitted items match.

## Map format (`src/game/maps`)

Maps are TypeScript modules exporting a `MapDef`. Ground is ASCII (one char
per 16×16 tile, legend in `src/game/art/tiles.ts → LEGEND`); everything else
is a typed object list.

```ts
// src/game/maps/types.ts
import type { Dir, Look } from "../art/characters";
import type { PROPS, Tint } from "../art/props";

export type MapKey = "town" | "boards" | "wear" | "gear" | "goods" | "workshop" | "beach-club";

export interface MapDef {
  key: MapKey;
  name: string;                       // shown in HUD, e.g. "SURFBIT Boards"
  kind: "outdoor" | "interior";
  ambience: "beach" | "shop";
  ground: string[];                   // ASCII rows, all the same length
  objects: MapObject[];
  spawns: Record<string, Spawn>;      // "default", "from-boards", "door", …
}

export interface Spawn { x: number; y: number; facing: Dir }

export interface BuildingStyle {
  roof: "thatch" | "terracotta" | "indigo" | "slate";
  wall: string;
  front?: "surfboards" | "flagship" | "gear" | "shaping" | "apparel" | "cafe" | "cottage";
  shutters?: string;                 // cottage shutter color from the palette
  awnings?: { window: string; door: string };
}

export type Interaction =
  | { kind: "enter"; target: MapKey; spawn: string }   // doors into buildings
  | { kind: "exit"; target: MapKey; spawn: string }    // interior exit mat
  | { kind: "product"; productId: string }             // product handle
  | { kind: "read"; title: string; text: string[] }    // signs, posters
  | { kind: "talk"; name: string; lines: string[] };   // NPCs

export type MapObject =
  | { type: "building"; id: string; x: number; y: number; w: number; h: number;
      style: BuildingStyle; label: string; door: { x: number; y: number };
      upcomingStoreName?: string; // optional coming-soon entry in the directory
      interact?: Interaction /* omitted for boarded shops and decorative buildings */ }
  | { type: "prop"; prop: keyof typeof PROPS; x: number; y: number;
      tint?: Tint; interact?: Interaction }
  | { type: "display"; prop: (typeof DISPLAY_PROPS)[number];
      x: number; y: number; productId: string; tint: Tint }
  | { type: "npc"; id: string; x: number; y: number; look: Look;
      behavior: "idle" | "wander"; name: string; lines: string[] };
```

The registry includes the town with the deferred game code. Each shop
ships in a separate chunk that loads on entry.
`DISPLAY_PROPS` in the map types is the allowlist shared with the Tiled importer.

```ts
import town from "./town";

export const MAPS: Record<MapKey, () => Promise<MapDef>> = {
  town: () => Promise.resolve(town),
  boards: () => import("./boards").then((module) => module.default),
  wear: () => import("./wear").then((module) => module.default),
  gear: () => import("./gear").then((module) => module.default),
  goods: () => import("./goods").then((module) => module.default),
  workshop: () => import("./workshop").then((module) => module.default),
  "beach-club": () => import("./beachClub").then((module) => module.default),
};
```

`validateMap` checks the rectangular ground grid, tile characters, object
footprints, doors, NPC homes and spawns. `buildGround` and `buildBlocked` expect valid map
data. Autotiling uses adjacent tiles within the map and picks terrain variants
deterministically by cell coordinates.

Town streets (`:`) and plaza (`#`) use cobblestone variants. Raised planters
(`P`) and retaining walls (`S`) are solid. Stairs (`s`) and the deck (`d`)
are walkable. Stairs directly south of the deck use timber treads. Along the
diagonal shore, north and west foam edges join through inside and outside
corner tiles; corners are drawn diagonally so one-tile steps read as a slope.
Wet sand follows the same shoreline on its south and east edges, with a
diagonal corner tile beside each step.

When every row's water is one run reaching the east edge (the town), the
coast is drawn by the **shore overlay** instead (`art/shore.ts`, shown by
`Ambient`): a smooth line through the bottom-left corner of each row's first
water tile, with a wet-sand band, swash foam, shallows and two broken surf
lines rolling in. It animates in step with the water tiles. Sand under it
stays dry in `buildGround`; collision is still the tile grid.

Neighbour-aware tiles: a planter picks one of 16 rim tiles from which sides
face non-planter ground (`planterTile(mask)`, 1 = north, 2 = east, 4 = south,
8 = west). A retaining wall gets a squared end pillar where it meets anything
other than wall or the map edge. Interior walls (`M`, `G`, `W`) get a skirting
board where the floor (`_`, `o`, `D`) is directly below. A run of doormat tiles
(`D`) draws one mat with a single wave mark across its two halves.

Shop floorboards (`_`) and the Workshop's concrete floor (`o`) use deterministic variants. Interior wood walls
(`M`), sage walls (`G`), cream plaster walls (`W`) and railings (`R`) are solid.
Each two-tile opening (`DD`) is walkable and carries a wave-mat prop with the
exit action.
Use `M`, `G` or `W` for walls and `_` or `o` for floors when adapting a draft map that
used the retired placeholder tiles `V`, `K` or `+`.

### Importing from Tiled

Create a finite orthogonal map with 16 × 16 px tiles. Add
`public/assets/world/tiles.png` as the only tileset, with zero margin and
spacing. Paint a tile layer named `ground` using the terrain tiles listed in
`LEGEND`. Blank cells become solid `X` void. The game generates terrain edges,
autotiles and animation frames from the imported symbols. Choose **CSV** tile
layer format to export numeric tile IDs in the JSON. [Tiled JSON format](https://doc.mapeditor.org/en/stable/reference/json-map-format/)

Add string map properties `key` (a registered `MapKey`), `name` (HUD label),
`kind` (`outdoor` or `interior`) and `ambience` (`beach` or `shop`). Put
objects on top-level object layers with zero offset. Snap points and rectangles
to grid intersections. A point at pixel `(x, y)` anchors the tile `(x/16, y/16)`.
Set each object's class and name, then add a `data` string property containing
the fields below as JSON. Palette fields accept keys from `P` (such as `navy`)
or their exact color values.

| Class | Shape and anchor | Tiled name | `data` fields |
|---|---|---|---|
| `spawn` | Point at the spawn tile | Spawn key such as `default` or `door` | `facing` |
| `building` | Rectangle covering the footprint | Building ID | `style`, `label`, `door` (absolute tile coordinates), optional `upcomingStoreName` and `interact` |
| `prop` | Point at the bottom-left footprint tile | Prop key | Optional `tint` and `interact` |
| `display` | Point at the bottom-left footprint tile | Display prop key | `productId` (catalog handle), `tint` |
| `npc` | Point at the home tile | NPC ID | `look`, `behavior`, `name` (dialog name), `lines` |

For example, set the `data` property on a `spawn` point named `door` to
`{"facing":"up"}`. Include the spawn keys used by the map's entry points.
Export as JSON (`.tmj` or `.json`) and generate a TypeScript module to review
before placing it in `src/game/maps/`.

```bash
npm run --silent map:import -- path/to/boards.tmj > /tmp/boards.ts
```

The importer runs `validateMap` before emitting the module. After replacing
a registered map, run `npm run art:export` to pack its building textures, NPC
looks and prop tints, then run `npm run check`.

### Coordinates and depth (must be consistent everywhere)

- **Units:** map data is in **tiles** (16 px). Systems work in **pixels**.
- **Prop placement:** `(x, y)` is the **bottom-left tile of the footprint**
  (`PropSpec.foot`, default `ceil(w/16) × 1`). The sprite uses origin
  `(0.5, 1)` placed at the footprint's bottom-center:
  `px = (x + foot.w / 2) * 16`, `py = (y + 1) * 16`.
- **Building placement:** `(x, y)` is the top-left tile of the `w × h` rect.
  `door` uses absolute map coordinates inside that rect. Town doors are on
  the bottom row of the building footprint. The façade follows the configured
  door column. Roof, wall and door details are drawn into one texture
  (`building:<map>:<id>`) so the whole building sorts at its base.
- **Collision:** solid props block every tile of their footprint. Buildings
  block their full `w × h` rect except the door tile. Tiles marked
  `solid: true` in `LEGEND` (water, walls, void) block.
- **Depth (y-sorting):** buildings, dynamic things and standing props use
  `depth = bottom pixel y`. `flat` props (rugs, towels, flowers) use
  `depth = 1`. `wall` props use `depth = 2`. Shore overlay `0.5`, footprints `3`,
  gulls and in-world markers `100000`.
- **Interaction point:** center of the first tile row below the footprint,
  aligned with its horizontal center. Building signs use their configured
  door tile center. NPC interaction points follow their sprite, half a tile
  south of the feet so customers can talk across counters.
- **Walk-through threshold:** building travel uses the configured door tile.
  Enter and exit props use their footprint. Arrival spawns sit outside these
  areas so the player can move away from the doorway after arriving.

## Player & collision

- Character frames are 16×32 px with the planted foot's outline on the
  bottom row in every pose. Use a bottom-center sprite origin `(0.5, 1)`.
  The 10×6 px hitbox and 14×5 px shadow are anchored to that same point.
- Collision: Move X then Y, test the four hitbox corners
  against the blocked-tile grid and check for overlap with other characters.
  Cancel the axis that collides. Split long moves into substeps to keep
  characters from skipping solids or one another. No Arcade physics.
- Speed 80 px/s walking, ×1.6 with Shift. Diagonal input is normalised.
  On coarse pointers the joystick writes an analogue vector with a radial
  0.15 dead zone to `virtualStick`. It releases movement when the gesture ends,
  an overlay opens, or travel starts.
- Facing = dominant axis of the input vector; animations are 4-directional.
- Player appearance is stored with local settings. Settings draws the still
  preview from the shared character generator. MapScene applies the saved look
  on entry and subscribes to appearance changes until shutdown. Player redraws
  the canvas-backed `player` texture in place so animation frames keep their keys.
- Camera: `startFollow(player, true)`, bounded to the map with `roundPixels: true`.
  Town zoom is `max(2, floor(viewportHeight / 240))`. Interiors use the
  smallest integer zoom of at least 2× that covers both viewport dimensions.
  Both recalculate zoom when the viewport resizes.
- NPCs start at their home tile centers. Wanderers take short walks within
  three tiles of home and pause between legs. Reduced motion or an open
  overlay pauses wandering. NPCs turn toward the player when spoken to.

## World interactions

The interaction system looks for the closest interaction point within 14 px of
a probe 10 px ahead of the player's feet. It publishes the prompt to
`useUI` and shows a marker at the target. Reduced motion keeps the marker
stationary.

E, Space, Enter and the touch button activate Inspect, Talk and Read. Activation
emits `WORLD_INTERACTION` on the Phaser scene with the selected map
`Interaction` as its payload and the live NPC when present. `MapScene` handles
the action and opens the product modal or dialog. Both overlays use the shared
UI store and return focus to the canvas when closed. Open overlays pause world
interactions. Button activation resumes 250 ms after an overlay closes.

The canvas is in the Tab order with a screen-reader description of the controls.
Tab leaves the canvas for the HUD. Keyboard movement pauses when focus is on
page controls. The HUD and interaction pill announce location and prompt
changes through persistent, polite live regions. A link at the start of the
Tab order opens the catalog directly.

Walking onto a doorway threshold emits `WORLD_INTERACTION` once per crossing.
Player movement stops at the first threshold crossed in a frame. Door actions
and `gameEvents` travel resolve through the same lazy map
registry. The camera fades out, the target map and atlas load, and `MapScene` restarts
at the named spawn and publishes the map name and key to `useUI`. The camera
then fades in. Reduced motion skips both fades. Travel to an unregistered map
leaves the current map active. Movement and prompts pause during travel.

The HUD directory uses `STORES` for the online catalog sections. The town map
publishes its `upcomingStoreName` entries to `useUI`, and the directory uses
`worldReady` to enable travel once the scene can handle it. Choosing **Walk there**
closes the panel and emits a travel request for the shop's `from-<shop>` spawn.

## Audio

The root layout mounts `StoreAudio`. Its Web Audio context unlocks on the first
user gesture. The world publishes the active map's `ambience` through the bridge
and clears it when the world unmounts. Beach and shop ambience use filtered
noise, and interiors add a looping chiptune. Successful world interactions
and add-to-cart actions emit cues through the same bridge. Mute applies to all
audio, and the music and ambience sliders adjust their levels live.

## Analytics and error tracking

Search the application logs (`npm run start` locally or Vercel Runtime Logs)
for `"scope":"surfbit"`. Each entry is a JSON record. `page_view` records the
initial page and changes to the pathname, with product URLs grouped under
`/products/[handle]`. `product_inspect` records an opened world product modal,
`add_to_cart` records a successful addition from the modal or product page,
and `checkout_start` records a submitted checkout review with items.

`client_error` records uncaught browser errors, unhandled rejections and
handled world loading, travel or checkout failures. `server_error` records
errors that Next.js captures with their route and framework digest when
available. Browser events use a same-origin POST with delivery independent of
the user flow. Logged fields are limited to route labels, catalog handles,
and error categories or digests. The collector drops extra fields, including
any raw URLs, query strings, cookies, cart contents, or exception messages.

## Decisions

Adjustments to the [spec](SPEC.md), made deliberately. Change them here first
if you change your mind.

| # | Decision | Why |
|---|---|---|
| D1 | **Mock commerce provider** behind `CommerceProvider` | The world and UI can be built and tested without a store; any real backend stays a drop-in behind the same interface. |
| D2 | **Procedural art** in `src/game/art` defines the original grid, palette and layout | The generators started as placeholders and became the production art source during Phase A (see D14). |
| D3 | **Maps as TypeScript `MapDef`s** (ASCII ground + typed objects) instead of Tiled JSON for the runtime | Type-checked, diff-able, easy for AI agents to edit. The Tiled importer (step 6.2) emits the same `MapDef` modules offline. |
| D4 | **One `MapScene` class** restarted with a map key, instead of one Phaser class per shop | Each restart builds the destination's own map, objects and camera state. Map data is lazy-loaded. |
| D5 | **Free (8-way) movement with 4-directional animation** | Feels smoother than grid-locked 4-way (Stardew-like). To get strict 4-way, zero the minor axis in `Player`. |
| D6 | **Custom tile-grid collision** instead of Arcade physics | Simpler, deterministic, enough for walking. |
| D7 | **Server re-prices at checkout**; client cart holds display snapshots only | Prevents tampering; any future provider keeps the same flow. |
| D8 | **Currency USD** | Fixed by the mock catalog. |
| D9 | **WebAudio-generated ambience/music** until real audio files exist | No asset dependency; replace with files in `public/audio` later. |
| D10 | **Vanilla CSS + CSS Modules** with tokens in `globals.css` (no Tailwind) | Small, explicit, easy to keep pixel-perfect. |
| D11 | **`docs/art-references/` is the visual target**; layouts in `docs/SCENES.md` | One shared picture of "done" for every agent and artist. Concept art guides composition, palette and density; it isn't traced or used as game assets. |
| D12 | **Characters 16 × 32 px** (chibi, Stardew density) on the 16 px tile grid | The references' characters (cap, backpack, readable face) don't fit in 16 × 24. Feet stay at the bottom, so hitboxes are unchanged. |
| D13 | **Town and interiors follow the reference layouts** (cobblestone town, stone wall + stairs, diagonal shoreline, ~20 × 14 interiors) instead of the earlier grass town and boardwalk | Matches the approved look; see roadmap 1.3b and 2.3. |
| D14 | **Production art = the procedural generators in `src/game/art`, upgraded to final quality** (roadmap A.1, revised at A.3). Rounded cobbles, layered water and foam, full palm fronds, coursed thatch, lit shop interiors and shaded characters, all from the palette in code. Hand-drawn PNGs can still replace any texture key later (ART_DIRECTION.md → Replacing placeholder art). Aim for a **bolder pixel look than the references**: fewer colors, cleaner shapes, less tiny detail. | No budget for a commission. The free pack chosen at A.1 (Coastal Village Lite) turned out flatter than the existing generators (3–4 colors per tile, no cobblestone, Mediterranean houses) and is itself made by scripts, so it was kept only as a reference and nothing from it ships. Generators already sit on the grid and palette, keep texture keys stable, and can be iterated by agents. Any third-party art added later must be CC0 or commercial-use and listed in `assets/LICENSES.md`. |
| D15 | **The town coast is a generated overlay, not foam tiles** | A tile grid can only step the shore one tile at a time, which read as a staircase with mismatched wet-sand bands. A per-pixel distance from a line through the step corners gives the reference's smooth diagonal and parallel surf lines. Collision and the map format stay tile-based; maps whose water doesn't form one east-reaching run fall back to the foam tiles. |
| D16 | **No Shopify: the mock provider is the store** (2026-11-27) | SURFBIT is a portfolio site. A free Shopify development store is always password-protected and takes test orders only, and no public mock commerce API has surf products. The mock catalog keeps every product browsable and the demo checkout open to every visitor. The Phase 5 Shopify provider was removed; it's in git history (step 5.1) if a real store is ever needed. |
| D17 | **Export static production art as a tileset and per-map PNG/JSON atlases** | BootScene registers the town sheets and the shared player and effects under their existing texture keys and frame numbers. Shop travel registers the destination atlas on demand. The tileset PNG follows `TILE_NAMES`. Regenerate it when that list changes so the exported tiles and map indices stay in sync. The shoreline stays generated from the map per D15. |
| D18 | **The town ocean has no ambient surfer sprites** | The owner asked to remove the bobbing riders from the water. |
| D19 | **Goods, Workshop and Beach Club open as shops** (owner, 2026-11-27; roadmap Phase B) | Goods is a regular lifestyle shop. The Workshop is exhibit-first: five readable shaping stations and a materials wall, plus a small shop (repair kit, class, blank, board sock, fin plugs); the board configurator stays in Phase 7. SPEC §4 calls the Beach Club a social, informational area, not a traditional shop: it keeps its club content (surf guide, events, brand story, beach kit tips) and also sells surf lessons, board rentals, a season pass and coffee as ordinary catalog products, which gives the portfolio a services and booking case. Briefs: SCENES.md §8–10. |
