import { commerce } from "@/commerce";
import type { CheckoutLine } from "@/commerce/types";

function badRequest(error: string) {
  return Response.json({ error }, { status: 400 });
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badRequest("Enter a valid checkout request.");
  }

  if (!body || typeof body !== "object" || !("lines" in body) || !Array.isArray(body.lines)) {
    return badRequest("Expected a list of cart items.");
  }

  const input: unknown[] = body.lines;
  const lines: CheckoutLine[] = [];
  for (const line of input) {
    if (
      !line || typeof line !== "object" || !("variantId" in line) ||
      typeof line.variantId !== "string" || !line.variantId.trim()
    ) {
      return badRequest("Each cart item needs a variant ID.");
    }
    if (
      !("quantity" in line) || typeof line.quantity !== "number" ||
      !Number.isSafeInteger(line.quantity) || line.quantity < 1
    ) {
      return badRequest("Each quantity must be a positive whole number.");
    }

    lines.push({ variantId: line.variantId, quantity: line.quantity });
  }

  const result = await commerce.createCheckout(lines);
  return result.ok ? Response.json({ redirectUrl: result.redirectUrl }) : badRequest(result.error);
}
