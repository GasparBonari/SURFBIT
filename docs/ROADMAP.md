# SURFBIT — Roadmap

Ordered, bite-sized steps from the current foundation to the MVP and beyond.
Agents (Codex, Claude) and humans work **top to bottom, one step at a time**.

## How to use this file

1. Pick the **first unchecked step** whose dependencies are done.
2. Read the docs it links to. Build **only** that step.
3. Meet every acceptance criterion, then run `npm run check`.
4. Tick the box (`- [x]`), add a one-line note under **Changelog** at the
   bottom. **Don't commit** — the owner commits. Suggest a message instead:
   `feat(world): 1.4 player movement and collision`.
5. If a step is too big, split it here into `1.4a`, `1.4b` before coding.
   Visual steps (anything that renders) also need a screenshot compared with
   the matching image in `docs/art-references/`, with the main differences
   listed in your summary.
6. If you must deviate from the spec or architecture, record it in
   [ARCHITECTURE.md → Decisions](ARCHITECTURE.md#decisions) as part of the same change.

Legend: **Files** = files to create/edit · **Accept** = done when all true.

---

## Phase 0 — Foundation ✅

- [x] **0.1 Scaffold** — Next.js 16 (App Router, TS, ESLint), Phaser 3.90,
  Zustand 5, `server-only`. Scripts: `dev`, `build`, `lint`, `typecheck`, `check`.
- [x] **0.2 Design tokens** — `src/app/globals.css` (`--sb-*`, `.sb-btn`,
  `.sb-panel`), fonts (Press Start 2P + Inter) in `layout.tsx`, palette
  placeholder page.
- [x] **0.3 Commerce seam** — `src/commerce/types.ts`, `format.ts`,
  `mock/catalog.ts` (15 products), `mock/provider.ts`, `index.ts`.
- [x] **0.4 State stores** — `src/state/{cart,settings,ui,catalog}.ts`.
- [x] **0.5 Art foundation** — `src/game/art/{palette,canvas,font,tiles,characters,props}.ts`,
  `src/game/bridge.ts`.
- [x] **0.6 Docs & rules** — `AGENTS.md`, `CLAUDE.md`, `docs/*`.

---

## Phase 1 — World engine core

Goal: walk a character around an animated beach town with collisions.

- [x] **1.1 Tests setup**
  - Files: `package.json`, `package-lock.json`, `vitest.config.mts`,
    `src/commerce/format.test.ts`, `src/state/cart.test.ts`
  - Do: use Vitest 4 for compatibility with `@types/node` 20. Add the
    `"test": "vitest run"` script and run it in `check`. Test `formatMoney`,
    `findVariant`, `defaultSelection`, cart `add` (merging and clamping to stock),
    and removal via `setQuantity(0)`.
  - Accept: `npm test` passes; `npm run check` runs tests.

- [x] **1.2 Map types, builder and the town map**
  - Files: `src/game/maps/types.ts`, `src/game/maps/build.ts`, `src/game/maps/town.ts`, `src/game/maps/index.ts`, `src/game/maps/build.test.ts`
  - Do:
    - Create `MapDef`, `MapObject`, `Interaction`, `Spawn`, `MapKey` exactly as in [ARCHITECTURE.md → Map format](ARCHITECTURE.md#map-format-srcgamemaps).
    - `build.ts`: pure functions (no Phaser) —
      `buildGround(def)` → `number[][]` tile indices (random variant per cell via seeded hash of x,y; `#` plaza alternates checker; sand directly above water → `sandWet`; grass directly above non-grass → `grassEdge`; water directly below a non-water tile → `foam0`);
      `buildBlocked(def)` → `boolean[][]` (solid legend tiles + solid prop footprints + building rects minus door tile);
      `validateMap(def)` throws if rows differ in length, unknown chars, objects out of bounds, or spawns on blocked tiles.
    - `town.ts`: ~60×44 tiles. North→south: grass town with buildings, central plaza (`#`) with the `statue`, paths (`:`), a full-width boardwalk (`=`), beach (`.`), ocean (`~`) along the bottom ~9 rows, a short pier (`|`) into the water. Buildings: **Boards, Wear, Gear** (enterable), **Goods, Workshop, Beach Club** (no `interact` = "coming soon"). Decorate with palms, bushes, flowers, benches, lamps, umbrellas, towels, surf rack, lifeguard tower, flags, a welcome `sign`. Border the map with palms/bushes so edges feel natural. Spawns: `default` (plaza), `from-boards`, `from-wear`, `from-gear` (one tile below each door, facing down).
    - `index.ts`: lazy `MAPS` loaders.
  - Accept: unit tests cover `buildGround` autotiling, `buildBlocked`, and `validateMap` passing on `town`.

- [x] **1.3 Mount Phaser in Next.js**
  - Files: `src/game/config.ts`, `src/game/WorldClient.tsx`, `src/game/scenes/bootScene.ts`, `src/game/scenes/mapScene.ts` (stub), `src/game/textures.ts`, `src/app/World.tsx`, `src/app/page.tsx`, `src/app/page.module.css`
  - Do:
    - `WorldClient.tsx` (`"use client"`): full-viewport `<div>`; in `useEffect`, `const Phaser = await import("phaser")`, create the game, destroy it on unmount (guard against React strict-mode double mount).
    - Config: `type: AUTO`, `pixelArt: true`, `roundPixels: true`, `backgroundColor: P.water`, `scale.mode: RESIZE`, no physics.
    - `textures.ts`: `registerTextures(scene)` adds the tileset (`buildTileset`), player sheet (`buildCharacterSheet(PLAYER_LOOK)`), shadow, every `PROPS` entry (frames added with `texture.add(i, 0, x, 0, w, h)`), gull/wave/footprint/marker. Export `ensureTinted(scene, propKey, tint)` that lazily generates `"${prop}:${color}:${accent}"`.
    - `BootScene` calls `registerTextures`, then starts `MapScene` with `{ map: "town", spawn: "default" }`.
    - `MapScene` stub: loads the `MapDef` and renders the ground at 2× zoom with `this.make.tilemap({ data, tileWidth: 16, tileHeight: 16 })` + `addTilesetImage`.
    - `page.tsx`: render `<WorldClient />` through the App Router client entry in `World.tsx`. Include a `<noscript>` fallback with a link to `/shop`, which is implemented in step 3.4.
  - Accept: `npm run dev` shows the town ground, crisp at integer zoom, no console errors, no SSR errors, `npm run build` passes.

- [x] **1.3b Town layout to match the reference**
  - Files: `src/game/art/tiles.ts`, `src/game/maps/town.ts`, `src/game/maps/types.ts`, `src/game/maps/build.ts`, `src/game/maps/build.test.ts`, `src/game/art/props.ts`
  - Do: rework the town to [SCENES.md → Beach town](SCENES.md#1-beach-town-town) (reference: `docs/art-references/beach-town.webp`).
    - Legend/tiles: `:` becomes cobblestone street, `#` plaza pavers (both in `stone*`/`grout`). Add `P` raised planter (solid), `S` stone retaining wall (solid), `s` stone stairs, `d` wooden deck. Drop the full-width boardwalk and the pier.
    - Ground: cobblestone town, planted beds instead of open lawn, stone wall with 2 stair openings plus deck stairs, beach below, **diagonal shoreline** in the bottom-right (stair-stepped, with foam corner tiles).
    - Objects: building positions, sizes and roof materials from the SCENES.md table (`goods` is the 12 × 8 terracotta flagship; `beach-club` gets a deck); signpost, notice board, planters, plaza logo inlay, loungers, volleyball net, rock clusters, trash bins. Add any missing `PROPS` as simple placeholders.
    - Extend `BuildingStyle` if needed (e.g. `roof: "thatch" | "terracotta" | "indigo" | "slate"`, `awnings`) and update ARCHITECTURE.md.
  - Accept: `validateMap` passes and tests cover the new legend and foam corners. Compare a screenshot of the terrain and configured shop footprints and props with `beach-town.webp` to verify the composition. Step 1.5 adds the in-game façades and prop layer.

- [x] **1.3c Characters at 16 × 32**
  - Files: `src/game/art/characters.ts`, `src/game/textures.ts`, ARCHITECTURE.md (hitbox notes)
  - Do: `CHAR_H = 32`, chibi proportions per ART_DIRECTION.md. Support caps (forward/backward), straw and bucket hats, a backpack, beards, curly hair and ponytails in `Look`. `PLAYER_LOOK` = the player in [SCENES.md → Characters](SCENES.md#5-characters). Export the three shopkeeper looks.
  - Accept: sheet is 48 × 128; all 4 directions × 3 frames read clearly at 3× zoom; feet stay on the bottom row so the hitbox and shadow need no changes.

- [x] **1.4 Player movement, collision, camera**
  - Files: `src/game/systems/Player.ts`, `src/game/systems/collision.ts`, `src/game/systems/collision.test.ts`, `src/game/scenes/mapScene.ts`
  - Do: implement per [ARCHITECTURE.md → Player & collision](ARCHITECTURE.md#player--collision). Keys: WASD + arrows, Shift to run; register keys with `enableCapture = false` so form inputs keep working. Read `virtualStick` too. Walk animations at 8 fps; idle = stand frame of last facing. Shadow sprite follows the feet. Camera follows with integer zoom, recomputed on resize. Pause movement (and `resetKeys()`) while `isOverlayOpen(useUI.getState())`.
  - Accept: smooth movement; cannot walk through water, buildings or solid props; slides along walls; camera clamped to map; collision helper unit-tested.

- [x] **1.5 Buildings and props with y-sorting**
  - Files: `src/game/art/buildings.ts`, `src/game/systems/objects.ts`, `src/game/scenes/mapScene.ts`
  - Do: `buildBuilding(w, h, style, label)` → canvas: roof ≈ top 45% in the building's roof material (thatch, terracotta gable, indigo tiles, slate), plank walls, centered door, windows, a **navy sign board with the wave mark** and the label in cream; per-shop signature details from the [SCENES.md buildings table](SCENES.md#buildings) (awnings, boards leaning outside, window displays, open garage, deck). "Coming soon" buildings get boards across the door + a `SOON` tag. Use selective outlines (ART_DIRECTION.md). Spawn all objects per the coordinate/depth rules in ARCHITECTURE.md.
  - Accept: player passes behind palms/buildings when north of their base and in front when south; flat props are always under the player; each shop is recognisable from its silhouette and sign, as in `beach-town.webp`.

- [x] **1.6 Environmental animation**
  - Files: `src/game/systems/{ambient,objects}.ts`, `src/game/scenes/mapScene.ts`,
    `src/game/art/props.ts`, `src/game/textures.ts`, `src/state/settings.ts` (read only)
  - Do: water/foam tile frame cycling (300 ms); palm sway frames (randomised phase); flags; gulls crossing the sky; wave foam arcs travelling toward the shore and fading; temporary footprints when walking on sand. All respect `prefersReducedMotion()` per ART_DIRECTION.md.
  - Accept: the town feels alive while idle; with reduced motion on, only water (slowed) and walking animate.

---

## Phase 2 — Interaction & interiors

- [x] **2.1 Interaction system + prompt pill**
  - Files: `src/game/systems/{interaction,Player}.ts`, `src/game/scenes/mapScene.ts`, `src/app/page.tsx`, `src/components/InteractPrompt.tsx`, `src/components/InteractPrompt.module.css`
  - Do: each frame find the nearest product, sign, or NPC whose interaction point is within 14 px of a probe 10 px in front of the player's feet. Call `useUI.getState().setPrompt({ verb, label })` (`Inspect` + product handle, `Read` + title, `Talk` + name) or `null`. Show the bobbing `marker` sprite above the target. **E / Space / Enter** triggers, debounced by 250 ms after `lastClosedAt`. React pill resolves product handles to titles via `useCatalog`; on touch it shows an **A** button that emits `gameEvents.emit("interact")`.
    Emit the selected action on the scene for the overlay handlers added in later steps.
  - Accept: correct prompt for each object type; no double-trigger when closing a dialog with E.

- [x] **2.2 Doors and scene transitions**
  - Files: `src/game/scenes/mapScene.ts`, `src/game/systems/interaction.ts`
  - Do: stepping through the configured door tile or onto an exit mat triggers `enter`/`exit` → camera fade out (skip if reduced motion) → load target map → `scene.restart({ map, spawn })` → fade in. `useUI.getState().setLocation(key, name)`. Handle `gameEvents.on("travel")`. Unsubscribe bridge listeners on scene shutdown.
  - Accept: walking into a shop opens its interior. Walking onto the exit mat returns the player in front of that shop's door, facing down.

- [x] **2.3 Three shop interiors**
  - Files: `src/game/maps/{boards,wear,gear}.ts`, `src/game/maps/index.ts`
  - Do: build each room exactly as briefed in [SCENES.md §2–4](SCENES.md#2-boards-interior-boards) (references: `boards-interior.webp`, `wear-interior.webp`). Shell: ~20 × 14 tiles, back wall 3 rows tall (wood planks for Boards/Gear, sage `wallSage` for Wear), 1-tile side wall columns, warm wood floor, low wooden railing along the bottom with a 2-tile opening, exit mat `D` with an `exit` interaction, spawn `door` just above the mat facing up. Add the props SCENES.md lists (wall sign boards, pendant lamps, vines, rugs, freestanding board racks with placards, fitting rooms, mirrors, display tables…) as placeholders where missing.
    - Display → product mapping: use the tables in SCENES.md. Every display uses a real `productId` from `src/commerce/mock/catalog.ts` and a `tint` matching the product art color; decorative duplicates have no interaction.
    - If `docs/art-references/gear-interior.webp` doesn't exist yet, ask the owner before inventing the Gear layout beyond SCENES.md §4.
  - Accept: `validateMap` passes for all; every catalog product is reachable in-world; interiors lazy-load (separate chunks in the build output); screenshots of Boards and Wear match their reference in layout (sign, counter, racks, aisle, entrance in the same places).

- [x] **2.4 NPCs and dialog**
  - Files: `src/game/systems/Npc.ts`, `src/components/DialogBox.tsx`, `src/components/DialogBox.module.css`, maps
  - Do: `idle` NPCs face the player when talked to; `wander` NPCs walk short random legs within 3 tiles of home with pauses, using the same collision. One shopkeeper per interior; 3–4 townsfolk outdoors with varied `Look`s. Dialog box per ART_DIRECTION.md; E/Enter/Space/click advances, Esc closes.
  - Accept: NPCs never walk through solids or the player; dialogs open/advance/close cleanly.

---

## Phase 3 — Shopping

- [x] **3.1 Catalog hydration + product modal**
  - Files: `src/components/CatalogHydrator.tsx`, `src/components/ProductModal.tsx`, `src/components/ProductPurchase.tsx`, `src/components/ProductArt.tsx`, CSS modules, `src/app/page.tsx`
  - Do: `page.tsx` awaits `commerce.listProducts()` and renders `<CatalogHydrator products>`. `ProductArt` renders `image.src` if present, else an inline SVG illustration from `ProductArt` (`kind`, `color`, `accent`). `ProductPurchase` (shared with the product page): option pickers (disable values with no stock), price, stock label ("Only 3 left" / "Sold out"), quantity stepper clamped to stock, Add to cart → toast/confirmation. Modal: focus trap, Esc closes, mobile full-screen sheet, link "View full page" → `/products/[handle]`.
    The full product page is implemented in step 3.4.
  - Accept: inspecting any display opens the right product; adding works from every shop into one cart.

- [x] **3.2 Cart drawer**
  - Files: `src/components/CartDrawer.tsx`, `src/components/StoreHydrator.tsx`, CSS, `src/app/layout.tsx`
  - Do: `StoreHydrator` calls `useCart.persist.rehydrate()` and `useSettings.persist.rehydrate()` on mount (stores use `skipHydration` to avoid SSR mismatches). Drawer lists lines, quantity steppers, remove, subtotal, "Checkout" → `/checkout`, "Keep exploring" closes.
    A standalone Cart button opens the drawer until the HUD is built in step 4.1. The checkout page is implemented in step 3.3.
  - Accept: cart survives reload; no hydration warnings.

- [x] **3.3 Checkout**
  - Files: `src/app/api/checkout/route.ts`, `src/app/checkout/page.tsx`, `src/app/checkout/success/page.tsx`
  - Do: route handler validates body shape, calls `commerce.createCheckout(lines)`, returns `{ redirectUrl }` or `{ error }` (400). Checkout page: review lines, POST, redirect (`window.location.assign`). Success page: order number, clear the cart, link back to the town. Label the mock clearly: "Demo checkout — no payment is taken."
  - Accept: tampered prices in localStorage don't change the charged total; stock limits are enforced server-side.

- [x] **3.4 Direct shopping mode + SEO**
  - Files: `src/app/shop/page.tsx`, `src/app/products/[handle]/page.tsx`, `src/app/sitemap.ts`, `src/app/robots.ts`, `src/components/SiteHeader.tsx`
  - Do: `/shop` grid grouped by store (`STORES`), filter chips. Product page: `generateStaticParams` from the provider, `generateMetadata`, JSON-LD `Product` schema, `ProductPurchase`, "See it in the town" link. Read `node_modules/next/dist/docs/` for Cache Components rules before writing these.
  - Accept: all product pages prerender at build; Lighthouse SEO ≥ 95 on a product page.

---

## Phase 4 — HUD, mobile, audio, accessibility

- [x] **4.1 HUD** — `src/components/Hud.tsx`: logo, location name, cart button
  with count badge, directory, sound toggle, settings, fullscreen. Pixel-font
  labels, ≥ 44 px targets. The Shop shortcut opens `/shop` until step 4.2, and
  Settings is disabled until step 4.4. The sound toggle persists the mute
  preference for step 4.5.
- [x] **4.2 Store directory** — panel listing Boards/Wear/Gear (+ "coming soon" ones) with **Walk there** (`gameEvents.emit("travel", { map: "town", spawn: "from-boards" })`) and **Browse online** (`/shop#boards`).
- [x] **4.3 Mobile controls** — `src/components/Joystick.tsx` (pointer events, writes `virtualStick`, dead zone 0.15), action button; shown only on `(pointer: coarse)`. Prevent page scroll/zoom on the canvas (`touch-action: none`).
- [x] **4.4 Settings** — mute, music volume, ambience volume, reduced motion (System/On/Off). Persisted via `useSettings`.
- [x] **4.5 Audio** — `src/game/audio.ts`: WebAudio context unlocked on first gesture; beach ambience (filtered noise with slow swell) outdoors; softer shop ambience + a gentle chiptune loop indoors; UI blips on interact/add-to-cart. Respect settings live.
- [x] **4.6 Accessibility pass** — keyboard-only full purchase flow, focus return to canvas, screen-reader live region announcing location changes and prompts, contrast check against ART_DIRECTION.md.

**MVP complete when Phases 1–4 are checked and the spec §13 list is satisfied.**

---

## Phase A — Production art (parallel track)

The game is built on procedural placeholder art (phases 1–4). Matching the
detail of `docs/art-references/` needs real pixel art. This track can run in
parallel with phases 2–5 and doesn't block them. Spec: ART_DIRECTION.md →
Production art; asset list: SCENES.md §7. Since A.3 the art is made by
upgrading the generators in `src/game/art` (D14), so A.4–A.8 bring each
group up to the A.3 standard and A.9 becomes the scene-by-scene comparison.

- [x] **A.1 Choose the art source** *(owner decision)* — edited free asset pack, recolored to the palette, with hand-drawn brand pieces. See ARCHITECTURE.md → Decisions D14.
- [x] **A.2 Brand mark** — wave mark + wordmark as SVG (`public/brand/`), pixel versions (8 × 8, 16 × 16, sign boards, plaza inlay) per SCENES.md §6. Use it in the HUD, favicon and placeholder sign boards.
- [x] **A.3 Style test slice** — *(made by upgrading the generators, see ARCHITECTURE.md → D14; approved by the owner)* one shop exterior (Boards), a strip of cobblestone + sand + water tiles, the player sheet and one palm, made to the final standard. Screenshot it beside `beach-town.webp`; the owner approves before A.4.
- [x] **A.4 Terrain tileset** — all terrain tiles from SCENES.md §7, including autotile edges and diagonal foam.
- [x] **A.5 Characters** — player, 3 shopkeepers, townsfolk, beach surfer NPC (16 × 32 sheets).
- [x] **A.6 Buildings** — all town buildings and cottages.
- [x] **A.7 Town props** — everything in the SCENES.md town props table.
- [ ] **A.8 Interior props** — Boards, Wear, Gear sets.
- [ ] **A.9 Integration** — load the PNG/JSON assets in `BootScene` under the same texture keys (ART_DIRECTION.md → Replacing placeholder art), pack atlases, compare every scene with its reference.

---

## Phase 5 — Real commerce (Shopify)

- [x] **5.1 Shopify provider** — `src/commerce/shopify/{client,queries,provider}.ts` implementing `CommerceProvider` via Storefront GraphQL (`products`, `product(handle:)`, `cartCreate` → `checkoutUrl`). Map to SURFBIT types; images → `ProductImage.src`. Product `metafields` carry `store` (boards/wear/gear) and specs.
- [ ] **5.2 Provider selection** — `src/commerce/index.ts` picks Shopify when `SHOPIFY_STORE_DOMAIN` and `SHOPIFY_STOREFRONT_TOKEN` are set (see `.env.example`), else mock. Cache product reads with `'use cache'` + `cacheTag('products')`.
- [ ] **5.3 Webhook revalidation** — `src/app/api/revalidate/route.ts` verifies the Shopify HMAC and calls `revalidateTag('products')` on product/inventory updates.

## Phase 6 — Production polish

- [ ] **6.1 Real art** — finish Phase A, then remove placeholder generators that are no longer used.
- [ ] **6.2 Tiled importer (optional)** — `scripts/tiled-to-mapdef.ts` converting Tiled JSON to `MapDef`.
- [ ] **6.3 Performance** — texture atlases, preload only the town, measure LCP/INP, keep initial JS for `/` < 400 KB gz (Phaser chunk loaded after first paint).
- [ ] **6.4 Analytics & error tracking** — page views, product inspects, add-to-cart, checkout starts.
- [ ] **6.5 Deploy** — Vercel project, env vars, preview deployments per PR.

## Phase 7 — Post-MVP ideas (from spec §14)

Goods / Workshop / Beach Club interiors · character customization · day/night
cycle · seasonal decorations & limited drops · NPC conversations · Easter eggs ·
surf mini-game · loyalty points · surfboard configurator (Workshop) ·
multiplayer · Supabase accounts & saved preferences.

---

## Changelog

- 2026-11-26 — Phase 0 complete: scaffold, tokens, commerce seam, stores, art foundation, docs.
- 2026-11-26 — Step 1.1 complete. Added Vitest to `npm run check` and covered commerce helpers and cart actions.
- 2026-11-26 — Step 1.2 complete. Added the town map, lazy loader, and tested terrain, collision, and validation builders.
- 2026-11-26 — Step 1.3 complete. Mounted Phaser on the home page, registered generated textures, and rendered the town ground at 2× zoom.
- 2026-11-26 — Visual target added: `docs/art-references/`, palette resampled from it, `docs/SCENES.md` scene briefs, new steps 1.3b (town layout) and 1.3c (16 × 32 characters), Phase A (production art).
- 2026-11-26 — Step 1.3b complete. Reworked the town layout, added coastal autotiles and props, and compared the layout with the beach-town reference.
- 2026-11-26 — Step 1.3c complete. Added 16 × 32 player and shopkeeper sprites, verified bottom-row foot alignment, and checked all poses at 3× against the visual references.
- 2026-11-26 — Step 1.4 complete. Added walking and running, tile collision with wall sliding, and a bounded camera that follows the player at integer zoom.
- 2026-11-26 — Step 1.5 complete. Added the town façades and prop layer, verified player depth sorting in the browser, and compared the town with the visual reference.
- 2026-11-26 — Step 1.6 complete. Animated the shoreline, palms, flags, gulls, surfers, and sand footprints. Verified reduced motion in the browser.
- 2026-11-26 — Step 2.1 complete. Added proximity prompts and a target marker, with shared keyboard and touch activation and a dialog-close cooldown.
- 2026-11-26 — Step 2.2 complete. Added door and bridge travel with lazy loading and reduced-motion-aware camera fades. Verified all three return spawns with browser fixtures.
- 2026-11-26 — Step 2.3 complete. Added lazy-loaded Boards, Wear, and Gear interiors with reachable displays for all 15 products, and compared Boards and Wear screenshots with their references.
- 2026-11-26 — Step 2.4 complete. Added four townsfolk, three shopkeepers, shared character collision, and keyboard and touch dialog for conversations and signs.
- 2026-11-26 — Step 3.1 complete. Hydrated the catalog on the world page, added a stock-aware product modal, and verified all three shops add to one cart.
- 2026-11-26 — Step 2.3 follow-up. Shop cameras fill the viewport at integer zoom and refit when it resizes.
- 2026-11-26 — Step 2.2 follow-up. Walking through shop doors and onto exit mats now triggers travel automatically.
- 2026-11-26 — Step 3.2 complete. Added a cart drawer with stock-aware quantity controls, removal, subtotal and a checkout link. Verified that cart and settings restore after reload without hydration warnings.
- 2026-11-26 — Step 3.3 complete. Added demo checkout review and confirmation, server-side repricing and combined stock validation, and cart clearing after confirmation.
- 2026-11-26 — Step 3.4 complete. Added a filterable storefront, prerendered all 15 product pages, and added canonical metadata, Product structured data, a sitemap and robots.txt. Pixel Fish scored 100 for Lighthouse SEO.
- 2026-11-26 — Step 4.1 complete. Added the town HUD with live location and cart count, the Shop shortcut, a persistent mute toggle, and fullscreen. Verified keyboard and touch controls.
- 2026-11-26 — Step 4.2 complete. Added the HUD store directory with travel to shop entrances, links to storefront sections, and coming-soon listings. Verified keyboard and touch controls.
- 2026-11-26 — Step 4.3 complete. Added a coarse-pointer joystick with a 0.15 dead zone, paired it with the contextual A button, and blocked canvas scroll and zoom gestures. Verified touch movement, shop entry, and interaction in Chromium.
- 2026-11-26 — Step 4.4 complete. Added HUD settings for mute, music and ambience volume, and System/On/Off reduced motion. Verified keyboard and touch controls, live motion changes, and persistence after reload.
- 2026-11-26 — Step 4.5 complete. Added gesture-unlocked beach and shop ambience, an indoor chiptune loop, and interaction and cart cues. Verified live audio settings, navigation, and desktop and touch playback in Chromium.
- 2026-11-26 — Step 4.6 complete. Added keyboard access and visible focus for the canvas, live location and interaction announcements, and accessible button contrast. Verified focus return and the keyboard-only demo purchase in Chromium.
- 2026-11-26 — Step A.1 complete. Chose an edited free asset pack with hand-drawn brand pieces and a bolder pixel look (D14). Updated the art tooling docs to allow free editors.
- 2026-11-26 — Step A.2 complete. Added a stacked pixel-style SVG logo to the HUD and storefront, a matching wave favicon, and 8 × 8 and 16 × 16 waves for shop signs, props and the plaza inlay.
- 2026-11-26 — Step 5.1 complete. Added paginated Shopify catalog reads, product metafield and photo mapping, and hosted checkout. Verified the provider with mocked Storefront API responses.
- 2026-11-26 — Step A.3 complete. Upgraded the generators for cobbles, sand, water and foam, the palm, the Boards thatch and open front, and character shading. Compared with the beach-town reference and approved by the owner. Revised D14: generators are the production art; Coastal Village Lite is kept as a reference only.
- 2026-11-26 — Step A.4 complete. Brought the terrain to the A.3 standard: block-laid retaining wall with end pillars, 16 planter rim tiles with lush beds, diagonal shoreline corners and wet sand, stone and timber stairs, deck planks, tufted grass edges, interior floorboards, plank walls with skirting, a railing, and a two-tile wave doormat. Compared the town and Boards interior with their references.
- 2026-11-26 — Step A.5 complete. Finished all character sheets: shaded faces and hair, eye glints on every skin tone, rounded jaws and collars. Added wetsuit and carried-board options with a surfer NPC on the beach, shoppers near Gear and Wear, and a redrawn surfer in the water. Checked every direction and pose up close and in the town.
- 2026-11-26 — A.4 follow-up (owner feedback on the shoreline). Replaced the stepped foam and wet-sand tiles on the town coast with a generated shore overlay: smooth diagonal coast, wet-sand band, swash foam, shallows and two surf lines rolling in (D15). Removed the separate wave sprites it replaces.
- 2026-11-27 — A.5 follow-up. Removed the ambient surfers from the town ocean (D16). Verified the animated shoreline in Chromium.
- 2026-11-27 — Step A.6 complete. Finished the six shop façades and two cottages with distinct roof silhouettes, shop displays, and shuttered windows. Compared the town with its reference and verified shop travel in Chromium.
- 2026-11-27 — Step A.7 complete. Finished the town foliage, street and beach props, and Beach Club deck fixtures. Compared the town with its reference and verified prop collision, sign interactions, and reduced motion in Chromium.
