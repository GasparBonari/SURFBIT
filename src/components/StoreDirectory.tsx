"use client";

import Link from "next/link";
import { useEffect, useRef, type KeyboardEvent } from "react";
import { STORES } from "@/commerce/types";
import { gameEvents } from "@/game/bridge";
import { useUI } from "@/state/ui";
import styles from "./StoreDirectory.module.css";

const stores = Object.entries(STORES);
const actionClass = `sb-btn sb-btn--secondary ${styles.action}`;

export function StoreDirectory() {
  const open = useUI((state) => state.panel === "directory");

  useEffect(() => () => {
    const ui = useUI.getState();
    if (ui.panel === "directory") ui.closeAll();
  }, []);

  return open ? <DirectoryPanel /> : null;
}

function DirectoryPanel() {
  const worldReady = useUI((state) => state.worldReady);
  const upcomingStores = useUI((state) => state.upcomingStores);
  const closeAll = useUI((state) => state.closeAll);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const lastLinkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const previousFocus = document.activeElement;
    dialog.showModal();
    return () => {
      dialog.close();
      const target = document.getElementById("world-canvas") ?? previousFocus;
      if (target instanceof HTMLElement) target.focus({ preventScroll: true });
    };
  }, []);

  function onKeyDown(event: KeyboardEvent<HTMLDialogElement>) {
    if (event.key !== "Tab") return;
    const first = closeRef.current;
    const last = lastLinkRef.current;
    if (event.shiftKey ? event.target === first : event.target === last) {
      event.preventDefault();
      (event.shiftKey ? last : first)?.focus();
    }
  }

  function walkThere(store: string) {
    closeAll();
    gameEvents.emit("travel", { map: "town", spawn: `from-${store}` });
  }

  return (
    <dialog
      ref={dialogRef}
      className={`sb-panel ${styles.directory}`}
      aria-labelledby="directory-title"
      onKeyDown={onKeyDown}
      onCancel={(event) => {
        event.preventDefault();
        closeAll();
      }}
    >
      <div className={styles.header}>
        <h2 id="directory-title" className="sb-pixel">Store directory</h2>
        <button
          ref={closeRef}
          type="button"
          className={actionClass}
          aria-label="Close store directory"
          onClick={closeAll}
        >
          Close
        </button>
      </div>
      <ul className={styles.stores} role="list">
        {stores.map(([id, store], index) => (
          <li key={id} className={styles.store}>
            <h3>{store.name}</h3>
            <div className={styles.actions}>
              <button
                type="button"
                className={actionClass}
                aria-label={`Walk there, ${store.name}`}
                disabled={!worldReady}
                onClick={() => walkThere(id)}
              >
                Walk there
              </button>
              <Link
                ref={index === stores.length - 1 ? lastLinkRef : undefined}
                href={`/shop#${id}`}
                className={actionClass}
                aria-label={`Browse online, ${store.name}`}
                onNavigate={closeAll}
              >
                Browse online
              </Link>
            </div>
          </li>
        ))}
        {upcomingStores.map(({ id, name }) => (
          <li key={id} className={styles.store}>
            <h3>{name}</h3>
            <span className={styles.upcoming}>Coming soon</span>
          </li>
        ))}
      </ul>
    </dialog>
  );
}
