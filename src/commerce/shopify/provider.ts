import "server-only";
import type { CommerceProvider, Money, Product, ProductVariant } from "../types";
import { createStorefrontClient, type StorefrontConfig } from "./client";
import { CREATE_CART, LIST_PRODUCTS, PRODUCT_BY_HANDLE, PRODUCT_VARIANTS } from "./queries";

interface PageInfo {
  hasNextPage: boolean;
  endCursor: string | null;
}

interface Connection<T> {
  nodes: T[];
  pageInfo: PageInfo;
}

interface ShopifyVariant {
  id: string;
  title: string;
  availableForSale: boolean;
  quantityAvailable: number | null;
  quantityRule: { maximum: number | null };
  selectedOptions: { name: string; value: string }[];
  price: { amount: string; currencyCode: string };
}

interface ShopifyProduct {
  id: string;
  handle: string;
  title: string;
  productType: string;
  description: string;
  store: { value: string } | null;
  specs: { value: string } | null;
  images: { nodes: { url: string; altText: string | null }[] };
  options: { name: string; optionValues: { name: string }[] }[];
  variants: Connection<ShopifyVariant>;
}

interface CartCreateResponse {
  cartCreate: {
    cart: { checkoutUrl: string; totalQuantity: number } | null;
    userErrors: { message: string }[];
    warnings: { code: string; message: string }[];
  } | null;
}

const MAX_GRAPHQL_INT = 2_147_483_647;
const CHECKOUT_UNAVAILABLE = "Shopify checkout is temporarily unavailable. Try again.";
const MERCHANDISE_WARNINGS = new Set([
  "MERCHANDISE_NOT_ENOUGH_STOCK",
  "MERCHANDISE_OUT_OF_STOCK",
  "PRODUCT_UNAVAILABLE_IN_BUYER_LOCATION",
]);

function nextCursor({ hasNextPage, endCursor }: PageInfo, previous: string | null) {
  if (!hasNextPage) return null;
  if (!endCursor || endCursor === previous) throw new Error("Invalid Shopify pagination cursor.");
  return endCursor;
}

function toMoney({ amount, currencyCode }: ShopifyVariant["price"]): Money {
  const decimal = /^(\d+)(?:\.(\d{1,2})0*)?$/.exec(amount);
  if (!decimal) throw new Error(`Shopify price ${amount} ${currencyCode} cannot be represented in cents.`);
  const cents = Number(decimal[1] + (decimal[2] ?? "").padEnd(2, "0"));
  if (!Number.isSafeInteger(cents)) throw new Error("Shopify price exceeds the supported range.");
  return { amount: cents, currencyCode };
}

function isSpec(value: unknown): value is Product["specs"][number] {
  return !!value && typeof value === "object" &&
    "label" in value && typeof value.label === "string" &&
    "value" in value && typeof value.value === "string";
}

function readSpecs(product: ShopifyProduct): Product["specs"] {
  if (!product.specs) return [];
  const specs: unknown = JSON.parse(product.specs.value);
  if (!Array.isArray(specs) || !specs.every(isSpec)) {
    throw new Error(`Shopify product '${product.handle}' has an invalid surfbit.specs metafield.`);
  }
  return specs;
}

function mapProduct(product: ShopifyProduct, variants: ShopifyVariant[]): Product {
  const { id, handle, title, description, productType } = product;
  const store = product.store?.value;
  if (store !== "boards" && store !== "wear" && store !== "gear") {
    throw new Error(`Shopify product '${handle}' needs a surfbit.store metafield (boards, wear, or gear).`);
  }
  if (!variants.length) throw new Error(`Shopify product '${handle}' has no variants.`);

  const [option] = product.options;
  const defaultOption = variants.length === 1 && product.options.length === 1 &&
    option.name === "Title" && option.optionValues.length === 1 &&
    option.optionValues[0].name === "Default Title";

  return {
    id,
    handle,
    title,
    description,
    store,
    category: productType,
    specs: readSpecs(product),
    images: product.images.nodes.map(({ url, altText }) => ({ src: url, alt: altText ?? title })),
    options: defaultOption ? [] : product.options.map(({ name, optionValues }) => ({
      name,
      values: optionValues.map((value) => value.name),
    })),
    variants: variants.map((variant): ProductVariant => {
      const maximum = variant.quantityRule.maximum ?? MAX_GRAPHQL_INT;
      // Shopify can sell untracked or backordered inventory with no positive stock count.
      const stock = variant.quantityAvailable ?? 0;
      return {
        id: variant.id,
        title: variant.title,
        selectedOptions: defaultOption ? {} : Object.fromEntries(
          variant.selectedOptions.map(({ name, value }) => [name, value]),
        ),
        price: toMoney(variant.price),
        quantityAvailable: variant.availableForSale ? Math.min(stock > 0 ? stock : maximum, maximum) : 0,
      };
    }),
  };
}

export function createShopifyProvider(config: StorefrontConfig): CommerceProvider {
  const request = createStorefrontClient(config);

  async function completeProduct(product: ShopifyProduct) {
    const variants = [...product.variants.nodes];
    let after = nextCursor(product.variants.pageInfo, null);
    while (after !== null) {
      const { product: current } = await request<{
        product: { variants: Connection<ShopifyVariant> } | null;
      }>(PRODUCT_VARIANTS, { id: product.id, after });
      if (!current) throw new Error(`Shopify product '${product.handle}' became unavailable.`);
      variants.push(...current.variants.nodes);
      after = nextCursor(current.variants.pageInfo, after);
    }
    return mapProduct(product, variants);
  }

  return {
    async listProducts() {
      const catalog: Product[] = [];
      let after: string | null = null;
      do {
        const { products } = await request<{ products: Connection<ShopifyProduct> }>(LIST_PRODUCTS, { after });
        for (const product of products.nodes) catalog.push(await completeProduct(product));
        after = nextCursor(products.pageInfo, after);
      } while (after !== null);
      return catalog;
    },

    async getProduct(handle) {
      const { product } = await request<{ product: ShopifyProduct | null }>(PRODUCT_BY_HANDLE, { handle });
      return product ? completeProduct(product) : null;
    },

    async createCheckout(lines) {
      if (!lines.length) return { ok: false, error: "Your cart is empty." };
      const quantities = new Map<string, number>();
      let totalQuantity = 0;
      for (const { variantId, quantity } of lines) {
        if (!/^gid:\/\/shopify\/ProductVariant\/\d+$/.test(variantId)) {
          return { ok: false, error: "An item is no longer sold." };
        }
        totalQuantity += quantity;
        if (!Number.isSafeInteger(quantity) || quantity < 1 || totalQuantity > MAX_GRAPHQL_INT) {
          return { ok: false, error: "Invalid quantity." };
        }
        quantities.set(variantId, (quantities.get(variantId) ?? 0) + quantity);
      }
      if (quantities.size > 250) return { ok: false, error: "A cart can hold up to 250 distinct items." };

      try {
        const { cartCreate } = await request<CartCreateResponse>(CREATE_CART, {
          lines: Array.from(quantities, ([merchandiseId, quantity]) => ({ merchandiseId, quantity })),
        });
        const issue = cartCreate?.userErrors[0] ?? cartCreate?.warnings.find(
          ({ code }) => MERCHANDISE_WARNINGS.has(code),
        );
        if (issue) return { ok: false, error: issue.message };

        const cart = cartCreate?.cart;
        if (!cart || new URL(cart.checkoutUrl).protocol !== "https:") {
          return { ok: false, error: CHECKOUT_UNAVAILABLE };
        }
        if (cart.totalQuantity !== totalQuantity) {
          return { ok: false, error: "Some cart quantities changed. Review your cart and try again." };
        }
        return { ok: true, redirectUrl: cart.checkoutUrl };
      } catch {
        return { ok: false, error: CHECKOUT_UNAVAILABLE };
      }
    },
  };
}
