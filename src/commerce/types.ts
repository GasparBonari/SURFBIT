/**
 * Commerce domain types. These are provider-agnostic: the world, the cart and
 * the UI only ever see these shapes, never a provider's own specifics.
 */

export type StoreId = "boards" | "wear" | "gear" | "goods" | "workshop" | "beach-club";

export interface Money {
  /** Minor units (cents) to avoid floating point drift. */
  amount: number;
  currencyCode: string;
}

/** Placeholder illustration used until real product photography exists. */
export interface ProductArt {
  kind:
    | "board"
    | "tee"
    | "hoodie"
    | "shorts"
    | "swim"
    | "fins"
    | "leash"
    | "pad"
    | "bag"
    | "wax"
    | "wetsuit"
    | "cap"
    | "shades"
    | "backpack"
    | "towel"
    | "bottle"
    | "stickers"
    | "kit"
    | "ticket"
    | "blank"
    | "sock"
    | "plugs"
    | "beans";
  color: string;
  accent: string;
}

export type ProductImage =
  | { src: string; alt: string; art?: never }
  | { src?: never; alt: string; art: ProductArt };

export interface ProductOption {
  name: string;
  values: string[];
}

export interface ProductVariant {
  id: string;
  title: string;
  selectedOptions: Record<string, string>;
  price: Money;
  quantityAvailable: number;
}

export interface Product {
  id: string;
  handle: string;
  store: StoreId;
  title: string;
  category: string;
  description: string;
  images: ProductImage[];
  options: ProductOption[];
  variants: ProductVariant[];
  specs: { label: string; value: string }[];
}

export interface CheckoutLine {
  variantId: string;
  quantity: number;
}

export type CheckoutResult =
  | { ok: true; redirectUrl: string }
  | { ok: false; error: string };

/**
 * The single seam between SURFBIT and a commerce backend.
 * A real backend can replace the mock implementation without touching
 * the world, the cart or the UI.
 */
export interface CommerceProvider {
  listProducts(): Promise<Product[]>;
  getProduct(handle: string): Promise<Product | null>;
  createCheckout(lines: CheckoutLine[]): Promise<CheckoutResult>;
}

export const STORES: Record<
  StoreId,
  { name: string; tagline: string; color: string }
> = {
  boards: {
    name: "SURFBIT Boards",
    tagline: "Hand-shaped boards for every wave.",
    color: "#e8734a",
  },
  wear: {
    name: "SURFBIT Wear",
    tagline: "Salt-washed threads for beach days.",
    color: "#3fa7a0",
  },
  gear: {
    name: "SURFBIT Gear",
    tagline: "Fins, leashes, wax and wetsuits.",
    color: "#f2b632",
  },
  goods: {
    name: "SURFBIT Goods",
    tagline: "Beach-day essentials and a little SURFBIT to take home.",
    color: "#114f6d",
  },
  workshop: {
    name: "SURFBIT Workshop",
    tagline: "See how a board is made, then take a little of the workshop home.",
    color: "#2f6f8f",
  },
  "beach-club": {
    name: "SURFBIT Beach Club",
    tagline: "Surf lessons, board rentals and coffee by the sea.",
    color: "#6fccd2",
  },
};
