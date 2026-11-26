import Link from "next/link";
import { commerce } from "@/commerce";
import { CatalogHydrator } from "@/components/CatalogHydrator";
import { DialogBox } from "@/components/DialogBox";
import { InteractPrompt } from "@/components/InteractPrompt";
import { ProductModal } from "@/components/ProductModal";
import { WorldClient } from "./World";
import styles from "./page.module.css";

export default async function Home() {
  const products = await commerce.listProducts();

  return (
    <main className={styles.main}>
      <h1 className="sr-only">SURFBIT Beach Town</h1>
      <CatalogHydrator products={products} />
      <WorldClient className={styles.world} />
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
