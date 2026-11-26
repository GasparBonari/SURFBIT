# SURFBIT — Project Concept & Development Specification

> Canonical product spec. Where implementation deliberately differs, the
> deviation is recorded in [ARCHITECTURE.md → Decisions](ARCHITECTURE.md#decisions).

## 1. Project overview

SURFBIT is an interactive, pixel-art e-commerce website for a surf and lifestyle brand. The project combines the immersive experience of a retro 2D video game with the functionality of a modern online store.

Instead of navigating through traditional website pages, users enter a virtual coastal town where they control a character, explore the environment, interact with objects and enter different shops to discover and purchase real products.

The entire town belongs to the SURFBIT brand. Rather than having a single store selling everything, the world contains multiple specialized shops, each representing a different product category.

The primary objective is to create a memorable online shopping experience where exploration, visual storytelling and brand identity are as important as the products themselves.

## 2. The virtual world

The main environment is a fictional beach town inspired by tropical surf destinations, coastal villages and retro pixel-art games.

The world should use a 2D top-down or three-quarter perspective, similar to classic Pokémon games or Stardew Valley.

The environment should include:

- A large beach with animated ocean waves.
- Palm trees, vegetation and natural landscapes.
- Wooden boardwalks, sandy paths and small streets.
- Multiple commercial buildings with unique designs.
- Surfboards, benches, signs, umbrellas and decorative objects.
- NPCs walking around or interacting with the environment.
- A central plaza connecting the different areas.
- Areas that can be expanded with future updates.

The town should feel alive, welcoming and visually engaging, rather than simply being a static map containing clickable buildings.

## 3. Player and navigation

When users enter the website, they spawn as a pixel-art character inside the beach town.

Users should be able to:

- Move freely around the environment.
- Walk in four directions using WASD or arrow keys.
- Interact with buildings, doors, signs and NPCs.
- Enter and exit shops.
- Explore the beach and surrounding areas.
- Customize their character in future versions.

The camera should follow the character as they move around the world.

Movement should feel smooth, with directional walking animations and collision detection to prevent characters from walking through buildings, trees, furniture and other solid objects.

On mobile devices, movement should be supported through a virtual joystick and touch-based interaction controls.

Users should not need to create an account to explore the world.

## 4. Town structure and shops

Each building represents a different section of the SURFBIT brand. All stores share the same brand identity, product inventory system and shopping cart.

### SURFBIT Boards

A dedicated surfboard shop featuring boards displayed vertically against walls, board racks and a shop counter.

Products may include: shortboards, mid-length boards, longboards, fish boards, softboards.

Interacting with a displayed surfboard opens its product information, including images, dimensions, volume, price and available options.

### SURFBIT Wear

A clothing store with clothing racks, shelves, mannequins and a fitting room.

Products may include T-shirts, hoodies, boardshorts, swimwear and casual lifestyle clothing.

### SURFBIT Gear

A surf equipment and accessories shop.

Products may include fins, leashes, traction pads, board bags, surf wax, wetsuits and other surfing accessories.

### SURFBIT Goods

A general lifestyle store featuring caps, sunglasses, backpacks, towels, water bottles, stickers and beach essentials.

### SURFBIT Workshop

A surfboard shaping workshop where visitors can explore board designs, materials and the shaping process.

In future versions, customers could customize a surfboard by selecting its shape, dimensions, colors and artwork.

### SURFBIT Beach Club

A social and informational area rather than a traditional shop.

It can contain brand information, surf guides, articles, community events, newsletters and announcements about upcoming collections.

### Future locations

The town should be designed to accommodate additional buildings without requiring a complete redesign of the existing environment. New locations could include a café, skate shop, art gallery, surf school or seasonal pop-up store.

## 5. Building interiors

Every accessible building should have its own separate interior environment.

Walking through a shop doorway transitions from the outdoor world to the shop interior. Walking onto the exit mat returns the player to the town.

Each interior should have:

- A unique layout and decoration.
- Product displays.
- Furniture and environmental objects.
- A shopkeeper or NPC.
- Interactive product locations.
- An entrance and exit.
- Background music or ambient sounds appropriate to the location.

The player should be able to move around the interior using the same movement system as the outdoor environment.

When leaving a building, the player returns to its entrance in the main town.

## 6. Product interaction and shopping experience

Products should exist physically within the pixel-art environment rather than being accessible only through traditional menus.

For example, a surfboard displayed inside the surf shop can be approached and interacted with.

The interaction opens a modern product interface containing:

- Real product photographs.
- Product name and description.
- Price.
- Available colors, sizes or specifications.
- Stock availability.
- Quantity selector.
- Add-to-cart button.

The product interface should visually match the SURFBIT brand while remaining practical, readable and easy to use.

The shopping flow should work as follows:

1. The user enters the virtual town.
2. The user walks into a shop.
3. The user approaches a product.
4. The user interacts with the product.
5. A product details interface opens.
6. The user selects the desired options.
7. The product is added to the shopping cart.
8. The user continues exploring or proceeds to checkout.

Products added in different shops must be stored in the same global shopping cart.

Real-world purchases should use a standard, secure e-commerce checkout. Users should never be required to complete gameplay challenges to purchase products.

## 7. User interface and experience

The interface should be minimal to preserve immersion in the virtual world.

The main HUD may include:

- SURFBIT logo.
- Shopping cart with item count.
- Mini-map or town map.
- Sound and music controls.
- Settings menu.
- Interaction indicator.
- Store directory.
- Optional full-screen mode.

When approaching a product, sign, or NPC, a small contextual message should appear, such as "Press E to inspect."

Menus, dialogs, buttons and transitions should maintain a consistent visual language inspired by retro games, while product descriptions and checkout information should prioritize readability.

The website should also provide a direct shopping mode for users who prefer to browse products without navigating the virtual environment.

## 8. Art direction

SURFBIT should have a consistent and recognizable visual identity.

The art direction should focus on:

- Detailed 16-bit or 32-bit pixel art.
- Warm tropical colors.
- Turquoise ocean water.
- Sandy beaches and wooden architecture.
- Retro surf culture.
- Relaxed, sunny coastal environments.
- Smooth but subtle environmental animations.

All buildings, characters, objects and terrain should follow the same pixel density, perspective, proportions and color palette.

The pixel art should feel handcrafted and cohesive rather than being a collection of unrelated assets.

The overall atmosphere should be relaxed, adventurous and nostalgic.

Visual target: the concept images in [`docs/art-references/`](art-references/), broken down scene by scene in [SCENES.md](SCENES.md).

## 9. Environmental animations

The world should feel alive even when the user is not moving.

Environmental animations may include:

- Ocean waves breaking on the beach.
- Palm trees moving in the wind.
- Seagulls flying overhead.
- Flags and shop signs moving.
- Surfers in the ocean.
- NPCs walking along paths.
- Flickering lights inside buildings.
- Footprints appearing temporarily in the sand.

Future versions could introduce dynamic weather, day and night cycles, sunsets, seasonal decorations and special events.

## 10. Technical architecture

The project should be structured as a web application containing an interactive 2D world and a standard e-commerce system.

| Technology | Purpose |
|---|---|
| Next.js | Web application, routing and SEO |
| React | Product interfaces and menus |
| TypeScript | Application logic and type safety |
| Phaser | 2D world rendering, movement, collisions and scenes |
| Tiled | Creating outdoor and indoor tilemaps |
| Aseprite | Pixel-art assets and spritesheets |
| Zustand | Shared application and shopping cart state |
| Shopify Storefront API | Products, inventory and commerce |
| Supabase | Optional accounts and saved preferences |
| Vercel | Web hosting |

The interactive world and the e-commerce application should remain separate but connected systems.

Phaser should manage the world, character movement, animations, collisions and interactions. React should manage product information, shopping carts, menus, account interfaces and other website functionality.

Shopify or another commerce provider should manage real product information, inventory, payments and orders.

## 11. World architecture

The world should be built using modular tilemaps rather than one large background image.

Each map should support independent layers: ground and terrain, water, paths, buildings, decorations, animated objects, collision boundaries, interaction zones, NPCs, foreground objects.

Each shop interior should exist as an independent scene.

Buildings and interactive objects should be configuration-driven, allowing new locations and products to be added without changing the core interaction system.

For example, a surfboard display should reference a product ID from the e-commerce system rather than containing hardcoded product information.

The architecture should make it possible to add new shops, change product displays, expand the town and introduce seasonal content easily.

## 12. Performance and accessibility

The experience should work on desktop and mobile devices directly through a web browser, without requiring users to install an application.

- Fast initial loading.
- Lazy loading of shop interiors.
- Optimized sprite atlases and tilesets.
- Crisp pixel-art rendering without texture smoothing.
- Responsive product interfaces.
- Touch and keyboard support.
- Adjustable audio settings.
- Reduced-motion options.
- Direct access to products without using character controls.
- Search-engine-friendly product pages.
- Persistent shopping cart across sessions.

The interactive experience should enhance the shopping process rather than become an obstacle to it.

## 13. Minimum viable product (MVP)

The initial version should focus on creating one polished and functional experience rather than building a large world immediately.

The MVP should include:

- One explorable outdoor beach town.
- One playable character.
- Four-directional movement and walking animations.
- Camera movement.
- Collision detection.
- Animated ocean and environmental elements.
- Three accessible shops: Boards, Wear and Gear.
- Individual shop interiors.
- Interactive product displays.
- Product details interface.
- Shared shopping cart.
- Functional checkout.
- Desktop and mobile controls.
- Basic navigation and store directory.

Multiplayer, character customization, quests, dynamic weather and complex NPC behavior are not required for the initial release.

## 14. Future development

Once the core experience is complete, SURFBIT can gradually introduce: character customization and unlockable outfits, additional stores and explorable areas, day and night cycles, seasonal product collections, limited-edition product drops, interactive NPC conversations, hidden locations and Easter eggs, surfing and skateboarding mini-games, loyalty points and collectible items, custom surfboard configurator, multiplayer exploration, live community events, additional coastal towns inspired by real surf destinations.

These features should complement the brand and shopping experience rather than turn the platform into a game that requires constant progression.

## 15. Long-term vision

SURFBIT aims to establish a surf and lifestyle brand with a distinctive digital identity.

Rather than competing through a conventional online store, SURFBIT offers an explorable destination that customers can visit, discover and return to.

The virtual town becomes an evolving representation of the brand, its products, its culture and its community.

The ultimate goal is to combine the freedom of surf culture, the nostalgia of pixel art and the convenience of modern e-commerce into one cohesive experience.

**SURFBIT — More than a store. A world to explore.**
