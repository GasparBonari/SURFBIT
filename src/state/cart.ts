"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Money, Product, ProductVariant } from "@/commerce/types";

export interface CartLine {
  variantId: string;
  productHandle: string;
  title: string;
  variantTitle: string;
  /** Display snapshot only — the server re-prices at checkout. */
  price: Money;
  quantity: number;
  maxQuantity: number;
}

interface CartState {
  lines: CartLine[];
  add(product: Product, variant: ProductVariant, quantity: number): void;
  setQuantity(variantId: string, quantity: number): void;
  remove(variantId: string): void;
  clear(): void;
}

/** One global cart shared by every shop, persisted across sessions. */
export const useCart = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      add: (product, variant, quantity) =>
        set((s) => {
          const existing = s.lines.find((l) => l.variantId === variant.id);
          const max = variant.quantityAvailable;
          if (existing) {
            return {
              lines: s.lines.map((l) =>
                l.variantId === variant.id
                  ? { ...l, quantity: Math.min(max, l.quantity + quantity) }
                  : l,
              ),
            };
          }
          return {
            lines: [
              ...s.lines,
              {
                variantId: variant.id,
                productHandle: product.handle,
                title: product.title,
                variantTitle: variant.title,
                price: variant.price,
                quantity: Math.min(max, quantity),
                maxQuantity: max,
              },
            ],
          };
        }),
      setQuantity: (variantId, quantity) =>
        set((s) => ({
          lines: s.lines
            .map((l) =>
              l.variantId === variantId
                ? { ...l, quantity: Math.min(l.maxQuantity, quantity) }
                : l,
            )
            .filter((l) => l.quantity > 0),
        })),
      remove: (variantId) =>
        set((s) => ({ lines: s.lines.filter((l) => l.variantId !== variantId) })),
      clear: () => set({ lines: [] }),
    }),
    { name: "surfbit-cart", version: 1, skipHydration: true },
  ),
);

export const cartCount = (s: CartState) =>
  s.lines.reduce((n, l) => n + l.quantity, 0);

export const cartSubtotal = (s: CartState): Money => ({
  amount: s.lines.reduce((n, l) => n + l.price.amount * l.quantity, 0),
  currencyCode: s.lines[0]?.price.currencyCode ?? "USD",
});
