"use client";

import { useEffect, useRef, type KeyboardEvent } from "react";
import { useSettings } from "@/state/settings";
import { useUI } from "@/state/ui";
import styles from "./SettingsPanel.module.css";

const volumeControls = [
  ["musicVolume", "Music volume"],
  ["ambienceVolume", "Ambience volume"],
] as const;

export function SettingsPanel() {
  const open = useUI((state) => state.panel === "settings");

  useEffect(() => () => {
    const ui = useUI.getState();
    if (ui.panel === "settings") ui.closeAll();
  }, []);

  return open ? <SettingsDialog /> : null;
}

function SettingsDialog() {
  const settings = useSettings();
  const closeAll = useUI((state) => state.closeAll);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const motionRef = useRef<HTMLSelectElement>(null);

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
    const last = motionRef.current;
    if (event.shiftKey ? event.target === first : event.target === last) {
      event.preventDefault();
      (event.shiftKey ? last : first)?.focus();
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className={`sb-panel ${styles.panel}`}
      aria-labelledby="settings-title"
      onKeyDown={onKeyDown}
      onCancel={(event) => {
        event.preventDefault();
        closeAll();
      }}
    >
      <div className={styles.header}>
        <h2 id="settings-title" className="sb-pixel">Settings</h2>
        <button
          ref={closeRef}
          type="button"
          className="sb-btn sb-btn--secondary"
          onClick={closeAll}
        >
          Close
        </button>
      </div>
      <div className={styles.controls}>
        <label className={styles.row}>
          Mute
          <input
            type="checkbox"
            checked={settings.muted}
            onChange={(event) => settings.set({ muted: event.currentTarget.checked })}
          />
        </label>
        {volumeControls.map(([key, label]) => {
          const percent = Math.round(settings[key] * 100);
          return (
            <label key={key} className={styles.volume}>
              <span className={styles.volumeLabel}>
                {label}
                <span className={styles.percent} aria-hidden="true">{percent}%</span>
              </span>
              <input
                type="range"
                min={0}
                max={100}
                value={percent}
                aria-valuetext={`${percent}%`}
                onChange={(event) => settings.set({ [key]: event.currentTarget.valueAsNumber / 100 })}
              />
            </label>
          );
        })}
        <label className={styles.row}>
          Reduced motion
          <select
            ref={motionRef}
            value={settings.reducedMotion === null ? "system" : settings.reducedMotion ? "on" : "off"}
            onChange={(event) => {
              const value = event.currentTarget.value;
              settings.set({ reducedMotion: value === "system" ? null : value === "on" });
            }}
          >
            <option value="system">System</option>
            <option value="on">On</option>
            <option value="off">Off</option>
          </select>
        </label>
      </div>
    </dialog>
  );
}
