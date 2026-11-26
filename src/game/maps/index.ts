import type { MapDef, MapKey } from "./types";

export const MAPS: Partial<Record<MapKey, () => Promise<MapDef>>> = {
  town: () => import("./town").then((module) => module.default),
};
