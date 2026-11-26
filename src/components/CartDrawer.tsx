"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, type KeyboardEvent } from "react";
import { formatMoney } from "@/commerce/format";
import { cartSubtotal, useCart, type CartLine } from "@/state/cart";
import { useUI } from "@/state/ui";
import styles from "./CartDrawer.module.css";

export function CartButton({ className = styles.trigger, count }: { className?: string; count?: number }) {
  return (
    <button
      className={`sb-btn sb-btn--secondary sb-pixel ${className}`}
      type="button"
      aria-haspopup="dialog"
      onClick={() => useUI.getState().openPanel("cart")}
    >
      Cart
      {count !== undefined && <span className={styles.badge}>{count}</span>}
    </button>
  );
}

export function CartDrawer() {
  const pathname = usePathname();
  const open = useUI((state) => state.panel === "cart");

  return (
    <>
      {pathname !== "/" && <CartButton />}
      {open && <CartPanel />}
    </>
  );
}

function CartPanel() {
  const cart = useCart();
  const hasLines = cart.lines.length > 0;
  const closeAll = useUI((state) => state.closeAll);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const keepExploringRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const previousFocus = document.activeElement;
    dialog.showModal();
    return () => {
      dialog.close();
      const canvas = document.getElementById("world-canvas");
      const target = canvas ?? previousFocus;
      if (target instanceof HTMLElement) target.focus({ preventScroll: true });
    };
  }, []);

  function onKeyDown(event: KeyboardEvent<HTMLDialogElement>) {
    if (event.repeat && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
    }
    if (event.key !== "Tab") return;
    const first = closeRef.current;
    const last = keepExploringRef.current;
    if (event.shiftKey ? event.target === first : event.target === last) {
      event.preventDefault();
      (event.shiftKey ? last : first)?.focus();
    }
  }

  function removeLine(variantId: string) {
    closeRef.current?.focus();
    cart.remove(variantId);
  }

  return (
    <dialog
      ref={dialogRef}
      className={`sb-panel ${styles.drawer}`}
      aria-labelledby="cart-title"
      onKeyDown={onKeyDown}
      onCancel={(event) => {
        event.preventDefault();
        closeAll();
      }}
    >
      <div className={styles.header}>
        <h2 id="cart-title" className="sb-pixel">Your cart</h2>
        <button ref={closeRef} type="button" className={styles.close} aria-label="Close cart" onClick={closeAll}>
          ×
        </button>
      </div>

      {hasLines ? (
        <ul className={styles.lines} role="list">
          {cart.lines.map((line) => (
            <CartItem key={line.variantId} line={line} onRemove={() => removeLine(line.variantId)} />
          ))}
        </ul>
      ) : (
        <p className={styles.empty} role="status">Your cart is empty.</p>
      )}

      <div className={styles.footer}>
        {hasLines && (
          <>
            <p className={styles.subtotal} aria-live="polite">
              <span>Subtotal</span>
              <strong>{formatMoney(cartSubtotal(cart))}</strong>
            </p>
            <Link href="/checkout" prefetch={false} className="sb-btn" onNavigate={closeAll}>
              Checkout
            </Link>
          </>
        )}
        <button ref={keepExploringRef} type="button" className="sb-btn sb-btn--secondary" onClick={closeAll}>
          Keep exploring
        </button>
      </div>
    </dialog>
  );
}

function CartItem({ line, onRemove }: { line: CartLine; onRemove: () => void }) {
  const label = `${line.title}, ${line.variantTitle}`;
  const canDecrease = line.quantity > 1;
  const canIncrease = line.quantity < line.maxQuantity;

  return (
    <li className={styles.line}>
      <div className={styles.lineDetails}>
        <div>
          <h3>{line.title}</h3>
          <p>{line.variantTitle}</p>
        </div>
        <strong>{formatMoney({ ...line.price, amount: line.price.amount * line.quantity })}</strong>
      </div>
      <div className={styles.lineActions}>
        <div className={styles.stepper} role="group" aria-label={`Quantity for ${label}`}>
          <button
            type="button"
            aria-label="Decrease quantity"
            aria-disabled={!canDecrease}
            onClick={() => {
              if (canDecrease) useCart.getState().setQuantity(line.variantId, line.quantity - 1);
            }}
          >
            −
          </button>
          <span aria-live="polite">{line.quantity}</span>
          <button
            type="button"
            aria-label="Increase quantity"
            aria-disabled={!canIncrease}
            onClick={() => {
              if (canIncrease) useCart.getState().setQuantity(line.variantId, line.quantity + 1);
            }}
          >
            +
          </button>
        </div>
        <button type="button" className={styles.remove} aria-label={`Remove ${label}`} onClick={onRemove}>
          Remove
        </button>
      </div>
    </li>
  );
}
