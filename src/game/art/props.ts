import { P } from "./palette";
import { type Ctx, px, rect } from "./canvas";
import { autoOutline } from "./characters";
import { INTERIOR_PROPS } from "./interiorProps";
import { drawBoard } from "./motifs";
import { SHOP_DISPLAYS } from "./shopDisplays";
import { TOWN_PROPS } from "./townProps";
import { WORKSHOP_PROPS } from "./workshopProps";

export interface Tint {
  color: string;
  accent: string;
}

export interface PropSpec {
  w: number;
  h: number;
  frames?: number;
  animation?: { frameMs: number; pingPong?: boolean };
  /** Footprint in tiles (placement + collision). Defaults to ceil(w/16) × 1. */
  foot?: { w: number; h: number };
  solid?: boolean;
  /** Drawn under characters (rugs, towels). */
  flat?: boolean;
  /** Mounted on a wall: sorted just above the floor, behind characters. */
  wall?: boolean;
  outline?: boolean;
  draw(ctx: Ctx, ox: number, frame: number, tint: Tint): void;
}

export const PROPS = {
  ...TOWN_PROPS,
  surfRack: {
    w: 32, h: 34, foot: { w: 2, h: 1 }, solid: true,
    draw: (c, ox) => {
      drawBoard(c, ox + 3, 2, 7, 28, P.coral, P.cream);
      drawBoard(c, ox + 12, 0, 7, 30, P.sky, P.coral);
      drawBoard(c, ox + 21, 4, 7, 26, P.sun, P.woodDark);
      rect(c, ox + 1, 22, 30, 3, P.woodDark);
      rect(c, ox + 1, 22, 30, 1, P.woodLight);
      rect(c, ox + 2, 25, 2, 9, P.woodDark); rect(c, ox + 28, 25, 2, 9, P.woodDark);
    },
  },
  ...INTERIOR_PROPS,
  ...SHOP_DISPLAYS,
  ...WORKSHOP_PROPS,
} satisfies Record<string, PropSpec>;

// ------------------------------------------------------------- effects

export function drawMarker(ctx: Ctx) {
  const rows = ["0011100", "0111110", "1111111", "0111110", "0011100", "0001000"];
  rows.forEach((r, y) => [...r].forEach((ch, x) => ch === "1" && px(ctx, x, y, P.cream)));
  autoOutline(ctx, 0, 0, 7, 7, P.outline);
}
