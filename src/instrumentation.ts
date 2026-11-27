import type { Instrumentation } from "next";
import { getErrorType } from "@/telemetry/events";

export const onRequestError: Instrumentation.onRequestError = (error, _request, context) => {
  const digest = error instanceof Error && "digest" in error && typeof error.digest === "string"
    ? error.digest
    : undefined;

  console.error(JSON.stringify({
    scope: "surfbit",
    event: "server_error",
    route: context.routePath,
    routeType: context.routeType,
    errorType: getErrorType(error),
    digest: digest && /^\d{1,20}$/.test(digest) ? digest : undefined,
  }));
};
