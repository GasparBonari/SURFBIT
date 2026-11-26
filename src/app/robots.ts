import type { MetadataRoute } from "next";
import { siteUrl } from "./siteUrl";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/checkout", "/api/"] },
    sitemap: new URL("/sitemap.xml", siteUrl).href,
  };
}
