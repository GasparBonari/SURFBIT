import town from "./town";
import type { MapDef, MapKey } from "./types";

export const MAPS: Record<MapKey, () => Promise<MapDef>> = {
  town: () => Promise.resolve(town),
  boards: () => import("./boards").then((module) => module.default),
  wear: () => import("./wear").then((module) => module.default),
  gear: () => import("./gear").then((module) => module.default),
};
