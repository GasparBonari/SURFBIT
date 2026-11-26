import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { formatMoney } from "@/commerce/format";
import { ClearCompletedCart } from "../CheckoutReview";
import styles from "../Checkout.module.css";

export const metadata: Metadata = { title: "Order confirmation" };

export default function CheckoutSuccessPage({ searchParams }: PageProps<"/checkout/success">) {
  return (
    <main className={styles.page}>
      <section className={`sb-panel ${styles.panel}`}>
        <header className={styles.header}>
          <h1>Order confirmation</h1>
          <p>Demo checkout — no payment is taken.</p>
        </header>
        <div className={styles.content}>
          <Suspense fallback={<p role="status">Loading confirmation…</p>}>
            <OrderConfirmation searchParams={searchParams} />
          </Suspense>
          <Link href="/" className="sb-btn sb-btn--secondary">Back to town</Link>
        </div>
      </section>
    </main>
  );
}

async function OrderConfirmation({ searchParams }: Pick<PageProps<"/checkout/success">, "searchParams">) {
  const { order, total } = await searchParams;
  const amount = typeof total === "string" && /^\d+$/.test(total) ? Number(total) : NaN;
  if (typeof order !== "string" || !/^SB-[A-F0-9]{16}$/.test(order) || !Number.isSafeInteger(amount)) {
    return <p>No demo order to confirm.</p>;
  }

  return (
    <>
      <p>Order number <strong>{order}</strong></p>
      <p>Demo total <strong>{formatMoney({ amount, currencyCode: "USD" })}</strong></p>
      <ClearCompletedCart />
    </>
  );
}
