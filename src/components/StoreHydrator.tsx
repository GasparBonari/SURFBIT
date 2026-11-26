"use client";

import { useEffect } from "react";
import { useCart } from "@/state/cart";
import { useSettings } from "@/state/settings";

export function StoreHydrator() {
  useEffect(() => {
    void useCart.persist?.rehydrate();
    void useSettings.persist?.rehydrate();
  }, []);

  return null;
}
