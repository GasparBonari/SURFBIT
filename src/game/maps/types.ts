import type { Dir, Look } from "../art/characters";
import type { PROPS, Tint } from "../art/props";

export type MapKey = "town" | "boards" | "wear" | "gear" | "goods" | "workshop" | "beach-club";

export const DISPLAY_PROPS = [
  "boardDisplay", "boardRack", "finTable", "clothesRack", "hoodieRack", "swimRack", "mannequin",
  "shortsMannequin", "teeTable", "shelf", "pegboard", "wetsuitHanger", "leashHooks", "bagRack", "padTable",
  "capShelf", "shadesStand", "bottleFridge", "packHooks", "towelLadder", "stickerRack",
  "blankRack", "sandingTable", "classBoard",
  "beanShelf", "lessonBoard", "memberBoard",
] as const satisfies readonly (keyof typeof PROPS)[];

export interface MapDef {
  key: MapKey;
  name: string;
  kind: "outdoor" | "interior";
  ambience: "beach" | "shop";
  ground: string[];
  objects: MapObject[];
  spawns: Record<string, Spawn>;
}

export interface Spawn {
  x: number;
  y: number;
  facing: Dir;
}

export interface BuildingStyle {
  roof: "thatch" | "terracotta" | "indigo" | "slate";
  wall: string;
  front?: "surfboards" | "flagship" | "gear" | "shaping" | "apparel" | "cafe" | "cottage";
  shutters?: string;
  awnings?: { window: string; door: string };
}

export type Interaction =
  | { kind: "enter"; target: MapKey; spawn: string }
  | { kind: "exit"; target: MapKey; spawn: string }
  | { kind: "product"; productId: string }
  | { kind: "read"; title: string; text: string[] }
  | { kind: "talk"; name: string; lines: string[] };

export type MapObject =
  | {
      type: "building";
      id: string;
      x: number;
      y: number;
      w: number;
      h: number;
      style: BuildingStyle;
      label: string;
      upcomingStoreName?: string;
      door: { x: number; y: number };
      interact?: Interaction;
    }
  | {
      type: "prop";
      prop: keyof typeof PROPS;
      x: number;
      y: number;
      tint?: Tint;
      interact?: Interaction;
    }
  | {
      type: "display";
      prop: (typeof DISPLAY_PROPS)[number];
      x: number;
      y: number;
      productId: string;
      tint: Tint;
    }
  | {
      type: "npc";
      id: string;
      x: number;
      y: number;
      look: Look;
      behavior: "idle" | "wander";
      name: string;
      lines: string[];
    };
