import type { Money, Product, ProductVariant } from "./types";

export function formatMoney(m: Money): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: m.currencyCode,
  }).format(m.amount / 100);
}

export function priceRange(p: Product): string {
  const amounts = p.variants.map((v) => v.price.amount);
  const min = Math.min(...amounts);
  const max = Math.max(...amounts);
  const cur = p.variants[0].price.currencyCode;
  const lo = formatMoney({ amount: min, currencyCode: cur });
  return min === max ? lo : `From ${lo}`;
}

export function findVariant(
  p: Product,
  selected: Record<string, string>,
): ProductVariant | undefined {
  return p.variants.find((v) =>
    Object.entries(v.selectedOptions).every(([k, val]) => selected[k] === val),
  );
}

/** First variant that has stock, else the first variant. */
export function defaultSelection(p: Product): Record<string, string> {
  const v = p.variants.find((x) => x.quantityAvailable > 0) ?? p.variants[0];
  return { ...v.selectedOptions };
}
