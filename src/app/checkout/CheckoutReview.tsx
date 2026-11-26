"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { formatMoney } from "@/commerce/format";
import { useCartHydrated } from "@/components/StoreHydrator";
import { cartSubtotal, useCart, type CartLine } from "@/state/cart";
import styles from "./Checkout.module.css";

const checkoutReturnKey = "surfbit-checkout-return";
const checkoutError = "Checkout could not be started. Please try again.";

function checkoutLines(lines: CartLine[]) {
  return lines.map(({ variantId, quantity }) => ({ variantId, quantity }));
}

export function CheckoutReview() {
  const hydrated = useCartHydrated();
  const cart = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting || !cart.lines.length) return;

    setSubmitting(true);
    setError("");
    const body = JSON.stringify({ lines: checkoutLines(cart.lines) });

    let message = checkoutError;
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      });
      const result: unknown = await response.json();
      if (result && typeof result === "object") {
        if (response.ok && "redirectUrl" in result && typeof result.redirectUrl === "string") {
          const destination = new URL(result.redirectUrl, window.location.href);
          if (destination.origin === window.location.origin) {
            sessionStorage.setItem(checkoutReturnKey, JSON.stringify({ url: destination.href, body }));
          }
          window.location.assign(destination.href);
          return;
        }
        if (!response.ok && "error" in result && typeof result.error === "string") {
          message = result.error;
        }
      }
    } catch {
      // Keep the review available if the request or redirect fails.
    }
    setError(message);
    setSubmitting(false);
  }

  if (!hydrated) {
    return <p className={styles.content} role="status">Loading your cart…</p>;
  }

  if (!cart.lines.length) {
    return (
      <div className={styles.content}>
        <p>Your cart is empty.</p>
        <ReturnToTown />
      </div>
    );
  }

  return (
    <form className={styles.content} onSubmit={submit}>
      <ul className={styles.lines} role="list" aria-label="Cart items">
        {cart.lines.map((line) => (
          <li className={styles.line} key={line.variantId}>
            <div>
              <strong>{line.title}</strong>
              <p className={styles.detail}>{line.variantTitle} · Quantity {line.quantity}</p>
            </div>
            <strong>{formatMoney({ ...line.price, amount: line.price.amount * line.quantity })}</strong>
          </li>
        ))}
      </ul>
      <p className={styles.total}>
        <span>Subtotal</span>
        <strong>{formatMoney(cartSubtotal(cart))}</strong>
      </p>
      {error && <p role="alert" className={styles.error}>{error}</p>}
      <div className={styles.actions}>
        <button type="submit" className="sb-btn" aria-disabled={submitting}>
          {submitting ? "Placing order…" : "Place demo order"}
        </button>
        <span role="status" className="sr-only">{submitting ? "Placing order…" : ""}</span>
        <ReturnToTown />
      </div>
    </form>
  );
}

export function ClearCompletedCart() {
  const hydrated = useCartHydrated();

  useEffect(() => {
    if (!hydrated) return;

    // An old confirmation or a cart changed during checkout must leave the current cart intact.
    try {
      const completed: unknown = JSON.parse(sessionStorage.getItem(checkoutReturnKey) ?? "null");
      if (!completed || typeof completed !== "object" || !("url" in completed) ||
          completed.url !== window.location.href) return;
      sessionStorage.removeItem(checkoutReturnKey);
      const cart = useCart.getState();
      const body = JSON.stringify({ lines: checkoutLines(cart.lines) });
      if ("body" in completed && completed.body === body) cart.clear();
    } catch {
      return;
    }
  }, [hydrated]);

  return null;
}

function ReturnToTown() {
  return <Link href="/" className="sb-btn sb-btn--secondary">Back to town</Link>;
}
