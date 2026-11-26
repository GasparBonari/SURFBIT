import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createShopifyProvider } from "./provider";
import { CREATE_CART, LIST_PRODUCTS, PRODUCT_BY_HANDLE, PRODUCT_VARIANTS } from "./queries";

vi.mock("server-only", () => ({}));

const shopify = createShopifyProvider({ domain: "surfbit.myshopify.com", token: "test-token" });
const fetchShopify = vi.fn<typeof fetch>();
const variant = {
  id: "gid://shopify/ProductVariant/11",
  title: "5′ 8″",
  availableForSale: true,
  quantityAvailable: 5,
  quantityRule: { maximum: null },
  selectedOptions: [{ name: "Length", value: "5′ 8″" }],
  price: { amount: "429.990", currencyCode: "EUR" },
};
const secondVariant = {
  ...variant,
  id: "gid://shopify/ProductVariant/12",
  title: "6′ 0″",
  availableForSale: false,
  selectedOptions: [{ name: "Length", value: "6′ 0″" }],
};
const photo = "https://cdn.shopify.com/s/files/boards/pixel-fish.png";
const product = {
  id: "gid://shopify/Product/1",
  handle: "pixel-fish",
  title: "Pixel Fish",
  productType: "Surfboard",
  description: "A small-wave fish.",
  store: { value: "boards" },
  specs: { value: '[{"label":"Shape","value":"Fish"}]' },
  images: { nodes: [{ url: photo, altText: null }] },
  options: [{ name: "Length", optionValues: [{ name: "5′ 8″" }, { name: "6′ 0″" }] }],
  variants: page([variant, secondVariant]),
};
const checkoutUrl = "https://surfbit.myshopify.com/checkouts/example?key=cart-key";
const cart = { checkoutUrl, totalQuantity: 3 };

function page<T>(nodes: T[], endCursor: string | null = null) {
  return { nodes, pageInfo: { endCursor, hasNextPage: endCursor !== null } };
}

function shopifyData(data: object) {
  fetchShopify.mockResolvedValueOnce(Response.json({ data }));
}

function requestBody(index: number) {
  const body = fetchShopify.mock.calls[index]?.[1]?.body;
  expect(typeof body).toBe("string");
  return JSON.parse(String(body)) as unknown;
}

beforeEach(() => {
  fetchShopify.mockReset();
  vi.stubGlobal("fetch", fetchShopify);
});

afterEach(() => vi.unstubAllGlobals());

describe("Shopify catalog", () => {
  it("maps product data from each page and loads additional variants", async () => {
    shopifyData({ products: page([{ ...product, variants: page([variant], "variant-cursor") }], "catalog-cursor") });
    shopifyData({ product: { variants: page([secondVariant]) } });
    shopifyData({ products: page([{ ...product, id: "gid://shopify/Product/2", handle: "second-board" }]) });

    const products = await shopify.listProducts();

    expect(products.map(({ handle }) => handle)).toEqual(["pixel-fish", "second-board"]);
    expect(products[0]).toEqual({
      id: product.id,
      handle: product.handle,
      store: "boards",
      title: "Pixel Fish",
      category: "Surfboard",
      description: product.description,
      specs: [{ label: "Shape", value: "Fish" }],
      images: [{ src: photo, alt: "Pixel Fish" }],
      options: [{ name: "Length", values: ["5′ 8″", "6′ 0″"] }],
      variants: [
        {
          id: variant.id, title: "5′ 8″", selectedOptions: { Length: "5′ 8″" },
          price: { amount: 42999, currencyCode: "EUR" }, quantityAvailable: 5,
        },
        {
          id: secondVariant.id, title: "6′ 0″", selectedOptions: { Length: "6′ 0″" },
          price: { amount: 42999, currencyCode: "EUR" }, quantityAvailable: 0,
        },
      ],
    });
    expect(fetchShopify.mock.calls[0]).toEqual([
      "https://surfbit.myshopify.com/api/2026-10/graphql.json",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Shopify-Storefront-Access-Token": "test-token" },
      }),
    ]);
    expect(requestBody(0)).toEqual({ query: LIST_PRODUCTS, variables: { after: null } });
    expect(requestBody(1)).toEqual({ query: PRODUCT_VARIANTS, variables: { id: product.id, after: "variant-cursor" } });
    expect(requestBody(2)).toEqual({ query: LIST_PRODUCTS, variables: { after: "catalog-cursor" } });
  });

  it("maps a single default, untracked variant and returns null for an unknown handle", async () => {
    shopifyData({
      product: {
        ...product,
        specs: null,
        options: [{ name: "Title", optionValues: [{ name: "Default Title" }] }],
        variants: page([{
          ...variant,
          title: "Default Title",
          quantityAvailable: null,
          quantityRule: { maximum: 8 },
          selectedOptions: [{ name: "Title", value: "Default Title" }],
        }]),
      },
    });
    shopifyData({ product: null });

    expect(await shopify.getProduct("pixel-fish")).toMatchObject({
      options: [], specs: [], variants: [{ selectedOptions: {}, quantityAvailable: 8 }],
    });
    expect(requestBody(0)).toEqual({ query: PRODUCT_BY_HANDLE, variables: { handle: "pixel-fish" } });
    expect(await shopify.getProduct("missing")).toBeNull();
  });

  it("surfaces GraphQL errors even when the HTTP request succeeds", async () => {
    fetchShopify.mockResolvedValueOnce(Response.json({ data: { product: null }, errors: [{ message: "Access denied" }] }));
    await expect(shopify.getProduct("pixel-fish")).rejects.toThrow("Shopify Storefront: Access denied");
  });
});

describe("Shopify checkout", () => {
  const line = { variantId: variant.id, quantity: 3 };

  it("sends merged merchandise quantities and preserves the hosted checkout URL", async () => {
    shopifyData({ cartCreate: { cart, userErrors: [], warnings: [] } });
    const pricedLine = { ...line, quantity: 1, price: { amount: 1, currencyCode: "EUR" } };

    expect(await shopify.createCheckout([pricedLine, { ...line, quantity: 2 }]))
      .toEqual({ ok: true, redirectUrl: checkoutUrl });
    expect(requestBody(0)).toEqual({
      query: CREATE_CART,
      variables: { lines: [{ merchandiseId: variant.id, quantity: 3 }] },
    });
  });

  it.each([
    { cart: null, userErrors: [{ message: "Merchandise is unavailable." }], warnings: [] },
    { cart, userErrors: [], warnings: [{ code: "MERCHANDISE_NOT_ENOUGH_STOCK", message: "Only 2 left." }] },
  ])("surfaces Shopify cart errors or merchandise warnings", async (cartCreate) => {
    shopifyData({ cartCreate });
    const issue = cartCreate.userErrors[0] ?? cartCreate.warnings[0];
    expect(await shopify.createCheckout([line])).toEqual({ ok: false, error: issue.message });
  });

  it("rejects a cart that Shopify returned with a lower quantity", async () => {
    shopifyData({ cartCreate: { cart: { ...cart, totalQuantity: 2 }, userErrors: [], warnings: [] } });
    expect(await shopify.createCheckout([line])).toEqual({
      ok: false, error: "Some cart quantities changed. Review your cart and try again.",
    });
  });

  it("rejects unsupported quantities before contacting Shopify", async () => {
    expect(await shopify.createCheckout([line, { ...line, quantity: 2_147_483_647 }]))
      .toEqual({ ok: false, error: "Invalid quantity." });
    expect(fetchShopify).not.toHaveBeenCalled();
  });

  it("returns a shopper-facing error when Shopify is unavailable", async () => {
    fetchShopify.mockResolvedValueOnce(new Response(null, { status: 503 }));
    expect(await shopify.createCheckout([line])).toEqual({
      ok: false, error: "Shopify checkout is temporarily unavailable. Try again.",
    });
  });
});
