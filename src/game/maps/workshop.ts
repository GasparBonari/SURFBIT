import { WORKSHOP_SHOPKEEPER_LOOK } from "../art/characters";
import { P } from "../art/palette";
import type { MapDef } from "./types";

const def: MapDef = {
  key: "workshop",
  name: "SURFBIT Workshop",
  kind: "interior",
  ambience: "shop",
  ground: [
    "MMMMMMMMMMMMMMMMMMMM",
    "MMMMMMMMMMMMMMMMMMMM",
    "MMMMMMMMMMMMMMMMMMMM",
    "MooooooooooooooooooM",
    "MooooooooooooooooooM",
    "MooooooooooooooooooM",
    "MooooooooooooooooooM",
    "MooooooooooooooooooM",
    "MooooooooooooooooooM",
    "MooooooooooooooooooM",
    "MooooooooooooooooooM",
    "MooooooooooooooooooM",
    "MooooooooooooooooooM",
    "MRRRRRRRRDDRRRRRRRRM",
    "::::::::::::::::::::",
  ],
  objects: [
    { type: "prop", prop: "toolWall", x: 2, y: 1 },
    { type: "prop", prop: "workshopSign", x: 7, y: 1 },
    { type: "prop", prop: "window", x: 15, y: 2 },
    { type: "prop", prop: "vines", x: 17, y: 1 },
    { type: "prop", prop: "pendant", x: 5, y: 1 },
    { type: "prop", prop: "pendant", x: 13, y: 1 },
    { type: "prop", prop: "pendant", x: 18, y: 1 },
    { type: "display", prop: "blankRack", x: 2, y: 4, productId: "foam-blank", tint: { color: P.cream, accent: P.finBrown } },
    {
      type: "prop", prop: "stationPlacard1", x: 4, y: 5,
      interact: {
        kind: "read", title: "1 · The blank",
        text: ["Every board starts as a foam blank with a wooden stringer down the middle. We choose the blank for the length and rocker the board needs."],
      },
    },
    {
      type: "prop", prop: "templateRack", x: 7, y: 4,
      interact: {
        kind: "read", title: "2 · Outline and rocker",
        text: ["Templates trace the outline onto the blank. The planer then sets the rocker, the curve from nose to tail that decides how the board fits the wave."],
      },
    },
    {
      type: "prop", prop: "glassingRack", x: 12, y: 4,
      interact: {
        kind: "read", title: "4 · Glassing",
        text: ["Fiberglass cloth and resin seal the foam: two layers on the deck, one on the bottom for a standard layup."],
      },
    },
    { type: "prop", prop: "counter", x: 15, y: 5 },
    {
      type: "npc", id: "shopkeeper", x: 16, y: 4, look: WORKSHOP_SHOPKEEPER_LOOK, behavior: "idle", name: "Rafa",
      lines: [
        "Welcome to the Workshop. Follow the numbers to see how a board gets made.",
        "Want to shape one yourself? The class board by the door has the next sessions.",
      ],
    },
    { type: "prop", prop: "shapingLight", x: 7, y: 6 },
    { type: "prop", prop: "shapingLight", x: 12, y: 6 },
    {
      type: "prop", prop: "materialsBoard", x: 18, y: 6,
      interact: {
        kind: "read", title: "Foam and resin",
        text: [
          "PU foam with polyester resin: the classic feel, flexible and lively.",
          "EPS foam with epoxy: lighter, floatier and tougher against dings.",
        ],
      },
    },
    { type: "display", prop: "shelf", x: 1, y: 7, productId: "ding-repair-kit", tint: { color: P.sun, accent: P.gearCharcoal } },
    { type: "prop", prop: "foamDust", x: 9, y: 8 },
    {
      type: "prop", prop: "shapingStand", x: 9, y: 7,
      interact: {
        kind: "read", title: "3 · Rails",
        text: ["Rails are the board's edges. Soft rails forgive, hard rails release water and bite. Most of the shaping hours go here."],
      },
    },
    { type: "prop", prop: "workbench", x: 4, y: 9 },
    { type: "display", prop: "sandingTable", x: 14, y: 9, productId: "fin-plug-kit", tint: { color: P.gearCharcoal, accent: P.sun } },
    {
      type: "prop", prop: "stationPlacard5", x: 17, y: 9,
      interact: {
        kind: "read", title: "5 · Sanding and fins",
        text: ["Sanding fairs the glass, then the fin boxes go in. The board cures for a week before its first surf."],
      },
    },
    { type: "display", prop: "bagRack", x: 1, y: 11, productId: "board-sock", tint: { color: P.sky, accent: P.navy } },
    {
      type: "prop", prop: "chalkboard", x: 6, y: 11,
      interact: {
        kind: "read", title: "Custom boards",
        text: ["A custom board starts with your usual waves. More width helps on soft waves, while a narrower outline feels at home in steeper surf."],
      },
    },
    { type: "display", prop: "classBoard", x: 15, y: 11, productId: "shaping-class", tint: { color: P.deepBlue, accent: P.cream } },
    { type: "prop", prop: "crate", x: 17, y: 12 },
    { type: "prop", prop: "crate", x: 18, y: 12 },
    { type: "prop", prop: "hibiscusPot", x: 8, y: 13 },
    { type: "prop", prop: "hibiscusPot", x: 11, y: 13 },
    {
      type: "prop", prop: "waveMat", x: 9, y: 13, tint: { color: P.deepBlue, accent: P.cream },
      interact: { kind: "exit", target: "town", spawn: "from-workshop" },
    },
  ],
  spawns: { door: { x: 9, y: 12, facing: "up" } },
};

export default def;
