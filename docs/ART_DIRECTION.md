# SURFBIT — Art Direction & UI Guidelines

Every pixel, color and UI element follows this document. If an asset breaks a
rule here, fix the asset, not the rule (or update the rule here first).

## Mood

Relaxed, sunny, nostalgic. Late-90s surf shop meets 16-bit handheld RPG.
Warm sand, turquoise water, sun-bleached wood, coral and teal accents.

## Palette

One palette for the whole project. **UI tokens** live in
`src/app/globals.css` (`--sb-*`); **game colors** live in
`src/game/art/palette.ts` (`P.*`). Shared colors must have the same hex in both.

### Brand

| Name | Hex | CSS token | `P.` key | Use |
|---|---|---|---|---|
| Coral | `#e8734a` | `--sb-coral` | `coral` | Primary accent, CTAs, Boards shop |
| Coral Dark | `#c4553a` | `--sb-coral-dark` | `coralDark` | Hover / pressed, danger |
| Teal | `#3fa7a0` | `--sb-teal` | `teal` | Wear shop, success |
| Teal Dark | `#2c7f7c` | `--sb-teal-dark` | `tealDark` | Hover |
| Sun | `#f2b632` | `--sb-sun` | `sun` | Gear shop, highlights, warnings |
| Sun Dark | `#d18f1d` | `--sb-sun-dark` | `sunDark` | Hover |
| Sky | `#7bc6e8` | `--sb-sky` | `sky` | Sky, windows, cool accents |
| Deep Blue | `#2f6f8f` | `--sb-deep-blue` | `deepBlue` | Focus rings, secondary text accents |
| Cream | `#fff3d6` | `--sb-cream` | `cream` | Page background, light fills |

### World

| Name | Hex | `P.` key | Use |
|---|---|---|---|
| Sand / Light / Dark | `#f3d9a4` / `#fbe9c3` / `#e2bf7f` | `sand*` | Beach, paths |
| Wet sand | `#d8b57a` | `sandWet` | Shoreline row |
| Water / Light / Deep | `#2fb3c6` / `#5fd3dc` / `#1e8ea8` | `water*` | Ocean |
| Foam | `#f4fbff` | `foam` | Wave crests, swash |
| Grass / Light / Dark | `#7cc46a` / `#a4dc7c` / `#549a4f` | `grass*` | Town ground |
| Leaf / Light / Dark | `#4fae5b` / `#7fd36b` / `#2f7f48` | `leaf*` | Palms, bushes, plants |
| Wood / Light / Dark / Deep | `#b97a4b` / `#d49a62` / `#8a5534` / `#663c25` | `wood*` | Boardwalk, furniture, buildings |
| Stone / Light / Dark | `#d9c9ad` / `#ebdfc8` / `#b6a385` | `stone*` | Plaza, rocks |

### Neutrals

| Name | Hex | Use |
|---|---|---|
| Outline | `#2b2433` | 1px sprite outlines, UI borders, hard shadows |
| Ink | `#3d3346` | Body text, dark details |
| Muted | `#7a6e80` | Secondary text |
| White | `#ffffff` | Panels, product UI surfaces |

Skin tones: `#f5cfa6`, `#d9a173`, `#a86f48`, `#6e4430` (`P.skin1..4`). NPCs
should use a mix.

**Never use pure black.** Darkest color is Outline `#2b2433`.

## Pixel rules

| Rule | Value |
|---|---|
| Tile size | **16 × 16 px** |
| Character frame | **16 × 24 px**, feet at the bottom, ~1px empty margin |
| Character sheet | 3 columns × 4 rows = `[stand, stepA, stepB]` × `[down, left, right, up]` |
| Outline | 1px `#2b2433` around characters and standing props (`autoOutline`) |
| Light source | Top-left; shade the bottom/right edges |
| Perspective | Three-quarter (top-down with visible front faces) — buildings show a roof + front wall |
| Rendering | `pixelArt: true`, `roundPixels: true`, `image-rendering: pixelated` |
| Zoom | **Integer only** (2×, 3×, 4×). Never non-integer scale pixel art |
| Rotation | **Never rotate pixel sprites.** Use extra frames for sway/wobble |
| Gradients | None in sprites. Light glows are the only exception (additive, low alpha) |
| Text in world | 3×5 pixel font (`src/game/art/font.ts`), uppercase |

### Size reference

| Thing | Size (px) | Footprint (tiles) |
|---|---|---|
| Player / NPC | 16 × 24 | 1 × 1 at the feet |
| Palm | 48 × 64 | 1 × 1 (trunk) |
| Umbrella | 32 × 44 | non-solid |
| Small shop | 128 × 96 (8 × 6 tiles) | full rect except door |
| Surfboard display | 14 × 48 | 1 × 1 |
| Counter | 48 × 28 | 3 × 1 |

### Animation timing

| Animation | Frames | Timing |
|---|---|---|
| Walk | stand, A, stand, B | 8 fps (×1.5 when running) |
| Water / foam tiles | 4 | 300 ms per frame |
| Palm sway | 3 (ping-pong) | ~450 ms per frame, randomised start |
| Flags | 3 | 160 ms per frame |
| Gulls | 2 | 200 ms per frame |
| Lamp flicker | alpha tween | 0.75–1.0, irregular |
| Footprints | — | fade over 2.5 s |

**Reduced motion** (OS setting or in-game toggle): no gulls, waves, sway,
flicker or camera fades. Water tiles still animate at ¼ speed. Walking
animation stays (it is feedback, not decoration).

## Replacing placeholder art with real assets (Aseprite)

1. Draw in Aseprite at 1× using the palette above (import `assets/palette/surfbit.gpl`).
2. Export spritesheets as PNG + JSON (array) into
   `public/assets/{tiles,characters,props,buildings}/`.
3. Keep **the same texture keys, frame sizes and frame order** used by the
   generators in `src/game/art/*`.
4. In `BootScene`, load the PNG instead of calling the generator for that key.
   Nothing else changes.
5. Pack into atlases (Free Texture Packer / Aseprite `--sheet-pack`) before
   launch to cut requests.

## UI language

Two layers with different jobs:

- **Game chrome** (HUD buttons, prompt pill, dialog box, directory): retro.
  Chunky 3px `Outline` border, 4px hard shadow (`.sb-panel`, `.sb-btn`),
  pixel font for short labels.
- **Commerce UI** (product modal, cart, checkout, /shop): retro *frame*,
  modern *content*. Same border/shadow, but text in Inter, generous spacing,
  real form controls, clear prices.

### Typography

| Use | Font | Size |
|---|---|---|
| Logo, HUD labels, prompt pill, section titles | Press Start 2P (`--sb-font-pixel`) | 10–16 px, max ~3 words |
| Everything else (descriptions, prices, forms, checkout) | Inter (`--sb-font-body`) | ≥ 16 px body, ≥ 14 px secondary |

Never set paragraphs, prices or form labels in the pixel font.

### Components

| Component | Spec |
|---|---|
| Button | `.sb-btn` — coral fill, white text, 3px outline, 2px hard shadow, press = translate(2px,2px) + no shadow. Secondary = `.sb-btn--secondary` |
| Panel | `.sb-panel` — white, 3px outline, 6px radius, 4px hard shadow |
| Prompt pill | Bottom-center, `[E] Inspect · Pixel Fish`; key shown as a keycap; on touch shows a tappable **A** |
| Dialog box | Bottom of screen, name tag in pixel font, text in Inter, ▼ indicator to advance |
| Product modal | Centered panel (full-screen sheet on mobile): image left / details right on desktop, stacked on mobile |
| Cart | Right drawer (bottom sheet on mobile) |

### Accessibility

- Text contrast ≥ 4.5:1 (Ink on Cream/White passes; white on Coral passes for
  bold ≥ 16px — use Coral Dark for small text on white).
- Every interactive element reachable by keyboard with a visible focus ring
  (`--sb-focus`).
- Modals trap focus, close on `Esc`, return focus to the canvas.
- Touch targets ≥ 44 × 44 px.
- Every product reachable without the game (`/shop`, `/products/[handle]`).
