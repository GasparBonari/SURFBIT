import { GOODS_SHOPKEEPER_LOOK } from "../art/characters";
import { P } from "../art/palette";
import type { MapDef } from "./types";

const navy = { color: P.navy, accent: P.cream };

const def: MapDef = {
  key: "goods",
  name: "SURFBIT Goods",
  kind: "interior",
  ambience: "shop",
  ground: [
    "MWWWWWWWWWWWWWWWWWWM",
    "MWWWWWWWWWWWWWWWWWWM",
    "MWWWWWWWWWWWWWWWWWWM",
    "M__________________M",
    "M__________________M",
    "M__________________M",
    "M__________________M",
    "M__________________M",
    "M__________________M",
    "M__________________M",
    "M__________________M",
    "M__________________M",
    "M__________________M",
    "MRRRRRRRRDDRRRRRRRRM",
    "::::::::::::::::::::",
  ],
  objects: [
    { type: "prop", prop: "goodsSign", x: 6, y: 1 },
    { type: "prop", prop: "blindsWindow", x: 2, y: 2 },
    { type: "prop", prop: "wallMirror", x: 9, y: 3 },
    { type: "prop", prop: "surfPoster", x: 15, y: 1, tint: { color: P.deepBlue, accent: P.sun } },
    { type: "prop", prop: "vines", x: 17, y: 1 },
    { type: "prop", prop: "pendant", x: 1, y: 1 },
    { type: "prop", prop: "pendant", x: 5, y: 1 },
    { type: "prop", prop: "pendant", x: 12, y: 1 },
    { type: "prop", prop: "pendant", x: 18, y: 1 },
    { type: "display", prop: "capShelf", x: 2, y: 4, productId: "wave-trucker-cap", tint: navy },
    { type: "display", prop: "shadesStand", x: 6, y: 4, productId: "polarized-shades", tint: { color: P.gearCharcoal, accent: P.sky } },
    { type: "display", prop: "bottleFridge", x: 12, y: 4, productId: "steel-bottle", tint: { color: P.productTeal, accent: P.cream } },
    { type: "prop", prop: "counter", x: 15, y: 5 },
    {
      type: "npc", id: "shopkeeper", x: 16, y: 4, look: GOODS_SHOPKEEPER_LOOK, behavior: "idle", name: "Lani",
      lines: ["Hey, welcome to Goods! The wave caps are by the window.", "The sticker rack is by the door if you want to take a little bit of town home."],
    },
    { type: "display", prop: "packHooks", x: 1, y: 7, productId: "day-pack", tint: { color: P.deepBlue, accent: P.sun } },
    { type: "display", prop: "towelLadder", x: 18, y: 7, productId: "stripe-beach-towel", tint: { color: P.coral, accent: P.cream } },
    { type: "prop", prop: "waveRug", x: 6, y: 8, tint: { color: P.sandLight, accent: P.navy } },
    { type: "display", prop: "teeTable", x: 7, y: 7, productId: "logo-tee", tint: { color: P.cream, accent: P.coral } },
    { type: "prop", prop: "roundRug", x: 2, y: 9 },
    { type: "prop", prop: "pouf", x: 2, y: 9 },
    { type: "prop", prop: "pottedPalm", x: 4, y: 10 },
    { type: "display", prop: "stickerRack", x: 13, y: 10, productId: "pixel-sticker-pack", tint: { color: P.cream, accent: P.coral } },
    { type: "prop", prop: "pottedPalm", x: 17, y: 11 },
    { type: "prop", prop: "hibiscusPot", x: 8, y: 13 },
    { type: "prop", prop: "hibiscusPot", x: 11, y: 13 },
    { type: "prop", prop: "waveMat", x: 9, y: 13, tint: navy, interact: { kind: "exit", target: "town", spawn: "from-goods" } },
  ],
  spawns: { door: { x: 9, y: 12, facing: "up" } },
};

export default def;
