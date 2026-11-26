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
│  mock provider today → Shopify Storefront provider later         │
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
├── app/                         Next.js App Router
│   ├── layout.tsx            ✅ fonts, metadata, global CSS
│   ├── globals.css           ✅ design tokens + .sb-btn / .sb-panel
│   ├── page.tsx              ✅ world page and no-JavaScript fallback → 🔲 HUD
│   ├── page.module.css       ✅ fullscreen canvas and fallback layout
│   ├── World.tsx             ✅ App Router client entry for the world
│   ├── shop/page.tsx         🔲 direct shopping mode (all products)
│   ├── products/[handle]/    🔲 SEO product pages (generateStaticParams)
│   ├── checkout/             🔲 checkout review + success pages
│   └── api/checkout/route.ts 🔲 POST → commerce.createCheckout
├── commerce/                    server-side commerce seam
│   ├── types.ts              ✅ Product, Variant, Money, CommerceProvider, STORES
│   ├── format.ts             ✅ formatMoney, priceRange, findVariant, defaultSelection
│   ├── format.test.ts        ✅ money formatting and variant selection tests
│   ├── index.ts              ✅ `commerce` (server-only) — selects provider
│   ├── mock/catalog.ts       ✅ 15 demo products across the three shops
│   ├── mock/provider.ts      ✅ validates + reprices lines, fake checkout
│   └── shopify/              🔲 Storefront API provider
├── state/                       Zustand stores (client)
│   ├── cart.ts               ✅ global cart, persisted (localStorage, skipHydration)
│   ├── cart.test.ts          ✅ cart line merging, stock limits and removal tests
│   ├── settings.ts           ✅ audio + reduced motion, persisted
│   ├── ui.ts                 ✅ prompt, product modal, dialog, panels, location
│   └── catalog.ts            ✅ client copy of products, keyed by handle
├── game/                        Phaser world — never imported by server code
│   ├── bridge.ts             ✅ gameEvents + virtualStick (Phaser-free)
│   ├── art/                     procedural placeholder pixel art
│   │   ├── palette.ts        ✅ the palette (mirror of CSS tokens)
│   │   ├── canvas.ts         ✅ makeCanvas, rect, px, ellipse, box, rng, shade
│   │   ├── font.ts           ✅ 3×5 pixel font for in-world signs
│   │   ├── tiles.ts          ✅ tileset generator, TILE_NAMES, LEGEND
│   │   ├── characters.ts     ✅ character spritesheets, autoOutline, shadow
│   │   ├── props.ts          ✅ PROPS registry + effects (gull, wave, surfer…)
│   │   ├── interiorProps.ts  ✅ procedural signs, furniture and shop displays
│   │   ├── motifs.ts         ✅ shared surfboard, shirt and wave-mark drawing
│   │   └── buildings.ts      ✅ procedural shop façades and signage
│   ├── textures.ts           ✅ generated textures and lazy prop tints
│   ├── config.ts             ✅ Phaser game config
│   ├── maps/                 ✅ MapDef types, builders, tests, reference town and lazy loader
│   │                         ✅ Boards, Wear and Gear interiors + catalog reachability tests
│   ├── scenes/               ✅ BootScene, MapScene ground, objects and player camera
│   ├── systems/              ✅ Player, collision and its unit tests, object placement, ambient animation, interaction
│   │                         🔲 Npc
│   ├── audio.ts              🔲 WebAudio ambience + music
│   └── WorldClient.tsx       ✅ React component that mounts Phaser
└── components/                  React UI
    ├── InteractPrompt.tsx     ✅ prompt pill and touch action button (with CSS module)
    └── …                      🔲 HUD, ProductModal, CartDrawer, DialogBox
```

✅ `vitest.config.mts` at the repo root configures the Node test environment.

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
component imports Phaser and the game configuration inside an effect. The
configuration passes the loaded Phaser runtime to the scene factories.

## Data flow: buying a board

1. `app/page.tsx` (Server Component) awaits `commerce.listProducts()` and
   renders `<CatalogHydrator products={...} />` + `<WorldClient />` + HUD.
2. Player walks into Boards → `MapScene` restarts with map `boards`.
3. Player faces a `display` object with `productId: "pixel-fish"`; the
   interaction system calls `useUI.getState().setPrompt({ verb: "Inspect", label: "pixel-fish" })`.
   The HUD resolves the handle to "Pixel Fish" via `useCatalog`.
4. Player presses **E** → `useUI.getState().openProduct("pixel-fish")`.
   Game input pauses while `isOverlayOpen` is true.
5. `<ProductModal>` renders the product, user picks a variant →
   `useCart.getState().add(product, variant, qty)` (persisted).
6. Checkout: `<CheckoutPage>` POSTs `{ lines: [{variantId, quantity}] }` to
   `/api/checkout` → `commerce.createCheckout(lines)` → redirect URL
   (mock: `/checkout/success`, Shopify: hosted `checkoutUrl`).

## Map format (`src/game/maps`)

Maps are TypeScript modules exporting a `MapDef`. Ground is ASCII (one char
per 16×16 tile, legend in `src/game/art/tiles.ts → LEGEND`); everything else
is a typed object list.

```ts
// src/game/maps/types.ts
import type { Dir, Look } from "../art/characters";
import type { PROPS, Tint } from "../art/props";

export type MapKey = "town" | "boards" | "wear" | "gear";

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
  front?: "surfboards" | "flagship" | "gear" | "shaping" | "apparel" | "cafe";
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
      interact?: Interaction /* omitted for boarded shops and decorative buildings */ }
  | { type: "prop"; prop: keyof typeof PROPS; x: number; y: number;
      tint?: Tint; interact?: Interaction }
  | { type: "display"; prop: "boardDisplay" | "boardRack" | "finTable"
        | "clothesRack" | "hoodieRack" | "swimRack" | "mannequin" | "shortsMannequin" | "teeTable"
        | "shelf" | "pegboard" | "wetsuitHanger" | "leashHooks" | "bagRack" | "padTable";
      x: number; y: number; productId: string; tint: Tint }
  | { type: "npc"; id: string; x: number; y: number; look: Look;
      behavior: "idle" | "wander"; name: string; lines: string[] };
```

The registry maps each `MapKey` to a lazy loader so the town and each shop
ship in separate chunks.

```ts
export const MAPS: Record<MapKey, () => Promise<MapDef>> = {
  town: () => import("./town").then((module) => module.default),
  boards: () => import("./boards").then((module) => module.default),
  wear: () => import("./wear").then((module) => module.default),
  gear: () => import("./gear").then((module) => module.default),
};
```

`validateMap` checks the rectangular ground grid, tile characters, object
footprints, doors and spawns. `buildGround` and `buildBlocked` expect valid map
data. Autotiling uses adjacent tiles within the map and picks terrain variants
deterministically by cell coordinates.

Town streets (`:`) and plaza (`#`) use cobblestone variants. Raised planters
(`P`) and retaining walls (`S`) are solid. Stairs (`s`) and the deck (`d`)
are walkable. Stairs directly south of the deck use timber treads. Along the
diagonal shore, north and west foam edges join through inside and outside
corner tiles. Wet sand follows the same shoreline on its south and east edges.

Shop floorboards (`_`) use deterministic variants. Interior wood walls
(`M`), sage walls (`G`) and railings (`R`) are solid. Each two-tile
opening (`DD`) is walkable and carries a wave-mat prop with the exit action.

### Coordinates and depth (must be consistent everywhere)

- **Units:** map data is in **tiles** (16 px). Systems work in **pixels**.
- **Prop placement:** `(x, y)` is the **bottom-left tile of the footprint**
  (`PropSpec.foot`, default `ceil(w/16) × 1`). The sprite uses origin
  `(0.5, 1)` placed at the footprint's bottom-center:
  `px = (x + foot.w / 2) * 16`, `py = (y + 1) * 16`.
- **Building placement:** `(x, y)` is the top-left tile of the `w × h` rect.
  `door` uses absolute map coordinates inside that rect. Town doors are on
  the bottom row of the building footprint. The façade follows the configured
  door column and uses the texture key `building:<map>:<id>`.
- **Collision:** solid props block every tile of their footprint. Buildings
  block their full `w × h` rect except the door tile. Tiles marked
  `solid: true` in `LEGEND` (water, walls, void) block.
- **Depth (y-sorting):** buildings, dynamic things and standing props use
  `depth = bottom pixel y`. `flat` props (rugs, towels, flowers) use
  `depth = 1`. `wall` props use `depth = 2`. Footprints `3`, wave foam `4`,
  gulls and in-world markers `100000`.
- **Interaction point:** center of the first tile row below the footprint,
  aligned with its horizontal center. Building doors use their configured
  door tile center. Enter and exit props use the center of the footprint's
  bottom tile row.

## Player & collision

- Character frames are 16×32 px with the planted foot's outline on the
  bottom row in every pose. Use a bottom-center sprite origin `(0.5, 1)`.
  The 10×6 px hitbox and 14×5 px shadow are anchored to that same point.
- Collision: Move X then Y, test the four hitbox corners
  against the blocked-tile grid; cancel the axis that collides. Split long
  moves into substeps to prevent skipping solid tiles. No Arcade physics.
- Speed 80 px/s walking, ×1.6 with Shift. Diagonal input is normalised.
- Facing = dominant axis of the input vector; animations are 4-directional.
- Camera: `startFollow(player, true)`, bounded to the map, integer zoom
  `max(2, floor(viewportHeight / 240))`, `roundPixels: true`.

## World interactions

The interaction system looks for the closest interaction point within 14 px of
a probe 10 px ahead of the player's feet. It publishes the prompt to
`useUI` and shows a marker at the target. Reduced motion keeps the marker
stationary.

E, Space, Enter and the touch button share one activation path. Activation
emits `WORLD_INTERACTION` on the Phaser scene with the selected map
`Interaction` as its payload. `MapScene` handles door actions. Dialogs and
product overlays subscribe in their respective roadmap steps. Open overlays
and a 250 ms cooldown after closing an overlay block activation.

Door actions and `gameEvents` travel resolve through the same lazy map
registry. The camera fades out, the target map loads, and `MapScene` restarts
at the named spawn and publishes the map name and key to `useUI`. The camera
then fades in. Reduced motion skips both fades. Travel to an unregistered map
leaves the current map active. Movement and prompts pause during travel.

## Decisions

Adjustments to the [spec](SPEC.md), made deliberately. Change them here first
if you change your mind.

| # | Decision | Why |
|---|---|---|
| D1 | **Mock commerce provider first**, Shopify behind `CommerceProvider` | The world and UI can be built and tested without a store; Shopify is a drop-in (roadmap phase 5). |
| D2 | **Procedural placeholder art** in `src/game/art` until production pixel art exists (roadmap Phase A) | Lets the game be built and tested now with the right grid, palette and layout. It can't reach the detail of the references; real assets replace generators **with the same texture keys and frame sizes**. |
| D3 | **Maps as TypeScript `MapDef`s** (ASCII ground + typed objects) instead of Tiled JSON for the MVP | Type-checked, diff-able, easy for AI agents to edit. A Tiled importer that outputs the same `MapDef` can be added later (phase 6) without touching systems. |
| D4 | **One `MapScene` class** restarted with a map key, instead of one Phaser class per shop | Each restart builds the destination's own map, objects and camera state. Map data is lazy-loaded. |
| D5 | **Free (8-way) movement with 4-directional animation** | Feels smoother than grid-locked 4-way (Stardew-like). To get strict 4-way, zero the minor axis in `Player`. |
| D6 | **Custom tile-grid collision** instead of Arcade physics | Simpler, deterministic, enough for walking. |
| D7 | **Server re-prices at checkout**; client cart holds display snapshots only | Prevents tampering; same flow for mock and Shopify. |
| D8 | **Currency USD** (placeholder) | Set by the real store once Shopify is connected. |
| D9 | **WebAudio-generated ambience/music** until real audio files exist | No asset dependency; replace with files in `public/audio` later. |
| D10 | **Vanilla CSS + CSS Modules** with tokens in `globals.css` (no Tailwind) | Small, explicit, easy to keep pixel-perfect. |
| D11 | **`docs/art-references/` is the visual target**; layouts in `docs/SCENES.md` | One shared picture of "done" for every agent and artist. Concept art guides composition, palette and density; it isn't traced or used as game assets. |
| D12 | **Characters 16 × 32 px** (chibi, Stardew density) on the 16 px tile grid | The references' characters (cap, backpack, readable face) don't fit in 16 × 24. Feet stay at the bottom, so hitboxes are unchanged. |
| D13 | **Town and interiors follow the reference layouts** (cobblestone town, stone wall + stairs, diagonal shoreline, ~20 × 14 interiors) instead of the earlier grass town and boardwalk | Matches the approved look; see roadmap 1.3b and 2.3. |
