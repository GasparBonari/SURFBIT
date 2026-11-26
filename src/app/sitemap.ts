import type { MetadataRoute } from "next";
import { commerce } from "@/commerce";
import { productPath, siteUrl } from "./siteUrl";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await commerce.listProducts();
  return ["/", "/shop", ...products.map(({ handle }) => productPath(handle))].map(
    (path) => ({ url: new URL(path, siteUrl).href }),
  );
}
