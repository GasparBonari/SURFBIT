"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SettingsState {
  muted: boolean;
  musicVolume: number;
  ambienceVolume: number;
  /** null = follow the OS `prefers-reduced-motion` setting. */
  reducedMotion: boolean | null;
  set(patch: Partial<Omit<SettingsState, "set">>): void;
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      muted: false,
      musicVolume: 0.5,
      ambienceVolume: 0.7,
      reducedMotion: null,
      set: (patch) => set(patch),
    }),
    { name: "surfbit-settings", version: 1, skipHydration: true },
  ),
);

export function prefersReducedMotion(): boolean {
  const pref = useSettings.getState().reducedMotion;
  if (pref !== null) return pref;
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}
