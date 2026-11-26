"use client";

import { gameEvents } from "@/game/bridge";
import { useCatalog } from "@/state/catalog";
import { isOverlayOpen, useUI } from "@/state/ui";
import styles from "./InteractPrompt.module.css";

export function InteractPrompt() {
  const prompt = useUI((state) => state.prompt);
  const overlayOpen = useUI(isOverlayOpen);
  const handle = prompt?.verb === "Inspect" ? prompt.label : null;
  const title = useCatalog((state) => handle ? state.products[handle]?.title : undefined);

  if (!prompt || overlayOpen) return null;
  const label = title ?? prompt.label;

  return (
    <div className={`sb-panel sb-pixel ${styles.pill}`}>
      <kbd className={styles.key}>E</kbd>
      <button
        type="button"
        className={`sb-btn sb-btn--secondary ${styles.action}`}
        aria-label={[prompt.verb, label].filter(Boolean).join(" ")}
        onClick={() => gameEvents.emit("interact")}
      >
        A
      </button>
      <span>{label ? `${prompt.verb} · ${label}` : prompt.verb}</span>
    </div>
  );
}
