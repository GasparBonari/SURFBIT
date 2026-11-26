export const siteUrl = new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3005");

export function productPath(handle: string): string {
  return `/products/${encodeURIComponent(handle)}`;
}
