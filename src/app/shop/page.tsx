import type { Metadata } from "next";
import Link from "next/link";
import { commerce } from "@/commerce";
import { priceRange } from "@/commerce/format";
import { STORES, type Product, type StoreId } from "@/commerce/types";
import { ProductArt } from "@/components/ProductArt";
import { SiteHeader } from "@/components/SiteHeader";
import { productPath } from "../siteUrl";
import { ShopSections } from "./ShopSections";
import styles from "./Shop.module.css";

export const metadata: Metadata = {
  title: "Shop Surfboards, Surf Wear, Gear & Goods",
  description: "Browse surfboards, beachwear, surf gear and beach-day essentials from SURFBIT.",
  alternates: { canonical: "/shop" },
};

export default async function ShopPage() {
  const products = await commerce.listProducts();
  const sections = (Object.keys(STORES) as StoreId[]).map((id) => {
    const store = STORES[id];
    const items = products.filter((product) => product.store === id);

    return {
      id,
      name: store.name.replace("SURFBIT ", ""),
      content: (
        <>
          <h2 id={`${id}-title`} className="sb-pixel">{store.name}</h2>
          <p className={styles.tagline}>{store.tagline}</p>
          {items.length ? (
            <ul className={styles.grid} role="list">
              {items.map((product) => <ProductCard key={product.handle} product={product} />)}
            </ul>
          ) : <p>No products in this store yet.</p>}
        </>
      ),
    };
  });

  return (
    <>
      <SiteHeader />
      <main className={styles.page}>
        <h1>Shop SURFBIT</h1>
        <ShopSections sections={sections} />
      </main>
    </>
  );
}

function ProductCard({ product }: { product: Product }) {
  const image = product.images[0];

  return (
    <li className={styles.item}>
      <Link href={productPath(product.handle)} className={`sb-panel ${styles.card}`}>
        {image && <div aria-hidden="true"><ProductArt image={image} /></div>}
        <div className={styles.info}>
          <h3>{product.title}</h3>
          <p>{product.category}</p>
          <strong>{product.variants.length ? priceRange(product) : "Unavailable"}</strong>
        </div>
      </Link>
    </li>
  );
}
