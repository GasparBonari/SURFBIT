"use client";

import { create } from "zustand";

/** What the player can currently interact with (drives the "Press E" pill). */
export interface Prompt {
  verb: string;
  label: string;
}

export interface Dialog {
  name: string;
  lines: string[];
  index: number;
}

export type Panel = "cart" | "directory" | "settings" | null;

interface UIState {
  location: { key: string; name: string };
  prompt: Prompt | null;
  /** Handle of the product shown in the product modal. */
  product: string | null;
  dialog: Dialog | null;
  panel: Panel;
  /** Timestamp of the last overlay close; the game uses it to debounce input. */
  lastClosedAt: number;
  worldReady: boolean;

  setLocation(key: string, name: string): void;
  setPrompt(p: Prompt | null): void;
  openProduct(handle: string): void;
  openDialog(name: string, lines: string[]): void;
  advanceDialog(): void;
  openPanel(panel: Panel): void;
  closeAll(): void;
  setWorldReady(ready: boolean): void;
}

export const useUI = create<UIState>()((set, get) => ({
  location: { key: "town", name: "Surfbit Bay" },
  prompt: null,
  product: null,
  dialog: null,
  panel: null,
  lastClosedAt: 0,
  worldReady: false,

  setLocation: (key, name) => set({ location: { key, name } }),
  setPrompt: (prompt) => {
    const cur = get().prompt;
    if (cur?.verb === prompt?.verb && cur?.label === prompt?.label) return;
    set({ prompt });
  },
  openProduct: (handle) => set({ product: handle, dialog: null, panel: null }),
  openDialog: (name, lines) =>
    set({ dialog: { name, lines, index: 0 }, product: null, panel: null }),
  advanceDialog: () => {
    const d = get().dialog;
    if (!d) return;
    if (d.index + 1 >= d.lines.length) {
      set({ dialog: null, lastClosedAt: Date.now() });
    } else {
      set({ dialog: { ...d, index: d.index + 1 } });
    }
  },
  openPanel: (panel) =>
    set((s) => ({
      panel,
      product: null,
      dialog: null,
      lastClosedAt: panel === null ? Date.now() : s.lastClosedAt,
    })),
  closeAll: () =>
    set({ product: null, dialog: null, panel: null, lastClosedAt: Date.now() }),
  setWorldReady: (worldReady) => set({ worldReady }),
}));

export const isOverlayOpen = (s: UIState) =>
  s.product !== null || s.dialog !== null || s.panel !== null;
