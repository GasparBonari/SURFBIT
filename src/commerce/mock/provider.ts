import { randomBytes } from "node:crypto";
import type { CommerceProvider } from "../types";
import { CATALOG } from "./catalog";

const variants = new Map(
  CATALOG.flatMap((product) => product.variants.map((variant) => [variant.id, variant] as const)),
);

/**
 * Local demo provider. Validates lines against the catalog server-side
 * (never trusts client prices) and "checks out" to a local confirmation page.
 */
export const mockProvider: CommerceProvider = {
  async listProducts() {
    return CATALOG;
  },

  async getProduct(handle) {
    return CATALOG.find((p) => p.handle === handle) ?? null;
  },

  async createCheckout(lines) {
    if (lines.length === 0) return { ok: false, error: "Your cart is empty." };
    const quantities = new Map<string, number>();
    let total = 0;
    for (const line of lines) {
      const variant = variants.get(line.variantId);
      if (!variant) return { ok: false, error: "An item is no longer sold." };
      if (!Number.isSafeInteger(line.quantity) || line.quantity < 1)
        return { ok: false, error: "Invalid quantity." };
      const quantity = (quantities.get(line.variantId) ?? 0) + line.quantity;
      if (quantity > variant.quantityAvailable)
        return {
          ok: false,
          error: `Only ${variant.quantityAvailable} left of ${variant.title}.`,
        };
      quantities.set(line.variantId, quantity);
      total += variant.price.amount * line.quantity;
    }
    const order = `SB-${randomBytes(8).toString("hex").toUpperCase()}`;
    return {
      ok: true,
      redirectUrl: `/checkout/success?order=${order}&total=${total}`,
    };
  },
};
