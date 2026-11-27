import { getErrorType, getTelemetryPage, type ClientErrorSource, type TelemetryEvent } from "./events";

export function trackEvent(event: TelemetryEvent) {
  // Keep the request alive across redirects and leave the shopping flow independent of delivery.
  void fetch("/api/telemetry", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(event),
    keepalive: true,
    credentials: "omit",
    referrerPolicy: "no-referrer",
  }).catch(() => {});
}

export function reportClientError(source: ClientErrorSource, error: unknown) {
  trackEvent({
    event: "client_error",
    source,
    page: getTelemetryPage(window.location.pathname),
    errorType: getErrorType(error),
  });
}
