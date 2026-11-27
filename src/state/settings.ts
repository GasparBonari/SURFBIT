"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { defaultPlayerAppearance, readPlayerAppearance, type PlayerAppearance } from "./playerAppearance";

export type TownLighting = "cycle" | "day" | "night";

export function readTownLighting(value: unknown): TownLighting {
  return value === "day" || value === "night" ? value : "cycle";
}

interface SettingsState {
  muted: boolean;
  musicVolume: number;
  ambienceVolume: number;
  /** null = follow the OS `prefers-reduced-motion` setting. */
  reducedMotion: boolean | null;
  appearance: PlayerAppearance;
  townLighting: TownLighting;
  set(patch: Partial<Omit<SettingsState, "set">>): void;
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      muted: false,
      musicVolume: 0.5,
      ambienceVolume: 0.7,
      reducedMotion: null,
      appearance: defaultPlayerAppearance,
      townLighting: "cycle",
      set: (patch) => set(patch),
    }),
    {
      name: "surfbit-settings",
      version: 1,
      skipHydration: true,
      merge: (persisted, current) => {
        const saved = persisted as Partial<SettingsState> | undefined;
        return {
          ...current,
          ...saved,
          set: current.set,
          appearance: readPlayerAppearance(saved?.appearance),
          townLighting: readTownLighting(saved?.townLighting),
        };
      },
    },
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
