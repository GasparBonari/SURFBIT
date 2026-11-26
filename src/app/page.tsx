import type { Metadata } from "next";
import Link from "next/link";
import { commerce } from "@/commerce";
import { CatalogHydrator } from "@/components/CatalogHydrator";
import { DialogBox } from "@/components/DialogBox";
import { Hud } from "@/components/Hud";
import { InteractPrompt } from "@/components/InteractPrompt";
import { ProductModal } from "@/components/ProductModal";
import { StoreDirectory } from "@/components/StoreDirectory";
import { WorldClient } from "./World";
import styles from "./page.module.css";

export const metadata: Metadata = { alternates: { canonical: "/" } };

export default async function Home() {
  const products = await commerce.listProducts();

  return (
    <main className={styles.main}>
      <h1 className="sr-only">SURFBIT Beach Town</h1>
      <CatalogHydrator products={products} />
      <WorldClient className={styles.world} />
      <Hud />
      <StoreDirectory />
      <InteractPrompt />
      <DialogBox />
      <ProductModal />
      <noscript>
        <div className={styles.fallback}>
          <div className={`sb-panel ${styles.notice}`}>
            <p>Enable JavaScript to explore the beach town.</p>
            <Link href="/shop" prefetch={false} className="sb-btn sb-btn--secondary">
              Browse the shop
            </Link>
          </div>
        </div>
      </noscript>
    </main>
  );
}
