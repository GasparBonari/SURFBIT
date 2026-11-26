import { describe, expect, it } from "vitest";
import { CATALOG } from "./catalog";
import { mockProvider } from "./provider";

const variant = CATALOG[0].variants.find((variant) => variant.quantityAvailable >= 2)!;

describe("mock checkout", () => {
  it("prices repeated lines from the catalog up to the available stock", async () => {
    const lines = [
      { variantId: variant.id, quantity: 1, price: { amount: 1, currencyCode: "USD" } },
      { variantId: variant.id, quantity: variant.quantityAvailable - 1 },
    ];
    const result = await mockProvider.createCheckout(lines);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const { pathname, searchParams } = new URL(result.redirectUrl, "https://surfbit.example");
    expect(pathname).toBe("/checkout/success");
    expect(searchParams.get("total")).toBe(String(variant.price.amount * variant.quantityAvailable));
  });

  it("rejects repeated lines whose combined quantity exceeds available stock", async () => {
    const result = await mockProvider.createCheckout([
      { variantId: variant.id, quantity: variant.quantityAvailable },
      { variantId: variant.id, quantity: 1 },
    ]);

    expect(result).toEqual({
      ok: false,
      error: `Only ${variant.quantityAvailable} left of ${variant.title}.`,
    });
  });
});
