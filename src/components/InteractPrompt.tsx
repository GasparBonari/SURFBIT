"use client";

import type { PointerEvent } from "react";
import { gameEvents } from "@/game/bridge";
import { useCatalog } from "@/state/catalog";
import { isOverlayOpen, useUI } from "@/state/ui";
import styles from "./InteractPrompt.module.css";

function activateSecondaryTouch(event: PointerEvent<HTMLButtonElement>) {
  // Browsers can omit the click when another finger is holding the joystick.
  if (event.pointerType !== "touch" || event.isPrimary) return;

  const { currentTarget, clientX, clientY } = event;
  if (currentTarget.contains(document.elementFromPoint(clientX, clientY))) {
    gameEvents.emit("interact");
  }
}

export function InteractPrompt() {
  const prompt = useUI((state) => state.prompt);
  const overlayOpen = useUI(isOverlayOpen);
  const handle = prompt?.verb === "Inspect" ? prompt.label : null;
  const title = useCatalog((state) => handle ? state.products[handle]?.title : undefined);

  const activePrompt = overlayOpen ? null : prompt;
  const label = title ?? activePrompt?.label;
  const actionName = activePrompt ? [activePrompt.verb, label].filter(Boolean).join(" ") : "";

  return (
    <>
      <span className="sr-only" role="status">{actionName}</span>
      {activePrompt && (
        <div className={`sb-panel sb-pixel ${styles.pill}`}>
          <kbd className={styles.key} aria-hidden="true">E</kbd>
          <button
            type="button"
            className={`sb-btn sb-btn--secondary ${styles.action}`}
            aria-label={actionName}
            onClick={() => gameEvents.emit("interact")}
            onPointerUp={activateSecondaryTouch}
          >
            A
          </button>
          <span aria-hidden="true">{label ? `${activePrompt.verb} · ${label}` : activePrompt.verb}</span>
        </div>
      )}
    </>
  );
}
