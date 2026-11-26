"use client";

import { useEffect, useRef, type KeyboardEvent } from "react";
import { useUI, type Dialog } from "@/state/ui";
import styles from "./DialogBox.module.css";

export function DialogBox() {
  const dialog = useUI((state) => state.dialog);
  return dialog && <DialogPanel dialog={dialog} />;
}

function DialogPanel({ dialog }: { dialog: Dialog }) {
  const ref = useRef<HTMLDialogElement>(null);
  const advanceRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const { advanceDialog, closeAll } = useUI.getState();
  const lastLine = dialog.index === dialog.lines.length - 1;

  useEffect(() => {
    const panel = ref.current;
    if (!panel) return;
    panel.showModal();
    return () => {
      panel.close();
      document.getElementById("world-canvas")?.focus({ preventScroll: true });
    };
  }, []);

  function onKeyDown(event: KeyboardEvent<HTMLDialogElement>) {
    if (event.altKey || event.ctrlKey || event.metaKey || event.nativeEvent.isComposing) return;
    if (event.key === "Tab") {
      const first = advanceRef.current;
      const last = closeRef.current;
      if (event.shiftKey ? event.target === first : event.target === last) {
        event.preventDefault();
        (event.shiftKey ? last : first)?.focus();
      }
      return;
    }
    const interactKey = event.key === "e" || event.key === "E";
    if (!interactKey && event.key !== " " && event.key !== "Enter") return;
    if (!event.repeat && !interactKey && event.target instanceof HTMLButtonElement) return;
    event.preventDefault();
    if (!event.repeat) advanceDialog();
  }

  return (
    <dialog
      ref={ref}
      className={`sb-panel ${styles.dialog}`}
      aria-labelledby="dialog-speaker"
      aria-describedby="dialog-line"
      onKeyDown={onKeyDown}
      onCancel={(event) => {
        event.preventDefault();
        closeAll();
      }}
    >
      <h2 id="dialog-speaker" className={`sb-pixel ${styles.speaker}`}>{dialog.name}</h2>
      <button
        ref={advanceRef}
        type="button"
        className={styles.advance}
        aria-label={lastLine ? "Finish dialog" : "Continue"}
        onClick={advanceDialog}
      >
        <span id="dialog-line" aria-live="polite">{dialog.lines[dialog.index]}</span>
        <span className={styles.indicator} aria-hidden="true">▼</span>
      </button>
      <button ref={closeRef} type="button" className={styles.close} aria-label="Close dialog" onClick={closeAll}>
        ×
      </button>
    </dialog>
  );
}
