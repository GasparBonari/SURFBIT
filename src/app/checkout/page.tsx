import type { Metadata } from "next";
import { CheckoutReview } from "./CheckoutReview";
import styles from "./Checkout.module.css";

export const metadata: Metadata = { title: "Checkout" };

export default function CheckoutPage() {
  return (
    <main className={styles.page}>
      <section className={`sb-panel ${styles.panel}`}>
        <header className={styles.header}>
          <h1>Checkout</h1>
          <p>Demo checkout — no payment is taken.</p>
        </header>
        <CheckoutReview />
      </section>
    </main>
  );
}
