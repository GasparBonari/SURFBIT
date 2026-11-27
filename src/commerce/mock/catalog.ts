import type {
  Product,
  ProductArt,
  ProductOption,
  ProductVariant,
  StoreId,
} from "../types";

/**
 * Demo catalog: the store's products for this portfolio build (ARCHITECTURE.md → D16).
 * Product handles here are what the world's displays reference.
 */

const CURRENCY = "USD";

interface Seed {
  handle: string;
  store: StoreId;
  title: string;
  category: string;
  description: string;
  art: ProductArt;
  options: ProductOption[];
  /** Base price in cents. */
  price: number;
  /** Optional per-option-value surcharge in cents. */
  surcharge?: Record<string, number>;
  specs?: { label: string; value: string }[];
  /** Variant option values that are sold out. */
  soldOut?: string[];
}

function cartesian(options: ProductOption[]): Record<string, string>[] {
  return options.reduce<Record<string, string>[]>(
    (acc, opt) =>
      acc.flatMap((combo) =>
        opt.values.map((v) => ({ ...combo, [opt.name]: v })),
      ),
    [{}],
  );
}

/** Deterministic pseudo-stock so builds are reproducible. */
function stockFor(key: string): number {
  let h = 0;
  for (const c of key) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return 1 + (h % 12);
}

function build(seed: Seed): Product {
  const variants: ProductVariant[] = cartesian(seed.options).map((combo) => {
    const values = Object.values(combo);
    const key = `${seed.handle}:${values.join("/")}`;
    const extra = values.reduce((s, v) => s + (seed.surcharge?.[v] ?? 0), 0);
    const soldOut = values.some((v) => seed.soldOut?.includes(v));
    return {
      id: `variant:${key}`,
      title: values.join(" / ") || "Default",
      selectedOptions: combo,
      price: { amount: seed.price + extra, currencyCode: CURRENCY },
      quantityAvailable: soldOut ? 0 : stockFor(key),
    };
  });
  return {
    id: `product:${seed.handle}`,
    handle: seed.handle,
    store: seed.store,
    title: seed.title,
    category: seed.category,
    description: seed.description,
    images: [{ alt: seed.title, art: seed.art }],
    options: seed.options,
    variants,
    specs: seed.specs ?? [],
  };
}

const APPAREL = ["XS", "S", "M", "L", "XL"];

const seeds: Seed[] = [
  // ---------------------------------------------------------------- Boards
  {
    handle: "sunset-shortboard",
    store: "boards",
    title: "Sunset Shortboard",
    category: "Shortboard",
    description:
      "A performance thruster for punchy beach breaks. Single-to-double concave through the fins for drive off the bottom, with a pulled-in squash tail that holds in the pocket.",
    art: { kind: "board", color: "#e8734a", accent: "#fff3d6" },
    options: [{ name: "Length", values: ["5'10\"", "6'0\"", "6'2\""] }],
    price: 72000,
    surcharge: { "6'2\"": 2000 },
    specs: [
      { label: "Dimensions", value: '6\'0" × 19 1/4" × 2 3/8"' },
      { label: "Volume", value: "29.8 L" },
      { label: "Fins", value: "Thruster · FCS II" },
      { label: "Construction", value: "PU / Polyester" },
    ],
  },
  {
    handle: "drift-mid-length",
    store: "boards",
    title: "Drift Mid-Length",
    category: "Mid-length",
    description:
      "Long, flowing lines for drawn-out turns. Rolled vee entry into a flat mid-section makes the Drift glide over flat spots and trim like it's on rails.",
    art: { kind: "board", color: "#3fa7a0", accent: "#f6e7c1" },
    options: [{ name: "Length", values: ["7'0\"", "7'4\"", "7'8\""] }],
    price: 89000,
    specs: [
      { label: "Dimensions", value: '7\'4" × 21" × 2 3/4"' },
      { label: "Volume", value: "47.5 L" },
      { label: "Fins", value: "2+1 · Futures" },
      { label: "Construction", value: "PU / Polyester" },
    ],
  },
  {
    handle: "lazy-days-longboard",
    store: "boards",
    title: "Lazy Days Longboard",
    category: "Longboard",
    description:
      "A classic nose-rider with a wide square tail and 50/50 rails. Walk to the tip and hang ten on small, peeling days.",
    art: { kind: "board", color: "#f2b632", accent: "#7a4b2a" },
    options: [{ name: "Length", values: ["9'0\"", "9'4\"", "9'8\""] }],
    price: 112000,
    soldOut: ["9'8\""],
    specs: [
      { label: "Dimensions", value: '9\'4" × 23" × 3"' },
      { label: "Volume", value: "71.0 L" },
      { label: "Fins", value: "Single · 10\" box" },
      { label: "Construction", value: "PU / Volan glass" },
    ],
  },
  {
    handle: "pixel-fish",
    store: "boards",
    title: "Pixel Fish",
    category: "Fish",
    description:
      "Wide, flat and fast. A retro twin fin with a deep swallow tail that turns mushy summer surf into the most fun session of the week.",
    art: { kind: "board", color: "#7bc6e8", accent: "#e8734a" },
    options: [{ name: "Length", values: ["5'4\"", "5'6\"", "5'8\""] }],
    price: 68000,
    specs: [
      { label: "Dimensions", value: '5\'6" × 21" × 2 1/2"' },
      { label: "Volume", value: "33.2 L" },
      { label: "Fins", value: "Twin · Keel" },
      { label: "Construction", value: "EPS / Epoxy" },
    ],
  },
  {
    handle: "foamie-softboard",
    store: "boards",
    title: "Foamie Softboard",
    category: "Softboard",
    description:
      "Soft top, tough bottom. The friendliest way to learn, and the board everyone grabs when it's tiny and crowded.",
    art: { kind: "board", color: "#c9e86b", accent: "#2f6f8f" },
    options: [{ name: "Length", values: ["7'0\"", "8'0\""] }],
    price: 29000,
    specs: [
      { label: "Dimensions", value: '8\'0" × 22 1/2" × 3 1/4"' },
      { label: "Volume", value: "86.0 L" },
      { label: "Fins", value: "Thruster · soft fins included" },
      { label: "Construction", value: "EPS core / IXPE deck" },
    ],
  },
  // ------------------------------------------------------------------ Wear
  {
    handle: "logo-tee",
    store: "wear",
    title: "Pixel Logo Tee",
    category: "T-shirt",
    description:
      "Heavyweight organic cotton tee with the 8-bit SURFBIT wordmark on the chest. Garment dyed and pre-shrunk.",
    art: { kind: "tee", color: "#fff3d6", accent: "#e8734a" },
    options: [
      { name: "Color", values: ["Sand", "Sea Foam", "Charcoal"] },
      { name: "Size", values: APPAREL },
    ],
    price: 3800,
    soldOut: ["XS"],
    specs: [
      { label: "Material", value: "100% organic cotton, 240 gsm" },
      { label: "Fit", value: "Relaxed" },
    ],
  },
  {
    handle: "offshore-hoodie",
    store: "wear",
    title: "Offshore Hoodie",
    category: "Hoodie",
    description:
      "Brushed-back fleece for dawn patrol car parks and post-surf bonfires. Kangaroo pocket, no drawcords to tangle.",
    art: { kind: "hoodie", color: "#2f6f8f", accent: "#f2b632" },
    options: [
      { name: "Color", values: ["Deep Blue", "Sand"] },
      { name: "Size", values: APPAREL },
    ],
    price: 8400,
    specs: [
      { label: "Material", value: "80% cotton / 20% recycled poly" },
      { label: "Fit", value: "Oversized" },
    ],
  },
  {
    handle: "reef-boardshorts",
    store: "wear",
    title: "Reef Boardshorts",
    category: "Boardshorts",
    description:
      "4-way stretch, 18\" outseam, and a key loop that actually holds your key. Quick-dry recycled fabric.",
    art: { kind: "shorts", color: "#e8734a", accent: "#fff3d6" },
    options: [
      { name: "Color", values: ["Coral", "Lagoon"] },
      { name: "Waist", values: ["28", "30", "32", "34", "36"] },
    ],
    price: 6200,
    specs: [
      { label: "Material", value: "Recycled polyester / elastane" },
      { label: "Outseam", value: '18"' },
    ],
  },
  {
    handle: "tide-one-piece",
    store: "wear",
    title: "Tide One-Piece",
    category: "Swimwear",
    description:
      "A scoop-back one-piece cut to stay put through duck dives. Lined, UPF 50+, made from regenerated nylon.",
    art: { kind: "swim", color: "#3fa7a0", accent: "#fff3d6" },
    options: [
      { name: "Color", values: ["Lagoon", "Coral"] },
      { name: "Size", values: ["XS", "S", "M", "L"] },
    ],
    price: 9200,
    specs: [
      { label: "Material", value: "ECONYL® regenerated nylon" },
      { label: "Protection", value: "UPF 50+" },
    ],
  },
  // ------------------------------------------------------------------ Gear
  {
    handle: "keel-twin-fins",
    store: "gear",
    title: "Keel Twin Fins",
    category: "Fins",
    description:
      "Fibreglass keels with a wide base for drive and speed down the line. The perfect partner for the Pixel Fish.",
    art: { kind: "fins", color: "#f2b632", accent: "#7a4b2a" },
    options: [{ name: "System", values: ["FCS II", "Futures"] }],
    price: 9500,
    specs: [{ label: "Material", value: "Solid fibreglass" }],
  },
  {
    handle: "coil-leash",
    store: "gear",
    title: "Comp Leash",
    category: "Leash",
    description:
      "A 6mm comp leash with a double-swivel and a soft, stay-put ankle cuff. Strong enough for overhead days.",
    art: { kind: "leash", color: "#e8734a", accent: "#2b2b3a" },
    options: [{ name: "Length", values: ["6'", "7'", "8'"] }],
    price: 3400,
    specs: [{ label: "Cord", value: "6 mm urethane" }],
  },
  {
    handle: "grip-traction-pad",
    store: "gear",
    title: "Grip Traction Pad",
    category: "Traction",
    description:
      "Three-piece pad with a raised kick and diamond groove pattern. Keeps your back foot exactly where it should be.",
    art: { kind: "pad", color: "#2b2b3a", accent: "#3fa7a0" },
    options: [{ name: "Color", values: ["Black", "Lagoon"] }],
    price: 4800,
    specs: [{ label: "Pieces", value: "3" }],
  },
  {
    handle: "day-board-bag",
    store: "gear",
    title: "Day Board Bag",
    category: "Board bag",
    description:
      "5mm padded day bag with a reflective silver top. Protects from dings and keeps wax from melting on the drive.",
    art: { kind: "bag", color: "#c8ccd4", accent: "#2f6f8f" },
    options: [{ name: "Size", values: ["6'0\"", "6'6\"", "7'6\"", "9'6\""] }],
    price: 11000,
    surcharge: { "7'6\"": 1500, "9'6\"": 3000 },
    specs: [{ label: "Padding", value: "5 mm" }],
  },
  {
    handle: "tropical-wax",
    store: "gear",
    title: "Tropical Wax (3 pack)",
    category: "Wax",
    description:
      "Coconut-scented, made for water over 75°F / 24°C. Three bars, plastic-free paper wrap.",
    art: { kind: "wax", color: "#fff3d6", accent: "#3fa7a0" },
    options: [{ name: "Temp", values: ["Tropical", "Warm", "Cool"] }],
    price: 1200,
    specs: [{ label: "Bars", value: "3 × 85 g" }],
  },
  {
    handle: "springsuit-wetsuit",
    store: "gear",
    title: "2mm Springsuit",
    category: "Wetsuit",
    description:
      "Short arms, short legs, long sessions. Back-zip springsuit in limestone neoprene for spring and autumn.",
    art: { kind: "wetsuit", color: "#2b2b3a", accent: "#e8734a" },
    options: [{ name: "Size", values: ["S", "M", "L", "XL"] }],
    price: 15500,
    soldOut: ["XL"],
    specs: [
      { label: "Thickness", value: "2 mm" },
      { label: "Entry", value: "Back zip" },
    ],
  },
  // ----------------------------------------------------------------- Goods
  {
    handle: "wave-trucker-cap",
    store: "goods",
    title: "Wave Trucker Cap",
    category: "Cap",
    description:
      "A mesh-back trucker cap with the SURFBIT wave embroidered up front. The adjustable snapback keeps the brim where you want it on windy beach days.",
    art: { kind: "cap", color: "#114f6d", accent: "#fff3d6" },
    options: [{ name: "Color", values: ["Navy", "Sand"] }],
    price: 3200,
  },
  {
    handle: "polarized-shades",
    store: "goods",
    title: "Polarized Shades",
    category: "Sunglasses",
    description:
      "Polarized lenses cut glare off the water so you can watch the sets roll in. The lightweight frame is comfortable for a whole afternoon on the beach.",
    art: { kind: "shades", color: "#2b2b3a", accent: "#6fccd2" },
    options: [{ name: "Frame", values: ["Black", "Tortoise"] }],
    price: 5800,
  },
  {
    handle: "day-pack",
    store: "goods",
    title: "Day Pack",
    category: "Backpack",
    description:
      "A 20 L day pack with room for a change of clothes, a towel and a bottle. A separate wet pocket keeps a damp swimsuit away from the rest of your kit.",
    art: { kind: "backpack", color: "#2f6f8f", accent: "#f2b632" },
    options: [],
    price: 7400,
  },
  {
    handle: "stripe-beach-towel",
    store: "goods",
    title: "Stripe Beach Towel",
    category: "Towel",
    description:
      "A flat-woven cotton towel that shakes sand loose before you pack up. Wide stripes make it easy to spot from the water.",
    art: { kind: "towel", color: "#e8734a", accent: "#fff3d6" },
    options: [{ name: "Color", values: ["Coral", "Teal"] }],
    price: 4200,
  },
  {
    handle: "steel-bottle",
    store: "goods",
    title: "Steel Bottle",
    category: "Water bottle",
    description:
      "Double-wall stainless steel keeps your water cold through a whole session. The screw cap has a carry loop for the walk down to the beach.",
    art: { kind: "bottle", color: "#3fa7a0", accent: "#fff3d6" },
    options: [{ name: "Size", values: ["500 ml", "750 ml"] }],
    price: 2800,
    surcharge: { "750 ml": 400 },
  },
  {
    handle: "pixel-sticker-pack",
    store: "goods",
    title: "Pixel Sticker Pack",
    category: "Stickers",
    description:
      "Waterproof vinyl stickers featuring the pixel wave and a little piece of SURFBIT town. Stick them on a bottle, a board case or a laptop for a reminder of the coast.",
    art: { kind: "stickers", color: "#fff3d6", accent: "#e8734a" },
    options: [],
    price: 900,
  },
];

export const CATALOG: Product[] = seeds.map(build);
