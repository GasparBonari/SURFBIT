import { commerce } from "@/commerce";
import { clientErrorSources, errorTypes, isOneOf, telemetryPages, type TelemetryEvent } from "@/telemetry/events";

const maxBodyBytes = 1024;

async function readBody(body: ReadableStream<Uint8Array> | null): Promise<unknown> {
  if (!body) return null;
  const reader = body.getReader();
  const buffer = new Uint8Array(maxBodyBytes);
  let length = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) return JSON.parse(new TextDecoder().decode(buffer.subarray(0, length)));
      if (length + value.length > maxBodyBytes) {
        await reader.cancel();
        return null;
      }
      buffer.set(value, length);
      length += value.length;
    }
  } catch {
    return null;
  } finally {
    reader.releaseLock();
  }
}

async function parseEvent(input: unknown): Promise<TelemetryEvent | null> {
  if (!input || typeof input !== "object" || !("event" in input)) return null;

  const { event } = input;
  switch (event) {
    case "page_view":
      return "page" in input && isOneOf(telemetryPages, input.page) ? { event, page: input.page } : null;
    case "product_inspect":
    case "add_to_cart": {
      if (!("product" in input) || typeof input.product !== "string") return null;
      const product = await commerce.getProduct(input.product);
      return product ? { event, product: product.handle } : null;
    }
    case "checkout_start":
      return { event };
    case "client_error":
      if (!("page" in input) || !isOneOf(telemetryPages, input.page) ||
          !("source" in input) || !isOneOf(clientErrorSources, input.source) ||
          !("errorType" in input) || !isOneOf(errorTypes, input.errorType)) return null;
      return { event, page: input.page, source: input.source, errorType: input.errorType };
    default:
      return null;
  }
}

export async function POST(request: Request) {
  const site = request.headers.get("sec-fetch-site");
  if (site && site !== "same-origin") return new Response(null, { status: 403 });
  const contentType = request.headers.get("content-type")?.split(";")[0].trim().toLowerCase();
  if (contentType !== "application/json") return new Response(null, { status: 415 });

  const event = await parseEvent(await readBody(request.body));
  if (!event) return new Response(null, { status: 400 });

  const entry = JSON.stringify({ scope: "surfbit", ...event });
  if (event.event === "client_error") console.error(entry);
  else console.info(entry);
  return new Response(null, { status: 204 });
}
