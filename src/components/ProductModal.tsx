"use client";

import Link from "next/link";
import { useEffect, useRef, type KeyboardEvent } from "react";
import { useCatalog } from "@/state/catalog";
import { useUI } from "@/state/ui";
import { trackEvent } from "@/telemetry/client";
import { ProductArt } from "./ProductArt";
import { ProductPurchase } from "./ProductPurchase";
import styles from "./ProductModal.module.css";

export function ProductModal() {
  const handle = useUI((state) => state.product);
  return handle !== null && <ProductPanel key={handle} handle={handle} />;
}

function ProductPanel({ handle }: { handle: string }) {
  const product = useCatalog((state) => state.products[handle]);
  const closeAll = useUI((state) => state.closeAll);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const tracked = useRef(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const linkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    dialog.showModal();
    if (!tracked.current) {
      tracked.current = true;
      trackEvent({ event: "product_inspect", product: handle });
    }
    return () => {
      dialog.close();
      document.getElementById("world-canvas")?.focus({ preventScroll: true });
    };
  }, [handle]);

  function onKeyDown(event: KeyboardEvent<HTMLDialogElement>) {
    if (event.repeat && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
    }
    if (event.key !== "Tab") return;

    const first = closeRef.current;
    const last = linkRef.current ?? first;
    if (event.shiftKey ? event.target === first : event.target === last) {
      event.preventDefault();
      (event.shiftKey ? last : first)?.focus();
    }
  }

  const image = product?.images[0];

  return (
    <dialog
      ref={dialogRef}
      className={`sb-panel ${styles.dialog}`}
      aria-labelledby="product-title"
      onKeyDown={onKeyDown}
      onCancel={(event) => {
        event.preventDefault();
        closeAll();
      }}
    >
      <button ref={closeRef} className={styles.close} type="button" aria-label="Close product" onClick={closeAll}>
        ×
      </button>
      <div className={styles.scroll}>
        {product ? (
          <div className={styles.layout}>
            {image && <div className={styles.art}><ProductArt image={image} /></div>}
            <div className={styles.details}>
              <h2 id="product-title">{product.title}</h2>
              <p className={styles.description}>{product.description}</p>
              {product.specs.length > 0 && (
                <dl className={styles.specs}>
                  {product.specs.map(({ label, value }) => (
                    <div key={label}>
                      <dt>{label}</dt>
                      <dd>{value}</dd>
                    </div>
                  ))}
                </dl>
              )}
              <ProductPurchase product={product} />
              <Link
                ref={linkRef}
                href={`/products/${encodeURIComponent(product.handle)}`}
                prefetch={false}
                className={styles.link}
                onNavigate={closeAll}
              >
                View full page
              </Link>
            </div>
          </div>
        ) : (
          <div className={styles.details}>
            <h2 id="product-title">Product unavailable</h2>
          </div>
        )}
      </div>
    </dialog>
  );
}
