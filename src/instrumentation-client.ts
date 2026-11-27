import { reportClientError } from "@/telemetry/client";

window.addEventListener("error", (event) => {
  reportClientError("window", event.error);
});

window.addEventListener("unhandledrejection", (event) => {
  reportClientError("unhandled_rejection", event.reason);
});
