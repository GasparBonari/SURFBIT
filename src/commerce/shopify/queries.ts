const VARIANT_FIELDS = `
  nodes {
    id
    title
    availableForSale
    quantityAvailable
    quantityRule { maximum }
    selectedOptions { name value }
    price { amount currencyCode }
  }
  pageInfo { hasNextPage endCursor }
`;

const PRODUCT_FRAGMENT = `
  fragment SurfbitProduct on Product {
    id
    handle
    title
    productType
    description
    store: metafield(namespace: "surfbit", key: "store") { value }
    specs: metafield(namespace: "surfbit", key: "specs") { value }
    images(first: 250) { nodes { url altText } }
    options { name optionValues { name } }
    variants(first: 50) { ${VARIANT_FIELDS} }
  }
`;

export const LIST_PRODUCTS = `
  query SurfbitProducts($after: String) {
    products(first: 25, after: $after) {
      nodes { ...SurfbitProduct }
      pageInfo { hasNextPage endCursor }
    }
  }
  ${PRODUCT_FRAGMENT}
`;

export const PRODUCT_BY_HANDLE = `
  query SurfbitProductByHandle($handle: String!) {
    product(handle: $handle) { ...SurfbitProduct }
  }
  ${PRODUCT_FRAGMENT}
`;

export const PRODUCT_VARIANTS = `
  query SurfbitProductVariants($id: ID!, $after: String!) {
    product(id: $id) {
      variants(first: 250, after: $after) { ${VARIANT_FIELDS} }
    }
  }
`;

export const CREATE_CART = `
  mutation SurfbitCreateCart($lines: [CartLineInput!]!) {
    cartCreate(input: { lines: $lines }) {
      cart { checkoutUrl totalQuantity }
      userErrors { message }
      warnings { code message }
    }
  }
`;
