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

- [ ] **1.2 Map types, builder and the town map**
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

- [ ] **1.3 Mount Phaser in Next.js**
  - Files: `src/game/config.ts`, `src/game/WorldClient.tsx`, `src/game/scenes/BootScene.ts`, `src/game/scenes/MapScene.ts` (stub), `src/game/textures.ts`, `src/app/page.tsx`, `src/app/page.module.css`
  - Do:
    - `WorldClient.tsx` (`"use client"`): full-viewport `<div>`; in `useEffect`, `const Phaser = await import("phaser")`, create the game, destroy it on unmount (guard against React strict-mode double mount).
    - Config: `type: AUTO`, `pixelArt: true`, `roundPixels: true`, `backgroundColor: "#2fb3c6"`, `scale.mode: RESIZE`, no physics.
    - `textures.ts`: `registerTextures(scene)` adds the tileset (`buildTileset`), player sheet (`buildCharacterSheet(PLAYER_LOOK)`), shadow, every `PROPS` entry (frames added with `texture.add(i, 0, x, 0, w, h)`), gull/wave/surfer/footprint/marker. Export `ensureTinted(scene, propKey, tint)` that lazily generates `"${prop}:${color}:${accent}"`.
    - `BootScene` calls `registerTextures`, then starts `MapScene` with `{ map: "town", spawn: "default" }`.
    - `MapScene` stub: loads the `MapDef`, renders the ground with `this.make.tilemap({ data, tileWidth: 16, tileHeight: 16 })` + `addTilesetImage`.
    - `page.tsx`: render `<WorldClient />`. Keep a `<noscript>` / link to `/shop` for no-JS & SEO.
  - Accept: `npm run dev` shows the town ground, crisp at integer zoom, no console errors, no SSR errors, `npm run build` passes.

- [ ] **1.4 Player movement, collision, camera**
  - Files: `src/game/systems/Player.ts`, `src/game/systems/collision.ts`, `src/game/systems/collision.test.ts`, `src/game/scenes/MapScene.ts`
  - Do: implement per [ARCHITECTURE.md → Player & collision](ARCHITECTURE.md#player--collision). Keys: WASD + arrows, Shift to run; register keys with `enableCapture = false` so form inputs keep working. Read `virtualStick` too. Walk animations at 8 fps; idle = stand frame of last facing. Shadow sprite follows the feet. Camera follows with integer zoom, recomputed on resize. Pause movement (and `resetKeys()`) while `isOverlayOpen(useUI.getState())`.
  - Accept: smooth movement; cannot walk through water, buildings or solid props; slides along walls; camera clamped to map; collision helper unit-tested.

- [ ] **1.5 Buildings and props with y-sorting**
  - Files: `src/game/art/buildings.ts`, `src/game/systems/objects.ts`, `src/game/scenes/MapScene.ts`
  - Do: `buildBuilding(w, h, style, label)` → canvas: roof ≈ top 45% (stripes/shingles in `style.roof`), plank walls (`style.wall`), centered door, two windows, sign board with the label in the 3×5 font; "coming soon" buildings get boards across the door + a `SOON` tag. Spawn all objects per the coordinate/depth rules in ARCHITECTURE.md.
  - Accept: player passes behind palms/buildings when north of their base and in front when south; flat props are always under the player.

- [ ] **1.6 Environmental animation**
  - Files: `src/game/systems/ambient.ts`, `src/state/settings.ts` (read only)
  - Do: water/foam tile frame cycling (300 ms); palm sway frames (randomised phase); flags; gulls crossing the sky; wave foam arcs travelling toward the shore and fading; 1–2 surfers bobbing in the water; temporary footprints when walking on sand. All respect `prefersReducedMotion()` per ART_DIRECTION.md.
  - Accept: the town feels alive while idle; with reduced motion on, only water (slowed) and walking animate.

---

## Phase 2 — Interaction & interiors

- [ ] **2.1 Interaction system + prompt pill**
  - Files: `src/game/systems/interaction.ts`, `src/components/InteractPrompt.tsx`, `src/components/InteractPrompt.module.css`
  - Do: each frame find the nearest interactable whose interaction point is within 14 px of a probe 10 px in front of the player's feet. Call `useUI.getState().setPrompt({ verb, label })` (`Enter` + building label, `Inspect` + product handle, `Read` + title, `Talk` + name, `Exit`) or `null`. Show the bobbing `marker` sprite above the target. **E / Space / Enter** triggers, debounced by 250 ms after `lastClosedAt`. React pill resolves product handles to titles via `useCatalog`; on touch it shows an **A** button that emits `gameEvents.emit("interact")`.
  - Accept: correct prompt for each object type; no double-trigger when closing a dialog with E.

- [ ] **2.2 Doors and scene transitions**
  - Files: `src/game/scenes/MapScene.ts`
  - Do: `enter`/`exit` interactions → camera fade out (skip if reduced motion) → load target map → `scene.restart({ map, spawn })` → fade in. `useUI.getState().setLocation(key, name)`. Handle `gameEvents.on("travel")`. Unsubscribe bridge listeners on scene shutdown.
  - Accept: entering a shop and exiting returns the player in front of that shop's door, facing down.

- [ ] **2.3 Three shop interiors**
  - Files: `src/game/maps/{boards,wear,gear}.ts`, `src/game/maps/index.ts`
  - Do: each ~16×12 tiles: `X` border, 2 rows of wall (`W`, `V` or `K`), floor (`_` boards, `+` wear, `o` gear), exit mat `D` at bottom center with an `exit` interaction, spawn `door` just above the mat facing up.
    - **Boards:** 5 `boardDisplay`s along the back wall (one per board product handle), counter, surf posters, window, plant, rug.
    - **Wear:** `clothesRack`s and `mannequin`s for the 4 wear products, `fittingRoom`, shelf, counter, rug.
    - **Gear:** `pegboard` (fins), `shelf` (wax, pads, leash), `wetsuitHanger`, board bag display, counter.
    - Every display uses a real `productId` from `src/commerce/mock/catalog.ts` and a `tint` matching the product art color.
  - Accept: `validateMap` passes for all; every catalog product is reachable in-world; interiors lazy-load (separate chunks in the build output).

- [ ] **2.4 NPCs and dialog**
  - Files: `src/game/systems/Npc.ts`, `src/components/DialogBox.tsx`, `src/components/DialogBox.module.css`, maps
  - Do: `idle` NPCs face the player when talked to; `wander` NPCs walk short random legs within 3 tiles of home with pauses, using the same collision. One shopkeeper per interior; 3–4 townsfolk outdoors with varied `Look`s. Dialog box per ART_DIRECTION.md; E/Enter/Space/click advances, Esc closes.
  - Accept: NPCs never walk through solids or the player; dialogs open/advance/close cleanly.

---

## Phase 3 — Shopping

- [ ] **3.1 Catalog hydration + product modal**
  - Files: `src/components/CatalogHydrator.tsx`, `src/components/ProductModal.tsx`, `src/components/ProductPurchase.tsx`, `src/components/ProductArt.tsx`, CSS modules, `src/app/page.tsx`
  - Do: `page.tsx` awaits `commerce.listProducts()` and renders `<CatalogHydrator products>`. `ProductArt` renders `image.src` if present, else an inline SVG illustration from `ProductArt` (`kind`, `color`, `accent`). `ProductPurchase` (shared with the product page): option pickers (disable values with no stock), price, stock label ("Only 3 left" / "Sold out"), quantity stepper clamped to stock, Add to cart → toast/confirmation. Modal: focus trap, Esc closes, mobile full-screen sheet, link "View full page" → `/products/[handle]`.
  - Accept: inspecting any display opens the right product; adding works from every shop into one cart.

- [ ] **3.2 Cart drawer**
  - Files: `src/components/CartDrawer.tsx`, `src/components/StoreHydrator.tsx`, CSS, `src/app/layout.tsx`
  - Do: `StoreHydrator` calls `useCart.persist.rehydrate()` and `useSettings.persist.rehydrate()` on mount (stores use `skipHydration` to avoid SSR mismatches). Drawer lists lines, quantity steppers, remove, subtotal, "Checkout" → `/checkout`, "Keep exploring" closes.
  - Accept: cart survives reload; no hydration warnings.

- [ ] **3.3 Checkout**
  - Files: `src/app/api/checkout/route.ts`, `src/app/checkout/page.tsx`, `src/app/checkout/success/page.tsx`
  - Do: route handler validates body shape, calls `commerce.createCheckout(lines)`, returns `{ redirectUrl }` or `{ error }` (400). Checkout page: review lines, POST, redirect (`window.location.assign`). Success page: order number, clear the cart, link back to the town. Label the mock clearly: "Demo checkout — no payment is taken."
  - Accept: tampered prices in localStorage don't change the charged total; stock limits are enforced server-side.

- [ ] **3.4 Direct shopping mode + SEO**
  - Files: `src/app/shop/page.tsx`, `src/app/products/[handle]/page.tsx`, `src/app/sitemap.ts`, `src/app/robots.ts`, `src/components/SiteHeader.tsx`
  - Do: `/shop` grid grouped by store (`STORES`), filter chips. Product page: `generateStaticParams` from the provider, `generateMetadata`, JSON-LD `Product` schema, `ProductPurchase`, "See it in the town" link. Read `node_modules/next/dist/docs/` for Cache Components rules before writing these.
  - Accept: all product pages prerender at build; Lighthouse SEO ≥ 95 on a product page.

---

## Phase 4 — HUD, mobile, audio, accessibility

- [ ] **4.1 HUD** — `src/components/Hud.tsx`: logo, location name, cart button with count badge, directory, sound toggle, settings, fullscreen. Pixel-font labels, ≥ 44 px targets.
- [ ] **4.2 Store directory** — panel listing Boards/Wear/Gear (+ "coming soon" ones) with **Walk there** (`gameEvents.emit("travel", { map: "town", spawn: "from-boards" })`) and **Browse online** (`/shop#boards`).
- [ ] **4.3 Mobile controls** — `src/components/Joystick.tsx` (pointer events, writes `virtualStick`, dead zone 0.15), action button; shown only on `(pointer: coarse)`. Prevent page scroll/zoom on the canvas (`touch-action: none`).
- [ ] **4.4 Settings** — mute, music volume, ambience volume, reduced motion (System/On/Off). Persisted via `useSettings`.
- [ ] **4.5 Audio** — `src/game/audio.ts`: WebAudio context unlocked on first gesture; beach ambience (filtered noise with slow swell) outdoors; softer shop ambience + a gentle chiptune loop indoors; UI blips on interact/add-to-cart. Respect settings live.
- [ ] **4.6 Accessibility pass** — keyboard-only full purchase flow, focus return to canvas, screen-reader live region announcing location changes and prompts, contrast check against ART_DIRECTION.md.

**MVP complete when Phases 1–4 are checked and the spec §13 list is satisfied.**

---

## Phase 5 — Real commerce (Shopify)

- [ ] **5.1 Shopify provider** — `src/commerce/shopify/{client,queries,provider}.ts` implementing `CommerceProvider` via Storefront GraphQL (`products`, `productByHandle`, `cartCreate` → `checkoutUrl`). Map to SURFBIT types; images → `ProductImage.src`. Product `metafields` carry `store` (boards/wear/gear) and specs.
- [ ] **5.2 Provider selection** — `src/commerce/index.ts` picks Shopify when `SHOPIFY_STORE_DOMAIN` and `SHOPIFY_STOREFRONT_TOKEN` are set (see `.env.example`), else mock. Cache product reads with `'use cache'` + `cacheTag('products')`.
- [ ] **5.3 Webhook revalidation** — `src/app/api/revalidate/route.ts` verifies the Shopify HMAC and calls `revalidateTag('products')` on product/inventory updates.

## Phase 6 — Production polish

- [ ] **6.1 Real art** — swap generators for Aseprite exports per ART_DIRECTION.md → "Replacing placeholder art".
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
