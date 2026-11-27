"use client";

import { useEffect, useRef, type KeyboardEvent } from "react";
import { appearanceOptions, defaultPlayerAppearance, readPlayerAppearance, type PlayerAppearance } from "@/state/playerAppearance";
import { useSettings } from "@/state/settings";
import { useUI } from "@/state/ui";
import styles from "./SettingsPanel.module.css";

const volumeControls = [
  ["musicVolume", "Music volume"],
  ["ambienceVolume", "Ambience volume"],
] as const;

const appearanceControls = [
  ["skin", "Skin tone"],
  ["shirt", "Shirt color"],
  ["headwear", "Headwear"],
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
  const resetRef = useRef<HTMLButtonElement>(null);

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
    const last = resetRef.current;
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
        <fieldset className={styles.appearance}>
          <legend>Appearance</legend>
          <div className={styles.appearanceBody}>
            <div className={styles.preview}>
              <AppearancePreview appearance={settings.appearance} />
            </div>
            <div className={styles.appearanceFields}>
              {appearanceControls.map(([field, label]) => (
                <label key={field}>
                  {label}
                  <select
                    value={settings.appearance[field]}
                    onChange={(event) => settings.set({
                      appearance: readPlayerAppearance({
                        ...settings.appearance,
                        [field]: event.currentTarget.value,
                      }),
                    })}
                  >
                    {Object.entries(appearanceOptions[field]).map(([value, name]) => (
                      <option key={value} value={value}>{name}</option>
                    ))}
                  </select>
                </label>
              ))}
              <button
                ref={resetRef}
                type="button"
                className="sb-btn sb-btn--secondary"
                onClick={() => settings.set({ appearance: defaultPlayerAppearance })}
              >
                Reset appearance
              </button>
            </div>
          </div>
        </fieldset>
      </div>
    </dialog>
  );
}

function AppearancePreview({ appearance }: { appearance: PlayerAppearance }) {
  const previewRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const preview = previewRef.current;
    if (!preview) return;
    let cancelled = false;

    void import("@/game/art/characters").then(({ buildCharacterSheet, playerLook, CHAR_W, CHAR_H }) => {
      if (cancelled) return;
      preview.width = CHAR_W;
      preview.height = CHAR_H;
      // The preview canvas clips the sheet to its front-facing stand frame.
      preview.getContext("2d")?.drawImage(buildCharacterSheet(playerLook(appearance)), 0, 0);
    }).catch((error: unknown) => {
      if (!cancelled) console.warn("Could not draw the player preview", error);
    });

    return () => { cancelled = true; };
  }, [appearance]);

  return <canvas ref={previewRef} aria-hidden="true" />;
}
