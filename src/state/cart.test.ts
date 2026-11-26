import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import type { Product, ProductVariant } from "../commerce/types";
import { useCart } from "./cart";

vi.hoisted(() => {
  // Zustand captures localStorage when the cart module is evaluated.
  vi.stubGlobal("window", {
    localStorage: {
      getItem: () => null,
      setItem: vi.fn(),
      removeItem: vi.fn(),
    },
  });
});

const variant: ProductVariant = {
  id: "small",
  title: "S",
  selectedOptions: { Size: "S" },
  price: { amount: 3500, currencyCode: "USD" },
  quantityAvailable: 4,
};
const otherVariant: ProductVariant = {
  ...variant,
  id: "medium",
  title: "M",
  selectedOptions: { Size: "M" },
};
const product: Product = {
  id: "surf-tee",
  handle: "surf-tee",
  title: "Surf Tee",
  store: "wear",
  category: "Tee",
  description: "A surf tee.",
  images: [],
  options: [{ name: "Size", values: ["S", "M"] }],
  variants: [variant, otherVariant],
  specs: [],
};

beforeEach(() => useCart.getState().clear());
afterAll(() => vi.unstubAllGlobals());

describe("cart", () => {
  it("merges repeated adds of the same variant into a single line", () => {
    useCart.getState().add(product, variant, 1);
    useCart.getState().add(product, variant, 2);

    expect(useCart.getState().lines).toMatchObject([
      { variantId: variant.id, quantity: 3 },
    ]);
  });

  it("clamps a new line's quantity to available stock", () => {
    useCart.getState().add(product, variant, 5);

    expect(useCart.getState().lines[0].quantity).toBe(variant.quantityAvailable);
  });

  it("clamps the combined quantity to available stock when merging", () => {
    useCart.getState().add(product, variant, 3);
    useCart.getState().add(product, variant, 2);

    expect(useCart.getState().lines).toMatchObject([
      { variantId: variant.id, quantity: variant.quantityAvailable },
    ]);
  });

  it("removes only the selected line when its quantity is set to zero", () => {
    useCart.getState().add(product, variant, 1);
    useCart.getState().add(product, otherVariant, 2);
    useCart.getState().setQuantity(variant.id, 0);

    expect(useCart.getState().lines).toMatchObject([
      { variantId: otherVariant.id, quantity: 2 },
    ]);
  });
});
