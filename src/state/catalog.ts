"use client";

import { create } from "zustand";
import type { Product } from "@/commerce/types";

/**
 * Client-side copy of the catalog, hydrated from the server provider.
 * The world references products by handle; the UI resolves them here.
 */
interface CatalogState {
  products: Record<string, Product>;
  hydrate(list: Product[]): void;
}

export const useCatalog = create<CatalogState>()((set) => ({
  products: {},
  hydrate: (list) =>
    set({ products: Object.fromEntries(list.map((p) => [p.handle, p])) }),
}));
