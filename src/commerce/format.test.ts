import { describe, expect, it } from "vitest";
import { defaultSelection, findVariant, formatMoney } from "./format";
import type { Product } from "./types";

const price = { amount: 3500, currencyCode: "USD" };
const product: Product = {
  id: "surf-tee",
  handle: "surf-tee",
  title: "Surf Tee",
  store: "wear",
  category: "Tee",
  description: "A surf tee.",
  images: [],
  options: [
    { name: "Size", values: ["S", "M"] },
    { name: "Color", values: ["Coral", "Teal"] },
  ],
  variants: [
    {
      id: "small-coral",
      title: "S / Coral",
      selectedOptions: { Size: "S", Color: "Coral" },
      price,
      quantityAvailable: 0,
    },
    {
      id: "small-teal",
      title: "S / Teal",
      selectedOptions: { Size: "S", Color: "Teal" },
      price,
      quantityAvailable: 2,
    },
    {
      id: "medium-teal",
      title: "M / Teal",
      selectedOptions: { Size: "M", Color: "Teal" },
      price,
      quantityAvailable: 3,
    },
  ],
  specs: [],
};

describe("formatMoney", () => {
  it("formats USD cents as dollars with grouping and two decimal places", () => {
    expect(formatMoney({ amount: 123456, currencyCode: "USD" })).toBe("$1,234.56");
  });
});

describe("findVariant", () => {
  it("matches the variant with all selected option values", () => {
    expect(findVariant(product, { Size: "S", Color: "Teal" })?.id).toBe("small-teal");
  });

  it("returns undefined for an unavailable option combination", () => {
    expect(findVariant(product, { Size: "M", Color: "Coral" })).toBeUndefined();
  });
});

describe("defaultSelection", () => {
  it("selects the first in-stock variant", () => {
    expect(defaultSelection(product)).toEqual({ Size: "S", Color: "Teal" });
  });

  it("falls back to the first variant when all variants are sold out", () => {
    const soldOutProduct = {
      ...product,
      variants: product.variants.map((variant) => ({
        ...variant,
        quantityAvailable: 0,
      })),
    };

    expect(defaultSelection(soldOutProduct)).toEqual({ Size: "S", Color: "Coral" });
  });
});
