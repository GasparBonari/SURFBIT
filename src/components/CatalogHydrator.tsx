"use client";

import { useEffect } from "react";
import type { Product } from "@/commerce/types";
import { useCatalog } from "@/state/catalog";

export function CatalogHydrator({ products }: { products: Product[] }) {
  useEffect(() => {
    useCatalog.getState().hydrate(products);
  }, [products]);

  return null;
}
