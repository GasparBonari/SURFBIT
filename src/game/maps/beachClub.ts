import { BEACH_CLUB_COACH_LOOK, BEACH_CLUB_HOST_LOOK } from "../art/characters";
import { P } from "../art/palette";
import type { MapDef } from "./types";

const def: MapDef = {
  key: "beach-club",
  name: "SURFBIT Beach Club",
  kind: "interior",
  ambience: "shop",
  ground: [
    "MMMMMMMMMMMMMMMMMMMM",
    "MMMMMMMMMMMMMMMMMMMM",
    "MMMMMMMMMMMMMMMMMMMM",
    "MddddddddddddddddddM",
    "MddddddddddddddddddM",
    "MddddddddddddddddddM",
    "MddddddddddddddddddM",
    "MddddddddddddddddddM",
    "MddddddddddddddddddM",
    "MddddddddddddddddddM",
    "MddddddddddddddddddM",
    "MddddddddddddddddddM",
    "MddddddddddddddddddM",
    "MRRRRRRRRDDRRRRRRRRM",
    "dddddddddddddddddddd",
  ],
  objects: [
    { type: "prop", prop: "sunsetPoster", x: 3, y: 2 },
    { type: "prop", prop: "clubSign", x: 6, y: 2 },
    { type: "prop", prop: "seaWindow", x: 12, y: 2 },
    { type: "prop", prop: "vines", x: 17, y: 2 },
    { type: "prop", prop: "clubStringLights", x: 1, y: 3 },
    { type: "prop", prop: "barCounter", x: 1, y: 5 },
    {
      type: "npc", id: "malia", x: 2, y: 4, look: BEACH_CLUB_HOST_LOOK, behavior: "idle", name: "Malia",
      lines: ["Welcome to the Beach Club. Grab a coffee and make yourself at home.", "Planning to surf? Ben can help you pick a lesson or a rental board."],
    },
    { type: "display", prop: "beanShelf", x: 7, y: 4, productId: "club-coffee-beans", tint: { color: P.finBrown, accent: P.cream } },
    { type: "display", prop: "lessonBoard", x: 12, y: 4, productId: "surf-lesson", tint: { color: P.teal, accent: P.cream } },
    { type: "prop", prop: "wetsuitHanger", x: 17, y: 4, tint: { color: P.teal, accent: P.sky } },
    { type: "prop", prop: "wetsuitHanger", x: 18, y: 4, tint: { color: P.navy, accent: P.sky } },
    {
      type: "npc", id: "ben", x: 16, y: 6, look: BEACH_CLUB_COACH_LOOK, behavior: "idle", name: "Ben",
      lines: ["New to the break? Book a group or private lesson at the whiteboard. We bring the board and wetsuit.", "If you're heading out on your own, the softboard rack is where you rent a board."],
    },
    { type: "prop", prop: "cafeTable", x: 9, y: 6 },
    {
      type: "prop", prop: "guideRack", x: 1, y: 8,
      interact: {
        kind: "read", title: "Surf guide",
        text: [
          "Lineup etiquette: the surfer closest to the peak has the wave. Don't drop in, and paddle wide of anyone riding.",
          "Watch a few sets before you paddle out, and use the channel where waves don't break to get back out.",
        ],
      },
    },
    { type: "prop", prop: "roundRug", x: 4, y: 9 },
    { type: "prop", prop: "wickerChair", x: 4, y: 8 },
    { type: "prop", prop: "pouf", x: 5, y: 9 },
    { type: "prop", prop: "coffeeTable", x: 6, y: 9 },
    { type: "display", prop: "boardRack", x: 15, y: 8, productId: "board-rental", tint: { color: P.sky, accent: P.cream } },
    { type: "display", prop: "memberBoard", x: 18, y: 9, productId: "season-pass", tint: { color: P.sun, accent: P.navy } },
    {
      type: "prop", prop: "storyFrame", x: 2, y: 11,
      interact: {
        kind: "read", title: "Our story",
        text: ["SURFBIT started as a board rack behind a beach shack. Every board, tee and fin we sell is tested in these waves first."],
      },
    },
    {
      type: "prop", prop: "noticeBoard", x: 14, y: 11,
      interact: {
        kind: "read", title: "Tides and events",
        text: [
          "Dawn patrol meets here every Saturday at 6:30.",
          "Beach clean-up on the first Sunday of the month.",
          "Tides are posted on this board every morning.",
        ],
      },
    },
    {
      type: "prop", prop: "dropCrate", x: 17, y: 11,
      interact: {
        kind: "read", title: "Beach day kit",
        text: ["Packing for the beach? Goods has towels and bottles, and Gear has wax and leashes."],
      },
    },
    { type: "prop", prop: "pottedPalm", x: 1, y: 3 },
    { type: "prop", prop: "pottedPalm", x: 12, y: 12 },
    { type: "prop", prop: "hibiscusPot", x: 8, y: 13 },
    { type: "prop", prop: "hibiscusPot", x: 11, y: 13 },
    {
      type: "prop", prop: "waveMat", x: 9, y: 13, tint: { color: P.sky, accent: P.navy },
      interact: { kind: "exit", target: "town", spawn: "from-beach-club" },
    },
  ],
  spawns: { door: { x: 9, y: 12, facing: "up" } },
};

export default def;
