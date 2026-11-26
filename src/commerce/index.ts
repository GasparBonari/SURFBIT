import "server-only";
import { mockProvider } from "./mock/provider";
import type { CommerceProvider } from "./types";

/**
 * Server-side entry point for commerce. Add a Shopify Storefront provider
 * (src/commerce/shopify/provider.ts) and select it here via env vars, e.g.
 * SHOPIFY_STORE_DOMAIN + SHOPIFY_STOREFRONT_TOKEN.
 */
export const commerce: CommerceProvider = mockProvider;
