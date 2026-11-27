"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { appearanceOptions, defaultPlayerAppearance, readPlayerAppearance, type PlayerAppearance } from "@/state/playerAppearance";
import { useSettings } from "@/state/settings";
import { useUI } from "@/state/ui";
import styles from "./SettingsPanel.module.css";

const sections = [
  ["audio", "Audio"],
  ["appearance", "Appearance"],
  ["accessibility", "Accessibility"],
] as const;

type Section = (typeof sections)[number][0];

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
  const [section, setSection] = useState<Section>("audio");
  const closeAll = useUI((state) => state.closeAll);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const activeTabRef = useRef<HTMLButtonElement>(null);

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

  useEffect(() => {
    activeTabRef.current?.focus();
  }, [section]);

  function trapFocus(event: KeyboardEvent<HTMLDialogElement>) {
    if (event.key !== "Tab") return;
    const first = closeRef.current;
    const last = event.currentTarget.querySelector<HTMLElement>("[data-last-control]");
    if (event.shiftKey ? event.target === first : event.target === last) {
      event.preventDefault();
      (event.shiftKey ? last : first)?.focus();
    }
  }

  function navigateTabs(event: KeyboardEvent<HTMLDivElement>) {
    const index = sections.findIndex(([id]) => id === section);
    let next: number;
    switch (event.key) {
      case "ArrowLeft": next = (index + sections.length - 1) % sections.length; break;
      case "ArrowRight": next = (index + 1) % sections.length; break;
      case "Home": next = 0; break;
      case "End": next = sections.length - 1; break;
      default: return;
    }

    event.preventDefault();
    const [id] = sections[next];
    setSection(id);
  }

  return (
    <dialog
      ref={dialogRef}
      className={`sb-panel ${styles.panel}`}
      aria-labelledby="settings-title"
      onKeyDown={trapFocus}
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
      <div className={styles.tabs} role="tablist" aria-label="Settings sections" onKeyDown={navigateTabs}>
        {sections.map(([id, label]) => (
          <button
            key={id}
            ref={section === id ? activeTabRef : undefined}
            id={`settings-tab-${id}`}
            type="button"
            role="tab"
            aria-selected={section === id}
            aria-controls={`settings-panel-${id}`}
            tabIndex={section === id ? 0 : -1}
            onClick={() => setSection(id)}
          >
            {label}
          </button>
        ))}
      </div>
      <SettingsTabPanel id="audio" active={section === "audio"}>
        <AudioSettings />
      </SettingsTabPanel>
      <SettingsTabPanel id="appearance" active={section === "appearance"}>
        <AppearanceSettings />
      </SettingsTabPanel>
      <SettingsTabPanel id="accessibility" active={section === "accessibility"}>
        <AccessibilitySettings />
      </SettingsTabPanel>
    </dialog>
  );
}

function SettingsTabPanel({ id, active, children }: { id: Section; active: boolean; children: ReactNode }) {
  return (
    <section
      className={styles.tabPanel}
      id={`settings-panel-${id}`}
      role="tabpanel"
      aria-labelledby={`settings-tab-${id}`}
      hidden={!active}
    >
      {active && <div className={styles.controls}>{children}</div>}
    </section>
  );
}

function AudioSettings() {
  const settings = useSettings();

  return (
    <>
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
              data-last-control={key === "ambienceVolume" ? "" : undefined}
              onChange={(event) => settings.set({ [key]: event.currentTarget.valueAsNumber / 100 })}
            />
          </label>
        );
      })}
    </>
  );
}

function AccessibilitySettings() {
  const { reducedMotion, set } = useSettings();

  return (
    <>
      <label className={styles.row}>
        Reduced motion
        <select
          aria-describedby="settings-motion-help"
          data-last-control
          value={reducedMotion === null ? "system" : reducedMotion ? "on" : "off"}
          onChange={(event) => {
            const value = event.currentTarget.value;
            set({ reducedMotion: value === "system" ? null : value === "on" });
          }}
        >
          <option value="system">System</option>
          <option value="on">On</option>
          <option value="off">Off</option>
        </select>
      </label>
      <p id="settings-motion-help" className={styles.help}>
        Reduce decorative animations and camera fades. System follows your device preference.
      </p>
    </>
  );
}

function AppearanceSettings() {
  const { appearance, set } = useSettings();

  return (
    <div className={styles.appearanceBody}>
      <div className={styles.preview}>
        <AppearancePreview appearance={appearance} />
      </div>
      <div className={styles.appearanceFields}>
        {appearanceControls.map(([field, label]) => (
          <label key={field}>
            {label}
            <select
              value={appearance[field]}
              onChange={(event) => set({
                appearance: readPlayerAppearance({ ...appearance, [field]: event.currentTarget.value }),
              })}
            >
              {Object.entries(appearanceOptions[field]).map(([value, name]) => (
                <option key={value} value={value}>{name}</option>
              ))}
            </select>
          </label>
        ))}
        <button
          type="button"
          className="sb-btn sb-btn--secondary"
          data-last-control
          onClick={() => set({ appearance: defaultPlayerAppearance })}
        >
          Reset appearance
        </button>
      </div>
    </div>
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
