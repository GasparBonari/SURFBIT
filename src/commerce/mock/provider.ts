import type { CommerceProvider } from "../types";
import { CATALOG } from "./catalog";

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
    let total = 0;
    for (const line of lines) {
      const variant = CATALOG.flatMap((p) => p.variants).find(
        (v) => v.id === line.variantId,
      );
      if (!variant) return { ok: false, error: "An item is no longer sold." };
      if (!Number.isInteger(line.quantity) || line.quantity < 1)
        return { ok: false, error: "Invalid quantity." };
      if (line.quantity > variant.quantityAvailable)
        return {
          ok: false,
          error: `Only ${variant.quantityAvailable} left of ${variant.title}.`,
        };
      total += variant.price.amount * line.quantity;
    }
    const order = `SB-${Date.now().toString(36).toUpperCase()}`;
    return {
      ok: true,
      redirectUrl: `/checkout/success?order=${order}&total=${total}`,
    };
  },
};
