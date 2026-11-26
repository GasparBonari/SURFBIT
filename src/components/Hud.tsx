"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { cartCount, useCart } from "@/state/cart";
import { useSettings } from "@/state/settings";
import { useUI } from "@/state/ui";
import { BrandLogo } from "./BrandLogo";
import { CartButton } from "./CartDrawer";
import styles from "./Hud.module.css";

function subscribeToFullscreen(notify: () => void) {
  document.addEventListener("fullscreenchange", notify);
  return () => document.removeEventListener("fullscreenchange", notify);
}

function getFullscreenState() {
  if (document.fullscreenElement) return "active";
  return document.fullscreenEnabled ? "available" : "unavailable";
}

export function Hud() {
  const location = useUI((state) => state.location.name);
  const count = useCart(cartCount);
  const muted = useSettings((state) => state.muted);
  const fullscreen = useSyncExternalStore(subscribeToFullscreen, getFullscreenState, () => "unavailable");
  const [fullscreenError, setFullscreenError] = useState(false);
  const controlClass = `sb-btn sb-btn--secondary sb-pixel ${styles.control}`;

  useEffect(() => {
    return () => {
      // The storefront has its own controls when navigation leaves the town.
      if (document.fullscreenElement === document.documentElement) {
        void document.exitFullscreen().catch(() => {});
      }
    };
  }, []);

  async function toggleFullscreen() {
    setFullscreenError(false);
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        // Keep application-level overlays, including the cart, in fullscreen.
        await document.documentElement.requestFullscreen();
      }
    } catch {
      setFullscreenError(true);
    }
  }

  return (
    <header className={styles.hud}>
      <div className={`sb-panel sb-pixel ${styles.identity}`}>
        <BrandLogo />
        <span className={styles.location} role="status">
          <span className="sr-only">Location: </span>{location}
        </span>
      </div>

      <div className={styles.controls} role="group" aria-label="Game controls">
        <button
          type="button"
          className={controlClass}
          aria-haspopup="dialog"
          onClick={() => useUI.getState().openPanel("directory")}
        >
          Directory
        </button>
        <CartButton className={styles.control} count={count} />
        <button
          type="button"
          className={controlClass}
          aria-pressed={muted}
          onClick={() => useSettings.getState().set({ muted: !muted })}
        >
          Mute
        </button>
        <button
          type="button"
          className={controlClass}
          aria-label="Settings"
          aria-haspopup="dialog"
          onClick={() => useUI.getState().openPanel("settings")}
        >
          <span className={styles.label}>Settings</span>
          <span className={styles.icon} aria-hidden="true">⚙︎</span>
        </button>
        <button
          type="button"
          className={controlClass}
          aria-label="Fullscreen"
          title="Fullscreen"
          aria-pressed={fullscreen === "active"}
          disabled={fullscreen === "unavailable"}
          onClick={toggleFullscreen}
        >
          <span className={styles.label}>Fullscreen</span>
          <span className={styles.icon} aria-hidden="true">⛶</span>
        </button>
      </div>
      {fullscreenError && (
        <p className={`sb-panel ${styles.status}`} role="status">Couldn’t switch fullscreen mode.</p>
      )}
    </header>
  );
}
