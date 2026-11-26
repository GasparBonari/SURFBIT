"use client";

import { useState, type ReactNode } from "react";
import type { StoreId } from "@/commerce/types";
import styles from "./Shop.module.css";

type ShopSection = { id: StoreId; name: string; content: ReactNode };

export function ShopSections({ sections }: { sections: ShopSection[] }) {
  const [store, setStore] = useState<StoreId | null>(null);
  const filters = [{ id: null, name: "All" }, ...sections];

  return (
    <>
      <div className={styles.filters} role="group" aria-label="Filter by store">
        {filters.map(({ id, name }) => (
          <button
            key={id ?? "all"}
            className="sb-btn sb-btn--secondary"
            type="button"
            aria-pressed={store === id}
            onClick={() => setStore(id)}
          >
            {name}
          </button>
        ))}
      </div>
      {sections.map(({ id, content }) => (
        <section key={id} id={id} hidden={store !== null && store !== id} className={styles.section} aria-labelledby={`${id}-title`}>
          {content}
        </section>
      ))}
    </>
  );
}
