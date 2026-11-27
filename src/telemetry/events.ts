export const telemetryPages = ["/", "/shop", "/products/[handle]", "/checkout", "/checkout/success", "other"] as const;
export const clientErrorSources = ["window", "unhandled_rejection", "world_load", "world_travel", "checkout_request"] as const;
export const errorTypes = ["Error", "TypeError", "RangeError", "ReferenceError", "SyntaxError", "AbortError", "Other"] as const;

type TelemetryPage = (typeof telemetryPages)[number];
type ErrorType = (typeof errorTypes)[number];
export type ClientErrorSource = (typeof clientErrorSources)[number];

export type TelemetryEvent =
  | { event: "page_view"; page: TelemetryPage }
  | { event: "product_inspect" | "add_to_cart"; product: string }
  | { event: "checkout_start" }
  | { event: "client_error"; page: TelemetryPage; source: ClientErrorSource; errorType: ErrorType };

export function isOneOf<const T extends string>(values: readonly T[], value: unknown): value is T {
  return values.some((candidate) => candidate === value);
}

export function getTelemetryPage(pathname: string): TelemetryPage {
  if (/^\/products\/[^/]+\/?$/.test(pathname)) return "/products/[handle]";
  const path = pathname.replace(/\/$/, "") || "/";
  return isOneOf(telemetryPages, path) ? path : "other";
}

export function getErrorType(error: unknown): ErrorType {
  try {
    if (error instanceof Error || error instanceof DOMException) {
      const { name } = error;
      if (isOneOf(errorTypes, name)) return name;
    }
  } catch {
    // Thrown values may expose getters that throw again when read.
  }
  return "Other";
}
