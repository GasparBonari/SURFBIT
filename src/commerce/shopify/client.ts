import "server-only";

export interface StorefrontConfig {
  domain: string;
  token: string;
  apiVersion?: string;
}

interface StorefrontResponse<T> {
  data?: T | null;
  errors?: { message: string }[];
}

export function createStorefrontClient({ domain, token, apiVersion = "2026-10" }: StorefrontConfig) {
  if (!/^[a-z\d](?:[a-z\d-]*[a-z\d])?\.myshopify\.com$/i.test(domain)) {
    throw new Error("Expected a Shopify .myshopify.com store domain.");
  }
  if (!token || !/^\d{4}-(01|04|07|10)$/.test(apiVersion)) {
    throw new Error("Expected a Storefront access token and a quarterly API version.");
  }
  const endpoint = `https://${domain}/api/${apiVersion}/graphql.json`;

  return async function request<T>(query: string, variables: Record<string, unknown>): Promise<T> {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": token,
      },
      body: JSON.stringify({ query, variables }),
      redirect: "error",
      cache: "no-store",
    });
    if (!response.ok) throw new Error(`Shopify Storefront returned HTTP ${response.status}.`);

    const result: StorefrontResponse<T> | null = await response.json();
    if (result?.errors?.length) {
      throw new Error(`Shopify Storefront: ${result.errors.map(({ message }) => message).join(" ")}`);
    }
    if (!result?.data) throw new Error("Shopify Storefront returned no data.");
    return result.data;
  };
}
