"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { trackEvent } from "@/telemetry/client";
import { getTelemetryPage } from "@/telemetry/events";

export function PageAnalytics() {
  const pathname = usePathname();
  const lastPath = useRef<string>(null);

  useEffect(() => {
    if (!pathname || lastPath.current === pathname) return;
    lastPath.current = pathname;
    trackEvent({ event: "page_view", page: getTelemetryPage(pathname) });
  }, [pathname]);

  return null;
}
