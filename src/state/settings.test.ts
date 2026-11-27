import { afterAll, expect, it, vi } from "vitest";
import { defaultPlayerAppearance } from "./playerAppearance";
import { useSettings } from "./settings";

const storage = vi.hoisted(() => {
  const data = new Map<string, string>();
  vi.stubGlobal("window", {
    localStorage: {
      getItem: (key: string) => data.get(key) ?? null,
      setItem: (key: string, value: string) => data.set(key, value),
      removeItem: (key: string) => data.delete(key),
    },
  });
  return data;
});

const audioAndMotion = { muted: true, musicVolume: 0.32, ambienceVolume: 0.6, reducedMotion: true };

afterAll(() => vi.unstubAllGlobals());

it("restores existing audio and motion settings with the original player appearance", async () => {
  storage.set("surfbit-settings", JSON.stringify({ version: 1, state: audioAndMotion }));
  await useSettings.persist.rehydrate();

  expect(useSettings.getState()).toMatchObject({
    ...audioAndMotion,
    appearance: defaultPlayerAppearance,
    townLighting: "cycle",
  });
});

it("keeps valid saved appearance choices and defaults invalid ones", async () => {
  const appearance = { skin: "deep", shirt: "missing-color", headwear: "__proto__" };
  storage.set("surfbit-settings", JSON.stringify({ version: 1, state: { ...audioAndMotion, appearance } }));
  await useSettings.persist.rehydrate();

  expect(useSettings.getState().appearance).toEqual({ ...defaultPlayerAppearance, skin: "deep" });
});

it.each([["night", "night"], ["invalid", "cycle"]])("restores saved lighting %s as %s", async (saved, expected) => {
  storage.set("surfbit-settings", JSON.stringify({ version: 1, state: { townLighting: saved } }));
  await useSettings.persist.rehydrate();

  expect(useSettings.getState().townLighting).toBe(expected);
});
