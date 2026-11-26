"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useCart } from "@/state/cart";
import { useSettings } from "@/state/settings";

export function useCartHydrated() {
  return useSyncExternalStore(
    (notify) => useCart.persist?.onFinishHydration(notify) ?? (() => {}),
    () => useCart.persist?.hasHydrated() ?? true,
    () => false,
  );
}

export function StoreHydrator() {
  useEffect(() => {
    void useCart.persist?.rehydrate();
    void useSettings.persist?.rehydrate();
  }, []);

  return null;
}
