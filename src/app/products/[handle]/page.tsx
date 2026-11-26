import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { commerce } from "@/commerce";
import { defaultSelection, findVariant } from "@/commerce/format";
import { STORES } from "@/commerce/types";
import { ProductArt } from "@/components/ProductArt";
import { ProductPurchase } from "@/components/ProductPurchase";
import { SiteHeader } from "@/components/SiteHeader";
import { productPath, siteUrl } from "../../siteUrl";
import styles from "./ProductPage.module.css";

type ProductPageProps = PageProps<"/products/[handle]">;

export const ensureStatic = "navigation";

const getProduct = cache(async (handle: string) => {
  const product = await commerce.getProduct(handle);
  if (!product) notFound();
  return product;
});

export async function generateStaticParams() {
  const products = await commerce.listProducts();
  return products.map(({ handle }) => ({ handle }));
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { handle } = await params;
  const product = await getProduct(handle);

  return {
    title: product.title,
    description: product.description,
    alternates: { canonical: productPath(product.handle) },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { handle } = await params;
  const product = await getProduct(handle);
  const image = product.images[0];
  const variant = product.variants.length ? findVariant(product, defaultSelection(product)) : undefined;
  const url = new URL(productPath(product.handle), siteUrl).href;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description,
    category: product.category,
    brand: { "@type": "Brand", name: "SURFBIT" },
    url,
    image: image?.src ? new URL(image.src, siteUrl).href : undefined,
    offers: variant && {
      "@type": "Offer",
      url,
      price: variant.price.amount / 100,
      priceCurrency: variant.price.currencyCode,
      availability: variant.quantityAvailable > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
  };

  return (
    <>
      <SiteHeader />
      <main className={styles.page}>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
        <Link href={`/shop#${product.store}`} className={styles.store}>{STORES[product.store].name}</Link>
        <article className={`sb-panel ${styles.product}`}>
          {image && <div className={styles.art}><ProductArt image={image} /></div>}
          <div className={styles.details}>
            <h1>{product.title}</h1>
            <p>{product.description}</p>
            <ProductPurchase product={product} />
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
            <Link href="/" prefetch={false} className={`sb-btn sb-btn--secondary ${styles.town}`}>
              See it in the town
            </Link>
          </div>
        </article>
      </main>
    </>
  );
}
